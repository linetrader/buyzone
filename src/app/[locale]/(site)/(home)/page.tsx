// src/app/[locale]/(site)/(home)/page.tsx
"use client";

// ✅ [확인] HomeView를 { }로 감싸서 import 해야 합니다.
import { HomeView } from "./views/HomeView";
import { useHomeData } from "./hooks/useHomeData";

export default function Home() {
  const data = useHomeData();

  if (data.loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <>
      <HomeView {...data} />
    </>
  );
}
