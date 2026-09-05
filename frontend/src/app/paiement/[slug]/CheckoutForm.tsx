"use client";

import { useState, useMemo } from "react";
import { fcfa } from "@/lib/format";

interface CheckoutFormProps {
  productSlug: string;
  partnerCode: string;
  price: number;
  priceLabel: string;
}

/** Taux indicatif FCFA → USD (XOF arrimé à EUR à 655,957) */
const FCFA_PER_USD = 655;

/** Arrondit au 100 FCFA le plus proche */
function round100(n: number) { return Math.round(n / 100) * 100; }

/** Formate un montant en USD */
function usd(fcfaAmount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Math.round(fcfaAmount / FCFA_PER_USD)
  );
}

const TRANCHES = [
  { key: "third",     label: "1/3 — Acompte",   ratio: 1 / 3 },
  { key: "two_thirds",label: "2/3 — Partiel",   ratio: 2 / 3 },
  { key: "full",      label: "Montant complet",  ratio: 1 },
  { key: "custom",    label: "Montant libre",    ratio: null },
] as const;

type TrancheKey = (typeof TRANCHES)[number]["key"];

const NIVEAUX_ETUDE = ["Aucun diplôme", "BEPC / Brevet", "BAC", "BAC+2", "BAC+3 / Licence", "BAC+4", "BAC+5 / Master", "Doctorat"];
const ANNEES_EXP   = ["Moins d'1 an", "1–2 ans", "3–5 ans", "6–10 ans", "Plus de 10 ans"];

export default function CheckoutForm({ productSlug, partnerCode, price, priceLabel }: CheckoutFormProps) {
  // — Montant
  const [tranche,  setTranche]  = useState<TrancheKey>("full");
  const [custom,   setCustom]   = useState("");

  // — Coordonnées
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");

  // — Profil (obligatoires)
  const [modeFormation,      setModeFormation]      = useState("");
  const [statutProfessionnel,setStatutProfessionnel]= useState("");
  const [objectif,           setObjectif]           = useState("");

  // — Infos complémentaires (optionnelles)
  const [showExtra,        setShowExtra]        = useState(false);
  const [disponibilite,    setDisponibilite]    = useState("");
  const [ville,            setVille]            = useState("");
  const [pays,             setPays]             = useState("");
  const [domaineActivite,  setDomaineActivite]  = useState("");
  const [niveauEtude,      setNiveauEtude]      = useState("");
  const [fonction,         setFonction]         = useState("");
  const [anneesExperience, setAnneesExperience] = useState("");
  const [message,          setMessage]          = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const minAmount = Math.max(500, round100(price / 3));

  const amount = useMemo(() => {
    if (tranche === "custom") {
      const v = parseInt(custom.replace(/\s/g, ""), 10);
      return isNaN(v) ? 0 : v;
    }
    const t = TRANCHES.find((t) => t.key === tranche)!;
    return round100(price * (t.ratio ?? 1));
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
          // Champs dossier inscription
          modeFormation,
          statutProfessionnel,
          objectif,
          disponibilite,
          ville:            ville.trim(),
          pays:             pays.trim(),
          domaineActivite:  domaineActivite.trim(),
          niveauEtude,
          fonction:         fonction.trim(),
          anneesExperience,
          message:          message.trim(),
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

  const selectCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
  const inputCls  = "admin-input w-full";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Montant ── */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Montant à régler <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRANCHES.map((t) => {
            const fcfaVal = t.ratio !== null ? round100(price * t.ratio) : null;
            const active  = tranche === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTranche(t.key)}
                className={[
                  "rounded-xl border-2 px-2 py-3 text-center transition-all",
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300",
                ].join(" ")}
              >
                <div className="text-xs font-semibold leading-tight">{t.label}</div>
                <div className="mt-0.5 text-sm font-extrabold">
                  {fcfaVal !== null ? fcfa(fcfaVal) : "Libre"}
                </div>
                {fcfaVal !== null && (
                  <div className="mt-0.5 text-[10px] text-slate-400">≈ {usd(fcfaVal)}</div>
                )}
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
              className={inputCls}
              required
            />
            <p className="mt-1 text-xs text-slate-500">Minimum 1/3 du prix ({fcfa(minAmount)} ≈ {usd(minAmount)})</p>
          </div>
        )}

        {tranche !== "custom" && amountValid && (
          <p className="mt-2 text-xs text-slate-500">
            {tranche === "full"
              ? `Paiement intégral · ${fcfa(amount)} ≈ ${usd(amount)}`
              : `Acompte de ${fcfa(amount)} (≈ ${usd(amount)}) — solde à régler avant le début`}
          </p>
        )}
      </div>

      {/* ── Coordonnées ── */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Coordonnées</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Prénom <span className="text-rose-500">*</span>
            </label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ex : Kouamé" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nom <span className="text-rose-500">*</span>
            </label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder="Ex : DIALLO" className={inputCls} />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Adresse email <span className="text-rose-500">*</span>
          </label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com" className={inputCls} />
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Téléphone (WhatsApp) <span className="text-rose-500">*</span>
          </label>
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex : +225 07 00 00 00 00" className={inputCls} />
          <p className="mt-1 text-xs text-slate-500">Orange Money, Wave, MTN MoMo, Moov Money acceptés</p>
        </div>
      </div>

      {/* ── Profil inscription (obligatoire) ── */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Profil d'inscription</p>
        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mode de formation souhaité <span className="text-rose-500">*</span>
            </label>
            <select required value={modeFormation} onChange={(e) => setModeFormation(e.target.value)} className={selectCls}>
              <option value="">— Choisir —</option>
              <option value="en_ligne">En ligne</option>
              <option value="presentiel">Présentiel</option>
              <option value="hybride">Hybride (présentiel + ligne)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Statut professionnel <span className="text-rose-500">*</span>
            </label>
            <select required value={statutProfessionnel} onChange={(e) => setStatutProfessionnel(e.target.value)} className={selectCls}>
              <option value="">— Choisir —</option>
              <option value="etudiant">Étudiant(e)</option>
              <option value="salarie">Salarié(e)</option>
              <option value="entrepreneur">Entrepreneur / Indépendant</option>
              <option value="demandeur_emploi">Demandeur d'emploi</option>
              <option value="fonctionnaire">Fonctionnaire</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Objectif de la formation <span className="text-rose-500">*</span>
            </label>
            <select required value={objectif} onChange={(e) => setObjectif(e.target.value)} className={selectCls}>
              <option value="">— Choisir —</option>
              <option value="monter_competence">Monter en compétence</option>
              <option value="changer_metier">Changer de métier</option>
              <option value="promotion">Promotion professionnelle</option>
              <option value="lancer_activite">Lancer une activité</option>
              <option value="certification">Obtenir une certification</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Informations complémentaires (optionnel / accordéon) ── */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExtra((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>Informations complémentaires <span className="text-xs font-normal text-slate-400">(optionnel — enrichit votre dossier)</span></span>
          <span className={`text-slate-400 transition-transform ${showExtra ? "rotate-180" : ""}`}>▾</span>
        </button>

        {showExtra && (
          <div className="border-t border-slate-200 px-4 py-4 space-y-3 bg-slate-50">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Disponibilité</label>
                <select value={disponibilite} onChange={(e) => setDisponibilite(e.target.value)} className={selectCls}>
                  <option value="">— Choisir —</option>
                  <option value="journee">Journée</option>
                  <option value="soir">Soir</option>
                  <option value="weekend">Week-end</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Niveau d'étude</label>
                <select value={niveauEtude} onChange={(e) => setNiveauEtude(e.target.value)} className={selectCls}>
                  <option value="">— Choisir —</option>
                  {NIVEAUX_ETUDE.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ville</label>
                <input type="text" value={ville} onChange={(e) => setVille(e.target.value)}
                  placeholder="Ex : Abidjan" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Pays</label>
                <input type="text" value={pays} onChange={(e) => setPays(e.target.value)}
                  placeholder="Ex : Côte d'Ivoire" className={inputCls} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Fonction / Poste actuel</label>
                <input type="text" value={fonction} onChange={(e) => setFonction(e.target.value)}
                  placeholder="Ex : Comptable, Étudiant, Gérant…" className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Années d'expérience</label>
                <select value={anneesExperience} onChange={(e) => setAnneesExperience(e.target.value)} className={selectCls}>
                  <option value="">— Choisir —</option>
                  {ANNEES_EXP.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Domaine d'activité</label>
              <input type="text" value={domaineActivite} onChange={(e) => setDomaineActivite(e.target.value)}
                placeholder="Ex : Finance, BTP, Santé, Commerce, Administration…" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Message / Motivation</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Précisez votre objectif, vos attentes ou toute information utile à votre inscription…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !amountValid}
        className="mt-1 w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Redirection vers le paiement…
          </span>
        ) : amountValid ? (
          <>
            Payer {fcfa(amount)}
            <span className="ml-2 text-sm font-normal opacity-80">≈ {usd(amount)}</span>
            {" →"}
          </>
        ) : (
          "Sélectionnez un montant"
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        🔒 Paiement sécurisé via Moneroo · Taux USD indicatif (1 USD ≈ 655 FCFA)
      </p>
    </form>
  );
}
