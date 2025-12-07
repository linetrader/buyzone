"use client";

import { Link } from "@/i18n/routing";
import { formatDate } from "../shared/format";
import type { UseHomeDataReturn } from "../hooks/useHomeData";
import { Copy, Wallet, Users, Diamond } from "lucide-react";
import { useState, useEffect } from "react";
// import { useTranslations } from "next-intl"; // ❌ [수정] 사용되지 않아 제거됨 (경고 해결)

// 기존 Props 타입 유지
export type HomeViewProps = UseHomeDataReturn;

// 날짜 포맷 어댑터
const formatDateAdapter: (d: string | Date) => string = (d) =>
  formatDate(typeof d === "string" ? d : d.toISOString());

export function HomeView({
  announcementsTop, 
}: HomeViewProps) {
  // 스테이킹 게이지 상태 관리
  const [stakingValue, setStakingValue] = useState(0);
  
  // 설정값
  const targetPercent = 141; // 실제 달성 퍼센트
  const maxPercent = 200;    // 게이지 만점 기준

  useEffect(() => {
    // 페이지 로드 시 게이지 숫자 애니메이션
    let currentValue = 0;
    const interval = setInterval(() => {
      if (currentValue >= targetPercent) {
        clearInterval(interval);
        setStakingValue(targetPercent);
      } else {
        currentValue += 2; // 숫자 증가 속도
        setStakingValue(currentValue > targetPercent ? targetPercent : currentValue);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  // 실제 게이지가 채워질 비율 계산
  const visualProgress = (stakingValue / maxPercent) * 100;

  return (
    // 배경색을 base-200으로 설정하여 카드(base-100)와 대비를 줌
    <div className="w-full bg-base-200 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        
        {/* 상단: 환영 문구 */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-base-content leading-tight">
              WELCOME, <span className="text-primary">buyzone</span>
            </h1>
            <p className="text-xl text-base-content/70 mt-2">오늘의 자산 현황을 확인하세요.</p>
          </div>
        </div>

        {/* 섹션 1: 메인 정보 카드 (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* 1-1. 추천 링크 & 총 금액 카드 */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1 lg:col-span-1">
            <div className="card-body p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="badge badge-primary badge-outline badge-lg text-base px-4 py-3">메인 계정</span>
                <span className="text-lg text-base-content/60">총 금액</span>
              </div>
              
              <div className="text-right mb-8">
                <h2 className="text-5xl font-extrabold text-base-content">10,000 <span className="text-2xl font-semibold text-base-content/60">USDT</span></h2>
              </div>

              <div className="bg-base-200 p-6 rounded-2xl border border-base-300">
                <p className="text-lg font-bold text-base-content/80 mb-2">추천 링크</p>
                <p className="text-base text-base-content/60 truncate mb-4">https://buyzone.io.kr/join.php?invitation=buyzone</p>
                <button className="btn btn-primary btn-md text-lg w-full gap-3">
                  <Copy size={20} /> 링크 복사
                </button>
              </div>
            </div>
          </div>

          {/* 1-2. 스테이킹 현황 */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1 lg:col-span-2">
            <div className="card-body p-8 flex-row flex-wrap items-center justify-around gap-8">
              <div className="flex flex-col items-center">
                <h3 className="card-title text-primary text-2xl mb-6">스테이킹</h3>
                
                {/* Radial Progress: 100:24 에러 해결 */}
                <div 
                  className="radial-progress text-primary font-extrabold text-4xl transition-all duration-1000 ease-out bg-base-200 border-4 border-base-200" 
                  // ✅ [수정] style 속성 타입 명시 (React.CSSProperties는 CSS 변수를 허용하지 않지만, as React.CSSProperties로 any 경고 제거)
                  style={{ 
                    "--value": visualProgress, 
                    "--size": "13rem", 
                    "--thickness": "1.3rem" 
                  } as React.CSSProperties}
                  role="progressbar"
                >
                  {stakingValue}%
                </div>
              </div>

              <div className="space-y-8 flex-1 min-w-[240px]">
                {/* 구분선 색상을 base-300으로 진하게 변경 */}
                <div className="flex justify-between items-center border-b border-base-300 pb-3">
                  <span className="text-base-content/60 text-lg">총 스테이킹</span>
                  <span className="font-bold text-3xl text-base-content">20,000</span>
                </div>
                <div className="flex justify-between items-center border-b border-base-300 pb-3">
                  <span className="text-base-content/60 text-lg">수령한 스테이킹</span>
                  <span className="font-bold text-3xl text-success">14,143</span>
                </div>
                <div className="flex justify-between items-center bg-base-200 border border-base-300 p-5 rounded-xl">
                  <span className="text-base-content/80 font-semibold text-lg">남은 스테이킹</span>
                  <span className="font-bold text-3xl text-base-content">5,857</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 섹션 2: 3단 요약 스탯 (Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="stats shadow-lg bg-base-100 border border-base-300 p-4">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Wallet className="w-12 h-12 opacity-30" />
              </div>
              <div className="stat-title text-lg text-base-content/70">출금 가능 금액</div>
              <div className="stat-value text-4xl lg:text-5xl text-base-content">14,143.00</div>
              <div className="stat-desc text-secondary text-lg">USDT</div>
            </div>
          </div>
          
          <div className="stats shadow-lg bg-base-100 border border-base-300 p-4">
            <div className="stat">
              <div className="stat-figure text-accent">
                <Users className="w-12 h-12 opacity-30" />
              </div>
              <div className="stat-title text-lg text-base-content/70">추천인 수</div>
              <div className="stat-value text-4xl lg:text-5xl text-base-content">3</div>
              <div className="stat-desc text-lg text-base-content/60">명</div>
            </div>
          </div>

          <div className="stats shadow-lg bg-base-100 border border-base-300 p-4">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Diamond className="w-12 h-12 opacity-30" />
              </div>
              <div className="stat-title text-lg text-base-content/70">L / R 점수</div>
              <div className="stat-value text-3xl lg:text-4xl text-primary">591,300</div>
              <div className="stat-desc text-base-content/60 font-bold mt-2 text-xl">/ 52,700</div>
            </div>
          </div>
        </div>

        {/* 섹션 3: 수당 차트 & 하단 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 3-1. 수당 (차트 형태 시각화) */}
          <div className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-3">
            <div className="card-body p-8">
              <h3 className="card-title text-2xl mb-8 text-base-content">수당 현황</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { label: "스테이킹", val: "0.0000", h: "10%" },
                  { label: "추천", val: "2,200.0000", h: "40%" },
                  { label: "추천매칭", val: "6,438.0000", h: "80%" },
                  { label: "직급", val: "5,505.0000", h: "60%" },
                  { label: "센터", val: "0.0000", h: "10%" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-base-200 border border-base-300 rounded-2xl p-6 flex flex-col items-center justify-end h-64 relative group hover:bg-base-300 transition-colors">
                    <div className="w-full bg-base-300 rounded-full h-32 w-5 lg:w-10 relative overflow-hidden mb-4 border border-base-content/5">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-primary group-hover:bg-primary-focus transition-all duration-700"
                          style={{ height: item.h }}
                        ></div>
                    </div>
                    <span className="font-bold text-base-content text-lg lg:text-xl">{item.val}</span>
                    <span className="text-base text-base-content/60 mt-2">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3-2. 내역 (리스트) */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1 lg:col-span-2">
            <div className="card-body p-8">
              <h3 className="card-title text-2xl mb-6 text-base-content">최근 내역</h3>
              <div className="overflow-x-auto">
                <table className="table table-lg">
                  <thead>
                    <tr className="text-lg text-base-content/60 border-b-base-300">
                      <th>금액 (USDT)</th>
                      <th>날짜</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* border-base-300 적용으로 구분선 명확화 */}
                    <tr className="hover:bg-base-200 transition-colors border-b border-base-300">
                      <td>
                        <div className="font-bold text-xl text-base-content">10,000</div>
                      </td>
                      <td className="text-base-content/60 text-lg">2025-10-26</td>
                      <td>
                        <span className="badge badge-success badge-lg text-base text-white px-4 py-3 border-0">Active</span>
                      </td>
                    </tr>
                     <tr className="hover:bg-base-200 transition-colors border-b border-base-300">
                      <td>
                        <div className="font-bold text-xl text-base-content">5,000</div>
                      </td>
                      <td className="text-base-content/60 text-lg">2025-10-20</td>
                      <td>
                        <span className="badge badge-success badge-lg text-base text-white px-4 py-3 border-0">Active</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3-3. 공지사항 */}
          <div className="card bg-base-100 shadow-xl border border-base-300 col-span-1">
            <div className="card-body p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title text-2xl text-base-content">공지사항</h3>
                <Link href="/menu/announcement" className="btn btn-sm btn-ghost text-lg">더보기</Link>
              </div>
              <div className="space-y-4">
                {announcementsTop && announcementsTop.length > 0 ? (
                  announcementsTop.map((notice) => (
                    <Link 
                      key={notice.id} 
                      href={`/menu/announcement?id=${encodeURIComponent(notice.id)}`}
                      className="block p-5 bg-base-200 border border-base-300 rounded-xl cursor-pointer hover:bg-base-300 transition"
                    >
                      <p className="text-lg font-medium truncate text-base-content">{notice.title}</p>
                      <p className="text-base text-base-content/60 mt-2">{formatDateAdapter(notice.publishedAt)}</p>
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