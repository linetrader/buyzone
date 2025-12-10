// src/app/[locale]/admin/packages/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useCallback } from "react";
import { useQS } from "@/app/[locale]/admin/lib/useQS";
import { useDebouncedValue } from "@/app/[locale]/admin/lib/useDebouncedValue";
import { usePackagesList } from "./hooks/usePackagesList";
import PackagesTable from "./view/PackagesTable";
import { useToast } from "@/components/ui";

export default function PackageListPage() {
  const { searchParams, setParams } = useQS();
  const { toast } = useToast();

  const page = useMemo(
    () => Math.max(1, Number(searchParams?.get("page") ?? 1)),
    [searchParams]
  );

  const size = useMemo(() => {
    const n = Number(searchParams?.get("size") ?? 20);
    return [10, 20, 50, 100, 200].includes(n) ? n : 20;
  }, [searchParams]);

  const q = searchParams?.get("q") ?? "";
  const qDebounced = useDebouncedValue(q, 400);

  // ✅ [수정] reload 함수 가져오기
  const { data, items, loading, error, reload } = usePackagesList({
    page,
    size,
    q: qDebounced,
  });

  // ✅ 삭제 핸들러 구현
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("정말 이 패키지를 삭제하시겠습니까?")) return;

      try {
        const res = await fetch(`/api/admin/packages/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("삭제에 실패했습니다.");
        }

        // 성공 시: variant 생략 (기본 스타일 적용)
        toast({
          title: "삭제 완료",
          description: "패키지가 성공적으로 삭제되었습니다.",
        });

        // ✅ [수정] URL 변경 없이 데이터만 실시간 리로드
        reload();
      } catch (err) {
        // 실패 시: variant를 "error"로 설정
        toast({
          title: "삭제 오류",
          description: err instanceof Error ? err.message : "알 수 없는 오류",
          variant: "error",
        });
      }
    },
    [toast, reload] // ✅ 의존성에 reload 추가
  );

  return (
    <main className="p-4 md:p-6 space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">패키지 목록</h1>
          <p className="text-sm opacity-70">총 {data?.total ?? 0}건</p>
        </div>
        <Link href="/admin/packages/form" className="btn btn-outline btn-sm">
          신규 등록
        </Link>
      </div>

      <section className="space-y-3">
        <h3 className="font-semibold">검색</h3>
        <div className="card p-4">
          <div className="flex items-end gap-2">
            <label className="form-control w-full max-w-md">
              <span className="label-text">패키지명 검색</span>
              <input
                type="text"
                className="input input-bordered"
                placeholder="예) Starter"
                defaultValue={q}
                onChange={(e) =>
                  setParams({ q: e.currentTarget.value, page: 1 })
                }
              />
            </label>
            {q ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setParams({ q: "", page: 1 })}
              >
                검색 초기화
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {loading && (
        <div className="alert">
          <span>불러오는 중…</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {data && (
        <PackagesTable
          items={items}
          page={page}
          size={data.size}
          total={data.total}
          onPageChange={(next) => setParams({ page: next })}
          onSizeChange={(next) => setParams({ size: next, page: 1 })}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
