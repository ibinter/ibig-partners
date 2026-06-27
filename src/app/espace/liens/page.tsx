import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui";
import { COOKIE_TRACKING_DAYS } from "@/lib/constants";
import CopyButton from "./copy-button";
import QrCard from "./qr-card";

export const dynamic = "force-dynamic";

export default async function LiensPage() {
  const user = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const links = await prisma.affiliateLink.findMany({
    where: { userId: user.id },
    include: { product: { include: { branch: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = links.map((l) => ({
    link: l,
    url: `${baseUrl}/aff/${user.code}?p=${l.product.slug}`,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Liens d'affiliation"
        subtitle={`Code partenaire : ${user.code} · Cookie de tracking valable ${COOKIE_TRACKING_DAYS} jours`}
      />

      {/* Infos rapides */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Liens actifs</p>
          <p className="text-2xl font-bold mt-1">{rows.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Clics totaux</p>
          <p className="text-2xl font-bold mt-1">{links.reduce((a, l) => a + l.clicks, 0)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 p-4 text-white shadow-md">
          <p className="text-xs font-semibold text-violet-200 uppercase tracking-wide">Votre code</p>
          <p className="text-xl font-bold mt-1 font-mono">{user.code}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState>
          Aucun lien actif. Rendez-vous dans{" "}
          <Link href="/espace/produits" className="font-semibold text-blue-600 hover:underline">
            Mes Produits
          </Link>{" "}
          pour activer les produits à promouvoir.
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map(({ link, url }) => (
            <div key={link.id} className="card-premium overflow-hidden hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">{link.product.branch.name}</p>
                  <h3 className="font-semibold text-sm text-ink mt-0.5">{link.product.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-100 px-3 py-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-600">{link.clicks} clics</span>
                </div>
              </div>

              <div className="p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 font-mono text-xs text-slate-500 break-all leading-relaxed">
                    {url}
                  </div>
                  <div className="mt-3">
                    <CopyButton text={url} />
                  </div>
                </div>
                <QrCard url={url} slug={link.product.slug} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
