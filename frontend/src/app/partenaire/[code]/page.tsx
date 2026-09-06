import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fcfa } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await prisma.user.findFirst({ where: { code, publicListing: true, active: true }, select: { firstName: true, lastName: true } });
  if (!user) return { title: "Partenaire introuvable" };
  return { title: `${user.firstName} ${user.lastName} — Partenaire IBIG` };
}

export default async function PartenairePublicPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const user = await prisma.user.findFirst({
    where: { code, publicListing: true, active: true, approved: true },
    select: {
      id: true, firstName: true, lastName: true, code: true, bio: true, photoUrl: true,
      city: true, country: true, website: true, status: true, marketSectors: true,
      createdAt: true,
    },
  });
  if (!user) notFound();

  const [salesCount, links, networkCount] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.affiliateLink.findMany({
      where: { userId: user.id },
      include: { product: { select: { name: true, description: true, price: true } } },
      take: 6,
    }),
    prisma.user.count({ where: { sponsorId: user.id } }),
  ]);

  const joinDate = new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const sectors = user.marketSectors?.split(",").filter(Boolean) ?? [];

  const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    STARTER: { label: "🌱 Starter", color: "bg-slate-100 text-slate-600" },
    SILVER: { label: "🥈 Silver", color: "bg-slate-200 text-slate-700" },
    GOLD: { label: "⭐ Gold", color: "bg-yellow-100 text-yellow-700" },
    MASTER: { label: "💎 Master", color: "bg-violet-100 text-violet-700" },
    ELITE: { label: "🏆 Elite", color: "bg-emerald-100 text-emerald-700" },
  };
  const badge = STATUS_BADGE[user.status] ?? STATUS_BADGE["STARTER"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="inline-block mb-6 text-xs font-semibold text-blue-200 hover:text-white transition-colors">
            ← ibigpartners.com
          </Link>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-extrabold text-white">
              {user.photoUrl
                ? <img src={user.photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
                : `${user.firstName[0]}${user.lastName[0]}`}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white">{user.firstName} {user.lastName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-blue-200 text-sm font-mono">{user.code}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.color}`}>{badge.label}</span>
              </div>
              {user.city && <p className="text-blue-300 text-xs mt-1">📍 {user.city}{user.country ? `, ${user.country}` : ""}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ventes confirmées", value: salesCount },
            { label: "Filleuls", value: networkCount },
            { label: "Membre depuis", value: joinDate },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <p className="text-xl font-extrabold text-slate-800">{s.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">À propos</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{user.bio}</p>
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-blue-600 hover:underline">
                🌐 {user.website}
              </a>
            )}
          </div>
        )}

        {/* Secteurs */}
        {sectors.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Secteurs d'expertise</h2>
            <div className="flex flex-wrap gap-2">
              {sectors.map((s) => <span key={s} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{s}</span>)}
            </div>
          </div>
        )}

        {/* Produits promus */}
        {links.length > 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Produits recommandés</h2>
            <div className="space-y-3">
              {links.map((l) => (
                <a key={l.id} href={`/rejoindre?ref=${l.code}&product=${l.productId}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{l.product.name}</p>
                    {l.product.description && <p className="text-xs text-slate-400 truncate max-w-xs">{l.product.description}</p>}
                  </div>
                  <span className="shrink-0 ml-2 text-sm font-bold text-blue-700">{fcfa(l.product.price)}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white text-center shadow-md">
          <h2 className="font-extrabold text-lg mb-1">Rejoindre le réseau</h2>
          <p className="text-blue-200 text-sm mb-4">Inscrivez-vous comme partenaire IBIG avec le parrainage de {user.firstName}</p>
          <Link
            href={`/rejoindre?ref=${user.code}`}
            className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-800 hover:bg-blue-50 transition-colors"
          >
            S'inscrire avec {user.code} →
          </Link>
        </div>
      </div>
    </div>
  );
}
