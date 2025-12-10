"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  Filter,
  Search,
  TrendingUp,
  Trophy,
} from "lucide-react";

// --- [타입 정의] ---
interface RankHistoryItem {
  id: string;
  rankName: string; // 달성 직급 (예: Silver, Gold...)
  amount: number; // 수당 금액
  currency: string; // 통화 (USDT)
  status: "COMPLETED" | "PENDING" | "FAILED";
  date: string; // 지급일
}

// --- [더미 데이터 생성기] ---
const MOCK_DATA: RankHistoryItem[] = [
  {
    id: "R-10234",
    rankName: "Diamond",
    amount: 5000,
    currency: "USDT",
    status: "COMPLETED",
    date: "2025-10-01 14:30",
  },
  {
    id: "R-10233",
    rankName: "Platinum",
    amount: 3000,
    currency: "USDT",
    status: "COMPLETED",
    date: "2025-08-15 09:12",
  },
  {
    id: "R-10232",
    rankName: "Gold",
    amount: 1000,
    currency: "USDT",
    status: "COMPLETED",
    date: "2025-06-20 11:45",
  },
  {
    id: "R-10231",
    rankName: "Silver",
    amount: 500,
    currency: "USDT",
    status: "COMPLETED",
    date: "2025-04-10 16:20",
  },
  {
    id: "R-10230",
    rankName: "Bronze",
    amount: 100,
    currency: "USDT",
    status: "COMPLETED",
    date: "2025-02-01 10:00",
  },
];

export default function RankHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<RankHistoryItem[]>([]);
  const [filter, setFilter] = useState("ALL");

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(MOCK_DATA);
      setLoading(false);
    }, 800); // 0.8초 딜레이
    return () => clearTimeout(timer);
  }, []);

  // 총 수당 계산
  const totalEarned = history.reduce((acc, curr) => acc + curr.amount, 0);
  // 현재 최고 직급 (가장 최근 데이터 기준)
  const currentRank = history.length > 0 ? history[0].rankName : "None";

  // 금액 포맷터
  const fmtNum = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);

  return (
    <div className="w-full min-h-screen bg-base-200/50 font-sans pb-20">
      {/* --- [상단 헤더 영역] --- */}
      <div className="bg-base-100 border-b border-base-200 pt-10 pb-8 px-4 lg:px-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content flex items-center gap-3">
                <Award className="text-primary" size={36} />
                직급 수당 내역
              </h1>
              <p className="text-base-content/60 mt-2 text-lg">
                회원님이 달성한 직급과 보상 내역을 확인하세요.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-outline gap-2">
                <Download size={18} /> 엑셀 다운로드
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-10 py-8 space-y-8">
        {/* --- [1. 요약 통계 카드] --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 카드 1: 총 수령액 */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body flex flex-row items-center justify-between">
              <div>
                <p className="text-base-content/60 font-medium mb-1">
                  총 누적 수당
                </p>
                <h2 className="text-3xl font-extrabold text-primary">
                  {loading ? (
                    <span className="loading loading-dots loading-md"></span>
                  ) : (
                    `$${fmtNum(totalEarned)}`
                  )}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Coins size={24} />
              </div>
            </div>
          </div>

          {/* 카드 2: 현재 직급 */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body flex flex-row items-center justify-between">
              <div>
                <p className="text-base-content/60 font-medium mb-1">
                  현재 달성 직급
                </p>
                <h2 className="text-3xl font-extrabold text-secondary">
                  {loading ? (
                    <span className="loading loading-dots loading-md"></span>
                  ) : (
                    currentRank
                  )}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Trophy size={24} />
              </div>
            </div>
          </div>

          {/* 카드 3: 달성 횟수 */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body flex flex-row items-center justify-between">
              <div>
                <p className="text-base-content/60 font-medium mb-1">
                  보상 수령 횟수
                </p>
                <h2 className="text-3xl font-extrabold text-accent">
                  {loading ? (
                    <span className="loading loading-dots loading-md"></span>
                  ) : (
                    `${history.length}회`
                  )}
                </h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* --- [2. 필터 및 검색] --- */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-base-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost border-base-300 gap-2"
              >
                <Filter size={16} />
                {filter === "ALL" ? "전체 기간" : filter}
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200"
              >
                <li>
                  <a onClick={() => setFilter("ALL")}>전체 기간</a>
                </li>
                <li>
                  <a onClick={() => setFilter("1개월")}>최근 1개월</a>
                </li>
                <li>
                  <a onClick={() => setFilter("3개월")}>최근 3개월</a>
                </li>
              </ul>
            </div>
            <div className="h-8 w-[1px] bg-base-300 mx-2"></div>
            <span className="text-sm text-base-content/60">
              총{" "}
              <span className="font-bold text-base-content">
                {history.length}
              </span>
              건
            </span>
          </div>

          <label className="input input-bordered flex items-center gap-2 w-full sm:max-w-xs h-10">
            <input type="text" className="grow" placeholder="직급명 검색" />
            <Search size={16} className="opacity-50" />
          </label>
        </div>

        {/* --- [3. 데이터 테이블] --- */}
        <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-lg w-full">
              <thead className="bg-base-200/50 text-base-content/70">
                <tr>
                  <th>지급일시</th>
                  <th>달성 직급</th>
                  <th className="text-right">수당 금액</th>
                  <th className="text-center">상태</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // 로딩 스켈레톤
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td>
                        <div className="h-4 bg-base-300 rounded w-32"></div>
                      </td>
                      <td>
                        <div className="h-4 bg-base-300 rounded w-20"></div>
                      </td>
                      <td className="text-right">
                        <div className="h-4 bg-base-300 rounded w-24 ml-auto"></div>
                      </td>
                      <td className="flex justify-center">
                        <div className="h-6 bg-base-300 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : history.length > 0 ? (
                  history.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-base-200/50 transition-colors cursor-default"
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar
                            size={16}
                            className="text-base-content/40"
                          />
                          <span className="font-mono text-base">
                            {item.date}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Award size={16} className="text-primary" />
                          </div>
                          <span className="font-bold text-lg">
                            {item.rankName}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-lg text-primary">
                          +{fmtNum(item.amount)}
                        </span>
                        <span className="text-xs text-base-content/50 ml-1">
                          {item.currency}
                        </span>
                      </td>
                      <td className="text-center">
                        {item.status === "COMPLETED" ? (
                          <span className="badge badge-success badge-soft gap-1 pl-1 pr-2 font-bold">
                            지급 완료
                          </span>
                        ) : (
                          <span className="badge badge-warning gap-1">
                            처리 중
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  // 데이터 없음
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center text-base-content/40">
                        <Award size={48} className="mb-4 opacity-20" />
                        <p className="text-lg">
                          조회된 직급 수당 내역이 없습니다.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 (UI만 구현) */}
          <div className="p-4 border-t border-base-200 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm btn-disabled">
                <ChevronLeft size={16} />
              </button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
