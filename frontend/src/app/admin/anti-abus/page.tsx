import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { fcfa, formatDate } from "@/lib/format";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function flagSale(fd: FormData) {
  "use server";
  await requireAdmin();
  const saleId = String(fd.get("saleId") || "");
  const action = String(fd.get("action") || "");
  if (!saleId) return;
  if (action === "flag") {
    await prisma.sale.update({ where: { id: saleId }, data: { status: "PENDING" } });
  } else if (action === "validate") {
    await prisma.sale.update({ where: { id: saleId }, data: { status: "CONFIRMED" } });
  } else if (action === "reject") {
    await prisma.sale.update({ where: { id: saleId }, data: { status: "REJECTED" } });
  }
  revalidatePath("/admin/anti-abus");
}

export default async function AntiAbusPage() {
  await requireAdmin();

  const now = new Date();
  const day7 = new Date(now); day7.setDate(now.getDate() - 7);
  const day30 = new Date(now); day30.setDate(now.getDate() - 30);
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

  // 1. Vélocité anormale : partenaires avec >5 ventes aujourd'hui
  const salesTodayByPartner = await (async () => {
    try {
      const rows = await prisma.sale.groupBy({
        by: ["sellerId"],
        where: { createdAt: { gte: todayStart } },
        _count: { id: true },
        having: { id: { _count: { gt: 5 } } },
      });
      if (!rows.length) return [];
      const ids = rows.map((r) => r.sellerId);
      const users = await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, firstName: true, lastName: true, email: true, code: true },
      });
      return rows.map((r) => ({
        ...r,
        user: users.find((u) => u.id === r.sellerId),
      }));
    } catch { return []; }
  })();

  // 2. CP vélocité anormale : >200 CP en 7 jours
  const cpVelocity = await (async () => {
    try {
      const rows = await (prisma as any).pointTransaction.groupBy({
        by: ["userId"],
        where: { type: { in: ["CREDIT", "BONUS"] }, createdAt: { gte: day7 } },
        _sum: { points: true },
        having: { points: { _sum: { gt: 200 } } },
      });
      if (!rows.length) return [];
      const ids = rows.map((r: any) => r.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, firstName: true, lastName: true, email: true, code: true },
      });
      return rows.map((r: any) => ({
        ...r,
        user: users.find((u: any) => u.id === r.userId),
      }));
    } catch { return []; }
  })();

  // 3. Doublons : même vendeur, même produit, 2 ventes en 7 jours
  const duplicateSales = await (async () => {
    try {
      const rows = await prisma.sale.groupBy({
        by: ["sellerId", "productId"],
        where: { createdAt: { gte: day30 } },
        _count: { id: true },
        having: { id: { _count: { gt: 1 } } },
      });
      if (!rows.length) return [];
      const result = [];
      for (const row of rows.slice(0, 20)) {
        const sales = await prisma.sale.findMany({
          where: { sellerId: row.sellerId, productId: row.productId, createdAt: { gte: day30 } },
          include: {
            seller: { select: { firstName: true, lastName: true, code: true } },
            product: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });
        result.push({ key: `${row.sellerId}-${row.productId}`, count: row._count.id, sales });
      }
      return result;
    } catch { return []; }
  })();

  // 4. Ventes PENDING (en attente de validation manuelle)
  const pendingSales = await (async () => {
    try {
      return await prisma.sale.findMany({
        where: { status: "PENDING" },
        include: {
          seller: { select: { firstName: true, lastName: true, code: true, email: true } },
          product: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch { return []; }
  })();

  // 5. Missions avec preuves en attente de validation admin
  const pendingProofs = await (async () => {
    try {
      return await prisma.missionApplication.findMany({
        where: { status: "SUBMITTED" },
        include: {
          user: { select: { firstName: true, lastName: true, code: true } },
          mission: { select: { title: true, cpAmount: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      });
    } catch { return []; }
  })();

  // KPIs
  const totalFlags = salesTodayByPartner.length + cpVelocity.length + duplicateSales.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anti-abus & Validation"
        subtitle="Détection des comportements suspects, doublons de ventes et preuves en attente de validation."
      />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-rose-600 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-200">Signalements actifs</p>
          <p className="mt-1 text-3xl font-extrabold">{totalFlags}</p>
          <p className="mt-0.5 text-xs text-rose-300">comportements suspects</p>
        </div>
        <div className="rounded-2xl bg-orange-500 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-100">Doublons détectés</p>
          <p className="mt-1 text-3xl font-extrabold">{duplicateSales.length}</p>
          <p className="mt-0.5 text-xs text-orange-100">même produit / 30j</p>
        </div>
        <div className="rounded-2xl bg-amber-500 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Ventes PENDING</p>
          <p className="mt-1 text-3xl font-extrabold">{pendingSales.length}</p>
          <p className="mt-0.5 text-xs text-amber-100">à valider manuellement</p>
        </div>
        <div className="rounded-2xl bg-blue-600 p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Preuves missions</p>
          <p className="mt-1 text-3xl font-extrabold">{pendingProofs.length}</p>
          <p className="mt-0.5 text-xs text-blue-300">en attente de validation</p>
        </div>
      </div>

      {/* Vélocité ventes anormale */}
      {salesTodayByPartner.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-lg">⚡</span> Vélocité ventes anormale (aujourd'hui)
          </h2>
          <p className="mb-3 text-xs text-slate-500">Partenaires ayant déclaré plus de 5 ventes aujourd'hui.</p>
          <div className="space-y-2">
            {salesTodayByPartner.map((row: any) => (
              <div key={row.sellerId} className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {row.user?.firstName} {row.user?.lastName}
                    <span className="ml-2 text-xs font-mono text-slate-400">{row.user?.code}</span>
                  </p>
                  <p className="text-xs text-slate-500">{row.user?.email}</p>
                </div>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  {row._count.id} ventes
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CP vélocité anormale */}
      {cpVelocity.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-lg">💎</span> CP vélocité anormale (7 jours)
          </h2>
          <p className="mb-3 text-xs text-slate-500">Partenaires ayant accumulé plus de 200 CP en 7 jours.</p>
          <div className="space-y-2">
            {cpVelocity.map((row: any) => (
              <div key={row.userId} className="flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {row.user?.firstName} {row.user?.lastName}
                    <span className="ml-2 text-xs font-mono text-slate-400">{row.user?.code}</span>
                  </p>
                  <p className="text-xs text-slate-500">{row.user?.email}</p>
                </div>
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                  {row._sum.points} CP
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Doublons */}
      {duplicateSales.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-lg">🔁</span> Doublons détectés (30 jours)
          </h2>
          <p className="mb-3 text-xs text-slate-500">Même vendeur + même produit, plusieurs ventes déclarées sur 30 jours.</p>
          <div className="space-y-4">
            {duplicateSales.map((group: any) => (
              <div key={group.key} className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-rose-800">
                    {group.sales[0]?.seller?.firstName} {group.sales[0]?.seller?.lastName}
                    <span className="ml-1 font-mono text-xs">{group.sales[0]?.seller?.code}</span>
                    {" · "}
                    {group.sales[0]?.product?.name}
                  </p>
                  <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{group.count}× doublons</span>
                </div>
                <div className="space-y-1">
                  {group.sales.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{formatDate(s.createdAt)} · {fcfa(s.amount)}</span>
                      <div className="flex gap-1">
                        <form action={flagSale}>
                          <input type="hidden" name="saleId" value={s.id} />
                          <input type="hidden" name="action" value="validate" />
                          <button className="rounded px-2 py-0.5 bg-emerald-100 text-emerald-700 font-semibold hover:bg-emerald-200">Valider</button>
                        </form>
                        <form action={flagSale}>
                          <input type="hidden" name="saleId" value={s.id} />
                          <input type="hidden" name="action" value="reject" />
                          <button className="rounded px-2 py-0.5 bg-rose-100 text-rose-700 font-semibold hover:bg-rose-200">Rejeter</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Ventes PENDING */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">⏳</span> Ventes en attente de validation
          <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{pendingSales.length}</span>
        </h2>
        {pendingSales.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Aucune vente en attente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 text-left font-medium">Partenaire</th>
                  <th className="pb-2 text-left font-medium">Produit</th>
                  <th className="pb-2 text-right font-medium">Montant</th>
                  <th className="pb-2 text-left font-medium">Date</th>
                  <th className="pb-2 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingSales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-slate-800">{s.seller?.firstName} {s.seller?.lastName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{s.seller?.code}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{s.product?.name ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-slate-800">{fcfa(s.amount)}</td>
                    <td className="py-2.5 pr-4 text-slate-500 text-xs">{formatDate(s.createdAt)}</td>
                    <td className="py-2.5">
                      <div className="flex gap-1 justify-center">
                        <form action={flagSale}>
                          <input type="hidden" name="saleId" value={s.id} />
                          <input type="hidden" name="action" value="validate" />
                          <button className="rounded-lg px-3 py-1 bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">Valider</button>
                        </form>
                        <form action={flagSale}>
                          <input type="hidden" name="saleId" value={s.id} />
                          <input type="hidden" name="action" value="reject" />
                          <button className="rounded-lg px-3 py-1 bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600">Rejeter</button>
                        </form>
                        <form action={flagSale}>
                          <input type="hidden" name="saleId" value={s.id} />
                          <input type="hidden" name="action" value="flag" />
                          <button className="rounded-lg px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200">Suspendre</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Preuves missions en attente */}
      <Card>
        <h2 className="mb-3 font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-lg">📎</span> Preuves de missions en attente
          <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{pendingProofs.length}</span>
        </h2>
        {pendingProofs.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Aucune preuve en attente.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 text-left font-medium">Partenaire</th>
                  <th className="pb-2 text-left font-medium">Mission</th>
                  <th className="pb-2 text-right font-medium">CP</th>
                  <th className="pb-2 text-left font-medium">Soumis le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingProofs.map((app: any) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-slate-800">{app.user?.firstName} {app.user?.lastName}</p>
                      <p className="text-[11px] font-mono text-slate-400">{app.user?.code}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-slate-600">{app.mission?.title ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-violet-700">{app.mission?.cpAmount ?? 0} CP</td>
                    <td className="py-2.5 text-slate-500 text-xs">{formatDate(app.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">Allez dans <a href="/admin/missions" className="underline text-blue-600">Admin &gt; Missions</a> pour valider ou rejeter les preuves.</p>
      </Card>

      {totalFlags === 0 && duplicateSales.length === 0 && pendingSales.length === 0 && pendingProofs.length === 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-semibold text-emerald-800">Aucun comportement suspect détecté</p>
          <p className="text-sm text-emerald-600 mt-1">Tous les indicateurs sont dans les normes.</p>
        </div>
      )}
    </div>
  );
}
