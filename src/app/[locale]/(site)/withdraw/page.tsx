"use client";

import { useState } from "react";
import { Wallet, ArrowRight, History, AlertCircle, DollarSign, CreditCard, Lock, CheckCircle2 } from "lucide-react";

export default function WithdrawPage() {
  // 상태 관리
  const [network, setNetwork] = useState("TRC20");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [pinNumber, setPinNumber] = useState("");

  // 보유 자산 (더미 데이터)
  const availableBalance = 14143.00;
  const fee = 1.00; // 수수료

  // 출금 내역 더미 데이터
  const history = [
    { date: "2025-12-01", amount: "5,000", network: "TRC20", status: "Completed" },
    { date: "2025-11-20", amount: "2,000", network: "BEP20", status: "Completed" },
    { date: "2025-11-15", amount: "10,000", network: "TRC20", status: "Rejected" },
  ];

  const handleMaxAmount = () => {
    setAmount((availableBalance - fee).toString());
  };

  return (
    // 헤더/푸터 제거, 레이아웃 내부 콘텐츠 영역 설정
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content">
            출금 신청 <span className="text-primary">Withdraw</span>
          </h1>
          <p className="text-base-content/60 mt-2 text-lg">보유하신 자산을 외부 지갑으로 안전하게 출금하세요.</p>
        </div>

        {/* 상단 자산 정보 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-lg border border-base-300">
            <div className="card-body flex-row items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Wallet size={32} />
              </div>
              <div>
                <p className="text-base-content/60 font-medium">출금 가능 잔액</p>
                <h2 className="text-3xl font-bold text-base-content">
                  {availableBalance.toLocaleString()} <span className="text-lg text-base-content/40">USDT</span>
                </h2>
              </div>
            </div>
          </div>
          <div className="alert bg-info/5 border border-info/20 shadow-lg flex items-start gap-4 text-base-content">
            <AlertCircle className="text-info mt-1 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-base-content mb-1">출금 유의사항</h3>
              <ul className="text-sm text-base-content/70 list-disc list-inside space-y-1">
                <li>입력하신 지갑 주소가 정확한지 반드시 확인해주세요.</li>
                <li>오입금 시 복구가 불가능할 수 있습니다.</li>
                <li>최소 출금 금액은 10 USDT 입니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* [왼쪽] 출금 신청 폼 (7칸) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-6 lg:p-8 gap-6">
                
                {/* 1. 네트워크 선택 */}
                <div>
                  <h3 className="text-lg font-bold text-base-content mb-3">네트워크 선택</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {["TRC20", "BEP20", "ERC20"].map((net) => (
                      <button
                        key={net}
                        onClick={() => setNetwork(net)}
                        className={`btn h-12 text-base font-medium transition-all ${
                          network === net 
                            ? "btn-primary shadow-md text-white" 
                            : "btn-outline border-base-300 text-base-content/60 hover:text-primary hover:border-primary hover:bg-base-200"
                        }`}
                      >
                        {net}
                        {network === net && <CheckCircle2 size={16} className="ml-1"/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. 지갑 주소 입력 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base-content/70">출금 주소</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-base-100 border-base-300">
                    <CreditCard size={18} className="text-base-content/40"/>
                    <input
                      type="text"
                      placeholder="지갑 주소를 입력하거나 붙여넣으세요"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="grow text-base-content placeholder:text-base-content/30"
                    />
                  </label>
                </div>

                {/* 3. 출금 금액 입력 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base-content/70">출금 금액</span>
                    <span 
                      className="label-text-alt text-primary font-bold cursor-pointer hover:underline"
                      onClick={handleMaxAmount}
                    >
                      최대 입력
                    </span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-base-100 border-base-300">
                    <DollarSign size={18} className="text-base-content/40"/>
                    <input
                      type="number"
                      placeholder="최소 10 USDT"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="grow font-bold text-lg text-base-content placeholder:text-base-content/30"
                    />
                    <span className="text-base-content/40 font-medium">USDT</span>
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-base-content/40">수수료: {fee} USDT</span>
                    <span className="label-text-alt text-base-content font-bold">
                      실수령액: {amount ? (Number(amount) - fee).toLocaleString() : 0} USDT
                    </span>
                  </label>
                </div>

                {/* 4. PIN 번호 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-base-content/70">PIN 번호</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-base-100 border-base-300">
                    <Lock size={18} className="text-base-content/40"/>
                    <input
                      type="password"
                      placeholder="보안 PIN 번호 6자리"
                      value={pinNumber}
                      onChange={(e) => setPinNumber(e.target.value)}
                      className="grow tracking-widest text-base-content placeholder:text-base-content/30"
                    />
                  </label>
                </div>

                {/* 신청 버튼 */}
                <button className="btn btn-primary w-full h-14 text-lg shadow-lg mt-2 text-white">
                  출금 신청하기 <ArrowRight size={20}/>
                </button>

              </div>
            </div>
          </div>

          {/* [오른쪽] 출금 내역 (5칸) */}
          <div className="lg:col-span-5 h-full">
            <div className="card bg-base-100 shadow-xl border border-base-300 h-full flex flex-col">
              <div className="card-body p-0 flex flex-col h-full">
                
                {/* 헤더 */}
                <div className="p-6 border-b border-base-300 bg-base-200/30">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                    <History className="text-primary" size={20} />
                    최근 출금 내역
                  </h3>
                </div>

                {/* 리스트 영역 */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {history.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-md transition-all">
                      <div className="flex flex-col">
                        <span className="text-xs text-base-content/40 mb-1">{item.date} • {item.network}</span>
                        <span className="font-bold text-lg text-base-content">
                          {item.amount} <span className="text-sm font-normal text-base-content/40">USDT</span>
                        </span>
                      </div>
                      <div>
                        {item.status === "Completed" && <span className="badge badge-success text-white border-none">완료</span>}
                        {item.status === "Pending" && <span className="badge badge-warning text-white border-none">대기</span>}
                        {item.status === "Rejected" && <span className="badge badge-error text-white border-none">반려</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 푸터 */}
                <div className="p-4 border-t border-base-300 bg-base-200/30 text-center">
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