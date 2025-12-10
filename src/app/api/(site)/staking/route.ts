import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { Decimal } from "@prisma/client/runtime/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/staking
 * 패키지 구매를 통한 스테이킹 신청
 */
export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { amount, currency, otpCode } = body;

    // 1. 유효성 검사
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "유효하지 않은 금액입니다." },
        { status: 400 }
      );
    }

    // 2. 해당 금액의 패키지 찾기
    const targetPackage = await prisma.package.findFirst({
      where: {
        price: new Decimal(amount),
      },
    });

    if (!targetPackage) {
      return NextResponse.json(
        { ok: false, message: "해당 금액의 패키지를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    // TODO: OTP 검증 로직 추가 (현재는 생략)

    const totalCost = new Decimal(amount);

    // 3. 트랜잭션 실행 (잔액 차감 + 패키지 기록)
    await prisma.$transaction(async (tx) => {
      // 3-1. 지갑 잔액 확인 및 차감
      const wallet = await tx.userWallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("지갑 정보를 찾을 수 없습니다.");
      }

      const currentBalance = new Decimal(wallet.balanceUSDT ?? 0);
      if (currentBalance.lt(totalCost)) {
        throw new Error("INSUFFICIENT_FUNDS"); // 잔액 부족
      }

      await tx.userWallet.update({
        where: { userId },
        data: {
          balanceUSDT: { decrement: totalCost },
        },
      });

      // 3-2. UserPackage (보유 현황) 업데이트 또는 생성
      await tx.userPackage.upsert({
        where: {
          userId_packageId: {
            userId,
            packageId: targetPackage.id,
          },
        },
        create: {
          userId,
          packageId: targetPackage.id,
          quantity: 1,
        },
        update: {
          quantity: { increment: 1 },
        },
      });

      // 3-3. UserPackageHistory (신청 이력) 생성
      await tx.userPackageHistory.create({
        data: {
          userId,
          packageId: targetPackage.id,
          quantity: 1,
          unitPrice: targetPackage.price,
          totalPrice: totalCost,
          // note: "Staking Request", // 필요한 경우 메모 필드 추가
        },
      });

      // 3-4. 지갑 거래 내역 (Log) 생성
      await tx.walletTx.create({
        data: {
          userId,
          tokenCode: "USDT",
          txType: "WITHDRAW", // 자산이 나감 (스테이킹 구매)
          amount: totalCost,
          status: "COMPLETED",
          memo: `Staking Package: ${targetPackage.name}`,
          // ✅ [수정] direction 필드 삭제 (스키마에 없으므로 에러 발생)
        },
      });
    });

    return NextResponse.json({
      ok: true,
      message: "스테이킹 신청이 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("[POST /api/staking] error:", error);

    if (error.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { ok: false, message: "보유 잔액이 부족합니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
