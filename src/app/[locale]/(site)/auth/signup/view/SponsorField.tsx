"use client";

import { UsersIcon } from "@heroicons/react/24/outline";

export type SponsorFieldProps = {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  status: null | "ok" | "fail";
  onSearch: () => void;
  submitted: boolean;
  isValid: boolean;
};

export default function SponsorField(props: SponsorFieldProps) {
  const { value, onChange, loading, status, onSearch, submitted, isValid } = props;
  const showRequiredError = submitted && !isValid;

  return (
    <div className="form-control w-full">
      {/* 라벨 영역 */}
      <div className="label pt-0 pb-1.5">
        <span className="label-text flex items-center gap-2 font-bold text-sm text-gray-700">
          <UsersIcon className="h-4 w-4" aria-hidden />
          후원인 <span className="text-error ml-1">*</span>
        </span>
      </div>

      {/* 입력창 + 검색 버튼 */}
      <div className="join w-full">
        <input
          id="sponsor"
          className="input input-bordered join-item w-full h-11 text-sm bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-all placeholder:text-gray-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="후원인 아이디를 입력하세요"
          disabled={loading}
          required
        />
        <button
          type="button"
          // ✅ 검색 버튼: 보라색 배경으로 강조
          className="btn btn-primary join-item h-11 px-6 bg-[#4F46E5] hover:bg-[#4338ca] border-none text-white font-bold"
          onClick={onSearch}
          disabled={loading || value.trim().length === 0}
        >
          검색
        </button>
      </div>

      {/* ✅ [수정 핵심] 메시지 영역 높이 고정 (min-h-[24px]) */}
      <div className="min-h-[24px] mt-1 pl-1 flex items-start">
        <span className="text-xs font-medium">
          {showRequiredError ? (
            <span className="text-error">후원인을 입력해주세요.</span>
          ) : status === "ok" ? (
            <span className="text-success">확인되었습니다.</span>
          ) : status === "fail" ? (
            <span className="text-error">존재하지 않는 사용자입니다.</span>
          ) : (
            <span className="opacity-0">Message Space</span>
          )}
        </span>
      </div>
    </div>
  );
}