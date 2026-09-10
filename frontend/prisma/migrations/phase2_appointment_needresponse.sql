-- ============================================================
-- IBIG PARTNERS — Phase 2 : Appointment + NeedResponse unique
-- Migration additive uniquement (aucune suppression)
-- ============================================================

-- ─── 1. Table Appointment (rendez-vous partenaires) ─────────
CREATE TABLE IF NOT EXISTS "Appointment" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "duration"    INTEGER NOT NULL DEFAULT 30,
  "guestName"   TEXT,
  "guestEmail"  TEXT,
  "guestPhone"  TEXT,
  "meetUrl"     TEXT,
  "notes"       TEXT,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Appointment_userId_idx" ON "Appointment"("userId");
CREATE INDEX IF NOT EXISTS "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");

-- ─── 2. Contrainte unique sur NeedResponse (si pas déjà présente) ───────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NeedResponse_needId_userId_key'
  ) THEN
    ALTER TABLE "NeedResponse" ADD CONSTRAINT "NeedResponse_needId_userId_key" UNIQUE ("needId", "userId");
  END IF;
END $$;
