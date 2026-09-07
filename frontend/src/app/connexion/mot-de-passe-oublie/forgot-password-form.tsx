"use client";

import { useActionState } from "react";
import { Button, Field } from "@/components/ui";
import { forgotPasswordAction } from "./actions";

type State = { error?: string; success?: boolean } | null;

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    forgotPasswordAction,
    null,
  );

  if (state?.success) {
    return (
      <div className="mt-6 rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800">
        <p className="font-semibold">E-mail envoyé ✅</p>
        <p className="mt-1">
          Si un compte existe avec cette adresse, vous recevrez un lien de
          réinitialisation dans quelques minutes. Vérifiez vos spams.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        required
        placeholder="vous@exemple.com"
      />
      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
      </Button>
    </form>
  );
}
