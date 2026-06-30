"use client";
import { useEffect, useState } from "react";

/**
 * Toast event "célébration" — affiché lors d'événements importants :
 * - Nouvelle vente confirmée
 * - Nouveau filleul N1
 * - Paiement reçu
 * - Badge débloqué
 *
 * Vérifie en background toutes les 60s les notifications non lues
 * et déclenche un toast premium avec confettis.
 */

interface Notif {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export function CelebrationToaster() {
  const [active, setActive] = useState<Notif | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Charger les IDs déjà vus
    const stored = localStorage.getItem("ibig_seen_notifs");
    if (stored) {
      try {
        setSeen(new Set(JSON.parse(stored)));
      } catch {}
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function check() {
      try {
        const res = await fetch("/api/notifications/recent");
        if (!res.ok) return;
        const data: { notifs: Notif[] } = await res.json();
        const newOne = (data.notifs || []).find((n) => !seen.has(n.id));
        if (newOne) {
          setActive(newOne);
          // Confettis pour ventes/paiements
          if (/vente|paiement|filleul|badge|💰|🎉/i.test(newOne.title + newOne.body)) {
            triggerConfetti();
          }
          const nextSeen = new Set(seen);
          nextSeen.add(newOne.id);
          setSeen(nextSeen);
          localStorage.setItem("ibig_seen_notifs", JSON.stringify([...nextSeen].slice(-50)));
        }
      } catch {}
    }

    check();
    timer = setInterval(check, 60000); // toutes les 60s
    return () => clearInterval(timer);
  }, [seen]);

  // Auto-dismiss après 8 secondes
  useEffect(() => {
    if (!active) return;
    const dismissTimer = setTimeout(() => setActive(null), 8000);
    return () => clearTimeout(dismissTimer);
  }, [active]);

  if (!active) return null;

  return (
    <div
      data-testid="celebration-toast"
      className="fixed top-20 right-4 sm:right-5 z-30 max-w-xs sm:max-w-sm animate-slide-left"
    >
      <div className="card-premium border-2 border-emerald-300 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            🎉
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink leading-tight">{active.title}</p>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{active.body}</p>
          </div>
          <button
            onClick={() => setActive(null)}
            className="shrink-0 text-slate-400 hover:text-slate-700 text-sm"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function triggerConfetti() {
  if (typeof window === "undefined") return;
  const colors = ["#0b5fff", "#f5b73d", "#10b981", "#ef4444", "#8b5cf6"];
  const count = 80;
  const container = document.createElement("div");
  container.style.cssText = `position:fixed;pointer-events:none;top:0;left:0;right:0;bottom:0;z-index:9999;overflow:hidden`;
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const size = 5 + Math.random() * 8;
    piece.style.cssText = `position:absolute;width:${size}px;height:${size * 0.4}px;background:${colors[i % colors.length]};top:-10px;left:${Math.random() * 100}%;transform:rotate(${Math.random() * 360}deg);border-radius:2px`;
    piece.animate(
      [
        { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate3d(${(Math.random() - 0.5) * 240}px, ${window.innerHeight + 30}px, 0) rotate(${720 + Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 2400 + Math.random() * 1500, easing: "cubic-bezier(.2,.6,.4,1)" }
    ).onfinish = () => piece.remove();
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 4500);
}
