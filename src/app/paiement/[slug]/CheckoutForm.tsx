"use client";

import { useState } from "react";

interface CheckoutFormProps {
  productSlug: string;
  partnerCode: string;
  price: number;
  priceLabel: string;
}

export default function CheckoutForm({
  productSlug,
  partnerCode,
  price,
  priceLabel,
}: CheckoutFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/moneroo/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          partnerCode,
          amount: price,
          customerFirstName: firstName.trim(),
          customerLastName: lastName.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? "Une erreur est survenue lors de l'initialisation du paiement.");
        setLoading(false);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch {
      setError("Impossible de contacter le serveur de paiement. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Prénom <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex : Kouamé"
            className="admin-input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nom <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ex : DIALLO"
            className="admin-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Adresse email <span className="text-rose-500">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="admin-input w-full"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Numéro de téléphone <span className="text-rose-500">*</span>
        </label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ex : +225 07 00 00 00 00"
          className="admin-input w-full"
        />
        <p className="mt-1 text-xs text-slate-500">
          Orange Money, Wave, MTN MoMo, Moov Money acceptés
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Redirection vers le paiement…
          </span>
        ) : (
          `Payer ${priceLabel} →`
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Paiement sécurisé via Moneroo · Vos données sont protégées
      </p>
    </form>
  );
}
