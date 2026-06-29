"use client";

import { useEffect, useState } from "react";

/* ── Types ── */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_BANNER_DISMISSED_KEY = "ibig_pwa_install_banner_dismissed";

declare global {
  interface Window {
    __ibigPWAPrompt?: BeforeInstallPromptEvent;
  }
}

/* ── Enregistrement du Service Worker ── */
export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("[PWA] SW enregistré", reg.scope))
        .catch((err) => console.warn("[PWA] SW échec", err));
    }
  }, []);

  return null;
}

/* ── Bannière d'installation ── */
export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    /* Masquer le bandeau si l'app est déjà installée */
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    if (window.localStorage.getItem(INSTALL_BANNER_DISMISSED_KEY) === "1") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setPrompt(evt);
      setVisible(true);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    window.localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setVisible(false);
    setPrompt(null);
  }

  function handleDismiss() {
    window.localStorage.setItem(INSTALL_BANNER_DISMISSED_KEY, "1");
    setVisible(false);
    setPrompt(null);
  }

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-brand-600 px-4 py-3 text-white shadow-xl print:hidden animate-fade-up max-w-sm w-[calc(100%-2rem)]">
      <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Installer IBIG PARTNERS</p>
        <p className="text-brand-200 text-xs">Accès rapide depuis votre écran d'accueil</p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
      >
        Installer
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-brand-300 hover:text-white text-xl leading-none"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}
