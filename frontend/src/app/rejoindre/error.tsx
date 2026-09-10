"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui";

export default function RejoindreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur sur la page d'inscription :", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-ink">Inscription momentanément indisponible</h1>
        <p className="mt-3 text-sm text-muted">
          Un incident temporaire est survenu. Vous pouvez réessayer dans quelques instants.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" onClick={() => reset()}>
            Réessayer
          </Button>
          <LinkButton href="/" variant="secondary">Accueil</LinkButton>
        </div>
      </div>
    </div>
  );
}
