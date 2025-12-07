"use client";

import { useSignup } from "./hooks/useSignup";
import SignupView from "./view/SignupView";

export default function SignupPage() {
  const signupLogic = useSignup();

  return (
    // ✅ 배경 컨테이너
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/buylogin.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* ✅ 메인 레이아웃: Grid 시스템 적용 (좌/중/우 1:1:1 비율) */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20 pt-12 lg:pt-24 min-h-full items-start">
          
          {/* 1. [왼쪽] BUYZONE 로고 */}
          <div className="flex justify-center lg:justify-start animate-in slide-in-from-left duration-700">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl text-center lg:text-left">
              BUYZONE
            </h1>
          </div>

          {/* 2. [중앙] 회원가입 카드 (Grid의 가운데 컬럼에 위치하여 무조건 정중앙) */}
          <div className="flex justify-center animate-in zoom-in duration-500 w-full">
            <div className="w-full max-w-[500px]">
              <SignupView {...signupLogic} />
            </div>
          </div>

          {/* 3. [오른쪽] 설명 텍스트 */}
          <div className="flex flex-col items-center lg:items-end text-center lg:text-right animate-in slide-in-from-right duration-700">
            {/* max-w-none으로 변경하여 너비 제한 해제, 텍스트가 잘리지 않게 함 */}
            <div className="text-white max-w-none space-y-4">
              {/* ✅ 텍스트 크기 조정: text-4xl -> text-2xl lg:text-3xl (줄바꿈 방지) */}
              <h2 className="text-2xl lg:text-3xl font-bold leading-tight text-white/95 drop-shadow-md whitespace-nowrap">
                Smart Earnings.<br />
                Safe Withdrawals.<br />
                Trusted BUYZONE.
              </h2>
              <p className="text-base lg:text-lg text-white/80 font-medium leading-relaxed max-w-sm ml-auto">
                From daily rewards to major payouts, our secure system lets you earn and withdraw seamlessly anytime, anywhere with trusted BUYZONE.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}