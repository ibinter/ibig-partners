"use client";

import { useState, useEffect } from "react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export default function PushSubscribeButton() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !VAPID_PUBLIC) return;
    setSupported(true);
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  if (!supported) return null;

  async function toggle() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();

      if (existing) {
        await existing.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        setSubscribed(false);
      } else {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
        });
        const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: j.endpoint, keys: j.keys }),
        });
        setSubscribed(true);
      }
    } catch (e) {
      console.error("Push toggle error", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${subscribed ? "border-emerald-200 bg-emerald-50" : "border-blue-200 bg-blue-50"}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{subscribed ? "🔔" : "🔕"}</span>
        <div>
          <p className={`text-sm font-semibold ${subscribed ? "text-emerald-800" : "text-blue-800"}`}>
            {subscribed ? "Notifications push activées" : "Activer les notifications push"}
          </p>
          <p className={`text-xs ${subscribed ? "text-emerald-600" : "text-blue-600"}`}>
            {subscribed
              ? "Vous recevrez des alertes même quand l'app est fermée."
              : "Soyez alerté en temps réel pour vos ventes et commissions."}
          </p>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white transition disabled:opacity-60 ${subscribed ? "bg-slate-500 hover:bg-slate-600" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "…" : subscribed ? "Désactiver" : "Activer"}
      </button>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64   = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw      = window.atob(base64);
  const output   = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}
