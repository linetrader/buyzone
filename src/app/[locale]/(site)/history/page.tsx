"use client";

import { useState } from "react";
import { ClipboardList, Search, Filter, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";

export default function HistoryPage() {
  // 필터 상태 관리
  const [filterType, setFilterType] = useState("전체"); // 전체, 입금, 출금, 수당, 스테이킹
  
  // 내역 더미 데이터
  const historyData = [
    { id: 1, type: "출금", amount: "-5,000", currency: "USDT", date: "2025-12-01 14:30", status: "Completed", address: "TFj...3Ax" },
    { id: 2, type: "수당", amount: "+200", currency: "USDT", date: "2025-11-28 09:00", status: "Completed", address: "-" },
    { id: 3, type: "입금", amount: "+10,000", currency: "USDT", date: "2025-11-20 11:20", status: "Completed", address: "0x1...9Fc" },
    { id: 4, type: "출금", amount: "-1,000", currency: "USDT", date: "2025-11-15 16:45", status: "Rejected", address: "TFj...3Ax" },
    { id: 5, type: "수당", amount: "+50", currency: "USDT", date: "2025-11-10 09:00", status: "Completed", address: "-" },
    { id: 6, type: "스테이킹", amount: "-2,000", currency: "USDT", date: "2025-11-01 10:00", status: "Processing", address: "-" },
  ];

  // 타입별 아이콘 및 색상 반환
  const getTypeStyle = (type: string) => {
    switch (type) {
      case "입금":
      case "수당":
        return { icon: ArrowDownLeft, color: "text-success", bg: "bg-success/10" };
      case "출금":
      case "스테이킹":
        return { icon: ArrowUpRight, color: "text-error", bg: "bg-error/10" };
      default:
        return { icon: ArrowRightLeft, color: "text-base-content/60", bg: "bg-base-200" };
    }
  };

  // 상태별 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return "badge-success text-white border-none";
      case "Processing": return "badge-warning text-white border-none";
      case "Rejected": return "badge-error text-white border-none";
      default: return "badge-ghost text-base-content/70";
    }
  };

  return (
    // 레이아웃 내부 콘텐츠 영역
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content flex items-center gap-3">
              내역 조회 <ClipboardList className="text-primary" size={32} />
            </h1>
            <p className="text-base-content/60 mt-2 text-lg">자산의 모든 변동 내역을 상세하게 확인하세요.</p>
          </div>
        </div>

        {/* 필터 및 검색 영역 */}
        <div className="card bg-base-100 shadow-lg border border-base-300 mb-6">
          <div className="card-body p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* ✅ 왼쪽: 탭 필터 (수정됨) */}
            {/* 기존 'join' 클래스를 제거하고, 반응형 그리드를 적용하여 모바일에서 깨지지 않게 수정 */}
            <div className="w-full md:w-auto bg-base-200/50 p-1 rounded-lg">
              <div className="grid grid-cols-5 gap-1">
                {["전체", "입금", "출금", "수당", "스테이킹"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`
                      btn btn-sm h-9 min-h-0 border-none shadow-none rounded-md px-0
                      text-[12px] sm:text-sm font-medium transition-all duration-200
                      ${
                        filterType === tab 
                          ? "bg-primary text-white hover:bg-primary/90" 
                          : "bg-transparent text-base-content/60 hover:bg-base-100 hover:text-base-content"
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* 오른쪽: 날짜/검색 필터 */}
            <div className="flex gap-2 w-full md:w-auto">
              <button className="btn btn-sm btn-outline border-base-300 text-base-content hover:bg-base-200 hover:text-base-content gap-2 hidden md:flex">
                <Filter size={16} /> 상세 필터
              </button>
              <div className="relative w-full md:w-60">
                <input 
                  type="text" 
                  placeholder="내용 검색" 
                  className="input input-sm input-bordered w-full pl-9 bg-base-100 text-base-content border-base-300 placeholder:text-base-content/40"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* 내역 리스트 (카드형 테이블) */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="table table-lg">
              {/* 헤더 */}
              <thead className="bg-base-200/50">
                <tr className="text-base text-base-content/70 border-b border-base-300">
                  <th className="font-normal w-24 text-center">유형</th>
                  <th className="font-normal">거래 내용 / 주소</th>
                  <th className="font-normal text-right">변동 금액</th>
                  <th className="font-normal text-center w-32">상태</th>
                  <th className="font-normal text-right w-40">일시</th>
                </tr>
              </thead>
              
              {/* 바디 */}
              <tbody>
                {historyData.map((item) => {
                  const style = getTypeStyle(item.type);
                  return (
                    <tr key={item.id} className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0">
                      {/* 유형 아이콘 */}
                      <td className="text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${style.bg} ${style.color}`}>
                          <style.icon size={20} />
                        </div>
                        <div className="text-xs text-base-content/60 mt-1 font-medium">{item.type}</div>
                      </td>

                      {/* 내용 */}
                      <td>
                        <div className="font-bold text-base-content text-lg">
                          {item.type === "수당" ? "수익 지급" : item.type === "스테이킹" ? "상품 가입" : "외부 지갑 거래"}
                        </div>
                        <div className="text-sm text-base-content/40 font-mono mt-0.5">
                          {item.address !== "-" ? item.address : "System Internal"}
                        </div>
                      </td>

                      {/* 금액 */}
                      <td className="text-right">
                        <div className={`font-bold text-xl ${style.color}`}>
                          {item.amount}
                        </div>
                        <div className="text-xs text-base-content/40">{item.currency}</div>
                      </td>

                      {/* 상태 */}
                      <td className="text-center">
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* 일시 */}
                      <td className="text-right text-base-content/60 text-sm">
                        {item.date.split(" ")[0]} <br/>
                        <span className="text-xs text-base-content/40">{item.date.split(" ")[1]}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 */}
          <div className="p-6 border-t border-base-300 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">«</button>
              <button className="join-item btn btn-sm btn-active bg-primary text-white border-primary hover:bg-primary hover:border-primary">1</button>
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">2</button>
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">3</button>
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">»</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}