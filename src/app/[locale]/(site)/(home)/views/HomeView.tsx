// src/app/[locale]/(site)/(home)/views/HomeView.tsx
"use client";

import { Link } from "@/i18n/routing";
import { formatDate } from "../shared/format";
import { Copy, Wallet, Users, Diamond } from "lucide-react";
import { useState, useEffect } from "react";

// Props 타입 정의
export interface HomeViewProps {
  announcementsTop?: {
    id: string;
    title: string;
    publishedAt: string | Date;
  }[];
  balances: {
    usdt: number;
    qai: number;
    dft: number;
  };
  userInfo: {
    username: string;
    referralCode: string;
    referralCount: number;
  };
  rewardsBreakdown: {
    staking: number;
    referral: number;
    matching: number;
    rank: number;
    center: number;
    total: number;
  };
  recentRewards: {
    id: string;
    amount: number;
    date: string;
    status: string;
    name: string;
  }[];
  // ✅ [추가] 백엔드에서 넘어오는 스테이킹 통계 데이터
  stakingStats?: {
    totalStaked: number;
    totalEarned: number;
    maxLimit: number;
    remainingLimit: number;
    progressPercent: number;
  };
}

// 날짜 포맷 어댑터
const formatDateAdapter: (d: string | Date) => string = (d) =>
  formatDate(typeof d === "string" ? d : d.toISOString());

// 숫자 포맷 유틸리티
const fmt = (n: number | undefined | null) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n || 0);

export function HomeView({
  announcementsTop,
  balances,
  userInfo,
  rewardsBreakdown,
  recentRewards,
  stakingStats, // ✅ props 구조 분해
}: HomeViewProps) {
  // 스테이킹 게이지 애니메이션 상태
  const [displayPercent, setDisplayPercent] = useState(0);

  // API에서 받은 실제 퍼센트 (없으면 0)
  const targetPercent = stakingStats?.progressPercent || 0;

  useEffect(() => {
    let current = 0;
    // 0부터 목표 퍼센트까지 부드럽게 증가시키는 애니메이션
    const interval = setInterval(() => {
      if (current >= targetPercent) {
        clearInterval(interval);
        setDisplayPercent(targetPercent);
      } else {
        // 목표치가 높을수록 빨리 증가하도록 스텝 조정
        const step = Math.max(0.5, targetPercent / 50);
        current += step;
        if (current > targetPercent) current = targetPercent;
        setDisplayPercent(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [targetPercent]);

  // 게이지 바 스타일 계산 (최대 100)
  const visualProgress = Math.min(100, Math.max(0, displayPercent));

  // 추천 링크 복사 기능
  const handleCopyLink = () => {
    if (!userInfo?.referralCode) return;
    const link = `https://buyzone.io.kr/join.php?invitation=${userInfo.referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("추천 링크가 복사되었습니다.");
    });
  };

  return (
    <div className="w-full bg-base-200 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        {/* 상단: 환영 문구 */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-base-content leading-tight">
              WELCOME,{" "}
              <span className="text-primary">
                {userInfo?.username || "Guest"}
              </span>
            </h1>
            <p className="text-xl text-base-content/70 mt-2">
              오늘의 자산 현황을 확인하세요.
            </p>
          </div>
        </div>

        {/* 섹션 1: 메인 정보 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* 1-1. 추천 링크 & 총 금액 카드 */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1 lg:col-span-1">
            <div className="card-body p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="badge badge-primary badge-outline badge-lg text-base px-4 py-3">
                  메인 계정
                </span>
                <span className="text-lg text-base-content/60">
                  총 보유 USDT
                </span>
              </div>

              <div className="text-right mb-8">
                <h2 className="text-5xl font-extrabold text-base-content">
                  {fmt(balances?.usdt)}{" "}
                  <span className="text-2xl font-semibold text-base-content/60">
                    USDT
                  </span>
                </h2>
              </div>

              <div className="bg-base-200 p-6 rounded-2xl border border-base-300">
                <p className="text-lg font-bold text-base-content/80 mb-2">
                  추천 링크
                </p>
                <p className="text-base text-base-content/60 truncate mb-4 font-mono">
                  {userInfo?.referralCode
                    ? `https://buyzone.io.kr/join.php?invitation=${userInfo.referralCode}`
                    : "로딩 중..."}
                </p>
                <button
                  onClick={handleCopyLink}
                  className="btn btn-primary btn-md text-lg w-full gap-3"
                >
                  <Copy size={20} /> 링크 복사
                </button>
              </div>
            </div>
          </div>

          {/* 1-2. 스테이킹 현황 (실제 데이터 연동) */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1 lg:col-span-2">
            <div className="card-body p-8 flex-row flex-wrap items-center justify-around gap-8">
              <div className="flex flex-col items-center">
                <h3 className="card-title text-primary text-2xl mb-6">
                  스테이킹 현황
                </h3>

                {/* Radial Progress: API 데이터 기반 */}
                <div
                  className="radial-progress text-primary font-extrabold text-4xl transition-all duration-300 ease-out bg-base-200 border-4 border-base-200"
                  style={
                    {
                      "--value": visualProgress,
                      "--size": "13rem",
                      "--thickness": "1.3rem",
                    } as React.CSSProperties
                  }
                  role="progressbar"
                >
                  {/* 소수점 1자리까지 표시 */}
                  {displayPercent.toFixed(1)}%
                </div>
                <p className="text-sm text-base-content/60 mt-4">수익 달성률</p>
              </div>

              <div className="space-y-8 flex-1 min-w-[240px]">
                {/* 총 스테이킹 (원금) */}
                <div className="flex justify-between items-center border-b border-base-300 pb-3">
                  <span className="text-base-content/60 text-lg">
                    총 스테이킹 (원금)
                  </span>
                  <span className="font-bold text-3xl text-base-content">
                    {fmt(stakingStats?.totalStaked)}
                  </span>
                </div>

                {/* 누적 수령액 */}
                <div className="flex justify-between items-center border-b border-base-300 pb-3">
                  <span className="text-base-content/60 text-lg">
                    누적 수령액 (수익)
                  </span>
                  <span className="font-bold text-3xl text-success">
                    {fmt(stakingStats?.totalEarned)}
                  </span>
                </div>

                {/* 남은 한도 */}
                <div className="flex justify-between items-center bg-base-200 border border-base-300 p-5 rounded-xl">
                  <span className="text-base-content/80 font-semibold text-lg">
                    남은 한도
                  </span>
                  <span className="font-bold text-3xl text-primary">
                    {fmt(stakingStats?.remainingLimit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 섹션 2: 3단 요약 스탯 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="stats shadow-lg bg-base-100 border border-base-300 p-4">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Wallet className="w-12 h-12 opacity-30" />
              </div>
              <div className="stat-title text-lg text-base-content/70">
                출금 가능 금액
              </div>
              <div className="stat-value text-4xl lg:text-5xl text-base-content">
                {fmt(balances?.usdt)}
              </div>
              <div className="stat-desc text-secondary text-lg">USDT</div>
            </div>
          </div>

          <div className="stats shadow-lg bg-base-100 border border-base-300 p-4">
            <div className="stat">
              <div className="stat-figure text-accent">
                <Users className="w-12 h-12 opacity-30" />
              </div>
              <div className="stat-title text-lg text-base-content/70">
                추천인 수
              </div>
              <div className="stat-value text-4xl lg:text-5xl text-base-content">
                {fmt(userInfo?.referralCount)}
              </div>
              <div className="stat-desc text-lg text-base-content/60">
                명 (직추천)
              </div>
            </div>
          </div>

          <div className="stats shadow-lg bg-base-100 border border-base-300 p-4">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Diamond className="w-12 h-12 opacity-30" />
              </div>
              <div className="stat-title text-lg text-base-content/70">
                L / R 점수
              </div>
              <div className="stat-value text-3xl lg:text-4xl text-primary">
                0
              </div>
              <div className="stat-desc text-base-content/60 font-bold mt-2 text-xl">
                / 0
              </div>
            </div>
          </div>
        </div>

        {/* 섹션 3: 수당 차트 & 하단 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-3">
            <div className="card-body p-8">
              <h3 className="card-title text-2xl mb-8 text-base-content">
                수당 현황
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  {
                    label: "스테이킹",
                    val: rewardsBreakdown?.staking,
                    h: "20%",
                  },
                  { label: "추천", val: rewardsBreakdown?.referral, h: "40%" },
                  {
                    label: "추천매칭",
                    val: rewardsBreakdown?.matching,
                    h: "60%",
                  },
                  { label: "직급", val: rewardsBreakdown?.rank, h: "30%" },
                  { label: "센터", val: rewardsBreakdown?.center, h: "10%" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-base-200 border border-base-300 rounded-2xl p-6 flex flex-col items-center justify-end h-64 relative group hover:bg-base-300 transition-colors"
                  >
                    <div className="w-full bg-base-300 rounded-full h-32 w-5 lg:w-10 relative overflow-hidden mb-4 border border-base-content/5">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary group-hover:bg-primary-focus transition-all duration-700"
                        style={{
                          height:
                            (rewardsBreakdown?.total || 0) > 0
                              ? `${
                                  ((item.val || 0) / rewardsBreakdown.total) *
                                  100
                                }%`
                              : "0%",
                          minHeight: (item.val || 0) > 0 ? "5%" : "0",
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-base-content text-lg lg:text-xl">
                      {fmt(item.val)}
                    </span>
                    <span className="text-base text-base-content/60 mt-2">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-2. 최근 보상 내역 */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1 lg:col-span-2">
            <div className="card-body p-8">
              <h3 className="card-title text-2xl mb-6 text-base-content">
                최근 보상 내역
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-lg">
                  <thead>
                    <tr className="text-lg text-base-content/60 border-b-base-300">
                      <th>금액 (DFT)</th>
                      <th>종류</th>
                      <th>날짜</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRewards && recentRewards.length > 0 ? (
                      recentRewards.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-base-200 transition-colors border-b border-base-300"
                        >
                          <td>
                            <div className="font-bold text-xl text-base-content">
                              {fmt(item.amount)}
                            </div>
                          </td>
                          <td className="text-base-content/80 font-medium">
                            {item.name || "Reward"}
                          </td>
                          <td className="text-base-content/60 text-lg">
                            {item.date}
                          </td>
                          <td>
                            <span className="badge badge-success badge-lg text-base text-white px-4 py-3 border-0">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-base-content/50 text-lg"
                        >
                          최근 보상 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3-3. 공지사항 */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1">
            <div className="card-body p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title text-2xl text-base-content">
                  공지사항
                </h3>
                <Link href="/notice" className="btn btn-sm btn-ghost text-lg">
                  더보기
                </Link>
              </div>
              <div className="space-y-4">
                {announcementsTop && announcementsTop.length > 0 ? (
                  announcementsTop.map((notice) => (
                    <Link
                      key={notice.id}
                      href={`/notice?id=${encodeURIComponent(notice.id)}`}
                      className="block p-5 bg-base-200 border border-base-300 rounded-xl cursor-pointer hover:bg-base-300 transition"
                    >
                      <p className="text-lg font-medium truncate text-base-content">
                        {notice.title}
                      </p>
                      <p className="text-base text-base-content/60 mt-2">
                        {formatDateAdapter(notice.publishedAt)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="h-24 flex items-center justify-center text-base-content/40 text-lg border-2 border-dashed border-base-300 rounded-xl">
                    등록된 공지사항이 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
