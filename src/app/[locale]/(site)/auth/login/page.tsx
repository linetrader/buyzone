"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/routing";
import { UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useLogin } from "./hooks/useLogin";
import { useToast } from "@/components/ui/feedback/Toast-provider";

type QueryObject = Record<string, string>;

function splitPathAndQuery(next: string): {
  pathname: string;
  query: QueryObject;
} {
  const i = next.indexOf("?");
  if (i < 0) return { pathname: next, query: {} };
  const pathname = next.slice(0, i);
  const sp = new URLSearchParams(next.slice(i + 1));
  const query: QueryObject = {};
  sp.forEach((v, k) => {
    query[k] = v;
  });
  return { pathname, query };
}

export default function Login() {
  const router = useRouter();
  const locale = useLocale();
  const { toast } = useToast();
  const t = useTranslations("auth");

  const {
    username,
    pwd,
    submitted,
    busy,
    usernameOk,
    formValid,
    setUsername,
    setPwd,
    setSubmitted,
    submit,
  } = useLogin();

  const usernameErrText = useMemo<string | undefined>(
    () =>
      submitted && !usernameOk ? t("validation.usernameInvalid") : undefined,
    [submitted, usernameOk, t]
  );

  const pwdErrText = useMemo<string | undefined>(
    () =>
      submitted && pwd.length === 0
        ? t("validation.passwordRequired")
        : undefined,
    [submitted, pwd.length, t]
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const res = await submit();

    if (res.ok) {
      toast({
        title: t("toast.success.title"),
        description: t("toast.success.desc"),
        variant: "success",
        position: "top-right",
        duration: 1600,
        closable: true,
      });

      const params = new URLSearchParams(window.location.search);
      const rawNext = params.get("next") ?? "/";
      const { pathname, query } = splitPathAndQuery(rawNext);

      router.replace({ pathname, query }, { locale });
      router.refresh();
      return;
    }

    const msg =
      typeof res.message === "string"
        ? res.message
        : res.code === "INVALID_CREDENTIALS"
        ? t("errors.invalidCredentials")
        : res.code === "VALIDATION_ERROR"
        ? t("errors.validation")
        : t("errors.server");

    toast({
      title: t("toast.error.title"),
      description: msg,
      variant: "error",
      position: "top-right",
      duration: 2400,
      closable: true,
    });
  }

  return (
    // ✅ 배경 컨테이너
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/buylogin.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* ✅ 3단 레이아웃 컨테이너 */}
      <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col lg:flex-row items-center justify-between gap-10 px-6 lg:px-12 py-12 lg:py-0">
        
        {/* 1. [왼쪽] BUYZONE 로고 */}
        <div className="flex-1 flex justify-center lg:justify-start items-center animate-in slide-in-from-left duration-700">
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl text-center lg:text-left">
            BUYZONE
          </h1>
        </div>

        {/* 2. [중앙] 로그인 카드 */}
        <div className="flex-none w-full max-w-[420px] flex flex-col justify-center shrink-0 animate-in zoom-in duration-500 mx-auto">
          <div className="card bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-200">
            <div className="card-body p-8 md:p-10">
              <h2 className="card-title justify-center text-2xl font-extrabold mb-6 text-gray-900">{t("title")}</h2>

              <form onSubmit={onSubmit} className="space-y-5" aria-busy={busy}>
                
                {/* 아이디 입력 영역 */}
                <div className="form-control w-full">
                  <label className="label pt-0 pb-1.5" htmlFor="login-username">
                    <span className="label-text flex items-center gap-2 font-bold text-sm text-gray-700">
                      <UserIcon className="h-4 w-4" aria-hidden />
                      {t("fields.username.label")}
                    </span>
                  </label>
                  <input
                    id="login-username"
                    className={`input input-bordered w-full h-11 text-sm bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-xl transition-all ${
                      usernameErrText ? "input-error border-error" : ""
                    }`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder={t("fields.username.placeholder")}
                  />
                  {/* ✅ [수정] 에러 메시지 공간 미리 확보 (min-h-[24px]) */}
                  <div className="min-h-[24px] pt-1 pl-1">
                    <span className="text-xs font-medium text-error">
                      {usernameErrText || ""}
                    </span>
                  </div>
                </div>

                {/* 비밀번호 입력 영역 */}
                <div className="form-control w-full">
                  <label className="label pt-0 pb-1.5" htmlFor="login-password">
                    <span className="label-text flex items-center gap-2 font-bold text-sm text-gray-700">
                      <LockClosedIcon className="h-4 w-4" aria-hidden />
                      {t("fields.password.label")}
                    </span>
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className={`input input-bordered w-full h-11 text-sm bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] rounded-xl transition-all ${
                      pwdErrText ? "input-error border-error" : ""
                    }`}
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder={t("fields.password.placeholder")}
                    autoComplete="current-password"
                  />
                  {/* ✅ [수정] 에러 메시지 공간 미리 확보 (min-h-[24px]) */}
                  <div className="min-h-[24px] pt-1 pl-1">
                    <span className="text-xs font-medium text-error">
                      {pwdErrText || ""}
                    </span>
                  </div>
                </div>

                {/* 버튼 영역 */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary h-11 w-full rounded-xl font-bold shadow-lg border-none bg-[#4F46E5] hover:bg-[#4338ca] text-white transition-transform active:scale-[0.98]"
                    disabled={busy || (submitted && !formValid)}
                    onClick={() => setSubmitted(true)}
                  >
                    {busy ? <span className="loading loading-spinner"></span> : t("button.login")}
                  </button>

                  <Link
                    href="/auth/signup"
                    className="btn h-11 w-full rounded-xl font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#4F46E5] hover:border-[#4F46E5] transition-colors"
                  >
                    회원가입
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 3. [오른쪽] 설명 텍스트 영역 */}
        <div className="flex-1 flex justify-center lg:justify-end items-center text-center lg:text-right animate-in slide-in-from-right duration-700">
          <div className="text-white max-w-md space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-white/95 drop-shadow-md">
              Smart Earnings.<br/>
              Safe Withdrawals.<br/>
              Trusted BUYZONE.
            </h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed">
              From daily rewards to major payouts, our secure system lets you earn and withdraw seamlessly anytime, anywhere with trusted BUYZONE.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}