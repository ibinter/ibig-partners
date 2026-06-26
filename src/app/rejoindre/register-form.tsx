"use client";

import { useActionState } from "react";
import { Button, Field } from "@/components/ui";
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS } from "@/lib/constants";

type State = { error?: string } | null;

export default function RegisterForm({
  action,
  prefillCode,
}: {
  action: (prev: unknown, fd: FormData) => Promise<State>;
  prefillCode?: string;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom *" name="firstName" required />
        <Field label="Nom *" name="lastName" required />
      </div>
      <Field label="Email *" name="email" type="email" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone *" name="phone" required placeholder="+225 07 00 00 00" />
        <Field label="Ville" name="city" />
      </div>
      <Field label="Mot de passe * (6 caractères min.)" name="password" type="password" required />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mode de paiement préféré" name="payoutMethod">
          <select
            name="payoutMethod"
            defaultValue="ORANGE_MONEY"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {PAYOUT_METHODS.map((m) => (
              <option key={m} value={m}>{PAYOUT_METHOD_LABELS[m]}</option>
            ))}
          </select>
        </Field>
        <Field label="N° Mobile Money / IBAN" name="payoutDetail" placeholder="07 00 00 00 00" />
      </div>

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
