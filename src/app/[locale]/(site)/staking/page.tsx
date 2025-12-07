"use client";

import { useState } from "react";
import { Wallet, CheckCircle2, DollarSign, Lock, History, Coins, ArrowRight } from "lucide-react";

export default function StakingPage() {
  // 상태 관리
  const [currency, setCurrency] = useState("BEPUSDT");
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [pinNumber, setPinNumber] = useState("");

  // 패키지 금액 목록
  const packages = [100, 300, 500, 1000, 3000, 5000, 10000];

  return (
    // 레이아웃에서 헤더/푸터가 처리되므로, 여기서는 배경색과 내부 컨테이너만 설정
    <div className="w-full bg-base-200/50 min-h-full font-sans">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content">
            스테이킹 신청 <span className="text-primary">Staking</span>
          </h1>
          <p className="text-base-content/60 mt-2 text-lg">원하는 패키지를 선택하여 수익을 창출하세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* [왼쪽] 스테이킹 신청 폼 (8칸 차지) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
              <div className="card-body p-6 lg:p-8 gap-6">
                
                {/* 1. 네트워크 선택 */}
                <div>
                  <h3 className="text-lg font-bold text-base-content mb-3 flex items-center gap-2">
                    <Coins className="text-primary" size={20}/> 네트워크 선택
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {["BEPUSDT", "TRCUSDT", "GHD"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setCurrency(item)}
                        className={`btn h-14 text-base transition-all duration-200 ${
                          currency === item 
                            ? "btn-primary shadow-md transform scale-[1.02] text-white" 
                            : "btn-outline border-base-300 text-base-content/70 hover:bg-base-200 hover:border-primary hover:text-primary"
                        }`}
                      >
                        {item}
                        {currency === item && <CheckCircle2 size={18} className="ml-1"/>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* 2. 패키지 선택 */}
                <div>
                  <h3 className="text-lg font-bold text-base-content mb-3 flex items-center gap-2">
                    <Wallet className="text-primary" size={20}/> 패키지 선택
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {packages.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setSelectedAmount(amt)}
                        className={`btn h-12 text-lg font-medium transition-all duration-200 ${
                          selectedAmount === amt
                            ? "btn-active bg-primary/10 text-primary border-primary border-2"
                            : "bg-base-100 border-base-300 text-base-content/70 hover:border-primary hover:text-primary"
                        }`}
                      >
                        ${amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* 3. 상세 정보 입력 */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* USD 가격 */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">USD 가격</span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2 bg-base-100">
                        <DollarSign size={18} className="text-base-content/40"/>
                        <input
                          type="text"
                          value={selectedAmount.toLocaleString()}
                          readOnly
                          className="grow font-bold text-base-content"
                        />
                        <span className="text-base-content/40 text-sm">USD</span>
                      </label>
                    </div>

                    {/* 코인 수량 */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">결제 수량</span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2 bg-base-100 ring-2 ring-primary/20">
                        <Coins size={18} className="text-primary"/>
                        <input
                          type="text"
                          value={selectedAmount.toLocaleString()}
                          readOnly
                          className="grow font-bold text-primary"
                        />
                        <span className="text-primary text-sm font-bold">{currency}</span>
                      </label>
                    </div>
                  </div>

                  {/* 핀 번호 */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-base-content/70">PIN 번호 입력</span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                      <Lock size={18} className="text-base-content/40"/>
                      <input
                        type="password"
                        placeholder="PIN 번호 6자리"
                        value={pinNumber}
                        onChange={(e) => setPinNumber(e.target.value)}
                        className="grow tracking-widest text-base-content"
                      />
                    </label>
                  </div>
                </div>

                {/* 확인 버튼 */}
                <div className="mt-4">
                  <button className="btn btn-primary w-full text-lg h-14 shadow-lg hover:shadow-primary/30 transition-shadow text-white">
                    스테이킹 신청하기 <ArrowRight size={20}/>
                  </button>
                  <p className="text-center text-xs text-base-content/40 mt-3">
                    버튼을 누르면 스테이킹이 즉시 시작되며 취소할 수 없습니다.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* [오른쪽] 내역 테이블 (4칸 차지) */}
          <div className="lg:col-span-5 xl:col-span-4 h-full">
             <div className="card bg-base-100 shadow-xl border border-base-200 h-full flex flex-col">
              <div className="card-body p-0 flex flex-col h-full">
                
                {/* 헤더 */}
                <div className="p-6 border-b border-base-200 bg-base-200/30">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                    <History className="text-primary" size={20} />
                    최근 신청 내역
                  </h3>
                </div>

                {/* 리스트 영역 */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-base-100 border border-base-200 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-sm text-base-content/50 mb-1">2025-10-26</span>
                      <span className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">10,000 <span className="text-sm font-normal text-base-content/60">{currency}</span></span>
                    </div>
                    <span className="badge badge-success badge-lg text-white shadow-sm border-none">Active</span>
                  </div>

                  {/* Item 2 (Dummy) */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-base-100 border border-base-200 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-sm text-base-content/50 mb-1">2025-09-15</span>
                      <span className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">5,000 <span className="text-sm font-normal text-base-content/60">{currency}</span></span>
                    </div>
                    <span className="badge badge-success badge-lg text-white shadow-sm border-none">Active</span>
                  </div>

                  {/* Item 3 (Dummy) */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-base-200/50 border border-base-200 opacity-70">
                    <div className="flex flex-col">
                      <span className="text-sm text-base-content/50 mb-1">2025-08-01</span>
                      <span className="font-bold text-lg text-base-content/60">1,000 <span className="text-sm font-normal text-base-content/50">{currency}</span></span>
                    </div>
                    <span className="badge badge-ghost badge-lg text-base-content/60">Completed</span>
                  </div>
                </div>

                {/* 푸터 (전체보기 등) */}
                <div className="p-4 border-t border-base-200 bg-base-200/30 text-center">
                   <button className="btn btn-ghost btn-sm text-base-content/60 hover:text-primary">전체 내역 조회</button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}