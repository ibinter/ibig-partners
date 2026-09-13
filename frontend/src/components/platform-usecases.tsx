import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";

const USECASES = [
  {
    emoji: "🏠",
    title: "Mettre un bien immobilier en vente ou en location",
    desc: "Appartement, maison, terrain, immeuble — publiez votre annonce et notre réseau de partenaires IBIG IMMO TRUST la diffuse immédiatement auprès d'acheteurs et locataires qualifiés.",
    cta: "Déposer une annonce immo",
    href: "/entreprise/rejoindre",
    color: "from-violet-500 to-purple-700",
    chip: "bg-violet-50 text-violet-700",
  },
  {
    emoji: "📦",
    title: "Vendre ou louer vos biens mobiliers",
    desc: "Matériel de bureau, équipements professionnels, véhicules, mobilier — mettez vos biens en vente ou en location et touchez des acheteurs sérieux via notre réseau.",
    cta: "Publier une annonce",
    href: "/entreprise/rejoindre",
    color: "from-emerald-500 to-teal-600",
    chip: "bg-emerald-50 text-emerald-700",
  },
  {
    emoji: "🤝",
    title: "Chercher des partenaires commerciaux",
    desc: "Vous cherchez des distributeurs, agents commerciaux, revendeurs ou co-traitants ? Publiez votre opportunité et accédez à un réseau de +200 partenaires actifs en Afrique.",
    cta: "Trouver des partenaires",
    href: "/entreprise/rejoindre",
    color: "from-brand-500 to-brand-700",
    chip: "bg-brand-50 text-brand-700",
  },
  {
    emoji: "💼",
    title: "Vendre vos biens et services",
    desc: "Confiez la promotion de vos produits ou services à notre réseau d'affiliés. Ils vendent pour vous sur commission — vous ne payez que si une vente est conclue.",
    cta: "Faire vendre mes produits",
    href: "/entreprise/rejoindre",
    color: "from-amber-500 to-orange-600",
    chip: "bg-amber-50 text-amber-700",
  },
  {
    emoji: "🎯",
    title: "Chercher des clients",
    desc: "Accédez à un flux de prospects qualifiés générés par notre réseau de partenaires terrain. Matching par secteur, zone géographique et profil client.",
    cta: "Trouver des clients",
    href: "/entreprise/rejoindre",
    color: "from-indigo-500 to-blue-700",
    chip: "bg-indigo-50 text-indigo-700",
  },
  {
    emoji: "💰",
    title: "Générer des revenus en tant que partenaire affilié",
    desc: "Inscrivez-vous gratuitement, choisissez vos produits à promouvoir et percevez vos commissions par Mobile Money ou virement sous 7 jours.",
    cta: "Devenir partenaire — gratuit",
    href: "/rejoindre",
    color: "from-rose-500 to-pink-600",
    chip: "bg-rose-50 text-rose-700",
  },
];

export function PlatformUsecases() {
  return (
    <section id="que-faire" className="bg-slate-50 py-16 sm:py-20 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <span className="label-caps inline-block rounded-full bg-brand-50 px-4 py-1.5 text-brand-600">
              Une plateforme, mille usages
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Que pouvez-vous faire sur IBIG PARTNERS ?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Que vous soyez particulier, entrepreneur ou entreprise — IBIG PARTNERS est
              la plateforme panafricaine qui connecte vendeurs, acheteurs, partenaires et clients.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {USECASES.map((u, i) => (
            <ScrollReveal key={u.title} animation="fade-up" delay={i * 70}>
              <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                {/* Barre colorée */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${u.color}`} />

                <div className="flex flex-1 flex-col p-6 gap-4">
                  {/* Icône + titre */}
                  <div className="flex items-start gap-4">
                    <span className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${u.chip}`}>
                      {u.emoji}
                    </span>
                    <h3 className="font-extrabold text-ink leading-snug">{u.title}</h3>
                  </div>

                  {/* Description */}
                  <p className="flex-1 text-sm leading-relaxed text-muted">{u.desc}</p>

                  {/* CTA */}
                  <Link
                    href={u.href}
                    className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${u.color} px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    {u.cta} →
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Bandeau bas */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-6 text-center text-white">
            <p className="text-lg font-extrabold">
              Tout ça, sur une seule plateforme — gratuite à l&apos;inscription
            </p>
            <p className="mt-2 text-sm text-brand-100">
              Particuliers · Entrepreneurs · PME · ONG · Diaspora · Entreprises multinationales
            </p>
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/rejoindre"
                className="rounded-xl bg-white px-7 py-3 font-bold text-brand-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Créer mon compte — Gratuit →
              </Link>
              <Link
                href="/entreprise/rejoindre"
                className="rounded-xl border border-white/30 bg-white/10 px-7 py-3 font-bold text-white transition-all hover:bg-white/20"
              >
                Espace Entreprise →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
