"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard",           href: "/espace",             icon: "📊", group: "Navigation" },
  { label: "Analytics",           href: "/espace/analytics",   icon: "📈", group: "Navigation" },
  { label: "Classement",          href: "/espace/classement",  icon: "🏆", group: "Navigation" },
  { label: "Simulateur de gains", href: "/espace/simulateur",  icon: "🧮", group: "Navigation" },
  { label: "Guide démarrage",     href: "/espace/bienvenue",   icon: "🚀", group: "Navigation" },
  { label: "Mes Produits",        href: "/espace/produits",    icon: "🧩", group: "Mon activité" },
  { label: "Mes Liens",           href: "/espace/liens",       icon: "🔗", group: "Mon activité" },
  { label: "Mon Réseau",          href: "/espace/reseau",      icon: "🌳", group: "Mon activité" },
  { label: "Mes Prospects",       href: "/espace/prospects",   icon: "📇", group: "Mon activité" },
  { label: "Déclarer une vente",  href: "/espace/ventes",      icon: "📝", group: "Mon activité" },
  { label: "Mes Opportunités B2B", href: "/espace/opportunites", icon: "💼", group: "Mon activité" },
  { label: "Mes Commissions",     href: "/espace/commissions", icon: "💰", group: "Revenus" },
  { label: "Mes Paiements",       href: "/espace/paiements",   icon: "🏦", group: "Revenus" },
  { label: "Académie IBIG",       href: "/espace/academie",    icon: "🎓", group: "Formation" },
  { label: "Coach IA",            href: "/espace/coach",       icon: "✨", group: "Formation" },
  { label: "Messages",            href: "/espace/chat",        icon: "💬", group: "Formation" },
  { label: "Mes Badges",          href: "/espace/badges",      icon: "🏅", group: "Formation" },
  { label: "Kit Marketing",       href: "/espace/kit",         icon: "🎨", group: "Ressources" },
  { label: "Notifications",       href: "/espace/notifications",icon: "🔔", group: "Compte" },
  { label: "Mon Profil",          href: "/espace/profil",      icon: "⚙️", group: "Compte" },
  { label: "Support",             href: "/espace/support",     icon: "🎫", group: "Compte" },
  { label: "Vérification KYC",    href: "/espace/verification",icon: "🔐", group: "Compte" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Ctrl+K / Cmd+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS;
    const q = query.toLowerCase();
    return NAV_ITEMS.filter(
      (n) => n.label.toLowerCase().includes(q) || n.group.toLowerCase().includes(q)
    );
  }, [query]);

  // Reset cursor when results change
  useEffect(() => { setCursor(0); }, [filtered.length]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      const item = filtered[cursor];
      if (item) navigate(item.href);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <span className="text-slate-400 shrink-0">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher une page…"
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500">
            Échap
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-400">Aucun résultat</p>
          ) : (
            (() => {
              let globalIdx = -1;
              const grouped: Record<string, typeof filtered> = {};
              for (const item of filtered) {
                if (!grouped[item.group]) grouped[item.group] = [];
                grouped[item.group].push(item);
              }
              return Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {group}
                  </p>
                  {items.map((item) => {
                    globalIdx++;
                    const idx = globalIdx;
                    const isActive = cursor === idx;
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setCursor(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                        {isActive && (
                          <kbd className="ml-auto text-[10px] font-mono text-blue-400 bg-blue-50 rounded px-1.5 py-0.5 border border-blue-100">
                            ↵
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-4 text-[10px] text-slate-400">
          <span><kbd className="font-mono bg-slate-100 rounded px-1">↑↓</kbd> naviguer</span>
          <span><kbd className="font-mono bg-slate-100 rounded px-1">↵</kbd> ouvrir</span>
          <span><kbd className="font-mono bg-slate-100 rounded px-1">Échap</kbd> fermer</span>
        </div>
      </div>
    </div>
  );
}
