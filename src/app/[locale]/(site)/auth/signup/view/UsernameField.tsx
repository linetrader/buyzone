"use client";

import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export default function UsernameField(props: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  submitted: boolean;
  usernameOk: boolean;
  serverError?: string;
}) {
  const { value, onChange, loading, submitted, usernameOk, serverError } = props;
  const hasError = (submitted && !usernameOk) || !!serverError;
  const t = useTranslations("auth.signup");

  return (
    <div className="form-control w-full">
      <label className="label pt-0 pb-1.5" htmlFor="username">
        <span className="label-text flex items-center gap-2 font-bold text-sm text-gray-700">
          <UserPlusIcon className="h-4 w-4" aria-hidden />
          {t("fields.username.label")}
        </span>
      </label>
      <input
        id="username"
        className={`input input-bordered w-full h-11 text-sm bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all ${
          hasError ? "input-error border-error" : ""
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="username"
        placeholder="영문 소문자/숫자 4~16자"
        disabled={loading}
      />
      
      {/* ✅ [수정] 에러 메시지 공간 미리 확보 (min-h-[24px]) */}
      {/* 메시지가 없어도 공간을 유지하여 아래 요소가 밀리지 않음 */}
      <div className="min-h-[24px] pt-1 pl-1">
        <span className="text-xs font-medium text-error">
          {serverError || (submitted && !usernameOk ? t("validation.usernameInvalid") : "")}
        </span>
      </div>
    </div>
  );
}