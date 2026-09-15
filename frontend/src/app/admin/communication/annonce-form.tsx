"use client";

import { MultiImageUpload } from "@/components/multi-image-upload";
import { Button } from "@/components/ui";

export function AnnonceForm({
  action,
  partners,
}: {
  action: (fd: FormData) => Promise<void>;
  partners: { id: string; firstName: string; lastName: string; code: string }[];
}) {
  return (
    <form action={action} className="mt-4 space-y-4">
      {/* Titre */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Titre *</label>
        <input
          name="title"
          required
          placeholder="Ex : Nouveaux produits disponibles !"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Message */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Message *</label>
        <textarea
          name="body"
          required
          rows={4}
          placeholder="Rédigez votre message ici..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Images */}
      <MultiImageUpload name="imagesJson" mainName="imageUrl" label="Images illustratives" />

      {/* Lien cliquable */}
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">
          Lien associé <span className="text-xs font-normal text-muted">(optionnel)</span>
        </label>
        <input
          name="actionUrl"
          placeholder="/espace/produits  ou  https://..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Audience</label>
          <select
            name="audience"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="ALL">📢 Tous les partenaires actifs ({partners.length})</option>
            <option value="ONE">👤 Un partenaire spécifique</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Partenaire ciblé</label>
          <select name="targetId" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">— Sélectionner un partenaire —</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.code})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">Requis si audience = &quot;Un partenaire spécifique&quot;</p>
        </div>
      </div>

      <Button type="submit">Envoyer</Button>
    </form>
  );
}
