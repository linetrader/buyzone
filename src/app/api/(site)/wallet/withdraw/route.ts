// src/app/api/(site)/wallet/withdraw/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/request-user";
import { WalletTxStatus, WalletTxType, Prisma } from "@/generated/prisma";
// 🚨 [필수 임포트] 실제 OTP 검증 로직을 위해 otpauth 라이브러리 사용
import * as OTPAuth from "otpauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- 타입 정의 및 상수 ---

type WithdrawErrCode =
  | "UNAUTHORIZED"
  | "INVALID_TOKEN"
  | "INVALID_AMOUNT"
  | "USER_WALLET_NOT_FOUND"
  | "NO_WITHDRAW_ADDRESS"
  | "INSUFFICIENT_BALANCE"
  | "UNKNOWN"
  | "OTP_NOT_ENABLED"
  | "INVALID_OTP";

interface ErrBody {
  ok: false;
  code: WithdrawErrCode;
  message?: string;
}

interface OkBody {
  ok: true;
  tx: any;
  balances: { USDT: number; QAI: number; DFT: number };
}

type TokenCode = "USDT";
const TOKENS = new Set<TokenCode>(["USDT"]);

type Decimalish = number | string | { toString(): string };

// --- 유틸리티 함수 ---

function toDecimal(x: Decimalish): Prisma.Decimal {
  return new Prisma.Decimal(x.toString());
}
function decSub(a: Decimalish, b: Decimalish): string {
  return toDecimal(a).sub(toDecimal(b)).toString();
}
function toNum(x: Decimalish): number {
  return Number(x.toString());
}

// 🔴 [수정] Google OTP 검증 함수: 실제 OTPAuth 라이브러리 로직 반영
async function validateGoogleOtpCode(
  userId: string,
  secret: string | null,
  code: string,
  email: string // 사용자 email 필요
): Promise<boolean> {
  if (!secret || secret.length < 16) {
    return false;
  }
  if (!/^\d{6}$/.test(code)) {
    return false; // 6자리 숫자가 아니면 실패
  }

  try {
    const secretB32 = secret.replace(/\s+/g, "").toUpperCase();
    const otpSecret = OTPAuth.Secret.fromBase32(secretB32);

    // 💡 OTPAuth TOTP 객체 생성 (이전 코드 참고)
    const totp = new OTPAuth.TOTP({
      issuer: "QAI", // 발급자 (Issuer) 설정
      label: email, // 레이블은 이메일 사용
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: otpSecret,
    });

    // window: 2 설정으로 30초 * (2 + 1) = 90초 이내의 토큰 유효성 검사
    const delta = totp.validate({ token: code, window: 2 });

    return delta !== null; // 검증 성공 시 델타 값(숫자) 반환, 실패 시 null 반환
  } catch (e) {
    console.error("OTP validation error:", e);
    return false;
  }
}

// 💡 [추가] 날짜 포맷팅 함수 (클라이언트의 더미 데이터 형식에 맞춤)
function fmtDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 💡 [추가] GET 응답에 포함될 트랜잭션 타입 정의
interface WalletTxItem {
  date: string;
  amount: string;
  network: string; // 'BEP20'으로 가정
  status: "PENDING" | "COMPLETED" | "REJECTED" | string;
}

interface GetWithdrawInfoOk {
  ok: true;
  balances: { USDT: number; QAI: number; DFT: number };
  withdrawAddress: string | null;
  googleOtpEnabled: boolean;
  recentTxs: WalletTxItem[]; // ✅ 트랜잭션 목록 추가
}
type GetWithdrawInfoErr = ErrBody;

// --- GET: 잔액 및 지갑 정보 조회 (출금 페이지 초기 로드용) ---

export async function GET(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      const body: GetWithdrawInfoErr = { ok: false, code: "UNAUTHORIZED" };
      return NextResponse.json(body, { status: 401 });
    }

    // ✅ Wallet 정보와 최근 트랜잭션을 동시에 조회
    const [userData, recentTxs] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          googleOtpEnabled: true,
          wallet: {
            select: {
              withdrawAddress: true,
              balanceUSDT: true,
              balanceQAI: true,
              balanceDFT: true,
            },
          },
        },
      }),
      prisma.walletTx.findMany({
        where: { userId, txType: WalletTxType.WITHDRAW }, // 👈 출금 타입만 조회
        orderBy: [{ createdAt: "desc" }],
        take: 5,
        select: {
          createdAt: true,
          amount: true,
          status: true,
          tokenCode: true,
        },
      }),
    ]);

    if (!userData || !userData.wallet) {
      const body: GetWithdrawInfoErr = {
        ok: false,
        code: "USER_WALLET_NOT_FOUND",
        message: "User wallet not initialized.",
      };
      return NextResponse.json(body, { status: 404 });
    }

    // 트랜잭션 데이터 포맷팅
    const formattedTxs: WalletTxItem[] = recentTxs.map((tx) => ({
      date: fmtDate(tx.createdAt), // 날짜 포맷
      amount: toDecimal(tx.amount).toDecimalPlaces(2).toString(), // 금액 포맷팅
      network: "BEP20", // 네트워크 고정 가정
      status: tx.status as "PENDING" | "COMPLETED" | "REJECTED",
    }));

    const body: GetWithdrawInfoOk = {
      ok: true,
      balances: {
        USDT: toNum(userData.wallet.balanceUSDT),
        QAI: toNum(userData.wallet.balanceQAI),
        DFT: toNum(userData.wallet.balanceDFT),
      },
      withdrawAddress: userData.wallet.withdrawAddress,
      googleOtpEnabled: userData.googleOtpEnabled,
      recentTxs: formattedTxs, // ✅ 데이터 반환
    };

    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    console.error("GET /api/wallet/withdraw failed:", e);
    const body: GetWithdrawInfoErr = {
      ok: false,
      code: "UNKNOWN",
      message: e instanceof Error ? e.message : String(e),
    };
    return NextResponse.json(body, { status: 500 });
  }
}

// --- POST: 출금 신청 처리 ---

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log("DEBUG: Unauthorized access attempt.");
      const body: ErrBody = { ok: false, code: "UNAUTHORIZED" };
      return NextResponse.json(body, { status: 401 });
    }

    const parsed = (await req.json().catch(() => null)) as {
      token?: unknown;
      amount?: unknown;
      otpCode?: unknown;
    } | null;

    const t = String(parsed?.token ?? "").toUpperCase() as TokenCode;
    const otpCode = String(parsed?.otpCode ?? "");

    if (!TOKENS.has(t) || t !== "USDT") {
      const body: ErrBody = {
        ok: false,
        code: "INVALID_TOKEN",
        message: "Unsupported token. Only USDT is allowed.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    const n = Number(parsed?.amount);
    if (!Number.isFinite(n) || n <= 0) {
      const body: ErrBody = {
        ok: false,
        code: "INVALID_AMOUNT",
        message: "Invalid withdrawal amount.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    // ✅ User 정보와 Wallet 정보를 함께 조회 (OTP 검증에 필요한 email 추가)
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true, // 💡 OTP 검증을 위해 email 추가
        googleOtpSecret: true,
        googleOtpEnabled: true,
        wallet: {
          select: {
            withdrawAddress: true,
            balanceUSDT: true, // 잔액 확인용
          },
        },
      },
    });

    if (!u || !u.wallet) {
      const body: ErrBody = {
        ok: false,
        code: "USER_WALLET_NOT_FOUND",
        message: "User wallet not initialized.",
      };
      return NextResponse.json(body, { status: 404 });
    }

    // OTP 검증 사전 체크
    if (!u.googleOtpEnabled || !u.googleOtpSecret) {
      const body: ErrBody = {
        ok: false,
        code: "OTP_NOT_ENABLED",
        message: "Google OTP is not enabled for this account.",
      };
      return NextResponse.json(body, { status: 403 });
    }

    // 🔴 [핵심] Google OTP 코드 검증 실행 (수정된 함수 및 email 인자 사용)
    const isOtpValid = await validateGoogleOtpCode(
      userId,
      u.googleOtpSecret,
      otpCode,
      u.email // 💡 validateGoogleOtpCode 함수에 email 인자 전달
    );

    if (!isOtpValid) {
      const body: ErrBody = {
        ok: false,
        code: "INVALID_OTP",
        message: "Invalid Google OTP code.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    const w = u.wallet;

    if (!w.withdrawAddress) {
      const body: ErrBody = {
        ok: false,
        code: "NO_WITHDRAW_ADDRESS",
        message: "Please register a withdrawal address first.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    // USDT 잔액 확인
    const current = toNum(w.balanceUSDT);

    if (n > current) {
      const body: ErrBody = {
        ok: false,
        code: "INSUFFICIENT_BALANCE",
        message: "Insufficient balance.",
      };
      return NextResponse.json(body, { status: 400 });
    }

    // 트랜잭션 실행
    const [updatedWallet, tx] = await prisma.$transaction([
      prisma.userWallet.update({
        where: { userId },
        data: { balanceUSDT: decSub(w.balanceUSDT, n) },
        select: { balanceUSDT: true },
      }),
      prisma.walletTx.create({
        data: {
          userId,
          tokenCode: t,
          txType: WalletTxType.WITHDRAW,
          amount: new Prisma.Decimal(n).toString(),
          status: WalletTxStatus.PENDING,
          memo: `user requested withdraw. OTP used: true`,
          txHash: null,
          logIndex: null,
          blockNumber: null,
          fromAddress: null,
          toAddress: w.withdrawAddress,
        },
        select: {
          id: true,
          tokenCode: true,
          txType: true,
          amount: true,
          status: true,
          memo: true,
          txHash: true,
          logIndex: true,
          blockNumber: true,
          fromAddress: true,
          toAddress: true,
          createdAt: true,
        },
      }),
    ]);

    const txOut: OkBody["tx"] = {
      id: tx.id,
      tokenCode: String(tx.tokenCode) as TokenCode,
      txType: String(tx.txType),
      amount: tx.amount.toString(),
      status: String(tx.status),
      memo: tx.memo,
      txHash: tx.txHash,
      logIndex: tx.logIndex,
      blockNumber: tx.blockNumber === null ? null : String(tx.blockNumber),
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      createdAt: tx.createdAt.toISOString(),
    };

    const body: OkBody = {
      ok: true,
      tx: txOut,
      balances: {
        USDT: toNum(updatedWallet.balanceUSDT),
        QAI: 0,
        DFT: 0,
      },
    };
    return NextResponse.json(body, { status: 200 });
  } catch (e) {
    const body: ErrBody = {
      ok: false,
      code: "UNKNOWN",
      message: e instanceof Error ? e.message : String(e),
    };
    return NextResponse.json(body, { status: 500 });
  }
}
