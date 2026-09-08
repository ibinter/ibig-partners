import { Metadata } from "next";
import EnterpriseRegisterForm from "./enterprise-register-form";
import { registerEnterpriseAction } from "@/app/auth-actions";

export const metadata: Metadata = {
  title: "Espace Entreprise — IBIG PARTNERS",
  description: "Publiez vos opportunités B2B et accédez au réseau de partenaires qualifiés IBIG.",
};

export default function EntrepriseRejoindrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Logo + titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
              I
            </div>
            <span className="text-2xl font-black text-white tracking-tight">IBIG PARTNERS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Espace Entreprise</h1>
          <p className="text-blue-200 text-base">
            Confiez vos opportunités B2B à notre réseau de partenaires qualifiés.<br />
            Résultats garantis — vous ne payez que sur résultat.
          </p>
        </div>

        {/* Avantages */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "🤝", label: "Réseau qualifié" },
            { icon: "💰", label: "Commission au résultat" },
            { icon: "🔒", label: "Totalement confidentiel" },
          ].map(({ icon, label }) => (
            <div key={label} className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 px-3 py-3 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xs font-semibold text-white/80">{label}</p>
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <div className="rounded-3xl bg-white shadow-2xl p-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">Créer un compte entreprise</h2>
          <EnterpriseRegisterForm action={registerEnterpriseAction} />
          <p className="text-center text-xs text-slate-400 mt-6">
            Déjà un compte ?{" "}
            <a href="/connexion" className="text-blue-600 font-semibold hover:underline">Se connecter</a>
          </p>
        </div>
      </div>
    </main>
  );
}
