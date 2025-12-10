// src/app/[locale]/(site)/staking/page.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Wallet,
  CheckCircle2,
  DollarSign,
  Lock,
  History,
  Coins,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

// --- [타입 정의] ---
interface PackageItem {
  id: string;
  name: string;
  price: string;
}

interface StakingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

// 숫자 포맷 유틸리티
const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);

export default function StakingPage() {
  const router = useRouter();

  // --- 상태 관리 ---
  const [currency, setCurrency] = useState("BEPUSDT");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [otpCode, setOtpCode] = useState("");
  const [submitting, setSubmitting] = useState(false); // 로딩 상태

  // 데이터 상태
  const [usdtBalance, setUsdtBalance] = useState<number>(0);
  const [stakingHistory, setStakingHistory] = useState<StakingHistoryItem[]>(
    []
  );
  const [packageList, setPackageList] = useState<PackageItem[]>([]);
  const [loadingPackages, setLoadingPackages] = useState<boolean>(true);

  // --- 토스트 상태 ---
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVariant, setToastVariant] = useState<string>("info");

  const showToast = useCallback((msg: string, variant: string = "info") => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 2000);
  }, []);

  const getToastClass = (variant: string) => {
    switch (variant) {
      case "success":
        return "alert-success";
      case "error":
        return "alert-error";
      default:
        return "alert-info";
    }
  };

  // ✅ 데이터 조회 (패키지, 잔액, 내역 통합)
  const fetchData = useCallback(async () => {
    try {
      setLoadingPackages(true);

      // 1. 패키지 목록 조회
      const pkgRes = await fetch("/api/admin/packages?page=1&size=100", {
        cache: "no-store",
      });
      if (pkgRes.ok) {
        const data = await pkgRes.json();
        const items = Array.isArray(data.items) ? data.items : [];
        items.sort(
          (a: PackageItem, b: PackageItem) => Number(a.price) - Number(b.price)
        );
        setPackageList(items);
        if (items.length > 0 && selectedAmount === 0) {
          setSelectedAmount(Number(items[0].price));
        }
      }

      // 2. 잔액 조회
      const balanceRes = await fetch("/api/home", { cache: "no-store" });
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        if (data.ok && data.balances) {
          setUsdtBalance(Number(data.balances.usdt || 0));
        }
      }

      // 3. 내역 조회
      const historyRes = await fetch("/api/staking/history?limit=10", {
        cache: "no-store",
      });
      if (historyRes.ok) {
        const data = await historyRes.json();
        if (data.ok && Array.isArray(data.items)) {
          setStakingHistory(data.items);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoadingPackages(false);
    }
  }, [selectedAmount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ 실제 신청 핸들러
  const handleSubmit = async () => {
    if (!selectedAmount || selectedAmount <= 0) {
      showToast("패키지 금액을 선택해주세요.", "error");
      return;
    }
    if (usdtBalance < selectedAmount) {
      showToast("보유 잔액이 부족합니다.", "error");
      return;
    }
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      showToast("Google OTP 6자리를 정확히 입력해주세요.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/staking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: currency,
          otpCode: otpCode,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "신청에 실패했습니다.");
      }

      showToast("스테이킹 신청이 완료되었습니다.", "success");
      setOtpCode("");
      fetchData(); // 데이터 새로고침 (잔액 및 내역 갱신)
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-base-200/50 min-h-full font-sans">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        {/* Toast */}
        {toastOpen && (
          <div className="toast toast-top toast-center z-[9999]">
            <div className={`alert shadow-lg ${getToastClass(toastVariant)}`}>
              <span className="text-sm">{toastMsg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content">
            스테이킹 신청 <span className="text-primary">Staking</span>
          </h1>
          <p className="text-base-content/60 mt-2 text-lg">
            원하는 패키지를 선택하여 수익을 창출하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Form Section */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
              <div className="card-body p-6 lg:p-8 gap-6">
                {/* 1. Network & Balance */}
                <div>
                  <h3 className="text-lg font-bold text-base-content flex items-center gap-2 mb-4">
                    <Coins className="text-primary" size={20} /> 네트워크 선택
                  </h3>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="grid grid-cols-3 gap-3 w-full md:w-auto flex-1">
                      {["BEPUSDT"].map((item) => (
                        <button
                          key={item}
                          onClick={() => setCurrency(item)}
                          className={`btn h-14 text-base transition-all duration-200 rounded-lg ${
                            currency === item
                              ? "btn-primary shadow-md transform scale-[1.02] text-white border-2 border-primary"
                              : "btn-outline border-base-300 text-base-content/70 hover:bg-base-200 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {item}
                          {currency === item && (
                            <CheckCircle2 size={18} className="ml-1" />
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Balance Box */}
                    <div className="h-14 w-full md:w-auto flex items-center gap-3 bg-base-200/50 px-5 rounded-lg border border-base-300/60 shadow-sm min-w-[220px]">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Wallet size={18} className="text-primary" />
                      </div>
                      <div className="flex flex-col leading-none justify-center">
                        <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mb-0.5">
                          Available Balance
                        </span>
                        <span className="font-bold text-lg text-primary leading-tight">
                          {fmtNum(usdtBalance)}{" "}
                          <span className="text-xs font-medium text-base-content/60 ml-0.5">
                            USDT
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* 2. Package Selection */}
                <div>
                  <h3 className="text-lg font-bold text-base-content mb-3 flex items-center gap-2">
                    <Wallet className="text-primary" size={20} /> 패키지 선택
                  </h3>
                  {loadingPackages ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-12 bg-base-200 rounded-lg animate-pulse"
                        ></div>
                      ))}
                    </div>
                  ) : packageList.length === 0 ? (
                    <div className="text-center py-6 text-base-content/60 bg-base-200 rounded-lg">
                      등록된 패키지가 없습니다.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {packageList.map((pkg) => {
                        const priceNum = Number(pkg.price);
                        return (
                          <button
                            key={pkg.id}
                            onClick={() => setSelectedAmount(priceNum)}
                            className={`btn h-auto py-2 min-h-[3rem] flex flex-col gap-0.5 transition-all duration-200 rounded-lg ${
                              selectedAmount === priceNum
                                ? "btn-active bg-primary/10 text-primary border-primary border-2"
                                : "bg-base-100 border-base-300 text-base-content/70 hover:border-primary hover:text-primary"
                            }`}
                          >
                            <span className="text-lg font-medium">
                              ${fmtNum(priceNum)}
                            </span>
                            <span className="text-xs opacity-70 font-normal">
                              {pkg.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="divider my-0"></div>

                {/* 3. Details & Input */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">
                          USD 가격
                        </span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2 bg-base-100">
                        <DollarSign
                          size={18}
                          className="text-base-content/40"
                        />
                        <input
                          type="text"
                          value={fmtNum(selectedAmount)}
                          readOnly
                          className="grow font-bold text-base-content"
                        />
                        <span className="text-base-content/40 text-sm">
                          USD
                        </span>
                      </label>
                    </div>
                    <div className="form-control">
                      <div className="label flex justify-between">
                        <span className="label-text font-bold text-base-content/70">
                          결제 수량
                        </span>
                        {usdtBalance < selectedAmount && (
                          <span className="label-text-alt text-error font-medium animate-pulse">
                            잔액 부족
                          </span>
                        )}
                      </div>
                      <label
                        className={`input input-bordered flex items-center gap-2 bg-base-100 ring-2 ${
                          usdtBalance < selectedAmount
                            ? "ring-error/30 border-error"
                            : "ring-primary/20"
                        }`}
                      >
                        <Coins
                          size={18}
                          className={
                            usdtBalance < selectedAmount
                              ? "text-error"
                              : "text-primary"
                          }
                        />
                        <input
                          type="text"
                          value={fmtNum(selectedAmount)}
                          readOnly
                          className={`grow font-bold ${
                            usdtBalance < selectedAmount
                              ? "text-error"
                              : "text-primary"
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            usdtBalance < selectedAmount
                              ? "text-error"
                              : "text-primary"
                          }`}
                        >
                          {currency}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold text-base-content/70">
                        Google OTP 코드 입력
                      </span>
                    </label>
                    <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                      <Lock size={18} className="text-base-content/40" />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="6자리 OTP 코드 입력"
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        maxLength={6}
                        className="grow tracking-widest text-base-content"
                      />
                    </label>
                  </div>
                  {(!otpCode || otpCode.length !== 6) && (
                    <div className="text-sm text-error flex items-center gap-1">
                      <AlertTriangle size={16} /> 6자리 Google OTP 코드를
                      입력해야 신청이 가능합니다.
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    className="btn btn-primary w-full text-lg h-14 shadow-lg hover:shadow-primary/30 transition-shadow text-white"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      otpCode.length !== 6 ||
                      loadingPackages ||
                      usdtBalance < selectedAmount
                    }
                  >
                    {submitting ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        스테이킹 신청하기 <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-base-content/40 mt-3">
                    버튼을 누르면 스테이킹이 즉시 시작되며 취소할 수 없습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-5 xl:col-span-4 h-full">
            <div className="card bg-base-100 shadow-xl border border-base-200 h-full flex flex-col">
              <div className="card-body p-0 flex flex-col h-full">
                <div className="p-6 border-b border-base-200 bg-base-200/30 flex justify-between items-center">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                    <button
                      onClick={fetchData}
                      className="btn btn-ghost btn-sm btn-circle p-0 hover:bg-base-300 transition-colors"
                      title="새로고침"
                    >
                      <History
                        className="text-primary hover:text-primary-focus transition-transform active:rotate-180"
                        size={20}
                      />
                    </button>
                    최근 신청 내역
                  </h3>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {stakingHistory.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-base-content/40 text-center">
                      <History size={32} className="opacity-20 mb-2" />
                      <p>최근 신청 내역이 없습니다.</p>
                    </div>
                  ) : (
                    stakingHistory.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-4 rounded-xl bg-base-100 border border-base-200 hover:shadow-md hover:border-primary/30 transition-all cursor-default group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm text-base-content/50 mb-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-bold text-lg text-base-content group-hover:text-primary transition-colors">
                            {fmtNum(item.amount)}{" "}
                            <span className="text-sm font-normal text-base-content/60">
                              {item.currency || currency}
                            </span>
                          </span>
                        </div>
                        <span className="badge badge-lg text-white shadow-sm border-none badge-success">
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-base-200 bg-base-200/30 text-center">
                  <button
                    className="btn btn-ghost btn-sm text-base-content/60 hover:text-primary"
                    onClick={() => router.push("/history/staking")}
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
