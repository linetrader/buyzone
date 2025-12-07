"use client";

import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

export default function PasswordField(props: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  rules: {
    pwLenOk: boolean;
    pwHasLetter: boolean;
    pwHasDigit: boolean;
    pwHasUpper: boolean;
    pwHasSymbol: boolean;
  };
}) {
  const { value, onChange, loading, rules } = props;
  const t = useTranslations("auth.signup");

  return (
    <label className="form-control w-full">
      <div className="label pt-0 pb-1.5">
        <span className="label-text flex items-center gap-2 font-bold text-sm text-gray-700">
          <LockClosedIcon className="h-4 w-4" aria-hidden />
          {t("fields.password.label")}
        </span>
      </div>
      <input
        id="password"
        type="password"
        // ✅ 흰색 배경 스타일 적용
        className="input input-bordered w-full h-11 text-sm bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="영문, 숫자, 특수문자 포함 8자 이상" // ✅ 안내 문구 추가
        disabled={loading}
      />
      <ul className="mt-2 space-y-1 text-xs pl-1">
        <li className={rules.pwLenOk ? "text-gray-400" : "text-error"}>
          • {t("fields.password.rules.length")}
        </li>
        <li className={rules.pwHasLetter ? "text-gray-400" : "text-error"}>
          • {t("fields.password.rules.letter")}
        </li>
        <li className={rules.pwHasDigit ? "text-gray-400" : "text-error"}>
          • {t("fields.password.rules.digit")}
        </li>
        <li className={rules.pwHasUpper ? "text-gray-400" : "text-error"}>
          • {t("fields.password.rules.upper")}
        </li>
        <li className={rules.pwHasSymbol ? "text-gray-400" : "text-error"}>
          • {t("fields.password.rules.symbol")}
        </li>
      </ul>
    </label>
  );
}