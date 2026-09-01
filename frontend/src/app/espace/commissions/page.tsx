import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate, pct } from "@/lib/format";
import { PageHeader, statusTone } from "@/components/ui";
import { COMMISSION_STATUS_LABELS, MIN_PAYOUT } from "@/lib/constants";
import { ExportExcelButton, ExportPDFButton } from "@/components/export-buttons";
import CommissionsTable from "./commissions-client";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const user = await requireUser();

  const commissions = await prisma.commission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { sale: { include: { product: true } } },
  });

  /* ── Totaux par statut ── */
  const sum = (status: string) =>
    commissions.filter((c) => c.status === status).reduce((a, c) => a + c.amount, 0);
  const pending   = sum("PENDING");
  const validated = sum("VALIDATED");
  const paid      = sum("PAID");
  const payable   = pending + validated;
  const total     = pending + validated + paid;

  /* ── Totaux par niveau ── */
  const byLevel = [1, 2, 3].map((lvl) => ({
    lvl,
    amount: commissions.filter((c) => c.level === lvl).reduce((a, c) => a + c.amount, 0),
    count: commissions.filter((c) => c.level === lvl).length,
  }));

  /* ── Top produits ── */
  const byProduct: Record<string, { name: string; amount: number; count: number }> = {};
  for (const c of commissions) {
    const n = c.sale.product.name;
    if (!byProduct[n]) byProduct[n] = { name: n, amount: 0, count: 0 };
    byProduct[n].amount += c.amount;
    byProduct[n].count++;
  }
  const topProducts = Object.values(byProduct)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
  const maxAmount = Math.max(...topProducts.map((p) => p.amount), 1);

  /* ── Progression seuil ── */
  const seuilPct = Math.min(100, Math.round((payable / MIN_PAYOUT) * 100));
  const seuilReached = payable >= MIN_PAYOUT;

  /* ── Sérialisation pour le composant client ── */
  const rows = commissions.map((c) => ({
    id: c.id,
    reference: c.sale.reference,
    productName: c.sale.product.name,
    pricingType: c.sale.pricingType,
    level: c.level,
    monthIndex: c.monthIndex ?? null,
    rate: c.rate,
    amount: c.amount,
    status: c.status,
    statusLabel: COMMISSION_STATUS_LABELS[c.status] ?? c.status,
    statusTone: statusTone(c.status),
    date: formatDate(c.createdAt),
    amountDisplay: fcfa(c.amount),
    rateDisplay: pct(c.rate),
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Commissions"
        subtitle={`Seuil de versement : ${fcfa(MIN_PAYOUT)} · Paiement sous 7 jours ouvrables`}
        action={
          <div className="flex flex-wrap gap-2">
            <ExportExcelButton
              data={commissions.map((c) => ({
                Produit: c.sale.product.name,
                "Réf. vente": c.sale.reference,
                Niveau: `N${c.level}`,
                Mois: c.monthIndex ?? 1,
                "Taux (%)": c.rate,
                "Montant (FCFA)": c.amount,
                Statut: COMMISSION_STATUS_LABELS[c.status] ?? c.status,
                Date: formatDate(c.createdAt),
              }))}
              filename={`commissions-${user.code}`}
              label="Excel"
            />
            <ExportPDFButton
              title={`Commissions — ${user.firstName} ${user.lastName} (${user.code})`}
              columns={["Produit", "Réf.", "Niv.", "Taux", "Montant", "Statut", "Date"]}
              rows={commissions.map((c) => [
                c.sale.product.name,
                c.sale.reference,
                `N${c.level}`,
                `${c.rate}%`,
                `${c.amount.toLocaleString("fr-FR")} FCFA`,
                COMMISSION_STATUS_LABELS[c.status] ?? c.status,
                formatDate(c.createdAt),
              ])}
              filename={`commissions-${user.code}`}
              label="PDF"
            />
            <a
              href="/espace/commissions/releve"
              target="_blank"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              🖨 Relevé imprimable
            </a>
          </div>
        }
      />

      {/* ── 4 KPI cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Total cumulé</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(total)}</p>
          <p className="mt-0.5 text-xs text-slate-400">{commissions.length} commission{commissions.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">En attente</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(pending)}</p>
          <p className="mt-0.5 text-xs text-amber-100">en cours de validation</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Validées (à verser)</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(validated)}</p>
          <p className="mt-0.5 text-xs text-blue-200">prêtes au paiement</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Versées</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(paid)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">déjà perçues</p>
        </div>
      </div>

      {/* ── Seuil de versement + CTA retrait ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">
              {seuilReached ? "✅ Seuil atteint — versement possible" : "Progression vers le seuil de versement"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {fcfa(payable)} disponibles sur {fcfa(MIN_PAYOUT)} requis
            </p>
          </div>
          {seuilReached ? (
            <Link
              href="/espace/paiements"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm"
            >
              💸 Demander un virement →
            </Link>
          ) : (
            <span className="text-xs text-slate-400">
              Il manque <strong className="text-slate-700">{fcfa(MIN_PAYOUT - payable)}</strong> pour débloquer le versement
            </span>
          )}
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${seuilReached ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}
            style={{ width: `${Math.max(seuilPct, seuilPct > 0 ? 3 : 0)}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs font-semibold text-slate-500">{seuilPct} %</p>
      </div>

      {/* ── Répartition N1 / N2 / N3 + Top produits ── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Répartition par niveau */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Répartition par niveau</h3>
          <div className="space-y-3">
            {byLevel.map(({ lvl, amount, count }) => {
              const pctW = total > 0 ? Math.round((amount / total) * 100) : 0;
              const colors = ["bg-blue-500", "bg-violet-500", "bg-slate-400"];
              const labels = ["N1 — Vos propres ventes (taux plein)", "N2 — Ventes de vos filleuls (50 %)", "N3 — Ventes des filleuls de vos filleuls (25 %)"];
              return (
                <div key={lvl}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-700">{labels[lvl - 1]}</span>
                    <span className="text-slate-500">{fcfa(amount)} · {count} entrée{count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${colors[lvl - 1]}`} style={{ width: `${Math.max(pctW, amount > 0 ? 2 : 0)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top produits */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Top produits par commissions</h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400">Aucune commission enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const barW = Math.round((p.amount / maxAmount) * 100);
                const medals = ["🥇", "🥈", "🥉", "4️⃣"];
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-semibold text-slate-700">{medals[i]} {p.name}</span>
                      <span className="text-slate-500">{fcfa(p.amount)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.max(barW, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Table filtrée (client) ── */}
      <CommissionsTable rows={rows} />
    </div>
  );
}
