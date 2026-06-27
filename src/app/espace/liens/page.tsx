import QRCode from "qrcode";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState, PageHeader } from "@/components/ui";
import { COOKIE_TRACKING_DAYS } from "@/lib/constants";
import CopyButton from "./copy-button";

export const dynamic = "force-dynamic";

export default async function LiensPage() {
  const user = await requireUser();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const links = await prisma.affiliateLink.findMany({
    where: { userId: user.id },
    include: { product: { include: { branch: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = await Promise.all(
    links.map(async (l) => {
      const url = `${baseUrl}/aff/${user.code}?p=${l.product.slug}`;
      const qr = await QRCode.toDataURL(url, { width: 220, margin: 1 });
      return { link: l, url, qr };
    }),
  );

  const BRANCH_COLORS = ["blue", "emerald", "violet", "amber", "rose"] as const;
  const branchColorMap = new Map<string, string>();
  links.forEach((l) => {
    if (!branchColorMap.has(l.product.branchId)) {
      branchColorMap.set(l.product.branchId, BRANCH_COLORS[branchColorMap.size % 5]);
    }
  });

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
          {rows.map(({ link, url, qr }) => (
            <div key={link.id} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Header colorée */}
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
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <CopyButton text={url} />
                    <a
                      href={qr}
                      download={`qr-${link.product.slug}.png`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      📥 Télécharger le QR
                    </a>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code" className="h-20 w-20 rounded-xl border border-slate-100 shadow-sm shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
