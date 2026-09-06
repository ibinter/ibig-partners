import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function signContract(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "unknown";
  const confirmed = fd.get("confirmed") === "on";
  if (!confirmed) return;
  await (prisma as any).contract.upsert({
    where: { userId: user.id },
    create: { id: `ctr_${user.id}`, userId: user.id, signedAt: new Date(), ipAddress: ip, confirmed: true },
    update: { signedAt: new Date(), ipAddress: ip, confirmed: true },
  });
  revalidatePath("/espace/contrat");
}

export default async function ContratPage() {
  const user = await requireUser();
  const contract = await (prisma as any).contract.findUnique({ where: { userId: user.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="Contrat partenaire" subtitle="Lisez et signez votre contrat de partenariat IBIG." />

      <Card>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 space-y-4 max-h-[60vh] overflow-y-auto">
          <h2 className="text-base font-bold text-slate-900">CONTRAT DE PARTENARIAT IBIG PARTNERS</h2>
          <p><strong>Entre :</strong> IBIG SARL, ci-après « IBIG », et le partenaire soussigné, ci-après « le Partenaire ».</p>

          <h3 className="font-semibold">Article 1 — Objet</h3>
          <p>Le présent contrat définit les conditions dans lesquelles le Partenaire s'engage à promouvoir les produits et services d'IBIG en tant qu'affilié indépendant, et à percevoir des commissions sur les ventes générées.</p>

          <h3 className="font-semibold">Article 2 — Obligations du Partenaire</h3>
          <p>Le Partenaire s'engage à :<br />
          — Promouvoir les produits IBIG de manière éthique et conforme à la législation en vigueur ;<br />
          — Ne pas tenir de propos diffamatoires ou trompeurs sur IBIG ou ses produits ;<br />
          — Déclarer honnêtement toutes les ventes réalisées ;<br />
          — Respecter la politique de confidentialité d'IBIG.</p>

          <h3 className="font-semibold">Article 3 — Commissions</h3>
          <p>Le Partenaire perçoit des commissions selon la grille tarifaire en vigueur sur la plateforme. Les commissions sont versées selon le seuil minimum défini dans les paramètres du compte, via le mode de paiement sélectionné.</p>

          <h3 className="font-semibold">Article 4 — Parrainage multi-niveaux</h3>
          <p>Le Partenaire bénéficie de commissions de parrainage sur 3 niveaux pour tout partenaire recruté ayant réalisé des ventes. Les taux sont définis par IBIG et peuvent être révisés avec un préavis de 30 jours.</p>

          <h3 className="font-semibold">Article 5 — Durée et résiliation</h3>
          <p>Ce contrat est valable pour une durée indéterminée. Il peut être résilié par l'une ou l'autre des parties avec un préavis de 30 jours. IBIG se réserve le droit de suspendre immédiatement un compte en cas de fraude ou violation grave.</p>

          <h3 className="font-semibold">Article 6 — Droit applicable</h3>
          <p>Le présent contrat est régi par le droit ivoirien. Tout litige sera soumis aux tribunaux compétents d'Abidjan.</p>

          <p className="text-xs text-slate-400">Version 1.0 — {new Date().getFullYear()} IBIG SARL. Tous droits réservés.</p>
        </div>

        {contract?.confirmed ? (
          <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-emerald-800">Contrat signé électroniquement</p>
              <p className="text-xs text-emerald-600">
                Signé le {new Date(contract.signedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {contract.ipAddress ? ` · IP: ${contract.ipAddress}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <form action={signContract} className="mt-5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="confirmed" required className="mt-0.5 accent-blue-600" />
              <span className="text-sm text-slate-700">
                J'ai lu et j'accepte les termes du contrat de partenariat IBIG. Je confirme que les informations de mon compte sont exactes et que je suis majeur(e).
              </span>
            </label>
            <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">
              ✍️ Signer électroniquement
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
