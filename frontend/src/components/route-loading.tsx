/**
 * Écran de chargement générique pour les pages de l'espace.
 * Affiché INSTANTANÉMENT par Next.js pendant le rendu serveur d'une page
 * (requêtes base), pour un retour visuel immédiat au clic — au lieu d'une page
 * figée qui donne l'impression qu'il faut « cliquer plus fort ».
 */
export function RouteLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 sm:p-6" aria-busy="true" aria-live="polite">
      {/* En-tête */}
      <div className="space-y-3">
        <div className="h-7 w-52 rounded-lg bg-slate-200" />
        <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
      </div>

      {/* Rangée de tuiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="h-4 w-24 rounded bg-slate-100" />
            <div className="mt-3 h-8 w-20 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Bloc contenu */}
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-slate-200" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteLoading;
