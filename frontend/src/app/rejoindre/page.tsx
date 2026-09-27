import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/site-chrome";
import { registerAction } from "../auth-actions";

export const metadata: Metadata = {
  title: "Rejoindre IBIG PARTNERS — Inscription Gratuite",
  description:
    "Rejoignez le réseau commercial IBIG PARTNERS gratuitement en 2 minutes. Accédez à 1 095+ missions, votre espace partenaire, vos liens de partage et votre kit marketing. Paiements via Mobile Money.",
  keywords: [
    "rejoindre IBIG PARTNERS", "inscription réseau commercial Afrique", "créer compte partenaire IBIG",
    "opportunités d'affaires Côte d'Ivoire", "devenir partenaire IBIG SARL", "rejoindre réseau commercial Abidjan",
  ],
  alternates: { canonical: "/rejoindre" },
  openGraph: {
    title: "Rejoindre IBIG PARTNERS — Inscription Gratuite en 2 minutes",
    description: "Devenez partenaire IBIG SARL gratuitement et commencez à générer des commissions dès aujourd'hui sur 14 logiciels, formations et services.",
    url: "/rejoindre",
  },
};
import RegisterForm from "./register-form";

export default async function RejoindrePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; parrain?: string; product?: string }>;
}) {
  const { ref, parrain, product } = await searchParams;
  const store = await cookies();
  const prefillCode = (ref || parrain || store.get("ibig_ref")?.value || "").toUpperCase();

  let sponsorName: string | null = null;
  if (prefillCode) {
    try {
      const sponsor = await prisma.user.findFirst({
        where: { code: prefillCode },
        select: { firstName: true, lastName: true },
      });
      if (sponsor) sponsorName = `${sponsor.firstName} ${sponsor.lastName}`;
    } catch (error) {
      // Une panne temporaire de la base ne doit pas empêcher l'ouverture du
      // formulaire : le nom du parrain est seulement une aide d'affichage.
      console.error("Impossible de précharger le parrain :", error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
        <Logo />
        <p className="text-xs text-slate-500">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 lg:items-start">

        {/* ── COLONNE GAUCHE : PITCH ───────────────────────────────────── */}
        <div className="space-y-7">
          {/* Badge + titre */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wide">
              🌍 Programme d&apos;affiliation IBIG PARTNERS
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl leading-tight">
              Générez des revenus en promouvant des solutions africaines.
              <span className="text-blue-600"> Gratuitement.</span>
            </h1>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Rejoignez le réseau commercial d&apos;IBIG SARL — 10 branches, 14 logiciels, formations, immobilier et plus.
              Commissions sur 3 niveaux, paiement Mobile Money.
            </p>
            {sponsorName && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5">
                <span className="text-lg">👥</span>
                <p className="text-sm text-blue-800">
                  Invité(e) par <strong>{sponsorName}</strong>{" "}
                  <span className="font-mono text-xs text-blue-500">({prefillCode})</span>
                </p>
              </div>
            )}
          </div>

          {/* Avantages clés */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { icon: "💸", title: "Commissions jusqu'à 20%", desc: "Sur vos ventes directes — les taux les plus élevés du marché." },
              { icon: "🔄", title: "3 niveaux de revenus", desc: "Gagnez aussi sur les ventes de vos filleuls et de leurs filleuls." },
              { icon: "📱", title: "Paiement Mobile Money", desc: "Orange Money, Wave, MTN MoMo dès 5 000 FCFA de commissions." },
              { icon: "🕐", title: "Cookie 90 jours", desc: "Un clic aujourd'hui = votre commission dans 3 mois." },
              { icon: "🆓", title: "100% gratuit", desc: "Zéro frais d'inscription, zéro abonnement, zéro achat obligatoire." },
              { icon: "🏢", title: "10 branches à promouvoir", desc: "Logiciels SaaS, formations, immobilier, digital et bien plus." },
            ].map((a) => (
              <div key={a.title} className="flex items-start gap-3 rounded-xl bg-white border border-slate-100 p-3 shadow-sm">
                <span className="text-xl shrink-0">{a.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{a.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Produits phares */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quelques produits à promouvoir</p>
            <div className="space-y-2">
              {[
                { name: "SCOLABY",        price: "10 000 F/mois", comm: "2 000 F/vente" },
                { name: "IBIG FLEET 360", price: "19 900 F/mois", comm: "3 980 F/vente" },
                { name: "CONSTRUIRO",     price: "15 000 F/mois", comm: "3 000 F/vente" },
                { name: "Formation Pro",  price: "250 000 F",      comm: "25 000 F/vente" },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{p.name}</span>
                  <div className="text-right">
                    <span className="text-slate-500 text-xs">{p.price}</span>
                    <span className="ml-3 font-bold text-emerald-400">{p.comm}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-slate-500">Commission N1 à 20% · 14 logiciels SaaS disponibles</p>
          </div>

          {/* Comment ça marche */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Comment ça marche ?</p>
            {[
              ["1", "Inscrivez-vous",            "Créez votre compte en 2 minutes — gratuit."],
              ["2", "Signez votre contrat",       "Lisez et signez électroniquement votre contrat de partenariat."],
              ["3", "Activez vos produits",       "Choisissez les produits à promouvoir et obtenez vos liens de tracking."],
              ["4", "Partagez & gagnez",          "Partagez, déclarez vos ventes, recevez vos commissions sur Mobile Money."],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex items-start gap-3">
                <div className="shrink-0 h-7 w-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{num}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── COLONNE DROITE : FORMULAIRE ─────────────────────────────── */}
        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl bg-white shadow-lg border border-slate-100 p-6 sm:p-8">
            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-slate-900">Créer mon compte partenaire</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gratuit · 2 minutes · Aucun engagement
                {product ? ` · Via ${product}` : ""}
              </p>
            </div>
            <RegisterForm action={registerAction} prefillCode={prefillCode} />
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            En vous inscrivant, vous serez guidé(e) pas à pas pour configurer votre espace et générer vos premières commissions.
          </p>
          <Link href="/" className="mt-2 block text-center text-xs text-slate-400 hover:underline">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
