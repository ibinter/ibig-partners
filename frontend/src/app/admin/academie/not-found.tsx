import Link from "next/link";

export default function ModuleNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl mb-4">🎓</p>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Module introuvable</h1>
      <p className="text-sm text-slate-500 mb-6">
        Ce module n&apos;existe pas ou a été supprimé.
      </p>
      <Link
        href="/admin/academie"
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
      >
        ← Retour à l&apos;Académie
      </Link>
    </div>
  );
}
