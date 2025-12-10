// src/app/[locale]/(site)/history/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight, // ✅ 스왑 아이콘 추가
} from "lucide-react";
import type { NextPage } from "next";

// -------------------------------------------------------------------

// --- 타입 정의 ---
// ✅ [수정] SWAP 타입 추가
type TxType = "DEPOSIT" | "WITHDRAW" | "SWAP";
type Token = "USDT" | "QAI" | "DFT";
type Status = "COMPLETED" | "PENDING" | "FAILED";
// ✅ [수정] 스왑 탭 추가
type FilterTab = "전체" | "입금" | "출금" | "스왑";

interface ApiTx {
  id: string;
  type: TxType;
  token: Token;
  amount: number;
  date: string;
  status: Status;
  address: string | null;
  memo: string | null;
}
// -------------------------------------------------------------------

const HistoryPage: NextPage = () => {
  const [filterType, setFilterType] = useState<FilterTab>("전체");
  const [loading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<ApiTx[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ [수정] 탭 목록에 '스왑' 추가
  const availableTabs: FilterTab[] = ["전체", "입금", "출금", "스왑"];

  // --- 데이터 패칭 로직 ---
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    let typeParam = "";
    // ✅ [수정] 필터 로직에 스왑 추가
    if (filterType === "입금") typeParam = "&txType=DEPOSIT";
    if (filterType === "출금") typeParam = "&txType=WITHDRAW";
    if (filterType === "스왑") typeParam = "&txType=SWAP";

    try {
      const res = await fetch(`/api/wallet/history?limit=50${typeParam}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok || json.ok !== true) {
        throw new Error(json.message || "Failed to fetch history.");
      }

      setItems(json.items as ApiTx[]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "내역을 불러오는 데 실패했습니다."
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ✅ [수정] 타입별 아이콘 및 색상 반환 (SWAP 추가)
  const getTypeStyle = (type: TxType) => {
    if (type === "DEPOSIT") {
      return {
        icon: ArrowDownLeft,
        color: "text-success",
        bg: "bg-success/10",
      };
    } else if (type === "WITHDRAW") {
      return {
        icon: ArrowUpRight,
        color: "text-error",
        bg: "bg-error/10",
      };
    } else {
      // SWAP Case
      return {
        icon: ArrowLeftRight,
        color: "text-blue-500", // 스왑은 파란색 계열 사용
        bg: "bg-blue-500/10",
      };
    }
  };

  // 상태별 배지 스타일
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "COMPLETED":
        return "badge-success text-white border-none";
      case "PENDING":
        return "badge-warning text-white border-none";
      case "FAILED":
        return "badge-error text-white border-none";
      default:
        return "badge-ghost text-base-content/70";
    }
  };

  // 금액 포맷팅 (부호 포함)
  const formatAmount = (amount: number, type: TxType, currency: Token) => {
    let sign = "";
    if (type === "DEPOSIT") sign = "+";
    else if (type === "WITHDRAW") sign = "-";
    // 스왑은 보통 변동 내역에 따라 다르지만, 여기선 부호 없이 표시하거나 로직에 따라 수정 가능

    return `${sign}${new Intl.NumberFormat().format(
      Math.abs(amount)
    )} ${currency}`;
  };

  return (
    <div className="w-full bg-base-200/50 min-h-full font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-10 py-10">
        {/* 페이지 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content flex items-center gap-3">
              내역 조회 <ClipboardList className="text-primary" size={32} />
            </h1>
            <p className="text-base-content/60 mt-2 text-lg">
              자산의 모든 변동 내역을 상세하게 확인하세요.
            </p>
          </div>
        </div>

        {/* 필터 및 검색 영역 */}
        <div className="card bg-base-100 shadow-lg border border-base-300 mb-6">
          <div className="card-body p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 왼쪽: 탭 필터 */}
            <div className="w-full md:w-auto bg-base-200/50 p-1 rounded-lg">
              {/* ✅ [수정] grid-cols-4로 변경하여 4개 탭 대응 */}
              <div className="grid grid-cols-4 gap-2">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`
                      btn btn-sm h-9 min-h-0 border-none shadow-none rounded-md px-4
                      text-[12px] sm:text-sm font-medium transition-all duration-200
                      ${
                        filterType === tab
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-transparent text-base-content/60 hover:bg-base-100 hover:text-base-content"
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* 오른쪽: 날짜/검색 필터 */}
            <div className="flex gap-2 w-full md:w-auto">
              <button className="btn btn-sm btn-outline border-base-300 text-base-content hover:bg-base-200 hover:text-base-content gap-2 hidden md:flex">
                <Filter size={16} /> 상세 필터
              </button>
              <div className="relative w-full md:w-60">
                <input
                  type="text"
                  placeholder="내용 검색"
                  className="input input-sm input-bordered w-full pl-9 bg-base-100 text-base-content border-base-300 placeholder:text-base-content/40"
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  size={16}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 내역 리스트 (카드형 테이블) */}
        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="table table-lg">
              {/* 헤더 */}
              <thead className="bg-base-200/50">
                <tr className="text-base text-base-content/70 border-b border-base-300">
                  <th className="font-normal w-24 text-center">유형</th>
                  <th className="font-normal">거래 내용 / 주소</th>
                  <th className="font-normal text-right">변동 금액</th>
                  <th className="font-normal text-center w-32">상태</th>
                  <th className="font-normal text-right w-40">일시</th>
                </tr>
              </thead>

              {/* 바디 */}
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center py-10">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                      <p className="text-base-content/60 mt-3">
                        내역을 불러오는 중...
                      </p>
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-error">
                      🚨 {error}
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && !error && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-base-content/50"
                    >
                      거래 내역이 없습니다.
                    </td>
                  </tr>
                )}
                {items.map((item) => {
                  const style = getTypeStyle(item.type);
                  // ✅ [수정] 타입 텍스트 표시 로직
                  const displayType =
                    item.type === "DEPOSIT"
                      ? "입금"
                      : item.type === "WITHDRAW"
                      ? "출금"
                      : "스왑";

                  // ✅ [수정] 메모/주소 표시 로직
                  const displayMemo = item.memo
                    ? item.memo
                    : item.type === "DEPOSIT"
                    ? "입금 확인"
                    : item.type === "WITHDRAW"
                    ? "출금 신청"
                    : "토큰 스왑";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-base-200/50 transition-colors border-b border-base-200 last:border-0"
                    >
                      {/* 유형 아이콘 */}
                      <td className="text-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${style.bg} ${style.color}`}
                        >
                          <style.icon size={20} />
                        </div>
                        <div className="text-xs text-base-content/60 mt-1 font-medium">
                          {displayType}
                        </div>
                      </td>

                      {/* 내용 */}
                      <td>
                        <div className="font-bold text-base-content text-lg">
                          {item.token} {displayType}
                        </div>
                        <div className="text-sm text-base-content/40 font-mono mt-0.5">
                          {displayMemo}
                        </div>
                      </td>

                      {/* 금액 */}
                      <td className="text-right">
                        <div className={`font-bold text-xl ${style.color}`}>
                          {formatAmount(item.amount, item.type, item.token)}
                        </div>
                        <div className="text-xs text-base-content/40">
                          {item.token}
                        </div>
                      </td>

                      {/* 상태 */}
                      <td className="text-center">
                        <span
                          className={`badge ${getStatusBadge(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* 일시 */}
                      <td className="text-right text-base-content/60 text-sm">
                        {item.date.split(" ")[0]} <br />
                        <span className="text-xs text-base-content/40">
                          {item.date.split(" ")[1]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          <div className="p-6 border-t border-base-300 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">
                «
              </button>
              <button className="join-item btn btn-sm btn-active bg-primary text-white border-primary hover:bg-primary hover:border-primary">
                1
              </button>
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">
                2
              </button>
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">
                3
              </button>
              <button className="join-item btn btn-sm hover:bg-base-200 text-base-content/60">
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
