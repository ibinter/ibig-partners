"use client";

import { useState, useTransition } from "react";
import { savePayoutConfig } from "./actions";

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function PayoutConfigForm({
  currentMin, currentMethod, currentDetail, isVerified,
}: {
  currentMin: number; currentMethod: string; currentDetail: string; isVerified: boolean;
}) {
  const [method, setMethod] = useState(currentMethod ?? "ORANGE_MONEY");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const isMobile = ["ORANGE_MONEY", "WAVE", "MTN_MOMO"].includes(method);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await savePayoutConfig(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Seuil minimum de paiement (FCFA)
          </label>
          <input
            type="number" name="minPayout" defaultValue={currentMin} min={5000} step={1000}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-muted">Minimum : 5 000 FCFA</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Méthode de paiement préférée</label>
          <select name="payoutMethod" value={method} onChange={e => setMethod(e.target.value)} className={inputCls}>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="WAVE">Wave</option>
            <option value="MTN_MOMO">MTN MoMo</option>
            <option value="BANK">Virement bancaire</option>
            <option value="PAYPAL">PayPal</option>
            <option value="WESTERN_UNION">Western Union / MoneyGram</option>
          </select>
        </div>

        {isMobile && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Numéro Mobile Money</label>
            <input type="text" name="payoutDetail" defaultValue={currentDetail} placeholder="+225 07 00 00 00 00" className={inputCls} />
          </div>
        )}
        {method === "PAYPAL" && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email PayPal</label>
            <input type="email" name="payoutDetail" defaultValue={currentDetail} placeholder="votre@paypal.com" className={inputCls} />
          </div>
        )}
        {method === "BANK" && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">IBAN / RIB</label>
            <input type="text" name="payoutDetail" defaultValue={currentDetail} placeholder="FR76 XXXX..." className={inputCls} />
          </div>
        )}
        {method === "WESTERN_UNION" && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nom de réception (Western Union)</label>
            <input type="text" name="payoutDetail" defaultValue={currentDetail} placeholder="Nom exact sur pièce d'identité" className={inputCls} />
          </div>
        )}
      </div>

      {!isVerified && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          ⚠️ La configuration de paiement sera effective une fois votre compte vérifié.
        </p>
      )}

      <button
        type="submit" disabled={pending}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : saved ? "✅ Enregistré !" : "Enregistrer la configuration"}
      </button>
    </form>
  );
}
