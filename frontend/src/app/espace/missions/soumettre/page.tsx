"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "IMMOBILIER", "FORMATION", "DIGITAL", "INFORMATIQUE", "FINANCEMENT",
  "COMMERCIAL", "CONSEIL", "EMPLOI_RH", "SERVICES", "COMMERCE",
  "PARTENARIAT", "MISE_EN_RELATION", "AUTRE",
];
const CATEGORY_LABELS: Record<string, string> = {
  IMMOBILIER: "🏠 Immobilier", FORMATION: "🎓 Formation", DIGITAL: "💻 Digital",
  INFORMATIQUE: "⚙️ Logiciels/SaaS", FINANCEMENT: "💰 Financement & Assurance",
  COMMERCIAL: "🤝 Commercial", CONSEIL: "📋 Conseil", EMPLOI_RH: "👥 Emploi & RH",
  SERVICES: "🛠️ Services", COMMERCE: "🛒 Commerce", PARTENARIAT: "🌐 Partenariat",
  MISE_EN_RELATION: "🔗 Mise en relation", AUTRE: "💡 Autre",
};

type MediaItem = { url: string; mediaType: string; name: string; preview?: string };

export default function SoumettreOpportunitePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [submissionType, setSubmissionType] = useState<"OFFER" | "DEMAND">("OFFER");
  const [title, setTitle]         = useState("");
  const [description, setDesc]    = useState("");
  const [category, setCategory]   = useState("AUTRE");
  const [zone, setZone]           = useState("Côte d'Ivoire");
  const [contactName, setCName]   = useState("");
  const [contactPhone, setCPhone] = useState("");
  const [contactEmail, setCEmail] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [medias, setMedias]       = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/mission-media", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        const mediaType = file.type.startsWith("image/") ? "IMAGE"
          : file.type === "application/pdf" ? "PDF" : "LINK";
        setMedias(prev => [...prev, { url, mediaType, name: file.name }]);
      }
    }
    setUploading(false);
  }

  function addVideoLink() {
    if (!videoLink.trim()) return;
    setMedias(prev => [...prev, { url: videoLink.trim(), mediaType: "VIDEO", name: "Vidéo" }]);
    setVideoLink("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) { setError("Titre et description requis."); return; }
    setSubmitting(true);
    setError("");
    const body = { submissionType, title, description, category, zone,
      contactName, contactPhone, contactEmail, medias };
    const res = await fetch("/api/missions/submit", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setDone(true); }
    else { setError("Erreur lors de la soumission. Réessayez."); }
    setSubmitting(false);
  }

  if (done) return (
    <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
      <div className="text-6xl">✅</div>
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Soumission envoyée !</h2>
      <p className="text-slate-500 text-sm leading-relaxed">
        Votre opportunité est en attente de validation par l'équipe IBIG. Une fois validée,
        elle sera visible par tous les partenaires. Vous serez notifié(e) par email.
      </p>
      <button onClick={() => router.push("/espace/missions")}
        className="mt-4 rounded-xl bg-indigo-600 text-white font-bold px-6 py-3 hover:bg-indigo-700 transition">
        Retour aux missions →
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">IBIG PARTNERS</p>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Soumettre une opportunité</h1>
        <p className="text-sm text-slate-500 mt-1">
          IBIG examine et valide votre soumission avant publication. Vos coordonnées restent confidentielles.
        </p>
      </div>

      {/* Type */}
      <div className="grid grid-cols-2 gap-3">
        {(["OFFER", "DEMAND"] as const).map(t => (
          <button key={t} type="button" onClick={() => setSubmissionType(t)}
            className={`rounded-2xl border-2 p-4 text-left transition ${
              submissionType === t
                ? t === "OFFER" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                               : "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
            }`}>
            <div className="text-2xl mb-1">{t === "OFFER" ? "📤" : "📥"}</div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {t === "OFFER" ? "Je propose quelque chose" : "Je recherche quelque chose"}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {t === "OFFER" ? "Terrain, service, contact, bien immobilier…" : "Client, prestataire, financement, terrain…"}
            </div>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            Titre de l'opportunité <span className="text-red-500">*</span>
          </label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            placeholder={submissionType === "OFFER"
              ? "Ex : Terrain de 500m² à vendre à Cocody"
              : "Ex : Recherche développeur web pour projet e-commerce"}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            Description détaillée <span className="text-red-500">*</span>
          </label>
          <textarea value={description} onChange={e => setDesc(e.target.value)} required rows={5}
            placeholder="Décrivez en détail votre offre ou votre besoin : caractéristiques, budget, délais, conditions…"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
        </div>

        {/* Catégorie + Zone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Catégorie</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm outline-none focus:border-indigo-400">
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Zone géographique</label>
            <input value={zone} onChange={e => setZone(e.target.value)}
              placeholder="Ex : Abidjan, Côte d'Ivoire, Afrique…"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm outline-none focus:border-indigo-400" />
          </div>
        </div>

        {/* Médias */}
        <div>
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
            Photos, PDF, vidéos <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-center cursor-pointer hover:border-indigo-400 transition">
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf,video/*" className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)} />
            <p className="text-2xl mb-1">📎</p>
            <p className="text-sm text-slate-500">Glissez vos fichiers ici ou <span className="text-indigo-600 font-semibold">cliquez pour sélectionner</span></p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF — max 10 Mo par fichier</p>
          </div>
          {/* Lien vidéo */}
          <div className="flex gap-2 mt-2">
            <input value={videoLink} onChange={e => setVideoLink(e.target.value)}
              placeholder="Ou collez un lien vidéo (YouTube, WhatsApp…)"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            <button type="button" onClick={addVideoLink}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Ajouter
            </button>
          </div>
          {uploading && <p className="text-xs text-indigo-500 mt-2">⏳ Chargement en cours…</p>}
          {medias.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {medias.map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs">
                  <span>{m.mediaType === "IMAGE" ? "🖼" : m.mediaType === "PDF" ? "📄" : "🎥"}</span>
                  <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-300">{m.name || "Média"}</span>
                  <button type="button" onClick={() => setMedias(prev => prev.filter((_, j) => j !== i))}
                    className="text-rose-400 hover:text-rose-600 ml-1 font-bold">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact privé */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 space-y-3">
          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">🔒 Vos coordonnées (confidentielles)</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              Visibles uniquement par IBIG. Jamais affichées aux autres partenaires.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input value={contactName} onChange={e => setCName(e.target.value)}
              placeholder="Votre nom" className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-amber-400 w-full" />
            <input value={contactPhone} onChange={e => setCPhone(e.target.value)}
              placeholder="+225 07 00 00 00" className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-amber-400 w-full" />
            <input value={contactEmail} onChange={e => setCEmail(e.target.value)} type="email"
              placeholder="votre@email.com" className="rounded-xl border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-amber-400 w-full" />
          </div>
        </div>

        {/* Notice */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800 px-4 py-3">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <strong>Comment ça marche :</strong> IBIG examine votre soumission, fixe les conditions et la publie pour tous les partenaires.
            Si un partenaire est intéressé, IBIG vous met en contact. Aucun échange direct sans accord IBIG.
          </p>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 font-bold py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm">
            Annuler
          </button>
          <button type="submit" disabled={submitting || uploading}
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold py-3.5 transition text-sm shadow-lg shadow-indigo-200 dark:shadow-none">
            {submitting ? "Envoi en cours…" : "Soumettre mon opportunité →"}
          </button>
        </div>
      </form>
    </div>
  );
}
