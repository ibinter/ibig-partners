import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

const COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Emeraude", value: "#10b981" },
  { label: "Ambre", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Ardoise", value: "#475569" },
  { label: "Noir", value: "#1e293b" },
];

async function saveVitrine(userId: string, formData: FormData) {
  "use server";
  const bannerColor = formData.get("bannerColor") as string;
  const slogan = (formData.get("slogan") as string) || null;
  const showContact = formData.get("showContact") === "on";

  await (prisma as any).partnerVitrine.upsert({
    where: { userId },
    update: { bannerColor, slogan, showContact },
    create: { id: `vit_${userId}`, userId, bannerColor, slogan, showContact },
  });
  revalidatePath("/espace/ma-vitrine");
}

export default async function MaVitrinePage() {
  const user = await requireUser();
  const vitrine = await (prisma as any).partnerVitrine.findUnique({ where: { userId: user.id } });

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <PageHeader title="Ma Vitrine" subtitle="Personnalisez votre page publique visible par vos prospects." />
        <Link href={`/partenaire/${user.code}`} target="_blank"
          className="shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
          👁️ Voir ma vitrine
        </Link>
      </div>

      <div className="rounded-2xl border p-5 space-y-4">
        <p className="text-sm font-semibold">Aperçu du bandeau</p>
        <div className="rounded-xl h-16 flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: vitrine?.bannerColor ?? "#6366f1" }}>
          {vitrine?.slogan || "Votre slogan personnalisé ici"}
        </div>
      </div>

      <form action={saveVitrine.bind(null, user.id)} className="rounded-2xl border p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Couleur du bandeau</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <label key={c.value} className="cursor-pointer">
                <input type="radio" name="bannerColor" value={c.value} defaultChecked={vitrine?.bannerColor === c.value || (!vitrine && c.value === "#6366f1")} className="sr-only" />
                <div className="w-8 h-8 rounded-full border-2 border-white ring-2 ring-offset-1 transition"
                  style={{ backgroundColor: c.value, outline: vitrine?.bannerColor === c.value ? `2px solid ${c.value}` : "none" }}
                  title={c.label} />
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slogan / accroche</label>
          <input name="slogan" defaultValue={vitrine?.slogan ?? ""} maxLength={100}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="ex: Votre partenaire de confiance pour l'immobilier à Abidjan" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="showContact" id="showContact" defaultChecked={vitrine?.showContact ?? true} className="rounded" />
          <label htmlFor="showContact" className="text-sm">Afficher le formulaire de contact sur ma vitrine</label>
        </div>

        <button type="submit" className="rounded-xl bg-indigo-600 text-white px-6 py-2 text-sm font-semibold hover:bg-indigo-700">
          💾 Enregistrer
        </button>
      </form>
    </div>
  );
}
