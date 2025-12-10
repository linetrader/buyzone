// src/app/api/wallet/deposit/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { Wallet as EvmWallet, getAddress } from "ethers"; // ethers v6
import { encryptTextAesGcm, type EncPayload } from "@/lib/encrypt";
// Prisma 타입 임포트 (WalletTxType, WalletTxStatus는 generated/prisma에서 왔다고 가정)
import { WalletTxType, WalletTxStatus } from "@/generated/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function withTimeout<T>(p: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("TIMEOUT")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

function isEncPayload(x: unknown): x is EncPayload {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.ciphertextB64 === "string" &&
    typeof o.ivB64 === "string" &&
    typeof o.tagB64 === "string" &&
    o.alg === "aes-256-gcm" &&
    (typeof o.version === "number" || typeof o.version === "string")
  );
}

// ✅ [수정] 응답 타입 정의 (WalletTx 스키마 기반)
type WalletTxItem = {
  id: string; // 스키마에 따라 String
  amount: string; // Decimal을 string으로 직렬화
  tokenCode: string;
  txHash: string | null;
  status: WalletTxStatus;
  createdAt: Date;
};
type DepositOk = {
  ok: true;
  depositAddress: string;
  provisioned: boolean;
  recentTxs: WalletTxItem[]; // ✅ 입금 내역 추가
};
type DepositErr = {
  ok: false;
  code: "UNAUTHORIZED" | "UPSTREAM_TIMEOUT" | "UNKNOWN";
  message?: string;
};

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      const body: DepositErr = { ok: false, code: "UNAUTHORIZED" };
      return NextResponse.json(body, { status: 401 });
    }

    const w = EvmWallet.createRandom();
    const newAddress = getAddress(w.address);
    const privateKey = w.privateKey;

    let enc: EncPayload | null = null;
    try {
      const e = encryptTextAesGcm(privateKey);
      if (isEncPayload(e)) enc = e;
      else console.warn("[/api/wallet/deposit] Unexpected EncPayload shape");
    } catch (e) {
      console.warn("[/api/wallet/deposit] encryptTextAesGcm failed", {
        userId,
        err: e instanceof Error ? e.message : String(e),
      });
    }

    // ✅ [수정] 트랜잭션 조회 로직을 병렬로 추가
    const [row, recentTxs] = await withTimeout(
      Promise.all([
        prisma.userWallet.upsert({
          where: { userId },
          create: {
            userId,
            depositAddress: newAddress,
            ...(enc && {
              depositPrivCipher: enc.ciphertextB64,
              depositPrivIv: enc.ivB64,
              depositPrivTag: enc.tagB64,
              depositKeyAlg: enc.alg,
              depositKeyVersion:
                typeof enc.version === "number"
                  ? enc.version
                  : Number(enc.version),
            }),
          },
          update: {},
          select: { depositAddress: true },
        }),
        prisma.walletTx.findMany({
          where: { userId, txType: WalletTxType.DEPOSIT }, // 입금 타입만 필터링
          orderBy: { createdAt: "desc" },
          take: 5, // 최근 5개만 조회
          select: {
            id: true,
            amount: true,
            tokenCode: true,
            txHash: true,
            status: true,
            createdAt: true,
          },
        }),
      ]),
      8_000 // 타임아웃
    );

    let addr = row.depositAddress;

    if (!addr) {
      const fixed = await prisma.userWallet.update({
        where: { userId },
        data: {
          depositAddress: newAddress,
          ...(enc && {
            depositPrivCipher: enc.ciphertextB64,
            depositPrivIv: enc.ivB64,
            depositPrivTag: enc.tagB64,
            depositKeyAlg: enc.alg,
            depositKeyVersion:
              typeof enc.version === "number"
                ? enc.version
                : Number(enc.version),
          }),
        },
        select: { depositAddress: true },
      });
      addr = fixed.depositAddress;
    }

    // 트랜잭션 데이터를 클라이언트가 이해할 수 있는 형태로 변환 (Decimal -> string)
    const formattedTxs: WalletTxItem[] = recentTxs.map((tx) => ({
      ...tx,
      // Prisma Decimal 타입은 JSON으로 직렬화 시 string이 되므로 명시적으로 변환
      amount: String(tx.amount),
      tokenCode: String(tx.tokenCode),
      // status와 createdAt은 이미 적절한 타입을 가진다고 가정
    }));

    const body: DepositOk = {
      ok: true,
      depositAddress: getAddress(addr as string),
      provisioned: true,
      recentTxs: formattedTxs, // ✅ 데이터 추가
    };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    if ((e as Error)?.message === "TIMEOUT") {
      const body: DepositErr = {
        ok: false,
        code: "UPSTREAM_TIMEOUT",
        message: "DB timed out",
      };
      return NextResponse.json(body, { status: 504 });
    }
    console.error("[/api/wallet/deposit] GET error", e);
    const body: DepositErr = {
      ok: false,
      code: "UNKNOWN",
      message: "Server error",
    };
    return NextResponse.json(body, { status: 500 });
  }
}
