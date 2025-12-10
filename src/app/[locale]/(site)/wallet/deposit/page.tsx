// src/app/[locale]/(site)/wallet/deposit/page.tsx
"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import type { ToastVariant } from "@/types/common";
import { useRouter } from "next/navigation";
import {
  useDepositAddress,
  type DepositAddressPayload,
} from "./hooks/useDepositAddress";
import { useQrCode } from "./hooks/useQrCode";
import { useTranslations } from "next-intl";

// 아이콘 임포트
import {
  ChevronLeft,
  Copy,
  QrCode,
  AlertTriangle,
  Wallet,
  History,
  CheckCircle,
  Clock,
  XCircle,
  Info,
} from "lucide-react";

// --- 유틸리티 함수 및 상수 ---
const MIN_DEPOSIT_AMOUNT = 10;
const CURRENCY = "USDT";

// 날짜 포맷팅 유틸리티
const dateFormat = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

// 트랜잭션 상태에 따른 UI 매퍼
const getTxStatusUi = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return {
        icon: <CheckCircle size={16} className="text-success" />,
        label: "완료",
        badge: "badge-success",
      };
    case "PENDING":
      return {
        icon: <Clock size={16} className="text-warning" />,
        label: "대기",
        badge: "badge-warning",
      };
    case "FAILED":
      return {
        icon: <XCircle size={16} className="text-error" />,
        label: "실패",
        badge: "badge-error",
      };
    default:
      return {
        icon: <Info size={16} className="text-info" />,
        label: status,
        badge: "badge-info",
      };
  }
};

// toNum 함수
function toNum(s: unknown): number {
  const input = s != null ? String(s) : "";
  const v = Number(input.replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
}
// -----------------------------

export default function DepositPage() {
  const t = useTranslations("wallet.deposit");
  const router = useRouter();
  const { loading, error, payload, refresh } = useDepositAddress();
  const addr = payload?.depositAddress ?? "";
  const recentTxs = payload?.recentTxs ?? [];
  const networkName = "BEP-20 (BNB Smart Chain)";
  const { dataUrl: qr, generating: qrLoading } = useQrCode(addr);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");
  const [toastVariant, setToastVariant] = useState<ToastVariant>("info");

  const showToast = useCallback(
    (msg: string, variant: ToastVariant = "info") => {
      setToastMsg(msg);
      setToastVariant(variant);
      setToastOpen(true);
      window.setTimeout(() => setToastOpen(false), 1800);
    },
    []
  );

  const copyAddr = useCallback(async () => {
    if (!addr) return;
    try {
      await navigator.clipboard.writeText(addr);
      showToast(t("address.copied"), "success");
    } catch {
      showToast(t("address.clipboardUnsupported"), "error");
    }
  }, [addr, showToast, t]);

  const getToastClass = (variant: ToastVariant) => {
    switch (variant) {
      case "success":
        return "alert-success";
      case "warning":
        return "alert-warning";
      case "error":
        return "alert-error";
      default:
        return "alert-info";
    }
  };

  return (
    <main className="w-full bg-base-200 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10 max-w-[1000px]">
        {/* 📌 Toast (daisyUI) */}
        {toastOpen && (
          <div className="toast toast-top toast-center z-[9999] transition-opacity duration-300">
            <div className={`alert ${getToastClass(toastVariant)} shadow-lg`}>
              <span className="text-white font-medium">{toastMsg}</span>
            </div>
          </div>
        )}

        {/* 📌 헤더 및 오류 처리 섹션 */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              className="btn btn-ghost btn-circle text-base-content/80 hover:bg-base-300"
              aria-label={t("header.back")}
              title={t("header.back")}
              onClick={() => router.back()}
            >
              <ChevronLeft size={24} />
            </button>

            <h1 className="text-3xl font-extrabold text-base-content flex items-center gap-3">
              입금하기 <Wallet size={28} className="text-primary" />
            </h1>
          </div>

          {/* ✅ [수정됨] 네트워크 및 로딩/에러 상태 */}
          {/* relative: 자식요소(메시지)의 absolute 배치를 위한 기준점 */}
          {/* md:justify-center: 데스크탑에서 플로우에 남은 요소(네트워크)를 중앙 정렬 */}
          <div className="card bg-base-100 shadow-sm border border-base-300 p-4 min-h-[50px] relative flex flex-col md:flex-row items-center md:justify-center gap-3 md:gap-0">
            {/* 1. 로딩/에러/완료 메시지 */}
            {/* md:absolute md:right-6: 데스크탑에서 우측 끝으로 이동 (중앙 정렬 방해 안 함) */}
            {/* 모바일에서는 w-full로 꽉 차게 표시 */}
            <div className="flex items-center gap-3 w-full justify-center md:w-auto md:absolute md:right-6">
              {loading && !error && (
                <span className="loading loading-spinner loading-sm text-primary"></span>
              )}

              {error && (
                <div
                  role="alert"
                  className="flex alert alert-error py-1 min-h-0 text-sm text-white rounded-lg"
                >
                  <AlertTriangle size={16} /> <span>{error}</span>
                  <button
                    className="btn btn-sm btn-ghost text-white ml-3"
                    onClick={() => refresh()}
                    type="button"
                  >
                    {t("header.errorRetry")}
                  </button>
                </div>
              )}

              {!loading && !error && (
                <p className="text-base-content/70 text-sm font-medium text-center">
                  {t("address.label")} 발급 완료.
                </p>
              )}
            </div>

            {/* 2. 네트워크 배지 */}
            {/* 부모의 md:justify-center에 의해 데스크탑 중앙 정렬됨 */}
            <div className="badge badge-lg bg-info/20 text-info font-bold px-4 border-info/50 shadow-md whitespace-nowrap">
              {t("header.network", { name: networkName })}
            </div>
          </div>
        </section>

        {/* 📌 본문: QR 및 주소 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* [왼쪽] QR 및 주소 (7칸) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-6 md:p-10 items-center">
                {/* QR 코드 영역 */}
                <div className="rounded-2xl border-4 border-primary/50 bg-white p-4 shadow-2xl mb-4">
                  {qr ? (
                    <Image
                      src={qr}
                      alt={t("address.label")}
                      width={240}
                      height={240}
                      priority
                      className="h-[240px] w-[240px] transition-opacity duration-500"
                    />
                  ) : (
                    <div className="grid h-[240px] w-[240px] place-items-center text-base-content/50 bg-base-200 rounded-lg">
                      {addr ? (
                        qrLoading ? (
                          <span className="loading loading-spinner text-primary loading-lg"></span>
                        ) : (
                          <QrCode
                            size={60}
                            className="text-gray-400 opacity-60"
                          />
                        )
                      ) : loading ? (
                        t("qr.preparingAddr")
                      ) : (
                        t("qr.noAddr")
                      )}
                    </div>
                  )}
                </div>

                <p className="text-sm text-base-content/60 font-medium">
                  {t("qr.hint")}
                </p>

                {/* 주소 표시 및 복사 버튼 */}
                <div className="w-full mt-6">
                  <label className="block text-sm text-base-content font-bold mb-2">
                    {CURRENCY} {t("address.label")}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-base-300 bg-base-200 px-4 py-3">
                      <p className="font-mono text-sm text-base-content break-all select-all">
                        {addr || (loading ? t("qr.preparingAddr") : "-")}
                      </p>
                    </div>
                    {addr && (
                      <button
                        type="button"
                        className="btn btn-primary btn-md text-white shadow-md w-28 shrink-0"
                        onClick={copyAddr}
                      >
                        <Copy size={18} />
                        {t("address.copy")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* [오른쪽] 유의사항 및 히스토리 (5칸) */}
          <div className="lg:col-span-5 flex flex-col h-full space-y-6">
            <div className="alert bg-warning/10 border border-warning/50 shadow-sm flex items-start gap-4 text-base-content">
              <AlertTriangle className="text-warning mt-1 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-base-content mb-1">
                  입금 전 유의사항
                </h3>
                <ul className="text-sm text-base-content/70 list-disc list-inside space-y-1">
                  <li>
                    **네트워크 일치 확인:** 반드시 **{networkName}**과 동일한
                    네트워크를 사용해야 합니다. 네트워크 불일치 시 자산 손실이
                    발생할 수 있습니다.
                  </li>
                  <li>
                    **최소 금액:** 최소 입금액 **{MIN_DEPOSIT_AMOUNT} {CURRENCY}
                    ** 미만의 입금은 처리되지 않으며, 환불이 불가능합니다.
                  </li>
                  <li>
                    **처리 시간:** 입금 확인은 블록체인 컨펌 수에 따라 5분에서
                    30분 정도 소요될 수 있습니다.
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300 flex-grow flex flex-col">
              <div className="card-body p-0 flex flex-col h-full">
                <div className="p-6 border-b border-base-300 bg-base-200/30 shrink-0">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-base-content">
                    <History className="text-primary" size={20} />
                    {t("history.title")}
                  </h3>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {recentTxs.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-base-content/40 text-center">
                      {t("history.empty")}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {recentTxs.map((tx, index) => {
                        const ui = getTxStatusUi(tx.status);
                        const dateObj =
                          tx.createdAt instanceof Date
                            ? tx.createdAt
                            : new Date(tx.createdAt as string);

                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-base-200/50 p-3 rounded-lg border border-base-300 hover:shadow-md transition-shadow"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-base-content">
                                +{toNum(tx.amount)} {tx.tokenCode}
                              </span>
                              <span className="text-xs text-base-content/60 mt-0.5 flex items-center gap-1">
                                {ui.icon} {dateFormat(dateObj)}
                              </span>
                            </div>
                            <div
                              className={`badge ${ui.badge} text-white font-medium`}
                            >
                              {ui.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-base-300 bg-base-200/30 shrink-0">
                  <button
                    className="btn btn-ghost btn-sm text-base-content/60 hover:text-primary"
                    onClick={() => router.push("/history")}
                  >
                    전체 내역 조회
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
