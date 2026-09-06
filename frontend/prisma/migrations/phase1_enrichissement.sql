-- ============================================================
-- IBIG PARTNERS — Phase 1 : Extension & Enrichissement
-- Migration additive uniquement (aucune suppression)
-- ============================================================

-- ─── 1. Extension du modèle Mission ────────────────────────
ALTER TABLE "Mission"
  ADD COLUMN IF NOT EXISTS "code"               TEXT,
  ADD COLUMN IF NOT EXISTS "branch"             TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "rewardType"         TEXT NOT NULL DEFAULT 'CASH',
  ADD COLUMN IF NOT EXISTS "cpAmount"           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "rewardTrigger"      TEXT NOT NULL DEFAULT 'VALIDATION',
  ADD COLUMN IF NOT EXISTS "minLevel"           TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "proofInstructions"  TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "active"             BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "adminNote"          TEXT;

-- missionType étendu (valeur par défaut déjà présente, pas d'ALTER nécessaire)
-- Les nouvelles valeurs (SOURCING, MISE_EN_RELATION, etc.) sont du texte libre

-- ─── 2. Extension du modèle MissionApplication ─────────────
ALTER TABLE "MissionApplication"
  ADD COLUMN IF NOT EXISTS "proofUrl"           TEXT,
  ADD COLUMN IF NOT EXISTS "proofNote"          TEXT,
  ADD COLUMN IF NOT EXISTS "submittedAt"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "validatedAt"        TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "validatedBy"        TEXT,
  ADD COLUMN IF NOT EXISTS "cpEarned"           INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "commissionEarned"   INTEGER NOT NULL DEFAULT 0;

-- Index pour la performance
CREATE INDEX IF NOT EXISTS "MissionApplication_userId_idx" ON "MissionApplication"("userId");
CREATE INDEX IF NOT EXISTS "MissionApplication_missionId_idx" ON "MissionApplication"("missionId");

-- ─── 3. Extension du modèle PointTransaction ────────────────
ALTER TABLE "PointTransaction"
  ADD COLUMN IF NOT EXISTS "type"                  TEXT NOT NULL DEFAULT 'CREDIT',
  ADD COLUMN IF NOT EXISTS "missionApplicationId"  TEXT,
  ADD COLUMN IF NOT EXISTS "adminId"               TEXT,
  ADD COLUMN IF NOT EXISTS "adminNote"             TEXT;

CREATE INDEX IF NOT EXISTS "PointTransaction_userId_idx" ON "PointTransaction"("userId");

-- ─── 4. Extension du modèle Reward (Boutique) ───────────────
ALTER TABLE "Reward"
  ADD COLUMN IF NOT EXISTS "category"     TEXT NOT NULL DEFAULT 'AUTRE',
  ADD COLUMN IF NOT EXISTS "validityDays" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "conditions"   TEXT;

-- ─── 5. Extension du modèle RewardClaim ─────────────────────
ALTER TABLE "RewardClaim"
  ADD COLUMN IF NOT EXISTS "adminNote"    TEXT,
  ADD COLUMN IF NOT EXISTS "processedAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "processedBy"  TEXT;

CREATE INDEX IF NOT EXISTS "RewardClaim_userId_idx" ON "RewardClaim"("userId");

-- ─── 6. Nouveau modèle : PartnerLevel ───────────────────────
CREATE TABLE IF NOT EXISTS "PartnerLevel" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "label"     TEXT NOT NULL,
  "minCp"     INTEGER NOT NULL DEFAULT 0,
  "color"     TEXT NOT NULL DEFAULT '#6366f1',
  "perks"     TEXT NOT NULL DEFAULT '',
  "order"     INTEGER NOT NULL DEFAULT 0,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PartnerLevel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PartnerLevel_name_key" ON "PartnerLevel"("name");

-- Données initiales des 5 niveaux
INSERT INTO "PartnerLevel" ("id", "name", "label", "minCp", "color", "perks", "order", "active", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'CONNECTEUR',       'Connecteur',       0,    '#64748b', 'Accès aux missions d''entrée|Support email standard|Kit marketing de base', 1, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'PARTNER',           'Partner',          100,  '#3b82f6', 'Catalogue élargi|Support prioritaire|Formation avancée|Badge Partner', 2, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'BUSINESS_PARTNER',  'Business Partner', 500,  '#10b981', 'Missions avancées|Manager dédié|Commission boostée|Badge Business Partner', 3, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'PREMIUM_PARTNER',   'Premium Partner',  1500, '#f59e0b', 'Missions premium|Accès événements|Commission N2 boostée|Badge Premium', 4, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'ELITE_PARTNER',     'Elite Partner',    3000, '#8b5cf6', 'Opportunités stratégiques|Accès VIP|Invitation dîner IBIG|Badge Elite', 5, true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- ─── 7. Nouveau modèle : BonusRule ──────────────────────────
CREATE TABLE IF NOT EXISTS "BonusRule" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "type"        TEXT NOT NULL DEFAULT 'MANUAL',
  "cpAmount"    INTEGER NOT NULL DEFAULT 0,
  "cashAmount"  INTEGER NOT NULL DEFAULT 0,
  "conditions"  TEXT,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "startAt"     TIMESTAMP(3),
  "endAt"       TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BonusRule_pkey" PRIMARY KEY ("id")
);

-- ─── 8. Nouveau modèle : BonusTransaction ───────────────────
CREATE TABLE IF NOT EXISTS "BonusTransaction" (
  "id"         TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "ruleId"     TEXT,
  "cpAmount"   INTEGER NOT NULL DEFAULT 0,
  "cashAmount" INTEGER NOT NULL DEFAULT 0,
  "reason"     TEXT NOT NULL,
  "adminId"    TEXT,
  "adminNote"  TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BonusTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BonusTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT,
  CONSTRAINT "BonusTransaction_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "BonusRule"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "BonusTransaction_userId_idx" ON "BonusTransaction"("userId");
CREATE INDEX IF NOT EXISTS "BonusTransaction_ruleId_idx" ON "BonusTransaction"("ruleId");

-- ─── 9. Nouveau modèle : MissionDuplicate ───────────────────
CREATE TABLE IF NOT EXISTS "MissionDuplicate" (
  "id"             TEXT NOT NULL,
  "missionId"      TEXT NOT NULL,
  "applicationId"  TEXT NOT NULL,
  "conflictAppId"  TEXT,
  "phone"          TEXT,
  "email"          TEXT,
  "company"        TEXT,
  "status"         TEXT NOT NULL DEFAULT 'PENDING',
  "adminNote"      TEXT,
  "resolvedAt"     TIMESTAMP(3),
  "resolvedBy"     TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MissionDuplicate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MissionDuplicate_missionId_fkey"     FOREIGN KEY ("missionId")     REFERENCES "Mission"("id")            ON DELETE CASCADE,
  CONSTRAINT "MissionDuplicate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "MissionApplication"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "MissionDuplicate_missionId_idx"     ON "MissionDuplicate"("missionId");
CREATE INDEX IF NOT EXISTS "MissionDuplicate_applicationId_idx" ON "MissionDuplicate"("applicationId");

-- ─── FK optionnelle : PointTransaction → MissionApplication ─
ALTER TABLE "PointTransaction"
  ADD CONSTRAINT IF NOT EXISTS "PointTransaction_missionApplicationId_fkey"
  FOREIGN KEY ("missionApplicationId") REFERENCES "MissionApplication"("id") ON DELETE SET NULL;
