"use client";

interface Option { val: string; label: string }

export function MonthSelector({ options, selected }: { options: Option[]; selected: string }) {
  return (
    <form className="flex flex-wrap items-center gap-3">
      <label className="text-sm font-semibold text-slate-700">Relevé du mois :</label>
      <select
        name="mois"
        defaultValue={selected}
        onChange={(e) => {
          window.location.href = `/espace/paiements/releve?mois=${e.target.value}`;
        }}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-400"
      >
        {options.map((o) => (
          <option key={o.val} value={o.val}>{o.label}</option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Afficher
      </button>
    </form>
  );
}
