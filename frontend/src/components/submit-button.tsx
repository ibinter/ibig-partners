"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { BTN_VARIANTS, BTN_SIZES } from "./ui";

/**
 * Bouton de soumission de formulaire (server action) avec retour visuel
 * IMMÉDIAT : dès le clic, il se désactive et affiche un spinner tant que
 * l'action serveur tourne. Résout la sensation de « bouton mort / dur au clic »
 * et empêche les doubles soumissions.
 *
 * À utiliser DANS un <form action={serverAction}> à la place de <Button type="submit">.
 */
export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  pendingLabel,
}: {
  children: ReactNode;
  variant?: keyof typeof BTN_VARIANTS;
  size?: keyof typeof BTN_SIZES;
  className?: string;
  pendingLabel?: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center transition-all disabled:cursor-wait disabled:opacity-70 ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
    >
      {pending && (
        <span
          aria-hidden
          className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}
