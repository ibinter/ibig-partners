"use client";

import { useState } from "react";
import { submitVerification } from "./actions";

type Existing = {
  type?: string | null;
  fullName?: string | null; idType?: string | null; idNumber?: string | null;
  cvText?: string | null; country?: string | null; city?: string | null;
  profession?: string | null; whatsapp?: string | null; secondPhone?: string | null;
  contact1Name?: string | null; contact1Phone?: string | null;
  contact2Name?: string | null; contact2Phone?: string | null;
  companyName?: string | null; rccm?: string | null; nif?: string | null;
  compteContrib?: string | null; legalRep?: string | null; legalRepTitle?: string | null;
  companyCountry?: string | null; companyCity?: string | null; companyAddress?: string | null;
  companyEmail?: string | null; companyWhatsapp?: string | null; companyPhone2?: string | null;
  payoutMethod?: string | null; mobileMoneyNum?: string | null; paypalEmail?: string | null;
  rib?: string | null; bankName?: string | null; bankCountry?: string | null;
  swift?: string | null; iban?: string | null; westernUnionName?: string | null;
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

function PaymentSection({ existing }: { existing: Existing }) {
  const [method, setMethod] = useState(existing?.payoutMethod ?? "ORANGE_MONEY");
  const isMobile = ["ORANGE_MONEY", "WAVE", "MTN_MOMO"].includes(method);

  return (
    <div className="card-premium overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 border-b border-emerald-700">
        <h3 className="font-semibold text-sm text-white">💰 Coordonnées de paiement des commissions</h3>
        <p className="text-xs text-emerald-100 mt-0.5">Comment souhaitez-vous recevoir vos commissions ?</p>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Méthode préférée <span className="text-rose-500">*</span></label>
          <select name="payoutMethod" value={method} required onChange={e => setMethod(e.target.value)} className={inputCls}>
            <option value="ORANGE_MONEY">Orange Money</option>
            <option value="WAVE">Wave</option>
            <option value="MTN_MOMO">MTN MoMo</option>
            <option value="BANK">Virement bancaire</option>
            <option value="PAYPAL">PayPal</option>
            <option value="WESTERN_UNION">Western Union / MoneyGram</option>
          </select>
        </div>

        {isMobile && <F label="Numéro Mobile Money" name="mobileMoneyNum" defaultValue={existing?.mobileMoneyNum} required placeholder="+225 07 00 00 00 00" />}
        {method === "PAYPAL" && <F label="Email PayPal" name="paypalEmail" defaultValue={existing?.paypalEmail} required type="email" placeholder="votre@paypal.com" />}
        {method === "WESTERN_UNION" && <F label="Nom complet (Western Union / MoneyGram)" name="westernUnionName" defaultValue={existing?.westernUnionName} required placeholder="Nom exact sur pièce d'identité" />}
        {method === "BANK" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="RIB complet" name="rib" defaultValue={existing?.rib} />
            <F label="Nom de la banque" name="bankName" defaultValue={existing?.bankName} />
            <F label="Pays de la banque" name="bankCountry" defaultValue={existing?.bankCountry} />
            <F label="Code SWIFT / BIC" name="swift" defaultValue={existing?.swift} placeholder="XXXXXXXX" />
            <div className="sm:col-span-2"><F label="IBAN (virement international)" name="iban" defaultValue={existing?.iban} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" /></div>
          </div>
        )}

        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          ⚠️ Pour les paiements internationaux (PayPal, Western Union, virement SWIFT), les frais de transfert seront déduits de vos commissions.
        </p>
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

      <div className="card-premium overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-sm text-ink">📄 Curriculum Vitae / Parcours</h3>
        </div>
        <div className="p-5 space-y-2">
          <T label="Résumé de votre parcours, compétences, expériences et réseaux professionnels" name="cvText" defaultValue={existing?.cvText} rows={6} />
          <p className="text-xs text-muted">Décrivez vos expériences professionnelles, domaines de compétence et votre réseau.</p>
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

      <PaymentSection existing={existing} />

      <p className="text-xs text-muted bg-slate-50 rounded-xl border border-slate-100 px-4 py-3">
        🔒 En soumettant ce formulaire, vous certifiez l&apos;exactitude des informations. Toute fausse déclaration entraîne la suspension immédiate et définitive du compte sans paiement des commissions dues.
      </p>

      <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:from-blue-700 hover:to-violet-700 transition-all">
        📤 Soumettre mon dossier de vérification
      </button>
    </form>
  );
}
