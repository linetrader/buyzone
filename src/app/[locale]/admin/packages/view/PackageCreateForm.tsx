// src/app/[locale]/admin/packages/view/PackageCreateForm.tsx

"use client";

import Link from "next/link";

export default function PackageCreateForm(props: {
  name: string;
  price: string;
  // dailyDftAmount 제거
  setName: (v: string) => void;
  setPrice: (v: string) => void;
  // setDailyDftAmount 제거
  onSubmit: () => void;
  submitting: boolean;
  decPattern: string;
}) {
  const {
    name,
    price,
    // dailyDftAmount 제거
    setName,
    setPrice,
    // setDailyDftAmount 제거
    onSubmit,
    submitting,
    decPattern,
  } = props;

  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">기본 정보</h3>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text">이름</span>
            <input
              type="text"
              className="input input-bordered"
              placeholder="예) Starter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="form-control">
            <span className="label-text">가격</span>
            <input
              type="text"
              inputMode="decimal"
              pattern={decPattern}
              className="input input-bordered"
              placeholder="예) 100.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              title="0 이상의 숫자(소수 허용)"
            />
          </label>

          {/* 일일 DFT 수량 입력 필드 삭제됨 */}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className={`btn btn-primary ${submitting ? "btn-disabled" : ""}`}
            disabled={submitting}
          >
            {submitting ? "저장 중…" : "저장"}
          </button>
          <Link href="/admin/packages" className="btn btn-ghost">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
