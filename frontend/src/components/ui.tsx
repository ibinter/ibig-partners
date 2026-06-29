import Link from "next/link";
import type { ReactNode } from "react";

/* ── Card ─────────────────────────────────────────────────────────────
   Conteneur universel admin. Pas de hover/translate — c'est une surface
   de données, pas un CTA. La classe p-0 reste possible pour les tableaux.
──────────────────────────────────────────────────────────────────────── */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const hasPadding = /(^|\s)p[xtblrxy]?-/.test(className);
  return (
    <div className={`admin-card ${hasPadding ? "" : "p-6"} ${className}`}>
      {children}
    </div>
  );
}

/* ── Section (card avec en-tête séparé) ───────────────────────────── */
export function Section({
  title,
  subtitle,
  action,
  children,
  noPad = false,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}) {
  return (
    <div className="admin-card">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={noPad ? "" : "p-6"}>{children}</div>
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────────────────────────
   Design "Stripe-like" : barre d'accent gauche + icône dans pastille +
   valeur grande et lisible. Pas de dégradé qui écrase la page.
──────────────────────────────────────────────────────────────────────── */
type Accent = "brand" | "gold" | "green" | "slate" | "purple" | "red";

const ACCENTS: Record<Accent, { bar: string; icon: string }> = {
  brand:  { bar: "bg-blue-500",    icon: "bg-blue-50   text-blue-600"   },
  gold:   { bar: "bg-amber-400",   icon: "bg-amber-50  text-amber-600"  },
  green:  { bar: "bg-emerald-500", icon: "bg-emerald-50 text-emerald-600" },
  slate:  { bar: "bg-slate-400",   icon: "bg-slate-100 text-slate-600"  },
  purple: { bar: "bg-violet-500",  icon: "bg-violet-50 text-violet-600" },
  red:    { bar: "bg-rose-500",    icon: "bg-rose-50   text-rose-600"   },
};

export function StatCard({
  label,
  value,
  sub,
  accent = "brand",
  icon,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: Accent;
  icon?: string;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="admin-card relative flex items-start gap-4 p-5 pl-6 overflow-hidden">
      {/* Barre d'accent verticale */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${a.bar}`} />

      {icon && (
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${a.icon}`}>
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-ink tracking-tight leading-none">{value}</p>
        {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Badge ────────────────────────────────────────────────────────── */
const TONES: Record<string, string> = {
  gray:   "bg-slate-100   text-slate-600  ring-slate-200",
  blue:   "bg-blue-50     text-blue-700   ring-blue-100",
  green:  "bg-emerald-50  text-emerald-700 ring-emerald-100",
  amber:  "bg-amber-50    text-amber-700  ring-amber-100",
  red:    "bg-rose-50     text-rose-700   ring-rose-100",
  gold:   "bg-yellow-50   text-yellow-700 ring-yellow-100",
  purple: "bg-violet-50   text-violet-700 ring-violet-100",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone] ?? TONES.gray}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof TONES {
  switch (status) {
    case "PAID":
    case "CONFIRMED":
    case "WON":
    case "CONVERTED":
      return "green";
    case "VALIDATED":
    case "IN_PROGRESS":
    case "DEMO":
      return "blue";
    case "PENDING":
    case "NEW":
    case "CONTACTED":
      return "amber";
    case "CANCELLED":
    case "LOST":
      return "red";
    default:
      return "gray";
  }
}

/* ── PageHeader ──────────────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
      <div>
        <h1 className="text-[1.15rem] font-bold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Button ──────────────────────────────────────────────────────── */
const BTN_VARIANTS: Record<string, string> = {
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

const BTN_SIZES: Record<string, string> = {
  xs: "rounded-lg px-2.5 py-1    text-xs  font-medium gap-1",
  sm: "rounded-lg px-3   py-1.5  text-xs  font-semibold gap-1.5",
  md: "rounded-xl px-4   py-2.5  text-sm  font-semibold gap-2",
  lg: "rounded-xl px-5   py-3    text-sm  font-semibold gap-2",
};

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  type?: "submit" | "button";
  variant?: keyof typeof BTN_VARIANTS;
  size?: keyof typeof BTN_SIZES;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center transition-all disabled:opacity-50 ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof BTN_VARIANTS;
  size?: keyof typeof BTN_SIZES;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center transition-all ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]}`}
    >
      {children}
    </Link>
  );
}

/* ── EmptyState ──────────────────────────────────────────────────── */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center text-sm text-muted">
      {children}
    </div>
  );
}

/* ── Field ───────────────────────────────────────────────────────── */
export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  children,
  htmlFor,
}: {
  label: string;
  name?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  children?: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
        {label}
      </span>
      {children ?? (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="admin-input w-full"
        />
      )}
    </label>
  );
}

/* ── Divider ─────────────────────────────────────────────────────── */
export function Divider({ label }: { label?: string }) {
  return (
    <div className="relative flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-slate-100" />
      {label && <span className="text-xs font-semibold uppercase tracking-widest text-muted shrink-0">{label}</span>}
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}
