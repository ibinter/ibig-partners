"use client";

import { useActionState } from "react";
import { Button, Field } from "@/components/ui";

type State = { error?: string } | null;

export default function LoginForm({
  action,
  next,
}: {
  action: (prev: unknown, fd: FormData) => Promise<State>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(action, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" name="email" type="email" required placeholder="vous@exemple.com" />
      <Field label="Mot de passe" name="password" type="password" required placeholder="••••••••" />
      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
