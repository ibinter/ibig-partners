import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNetwork } from "@/lib/metrics";
import { fcfa, formatDate } from "@/lib/format";
import { Badge, EmptyState, Field, PageHeader, statusTone } from "@/components/ui";
import { Button } from "@/components/button";
import { OPPORTUNITY_STATUS_LABELS, STATUS_LABELS } from "@/lib/constants";
import { submitOpportunity } from "../actions";
import CopyButton from "../liens/copy-button";

export const dynamic = "force-dynamic";

export default async function ReseauPage() {
  const user = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ibigpartners.com";

  const [network, opportunities, commByLevel] = await Promise.all([
    getNetwork(user.id),
    prisma.opportunity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([2, 3].map((lvl) =>
      prisma.commission.aggregate({
        where: { userId: user.id, level: lvl },
        _sum: { amount: true },
      })
    )),
  ]);

  const byLevel = (lvl: number) => network.filter((m) => m.level === lvl);
  const counts  = [1, 2, 3].map((l) => byLevel(l).length);
  const totalNetwork = counts.reduce((a, b) => a + b, 0);

  const commN2 = commByLevel[0]._sum.amount ?? 0;
  const commN3 = commByLevel[1]._sum.amount ?? 0;
  const totalNetworkComm = commN2 + commN3;

  const referralUrl = `${baseUrl}/rejoindre?ref=${user.code}`;

  const LEVELS = [
    { lvl: 1, label: "N1 — Filleuls directs",           sub: "Taux plein",       gradient: "from-blue-600 to-blue-700",     ring: "border-blue-200 bg-blue-50",   text: "text-blue-700" },
    { lvl: 2, label: "N2 — Filleuls de vos filleuls",   sub: "50 % du taux N1",  gradient: "from-violet-600 to-purple-700", ring: "border-violet-200 bg-violet-50", text: "text-violet-700" },
    { lvl: 3, label: "N3 — 3ᵉ niveau",                  sub: "25 % du taux N1",  gradient: "from-emerald-600 to-teal-600",  ring: "border-emerald-200 bg-emerald-50",text: "text-emerald-700" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mon Réseau"
        subtitle="Recrutez des partenaires et gagnez des commissions passives sur 3 niveaux."
      />

      {/* ── Lien de parrainage ── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Votre lien de parrainage</p>
            <p className="text-sm text-blue-100 leading-relaxed mb-3">
              Partagez ce lien pour recruter de nouveaux affiliés. Chaque vente réalisée par votre réseau vous génère une commission automatique.
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-sm">
              <span className="font-mono text-xs text-white/90 flex-1 truncate">{referralUrl}</span>
              <CopyButton text={referralUrl} />
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-blue-200">Votre code</p>
            <p className="text-2xl font-extrabold text-white tracking-wider">{user.code}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/15 px-3 py-1">📲 WhatsApp · SMS · Email · Réseaux sociaux</span>
          <span className="rounded-full bg-white/15 px-3 py-1">💸 Commissions N2 et N3 automatiques</span>
        </div>
      </div>

      {/* ── 4 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">Réseau total</p>
          <p className="mt-1 text-2xl font-extrabold">{totalNetwork}</p>
          <p className="mt-0.5 text-xs text-slate-400">filleuls sur 3 niveaux</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Filleuls N1</p>
          <p className="mt-1 text-2xl font-extrabold">{counts[0]}</p>
          <p className="mt-0.5 text-xs text-blue-200">directs (taux plein)</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">Filleuls N2 + N3</p>
          <p className="mt-1 text-2xl font-extrabold">{counts[1] + counts[2]}</p>
          <p className="mt-0.5 text-xs text-violet-200">revenus passifs</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Commissions réseau</p>
          <p className="mt-1 text-2xl font-extrabold">{fcfa(totalNetworkComm)}</p>
          <p className="mt-0.5 text-xs text-emerald-200">N2 + N3 cumulés</p>
        </div>
      </div>

      {/* ── Tableaux par niveau ── */}
      {LEVELS.map(({ lvl, label, sub, gradient, ring, text }) => {
        const members = byLevel(lvl);
        const active  = members.filter((m) => m.active && m.approved).length;
        return (
          <div key={lvl} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">{sub}</p>
                <h3 className="font-semibold text-white text-sm mt-0.5">{label}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white">
                  {members.length} filleul{members.length !== 1 ? "s" : ""}
                </span>
                {active > 0 && (
                  <span className="rounded-full bg-emerald-400/30 border border-emerald-300/40 px-3 py-0.5 text-xs font-semibold text-white">
                    {active} actif{active !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {members.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-2xl mb-2">{lvl === 1 ? "👤" : lvl === 2 ? "👥" : "🌳"}</p>
                <p className="text-sm text-slate-400">
                  {lvl === 1
                    ? "Partagez votre lien de parrainage pour recruter votre premier filleul."
                    : `Aucun filleul de niveau ${lvl} pour l'instant.`}
                </p>
                {lvl === 1 && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 mx-auto max-w-sm">
                    <span className="font-mono text-xs text-slate-500 truncate">{referralUrl}</span>
                    <CopyButton text={referralUrl} />
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-400">
                    <tr>
                      <th className="px-5 py-3 font-semibold uppercase tracking-wide">Partenaire</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Code</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Statut</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Ventes</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">État</th>
                      <th className="px-3 py-3 font-semibold uppercase tracking-wide">Inscrit le</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${ring} ${text}`}>
                              {m.firstName?.[0]}{m.lastName?.[0]}
                            </div>
                            <span className="font-semibold text-slate-800">{m.firstName} {m.lastName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-400">{m.code}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{STATUS_LABELS[m.status]}</td>
                        <td className="px-3 py-3 text-right">
                          <span className={`font-bold ${m.salesCount > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                            {m.salesCount}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {!m.approved ? (
                            <Badge tone="amber">En validation</Badge>
                          ) : m.active ? (
                            <Badge tone="green">Actif</Badge>
                          ) : (
                            <Badge tone="red">Inactif</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">{formatDate(m.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Opportunités B2B ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">💼 Soumettre une opportunité B2B</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Marché, collaboration, appel d'offres… Toute opportunité signée est commissionnée par accord écrit avec l'équipe IBIG.
            </p>
          </div>
          <form action={submitOpportunity} className="space-y-3">
            <Field label="Titre de l'opportunité" name="title" required placeholder="Ex : digitalisation mairie de Cocody" />
            <Field label="Valeur estimée (FCFA)" name="estimatedValue" type="number" placeholder="0" />
            <Field label="Description" name="description">
              <textarea
                name="description"
                required
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                placeholder="Contexte, contact, nature de la collaboration…"
              />
            </Field>
            <Button type="submit" className="w-full">Soumettre l'opportunité</Button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm">Mes opportunités soumises</h3>
            <span className="text-xs text-slate-400">{opportunities.length} soumise{opportunities.length !== 1 ? "s" : ""}</span>
          </div>
          {opportunities.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-3xl mb-2">💼</p>
              <p className="text-sm text-slate-400">Aucune opportunité soumise pour le moment.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {opportunities.map((o) => (
                <li key={o.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-semibold text-sm text-slate-800 truncate">{o.title}</p>
                    <Badge tone={statusTone(o.status)}>{OPPORTUNITY_STATUS_LABELS[o.status]}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{o.description}</p>
                  {o.estimatedValue > 0 && (
                    <p className="mt-1.5 text-xs font-semibold text-blue-600">Valeur estimée : {fcfa(o.estimatedValue)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
