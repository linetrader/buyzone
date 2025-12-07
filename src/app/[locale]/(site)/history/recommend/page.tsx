"use client";

import { UserPlus, Coins, TrendingUp, DollarSign } from 'lucide-react';
import React from 'react';

// 📌 1. 타입 정의 (Interface)

interface RecommendationEntry {
  id: number;
  date: string;
  recommendedUser: string;
  amount: number;
  level: string;
  status: '지급 완료' | '대기 중' | '지급 실패';
}

interface SummaryData {
  totalEarned: number;
  directRecommendations: number;
  thisMonthEarnings: number;
}


// 📌 2. 예시 데이터

const recommendationHistory: RecommendationEntry[] = [
  { 
    id: 101, 
    date: "2025-11-28", 
    recommendedUser: "김철수 (ID: a1234)", 
    amount: 1500, 
    level: "직접 추천",
    status: "지급 완료"
  },
  { 
    id: 102, 
    date: "2025-11-29", 
    recommendedUser: "이영희 (ID: b5678)", 
    amount: 800, 
    level: "2레벨 추천",
    status: "지급 완료"
  },
  { 
    id: 103, 
    date: "2025-12-01", 
    recommendedUser: "박민지 (ID: c9012)", 
    amount: 2500, 
    level: "직접 추천",
    status: "지급 완료"
  },
  { 
    id: 104, 
    date: "2025-12-03", 
    recommendedUser: "최현우 (ID: d3456)", 
    amount: 1200, 
    level: "3레벨 추천",
    status: "대기 중"
  },
];

const summaryData: SummaryData = {
  totalEarned: 6000,
  directRecommendations: 50,
  thisMonthEarnings: 12500,
};

// 📌 3. 메인 컴포넌트

export default function RecommendHistoryPage() {
  
  // 상태에 따른 배지 스타일 결정 함수
  const getStatusBadge = (status: RecommendationEntry['status']): string => {
    switch (status) {
      case '지급 완료':
        return 'badge-success bg-success text-white border-0';
      case '대기 중':
        return 'badge-warning bg-warning text-white border-0';
      case '지급 실패':
        return 'badge-error bg-error text-white border-0';
      default:
        return 'badge-neutral';
    }
  };

  // 금액 표시를 위한 함수 (천단위 구분 기호만)
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('ko-KR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    // 레이아웃 내부 콘텐츠 영역
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
      
        {/* 📌 제목 영역 */}
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-base-content">추천 수당 내역</h1>
        </div>

        {/* 📌 요약 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          
          {/* 총 누적 수당 */}
          <div className="card bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg border-0">
            <div className="card-body p-5 flex flex-row items-center justify-between">
              <div className="flex flex-col">
                  <DollarSign className="w-6 h-6 mb-1" />
                  <p className="text-sm font-semibold opacity-80">총 누적 추천 수당</p>
              </div>
              <h2 className="text-3xl font-bold text-right">
                {formatAmount(summaryData.totalEarned)}
                <span className="text-base font-medium ml-1">KRW</span>
              </h2>
            </div>
          </div>

          {/* 이번 달 수당 */}
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-5 flex flex-row items-center justify-between">
              <div className="flex flex-col">
                  <TrendingUp className="w-6 h-6 text-success mb-1" />
                  <p className="text-sm font-medium text-base-content/60">이번 달 추천 수당</p>
              </div>
              <h2 className="text-3xl font-bold text-base-content text-right">
                {formatAmount(summaryData.thisMonthEarnings)}
                <span className="text-base font-medium ml-1 text-base-content/60">KRW</span>
              </h2>
            </div>
          </div>

          {/* 총 추천 인원 */}
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body p-5 flex flex-row items-center justify-between">
              <div className="flex flex-col">
                  <UserPlus className="w-6 h-6 text-warning mb-1" />
                  <p className="text-sm font-medium text-base-content/60">총 직접 추천 인원</p>
              </div>
              <h2 className="text-3xl font-bold text-base-content text-right">
                {summaryData.directRecommendations.toLocaleString()}
                <span className="text-base font-medium ml-1 text-base-content/60">명</span>
              </h2>
            </div>
          </div>
        </div>
        
        {/* 📌 필터 및 검색 영역 */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 p-4 bg-base-100 rounded-xl shadow-md border border-base-300">
          
          {/* 날짜 선택 섹션 */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-grow max-w-sm">
            <input type="date" className="input input-sm bg-base-100 border border-base-300 rounded-md text-base-content w-full focus:outline-none focus:border-primary" defaultValue="2025-11-01" />
            <span className="text-base-content/40 font-bold">~</span>
            <input type="date" className="input input-sm bg-base-100 border border-base-300 rounded-md text-base-content w-full focus:outline-none focus:border-primary" defaultValue="2025-12-07" />
          </div>
          
          {/* 레벨 선택 및 조회 버튼 섹션 */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select className="select select-bordered select-sm border-base-300 w-full md:w-40 text-sm h-10 bg-base-100 text-base-content focus:outline-none focus:border-primary">
              <option>전체 레벨</option>
              <option>직접 추천 (1레벨)</option>
              <option>2레벨 추천</option>
              <option>3레벨 추천</option>
            </select>
            <button className="btn btn-sm h-10 w-10 p-0 bg-base-100 border border-base-300 hover:bg-base-200 text-base-content/60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 📌 수당 내역 테이블 컨테이너 */}
        <div className="overflow-x-auto bg-base-100 rounded-xl shadow-md border border-base-300">
          <table className="table w-full">
            {/* 테이블 헤더 */}
            <thead className="text-sm font-semibold text-base-content/60 border-b-2 border-base-300 bg-base-200/30">
              <tr>
                <th className="py-3 font-normal">지급일</th>
                <th className="font-normal">추천인 정보</th>
                <th className="font-normal">레벨</th>
                <th className="text-right font-normal">수당 금액 (KRW)</th>
                <th className="text-center font-normal">상태</th>
              </tr>
            </thead>
            
            {/* 테이블 바디 */}
            <tbody>
              {recommendationHistory.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-b-0 text-sm"
                >
                  <td className="text-base-content/60">{item.date}</td>
                  <td>
                    <div className="font-semibold text-base-content">{item.recommendedUser.split(' ')[0]}</div>
                    <div className="text-xs text-base-content/40">({item.recommendedUser.split(' ').slice(1).join(' ')})</div>
                  </td>
                  <td className="text-base-content/60">{item.level}</td>
                  <td className="text-right font-bold text-primary">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="text-center">
                    <div className={`badge ${getStatusBadge(item.status)} font-medium text-xs rounded-full px-3 py-1.5`}>
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 📌 데이터가 없을 경우 */}
        {recommendationHistory.length === 0 && (
          <div className="text-center py-10 bg-base-100 rounded-xl border border-dashed border-base-300 mt-6 shadow-md">
            <Coins className="w-10 h-10 mx-auto text-base-content/30 mb-3" />
            <p className="text-lg text-base-content/50 font-medium">조회된 추천 수당 내역이 없습니다.</p>
          </div>
        )}

        {/* 📌 페이지네이션 */}
        <div className="flex flex-col items-center mt-8">
          <div className="text-sm flex items-center gap-1">
            <button className="text-base-content/40 font-bold p-2 hover:text-base-content/80 transition-colors">«</button>
            <span className="text-primary font-bold px-1 cursor-pointer">1</span>
            <span className="text-base-content/40 px-1 cursor-pointer hover:text-base-content/80 transition-colors">2</span>
            <span className="text-base-content/40 px-1 cursor-pointer hover:text-base-content/80 transition-colors">3</span>
            <button className="text-base-content/40 px-1 cursor-pointer hover:text-base-content/80 transition-colors">»</button>
          </div>
          <div className="mt-3 text-xs text-base-content/40 border-t border-base-300 pt-2 w-full max-w-sm text-center">
            <p>총 4건</p>
          </div>
        </div>

      </div>
    </div>
  );
}