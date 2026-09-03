-- Ajoute les colonnes de suivi prospect : rappel J+3/J+7 et date de dernier contact
ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "reminderAt" TIMESTAMP(3);
ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "lastContactedAt" TIMESTAMP(3);
ALTER TABLE "Prospect" ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'NORMAL';
-- priority: LOW | NORMAL | HIGH
