import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { ScrollReveal } from "@/components/scroll-reveal";

export const metadata: Metadata = {
  title: "Nos Partenaires — Réseau Commercial IBIG PARTNERS",
  description:
    "Découvrez les partenaires inscrits du réseau commercial IBIG PARTNERS en Côte d'Ivoire et en Afrique. Des professionnels actifs sur 10 branches — logiciels, formations, immobilier, digital et bien plus.",
  keywords: [
    "partenaires IBIG PARTNERS", "réseau commercial Côte d'Ivoire", "partenaires commerciaux IBIG SARL",
    "réseau d'affaires Afrique", "réseau distributeurs IBIG", "opportunités commerciales Abidjan",
  ],
  alternates: { canonical: "/partenaires" },
  openGraph: {
    title: "Nos Partenaires — Réseau IBIG PARTNERS",
    description: "Rejoignez un réseau actif de partenaires qui génèrent des commissions en promouvant les services IBIG SARL en Afrique.",
    url: "/partenaires",
  },
};

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  BANK: "Banque & Finance", NGO: "ONG / Organisation", GOVERNMENT: "Institution publique",
  COMPANY: "Entreprise", UNIVERSITY: "Université / École", OTHER: "Autre partenaire",
};
const CATEGORY_ICON: Record<string, string> = {
  BANK: "🏦", NGO: "🤝", GOVERNMENT: "🏛️", COMPANY: "🏢", UNIVERSITY: "🎓", OTHER: "🌐",
};

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const AVANTAGES_CERTIFICATION = [
  { icon: "🏆", title: "Profil public vérifié", desc: "Votre nom, votre photo et votre bio apparaissent sur cette page vue par tous les visiteurs du site." },
  { icon: "🌍", title: "Visibilité panafricaine", desc: "Positionnez-vous comme un expert reconnu sur votre marché — en Afrique et dans la diaspora." },
  { icon: "🔗", title: "Lien vers votre site", desc: "Votre site web ou profil LinkedIn est mis en avant directement sur votre carte partenaire." },
  { icon: "⚡", title: "Badge Elite sur votre profil", desc: "Un badge Gold, Master ou Elite s'affiche sur votre espace et renforce votre crédibilité auprès de vos prospects." },
  { icon: "📣", title: "Recommandation officielle", desc: "IBIG SARL peut vous recommander en priorité pour des missions stratégiques et des appels d'offres." },
  { icon: "💼", title: "Accès aux missions premium", desc: "Les partenaires certifiés ont accès en priorité aux 1 095 missions disponibles, dont les plus rémunératrices." },
];

const ETAPES_CERTIFICATION = [
  { num: "01", title: "Inscrivez-vous", desc: "Créez votre compte partenaire gratuitement — 2 minutes suffisent." },
  { num: "02", title: "Atteignez le statut Gold", desc: "Générez du chiffre d'affaires et développez votre réseau jusqu'au statut Gold ou supérieur." },
  { num: "03", title: "Vérifiez votre compte", desc: "Soumettez votre pièce d'identité ou vos documents d'entreprise pour validation par IBIG SARL." },
  { num: "04", title: "Activez votre profil public", desc: "Dans votre espace, activez la visibilité publique — votre carte apparaît immédiatement sur cette page." },
];

export default async function PartenairesPage() {
  const db = prisma as any;

  let certifiedPartners: any[] = [];
  let institutional: any[] = [];
  let liveStats = { total: 0, pays: 1, missions: 1095 };

  try {
    const [cp, inst, partnerCount, paysCount, missionCount] = await Promise.all([
      db.user.findMany({
        where: { verificationStatus: "VERIFIED", publicListing: true, status: { in: ["GOLD", "MASTER", "ELITE"] }, active: true },
        select: {
          id: true, firstName: true, lastName: true, status: true,
          partnerType: true, city: true, country: true,
          photoUrl: true, bio: true, website: true,
          verification: { select: { companyName: true, legalRep: true, companyCity: true, companyCountry: true, companyEmail: true, companyWhatsapp: true, companyAddress: true, city: true, country: true } },
        },
        orderBy: [{ status: "desc" }, { firstName: "asc" }],
      }),
      db.institutionalPartner.findMany({ where: { active: true }, orderBy: [{ order: "asc" }, { name: "asc" }] }),
      db.user.count({ where: { role: "PARTNER", active: true, approved: true } }),
      db.user.findMany({ where: { role: "PARTNER", active: true }, select: { country: true }, distinct: ["country"] }),
      db.mission.count({ where: { status: "OPEN" } }),
    ]);
    certifiedPartners = cp;
    institutional = inst;
    liveStats = {
      total: partnerCount,
      pays: Math.max(paysCount.length, 1),
      missions: missionCount,
    };
  } catch (err) {
    console.error("PartenairesPage: erreur chargement", err);
  }

  const individuals = certifiedPartners.filter((p: any) => p.partnerType !== "COMPANY");
  const companies   = certifiedPartners.filter((p: any) => p.partnerType === "COMPANY");
  const hasContent  = certifiedPartners.length > 0 || institutional.length > 0;

  return (
    <>
      <SiteHeader />
      <main>

        {/* ══ HERO ══ */}
        <section className="gradient-hero py-20 text-white text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-float absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
            <div className="animate-float absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-white/5" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative mx-auto max-w-4xl px-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm mb-4">
              🌍 Réseau IBIG PARTNERS
            </span>
            <h1 className="text-3xl font-extrabold sm:text-5xl mb-4">Nos Partenaires</h1>
            <p className="max-w-2xl mx-auto text-brand-100 text-lg leading-relaxed">
              Un réseau panafricain en pleine croissance — des professionnels, des entrepreneurs
              et des entreprises qui génèrent des revenus réels en promouvant l&apos;écosystème IBIG SARL.
            </p>

            {/* Stats réelles */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
              {[
                { val: `${liveStats.total}+`, label: "Partenaires inscrits" },
                { val: `${liveStats.pays}+`,  label: "Pays représentés" },
                { val: `${liveStats.missions.toLocaleString("fr-FR")}`, label: "Missions disponibles" },
              ].map(({ val, label }) => (
                <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                  <p className="text-2xl font-extrabold sm:text-3xl">{val}</p>
                  <p className="text-xs text-brand-100 mt-1 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PARTENAIRES INSTITUTIONNELS ══ */}
        {institutional.length > 0 && (
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">Partenaires officiels</span>
                <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Partenaires institutionnels</h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted">Institutions, organisations et entreprises qui collaborent avec IBIG SARL dans le cadre de partenariats officiels.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {institutional.map((p: any) => (
                  <div key={p.id} className="card-premium hover:shadow-md transition-shadow p-5">
                    <div className="flex items-start gap-4 mb-4">
                      {p.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.logoUrl} alt={p.name} loading="lazy" decoding="async" className="h-14 w-14 rounded-xl object-contain border border-slate-100 bg-slate-50 p-1 shrink-0" />
                      ) : (
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xl shrink-0">
                          {CATEGORY_ICON[p.category] ?? "🌐"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-ink text-sm leading-tight">{p.name}</h3>
                        <span className="inline-block mt-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                          {CATEGORY_LABELS[p.category] ?? p.category}
                        </span>
                      </div>
                    </div>
                    {p.description && <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">{p.description}</p>}
                    <div className="space-y-1.5 text-xs text-muted">
                      {(p.city || p.country) && <p>📍 {[p.city, p.country].filter(Boolean).join(", ")}</p>}
                      {p.email && <p>✉️ <a href={`mailto:${p.email}`} className="text-blue-600 hover:underline">{p.email}</a></p>}
                      {p.phone && <p>📞 {p.phone}{p.phone2 ? ` · ${p.phone2}` : ""}</p>}
                      {p.website && <p>🌐 <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.website.replace(/^https?:\/\//, "")}</a></p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ ENTREPRISES PARTENAIRES ══ */}
        {companies.length > 0 && (
          <section className="py-20 bg-slate-50">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">Entreprises certifiées</span>
                <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Entreprises partenaires IBIG</h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted">Entreprises certifiées GOLD ou plus, vérifiées par IBIG SARL.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {companies.map((p: any) => {
                  const v = p.verification;
                  const sc = STATUS_COLORS[p.status];
                  return (
                    <div key={p.id} className="card-premium hover:shadow-md transition-shadow p-5">
                      <div className="flex items-start gap-4 mb-4">
                        {p.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photoUrl} alt={v?.companyName ?? p.firstName} loading="lazy" decoding="async" className="h-14 w-14 rounded-xl object-contain border border-slate-100 bg-slate-50 p-1 shrink-0" />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {(v?.companyName ?? p.firstName)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-ink text-sm leading-tight">{v?.companyName ?? `${p.firstName} ${p.lastName}`}</h3>
                          {v?.legalRep && <p className="text-xs text-muted mt-0.5">Représentant : {v.legalRep}</p>}
                          <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc?.badge ?? "bg-slate-100 text-slate-700"}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </div>
                      </div>
                      {p.bio && <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">{p.bio}</p>}
                      <div className="space-y-1.5 text-xs text-muted">
                        {(v?.companyCity || v?.companyCountry) && <p>📍 {[v.companyCity, v.companyCountry].filter(Boolean).join(", ")}</p>}
                        {v?.companyEmail && <p>✉️ <a href={`mailto:${v.companyEmail}`} className="text-blue-600 hover:underline">{v.companyEmail}</a></p>}
                        {v?.companyWhatsapp && <p>📱 {v.companyWhatsapp}</p>}
                        {p.website && <p>🌐 <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.website.replace(/^https?:\/\//, "")}</a></p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══ PARTICULIERS CERTIFIÉS ══ */}
        {individuals.length > 0 && (
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">Ambassadeurs certifiés</span>
                <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">Partenaires individuels</h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted">Partenaires Gold, Master et Elite vérifiés par IBIG SARL.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {individuals.map((p: any) => {
                  const sc = STATUS_COLORS[p.status as keyof typeof STATUS_COLORS];
                  const v = p.verification;
                  return (
                    <div key={p.id} className="card-premium hover:shadow-md transition-shadow p-5 text-center">
                      {p.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} loading="lazy" decoding="async" className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 mx-auto mb-3" />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                          {initials(p.firstName, p.lastName)}
                        </div>
                      )}
                      <h3 className="font-bold text-ink text-sm">{p.firstName} {p.lastName}</h3>
                      <span className={`inline-block mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${sc?.badge ?? "bg-slate-100 text-slate-700"}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                      {p.bio && <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">{p.bio}</p>}
                      <div className="mt-3 space-y-1 text-xs text-muted">
                        {(v?.city ?? p.city) && <p>📍 {[v?.city ?? p.city, v?.country ?? p.country].filter(Boolean).join(", ")}</p>}
                        {p.website && <p>🌐 <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.website.replace(/^https?:\/\//, "")}</a></p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══ SECTION "EN CONSTRUCTION" — attractive si pas encore de certifiés ══ */}
        {!hasContent && (
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-5xl px-4">
              <ScrollReveal animation="fade-up">
                <div className="text-center mb-14">
                  <span className="inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600 mb-4">
                    🚀 Les premiers arrivent bientôt
                  </span>
                  <h2 className="text-2xl font-extrabold text-ink sm:text-3xl mb-3">
                    Soyez parmi les premiers partenaires certifiés
                  </h2>
                  <p className="mx-auto max-w-2xl text-muted leading-relaxed">
                    Notre réseau grandit chaque jour. Les partenaires qui atteignent le statut <strong>Gold ou supérieur</strong> et vérifient leur compte apparaîtront ici — avec leur photo, leur bio et leur ville.
                    Votre profil pourrait être l&apos;un des premiers.
                  </p>
                </div>
              </ScrollReveal>

              {/* Avantages de la certification */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-16">
                {AVANTAGES_CERTIFICATION.map((a, i) => (
                  <ScrollReveal key={a.title} animation="fade-up" delay={i * 70}>
                    <div className="card-premium flex gap-4 p-5 h-full">
                      <span className="text-2xl shrink-0">{a.icon}</span>
                      <div>
                        <h3 className="font-bold text-ink text-sm mb-1">{a.title}</h3>
                        <p className="text-xs text-muted leading-relaxed">{a.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* 4 étapes */}
              <ScrollReveal animation="fade-up">
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-100 p-8">
                  <h3 className="text-center font-extrabold text-ink text-lg mb-8">Comment apparaître sur cette page ?</h3>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {ETAPES_CERTIFICATION.map((e) => (
                      <div key={e.num} className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white font-extrabold text-sm shadow-lg">
                          {e.num}
                        </div>
                        <h4 className="font-bold text-ink text-sm mb-1">{e.title}</h4>
                        <p className="text-xs text-muted leading-relaxed">{e.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <Link href="/rejoindre" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 font-bold text-white shadow-md hover:bg-brand-700 transition-all hover:-translate-y-0.5">
                      Rejoindre le programme — c&apos;est gratuit →
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* ══ BANDEAU RÉSEAU EN CHIFFRES ══ */}
        <section className="bg-slate-900 py-14 text-white">
          <div className="mx-auto max-w-5xl px-4">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-10">
                <h2 className="text-xl font-extrabold sm:text-2xl">Le réseau IBIG en chiffres</h2>
                <p className="mt-2 text-slate-400 text-sm">Des réalités, pas des promesses.</p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { val: `${liveStats.total}+`, label: "Partenaires inscrits", icon: "👥" },
                { val: `${liveStats.pays}+`,  label: "Pays représentés",  icon: "🌍" },
                { val: "10",                   label: "Branches du groupe", icon: "🏢" },
                { val: `${liveStats.missions.toLocaleString("fr-FR")}`, label: "Missions disponibles", icon: "🎯" },
              ].map(({ val, label, icon }) => (
                <ScrollReveal key={label} animation="scale-in">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-2xl font-extrabold text-amber-400">{val}</p>
                    <p className="mt-1 text-xs text-slate-400">{label}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ══ */}
        <section className="gradient-hero py-16 text-white text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-2xl font-extrabold mb-3">
              {hasContent ? "Vous souhaitez apparaître ici ?" : "Lancez-vous dès aujourd'hui"}
            </h2>
            <p className="text-brand-100 text-sm mb-6 leading-relaxed">
              {hasContent
                ? "Atteignez le statut Gold, vérifiez votre compte et activez votre profil public dans votre espace partenaire."
                : "Plus de 1 095 missions disponibles sur 10 branches. Inscription gratuite, paiement en 7 jours via Mobile Money."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/rejoindre" className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 shadow transition-all hover:-translate-y-0.5">
                Devenir partenaire — gratuit →
              </Link>
              <Link href="/connexion" className="rounded-xl border border-white/30 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
                Se connecter
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
