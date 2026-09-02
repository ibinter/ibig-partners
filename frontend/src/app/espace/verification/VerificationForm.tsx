"use client";

import { useState } from "react";
import { submitVerification } from "./actions";
import { FileUpload } from "@/components/file-upload";

type Existing = {
  type?: string | null;
  fullName?: string | null; idType?: string | null; idNumber?: string | null;
  cvText?: string | null; idDocUrl?: string | null; idDocBack?: string | null; cvFileUrl?: string | null;
  country?: string | null; city?: string | null;
  profession?: string | null; whatsapp?: string | null; secondPhone?: string | null;
  contact1Name?: string | null; contact1Phone?: string | null;
  contact2Name?: string | null; contact2Phone?: string | null;
  companyName?: string | null; rccm?: string | null; nif?: string | null;
  compteContrib?: string | null; legalRep?: string | null; legalRepTitle?: string | null;
  companyCountry?: string | null; companyCity?: string | null; companyAddress?: string | null;
  companyEmail?: string | null; companyWhatsapp?: string | null; companyPhone2?: string | null;
  payoutMethod?: string | null; mobileMoneyNum?: string | null; mobileMoneyOperator?: string | null;
  paypalEmail?: string | null; wiseEmail?: string | null; skrillEmail?: string | null;
  rib?: string | null; bankName?: string | null; bankCountry?: string | null;
  swift?: string | null; iban?: string | null; bankAccountNum?: string | null; bankBranch?: string | null;
  westernUnionName?: string | null; moneyGramName?: string | null; riaName?: string | null; expressUnionNum?: string | null;
  cryptoCurrency?: string | null; cryptoNetwork?: string | null; cryptoAddress?: string | null;
  chequePayable?: string | null; chequeBank?: string | null;
  cinetpayPhone?: string | null; kkiapayPhone?: string | null; tmoneyPhone?: string | null; floozPhone?: string | null;
} | null;

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100";

function F({ label, name, defaultValue, required, type = "text", placeholder }: {
  label: string; name: string; defaultValue?: string | null; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input type={type} name={name} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

function T({ label, name, defaultValue, rows = 5 }: { label: string; name: string; defaultValue?: string | null; rows?: number; }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={rows} className={`${inputCls} resize-none`} />
    </div>
  );
}

function Sel({ label, name, defaultValue, required, children }: {
  label: string; name: string; defaultValue?: string | null; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <select name={name} defaultValue={defaultValue ?? ""} required={required} className={inputCls}>{children}</select>
    </div>
  );
}

function Section({ title, color = "slate", children }: { title: string; color?: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 border-slate-100",
    blue: "bg-blue-600 text-white border-blue-700",
    emerald: "bg-emerald-600 text-white border-emerald-700",
    violet: "bg-violet-600 text-white border-violet-700",
  };
  const headerCls = colors[color] ?? colors.slate;
  return (
    <div className="card-premium overflow-hidden">
      <div className={`border-b px-5 py-3 ${headerCls}`}>
        <h3 className={`font-semibold text-sm ${color !== "slate" ? "text-white" : "text-ink"}`}>{title}</h3>
      </div>
      <div className="p-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

const PAYOUT_METHODS = [
  { group: "📱 Mobile Money Afrique", options: [
    { value: "ORANGE_MONEY", label: "Orange Money" },
    { value: "WAVE", label: "Wave" },
    { value: "MTN_MOMO", label: "MTN Mobile Money" },
    { value: "MOOV_MONEY", label: "Moov Money" },
    { value: "AIRTEL_MONEY", label: "Airtel Money" },
    { value: "M_PESA", label: "M-Pesa" },
    { value: "TMONEY", label: "T-Money (Togo)" },
    { value: "FLOOZ", label: "Flooz (Bénin/Togo)" },
    { value: "CINETPAY", label: "CinetPay" },
    { value: "KKIAPAY", label: "KKiaPay" },
  ]},
  { group: "🏦 Virement bancaire", options: [
    { value: "BANK_LOCAL", label: "Virement bancaire local" },
    { value: "BANK_SEPA", label: "Virement SEPA (Europe)" },
    { value: "BANK_SWIFT", label: "Virement SWIFT/IBAN (international)" },
  ]},
  { group: "🌍 Transfert international", options: [
    { value: "WESTERN_UNION", label: "Western Union" },
    { value: "MONEYGRAM", label: "MoneyGram" },
    { value: "RIA", label: "RIA Money Transfer" },
    { value: "EXPRESS_UNION", label: "Express Union" },
  ]},
  { group: "💻 Portefeuilles numériques", options: [
    { value: "PAYPAL", label: "PayPal" },
    { value: "WISE", label: "Wise (TransferWise)" },
    { value: "SKRILL", label: "Skrill" },
  ]},
  { group: "₿ Crypto-monnaies", options: [
    { value: "CRYPTO", label: "Crypto-monnaie (Bitcoin, USDT, ETH…)" },
  ]},
  { group: "📄 Chèque", options: [
    { value: "CHEQUE", label: "Chèque bancaire" },
  ]},
];

function PaymentSection({ existing }: { existing: Existing }) {
  const [method, setMethod] = useState(existing?.payoutMethod ?? "ORANGE_MONEY");

  const isMobileMoney = ["ORANGE_MONEY","WAVE","MTN_MOMO","MOOV_MONEY","AIRTEL_MONEY","M_PESA"].includes(method);
  const isCinetpay = method === "CINETPAY";
  const isKkiapay = method === "KKIAPAY";
  const isTmoney = method === "TMONEY";
  const isFlooz = method === "FLOOZ";
  const isBank = ["BANK_LOCAL","BANK_SEPA","BANK_SWIFT"].includes(method);
  const isWesternUnion = method === "WESTERN_UNION";
  const isMoneygram = method === "MONEYGRAM";
  const isRia = method === "RIA";
  const isExpressUnion = method === "EXPRESS_UNION";
  const isPaypal = method === "PAYPAL";
  const isWise = method === "WISE";
  const isSkrill = method === "SKRILL";
  const isCrypto = method === "CRYPTO";
  const isCheque = method === "CHEQUE";

  return (
    <div className="card-premium overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 border-b border-emerald-700">
        <h3 className="font-semibold text-sm text-white">💰 Coordonnées de paiement des commissions</h3>
        <p className="text-xs text-emerald-100 mt-0.5">Choisissez comment vous souhaitez recevoir vos commissions.</p>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Méthode préférée <span className="text-rose-500">*</span></label>
          <select name="payoutMethod" value={method} required onChange={e => setMethod(e.target.value)} className={inputCls}>
            {PAYOUT_METHODS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Mobile Money classique */}
        {isMobileMoney && (
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Numéro Mobile Money" name="mobileMoneyNum" defaultValue={existing?.mobileMoneyNum} required placeholder="+225 07 00 00 00 00" />
            <F label="Nom du titulaire du compte" name="mobileMoneyOperator" defaultValue={existing?.mobileMoneyOperator} placeholder="Ex: KOUAKOU Jean" />
          </div>
        )}

        {/* CinetPay */}
        {isCinetpay && <F label="Numéro CinetPay" name="cinetpayPhone" defaultValue={existing?.cinetpayPhone} required placeholder="+225 07 00 00 00 00" />}

        {/* KKiaPay */}
        {isKkiapay && <F label="Numéro KKiaPay" name="kkiapayPhone" defaultValue={existing?.kkiapayPhone} required placeholder="+229 97 00 00 00" />}

        {/* T-Money */}
        {isTmoney && <F label="Numéro T-Money" name="tmoneyPhone" defaultValue={existing?.tmoneyPhone} required placeholder="+228 90 00 00 00" />}

        {/* Flooz */}
        {isFlooz && <F label="Numéro Flooz" name="floozPhone" defaultValue={existing?.floozPhone} required placeholder="+229 97 00 00 00" />}

        {/* Banque */}
        {isBank && (
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Nom de la banque" name="bankName" defaultValue={existing?.bankName} required />
            <F label="Pays de la banque" name="bankCountry" defaultValue={existing?.bankCountry} required />
            <F label="Numéro de compte" name="bankAccountNum" defaultValue={existing?.bankAccountNum} />
            <F label="Code agence / Branche" name="bankBranch" defaultValue={existing?.bankBranch} />
            {method !== "BANK_LOCAL" && <>
              <F label="IBAN" name="iban" defaultValue={existing?.iban} placeholder="FR76 3000 6000 0112 3456 7890 189" />
              <F label="Code SWIFT/BIC" name="swift" defaultValue={existing?.swift} placeholder="BNPAFRPPXXX" />
            </>}
            <div className="sm:col-span-2"><F label="RIB complet" name="rib" defaultValue={existing?.rib} /></div>
          </div>
        )}

        {/* Western Union */}
        {isWesternUnion && <F label="Nom complet (tel que sur pièce d'identité)" name="westernUnionName" defaultValue={existing?.westernUnionName} required placeholder="NOM Prénom" />}

        {/* MoneyGram */}
        {isMoneygram && <F label="Nom complet MoneyGram" name="moneyGramName" defaultValue={existing?.moneyGramName} required placeholder="NOM Prénom" />}

        {/* RIA */}
        {isRia && <F label="Nom complet RIA" name="riaName" defaultValue={existing?.riaName} required placeholder="NOM Prénom" />}

        {/* Express Union */}
        {isExpressUnion && <F label="Numéro Express Union" name="expressUnionNum" defaultValue={existing?.expressUnionNum} required placeholder="+237 6 00 00 00 00" />}

        {/* PayPal */}
        {isPaypal && <F label="Adresse email PayPal" name="paypalEmail" defaultValue={existing?.paypalEmail} required type="email" placeholder="vous@email.com" />}

        {/* Wise */}
        {isWise && <F label="Email Wise (TransferWise)" name="wiseEmail" defaultValue={existing?.wiseEmail} required type="email" placeholder="vous@email.com" />}

        {/* Skrill */}
        {isSkrill && <F label="Email Skrill" name="skrillEmail" defaultValue={existing?.skrillEmail} required type="email" placeholder="vous@email.com" />}

        {/* Crypto */}
        {isCrypto && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Crypto-monnaie <span className="text-rose-500">*</span></label>
              <select name="cryptoCurrency" defaultValue={existing?.cryptoCurrency ?? ""} required className={inputCls}>
                <option value="">-- Choisir --</option>
                {["USDT","USDC","BTC","ETH","BNB","TRX","SOL","XRP","LTC","DOGE"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Réseau <span className="text-rose-500">*</span></label>
              <select name="cryptoNetwork" defaultValue={existing?.cryptoNetwork ?? ""} required className={inputCls}>
                <option value="">-- Choisir --</option>
                {["TRC20 (Tron)","ERC20 (Ethereum)","BEP20 (BSC)","Bitcoin (BTC)","Solana","XRP Ledger","Litecoin"].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <F label="Adresse du wallet (copiez-collez exactement)" name="cryptoAddress" defaultValue={existing?.cryptoAddress} required placeholder="0x... / T... / bc1..." />
            </div>
            <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              ⚠️ Vérifiez soigneusement votre adresse et le réseau. Toute erreur entraîne une perte définitive des fonds.
            </div>
          </div>
        )}

        {/* Chèque */}
        {isCheque && (
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Libellé du chèque (à l'ordre de)" name="chequePayable" defaultValue={existing?.chequePayable} required placeholder="NOM Prénom ou raison sociale" />
            <F label="Banque émettrice" name="chequeBank" defaultValue={existing?.chequeBank} />
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentFields({ prefix, method }: { prefix: string; method: string }) {
  const isMobileMoney = ["ORANGE_MONEY","WAVE","MTN_MOMO","MOOV_MONEY","AIRTEL_MONEY","M_PESA"].includes(method);
  return (
    <div className="space-y-3 pt-1">
      {isMobileMoney && (
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Numéro" name={`${prefix}_num`} placeholder="+225 07 00 00 00 00" />
          <F label="Nom titulaire" name={`${prefix}_name`} placeholder="NOM Prénom" />
        </div>
      )}
      {method === "CINETPAY"      && <F label="Numéro CinetPay"    name={`${prefix}_num`}   placeholder="+225 07 00 00 00 00" />}
      {method === "KKIAPAY"       && <F label="Numéro KKiaPay"     name={`${prefix}_num`}   placeholder="+229 97 00 00 00" />}
      {method === "TMONEY"        && <F label="Numéro T-Money"     name={`${prefix}_num`}   placeholder="+228 90 00 00 00" />}
      {method === "FLOOZ"         && <F label="Numéro Flooz"       name={`${prefix}_num`}   placeholder="+229 97 00 00 00" />}
      {method === "WESTERN_UNION" && <F label="Nom complet"        name={`${prefix}_name`}  placeholder="NOM Prénom" />}
      {method === "MONEYGRAM"     && <F label="Nom complet"        name={`${prefix}_name`}  placeholder="NOM Prénom" />}
      {method === "RIA"           && <F label="Nom complet RIA"    name={`${prefix}_name`}  placeholder="NOM Prénom" />}
      {method === "EXPRESS_UNION" && <F label="Numéro Express Union" name={`${prefix}_num`} placeholder="+237 6 00 00 00 00" />}
      {method === "PAYPAL"        && <F label="Email PayPal"       name={`${prefix}_email`} type="email" placeholder="vous@email.com" />}
      {method === "WISE"          && <F label="Email Wise"         name={`${prefix}_email`} type="email" placeholder="vous@email.com" />}
      {method === "SKRILL"        && <F label="Email Skrill"       name={`${prefix}_email`} type="email" placeholder="vous@email.com" />}
      {["BANK_LOCAL","BANK_SEPA","BANK_SWIFT"].includes(method) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="Banque" name={`${prefix}_bankName`} />
          <F label="Pays banque" name={`${prefix}_bankCountry`} />
          {method !== "BANK_LOCAL" && <>
            <F label="IBAN" name={`${prefix}_iban`} placeholder="FR76..." />
            <F label="SWIFT/BIC" name={`${prefix}_swift`} placeholder="BNPAFRPPXXX" />
          </>}
          <div className="sm:col-span-2"><F label="Numéro de compte / RIB" name={`${prefix}_rib`} /></div>
        </div>
      )}
      {method === "CRYPTO" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Crypto</label>
            <select name={`${prefix}_cryptoCurrency`} className={inputCls}>
              <option value="">-- Choisir --</option>
              {["USDT","USDC","BTC","ETH","BNB","TRX","SOL","XRP","LTC","DOGE"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Réseau</label>
            <select name={`${prefix}_cryptoNetwork`} className={inputCls}>
              <option value="">-- Choisir --</option>
              {["TRC20 (Tron)","ERC20 (Ethereum)","BEP20 (BSC)","Bitcoin (BTC)","Solana","XRP Ledger","Litecoin"].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><F label="Adresse wallet" name={`${prefix}_cryptoAddress`} placeholder="0x... / T... / bc1..." /></div>
        </div>
      )}
      {method === "CHEQUE" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <F label="À l'ordre de" name={`${prefix}_chequePayable`} placeholder="NOM Prénom ou raison sociale" />
          <F label="Banque émettrice" name={`${prefix}_chequeBank`} />
        </div>
      )}
    </div>
  );
}

function SecondaryPaymentSection({ slot, label, defaultMethod, defaultDetails }: {
  slot: "2" | "3"; label: string; defaultMethod?: string | null; defaultDetails?: string | null;
}) {
  const parsed = (() => { try { return defaultDetails ? JSON.parse(defaultDetails) : {}; } catch { return {}; } })();
  const [method, setMethod] = useState(defaultMethod ?? "");
  const prefix = `sec${slot}`;

  return (
    <div className="card-premium overflow-hidden border-dashed">
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-slate-700">{label}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Optionnel — en cas d&apos;indisponibilité de votre méthode principale</p>
        </div>
        {method && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-lg px-2 py-0.5">Défini</span>}
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Méthode {slot === "2" ? "secondaire 1" : "secondaire 2"}</label>
          <select name={`payoutMethod${slot}`} value={method} onChange={e => setMethod(e.target.value)} className={inputCls}>
            <option value="">-- Aucune (optionnel) --</option>
            {PAYOUT_METHODS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        {method && <PaymentFields prefix={prefix} method={method} />}
        {/* Champs cachés pour préremplir depuis les données existantes */}
        {Object.entries(parsed).map(([k, v]) => (
          <input key={k} type="hidden" name={`${prefix}_${k}_prefill`} defaultValue={String(v)} />
        ))}
      </div>
    </div>
  );
}

function IndividualForm({ existing }: { existing: Existing }) {
  return (
    <>
      <Section title="👤 Identité à l'état civil" color="blue">
        <div className="sm:col-span-2"><F label="Nom et prénoms exacts (état civil)" name="fullName" defaultValue={existing?.fullName} required placeholder="KOUAKOU Jean-Marc" /></div>
        <Sel label="Type de pièce d'identité" name="idType" defaultValue={existing?.idType} required>
          <option value="">-- Choisir --</option>
          <option value="CIN">Carte Nationale d&apos;Identité (CNI/CIN)</option>
          <option value="PASSEPORT">Passeport biométrique</option>
          <option value="PERMIS">Permis de conduire</option>
          <option value="AUTRE">Autre document officiel</option>
        </Sel>
        <F label="Numéro de la pièce d'identité" name="idNumber" defaultValue={existing?.idNumber} required placeholder="CI-XXXX-XXXXXX" />
        <F label="Email de contact" name="contactEmail" defaultValue={existing?.companyEmail} type="email" placeholder="votre@email.com" />
        <F label="Profession / Métier actuel" name="profession" defaultValue={existing?.profession} placeholder="Enseignant, Commercial, Entrepreneur…" />
        <F label="Pays de résidence" name="country" defaultValue={existing?.country} required placeholder="Côte d'Ivoire" />
        <F label="Ville / Région" name="city" defaultValue={existing?.city} required placeholder="Abidjan — Cocody" />
      </Section>

      {/* Pièce d'identité — upload */}
      <div className="card-premium overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-700 px-5 py-3">
          <h3 className="font-semibold text-sm text-white">🪪 Photo de la pièce d&apos;identité</h3>
          <p className="text-xs text-blue-100 mt-0.5">CNI recto/verso, passeport ou permis — obligatoire pour la validation.</p>
        </div>
        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <FileUpload
            name="idDocUrl"
            defaultUrl={existing?.idDocUrl}
            folder="ibig-kyc-docs"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            label="Recto (face avant) *"
            hint="JPEG, PNG ou PDF · max 10 Mo"
            preview="image"
          />
          <FileUpload
            name="idDocBack"
            defaultUrl={existing?.idDocBack}
            folder="ibig-kyc-docs"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            label="Verso (face arrière) — facultatif pour passeport"
            hint="JPEG, PNG ou PDF · max 10 Mo"
            preview="image"
          />
        </div>
        <div className="bg-amber-50 border-t border-amber-100 px-5 py-2.5">
          <p className="text-xs text-amber-700">⚠️ Vos documents sont transmis de façon sécurisée et ne sont utilisés qu&apos;à des fins de vérification.</p>
        </div>
      </div>

      {/* CV */}
      <div className="card-premium overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-sm text-ink">📄 Curriculum Vitae / Parcours <span className="text-slate-400 font-normal">(optionnel)</span></h3>
        </div>
        <div className="p-5 space-y-4">
          <FileUpload
            name="cvFileUrl"
            defaultUrl={existing?.cvFileUrl}
            folder="ibig-kyc-cv"
            accept="application/pdf,image/jpeg,image/png"
            label="Uploader votre CV (PDF ou image)"
            hint="PDF recommandé · max 10 Mo"
            preview="none"
          />
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-slate-100" />
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide shrink-0">ou décrivez à la place</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>
          <T label="Résumé de votre parcours, compétences, expériences et réseaux professionnels" name="cvText" defaultValue={existing?.cvText} rows={5} />
          <p className="text-xs text-slate-400">Si vous avez uploadé un CV, ce texte est optionnel.</p>
        </div>
      </div>

      <Section title="📞 Contacts personnels">
        <F label="WhatsApp principal" name="whatsapp" defaultValue={existing?.whatsapp} required placeholder="+225 07 00 00 00 00" />
        <F label="Second contact" name="secondPhone" defaultValue={existing?.secondPhone} placeholder="+225 05 00 00 00 00" />
      </Section>

      <div className="card-premium overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-sm text-ink">👨‍👩‍👧 2 personnes à contacter en dehors de vous (obligatoire)</h3>
          <p className="text-xs text-muted mt-0.5">Personnes joignables indépendamment — famille, amis, collègues.</p>
        </div>
        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <F label="Contact 1 — Nom et prénom" name="contact1Name" defaultValue={existing?.contact1Name} required placeholder="Kouamé Alice" />
          <F label="Contact 1 — Téléphone / WhatsApp" name="contact1Phone" defaultValue={existing?.contact1Phone} required placeholder="+225 07 00 00 00 00" />
          <F label="Contact 2 — Nom et prénom" name="contact2Name" defaultValue={existing?.contact2Name} required placeholder="Traoré Mohamed" />
          <F label="Contact 2 — Téléphone / WhatsApp" name="contact2Phone" defaultValue={existing?.contact2Phone} required placeholder="+225 05 00 00 00 00" />
        </div>
      </div>
    </>
  );
}

function CompanyForm({ existing }: { existing: Existing }) {
  return (
    <>
      <Section title="🏢 Identification de l'entreprise" color="violet">
        <div className="sm:col-span-2"><F label="Dénomination sociale (nom légal de l'entreprise)" name="companyName" defaultValue={existing?.companyName} required /></div>
        <F label="Registre de Commerce (RCCM)" name="rccm" defaultValue={existing?.rccm} required placeholder="CI-ABJ-XXXX-X-XXX-XXXX" />
        <F label="NIF (Numéro d'Identification Fiscale)" name="nif" defaultValue={existing?.nif} required />
        <F label="Compte Contribuable" name="compteContrib" defaultValue={existing?.compteContrib} />
        <F label="Email officiel" name="companyEmail" defaultValue={existing?.companyEmail} type="email" placeholder="contact@entreprise.com" />
        <F label="Pays du siège social" name="companyCountry" defaultValue={existing?.companyCountry} required placeholder="Côte d'Ivoire" />
        <F label="Ville / Commune" name="companyCity" defaultValue={existing?.companyCity} required placeholder="Abidjan — Plateau" />
        <div className="sm:col-span-2"><F label="Adresse complète du siège social" name="companyAddress" defaultValue={existing?.companyAddress} required placeholder="Rue des Jardins, Immeuble Delta, 2ème étage" /></div>
        <F label="WhatsApp entreprise / standard" name="companyWhatsapp" defaultValue={existing?.companyWhatsapp} required placeholder="+225 27 00 00 00 00" />
        <F label="Second téléphone de l'entreprise" name="companyPhone2" defaultValue={existing?.companyPhone2} placeholder="+225 07 00 00 00 00" />
      </Section>

      <Section title="👔 Représentant légal">
        <F label="Nom et prénoms du représentant légal" name="legalRep" defaultValue={existing?.legalRep} required placeholder="KOUAKOU Jean-Baptiste" />
        <Sel label="Titre / Fonction" name="legalRepTitle" defaultValue={existing?.legalRepTitle} required>
          <option value="">-- Choisir --</option>
          <option value="DG">Directeur Général (DG)</option>
          <option value="PDG">Président Directeur Général (PDG)</option>
          <option value="GERANT">Gérant</option>
          <option value="ADMIN">Administrateur</option>
          <option value="AUTRE">Autre</option>
        </Sel>
      </Section>
    </>
  );
}

export function VerificationForm({ initialType, existing }: {
  initialType?: string;
  existing: Existing;
}) {
  const [type, setType] = useState(initialType ?? "INDIVIDUAL");

  return (
    <form action={submitVerification} className="space-y-5">
      <input type="hidden" name="partnerType" value={type} />

      <div className="card-premium p-5">
        <p className="text-sm font-semibold text-ink mb-3">Vous êtes :</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "INDIVIDUAL", label: "👤 Particulier", sub: "Personne physique" },
            { val: "COMPANY",    label: "🏢 Entreprise",  sub: "Société, ONG, association" },
          ].map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => setType(opt.val)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                type === opt.val
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <p className="font-bold text-sm text-ink">{opt.label}</p>
              <p className="text-xs text-muted mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {type === "INDIVIDUAL" ? <IndividualForm existing={existing} /> : <CompanyForm existing={existing} />}

      {/* Méthode principale */}
      <PaymentSection existing={existing} />

      {/* Méthodes secondaires */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">💳 Méthodes de paiement de secours (optionnel)</p>
        <p className="text-xs text-slate-400 mb-4">En cas d&apos;indisponibilité de votre méthode principale, l&apos;équipe utilisera ces alternatives dans l&apos;ordre.</p>
        <div className="space-y-4">
          <SecondaryPaymentSection slot="2" label="🥈 Méthode secondaire 1"
            defaultMethod={(existing as any)?.payoutMethod2}
            defaultDetails={(existing as any)?.payoutDetails2} />
          <SecondaryPaymentSection slot="3" label="🥉 Méthode secondaire 2"
            defaultMethod={(existing as any)?.payoutMethod3}
            defaultDetails={(existing as any)?.payoutDetails3} />
        </div>
      </div>

      <p className="text-xs text-muted bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
        🔒 En soumettant ce formulaire, vous certifiez l&apos;exactitude des informations. Toute fausse déclaration entraîne la suspension immédiate et définitive du compte sans paiement des commissions dues.
      </p>

      <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-violet-700 transition-all">
        📤 Soumettre mon dossier de vérification
      </button>
    </form>
  );
}
