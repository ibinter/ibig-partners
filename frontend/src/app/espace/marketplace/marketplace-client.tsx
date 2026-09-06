"use client";
import { useState, useTransition } from "react";
import { createService, deleteService } from "./actions";

const CATEGORIES = ["Consulting", "Formation", "Marketing", "Tech", "Vente", "Juridique", "Finance", "Autre"];

export default function MarketplaceClient({
  myServices,
  allServices,
  userId,
}: {
  myServices: any[];
  allServices: any[];
  userId: string;
}) {
  const [tab, setTab] = useState<"browse" | "mine" | "add">("browse");
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState("Tous");

  const cats = ["Tous", ...CATEGORIES];
  const filtered = filter === "Tous" ? allServices : allServices.filter((s) => s.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["browse", "mine", "add"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"}`}>
            {t === "browse" ? "🛒 Explorer" : t === "mine" ? `📦 Mes services (${myServices.length})` : "➕ Proposer un service"}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                className={`rounded-lg px-3 py-1 text-xs font-medium ${filter === c ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                {c}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Aucun service dans cette catégorie pour l&apos;instant.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((s: any) => (
                <div key={s.id} className="rounded-2xl border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-xs text-gray-500">{s.partner?.firstName} {s.partner?.lastName} · {s.partner?.code}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-xs font-medium px-2 py-0.5">{s.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{s.description}</p>
                  <p className="text-sm font-bold text-emerald-600">{s.price > 0 ? `${s.price.toLocaleString()} ${s.currency}` : "Gratuit / Sur devis"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "mine" && (
        <div className="space-y-3">
          {myServices.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Vous n&apos;avez pas encore proposé de service.</p>}
          {myServices.map((s: any) => (
            <div key={s.id} className="rounded-2xl border p-4 flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-xs text-gray-500">{s.category} · {s.price > 0 ? `${s.price.toLocaleString()} ${s.currency}` : "Sur devis"}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{s.description}</p>
              </div>
              <form action={async () => { startTransition(() => deleteService(s.id, userId)); }}>
                <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium">Supprimer</button>
              </form>
            </div>
          ))}
        </div>
      )}

      {tab === "add" && (
        <form action={createService} className="space-y-4 max-w-md">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <label className="block text-sm font-medium mb-1">Titre du service *</label>
            <input name="title" required className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="ex: Coaching vente B2B" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea name="description" required rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Décrivez votre service..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie *</label>
              <select name="category" required className="w-full rounded-xl border px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prix (FCFA, 0 = devis)</label>
              <input name="price" type="number" min="0" defaultValue="0" className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={isPending} className="rounded-xl bg-indigo-600 text-white px-6 py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
            Publier le service
          </button>
        </form>
      )}
    </div>
  );
}
