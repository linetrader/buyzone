"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ 라우터 추가
import {
  ArrowDown,
  Settings,
  Wallet,
  Info,
  RefreshCw,
  ChevronDown,
  History,
  AlertTriangle,
  ArrowRightLeft,
} from "lucide-react";

// --- 더미 데이터 및 타입 정의 ---
type Token = {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  color: string;
};

// 최근 스왑 내역 타입
type SwapHistoryItem = {
  id: number;
  from: string;
  to: string;
  fromAmount: string;
  toAmount: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
};

const TOKENS: Token[] = [
  {
    symbol: "USDT",
    name: "Tether USD",
    balance: 14143.0,
    price: 1.0,
    color: "bg-green-500",
  },
  {
    symbol: "QAI",
    name: "Quantum AI",
    balance: 500.0,
    price: 0.5,
    color: "bg-blue-500",
  },
  {
    symbol: "DFT",
    name: "DeFi Token",
    balance: 10000.0,
    price: 0.1,
    color: "bg-purple-500",
  },
];

// 더미 스왑 내역 데이터
const DUMMY_HISTORY: SwapHistoryItem[] = [
  {
    id: 1,
    from: "USDT",
    to: "QAI",
    fromAmount: "100.00",
    toAmount: "200.00",
    date: "2025-12-08 14:30",
    status: "Completed",
  },
  {
    id: 2,
    from: "QAI",
    to: "USDT",
    fromAmount: "50.00",
    toAmount: "25.00",
    date: "2025-12-07 09:15",
    status: "Completed",
  },
  {
    id: 3,
    from: "USDT",
    to: "DFT",
    fromAmount: "10.00",
    toAmount: "100.00",
    date: "2025-12-06 18:20",
    status: "Failed",
  },
];

export default function SwapPage() {
  const router = useRouter(); // ✅ 라우터 사용

  // 상태 관리
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(TOKENS[1]);

  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);

  // 교환 비율 계산
  const rate = fromToken.price / toToken.price;

  // 입력 핸들러
  const handleFromChange = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;

    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const converted = parseFloat(value) * rate;
      setToAmount(converted.toFixed(4));
    } else {
      setToAmount("");
    }
  };

  // 스위치 핸들러
  const handleSwitch = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);

    setFromToken(toToken);
    setToToken(fromToken);

    const prevTo = toAmount;
    setFromAmount(prevTo);
    if (prevTo && !isNaN(parseFloat(prevTo))) {
      const newRate = toToken.price / fromToken.price;
      setToAmount((parseFloat(prevTo) * newRate).toFixed(4));
    } else {
      setToAmount("");
    }
  };

  const handleMaxClick = () => {
    handleFromChange(fromToken.balance.toString());
  };

  const handleSwapSubmit = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(
        `${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol} 스왑 완료!`
      );
      setFromAmount("");
      setToAmount("");
    }, 1500);
  };

  // 상태 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return "badge-success text-white";
      case "Pending":
        return "badge-warning text-white";
      case "Failed":
        return "badge-error text-white";
      default:
        return "badge-ghost";
    }
  };

  // ✅ [추가] 새로고침 함수
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10 max-w-[1200px]">
        {" "}
        {/* ✅ max-w 확장 */}
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content flex items-center gap-3">
            토큰 스왑 <ArrowRightLeft size={32} className="text-primary" />
          </h1>
          <p className="text-base-content/60 mt-2 text-lg">
            보유한 자산을 다른 토큰으로 간편하게 교환하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* [왼쪽] 스왑 폼 (7칸) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="card-title text-xl font-bold">스왑</h2>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost btn-circle"
                      title="새로고침"
                    >
                      <RefreshCw size={18} className="text-base-content/60" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost btn-circle"
                      title="설정"
                    >
                      <Settings size={18} className="text-base-content/60" />
                    </button>
                  </div>
                </div>

                {/* From 입력 */}
                <div className="bg-base-200/60 p-4 rounded-2xl hover:bg-base-200 transition-colors border border-transparent hover:border-base-300">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-base-content/60">
                      보낼 금액
                    </span>
                    <span className="text-sm font-medium text-base-content/60 flex items-center gap-1">
                      <Wallet size={14} /> 보유:{" "}
                      {fromToken.balance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => handleFromChange(e.target.value)}
                      className="w-full bg-transparent text-3xl font-bold text-base-content placeholder:text-base-content/20 outline-none"
                    />
                    <button
                      className="btn btn-sm bg-primary/10 text-primary border-0 hover:bg-primary/20"
                      onClick={handleMaxClick}
                    >
                      최대
                    </button>
                    <button className="btn btn-md bg-base-100 border-base-300 shadow-sm rounded-xl px-3 min-w-[120px] flex justify-between items-center hover:bg-base-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${fromToken.color} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {fromToken.symbol[0]}
                        </div>
                        <span className="font-bold text-lg">
                          {fromToken.symbol}
                        </span>
                      </div>
                      <ChevronDown size={16} className="text-base-content/50" />
                    </button>
                  </div>

                  <div className="mt-2 text-sm text-base-content/40">
                    ≈ $
                    {(parseFloat(fromAmount || "0") * fromToken.price).toFixed(
                      2
                    )}
                  </div>
                </div>

                {/* 스위치 버튼 */}
                <div className="relative h-4 flex items-center justify-center z-10 my-1">
                  <button
                    onClick={handleSwitch}
                    className={`btn btn-sm btn-circle bg-base-100 border-4 border-base-100 shadow-md hover:scale-110 hover:bg-base-200 transition-all ${
                      isSwapping ? "rotate-180" : ""
                    }`}
                  >
                    <ArrowDown size={18} className="text-primary" />
                  </button>
                </div>

                {/* To 입력 */}
                <div className="bg-base-200/60 p-4 rounded-2xl hover:bg-base-200 transition-colors border border-transparent hover:border-base-300">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-base-content/60">
                      받을 금액 (예상)
                    </span>
                    <span className="text-sm font-medium text-base-content/60 flex items-center gap-1">
                      <Wallet size={14} /> 보유:{" "}
                      {toToken.balance.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={toAmount}
                      readOnly
                      placeholder="0.0"
                      className="w-full bg-transparent text-3xl font-bold text-base-content placeholder:text-base-content/20 outline-none"
                    />
                    <button className="btn btn-md bg-base-100 border-base-300 shadow-sm rounded-xl px-3 min-w-[120px] flex justify-between items-center hover:bg-base-200">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${toToken.color} flex items-center justify-center text-white text-xs font-bold`}
                        >
                          {toToken.symbol[0]}
                        </div>
                        <span className="font-bold text-lg">
                          {toToken.symbol}
                        </span>
                      </div>
                      <ChevronDown size={16} className="text-base-content/50" />
                    </button>
                  </div>

                  <div className="mt-2 text-sm text-base-content/40">
                    ≈ $
                    {(parseFloat(toAmount || "0") * toToken.price).toFixed(2)}{" "}
                    (-0.1%)
                  </div>
                </div>

                {/* 정보 표시 */}
                {fromAmount && (
                  <div className="collapse collapse-arrow bg-base-100 border border-base-200 mt-4 rounded-xl">
                    <input type="checkbox" />
                    <div className="collapse-title text-sm font-medium flex justify-between pr-10 items-center min-h-0 py-3">
                      <span className="flex items-center gap-2 text-base-content/70">
                        <Info size={14} /> 1 {fromToken.symbol} ={" "}
                        {rate.toFixed(4)} {toToken.symbol}
                      </span>
                      <span className="text-primary text-xs flex items-center gap-1 cursor-pointer hover:underline">
                        <RefreshCw size={10} /> 업데이트
                      </span>
                    </div>
                    <div className="collapse-content text-xs text-base-content/60 space-y-1">
                      <div className="flex justify-between">
                        <span>네트워크 비용</span>
                        <span>~$0.54</span>
                      </div>
                      <div className="flex justify-between">
                        <span>가격 영향 (Price Impact)</span>
                        <span className="text-success">&lt; 0.01%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>최소 수령액</span>
                        <span>
                          {(parseFloat(toAmount) * 0.995).toFixed(4)}{" "}
                          {toToken.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 실행 버튼 */}
                <div className="mt-6">
                  {!fromAmount ? (
                    <button className="btn btn-lg w-full btn-disabled bg-base-200 text-base-content/40 border-0">
                      금액을 입력하세요
                    </button>
                  ) : parseFloat(fromAmount) > fromToken.balance ? (
                    <button className="btn btn-lg w-full btn-error text-white opacity-80">
                      잔액 부족
                    </button>
                  ) : (
                    <button
                      className="btn btn-lg w-full btn-primary shadow-lg shadow-primary/30 text-white text-lg font-bold"
                      onClick={handleSwapSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "스왑 실행"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* [오른쪽] 정보 및 내역 (5칸) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 1. 유의사항 카드 */}
            <div className="alert bg-info/5 border border-info/20 shadow-lg flex items-start gap-4 text-base-content">
              <AlertTriangle className="text-info mt-1 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-base-content mb-1">
                  스왑 이용 안내
                </h3>
                <ul className="text-sm text-base-content/70 list-disc list-inside space-y-1">
                  <li>
                    스왑 시 소량의 네트워크 가스비(BNB)가 발생할 수 있습니다.
                  </li>
                  <li>
                    시장 상황에 따라 예상 수령액과 실제 수령액이 다를 수
                    있습니다. (슬리피지 ±0.5%)
                  </li>
                  <li>
                    스왑은 즉시 처리되지만 네트워크 혼잡 시 지연될 수 있습니다.
                  </li>
                </ul>
              </div>
            </div>

            {/* 2. 최근 스왑 내역 */}
            <div className="card bg-base-100 shadow-xl border border-base-300 flex-grow flex flex-col">
              <div className="card-body p-0 flex flex-col h-full">
                {/* 헤더 */}
                <div className="p-6 border-b border-base-300 bg-base-200/30 shrink-0 flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                    {/* ✅ [수정] 아이콘을 버튼으로 감싸고 클릭 시 새로고침 동작 추가 */}
                    <button
                      onClick={handleRefresh}
                      className="btn btn-ghost btn-sm btn-circle p-0 hover:bg-base-300 transition-colors"
                      title="새로고침"
                    >
                      <History
                        className="text-primary hover:text-primary-focus transition-transform active:rotate-180"
                        size={20}
                      />
                    </button>
                    최근 스왑 내역
                  </h3>
                </div>

                {/* 리스트 */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {DUMMY_HISTORY.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-base-content/40 text-center">
                      내역이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {DUMMY_HISTORY.map((item) => (
                        <div
                          key={item.id}
                          className="bg-base-100 border border-base-200 p-4 rounded-xl hover:shadow-md hover:border-primary/30 transition-all"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 font-bold text-base-content">
                              <span>{item.from}</span>
                              <ArrowDown
                                size={14}
                                className="-rotate-90 text-base-content/40"
                              />
                              <span>{item.to}</span>
                            </div>
                            <span
                              className={`badge ${getStatusBadge(
                                item.status
                              )} border-none`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="text-sm text-base-content/60">
                              <div>
                                -{item.fromAmount} {item.from}
                              </div>
                              <div className="text-primary font-medium">
                                +{item.toAmount} {item.to}
                              </div>
                            </div>
                            <span className="text-xs text-base-content/40">
                              {item.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 푸터 */}
                <div className="p-4 border-t border-base-300 bg-base-200/30 shrink-0 text-center">
                  <button
                    className="btn btn-ghost btn-sm text-base-content/60 hover:text-primary"
                    onClick={() => router.push("/history")} // ✅ 전체 내역 이동
                  >
                    전체 내역 조회
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
