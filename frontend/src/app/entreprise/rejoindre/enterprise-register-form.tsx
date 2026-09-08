"use client";

import { useActionState } from "react";

const SECTORS = [
  "FORMATION", "DIGITAL", "IMMOBILIER", "FINANCEMENT", "COMMERCIAL",
  "CONSEIL", "EMPLOI_RH", "SANTE", "AGRI", "ENERGIE", "AUTRE",
];
const SECTOR_LABELS: Record<string, string> = {
  FORMATION: "Formation / Education", DIGITAL: "Digital & Tech", IMMOBILIER: "Immobilier",
  FINANCEMENT: "Financement / Crédit", COMMERCIAL: "Commercial / Vente",
  CONSEIL: "Conseil / Consulting", EMPLOI_RH: "Emploi & RH", SANTE: "Santé",
  AGRI: "Agriculture", ENERGIE: "Energie", AUTRE: "Autre",
};

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition";
const labelCls = "block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5";

export default function EnterpriseRegisterForm({
  action,
}: {
  action: (prev: unknown, fd: FormData) => Promise<{ error?: string } | null>;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 font-medium">
          {state.error}
        </div>
      )}

      <div>
        <label className={labelCls}>Nom de l'entreprise *</label>
        <input name="orgName" required placeholder="Ex : ACME SARL" className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Prénom du responsable *</label>
          <input name="firstName" required placeholder="Kouamé" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Nom *</label>
          <input name="lastName" required placeholder="KOUAKOU" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Email professionnel *</label>
        <input name="email" type="email" required placeholder="direction@acme.ci" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Téléphone / WhatsApp *</label>
        <input name="phone" required placeholder="+225 07 XX XX XX XX" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Secteur d'activité principal</label>
        <select name="sector" className={inputCls}>
          <option value="">Sélectionner…</option>
          {SECTORS.map(s => (
            <option key={s} value={s}>{SECTOR_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Pays *</label>
          <input name="country" required defaultValue="Côte d'Ivoire" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Ville</label>
          <input name="city" placeholder="Abidjan" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Site web</label>
        <input name="website" type="url" placeholder="https://acme.ci" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Mot de passe * (8 caractères min.)</label>
        <input name="password" type="password" required minLength={8} className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold py-3.5 text-sm transition-colors shadow-sm"
      >
        {pending ? "Création du compte…" : "🏢 Créer mon compte entreprise →"}
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        En vous inscrivant, vous acceptez les conditions générales IBIG PARTNERS.
        Votre compte sera validé sous 24h par notre équipe.
      </p>
    </form>
  );
}
