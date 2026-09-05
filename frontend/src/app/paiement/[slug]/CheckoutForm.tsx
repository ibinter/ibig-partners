"use client";

import { useState, useMemo } from "react";
import { fcfa } from "@/lib/format";

interface CheckoutFormProps {
  productSlug: string;
  partnerCode: string;
  price: number;
  priceLabel: string;
}

const TRANCHES = [
  { key: "third",  label: "1/3 — Acompte",   ratio: 1 / 3 },
  { key: "two_thirds", label: "2/3 — Partiel", ratio: 2 / 3 },
  { key: "full",   label: "Montant complet",   ratio: 1 },
  { key: "custom", label: "Montant libre",      ratio: null },
] as const;

type TrancheKey = (typeof TRANCHES)[number]["key"];

export default function CheckoutForm({
  productSlug,
  partnerCode,
  price,
  priceLabel,
}: CheckoutFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [tranche,   setTranche]   = useState<TrancheKey>("full");
  const [custom,    setCustom]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const minAmount = Math.max(500, Math.round(price / 3));

  const amount = useMemo(() => {
    if (tranche === "custom") {
      const v = parseInt(custom.replace(/\s/g, ""), 10);
      return isNaN(v) ? 0 : v;
    }
    const t = TRANCHES.find((t) => t.key === tranche)!;
    return Math.round(price * (t.ratio ?? 1));
  }, [tranche, custom, price]);

  const amountValid = amount >= minAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!amountValid) {
      setError(`Le montant minimum est de ${fcfa(minAmount)} (1/3 du prix).`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/moneroo/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          partnerCode,
          amount,
          customerFirstName: firstName.trim(),
          customerLastName:  lastName.trim(),
          customerEmail:     email.trim(),
          customerPhone:     phone.trim(),
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

      {/* Sélection du montant */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Montant à régler <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRANCHES.map((t) => {
            const display = t.ratio !== null ? fcfa(Math.round(price * t.ratio)) : "Libre";
            const active  = tranche === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTranche(t.key)}
                className={[
                  "rounded-xl border-2 px-3 py-3 text-center transition-all",
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
                ].join(" ")}
              >
                <div className="text-xs font-semibold leading-tight">{t.label}</div>
                <div className="mt-0.5 text-sm font-extrabold">{display}</div>
              </button>
            );
          })}
        </div>

        {tranche === "custom" && (
          <div className="mt-3">
            <input
              type="number"
              min={minAmount}
              max={price}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={`Min ${fcfa(minAmount)} — Max ${priceLabel}`}
              className="admin-input w-full"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimum 1/3 du prix ({fcfa(minAmount)})
            </p>
          </div>
        )}

        {tranche !== "custom" && (
          <p className="mt-2 text-xs text-slate-500">
            {tranche === "full"
              ? "Paiement intégral — accès immédiat"
              : `Acompte de ${fcfa(amount)} — solde à régler avant le début`}
          </p>
        )}
      </div>

      {/* Coordonnées */}
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
        disabled={loading || !amountValid}
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
          `Payer ${amountValid ? fcfa(amount) : "…"} →`
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Paiement sécurisé via Moneroo · Vos données sont protégées
      </p>
    </form>
  );
}
