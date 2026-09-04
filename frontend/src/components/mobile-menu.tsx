"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

type Lang = "fr" | "en";

const NAV = {
  fr: [
    { href: "/#branches", icon: "🏢", label: "Branches" },
    { href: "/#commissions", icon: "💰", label: "Commissions" },
    { href: "/#statuts", icon: "⭐", label: "Statuts" },
    { href: "/#espace", icon: "🖥️", label: "Espace partenaire" },
  ],
  en: [
    { href: "/en#software", icon: "🖥️", label: "Software" },
    { href: "/en#commissions", icon: "💰", label: "Commissions" },
    { href: "/en#faq", icon: "❓", label: "FAQ" },
    { href: "/en/partenaires", icon: "🏢", label: "Our partners" },
  ],
} as const;

const T = {
  fr: { open: "Ouvrir le menu", close: "Fermer le menu", signIn: "Connexion", signInHref: "/connexion", join: "Devenir Partenaire — c'est gratuit", joinHref: "/rejoindre" },
  en: { open: "Open menu", close: "Close menu", signIn: "Sign in", signInHref: "/connexion", join: "Become a Partner — it's free", joinHref: "/en/rejoindre" },
} as const;

const OVERLAY_STYLE: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99999,
  backgroundColor: "#ffffff",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
};

export function MobileMenu({ lang = "fr" }: { lang?: Lang }) {
  const [open, setOpen] = useState(false);
  const [canPortal, setCanPortal] = useState(false);
  const t = T[lang];
  const nav = NAV[lang];

  useEffect(() => { setCanPortal(true); }, []);

  const close = () => setOpen(false);

  const menu = (
    <div style={OVERLAY_STYLE}>
      {/* Header du menu */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#041B4D", fontFamily: "sans-serif" }}>
          IBIG <span style={{ color: "#FF6A00" }}>PARTNERS</span>
        </span>
        <button
          onClick={close}
          style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", cursor: "pointer" }}
          aria-label={t.close}
        >
          <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: 16 }}>
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={close}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, fontSize: 16, fontWeight: 500, color: "#1e293b", textDecoration: "none" }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* CTAs */}
      <div style={{ padding: 16, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 12 }}>
        <Link
          href={t.signInHref}
          onClick={close}
          style={{ display: "block", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", textAlign: "center", fontSize: 14, fontWeight: 600, color: "#041B4D", textDecoration: "none" }}
        >
          {t.signIn}
        </Link>
        <Link
          href={t.joinHref}
          onClick={close}
          style={{ display: "block", padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg,#FF6A00,#e55d00)", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#ffffff", textDecoration: "none" }}
        >
          {t.join}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, width: 40, height: 40, borderRadius: 12, border: "1px solid #e2e8f0", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", cursor: "pointer", padding: 8 }}
        className="flex lg:hidden"
        aria-label={t.open}
      >
        <span style={{ display: "block", height: 2, width: 24, borderRadius: 9999, background: "#041B4D" }} />
        <span style={{ display: "block", height: 2, width: 24, borderRadius: 9999, background: "#041B4D" }} />
        <span style={{ display: "block", height: 2, width: 24, borderRadius: 9999, background: "#041B4D" }} />
      </button>

      {open && canPortal && createPortal(menu, document.body)}
      {open && !canPortal && menu}
    </>
  );
}
