import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();

  const q = (searchParams.q ?? "").trim();

  if (!q || q.length < 2) {
    return (
      <div className="space-y-6">
        <PageHeader title="Recherche globale" subtitle="Cherchez par nom, code, email, référence ou titre." />
        <SearchForm q="" />
        <p className="text-center text-sm text-gray-400 py-12">Saisissez au moins 2 caractères pour lancer la recherche.</p>
      </div>
    );
  }

  const like = { contains: q, mode: "insensitive" as const };

  const [partners, opportunities, sales, needs] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { firstName: like },
          { lastName: like },
          { email: like },
          { code: like },
          { phone: like },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, code: true, status: true, role: true, approved: true },
      take: 10,
    }),
    (prisma as any).opportunity.findMany({
      where: {
        OR: [
          { title: like },
          { code: like },
          { description: like },
        ],
      },
      include: { user: { select: { firstName: true, lastName: true, code: true } } },
      take: 10,
    }),
    prisma.sale.findMany({
      where: {
        OR: [
          { reference: like },
          { clientName: like } as any,
          { clientPhone: like } as any,
        ],
      },
      include: {
        seller: { select: { firstName: true, lastName: true, code: true } },
        product: { select: { name: true } },
      },
      take: 10,
    }),
    (prisma as any).need.findMany({
      where: {
        OR: [
          { title: like },
          { code: like },
          { description: like },
        ],
      },
      include: { user: { select: { firstName: true, lastName: true, code: true } } },
      take: 5,
    }),
  ]);

  const total = partners.length + opportunities.length + sales.length + needs.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recherche globale"
        subtitle={total > 0 ? `${total} résultat${total > 1 ? "s" : ""} pour « ${q} »` : `Aucun résultat pour « ${q} »`}
      />

      <SearchForm q={q} />

      {total === 0 && (
        <p className="text-center text-sm text-gray-400 py-12">Aucun résultat — essayez un autre terme.</p>
      )}

      {partners.length > 0 && (
        <Section title={`👥 Partenaires (${partners.length})`}>
          {partners.map((p: any) => (
            <ResultRow
              key={p.id}
              href="/admin/partenaires"
              title={`${p.firstName} ${p.lastName}`}
              sub={`${p.email} · ${p.code}`}
              badge={p.role !== "PARTNER" ? p.role : undefined}
              badgeCls="bg-purple-100 text-purple-700"
              tag={p.approved ? undefined : "⏳ En attente"}
            />
          ))}
        </Section>
      )}

      {opportunities.length > 0 && (
        <Section title={`💼 Opportunités (${opportunities.length})`}>
          {opportunities.map((o: any) => (
            <ResultRow
              key={o.id}
              href="/admin/opportunites"
              title={o.title}
              sub={`${o.code ?? "—"} · ${o.user.firstName} ${o.user.lastName} (${o.user.code})`}
              badge={o.status}
              badgeCls={o.status === "APPROVED" ? "bg-green-100 text-green-700" : o.status === "NEW" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}
            />
          ))}
        </Section>
      )}

      {sales.length > 0 && (
        <Section title={`🧾 Ventes (${sales.length})`}>
          {sales.map((s: any) => (
            <ResultRow
              key={s.id}
              href="/admin/ventes"
              title={`${s.reference} — ${s.product.name}`}
              sub={`${s.seller.firstName} ${s.seller.lastName} (${s.seller.code}) · ${new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(s.amount)}`}
              badge={s.status}
              badgeCls={s.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
            />
          ))}
        </Section>
      )}

      {needs.length > 0 && (
        <Section title={`🔍 Besoins (${needs.length})`}>
          {needs.map((n: any) => (
            <ResultRow
              key={n.id}
              href="/admin/besoins"
              title={n.title}
              sub={`${n.code ?? "—"} · ${n.user.firstName} ${n.user.lastName} (${n.user.code})`}
              badge={n.status}
              badgeCls="bg-gray-100 text-gray-600"
            />
          ))}
        </Section>
      )}
    </div>
  );
}

function SearchForm({ q }: { q: string }) {
  return (
    <form method="GET" className="flex gap-2">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Nom, code partenaire, email, référence vente, titre opportunité…"
        autoFocus
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Rechercher
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{title}</h2>
      <div className="rounded-xl border bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
        {children}
      </div>
    </section>
  );
}

function ResultRow({
  href,
  title,
  sub,
  badge,
  badgeCls,
  tag,
}: {
  href: string;
  title: string;
  sub: string;
  badge?: string;
  badgeCls?: string;
  tag?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{sub}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {tag && <span className="text-xs text-amber-600 font-medium">{tag}</span>}
        {badge && (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeCls}`}>
            {badge}
          </span>
        )}
        <span className="text-gray-300 text-xs">→</span>
      </div>
    </Link>
  );
}
