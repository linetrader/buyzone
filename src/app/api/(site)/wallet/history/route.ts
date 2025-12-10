// app/api/wallet/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
// ✅ [추가] WalletTxType 및 WalletTxStatus 임포트
import { WalletTxType, WalletTxStatus } from "@/generated/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function errMessage(e: unknown): string {
  return e instanceof Error
    ? e.message
    : typeof e === "string"
    ? e
    : "Server error";
}

// keyset 커서 (createdAt desc, id desc)
function ltCursor(
  tsIso?: string | null,
  id?: string | null
): { OR?: Array<Record<string, unknown>> } {
  if (!tsIso || !id) return {};
  const ts = new Date(tsIso);
  if (Number.isNaN(ts.getTime())) return {};
  return {
    OR: [
      { createdAt: { lt: ts } },
      { AND: [{ createdAt: ts }, { id: { lt: id } }] },
    ],
  };
}

type Token = "USDT" | "QAI" | "DFT";
// ✅ [수정] ApiTx 타입 정의 확장 (memo, address 추가)
type ApiTx = {
  id: string;
  type: "DEPOSIT" | "WITHDRAW";
  token: Token;
  amount: number;
  date: string; // "YYYY-MM-DD HH:mm"
  status: "COMPLETED" | "PENDING" | "FAILED";
  memo: string | null;
  address: string | null;
};

type SuccessPayload = {
  ok: true;
  items: ApiTx[];
  nextCursor: { ts?: string | null; id?: string | null } | null;
};
type ErrorPayload = {
  ok: false;
  code: "UNAUTHORIZED" | "UNKNOWN";
  message?: string;
};

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      const body: ErrorPayload = { ok: false, code: "UNAUTHORIZED" };
      return NextResponse.json(body, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit") || 50))
    );
    const cursorTs = searchParams.get("cursorTs");
    const cursorId = searchParams.get("cursorId");

    // ✅ [추가] txType 쿼리 파라미터를 읽고 Prisma 필터로 변환
    const filterTxType = searchParams.get("txType");
    let txTypeFilter: WalletTxType | undefined = undefined;
    if (filterTxType === "DEPOSIT") txTypeFilter = WalletTxType.DEPOSIT;
    if (filterTxType === "WITHDRAW") txTypeFilter = WalletTxType.WITHDRAW;

    const rows = await prisma.walletTx.findMany({
      where: {
        userId,
        ...ltCursor(cursorTs, cursorId),
        // ✅ [수정] txType 필터링 적용 (DEPOSIT 또는 WITHDRAW만)
        txType: txTypeFilter || {
          in: [WalletTxType.DEPOSIT, WalletTxType.WITHDRAW],
        },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      select: {
        id: true,
        txType: true, // "DEPOSIT" | "WITHDRAW"
        tokenCode: true, // "USDT" | "QAI" | "DFT"
        amount: true,
        status: true, // "PENDING" | "COMPLETED" | "REJECTED"
        createdAt: true,
        // ✅ [추가] memo, fromAddress, toAddress 필드 추가
        memo: true,
        fromAddress: true,
        toAddress: true,
      },
    });

    const hasMore = rows.length > limit;
    const sliced = rows.slice(0, limit);

    const items: ApiTx[] = sliced.map((r) => {
      // REJECTED는 FAILED로 매핑
      const status: ApiTx["status"] =
        r.status === WalletTxStatus.COMPLETED
          ? "COMPLETED"
          : r.status === WalletTxStatus.PENDING
          ? "PENDING"
          : "FAILED";

      // 입금(DEPOSIT)은 fromAddress를, 출금(WITHDRAW)은 toAddress를 사용
      const address =
        r.txType === WalletTxType.DEPOSIT ? r.fromAddress : r.toAddress;

      return {
        id: r.id,
        type: r.txType as ApiTx["type"],
        token: r.tokenCode as ApiTx["token"],
        amount: Number(r.amount),
        date: fmtDate(r.createdAt),
        status: status,
        memo: r.memo, // ✅ [적용] memo 포함
        address: address, // ✅ [적용] 주소 필드 매핑
      };
    });

    const last = sliced[sliced.length - 1];
    const nextCursor =
      hasMore && last
        ? { ts: last.createdAt.toISOString(), id: last.id }
        : null;

    const body: SuccessPayload = { ok: true, items, nextCursor };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    const body: ErrorPayload = {
      ok: false,
      code: "UNKNOWN",
      message: errMessage(e),
    };
    return NextResponse.json(body, { status: 500 });
  }
}
