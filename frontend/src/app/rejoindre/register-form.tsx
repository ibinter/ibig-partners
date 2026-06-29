"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button, Field } from "@/components/ui";

type State = { error?: string } | null;

const PARTNER_TYPES = [
  { value: "INDIVIDUAL",   label: "Particulier" },
  { value: "COMPANY",      label: "Entreprise" },
  { value: "NGO",          label: "ONG" },
  { value: "ASSOCIATION",  label: "Association" },
  { value: "OTHER",        label: "Autre" },
];

export default function RegisterForm({
  action,
  prefillCode,
}: {
  action: (prev: unknown, fd: FormData) => Promise<State>;
  prefillCode?: string;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);
  const [partnerType, setPartnerType] = useState("INDIVIDUAL");
  const isOrg = partnerType !== "INDIVIDUAL";

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {/* Type de compte */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Type de compte *
        </label>
        <div className="flex flex-wrap gap-2">
          {PARTNER_TYPES.map((t) => (
            <label
              key={t.value}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                partnerType === t.value
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-300 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              <input
                type="radio"
                name="partnerType"
                value={t.value}
                checked={partnerType === t.value}
                onChange={() => setPartnerType(t.value)}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Nom de l'organisation (si non Particulier) */}
      {isOrg && (
        <Field
          label={`Nom de l'${partnerType === "NGO" ? "ONG" : partnerType === "ASSOCIATION" ? "association" : "organisation"} *`}
          name="orgName"
          required
          placeholder={
            partnerType === "COMPANY" ? "Ex : IBIG SARL" :
            partnerType === "NGO" ? "Ex : ONG Espoir" :
            partnerType === "ASSOCIATION" ? "Ex : Association des jeunes entrepreneurs" :
            "Nom de votre structure"
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={isOrg ? "Prénom du responsable *" : "Prénom *"} name="firstName" required />
        <Field label={isOrg ? "Nom du responsable *" : "Nom *"} name="lastName" required />
      </div>
      <Field label="Email *" name="email" type="email" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone *" name="phone" required placeholder="+225 07 00 00 00" />
        <Field label="Ville" name="city" />
      </div>
      <Field label="Mot de passe * (6 caractères min.)" name="password" type="password" required />
      <Field label="Code parrain (facultatif)" name="sponsorCode" defaultValue={prefillCode} placeholder="AFF-XXXX-000" />

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Création…" : "Créer mon compte partenaire"}
      </Button>
      <p className="text-center text-xs text-muted">
        En vous inscrivant, vous acceptez les{" "}
        <a href="/cgu" target="_blank" className="underline hover:text-brand-600">
          Conditions Générales d&apos;Utilisation
        </a>{" "}
        du programme IBIG PARTNERS. Votre compte sera validé par l&apos;équipe IBIG.
      </p>
    </form>
  );
}
