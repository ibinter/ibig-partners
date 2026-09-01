"use client";

import { useState } from "react";

const CONNECTION_TYPES: { value: string; label: string; icon: string; desc: string; rate: number }[] = [
  { value: "FINANCEMENT",            label: "Financement",          icon: "💰", desc: "Une entité cherche un financement, une autre peut prêter ou investir.", rate: 1.5 },
  { value: "PARTENARIAT",            label: "Partenariat B2B",      icon: "🤝", desc: "Deux entreprises qui peuvent collaborer, co-développer ou se distribuer mutuellement.", rate: 2 },
  { value: "CLIENT",                 label: "Apport de client",     icon: "🎯", desc: "Vous connaissez un client potentiel pour une entreprise précise.", rate: 3 },
  { value: "RECRUTEMENT",            label: "Recrutement / Emploi", icon: "👥", desc: "Un professionnel cherche un emploi, une entreprise cherche ce profil exact.", rate: 5 },
  { value: "FOURNISSEUR",            label: "Fournisseur / Négoce", icon: "🚚", desc: "Connecter un acheteur avec un fournisseur de produits ou matières premières.", rate: 2 },
  { value: "INVESTISSEMENT",         label: "Investissement",       icon: "📈", desc: "Un projet cherche des investisseurs, ou un investisseur cherche des opportunités.", rate: 1 },
  { value: "TRANSACTION_IMMOBILIERE",label: "Immobilier",           icon: "🏠", desc: "Acheteur et vendeur à connecter pour une transaction immobilière.", rate: 5 },
  { value: "AUTRE",                  label: "Autre",                icon: "💡", desc: "Toute autre mise en relation professionnelle à valeur ajoutée.", rate: 2 },
];

const ZONES = ["Abidjan", "Côte d'Ivoire", "Afrique de l'Ouest", "Afrique", "International"];

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  NEW:       { label: "Soumis",    badge: "bg-slate-100 text-slate-600",   icon: "📨" },
  ANALYZING: { label: "En analyse",badge: "bg-amber-100 text-amber-700",   icon: "🔍" },
  MATCHED:   { label: "Mis en relation !", badge: "bg-blue-100 text-blue-700",   icon: "🤝" },
  COMPLETED: { label: "Finalisé ✓", badge: "bg-emerald-100 text-emerald-700", icon: "✅" },
  REJECTED:  { label: "Non retenu", badge: "bg-rose-100 text-rose-700",    icon: "❌" },
};

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F CFA";
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

type Row = {
  id: string; title: string; connectionType: string; needSide: string; provideSide: string;
  zone: string; estimatedValue: number; commissionEstimate: number;
  status: string; adminNote: string; createdAt: string;
};

export default function ConnectClient({
  rows, stats, submitAction,
}: {
  rows: Row[];
  stats: { total: number; matched: number; pending: number; earned: number };
  submitAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<"new" | "history">(rows.length === 0 ? "new" : "history");
  const [connType, setConnType] = useState("PARTENARIAT");
  const [estimatedValue, setEstimatedValue] = useState(5000000);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const selectedType = CONNECTION_TYPES.find(t => t.value === connType) ?? CONNECTION_TYPES[1];
  const commissionPreview = Math.round(estimatedValue * selectedType.rate / 100);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await submitAction(fd);
    setSubmitting(false);
    setTab("history");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="space-y-6">

      {/* Hero CONNECT */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-800 via-emerald-900 to-slate-900 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 60%, #34d399 0%, transparent 50%), radial-gradient(circle at 80% 30%, #6ee7b7 0%, transparent 40%)" }} />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-1">IBIG CONNECT — Intermédiation</p>
          <h2 className="text-2xl font-extrabold mb-2">Votre réseau = votre capital.</h2>
          <p className="text-sm text-white/70 max-w-xl leading-relaxed">
            Vous connaissez deux parties qui ont besoin l&apos;une de l&apos;autre ? Soumettez la mise en relation à IBIG.
            Nous facilitons la connexion. Vous touchez une commission d&apos;intermédiation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { v: stats.total, label: "Mises en relation soumises" },
              { v: stats.matched, label: "Connexions réussies" },
              { v: stats.pending, label: "En cours d'analyse" },
            ].map((k, i) => (
              <div key={i} className="rounded-xl bg-white/10 px-4 py-2 text-center">
                <p className="text-xl font-extrabold">{k.v}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">{k.label}</p>
              </div>
            ))}
            {stats.earned > 0 && (
              <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-center">
                <p className="text-xl font-extrabold text-emerald-300">{fmt(stats.earned)}</p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Commissions finalisées</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4">
        <p className="text-sm font-bold text-teal-800 mb-3">💡 Comment fonctionne IBIG CONNECT ?</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { step: "1", text: "Vous identifiez deux parties dont les besoins se complètent." },
            { step: "2", text: "Vous soumettez la mise en relation avec les détails." },
            { step: "3", text: "L'équipe IBIG analyse et contacte les deux parties." },
            { step: "4", text: "Si la connexion aboutit, vous percevez votre commission." },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-2">
              <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-extrabold">{s.step}</span>
              <p className="text-xs text-teal-700 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-100">
        {(["new", "history"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2.5 px-1 text-sm font-bold border-b-2 transition ${tab === t ? "border-teal-600 text-teal-700" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
            {t === "new" ? "➕ Nouvelle mise en relation" : `📋 Mes demandes (${rows.length})`}
          </button>
        ))}
      </div>

      {/* Formulaire */}
      {tab === "new" && (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">

          {/* Type de connexion */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">Type de mise en relation</label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {CONNECTION_TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => setConnType(t.value)}
                  className={`flex items-start gap-2.5 rounded-2xl border px-3 py-3 text-left transition ${connType === t.value ? "border-teal-400 bg-teal-50 ring-1 ring-teal-200" : "border-slate-100 bg-white hover:border-teal-200"}`}>
                  <span className="text-xl shrink-0">{t.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-tight ${connType === t.value ? "text-teal-800" : "text-slate-700"}`}>{t.label}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-tight line-clamp-2">{t.desc}</p>
                    <p className="text-[9px] font-bold text-emerald-600 mt-0.5">Commission ≈ {t.rate}%</p>
                  </div>
                </button>
              ))}
            </div>
            <input type="hidden" name="connectionType" value={connType} />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Titre de la mise en relation *</label>
              <input name="title" required
                placeholder={`Ex: ${selectedType.icon} Connecter un promoteur immobilier avec un investisseur diaspora`}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>

            {/* Deux côtés */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  🔵 Côté Besoin — Qui cherche quoi ? *
                </label>
                <textarea name="needSide" required rows={4}
                  placeholder="Ex : PME agroalimentaire basée à Abidjan, cherche un financement de 50M FCFA pour acquérir une ligne de production. Dossier solide, 5 ans d'activité."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none resize-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  🟢 Côté Solution — Qui peut répondre ? *
                </label>
                <textarea name="provideSide" required rows={4}
                  placeholder="Ex : Établissement de microfinance partenaire IBIG, disposé à financer des PME structurées entre 20M et 100M FCFA."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none resize-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              </div>
            </div>

            {/* Zone + Valeur estimée */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Zone géographique</label>
                <select name="zone" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-400">
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Valeur estimée de la transaction (F CFA)</label>
                <input name="estimatedValue" type="number" min={0} step={100000}
                  value={estimatedValue} onChange={e => setEstimatedValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-400" />
              </div>
            </div>

            {/* Preview commission */}
            {commissionPreview > 0 && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-700">Commission estimée pour vous</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    Taux indicatif {selectedType.rate}% · Commission versée si la connexion est finalisée
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 shrink-0">{fmt(commissionPreview)}</p>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting}
            className="rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold px-8 py-3 transition shadow-sm">
            {submitting ? "Envoi en cours…" : "Soumettre la mise en relation →"}
          </button>
          <p className="text-xs text-slate-400">
            La commission est indicative et sera confirmée par l&apos;équipe IBIG après analyse du dossier.
          </p>
        </form>
      )}

      {/* Historique */}
      {tab === "history" && (
        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
              <p className="text-4xl mb-3">🔗</p>
              <p className="text-slate-500 text-sm font-semibold">Aucune demande soumise</p>
              <p className="text-xs text-slate-400 mt-1">Identifiez votre première mise en relation et soumettez-la.</p>
              <button onClick={() => setTab("new")}
                className="mt-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2 transition">
                Créer ma première mise en relation →
              </button>
            </div>
          ) : rows.map(r => {
            const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.NEW;
            const type = CONNECTION_TYPES.find(t => t.value === r.connectionType);
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className={`rounded-2xl border bg-white shadow-sm ${r.status === "COMPLETED" ? "border-emerald-200 ring-1 ring-emerald-100" : r.status === "MATCHED" ? "border-blue-200" : "border-slate-100"}`}>
                <button onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50/40 rounded-2xl transition-colors">
                  <span className="text-2xl shrink-0">{type?.icon ?? "🔗"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm truncate">{r.title}</p>
                      <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase ${cfg.badge}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{type?.label ?? r.connectionType} · {r.zone} · {fmtDate(r.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {r.commissionEstimate > 0 && (
                      <p className="text-sm font-bold text-emerald-600">{fmt(r.commissionEstimate)}</p>
                    )}
                    {r.estimatedValue > 0 && (
                      <p className="text-[10px] text-slate-400">Valeur : {fmt(r.estimatedValue)}</p>
                    )}
                  </div>
                  <span className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-2">🔵 Côté Besoin</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{r.needSide}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-2">🟢 Côté Solution</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{r.provideSide}</p>
                      </div>
                    </div>
                    {r.adminNote && (
                      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Note de l&apos;équipe IBIG</p>
                        <p className="text-sm text-amber-800">{r.adminNote}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      {r.estimatedValue > 0 && <span>Valeur transaction : <strong className="text-slate-600">{fmt(r.estimatedValue)}</strong></span>}
                      {r.commissionEstimate > 0 && <span>Commission estimée : <strong className="text-emerald-600">{fmt(r.commissionEstimate)}</strong></span>}
                      <span>Soumis le {fmtDate(r.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
