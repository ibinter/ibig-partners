"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { formatDate } from "@/lib/format";

const DOC_TYPES = [
  { value: "RCCM",      label: "RCCM (Registre de Commerce)", required: true },
  { value: "NIF",       label: "NIF / Numéro fiscal" },
  { value: "STATUTS",   label: "Statuts de la société" },
  { value: "ID_GERANT", label: "CNI / Passeport du gérant" },
  { value: "AUTRE",     label: "Autre document" },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "En examen", APPROVED: "Validé ✓", REJECTED: "Rejeté",
};

type Doc = {
  id: string; docType: string; docName: string; fileUrl: string;
  note: string; status: string; adminNote: string; createdAt: string;
};

export default function KybClient({
  kybStatus, docs, submitAction, deleteAction,
}: {
  kybStatus: string;
  docs: Doc[];
  submitAction: (fd: FormData) => Promise<void>;
  deleteAction: (fd: FormData) => Promise<void>;
}) {
  const [key, setKey] = useState(0); // force re-mount FileUpload après submit

  const verified  = kybStatus === "VERIFIED";
  const submitted = kybStatus === "SUBMITTED";

  return (
    <div className="space-y-6">

      {/* Badge statut global */}
      {verified ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-center gap-3">
          <span className="text-3xl">🏢</span>
          <div>
            <p className="font-bold text-emerald-800">Entreprise vérifiée ✓</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Votre badge Entreprise vérifiée est actif sur toutes vos opportunités B2B.
            </p>
          </div>
        </div>
      ) : submitted ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-semibold text-amber-800">Dossier en cours d&apos;examen</p>
            <p className="text-sm text-amber-700 mt-0.5">Notre équipe examine vos documents sous 48h ouvrables.</p>
          </div>
        </div>
      ) : kybStatus === "REJECTED" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-semibold text-rose-800">Dossier rejeté — ajoutez les documents manquants</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-700 p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <p className="font-bold text-base mb-1">🏢 Pourquoi certifier votre entreprise ?</p>
            <p className="text-sm text-blue-100 leading-relaxed mb-3">
              Le badge <strong className="text-white">Entreprise vérifiée</strong> renforce la crédibilité de vos
              opportunités B2B auprès des partenaires du réseau IBIG.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[["📋", "Uploadez le RCCM"], ["🔍", "Validation 48h"], ["🏅", "Badge affiché"]].map(([icon, label]) => (
                <div key={String(label)} className="rounded-xl bg-white/15 px-2 py-2.5">
                  <p className="text-xl">{icon}</p>
                  <p className="text-xs font-semibold mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents déjà soumis */}
      {docs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Documents soumis</h2>
          {docs.map((doc) => (
            <div key={doc.id}
              className={`rounded-2xl border bg-white shadow-sm px-4 py-3 flex items-center gap-3 ${doc.status === "REJECTED" ? "border-rose-200" : "border-slate-100"}`}>
              <span className="text-xl shrink-0">{doc.fileUrl.includes(".pdf") ? "📄" : "🖼️"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{doc.docName}</p>
                <p className="text-xs text-slate-400">
                  {DOC_TYPES.find(t => t.value === doc.docType)?.label ?? doc.docType} · {formatDate(doc.createdAt)}
                </p>
                {doc.adminNote && (
                  <p className="text-xs text-rose-600 mt-0.5 font-medium">Note admin : {doc.adminNote}</p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <a href={`/api/cloudinary/signed-url?url=${encodeURIComponent(doc.fileUrl)}`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline font-semibold">Voir</a>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[doc.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {STATUS_LABELS[doc.status] ?? doc.status}
                </span>
                {doc.status !== "APPROVED" && (
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={doc.id} />
                    <button type="submit" className="text-rose-400 hover:text-rose-600 text-xs font-bold" title="Supprimer">✕</button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire ajout document */}
      {!verified && (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
            <h3 className="font-semibold text-sm text-slate-800">Ajouter un document d&apos;entreprise</h3>
          </div>
          <form
            key={key}
            action={async (fd) => {
              await submitAction(fd);
              setKey(k => k + 1);
            }}
            className="p-5 space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Type de document <span className="text-rose-500">*</span>
                </label>
                <select name="docType" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white">
                  {DOC_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}{t.required ? " *" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nom du document <span className="text-rose-500">*</span>
                </label>
                <input name="docName" required placeholder="Ex: RCCM Société ACME 2024"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Fichier (PDF ou image) <span className="text-rose-500">*</span>
              </label>
              <FileUpload
                name="fileUrl"
                folder="kyb-docs"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                preview="none"
                hint="PDF, JPG, PNG · max 10 Mo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Note (optionnel)</label>
              <input name="note" placeholder="Précisions supplémentaires…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white" />
            </div>

            <button type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 text-sm transition">
              Soumettre le document →
            </button>
          </form>
        </div>
      )}

      {/* Infos requises */}
      {!verified && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-semibold text-sm text-slate-800 mb-3">Documents requis</h3>
          <div className="space-y-2">
            {[
              { icon: "📋", doc: "RCCM", desc: "Obligatoire — Registre de Commerce et du Crédit Mobilier", required: true },
              { icon: "🔢", doc: "NIF", desc: "Recommandé — Numéro d'Identification Fiscale" },
              { icon: "📄", doc: "Statuts", desc: "Optionnel — Statuts de la société (SA, SARL, SAS…)" },
              { icon: "🪪", doc: "CNI Gérant", desc: "Recommandé — Pièce d'identité du gérant ou directeur" },
            ].map(item => (
              <div key={item.doc} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {item.doc}{item.required && <span className="ml-1 text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">REQUIS</span>}
                  </p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
