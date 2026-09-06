"use client";
import { useState } from "react";

export default function ContratClient({ signed, signedAt, userName }: { signed: boolean; signedAt: Date | null; userName: string }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(signed);
  const [signDate, setSignDate] = useState<Date | null>(signedAt);

  async function handleSign() {
    if (!agreed) return;
    setLoading(true);
    const r = await fetch("/api/espace/sign-contract", { method: "POST" });
    if (r.ok) { setDone(true); setSignDate(new Date()); }
    setLoading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Contrat Partenaire Digital</h1>
        <p className="text-sm text-gray-500 mt-1">Version 1.0 — IBIG PARTNERS</p>
      </div>

      {done && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-emerald-800">Contrat signé électroniquement</p>
            <p className="text-xs text-emerald-700">Signé le {signDate ? new Date(signDate).toLocaleDateString("fr-FR", { dateStyle: "full" }) : ""} par {userName}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 space-y-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300 max-h-96 overflow-y-auto">
        <h2 className="font-black text-lg text-gray-900 dark:text-white">CONTRAT DE PARTENARIAT AFFILIÉ</h2>
        <p><strong>Entre :</strong> IBIG SARL, société de droit ivoirien, ci-après dénommée &ldquo;IBIG&rdquo;,</p>
        <p><strong>Et :</strong> {userName}, ci-après dénommé(e) &ldquo;le Partenaire&rdquo;.</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-4">Article 1 — Objet</h3>
        <p>IBIG confie au Partenaire la promotion de ses produits et services en échange de commissions calculées selon le plan de compensation en vigueur.</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-4">Article 2 — Commissions</h3>
        <p>Le Partenaire perçoit une commission sur chaque vente qualifiée réalisée via son lien affilié. Les taux sont définis dans le Plan de Compensation disponible dans l&apos;espace partenaire.</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-4">Article 3 — Obligations du Partenaire</h3>
        <p>Le Partenaire s&apos;engage à promouvoir les produits IBIG de manière éthique, à ne pas tenir de propos mensongers ou trompeurs, et à respecter la charte graphique fournie.</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-4">Article 4 — Durée</h3>
        <p>Le présent contrat prend effet à sa signature et est conclu pour une durée indéterminée, résiliable par l&apos;une ou l&apos;autre des parties avec un préavis de 30 jours.</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-4">Article 5 — Confidentialité</h3>
        <p>Le Partenaire s&apos;engage à garder confidentielles toutes les informations commerciales et techniques partagées par IBIG.</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-4">Article 6 — Droit applicable</h3>
        <p>Le présent contrat est soumis au droit ivoirien. Tout litige sera porté devant les juridictions compétentes d&apos;Abidjan.</p>
      </div>

      {!done && (
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              J&apos;ai lu et j&apos;accepte les termes du contrat de partenariat affilié IBIG PARTNERS. Je comprends que cette signature électronique a la même valeur juridique qu&apos;une signature manuscrite.
            </span>
          </label>
          <button
            onClick={handleSign}
            disabled={!agreed || loading}
            className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signature en cours…" : "✍️ Signer électroniquement"}
          </button>
        </div>
      )}
    </div>
  );
}
