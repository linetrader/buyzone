"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useToast } from "@/components/ui/feedback/Toast-provider"; 
import type { useSignup } from "../hooks/useSignup";

// 컴포넌트 임포트
import ReferrerField from "./ReferrerField";
import SponsorField from "./SponsorField";
import UsernameField from "./UsernameField";
import EmailField from "./EmailField";
import NameField from "./NameField";
import PasswordField from "./PasswordField";
import PasswordConfirmField from "./PasswordConfirmField";
import CountrySelect from "./CountrySelect";
import AgreementsGroup from "./AgreementsGroup";
import SubmitButton from "./SubmitButton";

type SignupViewProps = ReturnType<typeof useSignup>;

export default function SignupView(props: SignupViewProps) {
  const t = useTranslations("auth.signup");
  const router = useRouter();
  const { toast } = useToast(); 

  const {
    f, refStatus, sponsorStatus, submitted, loading,
    serverUsernameError, serverEmailError, serverGeneralError, serverCountryError,
    // ✅ pwAllOk 추가 (비밀번호 검증용)
    usernameOk, pwLenOk, pwHasLetter, pwHasDigit, pwHasUpper, pwHasSymbol, pwAllOk,
    emailOk, nameOk, confirmOk, countryCodeOk, agreementsOk, formValid, referrerOk, sponsorOk,
    setField, setSubmitted, searchReferrer, searchSponsor, submit,
  } = props;

  const passwordRules = { pwLenOk, pwHasLetter, pwHasDigit, pwHasUpper, pwHasSymbol };

  // 🔴 오류 필드 스크롤 함수
  const scrollToFirstError = () => {
    // 검사 순서 (위에서부터 아래로)
    const fields = [
      { id: "username", ok: usernameOk },
      { id: "email", ok: emailOk },
      { id: "password", ok: pwAllOk },     // 비밀번호 전체 규칙
      { id: "password2", ok: confirmOk },  // 비밀번호 확인
      { id: "name", ok: nameOk },
      { id: "countryCode", ok: countryCodeOk },
      { id: "ref", ok: referrerOk },
      { id: "sponsor", ok: sponsorOk },
      { id: "agreements", ok: agreementsOk },
    ];

    for (const field of fields) {
      if (!field.ok) {
        const element = document.getElementById(field.id);
        if (element) {
          // 화면 중앙으로 부드럽게 스크롤
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // 입력창이면 커서 포커스
          if (element.tagName === "INPUT" || element.tagName === "SELECT") {
            element.focus();
          }
          return; // 첫 번째 에러만 찾고 종료
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await submit();

    if (res.ok) {
      toast({
        title: "회원가입 완료",
        description: "회원가입이 정상적으로 완료되었습니다. 로그인 페이지로 이동합니다.",
        variant: "success",
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } else {
      // ✅ [핵심 수정] 0.1초 뒤에 스크롤 실행 (React 렌더링 완료 대기)
      setTimeout(() => {
        scrollToFirstError();

        // 서버 에러인 경우 해당 필드로 포커스 (중복 에러 등)
        if (res.code === "USERNAME_TAKEN") document.getElementById("username")?.focus();
        if (res.code === "EMAIL_TAKEN") document.getElementById("email")?.focus();
      }, 100);
    }
  };

  return (
    <div className="card bg-white shadow-2xl rounded-3xl border border-gray-200 w-full">
      <div className="card-body p-8">
        <h2 className="card-title justify-center text-3xl font-extrabold mb-6 text-gray-900">
          {t("title") || "회원가입"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. 계정 정보 */}
          <div className="space-y-3">
            <UsernameField
              value={f.username} onChange={(v) => setField("username", v)}
              loading={loading} submitted={submitted} usernameOk={usernameOk}
              serverError={serverUsernameError}
            />
            <EmailField
              value={f.email} onChange={(v) => setField("email", v)}
              loading={loading} submitted={submitted} emailOk={emailOk}
              serverError={serverEmailError}
            />
            <PasswordField
              value={f.password} onChange={(v) => setField("password", v)}
              loading={loading} rules={passwordRules}
            />
            <PasswordConfirmField
              value={f.password2} onChange={(v) => setField("password2", v)}
              loading={loading} submitted={submitted} confirmOk={confirmOk}
            />
          </div>

          <div className="divider my-2"></div>

          {/* 2. 개인 정보 */}
          <div className="space-y-3">
            <NameField
              value={f.name} onChange={(v) => setField("name", v)}
              loading={loading} submitted={submitted} nameOk={nameOk}
            />
            <CountrySelect
              value={f.countryCode} onChange={(v) => setField("countryCode", v)}
              loading={loading} submitted={submitted}
              countryCodeOk={countryCodeOk as boolean} serverError={serverCountryError}
            />
          </div>

          <div className="divider my-2"></div>

          {/* 3. 추천인 & 후원인 */}
          <div className="space-y-3">
            <ReferrerField
              value={f.referrer} onChange={(v) => setField("referrer", v)}
              loading={loading} refStatus={refStatus} onSearch={searchReferrer}
              submitted={submitted} referrerOk={referrerOk}
            />
            <SponsorField
              value={f.sponsor} onChange={(v) => setField("sponsor", v)}
              loading={loading} status={sponsorStatus} onSearch={searchSponsor}
              submitted={submitted} isValid={sponsorOk}
            />
          </div>

          <div className="divider my-2"></div>

          {/* 4. 약관 동의 (ID: agreements) */}
          <div id="agreements" className="text-gray-700">
            <AgreementsGroup
              agreeTerms={f.agreeTerms} agreePrivacy={f.agreePrivacy}
              onChangeTerms={(v) => setField("agreeTerms", v)}
              onChangePrivacy={(v) => setField("agreePrivacy", v)}
              loading={loading} submitted={submitted} agreementsOk={agreementsOk}
            />
          </div>

          {/* 서버 에러 표시 */}
          {serverGeneralError && (
            <div className="alert alert-error text-sm py-2 rounded-lg font-bold text-white">
              <span>{serverGeneralError}</span>
            </div>
          )}

          {/* 5. 제출 버튼 */}
          <div className="pt-4 flex flex-col gap-3">
            <SubmitButton
              loading={loading} submitted={submitted} formValid={formValid}
              onMarkSubmitted={() => setSubmitted(true)}
            />
            <div className="text-center text-sm text-gray-500 mt-2">
              이미 계정이 있으신가요?{" "}
              <Link href="/auth/login" className="text-[#4F46E5] font-bold hover:underline ml-1">
                로그인
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}