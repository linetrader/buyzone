import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  computeDepthForChild,
  decideGroupNoOrThrow,
  ensureParentGroupSummary,
} from "./referral";
import { generateReferralCode } from "./helpers";
import type { Prisma } from "@/generated/prisma";

export type SignupServiceInput = {
  username: string;
  email: string;
  password: string;
  name: string;
  countryCode: string | null;
  /** ✅ 필수: 추천인 ID */
  referrerId: string;
  /** ✅ 필수: 후원인 ID (없을 경우 로직에 따라 처리, 여기서는 nullable로 둠) */
  sponsorId: string | null;
  requestedGroupNo?: number | null;
};

function getErrorCode(e: unknown): string | undefined {
  if (typeof e === "object" && e !== null && "code" in e) {
    const code = (e as Record<string, unknown>).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

function extractUniqueTarget(e: unknown): string | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  const meta = (e as Record<string, unknown>).meta;
  if (meta && typeof meta === "object" && "target" in (meta as object)) {
    const t = (meta as Record<string, unknown>).target;
    if (Array.isArray(t)) return t.join(",");
    if (typeof t === "string") return t;
  }
  return undefined;
}

// 추천 조직도상 다음 포지션 계산
async function getNextPosition(
  tx: Prisma.TransactionClient,
  parentId: string,
  groupNo: number
): Promise<number> {
  const agg = await tx.referralEdge.aggregate({
    where: { parentId, groupNo },
    _max: { position: true },
  });
  const currentMax = agg._max.position ?? 0;
  return currentMax + 1;
}

export async function signupWithTransaction(input: SignupServiceInput) {
  const {
    username,
    email,
    password,
    name,
    countryCode,
    referrerId,
    sponsorId, // ✅ 후원인 ID
    requestedGroupNo,
  } = input;

  const passwordHash = await bcrypt.hash(password, 12);

  const MAX_RETRY = 3;
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const referralCode = generateReferralCode();

    try {
      const user = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // 1) User 생성
          const u = await tx.user.create({
            data: {
              username,
              email,
              name,
              passwordHash,
              countryCode,
              referrerId, // ✅ 추천인 연결
              sponsorId,  // ✅ 후원인 연결 (DB에 저장됨)
              referralCode,
            },
            select: {
              id: true,
              username: true,
              email: true,
              name: true,
              countryCode: true,
              referrerId: true,
              sponsorId: true,
              referralCode: true,
              createdAt: true,
            },
          });

          // 2) Wallet 생성
          await tx.userWallet.create({ data: { userId: u.id } });

          // 3) Reward Summary 생성
          await tx.userRewardSummary.create({ data: { userId: u.id } });

          // 4) Referral Stats 생성
          await tx.userReferralStats.create({ data: { userId: u.id } });

          // 5) ✅ 추천 조직도 (Referral Edge) 생성
          const depth = await computeDepthForChild(tx, referrerId);
          const finalGroupNo = await decideGroupNoOrThrow({
            tx,
            parentId: referrerId,
            requested: requestedGroupNo ?? null,
          });
          const position = await getNextPosition(tx, referrerId, finalGroupNo);

          await tx.referralEdge.create({
            data: {
              parentId: referrerId,
              childId: u.id,
              groupNo: finalGroupNo,
              position,
              depth,
            },
          });

          // 부모 그룹 요약 업데이트
          await ensureParentGroupSummary(tx, referrerId, finalGroupNo);

          /* ✅ 후원 조직도 (Sponsor Tree) 관련 로직이 필요하다면 여기에 추가 
             예: SponsorEdge 생성 등. 현재는 User 테이블의 sponsorId 필드에 저장하는 것으로 충분하다고 가정.
          */

          return u;
        }
      );

      return { ok: true as const, user };
    } catch (e: unknown) {
      const code = getErrorCode(e);

      // Unique Constraint Violation (P2002) 처리
      if (code === "P2002") {
        const target = extractUniqueTarget(e);
        
        // 추천코드 중복 시 재시도
        if (typeof target === "string" && target.includes("referralCode")) {
          if (attempt < MAX_RETRY - 1) {
            continue;
          }
        }
        
        // 그 외 중복 (아이디, 이메일 등)
        return { ok: false as const, code: "VALIDATION_ERROR" as const };
      }

      if (code === "INVALID_REQUESTED_GROUP_NO") {
        return {
          ok: false as const,
          code: "INVALID_REQUESTED_GROUP_NO" as const,
        };
      }

      console.error("Signup Transaction Error:", e); // 디버깅용 로그
      return { ok: false as const, code: "UNKNOWN" as const };
    }
  }

  return { ok: false as const, code: "UNKNOWN" as const };
}