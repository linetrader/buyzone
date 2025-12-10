// src/app/[locale]/(site)/notice/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useFormatter } from "next-intl";

// ===== Types =====
interface SitePostListItem {
  id: string;
  title: string;
  publishedAt: string; // ISO
}

interface SitePostDetail {
  id: string;
  title: string;
  bodyHtml: string;
  publishedAt: string | null; // ISO or null
  createdAt: string; // ISO
}

type SiteListResult =
  | { ok: true; data: SitePostListItem[] }
  | { ok: false; error: string };

type SiteDetailResult =
  | { ok: true; data: SitePostDetail }
  | { ok: false; error: string };

// ===== util =====
async function jsonFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `HTTP ${res.status} ${res.statusText} — non-JSON: ${text.slice(0, 300)}`
    );
  }
  const data = (await res.json()) as unknown;
  return data as T;
}

export default function NoticeSitePage() {
  // ✅ 번역 네임스페이스: 'notice'
  const t = useTranslations("notice");
  const f = useFormatter();

  const [list, setList] = useState<SitePostListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<SitePostDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ [수정] API 경로 확인: /api/notice
      const raw = await jsonFetch<SiteListResult>("/api/notice", {
        cache: "no-store",
      });
      if (raw.ok) setList(raw.data);
      else throw new Error(raw.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    setErrorDetail(null);
    try {
      // ✅ [수정] API 경로 확인: /api/notice?id=...
      const raw = await jsonFetch<SiteDetailResult>(
        `/api/notice?id=${encodeURIComponent(id)}`,
        { cache: "no-store" }
      );
      if (raw.ok) setDetail(raw.data);
      else throw new Error(raw.error);
    } catch (e) {
      setErrorDetail(e instanceof Error ? e.message : "unknown error");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const clearDetail = useCallback(() => {
    setDetail(null);
    setErrorDetail(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ordered = useMemo(
    () =>
      [...list].sort((a, b) => {
        return (b.publishedAt || "").localeCompare(a.publishedAt || "");
      }),
    [list]
  );

  const formatDateTime = (iso: string): string =>
    f.dateTime(new Date(iso), {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-[500px]">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {/* notice.json 키 사용 */}
          <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-base text-gray-500 mt-2">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={refresh} disabled={loading}>
            새로고침
          </button>
          <Link href="/" className="btn btn-ghost btn-sm">
            홈
          </Link>
        </div>
      </div>

      {/* 에러 */}
      {error ? (
        <div className="alert alert-error mb-4">
          <span>오류: {error}</span>
        </div>
      ) : null}

      {/* 목록 */}
      <div className="card bg-base-100 shadow-lg border border-gray-200">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table table-lg w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-base font-medium">제목</th>
                  <th className="w-48 text-base font-medium text-right pr-8">
                    발행일
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      void loadDetail(row.id);
                      setTimeout(() => {
                        const detailEl =
                          document.getElementById("notice-detail");
                        detailEl?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    <td className="font-medium text-base py-4 pl-6">
                      {row.title}
                    </td>
                    <td className="text-gray-500 text-right pr-8">
                      {formatDateTime(row.publishedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                <span className="loading loading-spinner loading-md"></span>
                <p className="mt-2 text-sm">목록을 불러오는 중...</p>
              </div>
            ) : null}

            {ordered.length === 0 && !loading ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-lg">{t("empty")}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 상세 */}
      <div id="notice-detail" className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">공지 상세</h2>
          {detail ? (
            <button
              className="btn btn-ghost btn-sm text-gray-500"
              onClick={clearDetail}
            >
              닫기
            </button>
          ) : null}
        </div>

        {loadingDetail ? (
          <div className="alert bg-base-100 shadow-sm">
            <span className="loading loading-dots loading-sm"></span>
            <span className="text-sm ml-2">내용을 불러오는 중...</span>
          </div>
        ) : null}

        {errorDetail ? (
          <div className="alert alert-error">
            <span>상세 조회 오류: {errorDetail}</span>
          </div>
        ) : null}

        {detail ? (
          <div className="card bg-base-100 shadow-lg border border-gray-200">
            <div className="card-body">
              <h3 className="text-2xl font-bold mb-3 border-b border-gray-100 pb-4">
                {detail.title}
              </h3>
              <div className="flex justify-between items-center text-sm text-gray-400 mb-6">
                <span>
                  발행일:{" "}
                  {detail.publishedAt
                    ? formatDateTime(detail.publishedAt)
                    : "-"}
                </span>
              </div>
              <div
                className="prose max-w-none min-h-[200px] text-gray-700"
                dangerouslySetInnerHTML={{ __html: detail.bodyHtml ?? "" }}
              />
            </div>
          </div>
        ) : (
          !loadingDetail && (
            <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
              목록에서 공지사항을 선택하면 내용이 여기에 표시됩니다.
            </div>
          )
        )}
      </div>
    </div>
  );
}
