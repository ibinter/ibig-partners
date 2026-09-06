"use client";

import { useState, useTransition } from "react";
import { submitLead } from "./actions";

type Product = { id: string; name: string };

export default function LeadForm({
  partnerId,
  partnerCode,
  products,
}: {
  partnerId: string;
  partnerCode: string;
  products: Product[];
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitLead(fd);
      if (res?.error) setError(res.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Demande envoyée !</h2>
        <p className="text-sm text-slate-500">
          Votre conseiller vous recontactera très prochainement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-4">
      <input type="hidden" name="partnerId" value={partnerId} />
      <input type="hidden" name="partnerCode" value={partnerCode} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Prénom *</label>
          <input
            name="firstName"
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jean"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Nom *</label>
          <input
            name="lastName"
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dupont"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone *</label>
        <input
          name="phone"
          required
          type="tel"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+225 07 00 00 00 00"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
        <input
          name="email"
          type="email"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="jean@exemple.com"
        />
      </div>

      {products.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Je m'intéresse à</label>
          <select
            name="productId"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choisir un produit (optionnel) --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Message (optionnel)</label>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Décrivez votre besoin ou posez vos questions..."
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-4 py-3 text-sm font-bold text-white transition"
      >
        {pending ? "Envoi en cours…" : "Envoyer ma demande →"}
      </button>
    </form>
  );
}
