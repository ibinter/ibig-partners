"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button, Field } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";

type State = { error?: string } | null;
type Lang = "fr" | "en";

const TYPE_ORDER = ["INDIVIDUAL", "COMPANY", "NGO", "ASSOCIATION", "OTHER"] as const;

const STRINGS = {
  fr: {
    accountType: "Type de compte *",
    types: { INDIVIDUAL: "Particulier", COMPANY: "Entreprise", NGO: "ONG", ASSOCIATION: "Association", OTHER: "Autre" },
    orgLabel: (k: string) => `Nom de l'${k === "NGO" ? "ONG" : k === "ASSOCIATION" ? "association" : "organisation"} *`,
    orgPlaceholder: { COMPANY: "Ex : IBIG SARL", NGO: "Ex : ONG Espoir", ASSOCIATION: "Ex : Association des jeunes entrepreneurs", OTHER: "Nom de votre structure" } as Record<string, string>,
    firstName: (org: boolean) => (org ? "Prénom du responsable *" : "Prénom *"),
    lastName: (org: boolean) => (org ? "Nom du responsable *" : "Nom *"),
    email: "Email *",
    phone: "Téléphone *",
    city: "Ville",
    country: "Pays *",
    selectCountry: "Sélectionnez votre pays",
    whatsapp: "Numéro WhatsApp *",
    password: "Mot de passe * (6 caractères min.)",
    sponsor: "Code parrain (facultatif)",
    submit: "Créer mon compte partenaire",
    submitting: "Création…",
    termsPre: "En vous inscrivant, vous acceptez les ",
    termsLink: "Conditions Générales d'Utilisation",
    termsPost: " du programme IBIG PARTNERS. Votre compte sera validé par l'équipe IBIG.",
  },
  en: {
    accountType: "Account type *",
    types: { INDIVIDUAL: "Individual", COMPANY: "Company", NGO: "NGO", ASSOCIATION: "Association", OTHER: "Other" },
    orgLabel: (k: string) => `Name of the ${k === "NGO" ? "NGO" : k === "ASSOCIATION" ? "association" : "organization"} *`,
    orgPlaceholder: { COMPANY: "e.g. IBIG SARL", NGO: "e.g. Hope NGO", ASSOCIATION: "e.g. Young Entrepreneurs Association", OTHER: "Your organization's name" } as Record<string, string>,
    firstName: (org: boolean) => (org ? "Manager's first name *" : "First name *"),
    lastName: (org: boolean) => (org ? "Manager's last name *" : "Last name *"),
    email: "Email *",
    phone: "Phone *",
    city: "City",
    country: "Country *",
    selectCountry: "Select your country",
    whatsapp: "WhatsApp number *",
    password: "Password * (min. 6 characters)",
    sponsor: "Referral code (optional)",
    submit: "Create my partner account",
    submitting: "Creating…",
    termsPre: "By signing up, you agree to the ",
    termsLink: "Terms of Use",
    termsPost: " of the IBIG PARTNERS program. Your account will be validated by the IBIG team.",
  },
} as const;

export default function RegisterForm({
  action,
  prefillCode,
  lang = "fr",
}: {
  action: (prev: unknown, fd: FormData) => Promise<State>;
  prefillCode?: string;
  lang?: Lang;
}) {
  const t = STRINGS[lang];
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);
  const [partnerType, setPartnerType] = useState("INDIVIDUAL");
  const isOrg = partnerType !== "INDIVIDUAL";
  const [country, setCountry] = useState("");
  const [dial, setDial] = useState("");
  const [localNum, setLocalNum] = useState("");
  const fullPhone = `${dial}${dial && localNum ? " " : ""}${localNum}`.trim();

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {/* Type de compte */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          {t.accountType}
        </label>
        <div className="flex flex-wrap gap-2">
          {TYPE_ORDER.map((value) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                partnerType === value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              <input
                type="radio"
                name="partnerType"
                value={value}
                checked={partnerType === value}
                onChange={() => setPartnerType(value)}
                className="sr-only"
              />
              {t.types[value]}
            </label>
          ))}
        </div>
      </div>

      {/* Nom de l'organisation (si non Particulier) */}
      {isOrg && (
        <Field
          label={t.orgLabel(partnerType)}
          name="orgName"
          required
          placeholder={t.orgPlaceholder[partnerType] ?? t.orgPlaceholder.OTHER}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.firstName(isOrg)} name="firstName" required />
        <Field label={t.lastName(isOrg)} name="lastName" required />
      </div>
      <Field label={t.email} name="email" type="email" required />

      {/* Pays (avec indicatif) — NB : le <select> ne doit PAS être imbriqué dans
          un <label>, sinon Chrome ouvre puis referme aussitôt la liste. On rend
          donc un <div>/<span> au lieu du composant Field (qui rend un <label>). */}
      <div className="block">
        <label
          htmlFor="country"
          className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5"
        >
          {t.country}
        </label>
        <select
          id="country"
          name="country"
          required
          value={country}
          onChange={(e) => {
            const c = COUNTRIES.find((x) => x.name === e.target.value);
            setCountry(e.target.value);
            setDial(c ? c.dial : "");
          }}
          className="admin-input w-full"
        >
          <option value="">{t.selectCountry}</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.flag} {c.name} ({c.dial})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Numéro WhatsApp avec indicatif */}
        <Field label={t.whatsapp}>
          <div className="flex items-stretch gap-2">
            <span className="admin-input inline-flex w-16 shrink-0 items-center justify-center bg-slate-50 font-semibold text-slate-600">
              {dial || "—"}
            </span>
            <input
              inputMode="tel"
              value={localNum}
              onChange={(e) => setLocalNum(e.target.value)}
              placeholder="07 00 00 00 00"
              required
              className="admin-input w-full"
            />
          </div>
          <input type="hidden" name="phone" value={fullPhone} />
        </Field>
        <Field label={t.city} name="city" />
      </div>
      <Field label={t.password} name="password" type="password" required />
      <Field label={t.sponsor} name="sponsorCode" defaultValue={prefillCode} placeholder="AFF-XXXX-000" />

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </Button>
      <p className="text-center text-xs text-muted">
        {t.termsPre}
        <a href="/cgu" target="_blank" className="underline hover:text-brand-600">
          {t.termsLink}
        </a>
        {t.termsPost}
      </p>
    </form>
  );
}
