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

// ─── Country codes ────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: "+225", label: "🇨🇮 +225 Côte d'Ivoire" },
  { code: "+237", label: "🇨🇲 +237 Cameroun" },
  { code: "+221", label: "🇸🇳 +221 Sénégal" },
  { code: "+223", label: "🇲🇱 +223 Mali" },
  { code: "+226", label: "🇧🇫 +226 Burkina Faso" },
  { code: "+228", label: "🇹🇬 +228 Togo" },
  { code: "+229", label: "🇧🇯 +229 Bénin" },
  { code: "+227", label: "🇳🇪 +227 Niger" },
  { code: "+224", label: "🇬🇳 +224 Guinée" },
  { code: "+245", label: "🇬🇼 +245 Guinée-Bissau" },
  { code: "+238", label: "🇨🇻 +238 Cap-Vert" },
  { code: "+232", label: "🇸🇱 +232 Sierra Leone" },
  { code: "+231", label: "🇱🇷 +231 Liberia" },
  { code: "+233", label: "🇬🇭 +233 Ghana" },
  { code: "+234", label: "🇳🇬 +234 Nigeria" },
  { code: "+241", label: "🇬🇦 +241 Gabon" },
  { code: "+242", label: "🇨🇬 +242 Congo-Brazzaville" },
  { code: "+243", label: "🇨🇩 +243 RD Congo" },
  { code: "+236", label: "🇨🇫 +236 Centrafrique" },
  { code: "+235", label: "🇹🇩 +235 Tchad" },
  { code: "+240", label: "🇬🇶 +240 Guinée équatoriale" },
  { code: "+239", label: "🇸🇹 +239 São Tomé" },
  { code: "+212", label: "🇲🇦 +212 Maroc" },
  { code: "+213", label: "🇩🇿 +213 Algérie" },
  { code: "+216", label: "🇹🇳 +216 Tunisie" },
  { code: "+218", label: "🇱🇾 +218 Libye" },
  { code: "+20",  label: "🇪🇬 +20 Égypte" },
  { code: "+27",  label: "🇿🇦 +27 Afrique du Sud" },
  { code: "+33",  label: "🇫🇷 +33 France" },
  { code: "+32",  label: "🇧🇪 +32 Belgique" },
  { code: "+41",  label: "🇨🇭 +41 Suisse" },
  { code: "+352", label: "🇱🇺 +352 Luxembourg" },
  { code: "+1",   label: "🇺🇸 +1 USA / Canada" },
  { code: "+44",  label: "🇬🇧 +44 Royaume-Uni" },
  { code: "+49",  label: "🇩🇪 +49 Allemagne" },
];

function parsePhoneCode(phone: string | null | undefined): { code: string; num: string } {
  if (!phone) return { code: "+225", num: "" };
  for (const c of COUNTRY_CODES) {
    if (phone.startsWith(c.code)) return { code: c.code, num: phone.slice(c.code.length).trim() };
  }
  return { code: "+225", num: phone };
}

function WhatsAppField({ name, defaultValue, required, label }: {
  name: string; defaultValue?: string | null; required?: boolean; label: string;
}) {
  const init = parsePhoneCode(defaultValue);
  const [code, setCode] = useState(init.code);
  const [num, setNum] = useState(init.num);
  const combined = num ? `${code} ${num}` : "";
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        <span className="ml-1 font-normal text-slate-400">(avec indicatif pays)</span>
      </label>
      <input type="hidden" name={name} value={combined} />
      <div className="flex gap-2">
        <select
          value={code}
          onChange={e => setCode(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shrink-0"
          style={{ minWidth: "180px" }}
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input
          type="tel"
          value={num}
          onChange={e => setNum(e.target.value)}
          required={required}
          placeholder="07 00 00 00 00"
          className={inputCls}
        />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">Ex : {code} 07 00 00 00 00 — ce numéro doit recevoir des messages WhatsApp</p>
    </div>
  );
}

// ─── Checklist de progression ─────────────────────────────────────────────────
function ProgressChecklist({ type, fields }: {
  type: string;
  fields: {
    fullName: string; idType: string; idNumber: string; country: string; city: string; whatsapp: string;
    idDocUrl: string; payoutMethod: string; contact1Name: string; contact1Phone: string;
    contact2Name: string; contact2Phone: string;
    companyName: string; rccm: string; nif: string; companyCountry: string; companyCity: string;
    companyAddress: string; companyWhatsapp: string; legalRep: string; legalRepTitle: string;
  };
}) {
  const isIndividual = type === "INDIVIDUAL";
  const checks = isIndividual ? [
    { label: "Nom complet",          done: !!fields.fullName },
    { label: "Type de pièce d'identité", done: !!fields.idType },
    { label: "Numéro de pièce",      done: !!fields.idNumber },
    { label: "Pays de résidence",    done: !!fields.country },
    { label: "Ville",                done: !!fields.city },
    { label: "WhatsApp",             done: !!fields.whatsapp },
    { label: "Photo de la pièce d'identité ✱", done: !!fields.idDocUrl },
    { label: "Méthode de paiement",  done: !!fields.payoutMethod },
    { label: "Contact 1",            done: !!(fields.contact1Name && fields.contact1Phone) },
    { label: "Contact 2",            done: !!(fields.contact2Name && fields.contact2Phone) },
  ] : [
    { label: "Dénomination sociale", done: !!fields.companyName },
    { label: "RCCM",                 done: !!fields.rccm },
    { label: "NIF",                  done: !!fields.nif },
    { label: "Pays du siège",        done: !!fields.companyCountry },
    { label: "Ville",                done: !!fields.companyCity },
    { label: "Adresse",              done: !!fields.companyAddress },
    { label: "WhatsApp entreprise",  done: !!fields.companyWhatsapp },
    { label: "Représentant légal",   done: !!fields.legalRep },
    { label: "Titre",                done: !!fields.legalRepTitle },
    { label: "Méthode de paiement",  done: !!fields.payoutMethod },
  ];

  const done = checks.filter(c => c.done).length;
  const total = checks.length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <div className={`rounded-2xl border-2 p-5 ${allDone ? "border-emerald-300 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-slate-800">
          {allDone ? "✅ Dossier complet — prêt à soumettre !" : `📋 Avancement du dossier — ${done}/${total} champs remplis`}
        </p>
        <span className={`text-sm font-extrabold ${allDone ? "text-emerald-600" : "text-blue-600"}`}>{pct}%</span>
      </div>
      <div className="w-full bg-white rounded-full h-2 mb-4 overflow-hidden border border-slate-100">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${allDone ? "bg-emerald-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            <span className={`text-xs ${c.done ? "text-emerald-500" : "text-slate-300"}`}>
              {c.done ? "✓" : "○"}
            </span>
            <span className={`text-xs ${c.done ? "text-slate-700 font-medium" : "text-slate-400"}`}>{c.label}</span>
          </div>
        ))}
      </div>
      {!fields.idDocUrl && isIndividual && (
        <p className="mt-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          ⚠️ La photo de votre pièce d'identité est obligatoire pour soumettre le dossier.
        </p>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function F({ label, name, value, onChange, required, type = "text", placeholder }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input type={type} name={name} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

function T({ label, name, value, onChange, rows = 5 }: {
  label: string; name: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <textarea name={name} value={value} onChange={e => onChange(e.target.value)} rows={rows} className={`${inputCls} resize-none`} />
    </div>
  );
}

function Sel({ label, name, value, onChange, required, children }: {
  label: string; name: string; value: string; onChange: (v: string) => void; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <select name={name} value={value} onChange={e => onChange(e.target.value)} required={required} className={inputCls}>{children}</select>
    </div>
  );
}

function Section({ title, children, color = "slate" }: { title: string; children: React.ReactNode; color?: string }) {
  const headers: Record<string, string> = {
    slate:   "bg-slate-50 border-slate-100",
    blue:    "bg-blue-600 text-white border-blue-700",
    emerald: "bg-emerald-600 text-white border-emerald-700",
    violet:  "bg-violet-600 text-white border-violet-700",
  };
  return (
    <div className="card-premium overflow-hidden">
      <div className={`border-b px-5 py-3 ${headers[color] ?? headers.slate}`}>
        <h3 className={`font-semibold text-sm ${color !== "slate" ? "text-white" : "text-ink"}`}>{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

// ─── Payment ──────────────────────────────────────────────────────────────────

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

function PaymentSection({ existing, onMethodChange }: { existing: Existing; onMethodChange: (m: string) => void }) {
  const [method, setMethod] = useState(existing?.payoutMethod ?? "ORANGE_MONEY");

  function change(m: string) { setMethod(m); onMethodChange(m); }

  const isMM = ["ORANGE_MONEY","WAVE","MTN_MOMO","MOOV_MONEY","AIRTEL_MONEY","M_PESA"].includes(method);

  return (
    <div className="card-premium overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 border-b border-emerald-700">
        <h3 className="font-semibold text-sm text-white">💰 Coordonnées de paiement des commissions</h3>
        <p className="text-xs text-emerald-100 mt-0.5">Choisissez comment vous souhaitez recevoir vos commissions.</p>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Méthode préférée <span className="text-rose-500">*</span></label>
          <select name="payoutMethod" value={method} required onChange={e => change(e.target.value)} className={inputCls}>
            {PAYOUT_METHODS.map(g => (
              <optgroup key={g.group} label={g.group}>
                {g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {isMM && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <WhatsAppField label="Numéro Mobile Money" name="mobileMoneyNum" defaultValue={existing?.mobileMoneyNum} required />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nom du titulaire du compte</label>
              <input name="mobileMoneyOperator" defaultValue={existing?.mobileMoneyOperator ?? ""} placeholder="Ex: KOUAKOU Jean" className={inputCls} />
            </div>
          </div>
        )}
        {method === "CINETPAY"      && <WhatsAppField label="Numéro CinetPay"    name="cinetpayPhone"   defaultValue={existing?.cinetpayPhone} required />}
        {method === "KKIAPAY"       && <WhatsAppField label="Numéro KKiaPay"     name="kkiapayPhone"    defaultValue={existing?.kkiapayPhone} required />}
        {method === "TMONEY"        && <WhatsAppField label="Numéro T-Money"     name="tmoneyPhone"     defaultValue={existing?.tmoneyPhone} required />}
        {method === "FLOOZ"         && <WhatsAppField label="Numéro Flooz"       name="floozPhone"      defaultValue={existing?.floozPhone} required />}
        {["BANK_LOCAL","BANK_SEPA","BANK_SWIFT"].includes(method) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Nom de la banque <span className="text-rose-500">*</span></label><input name="bankName" defaultValue={existing?.bankName ?? ""} required className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Pays de la banque <span className="text-rose-500">*</span></label><input name="bankCountry" defaultValue={existing?.bankCountry ?? ""} required className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Numéro de compte</label><input name="bankAccountNum" defaultValue={existing?.bankAccountNum ?? ""} className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Code agence</label><input name="bankBranch" defaultValue={existing?.bankBranch ?? ""} className={inputCls} /></div>
            {method !== "BANK_LOCAL" && <>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">IBAN</label><input name="iban" defaultValue={existing?.iban ?? ""} placeholder="FR76 3000..." className={inputCls} /></div>
              <div><label className="block text-xs font-semibold text-slate-600 mb-1">SWIFT/BIC</label><input name="swift" defaultValue={existing?.swift ?? ""} placeholder="BNPAFRPPXXX" className={inputCls} /></div>
            </>}
            <div className="sm:col-span-2"><label className="block text-xs font-semibold text-slate-600 mb-1">RIB complet</label><input name="rib" defaultValue={existing?.rib ?? ""} className={inputCls} /></div>
          </div>
        )}
        {method === "WESTERN_UNION" && <div><label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet <span className="text-rose-500">*</span></label><input name="westernUnionName" defaultValue={existing?.westernUnionName ?? ""} required placeholder="NOM Prénom" className={inputCls} /></div>}
        {method === "MONEYGRAM"     && <div><label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet <span className="text-rose-500">*</span></label><input name="moneyGramName" defaultValue={existing?.moneyGramName ?? ""} required placeholder="NOM Prénom" className={inputCls} /></div>}
        {method === "RIA"           && <div><label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet RIA <span className="text-rose-500">*</span></label><input name="riaName" defaultValue={existing?.riaName ?? ""} required placeholder="NOM Prénom" className={inputCls} /></div>}
        {method === "EXPRESS_UNION" && <WhatsAppField label="Numéro Express Union" name="expressUnionNum" defaultValue={existing?.expressUnionNum} required />}
        {method === "PAYPAL"        && <div><label className="block text-xs font-semibold text-slate-600 mb-1">Email PayPal <span className="text-rose-500">*</span></label><input type="email" name="paypalEmail" defaultValue={existing?.paypalEmail ?? ""} required placeholder="vous@email.com" className={inputCls} /></div>}
        {method === "WISE"          && <div><label className="block text-xs font-semibold text-slate-600 mb-1">Email Wise <span className="text-rose-500">*</span></label><input type="email" name="wiseEmail" defaultValue={existing?.wiseEmail ?? ""} required placeholder="vous@email.com" className={inputCls} /></div>}
        {method === "SKRILL"        && <div><label className="block text-xs font-semibold text-slate-600 mb-1">Email Skrill <span className="text-rose-500">*</span></label><input type="email" name="skrillEmail" defaultValue={existing?.skrillEmail ?? ""} required placeholder="vous@email.com" className={inputCls} /></div>}
        {method === "CRYPTO" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Crypto <span className="text-rose-500">*</span></label>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Adresse wallet <span className="text-rose-500">*</span></label>
              <input name="cryptoAddress" defaultValue={existing?.cryptoAddress ?? ""} required placeholder="0x... / T... / bc1..." className={inputCls} />
            </div>
            <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700">
              ⚠️ Vérifiez soigneusement votre adresse et le réseau. Toute erreur entraîne une perte définitive des fonds.
            </div>
          </div>
        )}
        {method === "CHEQUE" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">À l'ordre de <span className="text-rose-500">*</span></label><input name="chequePayable" defaultValue={existing?.chequePayable ?? ""} required placeholder="NOM Prénom" className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Banque émettrice</label><input name="chequeBank" defaultValue={existing?.chequeBank ?? ""} className={inputCls} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function VerificationForm({ initialType, existing }: {
  initialType?: string;
  existing: Existing;
}) {
  const [type, setType] = useState(initialType ?? "INDIVIDUAL");

  // Controlled state for checklist tracking
  const [fullName, setFullName]           = useState(existing?.fullName ?? "");
  const [idType, setIdType]               = useState(existing?.idType ?? "");
  const [idNumber, setIdNumber]           = useState(existing?.idNumber ?? "");
  const [country, setCountry]             = useState(existing?.country ?? "");
  const [city, setCity]                   = useState(existing?.city ?? "");
  const [whatsapp, setWhatsapp]           = useState(existing?.whatsapp ?? "");
  const [idDocUrl, setIdDocUrl]           = useState(existing?.idDocUrl ?? "");
  const [payoutMethod, setPayoutMethod]   = useState(existing?.payoutMethod ?? "ORANGE_MONEY");
  const [contact1Name, setContact1Name]   = useState(existing?.contact1Name ?? "");
  const [contact1Phone, setContact1Phone] = useState(existing?.contact1Phone ?? "");
  const [contact2Name, setContact2Name]   = useState(existing?.contact2Name ?? "");
  const [contact2Phone, setContact2Phone] = useState(existing?.contact2Phone ?? "");

  // Company
  const [companyName, setCompanyName]         = useState(existing?.companyName ?? "");
  const [rccm, setRccm]                       = useState(existing?.rccm ?? "");
  const [nif, setNif]                         = useState(existing?.nif ?? "");
  const [companyCountry, setCompanyCountry]   = useState(existing?.companyCountry ?? "");
  const [companyCity, setCompanyCity]         = useState(existing?.companyCity ?? "");
  const [companyAddress, setCompanyAddress]   = useState(existing?.companyAddress ?? "");
  const [companyWhatsapp, setCompanyWhatsapp] = useState(existing?.companyWhatsapp ?? "");
  const [legalRep, setLegalRep]               = useState(existing?.legalRep ?? "");
  const [legalRepTitle, setLegalRepTitle]     = useState(existing?.legalRepTitle ?? "");

  const [submitError, setSubmitError] = useState("");

  const checkFields = {
    fullName, idType, idNumber, country, city, whatsapp, idDocUrl, payoutMethod,
    contact1Name, contact1Phone, contact2Name, contact2Phone,
    companyName, rccm, nif, companyCountry, companyCity, companyAddress, companyWhatsapp, legalRep, legalRepTitle,
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (type === "INDIVIDUAL" && !idDocUrl) {
      setSubmitError("⚠️ Vous devez uploader la photo de votre pièce d'identité avant de soumettre.");
      document.getElementById("id-doc-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setSubmitError("");
    const fd = new FormData(e.currentTarget);
    await submitVerification(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="partnerType" value={type} />

      {/* Checklist */}
      <ProgressChecklist type={type} fields={checkFields} />

      {/* Type toggle */}
      <div className="card-premium p-5">
        <p className="text-sm font-semibold text-ink mb-3">Vous êtes :</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: "INDIVIDUAL", label: "👤 Particulier", sub: "Personne physique" },
            { val: "COMPANY",    label: "🏢 Entreprise",  sub: "Société, ONG, association" },
          ].map((opt) => (
            <button key={opt.val} type="button" onClick={() => setType(opt.val)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${type === opt.val ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
              <p className="font-bold text-sm text-ink">{opt.label}</p>
              <p className="text-xs text-muted mt-0.5">{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {type === "INDIVIDUAL" ? (
        <>
          {/* Identité */}
          <div className="card-premium overflow-hidden">
            <div className="bg-blue-600 border-b border-blue-700 px-5 py-3">
              <h3 className="font-semibold text-sm text-white">👤 Identité à l'état civil</h3>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <F label="Nom et prénoms exacts (état civil)" name="fullName" value={fullName} onChange={setFullName} required placeholder="KOUAKOU Jean-Marc" />
              </div>
              <Sel label="Type de pièce d'identité" name="idType" value={idType} onChange={setIdType} required>
                <option value="">-- Choisir --</option>
                <option value="CIN">Carte Nationale d&apos;Identité (CNI/CIN)</option>
                <option value="PASSEPORT">Passeport biométrique</option>
                <option value="PERMIS">Permis de conduire</option>
                <option value="AUTRE">Autre document officiel</option>
              </Sel>
              <F label="Numéro de la pièce d'identité" name="idNumber" value={idNumber} onChange={setIdNumber} required placeholder="CI-XXXX-XXXXXX" />
              <F label="Pays de résidence" name="country" value={country} onChange={setCountry} required placeholder="Côte d'Ivoire" />
              <F label="Ville / Région" name="city" value={city} onChange={setCity} required placeholder="Abidjan — Cocody" />
              <F label="Email de contact" name="contactEmail" value={existing?.companyEmail ?? ""} onChange={() => {}} type="email" placeholder="votre@email.com" />
              <F label="Profession / Métier actuel" name="profession" value={existing?.profession ?? ""} onChange={() => {}} placeholder="Enseignant, Commercial, Entrepreneur…" />
            </div>
          </div>

          {/* Pièce d'identité */}
          <div id="id-doc-section" className="card-premium overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-700 px-5 py-3">
              <h3 className="font-semibold text-sm text-white">🪪 Photo de la pièce d&apos;identité <span className="font-normal text-blue-200">(obligatoire)</span></h3>
              <p className="text-xs text-blue-100 mt-0.5">CNI recto/verso, passeport ou permis — sans cette photo, la soumission est bloquée.</p>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FileUpload
                  name="idDocUrl"
                  defaultUrl={existing?.idDocUrl}
                  folder="ibig-kyc-docs"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  label="Recto (face avant) *"
                  hint="JPEG, PNG ou PDF · max 10 Mo"
                  preview="image"
                  onUpload={url => setIdDocUrl(url)}
                />
                {!idDocUrl && (
                  <p className="mt-1 text-xs font-semibold text-rose-500">Ce document est obligatoire ✱</p>
                )}
              </div>
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
              <p className="text-xs text-amber-700">⚠️ Vos documents sont transmis de façon sécurisée et ne sont utilisés qu&apos;à des fins de vérification KYC.</p>
            </div>
          </div>

          {/* Contacts */}
          <div className="card-premium overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <h3 className="font-semibold text-sm text-ink">📞 Contacts</h3>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <WhatsAppField label="WhatsApp principal" name="whatsapp" defaultValue={existing?.whatsapp} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Second contact</label>
                <input name="secondPhone" defaultValue={existing?.secondPhone ?? ""} placeholder="+225 05 00 00 00 00" className={inputCls} />
              </div>
            </div>
          </div>

          {/* 2 contacts tiers */}
          <div className="card-premium overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <h3 className="font-semibold text-sm text-ink">👨‍👩‍👧 2 personnes à contacter en dehors de vous <span className="text-rose-500">*</span></h3>
              <p className="text-xs text-muted mt-0.5">Personnes joignables indépendamment — famille, amis, collègues.</p>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="Contact 1 — Nom et prénom" name="contact1Name" value={contact1Name} onChange={setContact1Name} required placeholder="Kouamé Alice" />
              <F label="Contact 1 — Téléphone / WhatsApp" name="contact1Phone" value={contact1Phone} onChange={setContact1Phone} required placeholder="+225 07 00 00 00 00" />
              <F label="Contact 2 — Nom et prénom" name="contact2Name" value={contact2Name} onChange={setContact2Name} required placeholder="Traoré Mohamed" />
              <F label="Contact 2 — Téléphone / WhatsApp" name="contact2Phone" value={contact2Phone} onChange={setContact2Phone} required placeholder="+225 05 00 00 00 00" />
            </div>
          </div>

          {/* CV (facultatif) */}
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
              <T label="Résumé de votre parcours, compétences, expériences" name="cvText" value={existing?.cvText ?? ""} onChange={() => {}} rows={4} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Entreprise */}
          <div className="card-premium overflow-hidden">
            <div className="bg-violet-600 border-b border-violet-700 px-5 py-3">
              <h3 className="font-semibold text-sm text-white">🏢 Identification de l'entreprise</h3>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <F label="Dénomination sociale (nom légal)" name="companyName" value={companyName} onChange={setCompanyName} required />
              </div>
              <F label="RCCM (Registre de Commerce)" name="rccm" value={rccm} onChange={setRccm} required placeholder="CI-ABJ-XXXX-X-XXX-XXXX" />
              <F label="NIF (Numéro d'Identification Fiscale)" name="nif" value={nif} onChange={setNif} required />
              <F label="Compte Contribuable" name="compteContrib" value={existing?.compteContrib ?? ""} onChange={() => {}} />
              <F label="Email officiel" name="companyEmail" value={existing?.companyEmail ?? ""} onChange={() => {}} type="email" placeholder="contact@entreprise.com" />
              <F label="Pays du siège social" name="companyCountry" value={companyCountry} onChange={setCompanyCountry} required placeholder="Côte d'Ivoire" />
              <F label="Ville / Commune" name="companyCity" value={companyCity} onChange={setCompanyCity} required placeholder="Abidjan — Plateau" />
              <div className="sm:col-span-2">
                <F label="Adresse complète du siège social" name="companyAddress" value={companyAddress} onChange={setCompanyAddress} required placeholder="Rue des Jardins, Immeuble Delta, 2ème étage" />
              </div>
              <div className="sm:col-span-2">
                <WhatsAppField label="WhatsApp entreprise / standard" name="companyWhatsapp" defaultValue={existing?.companyWhatsapp} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Second téléphone</label>
                <input name="companyPhone2" defaultValue={existing?.companyPhone2 ?? ""} placeholder="+225 07 00 00 00 00" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Représentant légal */}
          <div className="card-premium overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
              <h3 className="font-semibold text-sm text-ink">👔 Représentant légal</h3>
            </div>
            <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F label="Nom et prénoms du représentant légal" name="legalRep" value={legalRep} onChange={setLegalRep} required placeholder="KOUAKOU Jean-Baptiste" />
              <Sel label="Titre / Fonction" name="legalRepTitle" value={legalRepTitle} onChange={setLegalRepTitle} required>
                <option value="">-- Choisir --</option>
                <option value="DG">Directeur Général (DG)</option>
                <option value="PDG">Président Directeur Général (PDG)</option>
                <option value="GERANT">Gérant</option>
                <option value="ADMIN">Administrateur</option>
                <option value="AUTRE">Autre</option>
              </Sel>
            </div>
          </div>
        </>
      )}

      {/* Paiement */}
      <PaymentSection existing={existing} onMethodChange={setPayoutMethod} />

      {/* Méthodes secondaires */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">💳 Méthodes de paiement de secours <span className="font-normal normal-case text-slate-400">(optionnel)</span></p>
        <p className="text-xs text-slate-400">En cas d&apos;indisponibilité de votre méthode principale, l&apos;équipe utilisera ces alternatives.</p>
      </div>

      {/* Erreur de soumission */}
      {submitError && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {submitError}
        </div>
      )}

      <p className="text-xs text-muted bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
        🔒 En soumettant ce formulaire, vous certifiez l&apos;exactitude des informations. Toute fausse déclaration entraîne la suspension immédiate et définitive du compte sans paiement des commissions dues.
      </p>

      <button
        type="submit"
        disabled={type === "INDIVIDUAL" && !idDocUrl}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📤 Soumettre mon dossier de vérification
      </button>
      {type === "INDIVIDUAL" && !idDocUrl && (
        <p className="text-xs text-center text-rose-500 font-semibold">
          Uploadez votre pièce d&apos;identité pour activer le bouton de soumission.
        </p>
      )}
    </form>
  );
}
