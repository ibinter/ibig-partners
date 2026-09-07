import { prisma } from "./prisma";

export type ActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "OTP_SENT"
  | "OTP_VERIFIED"
  | "REGISTER"
  | "SALE_DECLARED"
  | "SALE_CONFIRMED"
  | "MISSION_APPLIED"
  | "MISSION_PROOF_SUBMITTED"
  | "PROFILE_UPDATE"
  | "PASSWORD_RESET"
  | "KYC_SUBMITTED"
  | "OPPORTUNITY_CREATED"
  | "CONNECT_REQUEST"
  | "PAYOUT_REQUESTED";

interface LogActivityOptions {
  userId?: string;
  action: ActivityAction;
  detail?: string | Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function logActivity(opts: LogActivityOptions): Promise<void> {
  try {
    const detail =
      opts.detail && typeof opts.detail === "object"
        ? JSON.stringify(opts.detail)
        : (opts.detail as string | undefined);

    await (prisma as any).activityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: opts.userId ?? null,
        action: opts.action,
        detail: detail ?? null,
        ip: opts.ip ?? null,
        userAgent: opts.userAgent ?? null,
      },
    });
  } catch {
    // jamais crasher — le logging est best-effort
  }
}
