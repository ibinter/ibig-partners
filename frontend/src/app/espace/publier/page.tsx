import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublierForm } from "@/app/entreprise/publier/publier-form";

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
  const imageUrl               = String(formData.get("imageUrl") || "").trim() || null;
  const imagesJson             = String(formData.get("imagesJson") || "").trim() || null;

  if (!title || !description) return;

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
      proposedCommission: commissionFcfa,
      proposedCommissionType,
      commission: commissionFcfa,
      commissionType: "FIXED",
      status: "NEW",
      visibility: "PRIVATE",
      ...(imageUrl ? { imageUrl } : {}),
      ...(imagesJson ? { imagesJson } : {}),
    },
  });

  revalidatePath("/entreprise");
  revalidatePath("/espace/opportunites");
  redirect(`${dashboardUrl}?publiee=1`);
}

export default async function EspacePublierPage() {
  const user = await requireUser();
  const backLink = user.role === "ENTERPRISE" ? "/entreprise" : "/espace/opportunites";
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a href={backLink} className="text-sm text-blue-600 hover:underline">← Retour</a>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Publier une opportunité</h1>
        <p className="text-slate-500 text-sm mt-1">
          Décrivez votre besoin — IBIG diffuse votre annonce au réseau et coordonne les mises en relation.
        </p>
      </div>
      <PublierForm categories={CATEGORIES} action={publishOpportunity} />
    </div>
  );
}
