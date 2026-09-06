"use client";

import { useState, useTransition } from "react";

const CATEGORIES = ["AUTRE","FORMATION","DIGITAL","IMMOBILIER","SANTE","FINANCE","INDUSTRIE","COMMERCE","AGRICULTURE","ENERGIE","TRANSPORT","TOURISME"];
const STATUSES_FILTER = ["","GOLD","MASTER","ELITE","GOLD,MASTER,ELITE"];
const STATUS_LABELS: Record<string, string> = { DRAFT:"Brouillon", OPEN:"Ouvert", CLOSED:"Clôturé" };
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  OPEN:  "bg-emerald-100 text-emerald-700",
  CLOSED:"bg-slate-100 text-slate-600",
};
const INV_COLORS: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-rose-100 text-rose-700",
};

export type CallRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  targetZone: string | null;
  targetStatus: string | null;
  deadline: string | null;
  status: string;
  createdAt: string;
  invCount: number;
  acceptedCount: number;
};

type Props = {
  rows: CallRow[];
  createAction: (fd: FormData) => Promise<void>;
  sendInvitationsAction: (fd: FormData) => Promise<void>;
  closeAction: (fd: FormData) => Promise<void>;
};

export default function AppelsAdminClient({ rows, createAction, sendInvitationsAction, closeAction }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {/* Header + bouton créer */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{rows.length} appel(s) créé(s)</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          {showForm ? "Annuler" : "+ Nouvel appel"}
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <form
          action={(fd) => { startTransition(() => createAction(fd).then(() => setShowForm(false))); }}
          className="rounded-2xl border border-violet-200 bg-violet-50 p-6 space-y-4"
        >
          <h3 className="font-semibold text-violet-900">Nouvel appel à partenaires</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
              <input name="title" required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Ex: Recherche partenaires formation digitale CI" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
              <textarea name="description" required rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Décrivez l'appel, les attentes, les conditions…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie cible</label>
              <select name="category" className="w-full rounded-xl border px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone géographique cible</label>
              <input name="targetZone" className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Ex: Côte d'Ivoire, Abidjan…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Niveau partenaire cible</label>
              <select name="targetStatus" className="w-full rounded-xl border px-3 py-2 text-sm">
                <option value="">Tous niveaux</option>
                <option value="GOLD">GOLD</option>
                <option value="MASTER">MASTER</option>
                <option value="ELITE">ELITE</option>
                <option value="GOLD,MASTER,ELITE">GOLD + MASTER + ELITE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date limite</label>
              <input name="deadline" type="date" className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {pending ? "Création…" : "Créer l'appel"}
          </button>
        </form>
      )}

      {/* Liste des appels */}
      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl border bg-gray-50 p-8 text-center text-sm text-gray-500">
            Aucun appel créé. Cliquez sur &ldquo;+ Nouvel appel&rdquo; pour commencer.
          </p>
        )}
        {rows.map(row => (
          <div key={row.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            {/* En-tête de la carte */}
            <div
              className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === row.id ? null : row.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">📣</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{row.title}</p>
                  <p className="text-xs text-gray-500">{row.category} {row.targetZone ? `· ${row.targetZone}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[row.status] ?? row.status}
                </span>
                <span className="text-xs text-gray-400">{row.invCount} invités · {row.acceptedCount} acceptés</span>
                <span className="text-gray-400">{expanded === row.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Détail */}
            {expanded === row.id && (
              <div className="border-t p-4 space-y-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{row.description}</p>
                {row.deadline && (
                  <p className="text-xs text-amber-700">⏰ Date limite : {new Date(row.deadline).toLocaleDateString("fr-FR")}</p>
                )}
                {row.targetStatus && (
                  <p className="text-xs text-gray-500">Niveaux ciblés : <strong>{row.targetStatus}</strong></p>
                )}

                <div className="flex flex-wrap gap-2">
                  {row.status === "OPEN" && (
                    <form action={sendInvitationsAction}>
                      <input type="hidden" name="callId" value={row.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                      >
                        📩 Envoyer invitations aux partenaires matchés
                      </button>
                    </form>
                  )}
                  {row.status === "OPEN" && (
                    <form action={closeAction}>
                      <input type="hidden" name="callId" value={row.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Clôturer l&apos;appel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
