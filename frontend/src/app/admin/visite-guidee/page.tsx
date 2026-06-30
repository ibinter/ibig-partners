/**
 * Page de prévisualisation de la visite guidée (SUPERADMIN uniquement)
 * Permet à l'admin de voir la visite guidée telle qu'un nouvel affilié la voit.
 */
import { requireAdmin } from "@/lib/auth";
import TourPreview from "./tour-preview";

export const dynamic = "force-dynamic";

export default async function VisiteGuideePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visite guidée — Prévisualisation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Aperçu de la visite guidée affichée aux nouveaux affiliés lors de leur première connexion.
        </p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm text-blue-800">
        <strong>Comment fonctionne la visite guidée :</strong>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Elle s'affiche automatiquement 0,8 secondes après la première connexion d'un affilié.</li>
          <li>Elle est stockée dans le localStorage du navigateur (<code>ibig_tour_v2_done</code>).</li>
          <li>Elle ne réapparaît qu'une seule fois — sauf si l'affilié efface son localStorage.</li>
          <li>Elle ne s'affiche PAS aux comptes SUPERADMIN ou ADMIN.</li>
        </ul>
      </div>

      <TourPreview />
    </div>
  );
}
