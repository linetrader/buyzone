"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useHeaderMenu } from "./hooks/useHeaderMenu";
import type { MainHeaderProps } from "@/types/layout/header";

// 아이콘 임포트
import {
  Menu, User, LogOut, Bell, ChevronDown, Network, Users,
  Download, ClipboardList, Coins, UserPlus, Award, Building2, Key, Lock,
  LayoutGrid, BarChart3, ShieldCheck
} from "lucide-react";

const PURPLE_HEX = "#4F46E5";

export default function MainHeader({
  authed = false,
  userLevel = 0,
}: MainHeaderProps) {
  const t = useTranslations("common");
  const pathname = usePathname();
  const { handleLogout } = useHeaderMenu(authed, userLevel);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 모바일 details 닫기
      if (activeMenu && !target.closest("details")) {
        setActiveMenu(null);
      }
      // 데스크탑 dropdown 닫기 (포커스 해제)
      if (!target.closest(".dropdown")) {
        const dropdowns = document.querySelectorAll(".dropdown-content");
        dropdowns.forEach((el) => {
          (el as HTMLElement).blur(); // 포커스 해제로 닫기
        });
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeMenu]);

  // 헤더 숨김 처리
  if (pathname.includes("/auth/login") || pathname.includes("/auth/signup")) {
    return null;
  }

  // 메뉴 토글 함수 (모바일용)
  const toggleMenu = (menuName: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const navLinks = [
    { name: '대시보드', href: '/', icon: LayoutGrid },
    { name: '스테이킹', href: '/staking', icon: BarChart3 },
    { name: '공지사항', href: '/notice', icon: Bell },
    { name: '출금', href: '/withdraw', icon: Download },
  ];

  const getNavClass = (path: string) => {
    const baseClass = "btn btn-ghost text-[15px] font-bold px-3 xl:px-4 transition-all duration-200 flex items-center gap-2 h-10 min-h-0";
    if (pathname === path) {
      return `${baseClass} text-[#4F46E5] bg-[#4F46E5]/10`;
    }
    return `${baseClass} text-gray-600 hover:text-[#4F46E5] hover:bg-base-200`;
  };

  const menuItemClass = "flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-base-200 transition-all duration-200 text-sm font-medium text-gray-700";
  const mainIconSize = 20;
  const iconSize = 18;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur font-sans h-[70px] flex items-center shadow-sm">
      <div className="w-full max-w-[1700px] mx-auto px-4 lg:px-6 flex justify-between items-center h-full">
        
        {/* --- [왼쪽] 로고 --- */}
        <div className="navbar-start w-auto flex items-center shrink-0 mr-8">
          {/* 모바일 햄버거 메뉴 */}
          <div className="dropdown lg:hidden mr-2">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
              <Menu className="h-6 w-6" />
            </div>
            <ul tabIndex={0} className="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow-xl bg-white rounded-box w-72 text-base border border-gray-100">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`font-bold py-3 ${pathname === link.href ? 'text-[#4F46E5]' : 'text-gray-700'}`}>
                    <link.icon size={mainIconSize} color={PURPLE_HEX} /> {link.name}
                  </Link>
                </li>
              ))}
              <div className="divider my-1"></div>
              
              {/* 모바일 서브메뉴들 (details 사용) */}
              <li>
                <details open={mounted && activeMenu === 'mobile-org'}>
                  <summary onClick={toggleMenu('mobile-org')} className="font-bold py-3 text-gray-700">
                    <Network size={mainIconSize} color={PURPLE_HEX} /> 조직도
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li><Link href="/tree/referrer" className={menuItemClass}><Network size={iconSize} color={PURPLE_HEX} /> 추천 조직도</Link></li>
                    <li><Link href="/tree/sponser" className={menuItemClass}><Users size={iconSize} color={PURPLE_HEX} /> 후원 조직도</Link></li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mounted && activeMenu === 'mobile-withdraw'}>
                  <summary onClick={toggleMenu('mobile-withdraw')} className="font-bold py-3 text-gray-700">
                    <Download size={mainIconSize} color={PURPLE_HEX} /> 출금/내역
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li><Link href="/withdraw" className={menuItemClass}><Download size={iconSize} color={PURPLE_HEX} /> 출금</Link></li>
                    <li><Link href="/history" className={menuItemClass}><ClipboardList size={iconSize} color={PURPLE_HEX} /> 내역</Link></li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mounted && activeMenu === 'mobile-allowance'}>
                  <summary onClick={toggleMenu('mobile-allowance')} className="font-bold py-3 text-gray-700">
                    <Coins size={mainIconSize} color={PURPLE_HEX} /> 수당 내역
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li><Link href="/history/staking" className={menuItemClass}><Coins size={iconSize} color={PURPLE_HEX} /> 스테이킹</Link></li>
                    <li><Link href="/history/recommend" className={menuItemClass}><UserPlus size={iconSize} color={PURPLE_HEX} /> 추천</Link></li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mounted && activeMenu === 'mobile-mypage'}>
                  <summary onClick={toggleMenu('mobile-mypage')} className="font-bold py-3 text-gray-700">
                    <User size={mainIconSize} color={PURPLE_HEX} /> 마이페이지
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li><Link href="/account" className={menuItemClass}><User size={iconSize} color={PURPLE_HEX} /> 내 정보</Link></li>
                    <li><Link href="/account?tab=password" className={menuItemClass}><Lock size={iconSize} color={PURPLE_HEX} /> 비밀번호 변경</Link></li>
                    <li><Link href="/account?tab=pin" className={menuItemClass}><Key size={iconSize} color={PURPLE_HEX} /> PIN번호 변경</Link></li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>

          <Link href="/" className="btn btn-ghost p-0 hover:bg-transparent text-2xl lg:text-3xl font-extrabold text-[#4F46E5] tracking-tighter">
            BUYZONE
          </Link>
        </div>

        {/* --- [가운데] 메인 네비게이션 (데스크탑) --- */}
        <div className="navbar-center hidden lg:flex">
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={getNavClass(link.href)}>
                <link.icon size={20} color={PURPLE_HEX} className={pathname === link.href ? "stroke-[2.5px]" : ""} />
                {link.name}
              </Link>
            ))}

            <div className="w-[1px] h-6 bg-gray-300 mx-2 xl:mx-4"></div>

            <div className="flex items-center space-x-1">
              
              {/* 조직도 */}
              <div className="dropdown dropdown-hover group">
                <div role="button" className="btn btn-ghost text-[15px] font-medium px-3 text-gray-600 hover:text-gray-900 h-10 min-h-0 flex items-center gap-1 group-hover:bg-base-200">
                  조직도 <ChevronDown size={14} className="opacity-50 transition-transform group-hover:rotate-180" />
                </div>
                {/* ✅ [수정] mt-2 제거 */}
                <ul className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-xl w-52 border border-gray-100">
                  <li><Link href="/tree/referrer" className={menuItemClass}><Network size={iconSize} color={PURPLE_HEX} /> 추천 조직도</Link></li>
                  <li><Link href="/tree/sponser" className={menuItemClass}><Users size={iconSize} color={PURPLE_HEX} /> 후원 조직도</Link></li>
                </ul>
              </div>

              {/* 출금/내역 */}
              <div className="dropdown dropdown-hover group">
                <div role="button" className="btn btn-ghost text-[15px] font-medium px-3 text-gray-600 hover:text-gray-900 h-10 min-h-0 flex items-center gap-1 group-hover:bg-base-200">
                  출금/내역 <ChevronDown size={14} className="opacity-50 transition-transform group-hover:rotate-180" />
                </div>
                {/* ✅ [수정] mt-2 제거 */}
                <ul className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-xl w-52 border border-gray-100">
                  <li><Link href="/withdraw" className={menuItemClass}><Download size={iconSize} color={PURPLE_HEX} /> 출금</Link></li>
                  <li><Link href="/history" className={menuItemClass}><ClipboardList size={iconSize} color={PURPLE_HEX} /> 내역</Link></li>
                </ul>
              </div>

              {/* 수당 내역 */}
              <div className="dropdown dropdown-hover group">
                <div role="button" className="btn btn-ghost text-[15px] font-medium px-3 text-gray-600 hover:text-gray-900 h-10 min-h-0 flex items-center gap-1 group-hover:bg-base-200">
                  수당 내역 <ChevronDown size={14} className="opacity-50 transition-transform group-hover:rotate-180" />
                </div>
                {/* ✅ [수정] mt-2 제거 */}
                <ul className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-xl w-56 border border-gray-100">
                  <li><Link href="/history/staking" className={menuItemClass}><Coins size={iconSize} color={PURPLE_HEX} /> 스테이킹</Link></li>
                  <li><Link href="/history/recommend" className={menuItemClass}><UserPlus size={iconSize} color={PURPLE_HEX} /> 추천</Link></li>
                  <li><Link href="/history/matching" className={menuItemClass}><Users size={iconSize} color={PURPLE_HEX} /> 추천 매칭</Link></li>
                  <li><Link href="/history/rank" className={menuItemClass}><Award size={iconSize} color={PURPLE_HEX} /> 직급</Link></li>
                  <li><Link href="/history/center" className={menuItemClass}><Building2 size={iconSize} color={PURPLE_HEX} /> 센터</Link></li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* --- [오른쪽] 유저 액션 & 언어 설정 --- */}
        <div className="navbar-end w-auto flex items-center gap-3 lg:gap-4 ml-auto">
          
          <div className="scale-90 lg:scale-100">
            <LanguageSwitcher />
          </div>

          <button className="btn btn-ghost btn-circle btn-sm h-9 w-9 min-h-0 hover:bg-gray-100 relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {!authed ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn btn-sm h-9 min-h-0 px-4 font-bold text-gray-600 btn-ghost hover:bg-gray-100">
                {t("auth.login")}
              </Link>
              <Link href="/auth/signup" className="btn btn-sm h-9 min-h-0 px-5 bg-[#4F46E5] hover:bg-opacity-90 border-none font-bold text-white shadow-md hover:shadow-lg transition-all">
                {t("auth.signup")}
              </Link>
            </div>
          ) : (
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="cursor-pointer outline-none transition-transform active:scale-95 ml-1"
              >
                <div className="w-10 h-10 rounded-full bg-[#4F46E5] flex items-center justify-center text-white ring-2 ring-offset-2 ring-gray-100 shadow-sm hover:ring-[#4F46E5]/30 transition-all">
                  <User size={22} strokeWidth={2} />
                </div>
              </div>
              
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-xl w-60 border border-gray-100">
                {Number(userLevel) >= 21 && (
                  <li>
                    <Link href="/admin" className="py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                      <ShieldCheck size={16} className="mr-2 text-[#4F46E5]" /> {t("admin.title")}
                    </Link>
                  </li>
                )}

                <li><Link href="/account" className="py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center">
                    <User size={16} className="mr-2 text-gray-500" /> 내 정보
                  </Link></li>
                
                <div className="divider my-1"></div>
                
                <li>
                  <div className="py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <span>테마 설정</span>
                    <ThemeToggle size="sm" />
                  </div>
                </li>

                <div className="divider my-1"></div>
                
                <li>
                  <button onClick={handleLogout} className="py-2.5 px-4 font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center w-full text-left">
                    <LogOut size={16} className="mr-2" /> 로그아웃
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}