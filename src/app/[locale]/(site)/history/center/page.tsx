"use client";

import { Building2, TrendingUp, BarChart3, Search, Calendar } from "lucide-react"; // ✅ ChevronRight 제거
// import { useState } from "react"; // ✅ useState 제거

// 📌 1. 타입 정의
interface CenterBonusEntry {
  id: number;
  date: string;
  centerName: string;
  salesAmount: number; // 센터 매출액
  rate: number; // 지급률
  bonusAmount: number; // 지급 수당
  status: '지급 완료' | '대기 중';
}

// 📌 2. 더미 데이터
const centerBonusHistory: CenterBonusEntry[] = [
  { id: 1, date: "2025-12-01", centerName: "서울 강남 센터", salesAmount: 50000, rate: 5, bonusAmount: 2500, status: "지급 완료" },
  { id: 2, date: "2025-11-01", centerName: "서울 강남 센터", salesAmount: 45000, rate: 5, bonusAmount: 2250, status: "지급 완료" },
  { id: 3, date: "2025-10-01", centerName: "서울 강남 센터", salesAmount: 48000, rate: 5, bonusAmount: 2400, status: "지급 완료" },
  { id: 4, date: "2025-09-01", centerName: "서울 강남 센터", salesAmount: 42000, rate: 5, bonusAmount: 2100, status: "지급 완료" },
];

export default function CenterHistoryPage() {
  // 센터 현황 요약 (더미)
  const centerSummary = {
    totalSales: 250000,
    totalBonus: 12500,
    thisMonthSales: 15000,
    memberCount: 120,
  };

  // 금액 포맷팅
  const formatMoney = (amount: number) => amount.toLocaleString('en-US');

  return (
    // 레이아웃 내부 콘텐츠 영역
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10 max-w-[1200px]">
        
        {/* 📌 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Building2 size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-base-content">
              센터 수당 내역
            </h1>
          </div>
          <p className="text-base-content/60 text-lg ml-1">
            운영 중인 센터의 매출 실적 및 센터장 보너스 내역입니다.
          </p>
        </div>

        {/* 📌 상단 요약 카드 (Dashboard Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* 총 누적 센터 수당 */}
          <div className="card bg-white shadow-lg border border-base-200 lg:col-span-2">
            <div className="card-body flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-gray-500 font-medium mb-1">총 누적 센터 수당</p>
                <h2 className="text-4xl font-bold text-primary">
                  {formatMoney(centerSummary.totalBonus)} <span className="text-base font-normal text-gray-400">USDT</span>
                </h2>
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl">
                <BarChart3 size={32} className="text-primary" />
              </div>
            </div>
          </div>

          {/* 이번 달 매출 */}
          <div className="card bg-white shadow-lg border border-base-200">
            <div className="card-body p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <span className="badge badge-success badge-sm text-white">+12%</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">이번 달 매출 실적</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {formatMoney(centerSummary.thisMonthSales)} <span className="text-xs text-gray-400">USDT</span>
              </h3>
            </div>
          </div>

          {/* 소속 회원 수 */}
          <div className="card bg-white shadow-lg border border-base-200">
            <div className="card-body p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <span className="text-xs text-gray-400">Active</span>
              </div>
              <p className="text-gray-500 text-sm font-medium">센터 소속 회원</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                {centerSummary.memberCount} <span className="text-xs text-gray-400">명</span>
              </h3>
            </div>
          </div>
        </div>
        
        {/* 📌 검색 및 필터 영역 */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 bg-base-100 rounded-xl shadow-md border border-base-300">
          <div className="flex items-center gap-2 w-full md:w-auto flex-grow max-w-md">
            <div className="relative w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
              <input type="date" className="input input-sm bg-base-100 border border-base-300 rounded-md text-base-content w-full pl-9 focus:outline-none focus:border-primary" defaultValue="2025-01-01" />
            </div>
            <span className="text-base-content/40 font-bold">~</span>
            <div className="relative w-full">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
              <input type="date" className="input input-sm bg-base-100 border border-base-300 rounded-md text-base-content w-full pl-9 focus:outline-none focus:border-primary" defaultValue="2025-12-31" />
            </div>
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="센터명 검색" 
              className="input input-sm h-10 bg-base-100 border border-base-300 rounded-md text-base-content w-full pl-9 focus:outline-none focus:border-primary placeholder:text-base-content/40"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
          </div>
        </div>

        {/* 📌 리스트 테이블 */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="table table-lg w-full">
              {/* 헤더 */}
              <thead className="bg-base-200/50">
                <tr className="text-base text-base-content/60 border-b border-base-300">
                  <th className="font-normal w-32 text-center">번호</th>
                  <th className="font-normal w-40">지급 마감일</th>
                  <th className="font-normal">센터명</th>
                  <th className="font-normal text-right">월 매출액</th>
                  <th className="font-normal text-center">지급률</th>
                  <th className="font-normal text-right">수당 금액</th>
                  <th className="font-normal text-center w-32">상태</th>
                </tr>
              </thead>
              
              {/* 바디 */}
              <tbody>
                {centerBonusHistory.length > 0 ? (
                  centerBonusHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0 text-sm">
                      <td className="text-center text-base-content/40">{item.id}</td>
                      <td className="text-base-content/60 font-mono">{item.date}</td>
                      <td>
                        <div className="font-bold text-base-content text-base">{item.centerName}</div>
                      </td>
                      <td className="text-right text-base-content/70">
                        {formatMoney(item.salesAmount)} USDT
                      </td>
                      <td className="text-center font-medium text-base-content">
                        {item.rate}%
                      </td>
                      <td className="text-right">
                        <span className="font-bold text-lg text-primary">
                          +{formatMoney(item.bonusAmount)} <span className="text-xs text-base-content/40 font-normal">USDT</span>
                        </span>
                      </td>
                      <td className="text-center">
                        {item.status === '지급 완료' ? (
                          <span className="badge badge-success text-white border-0 text-xs py-3 px-3">완료</span>
                        ) : (
                          <span className="badge badge-warning text-white border-0 text-xs py-3 px-3">대기</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="h-40 text-center text-base-content/40">
                      센터 수당 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="p-6 border-t border-base-300 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm hover:bg-base-200 bg-base-100 border-base-300 text-base-content/60">«</button>
              <button className="join-item btn btn-sm btn-active bg-primary text-white border-primary hover:bg-primary hover:border-primary">1</button>
              <button className="join-item btn btn-sm hover:bg-base-200 bg-base-100 border-base-300 text-base-content/60">»</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}