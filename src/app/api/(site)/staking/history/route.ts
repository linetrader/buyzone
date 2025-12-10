import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/staking/history
 * 사용자의 패키지 구매(스테이킹) 이력 조회
 */
export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? 10);

    // UserPackageHistory 조회 (최신순)
    const historyRows = await prisma.userPackageHistory.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        package: {
          select: {
            name: true,
          },
        },
      },
    });

    // 프론트엔드 포맷에 맞게 변환
    const items = historyRows.map((row) => ({
      id: row.id,
      amount: Number(row.totalPrice), // Decimal -> Number 변환
      currency: "USDT", // 결제 통화 (현재 로직상 USDT)
      status: "COMPLETED", // 패키지 구매 이력이므로 완료 상태로 반환
      createdAt: row.createdAt.toISOString(),
      packageName: row.package.name, // (선택) 패키지명
    }));

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("[GET /api/staking/history] error:", error);
    return NextResponse.json(
      { ok: false, message: "내역을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
