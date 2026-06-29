import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export default function MerciPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-ink">Paiement réussi !</h1>
          <p className="mt-3 text-muted">
            Votre paiement a bien été traité. Vous recevrez une confirmation
            par email sous peu. Le partenaire a été crédité de sa commission.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
