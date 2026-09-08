import { requireEnterprise } from "@/lib/auth";
import Link from "next/link";
import { logoutAction } from "@/app/auth-actions";

export default async function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  const user = await requireEnterprise();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/entreprise" className="flex items-center gap-2 font-black text-slate-900 text-lg tracking-tight">
              <span className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">I</span>
              <span className="hidden sm:block">IBIG <span className="text-blue-600">Entreprise</span></span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <Link href="/entreprise" className="rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Tableau de bord
              </Link>
              <Link href="/entreprise/opportunites" className="rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Mes opportunités
              </Link>
              <Link href="/entreprise/publier" className="rounded-xl px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
                + Publier
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{(user as any).orgName ?? `${user.firstName} ${user.lastName}`}</p>
              <p className="text-[10px] text-slate-400 font-mono">{user.code}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 transition">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Bandeau "compte en attente de validation" */}
      {!(user as any).approved && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-amber-800">
            <span>⏳</span>
            <span><strong>Votre compte est en cours de validation</strong> par l'équipe IBIG. Vous pouvez préparer vos opportunités dès maintenant.</span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
