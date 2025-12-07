// src/app/[locale]/(site)/auth/signup/hooks/useSignup.ts

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
//import { useTranslations } from "next-intl";
import type {
  ApiErrCode,
  ApiRes,
  FormState,
  RefStatusUI,
  ResolveUserResponse,
  SubmitResult,
} from "@/types/auth";

export function useSignup() {
  // const t = useTranslations("auth.signup");
  const searchParams = useSearchParams();

  // 1. 폼 상태
  const [f, setF] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    password2: "",
    name: "",
    referrer: "",
    sponsor: "",
    countryCode: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [refStatus, setRefStatus] = useState<RefStatusUI>(null);
  const [sponsorStatus, setSponsorStatus] = useState<RefStatusUI>(null);

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [serverUsernameError, setServerUsernameError] = useState<
    string | undefined
  >();
  const [serverEmailError, setServerEmailError] = useState<
    string | undefined
  >();
  const [serverGeneralError, setServerGeneralError] = useState<
    string | undefined
  >();
  const [serverCountryError, setServerCountryError] = useState<
    string | undefined
  >();

  // URL ?ref= 프리필
  useEffect(() => {
    const fromUrl = (searchParams.get("ref") || "").trim();
    if (!fromUrl) return;
    setF((prev) => (prev.referrer ? prev : { ...prev, referrer: fromUrl }));
    setRefStatus(fromUrl.length >= 3 ? "ok" : "fail");
  }, [searchParams]);

  // --- 검증 로직 ---
  const usernameOk = useMemo(
    () => /^[a-z0-9_]{4,16}$/.test(f.username),
    [f.username]
  );

  const pwLenOk = f.password.length >= 8 && f.password.length <= 18;
  const pwHasLetter = /[A-Za-z]/.test(f.password);
  const pwHasDigit = /\d/.test(f.password);
  const pwHasUpper = /[A-Z]/.test(f.password);
  const pwHasSymbol = /[^A-Za-z0-9]/.test(f.password);
  const pwAllOk =
    pwLenOk && pwHasLetter && pwHasDigit && pwHasUpper && pwHasSymbol;

  const emailOk = useMemo(() => {
    if (!f.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  }, [f.email]);

  const nameOk = f.name.trim().length > 0;
  const confirmOk = f.password2.length > 0 && f.password === f.password2;
  const countryCodeOk =
    f.countryCode.trim() === "" ||
    (/^[A-Za-z]{2}$/.test(f.countryCode.trim()) && true);

  const referrerOk = f.referrer.trim().length > 0;
  const sponsorOk = f.sponsor.trim().length > 0;
  const agreementsOk = f.agreeTerms && f.agreePrivacy;

  // 전체 폼 유효성 검사
  const formValid =
    usernameOk &&
    emailOk &&
    pwAllOk &&
    confirmOk &&
    nameOk &&
    agreementsOk &&
    countryCodeOk &&
    referrerOk &&
    sponsorOk;

  function setField<K extends keyof FormState>(
    key: K,
    val: FormState[K]
  ): void {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  function resetServerErrors(): void {
    setServerUsernameError(undefined);
    setServerEmailError(undefined);
    setServerGeneralError(undefined);
    setServerCountryError(undefined);
  }

  // 사용자 확인 API
  async function verifyUser(input: string): Promise<boolean> {
    const q = input.trim();
    if (!q) return false;
    const res = await fetch(
      `/api/auth/resolve-user?q=${encodeURIComponent(q)}`,
      { method: "GET" }
    );
    if (!res.ok) return false;
    const data = (await res
      .json()
      .catch(() => null)) as ResolveUserResponse | null;
    return !!(data && data.ok && "user" in data && data.user);
  }

  async function searchReferrer(): Promise<void> {
    setRefStatus(null);
    const ok = await verifyUser(f.referrer);
    setRefStatus(ok ? "ok" : "fail");
  }

  async function searchSponsor(): Promise<void> {
    setSponsorStatus(null);
    const ok = await verifyUser(f.sponsor);
    setSponsorStatus(ok ? "ok" : "fail");
  }

  // 제출
  async function submit(): Promise<SubmitResult> {
    setSubmitted(true);
    resetServerErrors();

    if (!formValid || loading) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "입력값이 올바르지 않습니다.",
      };
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: f.username,
          email: f.email,
          password: f.password,
          name: f.name,
          referrer: f.referrer.trim(),
          sponsor: f.sponsor.trim(),
          countryCode: f.countryCode ? f.countryCode : null,
          agreeTerms: f.agreeTerms,
          agreePrivacy: f.agreePrivacy,
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiRes | null;

      if (res.ok && data && data.ok) {
        return { ok: true };
      }

      // 에러 매핑
      let code: ApiErrCode = "UNKNOWN";
      let message: string | undefined = "서버 오류가 발생했습니다.";

      if (data && !data.ok) {
        code = data.code;
        message = data.message;
      } else if (res.status === 400) {
        code = "VALIDATION_ERROR";
      }

      switch (code) {
        case "USERNAME_TAKEN":
          setServerUsernameError("이미 사용 중인 아이디입니다.");
          break;
        case "EMAIL_TAKEN":
          setServerEmailError("이미 사용 중인 이메일입니다.");
          break;
        case "REFERRER_REQUIRED":
          setServerGeneralError("추천인은 필수 입력입니다.");
          break;
        case "SPONSOR_REQUIRED":
          setServerGeneralError("후원인은 필수 입력입니다.");
          break;
        case "REFERRER_NOT_FOUND":
          setServerGeneralError("추천인을 찾을 수 없습니다.");
          break;
        case "SPONSOR_NOT_FOUND":
          setServerGeneralError("후원인을 찾을 수 없습니다.");
          break;
        case "SPONSOR_CHILD_LIMIT_REACHED":
          setServerGeneralError(
            "해당 후원인은 이미 직대 2명이 있어 가입할 수 없습니다."
          );
          break;
        case "COUNTRY_CODE_INVALID":
          setServerCountryError("국가 코드가 올바르지 않습니다.");
          break;
        case "COUNTRY_NOT_FOUND":
          setServerCountryError("지원하지 않는 국가입니다.");
          break;
        case "INVALID_REQUESTED_GROUP_NO":
          setServerGeneralError("그룹 번호가 올바르지 않습니다.");
          break;
        case "VALIDATION_ERROR":
          setServerGeneralError("입력값이 올바르지 않습니다.");
          break;
        default:
          setServerGeneralError("서버 오류가 발생했습니다.");
      }

      return { ok: false, code, message };
    } finally {
      setLoading(false);
    }
  }

  return {
    f,
    refStatus,
    sponsorStatus,
    submitted,
    loading,
    serverUsernameError,
    serverEmailError,
    serverGeneralError,
    serverCountryError,
    // 파생값
    usernameOk,
    pwLenOk,
    pwHasLetter,
    pwHasDigit,
    pwHasUpper,
    pwHasSymbol,
    pwAllOk,
    emailOk,
    nameOk,
    confirmOk,
    countryCodeOk,
    agreementsOk,
    formValid,
    referrerOk,
    sponsorOk,
    // 액션
    setField,
    setSubmitted,
    searchReferrer,
    searchSponsor,
    submit,
    resetServerErrors,
  } as const;
}
