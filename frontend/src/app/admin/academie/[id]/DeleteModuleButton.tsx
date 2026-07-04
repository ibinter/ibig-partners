"use client";

import { deleteModule } from "../actions";

export function DeleteModuleButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteModule}
      onSubmit={(e) => {
        if (!confirm(`Supprimer définitivement "${title}" ?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
      >
        Supprimer ce module
      </button>
    </form>
  );
}
