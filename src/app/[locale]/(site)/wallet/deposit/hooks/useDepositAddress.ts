// src/app/[locale]/(site)/wallet/deposit/hooks/useDepositAddress.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { RawDepositApiError } from "@/types/wallet";
import { useTranslations } from "next-intl";

// ✅ [추가] WalletTxItem 타입 (백엔드와 일치)
interface WalletTxItem {
  id: string;
  amount: string; // API에서 string으로 받음
  tokenCode: string;
  txHash: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | string; // 실제 Enum 값에 따라 조정 필요
  createdAt: string | Date; // API에서 문자열로 받을 수 있으므로 string | Date로 설정
}

// ✅ [수정] DepositAddressPayload 타입에 recentTxs 추가
export interface DepositAddressPayload {
  depositAddress: string;
  network: "BEP-20";
  recentTxs: WalletTxItem[]; // ✅ 트랜잭션 목록 추가
}

// RawDepositApiSuccess를 대신하는 확장된 타입 정의 (API 응답 구조와 일치)
interface RawDepositApiSuccessWithTxs {
  ok: true;
  depositAddress: string;
  provisioned: boolean;
  recentTxs: {
    id: string;
    amount: unknown; // number | string일 수 있음
    tokenCode: string;
    txHash: string | null;
    status: string;
    createdAt: string;
  }[]; // JSON 응답은 Date를 문자열로 포함
}

function isSuccessJson(v: unknown): v is RawDepositApiSuccessWithTxs {
  if (typeof v !== "object" || v === null) return false;
  const x = v as Record<string, unknown>;
  return (
    x.ok === true &&
    typeof x.depositAddress === "string" &&
    Array.isArray(x.recentTxs)
  );
}
function isErrorJson(v: unknown): v is RawDepositApiError {
  if (typeof v !== "object" || v === null) return false;
  const x = v as Record<string, unknown>;
  return (
    x.ok === false ||
    (typeof x.ok === "undefined" && typeof x.message === "string")
  );
}

export interface UseDepositAddressState {
  loading: boolean;
  error: string | null;
  payload: DepositAddressPayload | null;
}
export interface UseDepositAddressResult extends UseDepositAddressState {
  refresh: () => Promise<void>;
}

export function useDepositAddress(): UseDepositAddressResult {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("wallet.deposit");

  const [state, setState] = useState<UseDepositAddressState>({
    loading: true,
    error: null,
    payload: null,
  });

  const mountedRef = useRef<boolean>(false);
  const fetchedRef = useRef<boolean>(false);

  const fetchOnce = useCallback(async () => {
    if (fetchedRef.current) return;

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const r = await fetch("/api/wallet/deposit", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        credentials: "same-origin",
      });

      if (r.status === 401) {
        if (mountedRef.current) {
          router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      const txt = await r.text();
      let json: unknown = null;
      try {
        json = JSON.parse(txt);
      } catch {
        /* non-JSON body */
      }

      if (!r.ok) {
        const msg = (isErrorJson(json) && json.message) || `HTTP ${r.status}`; // 서버 메시지 우선
        throw new Error(msg);
      }

      if (!isSuccessJson(json)) {
        const msg =
          (isErrorJson(json) && json.message) || "Invalid response payload";
        throw new Error(msg);
      }

      fetchedRef.current = true;

      // ✅ [추가] 트랜잭션의 createdAt 문자열을 Date 객체로 변환
      const processedTxs = json.recentTxs.map((tx) => ({
        ...tx,
        // amount는 string으로 오기 때문에 그대로 사용, createdAt만 Date 객체로 변환
        createdAt: new Date(tx.createdAt as string),
      })) as WalletTxItem[];

      if (!mountedRef.current) return;
      setState({
        loading: false,
        error: null,
        payload: {
          depositAddress: json.depositAddress,
          network: "BEP-20",
          recentTxs: processedTxs, // ✅ 데이터 할당
        },
      });
    } catch (e) {
      if (!mountedRef.current) return;
      const msg =
        typeof e === "string"
          ? e
          : e instanceof Error
          ? e.message
          : t("header.preparing");
      setState({ loading: false, error: msg, payload: null });
    }
  }, [pathname, router, t]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOnce();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchOnce]);

  const refresh = useCallback(async () => {
    fetchedRef.current = false;
    await fetchOnce();
  }, [fetchOnce]);

  return { ...state, refresh };
}
