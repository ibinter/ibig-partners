-- Migration: ajouter partnerCommission (commission IBIG → partenaire, publique)
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "partnerCommission" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Opportunity" ADD COLUMN IF NOT EXISTS "partnerCommissionType" TEXT NOT NULL DEFAULT 'FIXED';
