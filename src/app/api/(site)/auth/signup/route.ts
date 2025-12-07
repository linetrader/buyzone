// src/app/api/(site)/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  signupSchema,
  type ApiErrCode,
  type SignupInput,
  type SignupResponse,
} from "@/types/auth";
import { normalizeInput } from "./helpers";
import {
  resolveUserIdByUsernameOrReferral,
  ensureParentGroupSummaryForChildSignup,
} from "./referral";
import { signupWithTransaction } from "./service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // 0) 입력 파싱
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const {
    username,
    email,
    password,
    name,
    referrer, // ✅ 필수
    sponsor, // ✅ 필수로 변경
    countryCode,
    groupNo,
  }: SignupInput = parsed.data;

  const uname = normalizeInput(username).toLowerCase();
  const em = normalizeInput(email).toLowerCase();
  const nm = normalizeInput(name);
  const ref = normalizeInput(referrer);
  const spon = normalizeInput(sponsor ?? "");
  const ccRaw = normalizeInput(countryCode ?? "");

  // groupNo 검증
  if (groupNo != null && (!Number.isInteger(groupNo) || groupNo <= 0)) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "INVALID_REQUESTED_GROUP_NO" },
      { status: 400 }
    );
  }

  // ✅ referrer/sponsor 입력 필수(서버 강제)
  if (!ref) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "REFERRER_REQUIRED" },
      { status: 400 }
    );
  }
  if (!spon) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "SPONSOR_REQUIRED" },
      { status: 400 }
    );
  }

  // 1) 중복 검사
  const [duUser, duEmail] = await Promise.all([
    prisma.user.findUnique({ where: { username: uname } }),
    prisma.user.findUnique({ where: { email: em } }),
  ]);
  if (duUser) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "USERNAME_TAKEN" },
      { status: 409 }
    );
  }
  if (duEmail) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "EMAIL_TAKEN" },
      { status: 409 }
    );
  }

  // 2) 국가 코드 확인
  let normalizedCountryCode: string | null = null;
  if (ccRaw) {
    if (!/^[A-Za-z]{2}$/.test(ccRaw)) {
      return NextResponse.json<SignupResponse>(
        { ok: false, code: "COUNTRY_CODE_INVALID" },
        { status: 400 }
      );
    }
    normalizedCountryCode = ccRaw.toUpperCase();
    const country = await prisma.country.findUnique({
      where: { code: normalizedCountryCode },
      select: { code: true },
    });
    if (!country) {
      return NextResponse.json<SignupResponse>(
        { ok: false, code: "COUNTRY_NOT_FOUND" },
        { status: 400 }
      );
    }
  }

  // 3) 추천인 ID 확인 (필수)
  const referrerId = await resolveUserIdByUsernameOrReferral(ref);
  if (!referrerId) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "REFERRER_NOT_FOUND" },
      { status: 400 }
    );
  }

  // 4) 후원인 ID 확인 (필수)
  const sponsorId = await resolveUserIdByUsernameOrReferral(spon);
  if (!sponsorId) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "SPONSOR_NOT_FOUND" },
      { status: 400 }
    );
  }

  // 5) 트랜잭션 서비스 실행
  const result = await signupWithTransaction({
    username: uname,
    email: em,
    password,
    name: nm,
    countryCode: normalizedCountryCode,
    referrerId,
    sponsorId,
    requestedGroupNo: groupNo ?? null,
  });

  if (!result.ok) {
    const raw = result.code as string;
    const code = raw as ApiErrCode;

    const status =
      code === "INVALID_REQUESTED_GROUP_NO"
        ? 400
        : code === "VALIDATION_ERROR"
        ? 409
        : code === "SPONSOR_CHILD_LIMIT_REACHED"
        ? 409
        : 500;

    return NextResponse.json<SignupResponse>({ ok: false, code }, { status });
  }

  // 6) 후속 처리 (Referral GroupSummary 보장)
  try {
    await ensureParentGroupSummaryForChildSignup(result.user.id);
  } catch (e) {
    console.warn("[signup] ensureParentGroupSummaryForChildSignup failed:", e);
  }

  const res = NextResponse.json<SignupResponse>(
    { ok: true, user: result.user },
    { status: 201 }
  );
  res.headers.set("Location", `/api/users/${result.user.id}`);
  return res;
}
