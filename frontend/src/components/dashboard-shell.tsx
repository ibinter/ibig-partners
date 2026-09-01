"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/site-chrome";
import { logoutAction } from "@/app/auth-actions";
import { STATUS_LABELS } from "@/lib/constants";
import { CommandPalette } from "@/components/command-palette";

/* ── Scroll-to-top + Offline indicator ── */
function FloatingWidgets() {
  const [showTop, setShowTop] = useState(false);
  const [offline, setOffline] = useState(false);
  const mainRef = useRef<Element | null>(null);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOnline  = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);

    // Observe scroll on .dash-surface
    const el = document.querySelector(".dash-surface");
    mainRef.current = el;
    if (!el) return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };

    function onScroll() { setShowTop((el as Element).scrollTop > 300); }
    el.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollTop() {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Offline banner */}
      {offline && (
        <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs text-white shadow-lg">
          <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
          Hors ligne — vérifiez votre connexion
        </div>
      )}

      {/* Scroll-to-top */}
      {showTop && (
        <button
          onClick={scrollTop}
          title="Retour en haut"
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-150 text-lg"
        >
          ↑
        </button>
      )}
    </>
  );
}

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  group?: string;
};

/* ── Icône chevron ── */
function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${collapsed ? "rotate-180" : "rotate-0"}`}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ── Navigation sidebar ── */
function SidebarNav({
  nav,
  variant,
  collapsed,
  onClose,
}: {
  nav: NavItem[];
  variant: "partner" | "admin";
  collapsed?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/espace") return pathname === href;
    return pathname.startsWith(href);
  };

  /* Regrouper les items par group */
  const groups: { label: string | null; items: NavItem[] }[] = [];
  for (const item of nav) {
    const g = item.group ?? null;
    const existing = groups.find((gr) => gr.label === g);
    if (existing) existing.items.push(item);
    else groups.push({ label: g, items: [item] });
  }

  return (
    <nav className={`flex-1 overflow-y-auto py-3 space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
      {groups.map((group, gi) => (
        <div key={gi}>
          {/* Séparateur de groupe */}
          {group.label && !collapsed && (
            <p className={`mb-1 mt-4 px-3 text-[10px] font-bold uppercase tracking-widest ${
              variant === "admin" ? "text-white/35" : "text-slate-400"
            }`}>
              {group.label}
            </p>
          )}
          {group.label && collapsed && (
            <div className={`my-2 mx-auto h-px w-6 ${variant === "admin" ? "bg-white/15" : "bg-slate-200"}`} />
          )}

          {group.items.map((item) => {
            const active = isActive(item.href);
            return collapsed ? (
              /* Mode rail : icône seule + tooltip natif */
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={`relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-base transition-all duration-150 ${
                  variant === "admin"
                    ? active
                      ? "bg-white/20 text-white shadow-inner"
                      : "text-white/60 hover:bg-white/12 hover:text-white"
                    : active
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {item.icon}
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ) : (
              /* Mode plein */
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-150 ${
                  variant === "admin"
                    ? active
                      ? "sidebar-admin-item active"
                      : "sidebar-admin-item"
                    : active
                    ? "sidebar-partner-item active"
                    : "sidebar-partner-item"
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/* ── Shell principal ── */
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
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ibig_sidebar_collapsed") === "1";
  });

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem("ibig_sidebar_collapsed", next ? "1" : "0"); } catch {}
      return next;
    });
  }

  const home = variant === "admin" ? "/admin" : "/espace";
  const initials = (user.firstName[0] ?? "") + (user.lastName[0] ?? "");

  const isAdmin = variant === "admin";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f2f5fb]">
      <CommandPalette />
      <FloatingWidgets />

      {/* ── Sidebar desktop ── */}
      <aside
        className={`hidden md:flex shrink-0 flex-col h-full overflow-hidden print:hidden transition-all duration-300 ease-in-out ${
          collapsed ? "w-[68px]" : "w-64"
        } ${isAdmin ? "sidebar-admin" : "border-r border-slate-100 bg-white shadow-sm"}`}
      >
        {/* En-tête logo / titre + bouton repli */}
        <div className={`shrink-0 flex items-center transition-all duration-300 ${
          collapsed ? "justify-center px-0 py-4 h-[64px]" : "px-4 py-4"
        } ${isAdmin ? "border-b border-white/10" : "border-b border-slate-100"}`}>
          {isAdmin ? (
            collapsed ? (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white font-extrabold text-sm shadow">
                iB
              </span>
            ) : (
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white font-extrabold text-sm shadow">
                  iB
                </span>
                <div className="overflow-hidden flex-1">
                  <p className="font-extrabold text-white tracking-tight whitespace-nowrap">
                    IBIG <span className="text-blue-300">PARTNERS</span>
                  </p>
                  <span className="inline-block rounded bg-gold-400/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-400 mt-0.5 whitespace-nowrap">
                    ⚡ SuperAdmin
                  </span>
                </div>
                <button
                  onClick={toggleCollapsed}
                  title="Réduire le menu"
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/15 hover:text-white transition-colors"
                >
                  <ChevronIcon collapsed={false} />
                </button>
              </div>
            )
          ) : collapsed ? (
            <button
              onClick={toggleCollapsed}
              title="Agrandir le menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors font-extrabold text-sm"
            >
              ›
            </button>
          ) : (
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <div className="flex-1 min-w-0"><Logo /></div>
              <button
                onClick={toggleCollapsed}
                title="Réduire le menu"
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <ChevronIcon collapsed={false} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarNav nav={nav} variant={variant} collapsed={collapsed} />

        {/* Profil utilisateur */}
        <div className={`shrink-0 transition-all duration-300 ${
          collapsed ? "p-2" : "p-4"
        } ${isAdmin ? "border-t border-white/10" : "border-t border-slate-100"}`}>
          {collapsed ? (
            /* Mode repli : juste l'avatar centré */
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${user.firstName} ${user.lastName}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold cursor-default ${
                  isAdmin ? "bg-white/20 text-white" : "bg-brand-100 text-brand-700"
                }`}
              >
                {initials}
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Déconnexion"
                  className={`rounded-lg p-1.5 text-xs transition-colors ${
                    isAdmin ? "text-white/40 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  ↩
                </button>
              </form>
            </div>
          ) : (
            <div className={`flex items-center gap-3 rounded-xl p-2 ${isAdmin ? "hover:bg-white/10" : "hover:bg-slate-50"} transition-colors`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isAdmin ? "bg-white/20 text-white" : "bg-brand-100 text-brand-700"
              }`}>
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${isAdmin ? "text-white" : "text-ink"}`}>
                  {user.firstName} {user.lastName}
                </p>
                <p className={`truncate text-xs ${isAdmin ? "text-white/50" : "text-muted"}`}>
                  {variant === "partner" ? STATUS_LABELS[user.status] : user.role}
                </p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Déconnexion"
                  className={`rounded-lg p-1.5 text-sm transition-colors ${
                    isAdmin ? "text-white/50 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  ↩
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bouton repli bas — visible uniquement en mode replié pour ré-ouvrir */}
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            title="Agrandir le menu"
            className={`shrink-0 flex items-center justify-center py-3 text-xs font-medium transition-all duration-150 ${
              isAdmin
                ? "text-white/40 hover:bg-white/10 hover:text-white border-t border-white/10"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600 border-t border-slate-100"
            }`}
          >
            <ChevronIcon collapsed={true} />
          </button>
        )}
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
      } ${isAdmin ? "sidebar-admin" : "bg-white border-r border-slate-200"}`}>
        <div className={`flex items-center justify-between px-5 py-4 shrink-0 ${isAdmin ? "border-b border-white/10" : "border-b border-slate-100"}`}>
          {isAdmin ? (
            <span className="font-extrabold text-white">IBIG <span className="text-blue-300">ADMIN</span></span>
          ) : (
            <Logo />
          )}
          <button
            onClick={() => setMobileOpen(false)}
            className={`rounded-lg p-2 text-sm ${isAdmin ? "text-white/60 hover:bg-white/10" : "text-slate-500 hover:bg-slate-100"}`}
          >
            ✕
          </button>
        </div>
        <SidebarNav nav={nav} variant={variant} onClose={() => setMobileOpen(false)} />
        <div className={`p-4 shrink-0 ${isAdmin ? "border-t border-white/10" : "border-t border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isAdmin ? "bg-white/20 text-white" : "bg-brand-100 text-brand-700"
            }`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${isAdmin ? "text-white" : "text-ink"}`}>
                {user.firstName} {user.lastName}
              </p>
              <p className={`text-xs ${isAdmin ? "text-white/50" : "text-muted"}`}>{user.code}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className={`text-xs ${isAdmin ? "text-white/50" : "text-slate-400"}`}>↩</button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 py-3 md:px-6 print:hidden shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
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
            <Link href={home} className="font-bold text-ink md:hidden">IBIG PARTNERS</Link>
            <span className="hidden text-sm text-muted md:block">
              Bonjour, <span className="font-semibold text-ink">{user.firstName}</span> 👋
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Ctrl+K hint */}
            {variant === "partner" && (
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { ctrlKey: true, key: "k", bubbles: true }))}
                className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Ouvrir la recherche"
              >
                <span>🔍</span>
                <span>Rechercher…</span>
                <kbd className="ml-1 font-mono bg-white border border-slate-200 rounded px-1 text-[10px]">Ctrl K</kbd>
              </button>
            )}
            <div className={`hidden sm:flex h-7 items-center rounded-full px-3 text-xs font-semibold ${
              isAdmin ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"
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

        <main className="dash-surface flex-1 overflow-y-auto px-4 py-7 md:px-8 md:py-9 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
