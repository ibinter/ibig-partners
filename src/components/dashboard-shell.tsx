"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/site-chrome";
import { logoutAction } from "@/app/auth-actions";
import { STATUS_LABELS } from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  group?: string;
};

function SidebarNav({
  nav,
  variant,
  onClose,
}: {
  nav: NavItem[];
  variant: "partner" | "admin";
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/espace") return pathname === href;
    return pathname.startsWith(href);
  };

  const itemClass = (href: string) =>
    variant === "admin"
      ? `sidebar-admin-item flex items-center gap-3 px-3 py-2.5 text-sm ${isActive(href) ? "active" : ""}`
      : `sidebar-partner-item flex items-center gap-3 px-3 py-2.5 text-sm ${isActive(href) ? "active" : ""}`;

  // Regrouper les items par group
  const groups: { label: string | null; items: NavItem[] }[] = [];
  for (const item of nav) {
    const g = item.group ?? null;
    const existing = groups.find((gr) => gr.label === g);
    if (existing) existing.items.push(item);
    else groups.push({ label: g, items: [item] });
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className={`mb-1 mt-4 px-3 text-[10px] font-bold uppercase tracking-widest ${
              variant === "admin" ? "text-white/35" : "text-slate-400"
            }`}>
              {group.label}
            </p>
          )}
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={itemClass(item.href)}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const home = variant === "admin" ? "/admin" : "/espace";
  const initials = (user.firstName[0] ?? "") + (user.lastName[0] ?? "");

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar desktop ── */}
      <aside className={`hidden md:flex w-64 shrink-0 flex-col sticky top-0 h-screen overflow-hidden print:hidden ${
        variant === "admin" ? "sidebar-admin" : "border-r border-slate-200 bg-white"
      }`}>

        {/* Logo */}
        <div className={`px-5 py-5 shrink-0 ${variant === "admin" ? "border-b border-white/10" : "border-b border-slate-100"}`}>
          {variant === "admin" ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white font-extrabold text-sm shadow">
                iB
              </span>
              <div>
                <p className="font-extrabold text-white tracking-tight">IBIG <span className="text-blue-300">PARTNERS</span></p>
                <span className="inline-block rounded bg-gold-400/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-400 mt-0.5">
                  ⚡ SuperAdmin
                </span>
              </div>
            </div>
          ) : (
            <Logo />
          )}
        </div>

        {/* Nav scrollable */}
        <SidebarNav nav={nav} variant={variant} />

        {/* Profil utilisateur */}
        <div className={`shrink-0 p-4 ${variant === "admin" ? "border-t border-white/10" : "border-t border-slate-100"}`}>
          <div className={`flex items-center gap-3 rounded-xl p-2 ${variant === "admin" ? "hover:bg-white/10" : "hover:bg-slate-50"} transition-colors`}>
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              variant === "admin" ? "bg-white/20 text-white" : "bg-brand-100 text-brand-700"
            }`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${variant === "admin" ? "text-white" : "text-ink"}`}>
                {user.firstName} {user.lastName}
              </p>
              <p className={`truncate text-xs ${variant === "admin" ? "text-white/50" : "text-muted"}`}>
                {variant === "partner" ? STATUS_LABELS[user.status] : user.role}
              </p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Déconnexion"
                className={`rounded-lg p-1.5 text-sm transition-colors ${
                  variant === "admin" ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                ↩
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar mobile (drawer) ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 md:hidden print:hidden ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${variant === "admin" ? "sidebar-admin" : "bg-white border-r border-slate-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 shrink-0 ${variant === "admin" ? "border-b border-white/10" : "border-b border-slate-100"}`}>
          {variant === "admin" ? (
            <span className="font-extrabold text-white">IBIG <span className="text-blue-300">ADMIN</span></span>
          ) : (
            <Logo />
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className={`rounded-lg p-2 text-sm ${variant === "admin" ? "text-white/60 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}
          >
            ✕
          </button>
        </div>
        <SidebarNav nav={nav} variant={variant} onClose={() => setMobileOpen(false)} />
        <div className={`p-4 shrink-0 ${variant === "admin" ? "border-t border-white/10" : "border-t border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              variant === "admin" ? "bg-white/20 text-white" : "bg-brand-100 text-brand-700"
            }`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${variant === "admin" ? "text-white" : "text-ink"}`}>
                {user.firstName} {user.lastName}
              </p>
              <p className={`text-xs ${variant === "admin" ? "text-white/50" : "text-muted"}`}>
                {user.code}
              </p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className={`text-xs ${variant === "admin" ? "text-white/50" : "text-slate-400"}`}>↩</button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3 md:px-8 print:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex flex-col gap-1 p-2 rounded-lg hover:bg-slate-100 md:hidden"
              aria-label="Ouvrir le menu"
            >
              <span className="block h-0.5 w-5 rounded bg-slate-600" />
              <span className="block h-0.5 w-5 rounded bg-slate-600" />
              <span className="block h-0.5 w-5 rounded bg-slate-600" />
            </button>
            <Link href={home} className="font-bold text-ink md:hidden">
              IBIG PARTNERS
            </Link>
            <span className="hidden text-sm text-muted md:block">
              Bonjour, <span className="font-semibold text-ink">{user.firstName}</span> 👋
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex h-7 items-center rounded-full px-3 text-xs font-semibold ${
              variant === "admin"
                ? "bg-brand-50 text-brand-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {user.code}
            </div>
            {variant === "partner" && (
              <span className="hidden sm:inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {STATUS_LABELS[user.status]}
              </span>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <form action={logoutAction}>
              <button type="submit" className="hidden sm:block rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 transition-colors">
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
