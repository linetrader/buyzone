// src/app/[locale]/admin/packages/view/PackagesTable.tsx
"use client";

import Link from "next/link";
import type { PackageRow } from "@/types/admin/packages";
import { HistoryTable } from "@/components/ui";
import { Pagination } from "@/components/ui/Navigation/Pagination";

type Props = {
  items: PackageRow[];
  page?: number;
  size?: number;
  total?: number;
  onPageChange?: (next: number) => void;
  onSizeChange?: (next: number) => void;
  onDelete?: (id: string) => void;
};

export default function PackagesTable({
  items,
  page,
  size,
  total,
  onPageChange,
  onSizeChange,
  onDelete,
}: Props) {
  // ✅ [수정] 헤더에서 '일일 DFT' 제거 (총 4개 컬럼)
  const head: readonly string[] = ["이름", "가격", "상세", "삭제"] as const;

  // ✅ [수정] 행 데이터에서 dailyDftAmount 제거
  const rows: ReadonlyArray<readonly string[]> = items.map((p) => [
    p.name,
    String(p.price),
    // String(p.dailyDftAmount), // 제거됨
    p.id, // 상세 링크용 (인덱스 2)
    p.id, // 삭제 버튼용 (인덱스 3)
  ]);

  const canPaginate =
    page !== undefined &&
    size !== undefined &&
    total !== undefined &&
    onPageChange !== undefined;

  return (
    <div className="card p-3 space-y-3">
      <HistoryTable
        head={head}
        rows={rows}
        emptyLabel="데이터가 없습니다."
        className="overflow-x-auto"
        tableClassName="table w-full"
        showIndex={false}
        // ✅ [수정] 정렬 기준 조정 (4개)
        colAlign={["left", "right", "center", "center"]}
        minColWidthPx={120}
        cellRender={(_, colIdx, cell) => {
          // 가격 (인덱스 1)
          if (colIdx === 1) {
            return <span className="tabular-nums">{cell}</span>;
          }
          // 상세 보기 (인덱스 2 - 기존 3에서 이동)
          if (colIdx === 2) {
            return (
              <Link
                href={`/admin/packages/${cell}`}
                className="btn btn-xs btn-outline btn-primary"
              >
                보기
              </Link>
            );
          }
          // 삭제 버튼 (인덱스 3 - 기존 4에서 이동)
          if (colIdx === 3) {
            return (
              <button
                type="button"
                className="btn btn-xs btn-outline btn-error"
                onClick={() => onDelete?.(cell)}
              >
                삭제
              </button>
            );
          }
          return cell;
        }}
      />

      {canPaginate ? (
        <Pagination
          total={total as number}
          page={page as number}
          pageSize={size as number}
          onPageChange={onPageChange as (next: number) => void}
          onPageSizeChange={onSizeChange}
        />
      ) : null}
    </div>
  );
}
