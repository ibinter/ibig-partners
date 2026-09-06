"use client";

import { useTransition } from "react";

const STATUS_COLORS: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  DECLINED: "bg-rose-100 text-rose-700",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING:  "En attente",
  ACCEPTED: "Accepté",
  DECLINED: "Décliné",
};
const CALL_STATUS_COLORS: Record<string, string> = {
  OPEN:   "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

export type InvRow = {
  id: string;
  callId: string;
  callTitle: string;
  callDescription: string;
  callCategory: string;
  callDeadline: string | null;
  callStatus: string;
  status: string;
  sentAt: string;
};

type Props = {
  invitations: InvRow[];
  respondAction: (fd: FormData) => Promise<void>;
};

export default function AppelsPartnerClient({ invitations, respondAction }: Props) {
  const [pending, startTransition] = useTransition();

  if (invitations.length === 0) {
    return (
      <div className="rounded-2xl border bg-gray-50 p-10 text-center">
        <p className="text-3xl mb-3">📣</p>
        <p className="font-semibold text-gray-700">Aucun appel à partenaires pour vous</p>
        <p className="text-sm text-gray-500 mt-1">Complétez votre profil (secteurs de marché) pour être ciblé par les prochains appels IBIG.</p>
      </div>
    );
  }

  const pending_ = invitations.filter(i => i.status === "PENDING");
  const others = invitations.filter(i => i.status !== "PENDING");

  return (
    <div className="space-y-6">
      {pending_.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-amber-700 mb-3">⏳ En attente de votre réponse ({pending_.length})</h2>
          <div className="space-y-3">
            {pending_.map(inv => (
              <InvCard key={inv.id} inv={inv} respondAction={respondAction} pending={pending} startTransition={startTransition} />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">Historique ({others.length})</h2>
          <div className="space-y-3">
            {others.map(inv => (
              <InvCard key={inv.id} inv={inv} respondAction={respondAction} pending={pending} startTransition={startTransition} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InvCard({ inv, respondAction, pending, startTransition }: {
  inv: InvRow;
  respondAction: (fd: FormData) => Promise<void>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">📣</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm">{inv.callTitle}</p>
            <p className="text-xs text-gray-500">{inv.callCategory} · Reçu le {new Date(inv.sentAt).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CALL_STATUS_COLORS[inv.callStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {inv.callStatus === "OPEN" ? "Ouvert" : "Clôturé"}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABELS[inv.status] ?? inv.status}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-wrap">{inv.callDescription}</p>

      {inv.callDeadline && (
        <p className="text-xs text-amber-700">⏰ Date limite : {new Date(inv.callDeadline).toLocaleDateString("fr-FR")}</p>
      )}

      {inv.status === "PENDING" && inv.callStatus === "OPEN" && (
        <div className="flex gap-2 pt-1">
          <form action={(fd) => { startTransition(() => respondAction(fd)); }}>
            <input type="hidden" name="callId" value={inv.callId} />
            <input type="hidden" name="status" value="ACCEPTED" />
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              ✓ Accepter
            </button>
          </form>
          <form action={(fd) => { startTransition(() => respondAction(fd)); }}>
            <input type="hidden" name="callId" value={inv.callId} />
            <input type="hidden" name="status" value="DECLINED" />
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              ✕ Décliner
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
