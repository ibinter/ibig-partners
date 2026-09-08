import { requireEnterprise } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { value: "COMMERCIAL",   label: "Commercial / Vente" },
  { value: "PARTENARIAT",  label: "Partenariat stratégique" },
  { value: "FORMATION",    label: "Formation / Education" },
  { value: "DIGITAL",      label: "Digital & Tech" },
  { value: "IMMOBILIER",   label: "Immobilier" },
  { value: "FINANCEMENT",  label: "Financement / Crédit" },
  { value: "CONSEIL",      label: "Conseil / Consulting" },
  { value: "EMPLOI_RH",   label: "Emploi & RH" },
  { value: "MISE_EN_RELATION", label: "Mise en relation" },
  { value: "AUTRE",        label: "Autre" },
];

async function publishOpportunity(formData: FormData) {
  "use server";
  const { requireEnterprise: req } = await import("@/lib/auth");
  const user = await req();

  const title       = String(formData.get("title") || "").trim();
  const category    = String(formData.get("category") || "AUTRE");
  const description = String(formData.get("description") || "").trim();
  const estimatedValue = Number(formData.get("estimatedValue") || 0) || 0;
  const deadline    = String(formData.get("deadline") || "").trim();
  const proposedCommission = Number(formData.get("proposedCommission") || 0) || 0;
  const proposedCommissionType = String(formData.get("proposedCommissionType") || "FIXED");

  if (!title || !description) return;

  await (prisma as any).opportunity.create({
    data: {
      userId: user.id,
      title,
      category,
      description,
      estimatedValue,
      deadline: deadline ? new Date(deadline) : null,
      commission: proposedCommission,
      commissionType: proposedCommissionType,
      status: "NEW",
      visibility: "PRIVATE",
    },
  });

  revalidatePath("/entreprise");
  redirect("/entreprise?publiee=1");
}

export default async function PublierPage() {
  await requireEnterprise();

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/entreprise" className="text-sm text-blue-600 hover:underline">← Tableau de bord</a>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Publier une opportunité</h1>
        <p className="text-slate-500 text-sm mt-1">
          Décrivez votre besoin — IBIG le diffuse à son réseau et coordonne les mises en relation.
        </p>
      </div>

      <form action={publishOpportunity} className="space-y-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div>
          <label className={labelCls}>Titre de l'opportunité *</label>
          <input name="title" required placeholder="Ex : Recherche distributeur Côte d'Ivoire" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Catégorie *</label>
          <select name="category" required className={inputCls}>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Description complète *</label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Décrivez votre besoin : qui vous cherchez, dans quelle zone, quel budget, quelles conditions…"
            className={inputCls + " resize-none"}
          />
          <p className="text-xs text-slate-400 mt-1">Plus la description est précise, plus les mises en relation seront pertinentes.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Valeur estimée du deal (FCFA)</label>
            <input name="estimatedValue" type="number" min="0" placeholder="Ex : 5000000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Deadline</label>
            <input name="deadline" type="date" className={inputCls} />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <p className="text-sm font-bold text-amber-800">💰 Budget mise en relation (optionnel)</p>
          <p className="text-xs text-amber-700">
            Indiquez ce que vous êtes prêt(e) à verser à IBIG pour la mise en relation réussie.
            Ce montant sera confirmé par notre équipe avant diffusion.
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <input name="proposedCommission" type="number" min="0" placeholder="Ex : 150000" className={inputCls} />
            </div>
            <select name="proposedCommissionType" className={inputCls + " w-auto"}>
              <option value="FIXED">FCFA fixe</option>
              <option value="PERCENT">% de la valeur</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
          <strong>Comment ça marche :</strong> Après soumission, l'équipe IBIG valide votre opportunité
          sous 24–48h, la diffuse au réseau, et coordonne les mises en relation. Vous ne payez que sur résultat.
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 text-sm transition shadow-sm"
        >
          📤 Soumettre à l'équipe IBIG
        </button>
      </form>
    </div>
  );
}
