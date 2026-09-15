import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate } from "@/lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AttestationFiscalePage(
  { params }: { params: Promise<{ year: string }> }
) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) notFound();

  const user = await requireUser();
  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);

  const [commissions, payouts, partner] = await Promise.all([
    prisma.commission.findMany({
      where: { userId: user.id, createdAt: { gte: start, lt: end } },
      include: { sale: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.payout.findMany({
      where: { userId: user.id, status: "PAID", paidAt: { gte: start, lt: end } },
      orderBy: { paidAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true, code: true, email: true, phone: true, city: true, country: true },
    }),
  ]);

  const totalCommissions = commissions.reduce((s, c) => s + c.amount, 0);
  const totalPaid        = payouts.reduce((s, p) => s + (p.netAmount ?? p.amount), 0);
  const totalPending     = commissions
    .filter((c) => c.status === "PENDING" || c.status === "VALIDATED")
    .reduce((s, c) => s + c.amount, 0);

  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Barre actions (masquée à l'impression) */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between bg-white border-b border-slate-200 px-6 py-3">
        <Link href="/espace/paiements" className="text-sm text-slate-500 hover:text-slate-700">
          ← Retour
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Attestation fiscale {year}</span>
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            🖨 Imprimer / PDF
          </button>
        </div>
      </div>

      {/* Document imprimable */}
      <div className="max-w-[800px] mx-auto px-8 py-10 print:px-12 print:py-8">

        {/* En-tête */}
        <div className="flex items-start justify-between mb-8 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">IBIG PARTNERS</p>
            <h1 className="text-2xl font-black text-slate-900">Attestation de revenus d'affiliation</h1>
            <p className="text-sm text-slate-500 mt-1">Année fiscale {year}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Émis le {today}</p>
            <p className="font-mono mt-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded">
              Réf. IBIG-{year}-{user.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Identité du partenaire */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Partenaire affilié</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Nom complet</span><p className="font-semibold text-slate-900">{partner?.firstName} {partner?.lastName}</p></div>
            <div><span className="text-slate-500">Code partenaire</span><p className="font-mono font-semibold text-slate-900">{partner?.code}</p></div>
            <div><span className="text-slate-500">Email</span><p className="font-semibold text-slate-900">{partner?.email}</p></div>
            <div><span className="text-slate-500">Téléphone</span><p className="font-semibold text-slate-900">{partner?.phone}</p></div>
            {partner?.city && <div><span className="text-slate-500">Ville</span><p className="font-semibold text-slate-900">{partner.city}{partner.country ? `, ${partner.country}` : ""}</p></div>}
          </div>
        </section>

        {/* Résumé financier */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Résumé {year}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Commissions totales</p>
              <p className="text-xl font-black text-emerald-900 mt-1">{fcfa(totalCommissions)}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Déjà versé</p>
              <p className="text-xl font-black text-blue-900 mt-1">{fcfa(totalPaid)}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Solde en attente</p>
              <p className="text-xl font-black text-amber-900 mt-1">{fcfa(totalPending)}</p>
            </div>
          </div>
        </section>

        {/* Détail commissions */}
        {commissions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Détail des commissions</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Date</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Produit</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600">Taux</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600">Montant</th>
                  <th className="text-center px-3 py-2 font-semibold text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-600">{formatDate(c.createdAt)}</td>
                    <td className="px-3 py-2 text-slate-800 font-medium">{c.sale.product.name}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{(c.rate * 100).toFixed(0)} %</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-900">{fcfa(c.amount)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        c.status === "PAID"      ? "bg-emerald-100 text-emerald-700" :
                        c.status === "VALIDATED" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {c.status === "PAID" ? "Versé" : c.status === "VALIDATED" ? "Validé" : "En attente"}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="px-3 py-2 text-slate-700">Total</td>
                  <td className="px-3 py-2 text-right text-slate-900">{fcfa(totalCommissions)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Virements */}
        {payouts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Virements reçus en {year}</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Date</th>
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Référence</th>
                  <th className="text-right px-3 py-2 font-semibold text-slate-600">Montant net</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 text-slate-600">{formatDate(p.paidAt!)}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{p.receiptNumber ?? p.reference ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-semibold text-emerald-700">{fcfa(p.netAmount ?? p.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="px-3 py-2 text-slate-700">Total versé</td>
                  <td className="px-3 py-2 text-right text-emerald-900">{fcfa(totalPaid)}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Mention légale */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-[10px] text-slate-400 space-y-1">
          <p>Ce document est généré automatiquement à titre informatif par IBIG PARTNERS.</p>
          <p>Il récapitule les commissions enregistrées sur votre compte pour l'année civile {year}.</p>
          <p>Pour toute question fiscale, rapprochez-vous d'un conseiller fiscal agréé.</p>
          <p className="font-semibold text-slate-500 mt-2">IBIG PARTNERS — ibigpartners.com</p>
        </div>
      </div>
    </div>
  );
}
