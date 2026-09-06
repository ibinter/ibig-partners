import { requireUser } from "@/lib/auth";

export default async function ExportPage() {
  await requireUser();

  const exports = [
    { type: "ventes", label: "Mes Ventes", icon: "📝", desc: "Toutes vos ventes déclarées" },
    { type: "commissions", label: "Mes Commissions", icon: "💰", desc: "Historique de toutes vos commissions" },
    { type: "prospects", label: "Mes Prospects", icon: "📇", desc: "Liste de vos prospects et leur statut" },
    { type: "reseau", label: "Mon Réseau", icon: "🌳", desc: "Tous vos filleuls directs" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Export de données</h1>
        <p className="text-sm text-gray-500 mt-1">Téléchargez vos données au format CSV (compatible Excel)</p>
      </div>
      <div className="grid gap-4">
        {exports.map((ex) => (
          <div key={ex.type} className="rounded-2xl border bg-white dark:bg-gray-900 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{ex.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{ex.label}</p>
                <p className="text-xs text-gray-500">{ex.desc}</p>
              </div>
            </div>
            <a
              href={`/api/espace/export?type=${ex.type}`}
              download
              className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              ⬇ CSV
            </a>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">Les données sont exportées en temps réel depuis votre compte.</p>
    </div>
  );
}
