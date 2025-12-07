"use client";

import { Megaphone, Search, Calendar, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function NoticePage() {
  // 공지사항 더미 데이터
  const [notices] = useState([
    {
      id: 1,
      title: "시스템 정기 점검 안내 (12/10 00:00 ~ 04:00)",
      date: "2025-12-07",
      category: "점검",
      isNew: true,
    },
    {
      id: 2,
      title: "신규 스테이킹 상품 출시 안내 (Premium Plan)",
      date: "2025-12-05",
      category: "이벤트",
      isNew: true,
    },
    {
      id: 3,
      title: "개인정보 처리방침 변경 안내",
      date: "2025-11-28",
      category: "공지",
      isNew: false,
    },
    {
      id: 4,
      title: "TRC20 입출금 일시 중단 안내",
      date: "2025-11-20",
      category: "긴급",
      isNew: false,
    },
    {
      id: 5,
      title: "11월 수익률 리포트 발행",
      date: "2025-11-01",
      category: "공지",
      isNew: false,
    },
  ]);

  // ✅ 카테고리별 배지 스타일 (다크모드 고려)
  const getBadgeStyle = (category: string) => {
    const baseStyle = "badge badge-md border-0 font-normal px-3";
    switch (category) {
      case "긴급": return `${baseStyle} bg-error/20 text-error`; 
      case "점검": return `${baseStyle} bg-warning/20 text-warning`;
      case "이벤트": return `${baseStyle} bg-primary/20 text-primary`;
      default: return `${baseStyle} bg-base-200 text-base-content/70`;
    }
  };

  return (
    // 헤더/푸터 제거, 배경색과 폰트 설정은 유지 (레이아웃 내부 콘텐츠 영역)
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        
        {/* 페이지 헤더 & 검색창 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content flex items-center gap-3">
              공지사항 <Megaphone className="text-primary" size={32} />
            </h1>
            <p className="text-base-content/60 mt-2 text-lg">BUYZONE의 새로운 소식과 안내사항을 확인하세요.</p>
          </div>

          {/* 검색창 */}
          <div className="w-full md:w-auto flex justify-end">
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="검색어를 입력하세요" 
                className="input bg-base-100 input-bordered w-full pr-12 focus:outline-none focus:border-primary border-base-300 text-base-content placeholder:text-base-content/40" 
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/40" size={20} />
            </div>
          </div>
        </div>

        {/* 공지사항 리스트 카드 */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="table table-lg">
              {/* 테이블 헤더 */}
              <thead className="bg-base-200/50">
                <tr className="text-base text-base-content/70 border-b border-base-300">
                  <th className="w-20 text-center font-normal">번호</th>
                  <th className="w-32 text-left font-normal pl-6">분류</th>
                  <th className="font-normal">제목</th>
                  <th className="w-40 text-center font-normal">작성일</th>
                  <th className="w-20 text-center"></th>
                </tr>
              </thead>
              
              {/* 테이블 바디 */}
              <tbody>
                {notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-base-200/50 transition-colors cursor-pointer group border-b border-base-200 last:border-0">
                    <td className="text-center font-medium text-base-content/50 text-lg">{notice.id}</td>
                    {/* 분류 배지 */}
                    <td className="pl-6">
                      <div className="flex justify-start">
                        <span className={getBadgeStyle(notice.category)}>
                          {notice.category}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 py-2">
                        <span className="font-medium text-base-content text-lg group-hover:text-primary transition-colors">
                          {notice.title}
                        </span>
                        {notice.isNew && (
                          <span className="badge bg-error border-0 text-white text-xs px-1.5 py-0.5 h-auto font-bold rounded-sm">N</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center text-base-content/60">
                      <div className="flex items-center justify-center gap-1 text-base">
                        <Calendar size={16} className="text-base-content/40" />
                        {notice.date}
                      </div>
                    </td>
                    <td className="text-center">
                      <ChevronRight className="text-base-content/30 group-hover:text-primary transition-colors" size={24} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 데이터가 없을 경우 */}
          {notices.length === 0 && (
            <div className="p-10 text-center text-base-content/40">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center items-center gap-6 text-base-content/40 text-lg font-medium">
          <button className="hover:text-base-content/80 transition-colors">«</button>
          <div className="flex items-center gap-4">
            {/* 현재 페이지만 강조 */}
            <button className="text-primary font-bold">1</button>
            <button className="hover:text-base-content/80 transition-colors">2</button>
            <button className="hover:text-base-content/80 transition-colors">3</button>
            <button className="hover:text-base-content/80 transition-colors">4</button>
          </div>
          <button className="hover:text-base-content/80 transition-colors">»</button>
        </div>

      </div>
    </div>
  );
}