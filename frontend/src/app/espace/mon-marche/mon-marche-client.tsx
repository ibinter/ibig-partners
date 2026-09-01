"use client";

import { useState } from "react";

const SECTORS: { value: string; label: string; icon: string; desc: string }[] = [
  { value: "FORMATION",      label: "Formation",        icon: "🎓", desc: "Formations professionnelles, certifications, MBA" },
  { value: "DIGITAL",        label: "Digital",          icon: "💻", desc: "Sites web, apps, marketing digital" },
  { value: "INFORMATIQUE",   label: "Logiciels ERP",    icon: "⚙️", desc: "Logiciels de gestion, CRM, caisse, RH" },
  { value: "IMMOBILIER",     label: "Immobilier",       icon: "🏠", desc: "Terrains, villas, gestion locative" },
  { value: "BTP",            label: "BTP / Construction", icon: "🏗️", desc: "Construction, rénovation, architecture" },
  { value: "CONSEIL",        label: "Conseil & Audit",  icon: "📋", desc: "Comptabilité, fiscalité, création d'entreprise" },
  { value: "FINANCEMENT",    label: "Financement",      icon: "💰", desc: "Microcrédits, leasing, levée de fonds" },
  { value: "COMMERCIAL",     label: "Commerce & Vente", icon: "🤝", desc: "Prospection commerciale, représentation" },
  { value: "PARTENARIAT",    label: "Partenariat",      icon: "🌐", desc: "Co-développement, alliances stratégiques" },
  { value: "MISE_EN_RELATION", label: "Mise en relation", icon: "🔗", desc: "Intermédiation, courtage, networking" },
  { value: "EMPLOI_RH",     label: "Emploi & RH",      icon: "👥", desc: "Recrutement, placement, portage salarial" },
  { value: "EVENEMENTIEL",  label: "Événementiel",     icon: "🎪", desc: "Organisation d'événements professionnels" },
  { value: "MARKETING",     label: "Marketing",        icon: "📢", desc: "Communication, publicité, branding" },
  { value: "SERVICES",      label: "Services divers",  icon: "🛠️", desc: "Nettoyage, traiteur, sécurité, coursier" },
  { value: "COMMERCE",      label: "Commerce / Négoce", icon: "🛒", desc: "Import-export, distribution, revente" },
  { value: "LOGISTIQUE",    label: "Logistique",       icon: "🚚", desc: "Transport, supply chain, entreposage" },
  { value: "SANTE",         label: "Santé",            icon: "🏥", desc: "Équipements médicaux, pharmacie, bien-être" },
  { value: "AGRI",          label: "Agriculture",      icon: "🌱", desc: "Agroalimentaire, intrants, équipements agri" },
  { value: "ENERGIE",       label: "Énergie",          icon: "⚡", desc: "Solaire, éclairage, économie d'énergie" },
  { value: "INTERNATIONAL", label: "International",    icon: "🌍", desc: "Diaspora, import-export, projets transfrontaliers" },
];

const ZONES = [
  "Abidjan", "Côte d'Ivoire", "Afrique de l'Ouest", "Afrique", "International",
];

const NETWORK_TYPES = [
  { value: "ENTREPRISES", label: "Entreprises & PME", icon: "🏢", desc: "Votre réseau est principalement composé de dirigeants, gérants et décideurs d'entreprises." },
  { value: "PARTICULIERS", label: "Particuliers",     icon: "👤", desc: "Vous évoluez surtout dans des cercles familiaux, communautaires ou de quartier." },
  { value: "ONG",          label: "ONG & Institutions", icon: "🌐", desc: "Vous avez des contacts dans les ONG, administrations ou organisations internationales." },
  { value: "MIXTE",        label: "Réseau mixte",     icon: "🔄", desc: "Votre réseau est varié — entreprises, particuliers, institutions, associations." },
];

type Profile = {
  marketSectors: string[];
  marketZone: string;
  networkType: string;
  networkDescription: string;
};

export default function MonMarcheClient({
  profile,
  updateAction,
}: {
  profile: Profile;
  updateAction: (fd: FormData) => Promise<void>;
}) {
  const [sectors, setSectors] = useState<string[]>(profile.marketSectors);
  const [zone, setZone] = useState(profile.marketZone || "Côte d'Ivoire");
  const [networkType, setNetworkType] = useState(profile.networkType || "MIXTE");
  const [networkDescription, setNetworkDescription] = useState(profile.networkDescription);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggleSector(v: string) {
    setSectors(prev =>
      prev.includes(v) ? prev.filter(s => s !== v) : [...prev, v]
    );
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    sectors.forEach(s => fd.append("sectors", s));
    fd.set("zone", zone);
    fd.set("networkType", networkType);
    fd.set("networkDescription", networkDescription);
    await updateAction(fd);
    setSaving(false);
    setSaved(true);
  }

  const completionPct = Math.round(
    ([sectors.length > 0, !!zone, !!networkType, !!networkDescription].filter(Boolean).length / 4) * 100
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

      {/* Progression */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-slate-800">Profil marché</p>
            <p className="text-xs text-slate-400">Plus votre profil est complet, plus les recommandations sont précises.</p>
          </div>
          <p className={`text-2xl font-extrabold ${completionPct === 100 ? "text-emerald-600" : "text-blue-600"}`}>
            {completionPct}%
          </p>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        {sectors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {sectors.map(s => {
              const sec = SECTORS.find(x => x.value === s);
              return (
                <span key={s} className="rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  {sec?.icon} {sec?.label ?? s}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. Secteurs */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">1. Vos secteurs de prédilection</h2>
          <p className="text-xs text-slate-400 mt-0.5">Sélectionnez les domaines dans lesquels vous avez le plus de contacts ou d&apos;expertise. <span className="font-semibold text-blue-600">Min. 1, max. 7.</span></p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map(s => {
            const sel = sectors.includes(s.value);
            const maxed = !sel && sectors.length >= 7;
            return (
              <button
                key={s.value}
                type="button"
                disabled={maxed}
                onClick={() => toggleSector(s.value)}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  sel
                    ? "border-blue-400 bg-blue-50 ring-1 ring-blue-200"
                    : maxed
                    ? "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed"
                    : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                }`}
              >
                <span className="shrink-0 text-xl mt-0.5">{s.icon}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold leading-snug ${sel ? "text-blue-800" : "text-slate-700"}`}>{s.label}</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">{s.desc}</p>
                </div>
                {sel && <span className="ml-auto shrink-0 text-blue-500 font-bold text-sm">✓</span>}
              </button>
            );
          })}
        </div>
        {sectors.length >= 7 && (
          <p className="text-xs text-amber-600 font-semibold">Maximum atteint — désélectionnez un secteur pour en ajouter un autre.</p>
        )}
      </section>

      {/* 2. Zone */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">2. Votre zone géographique principale</h2>
          <p className="text-xs text-slate-400 mt-0.5">Dans quelle zone êtes-vous le plus actif commercialement ?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {ZONES.map(z => (
            <button
              key={z}
              type="button"
              onClick={() => { setZone(z); setSaved(false); }}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                zone === z
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30"
              }`}
            >
              {z}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Type de réseau */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">3. Quel est votre type de réseau ?</h2>
          <p className="text-xs text-slate-400 mt-0.5">Cela nous aide à vous orienter vers les missions les mieux adaptées.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {NETWORK_TYPES.map(n => (
            <button
              key={n.value}
              type="button"
              onClick={() => { setNetworkType(n.value); setSaved(false); }}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                networkType === n.value
                  ? "border-violet-400 bg-violet-50 ring-1 ring-violet-200"
                  : "border-slate-100 bg-white hover:border-violet-200 hover:bg-violet-50/30"
              }`}
            >
              <span className="shrink-0 text-2xl mt-0.5">{n.icon}</span>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${networkType === n.value ? "text-violet-800" : "text-slate-700"}`}>{n.label}</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{n.desc}</p>
              </div>
              {networkType === n.value && <span className="ml-auto shrink-0 text-violet-500 font-bold">✓</span>}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Description du réseau */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">4. Décrivez votre réseau en quelques mots</h2>
          <p className="text-xs text-slate-400 mt-0.5">Exemple : « Réseau de 200 PME industrielles à Abidjan, contact avec des dirigeants du BTP et de l&apos;agroalimentaire. »</p>
        </div>
        <textarea
          value={networkDescription}
          onChange={e => { setNetworkDescription(e.target.value); setSaved(false); }}
          rows={4}
          maxLength={500}
          placeholder="Décrivez votre réseau, vos contacts clés, vos secteurs d'activité habituels..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <p className="text-[10px] text-slate-400 text-right">{networkDescription.length}/500</p>
      </section>

      {/* Encart recommandations */}
      {sectors.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4">
          <p className="text-sm font-bold text-amber-800 mb-2">🎯 À quoi sert Mon Marché ?</p>
          <ul className="space-y-1.5">
            {[
              `Les produits de vos ${sectors.length} secteur${sectors.length > 1 ? "s" : ""} seront mis en avant sur la page Marketplace.`,
              "Les missions compatibles avec votre zone et votre réseau seront signalées \"Recommandé pour vous\".",
              "L'équipe IBIG peut vous contacter directement pour des opportunités qui matchent votre profil.",
              "Votre profil apparaît dans le matching interne (côté admin) pour les opportunités B2B.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="shrink-0 mt-0.5">✦</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bouton sauvegarde */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving || sectors.length === 0}
          className="rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-3 transition shadow-sm"
        >
          {saving ? "Enregistrement…" : "Enregistrer Mon Marché →"}
        </button>
        {saved && (
          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
            <span>✓</span> Profil enregistré avec succès
          </p>
        )}
        {sectors.length === 0 && (
          <p className="text-xs text-slate-400">Sélectionnez au moins 1 secteur pour enregistrer.</p>
        )}
      </div>

    </form>
  );
}
