// src/app/[locale]/(site)/(home)/hooks/useHomeData.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ✅ [수정] 공지사항 타입
export type AnnouncementTopItem = {
  id: string;
  title: string;
  publishedAt: string;
};

// ✅ [수정] API 응답 및 View Props에 맞는 데이터 타입 정의
export type UseHomeDataReturn = {
  loading: boolean;
  err: string | null;
  authed: boolean;
  // 변경된 데이터 구조 반영
  balances: {
    usdt: number;
    qai: number;
    dft: number;
  };
  userInfo: {
    username: string;
    referralCode: string;
    referralCount: number;
  };
  rewardsBreakdown: {
    staking: number;
    referral: number;
    matching: number;
    rank: number;
    center: number;
    total: number;
  };
  recentRewards: {
    id: string;
    amount: number;
    date: string;
    status: string;
    name: string;
  }[];
  announcementsTop: AnnouncementTopItem[];
};

export function useHomeData(): UseHomeDataReturn {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean>(false);

  // ✅ [수정] 상태 초기값 설정 (0 또는 빈 값)
  const [balances, setBalances] = useState({ usdt: 0, qai: 0, dft: 0 });
  const [userInfo, setUserInfo] = useState({
    username: "",
    referralCode: "",
    referralCount: 0,
  });
  const [rewardsBreakdown, setRewardsBreakdown] = useState({
    staking: 0,
    referral: 0,
    matching: 0,
    rank: 0,
    center: 0,
    total: 0,
  });
  const [recentRewards, setRecentRewards] = useState<
    UseHomeDataReturn["recentRewards"]
  >([]);
  const [announcementsTop, setAnnouncementsTop] = useState<
    AnnouncementTopItem[]
  >([]);

  // 1. 홈 데이터 Fetch (인증 필요)
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErr(null);

        // ✅ [중요] 캐시 방지 옵션 추가 (새로고침 시 0 방지)
        const res = await fetch("/api/home", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          cache: "no-store",
          next: { revalidate: 0 },
        });

        // 인증 실패 시 로그인 페이지로 리다이렉트
        if (res.status === 401) {
          router.push("/auth/login?next=/");
          return;
        }

        const json = await res.json();

        if (!res.ok || !json.ok) {
          throw new Error(json.message || `API Error: ${res.status}`);
        }

        if (!ignore) {
          setAuthed(true);
          // API 응답 데이터를 상태에 반영
          if (json.balances) setBalances(json.balances);
          if (json.userInfo) setUserInfo(json.userInfo);
          if (json.rewardsBreakdown) setRewardsBreakdown(json.rewardsBreakdown);
          if (json.recentRewards) setRecentRewards(json.recentRewards);
        }
      } catch (e: unknown) {
        if (!ignore) {
          console.error("Home Fetch Error:", e);
          setErr(e instanceof Error ? e.message : "네트워크 오류 발생");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();

    return () => {
      ignore = true;
    };
  }, [router]);

  // 2. 공지사항 목록 Fetch (비인증 허용)
  useEffect(() => {
    let abort = false;
    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/menu/announcement", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error("ANN_FAIL");
        if (abort) return;

        // 상위 5개만 추출 및 매핑
        const top5 = (json.data || []).slice(0, 5).map((r: any) => ({
          id: r.id,
          title: r.title,
          publishedAt: r.publishedAt,
        }));
        setAnnouncementsTop(top5);
      } catch {
        if (!abort) setAnnouncementsTop([]);
      }
    };

    fetchNotices();
    return () => {
      abort = true;
    };
  }, []);

  return {
    loading,
    err,
    authed,
    balances,
    userInfo,
    rewardsBreakdown,
    recentRewards,
    announcementsTop,
  };
}
