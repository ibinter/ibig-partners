"use client";

import { useRef } from "react";
import { SubmitButton } from "@/components/submit-button";

const CATEGORIES: Record<string, string> = {
  FORMATION:"🎓 Formation", DIGITAL:"💻 Digital & Web", INFORMATIQUE:"⚙️ Logiciels & IT",
  IMMOBILIER:"🏠 Immobilier", BTP:"🏗️ BTP & Construction", CONSEIL:"📋 Conseil",
  FINANCEMENT:"💰 Financement", COMMERCIAL:"🤝 Commercial", PARTENARIAT:"🌐 Partenariat",
  MISE_EN_RELATION:"🔗 Mise en relation", EMPLOI_RH:"👥 Emploi & RH",
  EVENEMENTIEL:"🎪 Événementiel", MARKETING:"📢 Marketing", SERVICES:"🛠️ Services B2B",
  COMMERCE:"🛒 Commerce", LOGISTIQUE:"🚚 Logistique", SANTE:"🏥 Santé",
  AGRI:"🌱 Agriculture", ENERGIE:"⚡ Énergie", INTERNATIONAL:"🌍 International",
  AUTRE:"💡 Autre",
};

const TYPES = [
  { value: "OPPORTUNITE",  label: "💼 Opportunité commerciale",  hasCommission: true  },
  { value: "AFFAIRE",      label: "🤝 Affaire à saisir",         hasCommission: true  },
  { value: "RECRUTEMENT",  label: "👥 Annonce de recrutement",   hasCommission: false },
  { value: "PARTENARIAT",  label: "🌐 Recherche de partenaire",  hasCommission: false },
  { value: "ANNONCE",      label: "📢 Annonce générale",         hasCommission: false },
];

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export function AdminCreateOpportunityForm({ action }: { action: (fd: FormData) => Promise<void> }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // React state via useReducer-free trick: use a select onChange to toggle commission section
  return (
    <details ref={detailsRef} className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden group">
      <summary className="cursor-pointer px-5 py-3 font-semibold text-blue-800 text-sm flex items-center gap-2 select-none list-none">
        <span className="text-lg">➕</span> Créer une opportunité / annonce / recrutement
        <span className="ml-auto text-blue-400 text-xs transition-transform group-open:rotate-180">▼</span>
      </summary>

      <form
        action={async (fd) => {
          await action(fd);
          if (detailsRef.current) detailsRef.current.open = false;
        }}
        className="px-5 pb-5 pt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-blue-100 bg-white"
        onSubmit={(e) => {
          // show/hide commission is visual only — values default to 0 server-side
        }}
      >
        {/* Type */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Type d&apos;annonce *</label>
          <select
            name="opportunityType"
            className={inputCls}
            onChange={(e) => {
              const hasComm = TYPES.find((t) => t.value === e.target.value)?.hasCommission ?? true;
              const section = document.getElementById("commission-section");
              if (section) section.style.display = hasComm ? "" : "none";
            }}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Titre */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Titre *</label>
          <input name="title" required placeholder="Ex : Recherche commercial terrain zone Cocody" className={inputCls} />
        </div>

        {/* Catégorie + Visibilité */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Catégorie *</label>
          <select name="category" className={inputCls}>
            {Object.entries(CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Visibilité</label>
          <select name="visibility" className={inputCls}>
            <option value="PUBLIC">🌐 Public — visible par tous les partenaires</option>
            <option value="PRIVATE">🔒 Privé — sur invitation uniquement</option>
          </select>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
          <textarea
            name="description"
            required
            rows={4}
            placeholder="Décrivez l'annonce : contexte, profil recherché, conditions, attentes…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Commission (masqué pour recrutement/annonce) */}
        <div id="commission-section" className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Valeur estimée (FCFA)</label>
            <input name="estimatedValue" type="number" min="0" placeholder="0" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Commission partenaire</label>
              <input name="partnerCommission" type="number" min="0" placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select name="partnerCommissionType" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option value="FIXED">FCFA</option>
                <option value="PERCENT">%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date limite + Note interne */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Date limite</label>
          <input name="deadline" type="date" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Note interne (admin)</label>
          <input name="adminNote" placeholder="Note visible uniquement en admin" className={inputCls} />
        </div>

        <div className="sm:col-span-2 flex justify-end">
          <SubmitButton variant="primary" pendingLabel="Publication…">✅ Publier</SubmitButton>
        </div>
      </form>
    </details>
  );
}
