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
    sponsor,  // ✅ 선택 (없으면 null/빈문자열)
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

  // 1) 중복 검사 (DB)
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

  // 3) 추천인(Referrer) ID 확인 (필수)
  const referrerId = await resolveUserIdByUsernameOrReferral(ref);
  if (!referrerId) {
    return NextResponse.json<SignupResponse>(
      { ok: false, code: "REFERRER_NOT_FOUND" },
      { status: 400 }
    );
  }

  // 4) 후원인(Sponsor) ID 확인 (입력된 경우만)
  let sponsorId: string | null = null;
  if (spon) {
    sponsorId = await resolveUserIdByUsernameOrReferral(spon);
    if (!sponsorId) {
      return NextResponse.json<SignupResponse>(
        { ok: false, code: "SPONSOR_NOT_FOUND" }, // 프론트엔드 에러 코드와 매칭됨
        { status: 400 }
      );
    }
  }
  
  /* * [수정됨] 추천인과 후원인이 같을 수 없다는 제약조건을 제거했습니다.
   * 보통 추천인이 곧 후원인(배치상위자)이 되는 경우가 많으므로 허용하는 것이 일반적입니다.
   */

  // 5) 트랜잭션 서비스 실행
  const result = await signupWithTransaction({
    username: uname,
    email: em,
    password,
    name: nm,
    countryCode: normalizedCountryCode,
    referrerId, // ✅ 필수
    sponsorId,  // ✅ 전달 (null 가능)
    requestedGroupNo: groupNo ?? null,
  });

  if (!result.ok) {
    const raw = result.code as string;
    const code: ApiErrCode =
      raw === "GROUP_NO_TAKEN" ? "VALIDATION_ERROR" : (raw as ApiErrCode);

    const status =
      code === "INVALID_REQUESTED_GROUP_NO"
        ? 400
        : code === "VALIDATION_ERROR"
        ? 409
        : 500;

    return NextResponse.json<SignupResponse>({ ok: false, code }, { status });
  }

  // 6) 후속 처리 (GroupSummary 보장)
  try {
    await ensureParentGroupSummaryForChildSignup(result.user.id);
  } catch (e) {
    console.warn("[signup] ensureParentGroupSummaryForChildSignup failed:", e);
  }

  // 성공 응답
  const res = NextResponse.json<SignupResponse>(
    { ok: true, user: result.user },
    { status: 201 }
  );
  res.headers.set("Location", `/api/users/${result.user.id}`);
  return res;
}