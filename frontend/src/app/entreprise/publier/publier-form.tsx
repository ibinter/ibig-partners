"use client";
import { useState } from "react";

const fcfa = (n: number) =>
  n > 0 ? new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA" : "—";

export function PublierForm({
  categories,
  action,
}: {
  categories: { value: string; label: string }[];
  action: (fd: FormData) => Promise<void>;
}) {
  const [price, setPrice]         = useState(0);
  const [commType, setCommType]   = useState<"FIXED" | "PERCENT">("PERCENT");
  const [commValue, setCommValue] = useState<string>("");

  const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  // Aperçu en temps réel de la commission
  const commNum = parseFloat(commValue) || 0;
  const commFcfa = commType === "PERCENT"
    ? Math.round(price * (commNum / 100))
    : commNum;
  const commRate = price > 0 && commType === "FIXED" && commNum > 0
    ? ((commNum / price) * 100).toFixed(1)
    : null;

  return (
    <form action={action} className="space-y-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">

      {/* Titre */}
      <div>
        <label className={labelCls}>Titre de l&apos;opportunité *</label>
        <input
          name="title"
          required
          placeholder="Ex : Appartement F4 à louer à Cocody / Distributeur recherché Côte d'Ivoire"
          className={inputCls}
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className={labelCls}>Catégorie *</label>
        <select name="category" required className={inputCls}>
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description complète *</label>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="Décrivez précisément votre bien ou votre besoin : localisation, état, superficie, conditions, zone cible, profil recherché…"
          className={inputCls + " resize-none"}
        />
        <p className="text-xs text-slate-400 mt-1">Plus la description est précise, plus les mises en relation seront pertinentes.</p>
      </div>

      {/* Prix + deadline */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Prix du bien / service (FCFA) *</label>
          <input
            name="estimatedValue"
            type="number"
            min="0"
            required
            placeholder="Ex : 25000000"
            className={inputCls}
            onChange={e => setPrice(Number(e.target.value) || 0)}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {price > 0 ? `= ${fcfa(price)}` : "Indiquez le prix de vente ou de location"}
          </p>
        </div>
        <div>
          <label className={labelCls}>Deadline (optionnel)</label>
          <input name="deadline" type="date" className={inputCls} />
        </div>
      </div>

      {/* Commission */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 space-y-4">
        <div>
          <p className="text-sm font-extrabold text-amber-800">💰 Commission à verser au partenaire apporteur</p>
          <p className="text-xs text-amber-700 mt-1">
            Indiquez ce que vous proposez de verser au partenaire qui vous amène un client ou conclut la vente.
            L&apos;équipe IBIG pourra négocier ce montant avant diffusion.
          </p>
        </div>

        {/* Type de commission */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCommType("PERCENT")}
            className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
              commType === "PERCENT"
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
            }`}
          >
            % Taux
          </button>
          <button
            type="button"
            onClick={() => setCommType("FIXED")}
            className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
              commType === "FIXED"
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
            }`}
          >
            Montant fixe (FCFA)
          </button>
        </div>

        {/* Champ commission */}
        <div>
          <label className={labelCls}>
            {commType === "PERCENT" ? "Taux de commission (%)" : "Montant fixe (FCFA)"}
          </label>
          <input
            name="proposedCommission"
            type="number"
            min="0"
            max={commType === "PERCENT" ? 100 : undefined}
            step={commType === "PERCENT" ? "0.1" : "1000"}
            placeholder={commType === "PERCENT" ? "Ex : 10" : "Ex : 500000"}
            value={commValue}
            onChange={e => setCommValue(e.target.value)}
            className={inputCls}
            required
          />
          <input type="hidden" name="proposedCommissionType" value={commType} />
        </div>

        {/* Aperçu calculé */}
        {commNum > 0 && (
          <div className="rounded-xl bg-white border border-amber-200 px-4 py-3 space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Aperçu de la commission</p>
            {commType === "PERCENT" ? (
              <p className="text-sm text-slate-700">
                {commNum}% de {fcfa(price)} ={" "}
                <strong className="text-amber-700 text-base">{fcfa(commFcfa)}</strong> versés au partenaire apporteur
              </p>
            ) : (
              <p className="text-sm text-slate-700">
                <strong className="text-amber-700 text-base">{fcfa(commFcfa)}</strong> versés au partenaire apporteur
                {commRate && <span className="text-slate-400 text-xs ml-2">(soit {commRate}% du prix)</span>}
              </p>
            )}
            <p className="text-[11px] text-amber-600">
              ℹ️ Ce montant est votre proposition. L&apos;équipe IBIG pourra le valider ou proposer un ajustement.
            </p>
          </div>
        )}
      </div>

      {/* Info process */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        <strong>Comment ça marche :</strong> Après soumission, l&apos;équipe IBIG valide votre opportunité
        sous 24–48h et peut négocier la commission. Une fois validée, elle est diffusée au réseau de partenaires.
        Vous ne payez que sur résultat confirmé.
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 text-sm transition shadow-sm"
      >
        📤 Soumettre à l&apos;équipe IBIG
      </button>
    </form>
  );
}
