"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AgreementsGroupProps {
  agreeTerms: boolean;
  agreePrivacy: boolean;
  onChangeTerms: (v: boolean) => void;
  onChangePrivacy: (v: boolean) => void;
  loading: boolean;
  submitted: boolean;
  agreementsOk: boolean;
}

export default function AgreementsGroup(props: AgreementsGroupProps) {
  const {
    agreeTerms,
    agreePrivacy,
    onChangeTerms,
    onChangePrivacy,
    loading,
    submitted,
    agreementsOk,
  } = props;

  const t = useTranslations("auth.signup");
  const showRequiredError = submitted && !agreementsOk;

  // ✅ 모달(팝업) 상태 관리
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      
      {/* 1. 이용약관 동의 체크박스 */}
      <div className="flex items-center justify-between">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            // 흰색 배경에 어울리는 체크박스 스타일
            className="checkbox checkbox-primary w-5 h-5 rounded border-gray-300"
            checked={agreeTerms}
            onChange={(e) => onChangeTerms(e.target.checked)}
            disabled={loading}
          />
          <span className="label-text text-sm font-medium text-gray-700">
            {t("agreements.terms.label") || "이용약관 동의 (필수)"}
          </span>
        </label>
        {/* 보기 버튼 (링크 대신 모달 오픈) */}
        <button
          type="button"
          onClick={() => setShowTermsModal(true)}
          className="text-xs text-gray-500 underline hover:text-[#4F46E5] transition-colors"
        >
          {t("agreements.view") || "보기"}
        </button>
      </div>

      {/* 2. 개인정보 처리방침 동의 체크박스 */}
      <div className="flex items-center justify-between">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary w-5 h-5 rounded border-gray-300"
            checked={agreePrivacy}
            onChange={(e) => onChangePrivacy(e.target.checked)}
            disabled={loading}
          />
          <span className="label-text text-sm font-medium text-gray-700">
            {t("agreements.privacy.label") || "개인정보 수집 및 이용 동의 (필수)"}
          </span>
        </label>
        {/* 보기 버튼 */}
        <button
          type="button"
          onClick={() => setShowPrivacyModal(true)}
          className="text-xs text-gray-500 underline hover:text-[#4F46E5] transition-colors"
        >
          {t("agreements.view") || "보기"}
        </button>
      </div>

      {/* 에러 메시지 */}
      {showRequiredError && (
        <p className="text-xs text-error mt-1 font-medium">
          {t("validation.agreementsRequired") || "모든 필수 약관에 동의해주세요."}
        </p>
      )}

      {/* ======================================================== */}
      {/* ✅ 이용약관 모달 팝업 */}
      {/* ======================================================== */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 오버레이 (클릭 시 닫힘) */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowTermsModal(false)}
          ></div>
          
          {/* 모달 컨텐츠 */}
          <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">이용약관</h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
              <p><strong>제 1 조 (목적)</strong><br/>이 약관은 회사가 제공하는 서비스의 이용조건 및 절차 등을 규정합니다.</p>
              {/* ✅ [수정] 119라인: "회원" 인용 부호를 &quot;로 이스케이프 처리 */}
              <p><strong>제 2 조 (용어의 정의)</strong><br/>&quot;회원&quot;이라 함은 회사와 이용계약을 체결하고 서비스를 이용하는 자를 말합니다.</p>
              <p>(여기에 실제 이용약관 내용을 입력해주세요.)</p>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button 
                className="btn btn-md bg-[#4F46E5] border-none text-white hover:bg-[#4338ca] px-6 rounded-xl font-bold"
                onClick={() => {
                  onChangeTerms(true); // 동의 처리
                  setShowTermsModal(false);
                }}
              >
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ✅ 개인정보 처리방침 모달 팝업 */}
      {/* ======================================================== */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowPrivacyModal(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">개인정보 처리방침</h3>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
              <p><strong>1. 수집하는 개인정보 항목</strong><br/>이름, 아이디, 비밀번호, 이메일, 휴대전화번호 등.</p>
              <p><strong>2. 개인정보의 수집 및 이용목적</strong><br/>회원가입 및 관리, 서비스 제공 등.</p>
              <p>(여기에 실제 개인정보 처리방침 내용을 입력해주세요.)</p>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button 
                className="btn btn-md bg-[#4F46E5] border-none text-white hover:bg-[#4338ca] px-6 rounded-xl font-bold"
                onClick={() => {
                  onChangePrivacy(true); // 동의 처리
                  setShowPrivacyModal(false);
                }}
              >
                동의하고 닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}