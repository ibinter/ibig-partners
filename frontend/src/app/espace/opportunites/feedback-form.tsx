"use client";
import { useState, useTransition } from "react";

async function submitFeedback(opportunityId: string, rating: number, comment: string) {
  await fetch("/api/espace/opportunity-feedback", {
    method: "POST",
    body: JSON.stringify({ opportunityId, rating, comment }),
    headers: { "Content-Type": "application/json" },
  });
}

export default function FeedbackForm({ opportunityId, existing }: { opportunityId: string; existing?: { rating: number; comment?: string } }) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border-t pt-3 mt-3">
      <p className="text-xs font-semibold text-gray-500 mb-2">Votre avis sur cette opportunité :</p>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} type="button" onClick={() => setRating(s)}
            className={`text-xl transition-transform hover:scale-125 ${s <= rating ? "text-yellow-400" : "text-gray-300"}`}>
            ★
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
        className="w-full rounded-lg border px-2 py-1.5 text-xs"
        placeholder="Commentaire (optionnel)..." />
      <button type="button" disabled={rating === 0 || isPending} onClick={() => startTransition(async () => {
        await submitFeedback(opportunityId, rating, comment);
        setSaved(true);
      })}
        className="mt-2 rounded-lg bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-semibold disabled:opacity-40">
        {saved ? "✓ Envoyé" : "Envoyer l'avis"}
      </button>
    </div>
  );
}
