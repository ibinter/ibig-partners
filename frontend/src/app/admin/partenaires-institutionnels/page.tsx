import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  BANK:       "Banque & Finance",
  NGO:        "ONG / Organisation",
  GOVERNMENT: "Institution publique",
  COMPANY:    "Entreprise",
  UNIVERSITY: "Université / École",
  OTHER:      "Autre",
};

const CATEGORY_TONES: Record<string, "blue" | "green" | "amber" | "gray"> = {
  BANK: "blue", NGO: "green", GOVERNMENT: "amber", COMPANY: "blue", UNIVERSITY: "green", OTHER: "gray",
};

export default async function InstitutionalPartnersPage() {
  await requireAdmin();

  const partners = await (prisma as any).institutionalPartner.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Partenaires institutionnels"
          subtitle={`${partners.length} partenaire${partners.length !== 1 ? "s" : ""} affiché${partners.length !== 1 ? "s" : ""} sur la page publique`}
        />
        <Link
          href="/admin/partenaires-institutionnels/nouveau"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Ajouter
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-3xl mb-3">🤝</p>
          <p className="font-semibold text-ink mb-1">Aucun partenaire institutionnel</p>
          <p className="text-sm text-muted mb-4">Ajoutez des institutions, banques, ONG ou entreprises partenaires.</p>
          <Link
            href="/admin/partenaires-institutionnels/nouveau"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            + Ajouter le premier
          </Link>
        </div>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-3 py-3">Catégorie</th>
                  <th className="px-3 py-3">Localisation</th>
                  <th className="px-3 py-3">Ordre</th>
                  <th className="px-3 py-3">Statut</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {partners.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logoUrl} alt={p.name} className="h-9 w-9 rounded-lg object-contain border border-slate-100 bg-slate-50 p-0.5 shrink-0" />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {p.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-ink">{p.name}</p>
                          {p.website && (
                            <p className="text-xs text-muted">{p.website.replace(/^https?:\/\//, "")}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={CATEGORY_TONES[p.category] ?? "gray"}>
                        {CATEGORY_LABELS[p.category] ?? p.category}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {[p.city, p.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-xs font-mono text-muted">{p.order}</td>
                    <td className="px-3 py-3">
                      <Badge tone={p.active ? "green" : "gray"}>
                        {p.active ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/admin/partenaires-institutionnels/${p.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        Modifier →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-muted">
        Ces partenaires apparaissent sur la <Link href="/partenaires" target="_blank" className="text-blue-600 hover:underline">page publique /partenaires</Link>.
        L&apos;ordre d&apos;affichage est contrôlé par le champ &ldquo;Ordre&rdquo; (plus petit = en premier).
      </p>
    </div>
  );
}
