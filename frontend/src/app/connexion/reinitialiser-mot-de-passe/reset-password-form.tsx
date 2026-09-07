"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Field } from "@/components/ui";
import { resetPasswordAction } from "./actions";

type State = { error?: string; success?: boolean } | null;

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    resetPasswordAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800">
          <p className="font-semibold">Mot de passe mis à jour ✅</p>
          <p className="mt-1">Votre mot de passe a bien été modifié.</p>
        </div>
        <Link
          href="/connexion"
          className="block w-full rounded-lg bg-brand-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field
        label="Nouveau mot de passe"
        name="password"
        type="password"
        required
        placeholder="Minimum 8 caractères"
      />
      <Field
        label="Confirmer le mot de passe"
        name="passwordConfirm"
        type="password"
        required
        placeholder="Répétez le mot de passe"
      />
      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
      </Button>
      <p className="text-center text-sm text-muted">
        <Link href="/connexion/mot-de-passe-oublie" className="text-brand-600 hover:underline">
          Demander un nouveau lien
        </Link>
      </p>
    </form>
  );
}
