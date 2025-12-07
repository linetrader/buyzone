"use client";

import { useState } from "react";
import { GitMerge, Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// 데이터 타입 정의
interface MatchingHistoryItem {
  id: number;
  date: string;
  amount: number;
  content: string;
}

export default function MatchingHistoryPage() {
  // 더미 데이터
  const [historyData] = useState<MatchingHistoryItem[]>([
    { id: 1, date: "2025-12-06", amount: 1, content: "Matching - 8(kwt7734)" },
    { id: 2, date: "2025-12-06", amount: 10, content: "Matching - 9(kbs7734)" },
    { id: 3, date: "2025-12-06", amount: 1, content: "Matching - 9(kbs7734)" },
    { id: 4, date: "2025-12-06", amount: 3, content: "Matching - 7(jdj4828)" },
    { id: 5, date: "2025-12-06", amount: 1, content: "Matching - 10(hb2789)" },
    { id: 6, date: "2025-12-06", amount: 1, content: "Matching - 11(er1219)" },
    { id: 7, date: "2025-12-06", amount: 10, content: "Matching - 8(jjd4484)" },
    { id: 8, date: "2025-12-06", amount: 5, content: "Matching - 8(jjd4484)" },
    { id: 9, date: "2025-12-06", amount: 1, content: "Matching - 8(jjd4484)" },
    { id: 10, date: "2025-12-06", amount: 10, content: "Matching - 9(yji0153)" },
    { id: 11, date: "2025-12-06", amount: 5, content: "Matching - 9(yji0153)" },
  ]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 9;

  return (
    // ✅ 배경: bg-base-200/50, 텍스트: base-content (다크모드 자동 대응)
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10 max-w-[1200px]">
        
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-base-content flex items-center gap-3">
              추천 매칭 내역
            </h1>
            <p className="text-base-content/60 mt-2 text-lg">파트너 활동에 따른 매칭 보너스 내역을 확인하세요.</p>
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="bg-base-100 p-4 rounded-xl shadow-sm border border-base-300 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex items-center gap-2 text-sm text-base-content/70">
              <Calendar size={18} />
              <span>기간 조회: 2025-12-01 ~ 2025-12-07</span>
           </div>
           <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="내용 검색" 
                // ✅ 입력창 스타일: bg-base-200, border-base-300
                className="input input-sm h-10 w-full pl-10 bg-base-200 border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-base-content placeholder:text-base-content/40"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
           </div>
        </div>

        {/* 메인 테이블 카드 */}
        <div className="bg-base-100 shadow-lg rounded-2xl border border-base-300 overflow-hidden">
          
          {/* 테이블 헤더 */}
          <div className="bg-base-200/50 border-b border-base-300 p-4">
            <div className="grid grid-cols-12 gap-4 text-center font-bold text-base-content/80 text-sm md:text-base">
              <div className="col-span-3">날짜</div>
              <div className="col-span-3">금액</div>
              <div className="col-span-6">내용</div>
            </div>
          </div>

          {/* 테이블 바디 */}
          <div className="divide-y divide-base-200">
            {historyData.map((item) => (
              <div 
                key={item.id} 
                className="grid grid-cols-12 gap-4 p-4 text-center hover:bg-base-200/50 transition-colors items-center text-sm md:text-base"
              >
                <div className="col-span-3 text-base-content/70 font-medium">
                  {item.date}
                </div>
                <div className="col-span-3 font-bold text-base-content">
                  {item.amount.toLocaleString()}
                </div>
                <div className="col-span-6 text-base-content/70 text-left pl-4 md:pl-10 truncate">
                  {item.content}
                </div>
              </div>
            ))}
          </div>

          {/* 데이터 없음 처리 */}
          {historyData.length === 0 && (
            <div className="p-12 text-center text-base-content/40 flex flex-col items-center gap-3">
              <GitMerge size={40} className="text-base-content/20" />
              <p>조회된 매칭 내역이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button 
            className="btn btn-outline btn-sm h-10 px-4 rounded-full border-base-300 text-base-content/70 hover:bg-base-200 hover:border-base-400 font-normal gap-1"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} /> 이전
          </button>

          <div className="flex gap-1 mx-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${currentPage === page 
                    ? "bg-[#4F46E5] text-white shadow-md transform scale-105" 
                    : "text-base-content/60 hover:bg-base-200"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-outline btn-sm h-10 px-4 rounded-full border-base-300 text-base-content/70 hover:bg-base-200 hover:border-base-400 font-normal gap-1"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            다음 <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}