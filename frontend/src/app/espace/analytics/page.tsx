import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Badge } from "@/components/ui";
import { formatDate, fcfa } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await requireUser();
  const { days } = await searchParams;
  const periodDays = days === "7" ? 7 : days === "90" ? 90 : 30;

  const links = await prisma.affiliateLink.findMany({
    where: { userId: user.id },
    include: {
      product: { select: { name: true, slug: true } },
      _count: { select: { clickLogs: true } },
    },
    orderBy: { clicks: "desc" },
  });

  /* ── Périodes ── */
  const now = new Date();

  const since30 = new Date(now);
  since30.setDate(since30.getDate() - periodDays);

  const weekStart = new Date(now);
  const dow = weekStart.getDay() === 0 ? 7 : weekStart.getDay();
  weekStart.setDate(weekStart.getDate() - dow + 1);
  weekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);

  /* ── Requêtes parallèles ── */
  const [recentClicks, allSales, commissions, thisWeekClicks, lastWeekClicks] =
    await Promise.all([
      prisma.click.findMany({
        where: { link: { userId: user.id }, createdAt: { gte: since30 } },
        select: { createdAt: true, linkId: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.findMany({
        where: { sellerId: user.id, status: "CONFIRMED" },
        select: { productId: true, amount: true, createdAt: true },
      }),
      prisma.commission.aggregate({
        where: { userId: user.id, status: { in: ["VALIDATED", "PAID"] } },
        _sum: { amount: true },
      }),
      prisma.click.count({
        where: { link: { userId: user.id }, createdAt: { gte: weekStart } },
      }),
      prisma.click.count({
        where: { link: { userId: user.id }, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } },
      }),
    ]);

  /* ── Calculs KPI ── */
  const totalClicks = links.reduce((a, l) => a + l.clicks, 0);
  const clicks30 = recentClicks.length;
  const totalSales = allSales.length;
  const convRate = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : "0.0";
  const commissionsEarned = commissions._sum.amount ?? 0;

  const weekTrend =
    lastWeekClicks > 0
      ? Math.round(((thisWeekClicks - lastWeekClicks) / lastWeekClicks) * 100)
      : thisWeekClicks > 0
      ? 100
      : 0;

  /* ── Graphique période ── */
  const clicksByDay: Record<string, number> = {};
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    clicksByDay[key] = 0;
  }
  for (const c of recentClicks) {
    const key = c.createdAt.toISOString().slice(0, 10);
    if (key in clicksByDay) clicksByDay[key]++;
  }
  const dayEntries = Object.entries(clicksByDay);
  const maxDay = Math.max(...Object.values(clicksByDay), 1);

  /* ── Top produits ── */
  const salesByProduct: Record<string, number> = {};
  for (const s of allSales) salesByProduct[s.productId] = (salesByProduct[s.productId] ?? 0) + 1;

  const topLinks = [...links]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 3);
  const maxClicks = Math.max(...links.map((l) => l.clicks), 1);

  /* ── Labels dates pour le graphe (afficher tous les 5 jours) ── */
  function fmtAxisDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader
          title="Analytics"
          subtitle={`Performance de vos liens d'affiliation — ${periodDays} derniers jours`}
        />
        <div className="flex gap-1.5 shrink-0">
          {[
            { label: "7 jours",  val: "7" },
            { label: "30 jours", val: "30" },
            { label: "90 jours", val: "90" },
          ].map((o) => (
            <Link
              key={o.val}
              href={`/espace/analytics?days=${o.val}`}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                String(periodDays) === o.val
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-blue-300"
              }`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Clics totaux", value: totalClicks.toLocaleString("fr-FR"), sub: "depuis le début", gradient: "from-blue-600 to-blue-700", sub2: "blue" },
          { label: `Clics sur ${periodDays}j`, value: clicks30.toLocaleString("fr-FR"), sub: `${thisWeekClicks} cette semaine`, gradient: "from-cyan-600 to-cyan-700", sub2: "cyan" },
          { label: "Ventes confirmées", value: totalSales, sub: "depuis le début", gradient: "from-emerald-600 to-teal-600", sub2: "emerald" },
          { label: "Taux de conversion", value: `${convRate} %`, sub: "clics → ventes", gradient: "from-violet-600 to-purple-700", sub2: "violet" },
          { label: "Commissions gagnées", value: fcfa(commissionsEarned), sub: "validées + versées", gradient: "from-amber-500 to-orange-500", sub2: "amber" },
        ].map((k) => (
          <div key={k.label} className={`rounded-2xl bg-gradient-to-br ${k.gradient} p-4 text-white shadow-sm`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{k.label}</p>
            <p className="mt-1 text-xl font-extrabold leading-tight">{k.value}</p>
            <p className="mt-0.5 text-[11px] text-white/60">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Comparaison semaine ── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${weekTrend >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
            {weekTrend >= 0 ? "📈" : "📉"}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cette semaine vs. semaine dernière</p>
            <p className={`text-2xl font-extrabold mt-0.5 ${weekTrend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {weekTrend >= 0 ? "+" : ""}{weekTrend} %
            </p>
            <p className="text-xs text-slate-400">
              {thisWeekClicks} clics cette semaine · {lastWeekClicks} la semaine dernière
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">🔗</div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Liens actifs</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{links.length}</p>
            <Link href="/espace/produits" className="text-xs text-blue-600 hover:underline">
              Activer plus de produits →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Graphique 30 jours ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Clics quotidiens</h3>
            <p className="text-xs text-slate-400 mt-0.5">{periodDays} derniers jours · {clicks30} clics au total</p>
          </div>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
            Moy. {clicks30 > 0 ? (clicks30 / 30).toFixed(1) : "0"} / jour
          </span>
        </div>
        {/* Barres */}
        <div className="flex items-end gap-0.5 h-32">
          {dayEntries.map(([iso, count], idx) => {
            const h = Math.max(Math.round((count / maxDay) * 100), count > 0 ? 6 : 2);
            const isToday = idx === dayEntries.length - 1;
            const showLabel = idx % 5 === 0 || isToday;
            return (
              <div key={iso} className="flex flex-1 flex-col items-center gap-0" title={`${fmtAxisDate(iso)} : ${count} clic${count !== 1 ? "s" : ""}`}>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday
                        ? "bg-gradient-to-t from-blue-600 to-blue-400"
                        : count > 0
                        ? "bg-gradient-to-t from-blue-300 to-blue-100"
                        : "bg-slate-100"
                    }`}
                    style={{ height: `${h}%`, minHeight: "2px" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {/* Labels axe X (tous les 5 jours) */}
        <div className="flex items-start gap-0.5 mt-1">
          {dayEntries.map(([iso], idx) => {
            const show = idx % 5 === 0 || idx === dayEntries.length - 1;
            return (
              <div key={iso} className="flex-1 text-center">
                {show && (
                  <span className="text-[9px] text-slate-400 whitespace-nowrap">
                    {idx === dayEntries.length - 1 ? "Auj." : fmtAxisDate(iso)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Top 3 produits ── */}
      {topLinks.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Top produits par clics</h3>
          <div className="space-y-3">
            {topLinks.map((l, i) => {
              const pct = Math.round((l.clicks / maxClicks) * 100);
              const medals = ["🥇", "🥈", "🥉"];
              const ventes = salesByProduct[l.productId] ?? 0;
              return (
                <div key={l.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{medals[i]}</span>
                      <span className="text-sm font-semibold text-slate-800">{l.product.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{l.clicks} clic{l.clicks !== 1 ? "s" : ""}</span>
                      {ventes > 0 && <span className="text-emerald-600 font-semibold">{ventes} vente{ventes !== 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : "bg-amber-700/60"}`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tableau détaillé par lien ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Performance par lien</h3>
            <p className="text-xs text-slate-400 mt-0.5">{links.length} lien{links.length !== 1 ? "s" : ""} actif{links.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {links.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-3xl mb-2">📈</p>
            <p className="text-sm text-slate-400 mb-3">Aucun lien actif. Activez des produits pour suivre vos performances.</p>
            <Link href="/espace/produits" className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition">
              Activer des produits →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wide">Produit</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Clics total</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Clics 30j</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Ventes</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide text-right">Conv.</th>
                  <th className="px-3 py-3 font-semibold uppercase tracking-wide">Activé le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {links.map((l) => {
                  const ventes = salesByProduct[l.productId] ?? 0;
                  const recent = recentClicks.filter((c) => c.linkId === l.id).length;
                  const conv = l.clicks > 0 ? ((ventes / l.clicks) * 100).toFixed(1) : null;
                  const barW = maxClicks > 0 ? Math.round((l.clicks / maxClicks) * 60) : 0;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-800">{l.product.name}</span>
                          {l.clicks > 0 && (
                            <div className="h-1 rounded-full bg-slate-100 w-24">
                              <div className="h-full rounded-full bg-blue-400" style={{ width: `${barW}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-800 text-right">{l.clicks}</td>
                      <td className="px-3 py-3 text-right">
                        <span className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 min-w-[28px]">
                          {recent}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-semibold min-w-[28px] ${ventes > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                          {ventes}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        {conv ? (
                          <Badge tone="blue">{conv} %</Badge>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-400">{formatDate(l.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
