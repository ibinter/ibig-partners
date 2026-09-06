"use client";
import { useState } from "react";

export default function TemoignagePage() {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (content.trim().length < 20) return;
    setLoading(true);
    const r = await fetch("/api/espace/testimonial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, rating }) });
    if (r.ok) setSent(true);
    setLoading(false);
  }

  if (sent) return (
    <div className="max-w-lg mx-auto mt-20 text-center space-y-3">
      <p className="text-5xl">🙏</p>
      <p className="text-xl font-black text-gray-900 dark:text-white">Merci pour votre témoignage !</p>
      <p className="text-sm text-gray-500">Il sera publié après validation par notre équipe.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Partager mon témoignage</h1>
        <p className="text-sm text-gray-500 mt-1">Votre expérience inspire les futurs partenaires</p>
      </div>
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Note</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className={`text-2xl transition-transform hover:scale-110 ${s <= rating ? "opacity-100" : "opacity-30"}`}>⭐</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 block">Votre témoignage</label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Partagez votre expérience avec IBIG PARTNERS : ce que vous aimez, vos résultats, vos conseils pour les nouveaux partenaires…"
            className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-800 dark:border-gray-700"
          />
          <p className="text-xs text-gray-400 mt-1">{content.length} / 500 caractères (minimum 20)</p>
        </div>
        <button
          onClick={submit}
          disabled={content.trim().length < 20 || loading}
          className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Envoi…" : "📤 Envoyer mon témoignage"}
        </button>
      </div>
    </div>
  );
}
