// src/app/api/(site)/home/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { Decimal } from "@prisma/client/runtime/library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Decimal/number/string 등을 number로 안전 변환 */
type Decimalish = number | string | { toString(): string } | null | undefined;
const toNum = (d: Decimalish): number => {
  if (d == null) return 0;
  const n = Number(String(d));
  return Number.isFinite(n) ? n : 0;
};

const errMessage = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === "string" ? e : "Internal error";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ ok: false, code: "UNAUTH" }, { status: 401 });
    }

    // 단일 트랜잭션으로 대시보드에 필요한 모든 데이터 병렬 조회
    const [wallet, userNode, rewardSummary, rewardHistory, userPackages] =
      await prisma.$transaction([
        // 1. 지갑 정보 (없으면 생성)
        prisma.userWallet.upsert({
          where: { userId },
          create: { userId },
          update: {},
          select: {
            balanceUSDT: true,
            balanceQAI: true,
            balanceDFT: true,
          },
        }),
        // 2. 사용자 정보 (추천인 수 등)
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            username: true,
            referralCode: true,
            _count: { select: { referred: true } },
          },
        }),
        // 3. 수당 요약 (누적 수익)
        prisma.userRewardSummary.findUnique({
          where: { userId },
        }),
        // 4. 최근 보상 내역 (최신 5개)
        prisma.userRewardHistory.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            amountDFT: true,
            createdAt: true,
          },
        }),
        // 5. ✅ [핵심] 보유 패키지 조회 (총 스테이킹 원금 계산용)
        prisma.userPackage.findMany({
          where: { userId },
          include: {
            package: { select: { price: true } },
          },
        }),
      ]);

    // --- 데이터 가공 ---

    // 1. 지갑 잔액
    const balances = {
      usdt: toNum(wallet.balanceUSDT),
      qai: toNum(wallet.balanceQAI),
      dft: rewardSummary
        ? toNum(rewardSummary.totalDFT) // 리워드 총합을 보여주거나, 지갑 잔액을 보여줄 수 있음
        : toNum(wallet.balanceDFT),
    };

    // 2. 유저 정보
    const userInfo = {
      username: userNode?.username || "Guest",
      referralCode: userNode?.referralCode || "",
      referralCount: userNode?._count?.referred || 0,
    };

    // 3. 수당 상세 (누적 수익)
    const rs = rewardSummary as any;
    const totalEarned = toNum(rs?.totalDFT); // 총 누적 수령액

    const rewardsBreakdown = {
      staking: toNum(rs?.totalStaking),
      referral: toNum(rs?.totalReferral),
      matching: toNum(rs?.totalMatching),
      rank: toNum(rs?.totalRank),
      center: toNum(rs?.totalCenter),
      total: totalEarned,
    };

    // 4. ✅ 스테이킹 현황 계산 (원금, 한도, 진행률)
    let totalStakedDecimal = new Decimal(0);

    // 보유한 패키지의 (가격 * 수량)을 모두 더함
    for (const up of userPackages) {
      const price = new Decimal(up.package.price.toString());
      const qty = new Decimal(up.quantity);
      totalStakedDecimal = totalStakedDecimal.add(price.mul(qty));
    }
    const totalStaked = totalStakedDecimal.toNumber(); // 총 원금

    // 최대 한도 설정 (예: 원금의 300%)
    const LIMIT_MULTIPLIER = 3.0;
    const maxLimit = totalStaked * LIMIT_MULTIPLIER;

    // 남은 한도 = 최대 한도 - 현재까지 수익
    const remainingLimit = Math.max(0, maxLimit - totalEarned);

    // 진행률 (%) = (현재 수익 / 최대 한도) * 100
    let progressPercent = 0;
    if (maxLimit > 0) {
      progressPercent = (totalEarned / maxLimit) * 100;
      if (progressPercent > 100) progressPercent = 100;
    }

    // 프론트엔드로 보낼 통계 객체
    const stakingStats = {
      totalStaked,
      totalEarned,
      maxLimit,
      remainingLimit,
      progressPercent: Number(progressPercent.toFixed(1)),
    };

    // 5. 최근 내역 포맷팅
    const recentRewards = rewardHistory.map((r) => ({
      id: r.id,
      amount: toNum(r.amountDFT),
      date: r.createdAt.toISOString().split("T")[0],
      status: "Completed",
      name: r.name,
    }));

    return NextResponse.json(
      {
        ok: true,
        authed: true,
        balances,
        userInfo,
        rewardsBreakdown,
        recentRewards,
        stakingStats, // ✅ 추가된 데이터
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    console.error("[GET /api/home] Error:", err);
    return NextResponse.json(
      { ok: false, code: "INTERNAL_ERROR", message: errMessage(err) },
      { status: 500 }
    );
  }
}
