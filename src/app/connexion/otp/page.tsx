"use client";

import { useActionState } from "react";
import { verifyOtpAction } from "./actions";
import { Button, Field } from "@/components/ui";
import Link from "next/link";

export default function OtpPage() {
  const [state, action, pending] = useActionState(verifyOtpAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
            🔐
          </div>
          <h1 className="text-xl font-bold text-ink">Vérification en deux étapes</h1>
          <p className="mt-1 text-sm text-muted">
            Un code à 6 chiffres a été envoyé à votre adresse email.
          </p>
        </div>

        {state?.error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <Field label="Code à 6 chiffres" name="code" required>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="000000"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-2xl font-mono tracking-widest focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Vérification…" : "Confirmer"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Code non reçu ?{" "}
          <Link href="/connexion" className="text-brand-600 hover:underline">
            Recommencer la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
