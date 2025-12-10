// src/app/[locale]/(site)/wallet/withdraw/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWithdraw } from "./hooks/useWithdraw";
import type { ToastVariant, TokenSymbol } from "@/types/common";

import {
  ArrowRight,
  History,
  AlertCircle,
  DollarSign,
  Lock,
  CheckCircle2,
  Wallet,
  User,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";

// --- 상수 및 유틸리티 함수 ---
const DUMMY_FEE = 1.0;
const MIN_WITHDRAW = 10;
const HISTORY_ROUTE = "/history";

function nfmt(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
}

function toNum(s: unknown): number {
  const input = s != null ? String(s) : "";
  const v = Number(input.replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
}
// -----------------------------

// 트랜잭션 아이템 타입 정의
interface WithdrawTxItem {
  date: string;
  amount: string;
  network: string;
  status: "COMPLETED" | "PENDING" | "REJECTED" | string;
}

// API 응답 타입
interface ApiSuccessResponse {
  ok: true;
  balances: { USDT: unknown; QAI: unknown; DFT: unknown };
  withdrawAddress: string | null;
  googleOtpEnabled: boolean;
  recentTxs: WithdrawTxItem[];
}

interface ApiErrorResponse {
  ok: false;
  code: string;
  message?: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// 트랜잭션 상태 UI 매퍼
const getTxStatusUi = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return { label: "완료", badge: "badge-success" };
    case "PENDING":
      return { label: "대기", badge: "badge-warning" };
    case "REJECTED":
      return { label: "반려", badge: "badge-error" };
    default:
      return { label: status, badge: "badge-info" };
  }
};

export default function WithdrawPage() {
  const t = useTranslations("wallet.withdraw");
  const router = useRouter();

  const { submitting, submit } = useWithdraw();

  // API 응답 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [userWithdrawAddress, setUserWithdrawAddress] = useState<string | null>(
    null
  );
  const [recentHistory, setRecentHistory] = useState<WithdrawTxItem[]>([]);

  // DB 데이터 조회
  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin",
      });

      const text = await res.text();
      let json: ApiResponse | null = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        console.error("JSON Parsing Failed. Raw Response:", text);
        throw new Error("Invalid JSON response from server.");
      }

      if (!res.ok || !json || json.ok !== true) {
        const msg =
          (json && "message" in json ? json.message : undefined) ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const successJson = json as ApiSuccessResponse;

      setAvailableBalance(toNum(successJson.balances?.USDT) || 0);
      setUserWithdrawAddress(successJson.withdrawAddress || null);
      setRecentHistory(successJson.recentTxs || []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("error.badge");
      setError(msg);
      setAvailableBalance(0);
      setUserWithdrawAddress(null);
      setRecentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchWalletData();
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // --- 폼 상태 ---
  const [network, setNetwork] = useState("BEP20");
  const [amount, setAmount] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // --- 토스트 상태 ---
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVariant, setToastVariant] = useState<ToastVariant>("info");
  const showToast = (msg: string, variant: ToastVariant = "info") => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 2000);
  };

  // --- 계산된 값 ---
  const n = toNum(amount);

  const canWithdraw =
    !!userWithdrawAddress &&
    n >= MIN_WITHDRAW &&
    n <= availableBalance - DUMMY_FEE;
  const netReceive = n > DUMMY_FEE ? n - DUMMY_FEE : 0;

  const handleMaxAmount = () => {
    const maxAmount = availableBalance - DUMMY_FEE;
    setAmount(nfmt(Math.max(0, maxAmount)));
  };

  // --- 출금 신청 처리 ---
  const handleSubmit = async () => {
    if (!canWithdraw) {
      showToast(t("submit.invalidAmount"), "warning");
      return;
    }
    if (!otpCode) {
      showToast(t("submit.requiredFields"), "warning");
      return;
    }

    const res = await submit("USDT" as TokenSymbol, n, otpCode);

    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }
    if (res.nextBalances) {
      await refresh();
    }
    showToast(res.message, "success");

    setAmount("");
    setOtpCode("");
  };

  const availableNetworks = ["BEP20"];

  return (
    <main className="w-full bg-base-200/50 min-h-full font-sans">
      {/* Toast */}
      {toastOpen && (
        <div className="toast toast-bottom toast-center z-[9999]">
          <div
            className={`alert shadow-lg ${
              toastVariant === "success"
                ? "alert-success"
                : toastVariant === "error"
                ? "alert-error"
                : "alert-info"
            }`}
          >
            <span className="text-sm">{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-10 py-10">
        {/* ✅ [수정] 페이지 헤더: 텍스트 + 아이콘 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content flex items-center gap-3">
            출금 신청 <Wallet className="text-primary" size={36} />
          </h1>
          <p className="text-base-content/60 mt-2 text-lg">
            보유하신 자산을 안전하게 출금하세요.
          </p>
        </div>

        {/* 로딩/에러 상태 처리 */}
        {loading ? (
          <div className="flex items-center justify-center p-10">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error m-4">
            <span>{t("error.title")}</span>
            <p className="text-sm">{error}</p>
            <button className="btn btn-sm" onClick={() => refresh()}>
              {t("error.retry")}
            </button>
          </div>
        ) : (
          <div>
            {/* 📌 상단 자산 정보 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body flex-row items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Wallet size={32} />
                  </div>
                  <div>
                    <p className="text-base-content/60 font-medium">
                      {t("balance.available")}
                    </p>
                    <h2 className="text-3xl font-bold text-base-content">
                      {nfmt(availableBalance)}{" "}
                      <span className="text-lg text-base-content/40">USDT</span>
                    </h2>
                  </div>
                </div>
              </div>

              <div className="alert bg-info/5 border border-info/20 shadow-lg flex items-start gap-4 text-base-content">
                <AlertCircle className="text-info mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-base-content mb-1">
                    {t("notice.title")}
                  </h3>
                  <ul className="text-sm text-base-content/70 list-disc list-inside space-y-1">
                    <li>{t("notice.checkAddress")}</li>
                    <li>{t("notice.noRecovery")}</li>
                    <li>
                      {t("notice.minAmount", {
                        amount: MIN_WITHDRAW,
                        symbol: "USDT",
                      })}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 📌 메인 폼 + 내역 (Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* [왼쪽] 출금 신청 폼 (7칸) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* 지갑 주소 표시 패널 */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                  <div className="card-body p-4 gap-3">
                    <div className="flex items-center gap-2 text-base-content/70">
                      <User size={18} className="text-primary" />
                      <span className="font-bold text-sm">
                        등록된 출금 지갑 주소 (BEP20)
                      </span>
                    </div>
                    {userWithdrawAddress ? (
                      <div className="bg-base-200 p-3 rounded-lg border border-base-300">
                        <p className="font-mono text-sm text-base-content break-all select-all">
                          {userWithdrawAddress}
                        </p>
                      </div>
                    ) : (
                      <div className="alert alert-warning py-2 text-sm">
                        <Info size={18} />
                        <span>
                          출금 주소가 등록되지 않았습니다. 마이페이지에서
                          등록해주세요.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card bg-base-100 shadow-xl border border-base-300">
                  <div className="card-body p-6 lg:p-8 gap-6">
                    {/* 1. 네트워크 선택 */}
                    <div>
                      <h3 className="text-lg font-bold text-base-content mb-3">
                        {t("form.networkTitle")}
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {availableNetworks.map((net) => (
                          <button
                            key={net}
                            onClick={() => setNetwork(net)}
                            className={`btn h-12 text-base font-medium transition-all ${
                              network === net
                                ? "btn-primary shadow-md text-white"
                                : "btn-outline border-base-300 text-base-content/60 hover:text-primary hover:border-primary hover:bg-base-200"
                            } ${
                              availableNetworks.length === 1 ? "col-span-3" : ""
                            }`}
                            disabled={!userWithdrawAddress}
                          >
                            {net}
                            {network === net && (
                              <CheckCircle2 size={16} className="ml-1" />
                            )}
                          </button>
                        ))}
                      </div>
                      {!userWithdrawAddress && (
                        <p className="text-error text-sm mt-2">
                          출금 주소를 먼저 등록해야 네트워크를 선택할 수
                          있습니다.
                        </p>
                      )}
                    </div>

                    {/* 3. 출금 금액 입력 */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">
                          {t("form.amountLabel")}
                        </span>
                        <span
                          className="label-text-alt text-primary font-bold cursor-pointer hover:underline"
                          onClick={handleMaxAmount}
                        >
                          {t("form.maxAmount")}
                        </span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-base-100 border-base-300">
                        <DollarSign
                          size={18}
                          className="text-base-content/40"
                        />
                        <input
                          type="number"
                          placeholder={t("form.amountPlaceholder")}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="grow font-bold text-lg text-base-content placeholder:text-base-content/30"
                        />
                        <span className="text-base-content/40 font-medium">
                          USDT
                        </span>
                      </label>
                      <label className="label">
                        <span className="label-text-alt text-base-content/40">
                          {t("form.fee", { fee: nfmt(DUMMY_FEE) })}
                        </span>
                        <span className="label-text-alt text-base-content font-bold">
                          {t("form.receive", { amount: nfmt(netReceive) })}
                        </span>
                      </label>
                      {amount && !canWithdraw && (
                        <p className="text-error text-sm mt-1">
                          {t("submit.invalidAmount")}
                        </p>
                      )}
                    </div>

                    {/* 4. Google OTP 코드 입력 */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-bold text-base-content/70">
                          {t("form.otpLabel")}
                        </span>
                      </label>
                      <label className="input input-bordered flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary bg-base-100 border-base-300">
                        <Lock size={18} className="text-base-content/40" />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder={t("form.otpPlaceholder")}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="grow tracking-widest text-base-content placeholder:text-base-content/30"
                        />
                      </label>
                    </div>

                    {/* 신청 버튼 */}
                    <button
                      className="btn btn-primary w-full h-14 text-lg shadow-lg mt-2 text-white"
                      disabled={submitting || !canWithdraw || !otpCode}
                      onClick={handleSubmit}
                    >
                      {submitting ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <>
                          {t("form.submitButton")} <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* [오른쪽] 출금 내역 (5칸) */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <div className="card bg-base-100 shadow-xl border border-base-300 flex-grow flex flex-col">
                  <div className="card-body p-0 flex flex-col h-full">
                    {/* 헤더 */}
                    <div className="p-6 border-b border-base-300 bg-base-200/30 shrink-0">
                      <h3 className="text-lg font-bold text-base-content">
                        <History className="text-primary" size={20} />
                        {t("history.title")}
                      </h3>
                    </div>

                    {/* 리스트 영역 */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                      {recentHistory.map((item, index) => {
                        const ui = getTxStatusUi(item.status);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-xl bg-base-100 border border-base-200 hover:border-primary/30 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs text-base-content/40 mb-1">
                                {item.date} • {item.network}
                              </span>
                              <span className="font-bold text-lg text-base-content">
                                {item.amount}{" "}
                                <span className="text-sm font-normal text-base-content/40">
                                  USDT
                                </span>
                              </span>
                            </div>
                            <div>
                              <span
                                className={`badge ${ui.badge} text-white border-none`}
                              >
                                {ui.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {recentHistory.length === 0 && (
                        <div className="h-40 flex items-center justify-center text-base-content/40 text-center">
                          {t("history.empty")}
                        </div>
                      )}
                    </div>

                    {/* 푸터 */}
                    <div className="p-4 border-t border-base-300 bg-base-200/30 shrink-0">
                      <button
                        className="btn btn-ghost btn-sm text-base-content/60 hover:text-primary"
                        onClick={() => router.push(HISTORY_ROUTE)}
                      >
                        {t("history.viewAll")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
