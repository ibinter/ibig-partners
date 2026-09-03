-- Migration : EmailSequenceLog
-- Tracker les envois des séquences email automatiques IBIG PARTNERS
-- À appliquer via Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "EmailSequenceLog" (
  "id"       TEXT NOT NULL,
  "userId"   TEXT NOT NULL,
  "sequence" TEXT NOT NULL,  -- ONBOARDING | ACTIVATION | REENGAGE | STATUS_UP
  "step"     TEXT NOT NULL,  -- J0 | J1 | J3 | J7 | J14 | J21 | J30 | J45 | J60 | IMMEDIATE
  "sentAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "emailId"  TEXT,           -- id Resend pour tracking

  CONSTRAINT "EmailSequenceLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmailSequenceLog_userId_sequence_step_key" UNIQUE ("userId", "sequence", "step")
);

CREATE INDEX IF NOT EXISTS "EmailSequenceLog_userId_idx" ON "EmailSequenceLog"("userId");
