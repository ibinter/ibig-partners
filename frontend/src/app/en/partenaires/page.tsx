import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Partners — IBIG PARTNERS",
  description:
    "Discover our active certified partners and our institutional partners. Together, we are building tomorrow's economic ecosystem.",
  alternates: {
    canonical: "https://ibigpartners.com/en/partenaires",
    languages: {
      fr: "https://ibigpartners.com/partenaires",
      en: "https://ibigpartners.com/en/partenaires",
      "x-default": "https://ibigpartners.com/partenaires",
    },
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  BANK:       "Banking & Finance",
  NGO:        "NGO / Organization",
  GOVERNMENT: "Public institution",
  COMPANY:    "Company",
  UNIVERSITY: "University / School",
  OTHER:      "Other partner",
};

const CATEGORY_ICON: Record<string, string> = {
  BANK: "🏦", NGO: "🤝", GOVERNMENT: "🏛️", COMPANY: "🏢", UNIVERSITY: "🎓", OTHER: "🌐",
};

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default async function PartnersPage() {
  const db = prisma as any;
  let certifiedPartners: any[] = [];
  let institutional: any[] = [];
  try {
    [certifiedPartners, institutional] = await Promise.all([
      db.user.findMany({
        where: {
          verificationStatus: "VERIFIED",
          publicListing: true,
          status: { in: ["GOLD", "MASTER", "ELITE"] },
          active: true,
        },
        select: {
          id: true, firstName: true, lastName: true, status: true,
          partnerType: true, city: true, country: true,
          photoUrl: true, bio: true, website: true,
          verification: {
            select: {
              companyName: true, legalRep: true, companyCity: true, companyCountry: true,
              companyEmail: true, companyWhatsapp: true, companyAddress: true,
              city: true, country: true,
            },
          },
        },
        orderBy: [
          { status: "desc" },
          { firstName: "asc" },
        ],
      }),
      db.institutionalPartner.findMany({
        where: { active: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      }),
    ]);
  } catch {
    certifiedPartners = [];
    institutional = [];
  }

  const individuals = (certifiedPartners as any[]).filter((p: any) => p.partnerType === "INDIVIDUAL");
  const companies   = (certifiedPartners as any[]).filter((p: any) => p.partnerType === "COMPANY");

  return (
    <>
      <SiteHeader lang="en" />
      <main>
        {/* HERO */}
        <section className="gradient-hero py-20 text-white text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="animate-float absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
            <div className="animate-float absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-white/5" style={{ animationDelay: "1s" }} />
          </div>
          <div className="relative mx-auto max-w-4xl px-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm mb-4">
              🌍 IBIG PARTNERS Network
            </span>
            <h1 className="text-3xl font-extrabold sm:text-5xl mb-4">
              Our Partners
            </h1>
            <p className="max-w-2xl mx-auto text-brand-100 text-lg leading-relaxed">
              Discover our active certified partners and our institutional partners.
              Together, we are building tomorrow&apos;s economic ecosystem.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { val: certifiedPartners.length, label: "Certified partners" },
                { val: institutional.length,     label: "Institutional partners" },
                { val: companies.length,          label: "Partner companies" },
              ].map(({ val, label }) => (
                <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-3">
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-xs text-brand-100 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL PARTNERS */}
        {institutional.length > 0 && (
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">
                  Official partners
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
                  Institutional partners
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted">
                  Institutions, organizations and companies that collaborate with IBIG SARL under official partnerships.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(institutional as any[]).map((p: any) => (
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
                    {p.description && (
                      <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">{p.description}</p>
                    )}
                    <div className="space-y-1.5 text-xs text-muted">
                      {(p.city || p.country) && (
                        <p>📍 {[p.city, p.country].filter(Boolean).join(", ")}</p>
                      )}
                      {p.address && <p>🏠 {p.address}</p>}
                      {p.email && <p>✉️ <a href={`mailto:${p.email}`} className="text-blue-600 hover:underline">{p.email}</a></p>}
                      {p.phone && <p>📞 {p.phone}{p.phone2 ? ` · ${p.phone2}` : ""}</p>}
                      {p.website && (
                        <p>🌐 <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.website.replace(/^https?:\/\//, "")}</a></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PARTNER COMPANIES */}
        {companies.length > 0 && (
          <section className="py-20 bg-slate-50">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-600">
                  Certified companies
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
                  IBIG partner companies
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted">
                  Companies certified GOLD or higher, verified by IBIG SARL.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(companies as any[]).map((p: any) => {
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
                          {v?.legalRep && <p className="text-xs text-muted mt-0.5">Legal representative: {v.legalRep}</p>}
                          <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc?.badge ?? "bg-slate-100 text-slate-700"}`}>
                            {STATUS_LABELS[p.status]}
                          </span>
                        </div>
                      </div>
                      {p.bio && <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">{p.bio}</p>}
                      <div className="space-y-1.5 text-xs text-muted">
                        {(v?.companyCity || v?.companyCountry) && (
                          <p>📍 {[v.companyCity, v.companyCountry].filter(Boolean).join(", ")}</p>
                        )}
                        {v?.companyAddress && <p>🏠 {v.companyAddress}</p>}
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

        {/* INDIVIDUALS */}
        {individuals.length > 0 && (
          <section className="py-20 bg-white">
            <div className="mx-auto max-w-6xl px-4">
              <div className="text-center mb-12">
                <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-600">
                  Certified ambassadors
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
                  Individual partners
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-muted">
                  Individual Gold, Master and Elite partners verified by IBIG SARL.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(individuals as any[]).map((p: any) => {
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

        {/* If no partner displayed */}
        {certifiedPartners.length === 0 && institutional.length === 0 && (
          <section className="py-32 text-center text-muted">
            <p className="text-4xl mb-4">🤝</p>
            <p className="text-lg font-semibold text-ink mb-2">Our network is growing</p>
            <p className="text-sm">The first certified partners will appear here soon.</p>
            <Link href="/en/rejoindre" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Join the program →
            </Link>
          </section>
        )}

        {/* CTA */}
        <section className="gradient-hero py-16 text-white text-center">
          <div className="mx-auto max-w-2xl px-4">
            <h2 className="text-2xl font-extrabold mb-3">Would you like to appear here?</h2>
            <p className="text-brand-100 text-sm mb-6">
              Reach Gold status, verify your account and enable your public profile in your partner dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/en/rejoindre" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 shadow">
                Become a partner →
              </Link>
              <Link href="/connexion" className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter lang="en" />
    </>
  );
}
