import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublierForm } from "./publier-form";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { value: "COMMERCIAL",       label: "Commercial / Vente" },
  { value: "PARTENARIAT",      label: "Partenariat stratégique" },
  { value: "FORMATION",        label: "Formation / Education" },
  { value: "DIGITAL",          label: "Digital & Tech" },
  { value: "IMMOBILIER",       label: "Immobilier" },
  { value: "FINANCEMENT",      label: "Financement / Crédit" },
  { value: "CONSEIL",          label: "Conseil / Consulting" },
  { value: "EMPLOI_RH",        label: "Emploi & RH" },
  { value: "MISE_EN_RELATION",  label: "Mise en relation" },
  { value: "SERVICES",         label: "Services B2B" },
  { value: "AUTRE",            label: "Autre" },
];

async function publishOpportunity(formData: FormData) {
  "use server";
  const { requireUser: req } = await import("@/lib/auth");
  const user = await req();
  const dashboardUrl = user.role === "ENTERPRISE" ? "/entreprise" : "/espace/opportunites";

  const title                  = String(formData.get("title") || "").trim();
  const category               = String(formData.get("category") || "AUTRE");
  const description            = String(formData.get("description") || "").trim();
  const estimatedValue         = Number(formData.get("estimatedValue") || 0) || 0;
  const deadline               = String(formData.get("deadline") || "").trim();
  const proposedCommission     = Number(formData.get("proposedCommission") || 0) || 0;
  const proposedCommissionType = String(formData.get("proposedCommissionType") || "FIXED");

  if (!title || !description) return;

  // Calcul de la commission en FCFA si le client a saisi un taux
  const commissionFcfa = proposedCommissionType === "PERCENT"
    ? Math.round(estimatedValue * (proposedCommission / 100))
    : proposedCommission;

  await (prisma as any).opportunity.create({
    data: {
      userId: user.id,
      title,
      category,
      description,
      estimatedValue,
      deadline: deadline ? new Date(deadline) : null,
      // Commissions proposées — ne seront PAS modifiées par la suite
      proposedCommission: commissionFcfa,
      proposedCommissionType,
      // Commission finale = proposée par défaut, IBIG peut la renégocier
      commission: commissionFcfa,
      commissionType: "FIXED", // toujours stockée en FCFA après calcul
      status: "NEW",
      visibility: "PRIVATE",
    },
  });

  revalidatePath("/entreprise");
  revalidatePath("/espace/opportunites");
  redirect(`${dashboardUrl}?publiee=1`);
}

export default async function PublierPage() {
  const user = await requireUser();
  const backLink = user.role === "ENTERPRISE" ? "/entreprise" : "/espace";
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a href={backLink} className="text-sm text-blue-600 hover:underline">← Tableau de bord</a>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Publier une opportunité</h1>
        <p className="text-slate-500 text-sm mt-1">
          Décrivez votre besoin — IBIG diffuse votre annonce au réseau et coordonne les mises en relation.
        </p>
      </div>
      <PublierForm categories={CATEGORIES} action={publishOpportunity} />
    </div>
  );
}
