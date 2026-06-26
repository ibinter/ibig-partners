import Link from "next/link";
import { Logo } from "@/components/site-chrome";
import { logoutAction } from "@/app/auth-actions";
import { STATUS_LABELS } from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

export function DashboardShell({
  nav,
  user,
  children,
  variant = "partner",
}: {
  nav: NavItem[];
  user: { firstName: string; lastName: string; code: string; status: string; role: string };
  children: React.ReactNode;
  variant?: "partner" | "admin";
}) {
  const home = variant === "admin" ? "/admin" : "/espace";
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex print:!hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <Logo />
          {variant === "admin" && (
            <span className="mt-2 inline-block rounded bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              SuperAdmin
            </span>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4 text-xs text-muted">
          IBIG SARL — {new Date().getFullYear()}
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8 print:hidden">
          <Link href={home} className="font-semibold text-ink md:hidden">
            IBIG PARTNERS
          </Link>
          <div className="hidden text-sm text-muted md:block">
            Bienvenue, <span className="font-medium text-ink">{user.firstName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user.code}</p>
              {variant === "partner" && (
                <p className="text-xs text-muted">{STATUS_LABELS[user.status]}</p>
              )}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden print:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-50"
            >
              {item.icon} {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[9px] font-bold text-white">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
