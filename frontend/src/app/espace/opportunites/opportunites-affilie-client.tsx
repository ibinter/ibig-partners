"use client";

import { useState, useMemo } from "react";
import { fcfa, formatDate } from "@/lib/format";
import { DescriptionBlock } from "@/components/DescriptionBlock";

const CATEGORY_LABELS: Record<string, string> = {
  FORMATION: "Formation", DIGITAL: "Digital / IT", IMMOBILIER: "Immobilier",
  PARTENARIAT: "Partenariat", COMMERCIAL: "Commercial / Vente", CONSEIL: "Conseil",
  FINANCEMENT: "Financement", EMPLOI_RH: "Emploi & RH", MISE_EN_RELATION: "Mise en relation",
  SERVICES: "Services B2B", AUTRE: "Autre",
};
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW:         { label: "En attente",  color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "En cours",   color: "bg-amber-100 text-amber-700" },
  APPROVED:    { label: "Approuvé",   color: "bg-emerald-100 text-emerald-700" },
  REJECTED:    { label: "Non retenu", color: "bg-rose-100 text-rose-700" },
  WON:         { label: "Gagné 🎉",   color: "bg-emerald-100 text-emerald-700" },
  LOST:        { label: "Perdu",      color: "bg-slate-100 text-slate-500" },
};

type Message = { id: string; fromAdmin: boolean; senderName: string; body: string; createdAt: string };
type MyRow = {
  id: string; code: string; title: string; category: string; description: string;
  estimatedValue: number; status: string; adminNote: string;
  commission: number; commissionType: string;
  createdAt: string; messages: Message[]; unreadCount: number;
};
type PublicRow = {
  id: string; code: string; title: string; category: string; description: string;
  estimatedValue: number; partnerCommission: number; partnerCommissionType: string;
  adminNote: string; deadline: string | null; leadCount: number;
  publisherType: "ENTERPRISE" | "PARTNER";
  publisherName: string;
  publisherVerified: boolean;
  isRecommended: boolean;
  createdAt: string; myLead: { status: string; createdAt: string } | null;
};

function PublisherBadge({ type, name, verified }: { type: string; name: string; verified: boolean }) {
  const isEnt = type === "ENTERPRISE";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
      isEnt
        ? "bg-blue-50 border-blue-200 text-blue-700"
        : "bg-violet-50 border-violet-200 text-violet-700"
    }`}>
      {isEnt ? "🏢" : "👤"} {name}
      {verified && <span className="text-emerald-500 font-bold">✓</span>}
    </span>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors whitespace-nowrap ${
      active ? "bg-brand-600 text-white border-brand-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
    }`}>
      {label}
    </button>
  );
}

type PublicCardProps = {
  row: PublicRow;
  alreadyIn: boolean;
  note: string;
  onNoteChange: (id: string, val: string) => void;
  onInterest: (row: PublicRow) => void;
};

function PublicCard({ row, alreadyIn, note, onNoteChange, onInterest }: PublicCardProps) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm space-y-3 transition-all ${
      row.isRecommended ? "border-violet-200 ring-1 ring-violet-100" : "border-slate-100"
    }`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {row.code && <span className="text-[10px] font-mono font-bold text-amber-600">{row.code}</span>}
            {row.isRecommended && (
              <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full border border-violet-200">
                🎯 Recommandé pour vous
              </span>
            )}
          </div>
          <p className="font-bold text-slate-900 text-base leading-snug">{row.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {CATEGORY_LABELS[row.category] ?? row.category}
            </span>
            <PublisherBadge type={row.publisherType} name={row.publisherName} verified={row.publisherVerified} />
          </div>
        </div>
        <div className="text-right shrink-0">
          {row.partnerCommission > 0 ? (
            <>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Votre gain</p>
              <p className="font-extrabold text-emerald-600 text-lg">
                {row.partnerCommissionType === "PERCENT"
                  ? `${row.partnerCommission}%`
                  : fcfa(row.partnerCommission)}
              </p>
              <p className="text-[10px] text-emerald-500">sur résultat ✓</p>
            </>
          ) : (
            <p className="font-semibold text-emerald-600 text-sm">Sur résultat ✓</p>
          )}
        </div>
      </div>

      <DescriptionBlock text={row.description} />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        {row.estimatedValue > 0 && (
          <span>🏷️ Valeur : <strong className="text-slate-700">{fcfa(row.estimatedValue)}</strong></span>
        )}
        {row.partnerCommission > 0 && row.partnerCommissionType === "PERCENT" && row.estimatedValue > 0 && (
          <span className="text-emerald-600 font-semibold">
            💸 Gain estimé : {fcfa(Math.round(row.estimatedValue * row.partnerCommission / 100))}
          </span>
        )}
        {row.deadline && (
          <span>⏳ Deadline : <strong className="text-slate-600">{formatDate(row.deadline)}</strong></span>
        )}
        <span>👥 {row.leadCount} candidat{row.leadCount !== 1 ? "s" : ""}</span>
        <span className="text-slate-300">Publié le {formatDate(row.createdAt)}</span>
      </div>

      {row.adminNote && (
        <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-2 text-sm text-brand-700">
          <span className="font-semibold">Note IBIG :</span> {row.adminNote}
        </div>
      )}

      {alreadyIn ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 text-sm text-emerald-700 font-semibold flex items-center gap-2">
          ✅ Candidature envoyée — l&apos;équipe IBIG vous contactera.
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          <textarea
            value={note}
            onChange={e => onNoteChange(row.id, e.target.value)}
            rows={2}
            placeholder="Message optionnel : votre approche, votre réseau, pourquoi cette opportunité vous correspond…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
          />
          <button
            onClick={() => onInterest(row)}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 transition-colors"
          >
            🤝 Je suis intéressé(e)
          </button>
        </div>
      )}
    </div>
  );
}

export default function OpportunitesAffilieClient({
  myRows, publicRows, userRole, replyAction, interestAction,
}: {
  myRows: MyRow[];
  publicRows: PublicRow[];
  userRole: string;
  replyAction: (fd: FormData) => Promise<void>;
  interestAction: (fd: FormData) => Promise<void>;
}) {
  const [tab, setTab]           = useState<"public" | "mine" | "submit">("public");
  const [selected, setSelected] = useState<MyRow | null>(null);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);
  const [noteMap, setNoteMap]   = useState<Record<string, string>>({});
  const [interested, setInterested] = useState<Set<string>>(
    new Set(publicRows.filter(r => r.myLead).map(r => r.id))
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [publisherFilter, setPublisherFilter] = useState<"ALL" | "ENTERPRISE" | "PARTNER">("ALL");

  const categories = useMemo(() => {
    const cats = new Set(publicRows.map(r => r.category));
    return ["ALL", ...Array.from(cats)];
  }, [publicRows]);

  const recommended = useMemo(
    () => publicRows.filter(r => r.isRecommended && !interested.has(r.id)),
    [publicRows, interested]
  );

  const filtered = useMemo(() => publicRows.filter(r => {
    if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
    if (publisherFilter !== "ALL" && r.publisherType !== publisherFilter) return false;
    return true;
  }), [publicRows, categoryFilter, publisherFilter]);

  function handleNoteChange(id: string, val: string) {
    setNoteMap(prev => ({ ...prev, [id]: val }));
  }

  async function handleInterest(row: PublicRow) {
    const fd = new FormData();
    fd.append("opportunityId", row.id);
    fd.append("note", noteMap[row.id] ?? "");
    await interestAction(fd);
    setInterested(prev => new Set([...prev, row.id]));
    setNoteMap(prev => { const n = { ...prev }; delete n[row.id]; return n; });
  }

  async function handleReply(opp: MyRow) {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("opportunityId", opp.id);
      fd.append("body", reply.trim());
      await replyAction(fd);
      setReply("");
    } finally { setSending(false); }
  }

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
  const showFilters = categoryFilter === "ALL" && publisherFilter === "ALL";

  return (
    <div className="space-y-4">
      {/* Onglets */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "public", label: `🌐 Toutes les annonces (${publicRows.length})` },
          { key: "mine",   label: `📤 Mes annonces (${myRows.length})` },
          { key: "submit", label: "➕ Publier une annonce" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-brand-600 text-white shadow"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Onglet : Toutes les annonces ── */}
      {tab === "public" && (
        <div className="space-y-4">
          {/* Filtres */}
          {publicRows.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">Type</span>
                {(["ALL", "ENTERPRISE", "PARTNER"] as const).map(f => (
                  <CategoryPill
                    key={f}
                    label={f === "ALL" ? "Tous" : f === "ENTERPRISE" ? "🏢 Entreprises" : "👤 Partenaires"}
                    active={publisherFilter === f}
                    onClick={() => setPublisherFilter(f)}
                  />
                ))}
              </div>
              {categories.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">Secteur</span>
                  {categories.map(cat => (
                    <CategoryPill
                      key={cat}
                      label={cat === "ALL" ? "Tous" : (CATEGORY_LABELS[cat] ?? cat)}
                      active={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recommandations */}
          {recommended.length > 0 && showFilters && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500">🎯 Recommandé pour vous</p>
              {recommended.map(row => (
                <PublicCard
                  key={row.id}
                  row={row}
                  alreadyIn={interested.has(row.id)}
                  note={noteMap[row.id] ?? ""}
                  onNoteChange={handleNoteChange}
                  onInterest={handleInterest}
                />
              ))}
              <div className="border-t border-slate-100 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Toutes les annonces</p>
              </div>
            </div>
          )}

          {/* Liste filtrée */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <p className="text-4xl mb-3">🤝</p>
              <p className="font-semibold text-slate-600">
                {publicRows.length === 0
                  ? "Aucune opportunité disponible pour le moment"
                  : "Aucune annonce pour ce filtre"}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {publicRows.length === 0
                  ? "Revenez bientôt — l'équipe IBIG publie régulièrement de nouvelles opportunités."
                  : "Essayez un autre secteur ou type de publication."}
              </p>
            </div>
          ) : (
            filtered
              .filter(r => !(r.isRecommended && showFilters && !interested.has(r.id)))
              .map(row => (
                <PublicCard
                  key={row.id}
                  row={row}
                  alreadyIn={interested.has(row.id)}
                  note={noteMap[row.id] ?? ""}
                  onNoteChange={handleNoteChange}
                  onInterest={handleInterest}
                />
              ))
          )}
        </div>
      )}

      {/* ── Onglet : Mes annonces ── */}
      {tab === "mine" && !selected && (
        <div className="space-y-3">
          {myRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center space-y-3">
              <p className="text-4xl">📤</p>
              <p className="font-semibold text-slate-600">Aucune annonce soumise</p>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {userRole === "ENTERPRISE"
                  ? "Publiez une opportunité commerciale ou un partenariat — le réseau IBIG vous trouvera des candidats qualifiés."
                  : "Vous avez un bien à vendre, un service à proposer ou un réseau commercial à valoriser ? Publiez votre annonce."}
              </p>
              <button onClick={() => setTab("submit")} className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">
                ➕ Publier une annonce
              </button>
            </div>
          ) : (
            myRows.map(row => {
              const s = STATUS_LABELS[row.status] ?? { label: row.status, color: "bg-slate-100 text-slate-600" };
              return (
                <div key={row.id} onClick={() => setSelected(row)}
                  className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 hover:border-brand-200 hover:shadow-sm transition-all flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {row.code && <p className="text-[10px] font-mono font-bold text-amber-600">{row.code}</p>}
                    <p className="font-semibold text-slate-900 truncate">{row.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {CATEGORY_LABELS[row.category] ?? row.category} · {formatDate(row.createdAt)}
                    </p>
                    {row.adminNote && (
                      <p className="text-xs text-brand-600 mt-1 truncate">💬 {row.adminNote}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {row.unreadCount > 0 && (
                      <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        {row.unreadCount}
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                    <span className="text-slate-300">›</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Détail d'une soumission ── */}
      {tab === "mine" && selected && (
        <div className="space-y-4">
          <button onClick={() => setSelected(null)} className="text-sm text-brand-600 hover:underline">← Retour</button>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-bold text-slate-900 text-lg">{selected.title}</p>
                <span className="text-xs text-slate-400">{CATEGORY_LABELS[selected.category] ?? selected.category}</span>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${(STATUS_LABELS[selected.status] ?? { color: "bg-slate-100 text-slate-600" }).color}`}>
                {(STATUS_LABELS[selected.status] ?? { label: selected.status }).label}
              </span>
            </div>
            <DescriptionBlock text={selected.description} />
            {selected.adminNote && (
              <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-2 text-sm text-brand-700">
                <span className="font-semibold">Réponse IBIG :</span> {selected.adminNote}
              </div>
            )}
            {selected.commission > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2 text-sm text-amber-700">
                <span className="font-semibold">Commission IBIG :</span> {fcfa(selected.commission)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Messages avec l&apos;équipe IBIG</p>
            {selected.messages.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucun échange pour le moment.</p>
            ) : (
              selected.messages.map(m => (
                <div key={m.id} className={`rounded-xl px-4 py-3 text-sm ${m.fromAdmin ? "bg-brand-50 border border-brand-100" : "bg-slate-50 border border-slate-100"}`}>
                  <p className="font-semibold text-xs text-slate-500 mb-1">{m.senderName} · {formatDate(m.createdAt)}</p>
                  <p className="text-slate-700">{m.body}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              rows={2}
              placeholder="Votre réponse…"
              className={inputCls + " resize-none flex-1"}
            />
            <button
              onClick={() => handleReply(selected)}
              disabled={sending || !reply.trim()}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 self-end disabled:opacity-50"
            >
              {sending ? "…" : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      {/* ── Onglet : Publier ── */}
      {tab === "submit" && (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 max-w-2xl space-y-5">
          <div>
            <p className="text-3xl mb-2">📣</p>
            <p className="font-bold text-slate-900 text-xl">Publier une annonce sur le réseau IBIG</p>
            <p className="text-sm text-slate-500 mt-1">
              {userRole === "ENTERPRISE"
                ? "Vous cherchez un partenaire commercial, un apporteur d'affaires ou un prestataire ? Décrivez votre besoin — IBIG coordonne les candidatures."
                : "Vous avez une opportunité à valoriser ? Un bien, un service, un contact ? Publiez votre annonce et laissez le réseau travailler pour vous."}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {(userRole === "ENTERPRISE"
              ? [
                  { icon: "🤝", label: "Partenariat commercial", desc: "Chercher un apporteur d'affaires" },
                  { icon: "🏪", label: "Franchise ou distribution", desc: "Réseau revendeurs / distributeurs" },
                  { icon: "👔", label: "Recrutement & RH", desc: "Trouver un profil ou une compétence" },
                  { icon: "💼", label: "Prestataire B2B", desc: "Sous-traitance, consulting, service" },
                ]
              : [
                  { icon: "🏠", label: "Bien immobilier", desc: "Vente ou location" },
                  { icon: "🛒", label: "Bien ou service", desc: "Produit, équipement, prestation" },
                  { icon: "🤝", label: "Mise en relation", desc: "Un contact que vous monétisez" },
                  { icon: "💡", label: "Opportunité commerciale", desc: "Piste client, partenaire, deal" },
                ]
            ).map((item: { icon: string; label: string; desc: string }) => (
              <div key={item.label} className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <a
              href="/espace/publier"
              className="inline-block rounded-2xl bg-brand-600 px-8 py-3 text-sm font-extrabold text-white hover:bg-brand-700 transition-colors shadow"
            >
              Publier mon annonce →
            </a>
            <p className="text-xs text-slate-400 self-center">Gratuit · Réponse IBIG sous 24–48h · Vous ne payez que sur résultat</p>
          </div>
        </div>
      )}
    </div>
  );
}
