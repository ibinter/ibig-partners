"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushSubscribeButton() {
  const [state, setState] = useState<"idle" | "subscribed" | "denied" | "loading" | "unsupported">("idle");
  const [dismissed, setDismissed] = useState(true); // start hidden until hydration

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ibig_push_dismissed") === "1") return;
    } catch {}
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Already subscribed — no need to show the banner, dismiss silently
        try { sessionStorage.setItem("ibig_push_dismissed", "1"); } catch {}
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
      }
      setDismissed(false);
    });
  }, []);

  function dismiss() {
    try { sessionStorage.setItem("ibig_push_dismissed", "1"); } catch {}
    setDismissed(true);
  }

  async function subscribe() {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      setState("subscribed");
    } catch {
      setState("denied");
    }
  }

  async function unsubscribe() {
    setState("loading");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    setState("idle");
  }

  if (dismissed || state === "unsupported") return null;

  if (state === "subscribed") {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={unsubscribe}
          className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
        >
          🔔 Activées
        </button>
        <button onClick={dismiss} title="Fermer" className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-[10px]">✕</button>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex items-center gap-1">
        <span className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-500">
          🔕 Bloquées
        </span>
        <button onClick={dismiss} title="Fermer" className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-[10px]">✕</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={subscribe}
        disabled={state === "loading"}
        className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
      >
        {state === "loading" ? "⏳" : "🔔 Activer"}
      </button>
      <button onClick={dismiss} title="Fermer" className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-[10px]">✕</button>
    </div>
  );
}
