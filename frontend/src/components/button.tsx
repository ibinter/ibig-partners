"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode, ButtonHTMLAttributes } from "react";

export const BTN_VARIANTS: Record<string, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
  ghost:
    "text-slate-600 hover:bg-slate-100",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  warning:
    "bg-amber-500 text-white shadow-sm hover:bg-amber-600",
};

export const BTN_SIZES: Record<string, string> = {
  xs: "rounded-lg px-2.5 py-1    text-xs  font-medium gap-1",
  sm: "rounded-lg px-3   py-1.5  text-xs  font-semibold gap-1.5",
  md: "rounded-xl px-4   py-2.5  text-sm  font-semibold gap-2",
  lg: "rounded-xl px-5   py-3    text-sm  font-semibold gap-2",
};

/**
 * Bouton universel. Quand il SOUMET un formulaire (`type="submit"`), il devient
 * automatiquement réactif : dès le clic il se désactive et affiche un spinner
 * tant que l'action serveur tourne (via useFormStatus). Cela supprime la
 * sensation de « bouton mort / dur au clic » sur toute la plateforme et empêche
 * les doubles soumissions — sans que chaque page ait à s'en occuper.
 *
 * Les boutons `type="button"` (hors formulaire) ne sont pas affectés.
 */
export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...rest
}: {
  children: ReactNode;
  type?: "submit" | "button";
  variant?: keyof typeof BTN_VARIANTS;
  size?: keyof typeof BTN_SIZES;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  const busy = type === "submit" && pending;
  return (
    <button
      type={type}
      disabled={busy || disabled}
      aria-busy={busy || undefined}
      className={`inline-flex items-center justify-center transition-all disabled:opacity-60 disabled:cursor-wait ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
      {...rest}
    >
      {busy && (
        <span
          aria-hidden
          className="mr-1.5 inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
