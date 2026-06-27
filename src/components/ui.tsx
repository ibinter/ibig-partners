import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`card-premium ${className}`}>
      {children}
    </div>
  );
}

/* ── StatCard avec fond coloré dégradé ── */
const STAT_THEMES: Record<string, { bg: string; text: string; sub: string; dot: string }> = {
  brand: {
    bg: "bg-gradient-to-br from-blue-600 to-blue-800",
    text: "text-white",
    sub: "text-blue-200",
    dot: "bg-white/20",
  },
  gold: {
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    text: "text-white",
    sub: "text-amber-100",
    dot: "bg-white/20",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    text: "text-white",
    sub: "text-emerald-100",
    dot: "bg-white/20",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-600 to-slate-800",
    text: "text-white",
    sub: "text-slate-300",
    dot: "bg-white/20",
  },
  purple: {
    bg: "bg-gradient-to-br from-violet-500 to-purple-700",
    text: "text-white",
    sub: "text-violet-200",
    dot: "bg-white/20",
  },
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
  accent?: keyof typeof STAT_THEMES;
  icon?: string;
}) {
  const t = STAT_THEMES[accent] ?? STAT_THEMES.brand;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 shadow-md ${t.bg}`}>
      {/* Cercle décoratif */}
      <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${t.dot} blur-sm`} />
      <div className={`absolute -bottom-6 -right-2 h-16 w-16 rounded-full ${t.dot}`} />

      {icon && (
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg">
          {icon}
        </div>
      )}
      <p className={`text-xs font-semibold uppercase tracking-wide ${t.sub}`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold tracking-tight ${t.text}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs ${t.sub}`}>{sub}</p>}
    </div>
  );
}

/* ── Badges ── */
const TONES: Record<string, string> = {
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-rose-50 text-rose-700 ring-rose-100",
  gold: "bg-yellow-50 text-yellow-700 ring-yellow-100",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]}`}>
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

/* ── PageHeader ── */
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
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── Button ── */
export function Button({
  children,
  type = "submit",
  variant = "primary",
  className = "",
  ...rest
}: {
  children: ReactNode;
  type?: "submit" | "button";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:from-blue-700 hover:to-blue-800",
    secondary:
      "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger:
      "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-sm",
  };
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${styles[variant]} ${className}`}
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
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm",
    secondary:
      "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 shadow-sm",
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}

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
      <span className="block text-sm font-semibold text-ink mb-1.5">{label}</span>
      {children ?? (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 placeholder:text-slate-400"
        />
      )}
    </label>
  );
}
