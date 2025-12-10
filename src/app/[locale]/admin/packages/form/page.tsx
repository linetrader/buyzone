// src/app/[locale]/admin/packages/form/page.tsx

"use client";

import Link from "next/link";
import PackageCreateForm from "../view/PackageCreateForm";
import { usePackageCreate } from "../hooks/usePackageCreate";

export default function PackageCreateFormPage() {
  // ✅ [수정] setDailyDftAmount 제거
  const { DEC_RE, state, setName, setPrice, onSubmit } = usePackageCreate();

  return (
    <main className="p-4 md:p-6 space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">패키지 등록</h1>
        <Link href="/admin/packages" className="btn btn-outline btn-sm">
          목록으로
        </Link>
      </div>

      {state.error && (
        <div className="alert alert-error">
          <span>{state.error}</span>
        </div>
      )}

      {/* ✅ [수정] dailyDftAmount 관련 props 제거 */}
      <PackageCreateForm
        name={state.name}
        price={state.price}
        setName={setName}
        setPrice={setPrice}
        onSubmit={onSubmit}
        submitting={state.submitting}
        decPattern={DEC_RE.source}
      />
    </main>
  );
}
