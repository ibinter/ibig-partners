"use client";

import { Icon, type IconName } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import Link from "next/link";

interface TrainingTip {
  icon: IconName;
  title: string;
  description: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  levelColor: string;
}

const TRAINING_TIPS: TrainingTip[] = [
  {
    icon: "users",
    title: "Identifiez votre cible",
    description: "Commencez par votre entourage : écoles pour Scolaby, commerçants pour Gescomxel, agences immo pour Lokativo. Chaque logiciel a son public naturel.",
    level: "Débutant",
    levelColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "puzzle",
    title: "Utilisez les argumentaires fournis",
    description: "Nos kits marketing contiennent des messages WhatsApp, emails et visuels testés. Copiez-les et personnalisez avec le nom du prospect.",
    level: "Débutant",
    levelColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "target",
    title: "Proposez une démo, pas un achat",
    description: "Ne vendez pas directement. Invitez à découvrir le logiciel gratuitement. Un prospect qui teste achète dans 70% des cas.",
    level: "Intermédiaire",
    levelColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "network",
    title: "Construisez votre équipe tôt",
    description: "N'attendez pas d'avoir 50 ventes. Parrainez dès votre 3ème vente. Vos filleuls N2 et N3 génèrent des revenus passifs.",
    level: "Intermédiaire",
    levelColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "chart",
    title: "Suivez vos statistiques",
    description: "Consultez votre dashboard chaque jour. Identifiez quels produits et quels messages convertissent le mieux, puis doublez la mise.",
    level: "Intermédiaire",
    levelColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: "trophy",
    title: "Spécialisez-vous sur 2 produits max",
    description: "Les meilleurs affiliés maîtrisent 1 ou 2 logiciels à fond. Devenez l'expert de votre niche et vos prospects vous feront confiance.",
    level: "Avancé",
    levelColor: "bg-violet-100 text-violet-700",
  },
];

interface ModulePreview {
  icon: IconName;
  title: string;
  duration: string;
  type: string;
}

const ACADEMY_MODULES: ModulePreview[] = [
  { icon: "graduation", title: "Les bases de l'affiliation IBIG", duration: "15 min", type: "Vidéo" },
  { icon: "puzzle", title: "Maîtriser les argumentaires de vente", duration: "20 min", type: "Article" },
  { icon: "network", title: "Construire et animer son réseau", duration: "25 min", type: "Vidéo" },
  { icon: "coins", title: "Comprendre les commissions multi-niveaux", duration: "10 min", type: "Article" },
  { icon: "target", title: "Techniques de prospection WhatsApp", duration: "30 min", type: "Vidéo" },
  { icon: "chart", title: "Analyser ses performances et optimiser", duration: "20 min", type: "Article" },
];

export function AffiliateTraining() {
  return (
    <section id="formation" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="label-caps inline-block rounded-full px-4 py-1.5 bg-violet-50 text-violet-600">
              Formation Affiliés
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Devenez un pro de la vente
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Pas besoin d&apos;expérience commerciale. Notre académie vous guide pas à pas
              pour réussir, du premier message au réseau à 3 niveaux.
            </p>
          </div>
        </ScrollReveal>

        {/* Tips section */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRAINING_TIPS.map((tip, i) => (
            <ScrollReveal key={tip.title} animation="fade-up" delay={i * 80}>
              <div className="card-premium group h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 transition-transform group-hover:scale-110">
                    <Icon name={tip.icon} className="h-5 w-5" />
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${tip.levelColor}`}>
                    {tip.level}
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-ink">{tip.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tip.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Academy modules preview */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-16">
            <h3 className="text-center text-xl font-extrabold text-ink sm:text-2xl">
              <Icon name="graduation" className="inline h-6 w-6 text-brand-600 mr-2" />
              Académie IBIG — Modules disponibles
            </h3>
            <p className="mt-2 text-center text-muted">
              Accédez à l&apos;intégralité des formations depuis votre espace partenaire.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACADEMY_MODULES.map((mod, i) => (
            <ScrollReveal key={mod.title} animation="scale-in" delay={i * 60}>
              <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name={mod.icon} className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{mod.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span>{mod.type}</span>
                    <span className="text-slate-300">·</span>
                    <span>{mod.duration}</span>
                  </div>
                </div>
                <Icon name="trending" className="h-4 w-4 text-slate-300 shrink-0" />
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/rejoindre"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl"
            >
              S&apos;inscrire pour accéder aux formations
              <Icon name="graduation" className="h-4 w-4" />
            </Link>
            <p className="text-sm text-muted">
              100% gratuit · Accessible dès l&apos;inscription
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
