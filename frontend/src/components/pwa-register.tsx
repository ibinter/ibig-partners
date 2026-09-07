"use client";
import { useEffect, useState } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

const PWA_INSTALL_KEY = "ibig_pwa_install_dismissed";

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<Event | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    try {
      if (sessionStorage.getItem(PWA_INSTALL_KEY) === "1") return;
    } catch {}

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
      setShown(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    try { sessionStorage.setItem(PWA_INSTALL_KEY, "1"); } catch {}
    setShown(false);
  }

  if (!shown || !prompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl bg-indigo-600 px-4 py-3 text-white shadow-xl sm:left-auto sm:right-4 sm:w-80">
      <div>
        <p className="text-sm font-bold">Installer l&apos;app IBIG</p>
        <p className="text-xs text-indigo-200">Accès rapide depuis votre écran d&apos;accueil</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={dismiss} className="rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:text-white">
          Plus tard
        </button>
        <button
          onClick={() => { (prompt as any).prompt?.(); dismiss(); }}
          className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
        >
          Installer
        </button>
      </div>
    </div>
  );
}

export default PWARegister;
