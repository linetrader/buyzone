// src/app/[locale]/(site)/history/staking/page.tsx
"use client";

import { Coins, Calendar, Filter, Download, ArrowUpRight } from "lucide-react";
// import { useState } from "react";

export default function StakingHistoryPage() {
  // 스테이킹 수익 내역 더미 데이터
  const historyData = [
    {
      id: 1,
      date: "2025-12-07",
      type: "Daily Reward",
      package: "Premium Plan ($10,000)",
      amount: "+ 45.00",
      status: "지급 완료",
    },
    {
      id: 2,
      date: "2025-12-06",
      type: "Daily Reward",
      package: "Premium Plan ($10,000)",
      amount: "+ 45.00",
      status: "지급 완료",
    },
    {
      id: 3,
      date: "2025-12-05",
      type: "Daily Reward",
      package: "Premium Plan ($10,000)",
      amount: "+ 45.00",
      status: "지급 완료",
    },
    {
      id: 4,
      date: "2025-12-04",
      type: "Daily Reward",
      package: "Standard Plan ($3,000)",
      amount: "+ 12.00",
      status: "지급 완료",
    },
    {
      id: 5,
      date: "2025-12-03",
      type: "Daily Reward",
      package: "Standard Plan ($3,000)",
      amount: "+ 12.00",
      status: "지급 완료",
    },
    {
      id: 6,
      date: "2025-12-02",
      type: "Daily Reward",
      package: "Standard Plan ($3,000)",
      amount: "+ 12.00",
      status: "지급 완료",
    },
    {
      id: 7,
      date: "2025-12-01",
      type: "Daily Reward",
      package: "Standard Plan ($3,000)",
      amount: "+ 12.00",
      status: "지급 완료",
    },
    {
      id: 8,
      date: "2025-11-30",
      type: "Bonus",
      package: "Event Bonus",
      amount: "+ 100.00",
      status: "지급 완료",
    },
  ];

  return (
    // 레이아웃 내부 콘텐츠 영역
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Coins size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-base-content">
              스테이킹 수당 내역
            </h1>
          </div>
          <p className="text-base-content/60 text-lg ml-1">
            스테이킹 상품에서 발생한 일일 수익 내역입니다.
          </p>
        </div>

        {/* 상단 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 총 누적 수익 */}
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base-content/60 font-medium mb-1">
                    총 누적 수익
                  </p>
                  <h2 className="text-3xl font-bold text-primary">
                    283.00{" "}
                    <span className="text-sm text-base-content/40">USDT</span>
                  </h2>
                </div>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <ArrowUpRight className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* 이번 달 수익 */}
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base-content/60 font-medium mb-1">
                    이번 달 수익 (12월)
                  </p>
                  <h2 className="text-3xl font-bold text-base-content">
                    183.00{" "}
                    <span className="text-sm text-base-content/40">USDT</span>
                  </h2>
                </div>
                <div className="bg-base-200 p-2 rounded-lg">
                  <Calendar className="text-base-content/60" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 리스트 영역 */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          {/* 필터 및 엑셀 다운로드 헤더 */}
          <div className="p-5 border-b border-base-300 flex flex-col sm:flex-row justify-between items-center gap-4 bg-base-200/30">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="btn btn-sm btn-outline gap-2 bg-base-100 border-base-300 text-base-content hover:bg-base-200 hover:text-base-content hover:border-base-300">
                <Filter size={16} /> 기간 설정
              </button>
              <select className="select select-bordered select-sm bg-base-100 text-base-content border-base-300 focus:outline-none focus:border-primary">
                <option>전체 보기</option>
                <option>최근 7일</option>
                <option>최근 30일</option>
                <option>이번 달</option>
              </select>
            </div>
            <button className="btn btn-sm btn-ghost text-base-content/60 gap-2 hover:text-primary">
              <Download size={16} /> 엑셀 다운로드
            </button>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto min-h-[500px]">
            <table className="table table-lg">
              <thead className="bg-base-200/30">
                <tr className="text-base text-base-content/60 border-b border-base-300">
                  {/* ✅ [수정] w-40 -> w-48로 변경하여 너비 확보 */}
                  <th className="font-normal w-48">지급 일자</th>
                  <th className="font-normal">상품 정보 (출처)</th>
                  <th className="font-normal text-right">수익 금액</th>
                  <th className="font-normal text-center w-32">상태</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0"
                  >
                    {/* ✅ [수정] whitespace-nowrap 추가로 줄바꿈 방지 */}
                    <td className="text-base-content/60 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-base-content/40" />
                        {item.date}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-base-content text-lg">
                        {item.type}
                      </div>
                      <div className="text-sm text-base-content/40 mt-0.5">
                        {item.package}
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="font-bold text-xl text-primary">
                        {item.amount}{" "}
                        <span className="text-xs text-base-content/40">
                          USDT
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-success text-white border-0 px-3 py-3">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="p-6 border-t border-base-300 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm hover:bg-base-200 bg-base-100 border-base-300 text-base-content/60">
                «
              </button>
              <button className="join-item btn btn-sm btn-active bg-primary text-white border-primary hover:bg-primary hover:border-primary">
                1
              </button>
              <button className="join-item btn btn-sm hover:bg-base-200 bg-base-100 border-base-300 text-base-content/60">
                2
              </button>
              <button className="join-item btn btn-sm hover:bg-base-200 bg-base-100 border-base-300 text-base-content/60">
                3
              </button>
              <button className="join-item btn btn-sm hover:bg-base-200 bg-base-100 border-base-300 text-base-content/60">
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
