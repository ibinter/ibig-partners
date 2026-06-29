import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa, formatDate, formatDateTime } from "@/lib/format";
import { COMMISSION_STATUS_LABELS } from "@/lib/constants";
import PrintTrigger from "./print-trigger";

export const dynamic = "force-dynamic";

// Relevé de commissions imprimable — l'utilisateur l'enregistre en PDF via
// la boîte d'impression du navigateur (Ctrl+P → Enregistrer au format PDF).
export default async function RelevePage() {
  const user = await requireUser();
  const commissions = await prisma.commission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { sale: { include: { product: true } } },
  });

  const total = commissions.reduce((a, c) => a + c.amount, 0);
  const paid = commissions.filter((c) => c.status === "PAID").reduce((a, c) => a + c.amount, 0);

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-slate-800">
      <PrintTrigger />
      <div className="mb-6 flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-700">IBIG PARTNERS</h1>
          <p className="text-sm text-slate-500">Relevé de commissions</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{user.firstName} {user.lastName}</p>
          <p className="text-slate-500">{user.code}</p>
          <p className="text-slate-500">Édité le {formatDateTime(new Date())}</p>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="border-b border-slate-300 text-left">
          <tr>
            <th className="py-2">Référence</th>
            <th>Produit</th>
            <th>Niv.</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((c) => (
            <tr key={c.id} className="border-b border-slate-100">
              <td className="py-1.5 font-mono text-xs">{c.sale.reference}</td>
              <td>{c.sale.product.name}{c.sale.pricingType === "MONTHLY_SUB" ? ` (M${c.monthIndex})` : ""}</td>
              <td>N{c.level}</td>
              <td>{fcfa(c.amount)}</td>
              <td>{COMMISSION_STATUS_LABELS[c.status]}</td>
              <td>{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <table className="text-sm">
          <tbody>
            <tr><td className="pr-8 text-slate-500">Total commissions</td><td className="text-right font-semibold">{fcfa(total)}</td></tr>
            <tr><td className="pr-8 text-slate-500">Dont versées</td><td className="text-right font-semibold">{fcfa(paid)}</td></tr>
          </tbody>
        </table>
      </div>

      <p className="mt-10 text-xs text-slate-400">
        IBIG SARL — Groupe Intermark Business International · Cocody Riviera
        Palmeraie, Abidjan · ibigpartners.com
      </p>
    </div>
  );
}
