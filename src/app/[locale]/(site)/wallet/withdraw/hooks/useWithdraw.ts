// src/app/[locale]/(site)/wallet/withdraw/hooks/useWithdraw.ts
"use client";

import type { Balances, TokenSymbol } from "@/types/common";
// import type { WithdrawResponse } from "@/types/wallet"; // ⚠️ 타입이 정의되어 있지 않아 가정합니다.
import { useCallback, useRef, useState } from "react";
import { useToast } from "@/components/ui/feedback/Toast-provider";
import { useTranslations } from "next-intl";

// 💡 [가정] WithdrawResponse 타입 재구성 (오류를 해결하기 위해 성공 응답 타입을 명확히 함)
interface WithdrawSuccessResponse {
  ok: true;
  tx: any;
  balances: { USDT: unknown; QAI: unknown; DFT: unknown }; // 서버에서 string으로 올 수 있으므로 unknown으로 설정
}
interface WithdrawErrorResponse {
  ok: false;
  code: string;
  message?: string;
}
type WithdrawResponse = WithdrawSuccessResponse | WithdrawErrorResponse; // useWithdraw 내부에서만 사용

export interface UseWithdrawResult {
  submitting: boolean;
  submit: (
    token: TokenSymbol, // USDT로 고정
    amount: number,
    otpCode: string // ✅ [수정 1] OTP 코드를 인자로 추가
  ) => Promise<{
    ok: boolean;
    message: string;
    nextBalances?: { USDT: number };
  }>;
}

// 💡 [추가] numberOr 함수 정의 (안전한 숫자 변환)
function numberOr(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function useWithdraw(): UseWithdrawResult {
  const { toast } = useToast();
  const t = useTranslations("wallet.withdraw");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const inFlightRef = useRef<boolean>(false);

  const submit = useCallback(
    // ✅ [수정 2] otpCode 인자 추가
    async (token: TokenSymbol, amount: number, otpCode: string) => {
      if (inFlightRef.current) {
        const message = t("toast.processing");
        toast({
          title: t("loading.title"),
          description: message,
          variant: "warning",
          position: "top-right",
          duration: 1600,
          closable: true,
        });
        return { ok: false, message };
      }
      inFlightRef.current = true;
      setSubmitting(true);

      if (token !== "USDT") {
        return { ok: false, message: "Only USDT withdrawal is supported." };
      }

      try {
        const r = await fetch("/api/wallet/withdraw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "same-origin",
          // ✅ [수정 3] body에 otpCode 추가
          body: JSON.stringify({ token: "USDT", amount, otpCode }),
        });

        const text = await r.text();
        let json: WithdrawResponse | null = null;
        try {
          // JSON.parse 결과를 WithdrawResponse로 캐스팅
          json = text ? (JSON.parse(text) as WithdrawResponse) : null;
        } catch {
          json = null;
        }

        if (!r.ok || !json || json.ok !== true) {
          // 응답이 성공(ok: true)이 아닌 경우
          const errorJson = json as WithdrawErrorResponse | null;

          const code =
            (errorJson && "code" in errorJson ? errorJson.code : undefined) ||
            undefined;
          const message =
            (errorJson && "message" in errorJson
              ? errorJson.message
              : undefined) ||
            (code === "NO_WITHDRAW_ADDRESS"
              ? "No withdraw address"
              : code === "INSUFFICIENT_BALANCE"
              ? "Insufficient balance"
              : code === "INVALID_AMOUNT"
              ? "Invalid amount"
              : code === "INVALID_OTP" // 💡 [OTP 에러 코드 처리]
              ? "Invalid Google OTP code."
              : code === "OTP_NOT_ENABLED" // 💡 [OTP 에러 코드 처리]
              ? "Google OTP is not enabled for this account."
              : t("toast.withdrawFailTitle"));

          toast({
            title: t("toast.withdrawFailTitle"),
            description: message,
            variant: "error",
            position: "top-right",
            duration: 2200,
            closable: true,
          });
          return { ok: false, message };
        }

        // 응답이 성공(ok: true)인 경우, successJson으로 타입 좁히기
        const successJson = json as WithdrawSuccessResponse;

        // ✅ [수정 4] nextBalances가 안전하게 할당되도록 numberOr 사용
        const nextBalances: { USDT: number } = {
          // successJson.balances.USDT의 타입이 string일 가능성을 감안하여 numberOr 사용
          USDT: numberOr(successJson.balances?.USDT, 0),
        };

        const message = t("toast.withdrawOkDesc");
        toast({
          title: t("toast.withdrawOkTitle"),
          description: message,
          variant: "success",
          position: "top-right",
          duration: 2000,
          closable: true,
        });
        return {
          ok: true,
          message,
          nextBalances,
        };
      } catch {
        const message = t("toast.networkErrorTitle");
        toast({
          title: t("toast.networkErrorTitle"),
          description: message,
          variant: "error",
          position: "top-right",
          duration: 2200,
          closable: true,
        });
        return { ok: false, message };
      } finally {
        inFlightRef.current = false;
        setSubmitting(false);
      }
    },
    [toast, t]
  );

  return { submitting, submit } as const;
}
