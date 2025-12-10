"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useHeaderMenu } from "./hooks/useHeaderMenu";
import type { MainHeaderProps } from "@/types/layout/header";

// 아이콘 임포트
import {
  Menu,
  User,
  LogOut,
  Bell,
  ChevronDown,
  Network,
  Users,
  Download,
  ClipboardList,
  Coins,
  UserPlus,
  Award,
  Building2,
  Key,
  Lock,
  LayoutGrid,
  BarChart3,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
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

  // --- [공지사항 알림 상태] ---
  const [hasNewNotice, setHasNewNotice] = useState(false);
  const [latestNoticeId, setLatestNoticeId] = useState<string | null>(null);
  // ✅ [추가] 알림창에 제목을 띄우기 위해 state 추가
  const [latestNoticeTitle, setLatestNoticeTitle] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ 1. 읽음 처리 핸들러 (localStorage 업데이트 및 빨간 점 제거)
  const markAsRead = useCallback(() => {
    if (latestNoticeId) {
      localStorage.setItem("lastSeenNoticeId", latestNoticeId);
      setHasNewNotice(false);
    }
  }, [latestNoticeId]);

  // ✅ 2. 최신 공지사항 확인 로직
  useEffect(() => {
    const checkNewNotice = async () => {
      try {
        const res = await fetch("/api/notice", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const json = await res.json();

        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          const latest = json.data[0];
          const currentId = latest.id;

          setLatestNoticeId(currentId);
          setLatestNoticeTitle(latest.title); // ✅ 제목 저장

          const lastSeenId = localStorage.getItem("lastSeenNoticeId");

          // 현재 경로가 공지사항 페이지(/notice)라면 즉시 읽음 처리
          if (pathname === "/notice") {
            if (lastSeenId !== currentId) {
              localStorage.setItem("lastSeenNoticeId", currentId);
            }
            setHasNewNotice(false);
          } else {
            // 다른 페이지에 있고, ID가 다르면 '새 공지' 표시
            if (lastSeenId !== currentId) {
              setHasNewNotice(true);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch notices for notification badge", e);
      }
    };

    checkNewNotice();
  }, [pathname]);

  // ✅ 3. 경로 감지: 사용자가 어떤 방식으로든 /notice 페이지에 들어오면 빨간 점 제거
  useEffect(() => {
    if (pathname === "/notice" && hasNewNotice) {
      markAsRead();
    }
  }, [pathname, hasNewNotice, markAsRead]);

  // 페이지 경로 변경 시 드롭다운 닫기
  useEffect(() => {
    if (activeMenu) {
      setActiveMenu(null);
    }
    // 페이지 이동 시 열려있는 DaisyUI 드롭다운(포커스) 해제
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);

  // 모바일 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeMenu && !target.closest("details")) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeMenu]);

  if (pathname.includes("/auth/login") || pathname.includes("/auth/signup")) {
    return null;
  }

  const toggleMenu = (menuName: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeMenu === menuName) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuName);
    }
  };

  const navLinks = [
    { name: "대시보드", href: "/", icon: LayoutGrid },
    { name: "스테이킹", href: "/staking", icon: BarChart3 },
    { name: "스왑", href: "/swap", icon: ArrowLeftRight },
    { name: "공지사항", href: "/notice", icon: Bell },
  ];

  const getNavClass = (path: string) => {
    const baseClass =
      "btn btn-ghost text-[15px] font-bold px-3 xl:px-4 transition-all duration-200 flex items-center gap-2 h-10 min-h-0";
    if (pathname === path) {
      return `${baseClass} text-[#4F46E5] bg-[#4F46E5]/10`;
    }
    return `${baseClass} text-gray-600 hover:text-[#4F46E5] hover:bg-base-200`;
  };

  const menuItemClass =
    "flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-base-200 transition-all duration-200 text-sm font-medium text-gray-700";
  const mainIconSize = 20;
  const iconSize = 18;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur font-sans h-[70px] flex items-center shadow-sm">
      <div className="w-full max-w-[1700px] mx-auto px-4 lg:px-6 flex justify-between items-center h-full">
        {/* --- [왼쪽] 로고 --- */}
        <div className="navbar-start w-auto flex items-center shrink-0 mr-8">
          {/* 모바일 햄버거 메뉴 */}
          <div className="dropdown lg:hidden mr-2">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle btn-sm"
            >
              <Menu className="h-6 w-6" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-lg dropdown-content mt-3 z-[1] p-2 shadow-xl bg-white rounded-box w-72 text-base border border-gray-100"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    // 메뉴 클릭 시에도 공지사항이면 읽음 처리
                    onClick={link.href === "/notice" ? markAsRead : undefined}
                    className={`font-bold py-3 ${
                      pathname === link.href
                        ? "text-[#4F46E5]"
                        : "text-gray-700"
                    }`}
                  >
                    <link.icon size={mainIconSize} color={PURPLE_HEX} />{" "}
                    {link.name}
                  </Link>
                </li>
              ))}
              <div className="divider my-1"></div>

              {/* 모바일 서브메뉴들 */}
              <li>
                <details open={mounted && activeMenu === "mobile-org"}>
                  <summary
                    onClick={toggleMenu("mobile-org")}
                    className="font-bold py-3 text-gray-700"
                  >
                    <Network size={mainIconSize} color={PURPLE_HEX} /> 조직도
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li>
                      <Link href="/tree/referrer" className={menuItemClass}>
                        <Network size={iconSize} color={PURPLE_HEX} /> 추천
                        조직도
                      </Link>
                    </li>
                    <li>
                      <Link href="/tree/sponser" className={menuItemClass}>
                        <Users size={iconSize} color={PURPLE_HEX} /> 후원 조직도
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mounted && activeMenu === "mobile-withdraw"}>
                  <summary
                    onClick={toggleMenu("mobile-withdraw")}
                    className="font-bold py-3 text-gray-700"
                  >
                    <Download size={mainIconSize} color={PURPLE_HEX} />{" "}
                    입출금/내역
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li>
                      <Link href="/wallet/deposit" className={menuItemClass}>
                        <ArrowDownLeft size={iconSize} color={PURPLE_HEX} />{" "}
                        입금
                      </Link>
                    </li>
                    <li>
                      <Link href="/wallet/withdraw" className={menuItemClass}>
                        <ArrowUpRight size={iconSize} color={PURPLE_HEX} /> 출금
                      </Link>
                    </li>
                    <li>
                      <Link href="/swap" className={menuItemClass}>
                        <ArrowLeftRight size={iconSize} color={PURPLE_HEX} />{" "}
                        스왑
                      </Link>
                    </li>
                    <li>
                      <Link href="/history" className={menuItemClass}>
                        <ClipboardList size={iconSize} color={PURPLE_HEX} />{" "}
                        내역
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>
              <li>
                <details open={mounted && activeMenu === "mobile-allowance"}>
                  <summary
                    onClick={toggleMenu("mobile-allowance")}
                    className="font-bold py-3 text-gray-700"
                  >
                    <Coins size={mainIconSize} color={PURPLE_HEX} /> 수당 내역
                  </summary>
                  <ul className="p-2 bg-gray-50">
                    <li>
                      <Link href="/history/staking" className={menuItemClass}>
                        <Coins size={iconSize} color={PURPLE_HEX} /> 스테이킹
                      </Link>
                    </li>
                    <li>
                      <Link href="/history/recommend" className={menuItemClass}>
                        <UserPlus size={iconSize} color={PURPLE_HEX} /> 추천
                      </Link>
                    </li>
                    <li>
                      <Link href="/history/matching" className={menuItemClass}>
                        <Users size={iconSize} color={PURPLE_HEX} /> 추천 매칭
                      </Link>
                    </li>
                    <li>
                      <Link href="/history/rank" className={menuItemClass}>
                        <Award size={iconSize} color={PURPLE_HEX} /> 직급
                      </Link>
                    </li>
                    <li>
                      <Link href="/history/center" className={menuItemClass}>
                        <Building2 size={iconSize} color={PURPLE_HEX} /> 센터
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>

              {/* ✅ [삭제됨] 모바일 마이페이지 메뉴 */}
            </ul>
          </div>

          <Link
            href="/"
            className="btn btn-ghost p-0 hover:bg-transparent text-2xl lg:text-3xl font-extrabold text-[#4F46E5] tracking-tighter"
          >
            BUYZONE
          </Link>
        </div>

        {/* --- [가운데] 메인 네비게이션 (데스크탑) --- */}
        <div className="navbar-center hidden lg:flex">
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // 데스크탑 메뉴 클릭 시에도 공지사항이면 읽음 처리
                onClick={link.href === "/notice" ? markAsRead : undefined}
                className={getNavClass(link.href)}
              >
                <link.icon
                  size={20}
                  color={PURPLE_HEX}
                  className={pathname === link.href ? "stroke-[2.5px]" : ""}
                />
                {link.name}
              </Link>
            ))}

            <div className="w-[1px] h-6 bg-gray-300 mx-2 xl:mx-4"></div>

            <div className="flex items-center space-x-1">
              {/* 조직도 */}
              <div className="dropdown dropdown-hover group">
                <div
                  role="button"
                  className="btn btn-ghost text-[15px] font-medium px-3 text-gray-600 hover:text-gray-900 h-10 min-h-0 flex items-center gap-1 group-hover:bg-base-200"
                >
                  조직도{" "}
                  <ChevronDown
                    size={14}
                    className="opacity-50 transition-transform group-hover:rotate-180"
                  />
                </div>
                <ul className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-xl w-52 border border-gray-100">
                  <li>
                    <Link href="/tree/referrer" className={menuItemClass}>
                      <Network size={iconSize} color={PURPLE_HEX} /> 추천 조직도
                    </Link>
                  </li>
                  <li>
                    <Link href="/tree/sponser" className={menuItemClass}>
                      <Users size={iconSize} color={PURPLE_HEX} /> 후원 조직도
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 입출금/내역 */}
              <div className="dropdown dropdown-hover group">
                <div
                  role="button"
                  className="btn btn-ghost text-[15px] font-medium px-3 text-gray-600 hover:text-gray-900 h-10 min-h-0 flex items-center gap-1 group-hover:bg-base-200"
                >
                  입출금/내역{" "}
                  <ChevronDown
                    size={14}
                    className="opacity-50 transition-transform group-hover:rotate-180"
                  />
                </div>
                <ul className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-xl w-52 border border-gray-100">
                  <li>
                    <Link href="/wallet/deposit" className={menuItemClass}>
                      <ArrowDownLeft size={iconSize} color={PURPLE_HEX} /> 입금
                    </Link>
                  </li>
                  <li>
                    <Link href="/wallet/withdraw" className={menuItemClass}>
                      <ArrowUpRight size={iconSize} color={PURPLE_HEX} /> 출금
                    </Link>
                  </li>
                  <li>
                    <Link href="/swap" className={menuItemClass}>
                      <ArrowLeftRight size={iconSize} color={PURPLE_HEX} /> 스왑
                    </Link>
                  </li>
                  <li>
                    <Link href="/history" className={menuItemClass}>
                      <ClipboardList size={iconSize} color={PURPLE_HEX} /> 내역
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 수당 내역 */}
              <div className="dropdown dropdown-hover group">
                <div
                  role="button"
                  className="btn btn-ghost text-[15px] font-medium px-3 text-gray-600 hover:text-gray-900 h-10 min-h-0 flex items-center gap-1 group-hover:bg-base-200"
                >
                  수당 내역{" "}
                  <ChevronDown
                    size={14}
                    className="opacity-50 transition-transform group-hover:rotate-180"
                  />
                </div>
                <ul className="menu dropdown-content z-[1] p-2 shadow-lg bg-white rounded-xl w-56 border border-gray-100">
                  <li>
                    <Link href="/history/staking" className={menuItemClass}>
                      <Coins size={iconSize} color={PURPLE_HEX} /> 스테이킹
                    </Link>
                  </li>
                  <li>
                    <Link href="/history/recommend" className={menuItemClass}>
                      <UserPlus size={iconSize} color={PURPLE_HEX} /> 추천
                    </Link>
                  </li>
                  <li>
                    <Link href="/history/matching" className={menuItemClass}>
                      <Users size={iconSize} color={PURPLE_HEX} /> 추천 매칭
                    </Link>
                  </li>
                  <li>
                    <Link href="/history/rank" className={menuItemClass}>
                      <Award size={iconSize} color={PURPLE_HEX} /> 직급
                    </Link>
                  </li>
                  <li>
                    <Link href="/history/center" className={menuItemClass}>
                      <Building2 size={iconSize} color={PURPLE_HEX} /> 센터
                    </Link>
                  </li>
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

          {/* 알림 버튼 */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle btn-sm h-9 w-9 min-h-0 hover:bg-gray-100 relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {hasNewNotice && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </div>

            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-xl w-72 border border-gray-100"
            >
              <li className="menu-title px-4 py-2 text-gray-500 text-xs font-semibold">
                알림
              </li>
              <li>
                {hasNewNotice ? (
                  <Link
                    href="/notice"
                    onClick={markAsRead}
                    className="py-3 px-4 hover:bg-gray-50 rounded-lg block"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-xs badge-error"></span>
                      <span className="text-xs font-bold text-[#4F46E5]">
                        새 공지사항
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {latestNoticeTitle || "새로운 공지사항이 있습니다."}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">지금 확인하기</p>
                  </Link>
                ) : (
                  <div className="py-6 text-center text-gray-400 text-sm">
                    새로운 알림이 없습니다.
                  </div>
                )}
              </li>
              <div className="divider my-1"></div>
              <li>
                <Link
                  href="/notice"
                  className="justify-center py-2 text-[#4F46E5] font-medium text-xs hover:bg-gray-50"
                >
                  전체 내역 보기
                </Link>
              </li>
            </ul>
          </div>

          {!authed ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="btn btn-sm h-9 min-h-0 px-4 font-bold text-gray-600 btn-ghost hover:bg-gray-100"
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/auth/signup"
                className="btn btn-sm h-9 min-h-0 px-5 bg-[#4F46E5] hover:bg-opacity-90 border-none font-bold text-white shadow-md hover:shadow-lg transition-all"
              >
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

              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white rounded-xl w-60 border border-gray-100"
              >
                {Number(userLevel) >= 21 && (
                  <li>
                    <Link
                      href="/admin"
                      className="py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                    >
                      <ShieldCheck size={16} className="mr-2 text-[#4F46E5]" />{" "}
                      {t("admin.title")}
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    href="/account"
                    className="py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                  >
                    <User size={16} className="mr-2 text-gray-500" /> 내 정보
                  </Link>
                </li>

                <div className="divider my-1"></div>

                <li>
                  <div
                    className="py-2.5 px-4 font-medium text-gray-700 hover:bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>테마 설정</span>
                    <ThemeToggle size="sm" />
                  </div>
                </li>

                <div className="divider my-1"></div>

                <li>
                  <button
                    onClick={handleLogout}
                    className="py-2.5 px-4 font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center w-full text-left"
                  >
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
