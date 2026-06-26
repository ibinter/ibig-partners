import QRCode from "qrcode";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeader } from "@/components/ui";
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

  return (
    <div>
      <PageHeader
        title="Mes Liens d'affiliation"
        subtitle={`Votre code partenaire : ${user.code} · Cookie de tracking valable ${COOKIE_TRACKING_DAYS} jours`}
      />

      {rows.length === 0 ? (
        <EmptyState>
          Aucun lien actif. Rendez-vous dans{" "}
          <Link href="/espace/produits" className="font-medium text-brand-600 hover:underline">
            Mes Produits
          </Link>{" "}
          pour activer les produits à promouvoir.
        </EmptyState>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {rows.map(({ link, url, qr }) => (
            <Card key={link.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-brand-500">{link.product.branch.name}</p>
                  <h3 className="font-semibold text-ink">{link.product.name}</h3>
                  <p className="mt-1 text-xs text-muted">{link.clicks} clic(s)</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code" className="h-20 w-20 rounded-lg border border-slate-100" />
              </div>
              <div className="mt-4 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                {url}
              </div>
              <div className="mt-3 flex gap-2">
                <CopyButton text={url} />
                <a
                  href={qr}
                  download={`qr-${link.product.slug}.png`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Télécharger le QR
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
