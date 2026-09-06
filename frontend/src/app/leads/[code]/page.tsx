/**
 * Page publique de capture de leads affiliés : /leads/[code]
 * Permet à un prospect de s'inscrire via le lien d'un partenaire.
 * Crée un enregistrement Prospect dans la base du partenaire.
 */
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LeadForm from "./lead-form";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const partner = await prisma.user.findFirst({ where: { code }, select: { firstName: true } });
  if (!partner) return {};
  return {
    title: `Formulaire d'intérêt — IBIG PARTNERS (ref. ${code})`,
    description: "Remplissez ce formulaire et ${partner.firstName} vous recontactera rapidement.",
  };
}

export default async function LeadsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const partner = await prisma.user.findFirst({
    where: { code, approved: true, active: true },
    select: { id: true, firstName: true, code: true },
  });
  if (!partner) notFound();

  const products = await prisma.affiliateLink.findMany({
    where: { userId: partner.id },
    include: { product: { select: { id: true, name: true } } },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 text-3xl">
            🤝
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Demande d'information</h1>
          <p className="mt-1 text-sm text-slate-500">
            Votre conseiller <strong>{partner.firstName}</strong> vous recontactera sous 24 h.
          </p>
        </div>

        {/* Form */}
        <LeadForm
          partnerId={partner.id}
          partnerCode={partner.code}
          products={products.map((l) => ({ id: l.product.id, name: l.product.name }))}
        />

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          IBIG PARTNERS · Réf. conseiller : <span className="font-mono font-semibold">{code}</span>
        </p>
      </div>
    </div>
  );
}
