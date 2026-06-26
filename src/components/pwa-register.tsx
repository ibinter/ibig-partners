"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("[PWA] Service Worker enregistré", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Échec d'enregistrement", err);
        });
    }
  }, []);

  return null;
}

// Bouton "Installer l'application" — apparaît uniquement si le navigateur
// supporte l'installation (Chrome Android, Edge, Samsung Internet…)
export function PWAInstallBanner() {
  useEffect(() => {
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.style.display = "flex";
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);

    interface BeforeInstallPromptEvent extends Event {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    }
  }, []);

  function handleInstall() {
    const banner = document.getElementById("pwa-install-banner");
    // @ts-expect-error — deferredPrompt est dans le scope du useEffect
    if (window.__ibigPWAPrompt) {
      // @ts-expect-error
      window.__ibigPWAPrompt.prompt();
    }
    if (banner) banner.style.display = "none";
  }

  return (
    <div
      id="pwa-install-banner"
      style={{ display: "none" }}
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl bg-brand-600 px-4 py-3 text-white shadow-lg print:hidden"
    >
      <img src="/icon-192.svg" alt="" className="h-8 w-8 rounded-lg" />
      <div className="text-sm">
        <p className="font-semibold">Installer IBIG PARTNERS</p>
        <p className="text-brand-100 text-xs">Accès rapide depuis votre écran d'accueil</p>
      </div>
      <button
        onClick={handleInstall}
        className="ml-2 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        Installer
      </button>
      <button
        onClick={() => {
          const b = document.getElementById("pwa-install-banner");
          if (b) b.style.display = "none";
        }}
        className="text-brand-200 hover:text-white text-lg leading-none"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
}
