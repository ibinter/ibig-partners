import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import UploadDocClient from "./upload-doc-client";

export const dynamic = "force-dynamic";

const IBIG_DOCUMENTS = [
  {
    category: "Contrats & Adhésion",
    docs: [
      { name: "Contrat partenaire IBIG PARTNERS",  file: "contrat-partenaire.pdf" },
      { name: "Charte éthique & code de conduite",  file: "charte-ethique.pdf" },
      { name: "Conditions générales d'utilisation", file: "cgu.pdf" },
    ],
  },
  {
    category: "Guides & Formation",
    docs: [
      { name: "Guide de démarrage rapide",          file: "guide-demarrage.pdf" },
      { name: "Plan de compensation détaillé",      file: "plan-compensation.pdf" },
      { name: "Guide des bonnes pratiques",         file: "guide-bonnes-pratiques.pdf" },
    ],
  },
  {
    category: "Ressources Marketing",
    docs: [
      { name: "Kit de présentation IBIG PARTNERS",  file: "kit-presentation.pdf" },
      { name: "Modèle de devis partenaire",         file: "modele-devis.pdf" },
    ],
  },
];

export default async function DocumentsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Documents"
        subtitle="Contrats signés, guides et ressources officielles IBIG PARTNERS"
      />

      {/* ── Upload document signé ── */}
      <UploadDocClient userId={user.id} />

      {/* ── Documents officiels IBIG ── */}
      {IBIG_DOCUMENTS.map((cat) => (
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
