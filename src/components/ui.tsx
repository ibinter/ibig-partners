import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  sub,
  accent = "brand",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "brand" | "gold" | "green" | "slate";
}) {
  const ring: Record<string, string> = {
    brand: "text-brand-600",
    gold: "text-gold-500",
    green: "text-emerald-600",
    slate: "text-slate-600",
  };
  return (
    <div className="card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${ring[accent]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

const TONES: Record<string, string> = {
  gray: "bg-slate-100 text-slate-700",
  blue: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  gold: "bg-yellow-50 text-yellow-700",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
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
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

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
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`}
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
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-brand-700 border border-brand-200 hover:bg-brand-50",
  };
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${styles[variant]}`}
    >
      {children}
    </Link>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="card p-10 text-center text-muted text-sm">{children}</div>
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      {children ?? (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      )}
    </label>
  );
}
