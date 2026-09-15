import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import UploadDocClient from "./upload-doc-client";

export const dynamic = "force-dynamic";

const STATIC_DOCS = [
  {
    category: "Guides & Formation",
    docs: [
      { name: "Guide de démarrage rapide",       file: "guide-demarrage.pdf" },
      { name: "Plan de compensation détaillé",   file: "plan-compensation.pdf" },
      { name: "Guide des bonnes pratiques",      file: "guide-bonnes-pratiques.pdf" },
    ],
  },
  {
    category: "Ressources Marketing",
    docs: [
      { name: "Kit de présentation IBIG PARTNERS", file: "kit-presentation.pdf" },
      { name: "Modèle de devis partenaire",        file: "modele-devis.pdf" },
    ],
  },
];

export default async function DocumentsPage() {
  const user = await requireUser();

  const contract = await (prisma as any).contract.findUnique({ where: { userId: user.id } });
  const isVerified = user.verificationStatus === "VERIFIED";
  const hasSigned  = contract?.confirmed === true;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Documents"
        subtitle="Contrats signés, guides et ressources officielles IBIG PARTNERS"
      />

      {/* ── Upload document signé ── */}
      <UploadDocClient userId={user.id} />

      {/* ── Contrat personnalisé ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">📄 Contrats &amp; Adhésion</h3>
        <div className="space-y-2">

          {/* Contrat personnalisé généré en PDF */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl shrink-0">📋</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">Contrat de partenariat IBIG PARTNERS</p>
                <p className="text-xs text-slate-400">
                  {hasSigned
                    ? `Signé électroniquement le ${new Date(contract.signedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                    : "À signer dans l'espace Contrat"}
                </p>
              </div>
            </div>
            {isVerified && hasSigned ? (
              <a
                href={`/api/contrat/${user.id}`}
                className="shrink-0 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
              >
                ⬇ Télécharger
              </a>
            ) : (
              <a
                href="/espace/contrat"
                className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition-colors"
              >
                ✍️ {hasSigned ? "Voir le contrat" : "Signer"}
              </a>
            )}
          </div>

          {/* Charte éthique */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <p className="text-sm font-medium text-slate-700">Charte éthique &amp; code de conduite</p>
            </div>
            <a
              href={`/api/documents/download?file=charte-ethique.pdf&userId=${user.id}`}
              className="shrink-0 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              ⬇ Télécharger
            </a>
          </div>

          {/* CGU */}
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">📄</span>
              <p className="text-sm font-medium text-slate-700">Conditions générales d'utilisation</p>
            </div>
            <a
              href={`/api/documents/download?file=cgu.pdf&userId=${user.id}`}
              className="shrink-0 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
            >
              ⬇ Télécharger
            </a>
          </div>
        </div>
      </div>

      {/* ── Documents statiques ── */}
      {STATIC_DOCS.map((cat) => (
        <div key={cat.category} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">📄 {cat.category}</h3>
          <div className="space-y-2">
            {cat.docs.map((doc) => (
              <div key={doc.file} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                </div>
                <a
                  href={`/api/documents/download?file=${doc.file}&userId=${user.id}`}
                  className="shrink-0 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  ⬇ Télécharger
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
