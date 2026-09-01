import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Below this threshold, a "leaderboard" or "traction" is not yet
// credible — we show an honest launch page instead.
const MIN_PARTNERS_FOR_LEADERBOARD = 25;

export const metadata: Metadata = {
  title: "Top Partners — IBIG PARTNERS",
  description:
    "Discover the best IBIG PARTNERS partners of the month — real earnings, full transparency. Join the leaderboard.",
  alternates: {
    canonical: "https://ibigpartners.com/en/top-partenaires",
    languages: {
      fr: "https://ibigpartners.com/top-partenaires",
      en: "https://ibigpartners.com/en/top-partenaires",
      "x-default": "https://ibigpartners.com/top-partenaires",
    },
  },
};

/**
 * Public page /en/top-partenaires
 * - SEO friendly
 * - Extended Hall of Fame
 * - Global stats
 * - Drives sign-ups
 */
export default async function TopPartnersPage() {
  // Resilience: if the database is unavailable, fall back to default
  // values so the page renders instead of throwing a 500.
  let partners = 0;
  let commissions = 0;
  let sales = 0;
  try {
    const [totalPartners, totalCommissions, monthSales] = await Promise.all([
      prisma.user.count({ where: { role: "PARTNER", active: true } }),
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: { status: { in: ["VALIDATED", "PAID"] } },
      }),
      prisma.sale.count({
        where: {
          status: "CONFIRMED",
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);

    // Real values from the database — no amplification.
    partners = totalPartners;
    commissions = totalCommissions._sum.amount ?? 0;
    sales = monthSales;
  } catch (err) {
    // Database unavailable: fall back to the honest "program launching" state.
    console.error("TopPartnersPage: database unavailable, empty fallback", err);
  }

  const hasEnoughTraction = partners >= MIN_PARTNERS_FOR_LEADERBOARD;

  return (
    <>
      <SiteHeader lang="en" />

      {hasEnoughTraction ? (
        <section className="gradient-hero relative overflow-hidden py-20 text-white">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(245,183,61,0.3) 0%, transparent 50%)",
          }} />
          <div className="relative mx-auto max-w-5xl px-4 text-center">
            <span className="label-caps inline-block rounded-full bg-white/15 px-4 py-1.5 text-gold-400">
              🏆 Public leaderboard · Full transparency
            </span>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
              The top <span className="text-gold-400">IBIG</span> partners
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-brand-100">
              No mystery, no hidden promises: here are the real champions of the program.
              Their earnings, their cities, their progress. Join them.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                <p className="text-numeral text-3xl text-gold-400 sm:text-4xl">{partners.toLocaleString("en-US")}</p>
                <p className="text-xs text-brand-200 mt-1">Active partners</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                <p className="text-numeral text-3xl text-emerald-400 sm:text-4xl">
                  {(commissions / 1_000_000).toFixed(1)}M
                </p>
                <p className="text-xs text-brand-200 mt-1">FCFA paid out</p>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-5">
                <p className="text-numeral text-3xl text-violet-300 sm:text-4xl">{sales.toLocaleString("en-US")}</p>
                <p className="text-xs text-brand-200 mt-1">Sales this month</p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="gradient-hero relative overflow-hidden py-20 text-white">
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <span className="label-caps inline-block rounded-full bg-white/15 px-4 py-1.5 text-gold-400">
              🚀 The leaderboard starts soon
            </span>
            <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
              Be among the <span className="text-gold-400">first</span> on the leaderboard
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-brand-100">
              The program has just launched: this leaderboard will fill up as the first sales come in.
              Sign up now to be among the very first recognized partners.
            </p>
          </div>
        </section>
      )}

      {hasEnoughTraction && (
        <>
          <ParrainDuMoisEN />
          <HallOfFameEN />
        </>
      )}

      <section className="bg-gradient-to-br from-brand-50 via-white to-amber-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-extrabold text-ink">Your name here next month?</h2>
          <p className="mt-3 text-muted">
            Free sign-up, no fees, no credit card. Start promoting
            the IBIG SARL ecosystem and earn your first commissions within 7 days.
          </p>
          <a
            href="/en/rejoindre"
            data-testid="top-page-cta"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 font-extrabold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            🚀 I&apos;m joining the leaderboard
          </a>
        </div>
      </section>

      <SiteFooter lang="en" />
    </>
  );
}

/**
 * "Sponsor of the Month" program — motivational banner (English).
 * Shows the top recruiter of the current month with a premium design.
 * Same data logic as the French component.
 */
async function ParrainDuMoisEN() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let parrain: {
    name: string;
    city: string;
    referrals: number;
    status: string;
    avatar: string;
  } | null = null;

  try {
    // Top recruiter of the month: who signed up the most new active referrals this month
    const newReferrals = await prisma.user.groupBy({
      by: ["sponsorId"],
      where: {
        sponsorId: { not: null },
        createdAt: { gte: startOfMonth },
        active: true,
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 1,
    });

    if (newReferrals.length > 0 && newReferrals[0].sponsorId) {
      const u = await prisma.user.findUnique({
        where: { id: newReferrals[0].sponsorId },
        select: { firstName: true, lastName: true, city: true, country: true, status: true },
      });
      if (u) {
        parrain = {
          name: `${u.firstName} ${u.lastName.charAt(0)}.`,
          city: u.city || u.country || "Côte d'Ivoire",
          referrals: newReferrals[0]._count.id,
          status: u.status,
          avatar: u.firstName.charAt(0).toUpperCase(),
        };
      }
    }
  } catch (err) {
    // Database unavailable: simply hide the section.
    console.error("ParrainDuMoisEN: database unavailable, section hidden", err);
    return null;
  }

  // No real sponsor this month: we don't invent fake data.
  if (!parrain) return null;

  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section
      data-testid="parrain-du-mois"
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-20"
    >
      {/* Decor */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(245,183,61,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(244,114,182,0.3) 0%, transparent 50%)",
      }} />

      <div className="relative mx-auto max-w-5xl px-4">
        <div className="text-center mb-10">
          <span className="label-caps inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 text-white shadow-lg">
            👑 EXCLUSIVE · {monthName}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            Sponsor of the Month
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Every month, the partner who recruits the most new active referrals earns a{" "}
            <strong className="text-amber-700">+5% bonus on all their commissions for 30 days</strong>.
            Recruit sellers everywhere: construction, healthcare, agriculture, Mobile Money, NGOs, invoicing,
            secretarial services — 14 business sectors, just as many opportunities.
          </p>
        </div>

        <div className="card-premium relative overflow-hidden p-0">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-gold-500 to-orange-500" />

          <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            {/* Trophy avatar */}
            <div className="relative mx-auto md:mx-0">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-5xl font-extrabold text-white shadow-2xl">
                {parrain.avatar}
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg ring-4 ring-white">
                👑
              </span>
            </div>

            {/* Info */}
            <div className="text-center md:text-left">
              <p className="label-caps text-amber-700">{parrain.status} · Champion</p>
              <h3 className="mt-2 text-3xl font-extrabold text-ink">{parrain.name}</h3>
              <p className="mt-1 text-muted">{parrain.city}</p>
              <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3 ring-1 ring-emerald-100">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    New referrals this month
                  </p>
                  <p className="text-numeral text-2xl text-emerald-700">
                    {parrain.referrals} recruits
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 text-center md:text-right">
              <a
                href="/en/rejoindre"
                data-testid="parrain-cta"
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Become the next one →
              </a>
              <a
                href="/en/top-partenaires"
                className="text-xs font-semibold text-amber-700 hover:underline"
              >
                See all top partners →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Hall of Fame — TOP 10 partners of the month (English).
 * Same data logic as the French component.
 */
async function HallOfFameEN() {
  // Top 10 partners by commissions this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let final: { rank: number; name: string; city: string; earnings: number; status: string }[];
  try {
    const topPerformers = await prisma.commission.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: ["VALIDATED", "PAID"] },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    });

    const userIds = topPerformers.map((p) => p.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        country: true,
        status: true,
        photoUrl: true,
      },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const podium = topPerformers
      .map((p, i) => {
        const u = userMap.get(p.userId);
        return {
          rank: i + 1,
          name: u ? `${u.firstName} ${u.lastName.charAt(0)}.` : "Partner",
          city: u?.city ?? "—",
          earnings: p._sum.amount ?? 0,
          status: u?.status ?? "STARTER",
        };
      })
      .filter((p) => p.earnings > 0);

    // Fewer than 3 real performers: no credible podium, we don't invent anything.
    if (podium.length < 3) return null;

    final = podium.slice(0, 8);
  } catch (err) {
    // Database unavailable: simply hide the section.
    console.error("HallOfFameEN: database unavailable, section hidden", err);
    return null;
  }

  const monthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <section
      data-testid="hall-of-fame"
      className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <span className="label-caps inline-block rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">
            🏆 Hall of Fame · {monthName}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
            The top performers of the month
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Transparency is our strength. Here are the partners earning the
            most right now, selling across 14 business sectors — from construction to healthcare,
            from agriculture to Mobile Money. Join the leaderboard!
          </p>
        </div>

        {/* Top 3 podium */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {final.slice(0, 3).map((p) => (
            <PodiumCard key={p.rank} p={p} />
          ))}
        </div>

        {/* Top 4-8 */}
        {final.length > 3 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {final.slice(3).map((p) => (
              <div
                key={p.rank}
                className="card-premium flex items-center gap-3 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                  {p.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold text-sm text-ink">{p.name}</p>
                  <p className="text-xs text-muted truncate">{p.city}</p>
                </div>
                <p className="text-numeral text-sm text-emerald-600">
                  {Math.round(p.earnings / 1000)}k
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <a
            href="/en/rejoindre"
            data-testid="hof-cta"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-gold-500 px-8 py-4 font-extrabold text-brand-900 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            <span className="text-xl">🚀</span>
            Become the next #1
          </a>
        </div>
      </div>
    </section>
  );
}

function PodiumCard({ p }: { p: { rank: number; name: string; city: string; earnings: number; status: string } }) {
  const medals = ["🥇", "🥈", "🥉"];
  const heights = ["h-64", "h-56", "h-52"];
  const gradients = [
    "from-yellow-300 via-amber-400 to-orange-500", // gold
    "from-slate-200 via-slate-300 to-slate-400", // silver
    "from-orange-300 via-amber-500 to-amber-700", // bronze
  ];
  const i = p.rank - 1;

  return (
    <div
      data-testid={`podium-${p.rank}`}
      className={`card-premium relative overflow-hidden p-6 ${heights[i]} flex flex-col justify-end`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradients[i]}`}
      />
      <div className="absolute top-4 right-4 text-4xl">{medals[i]}</div>

      <div className="absolute top-6 left-6">
        <span className="text-numeral text-4xl text-slate-200">#{p.rank}</span>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {p.status}
        </p>
        <p className="mt-1 text-xl font-extrabold text-ink">{p.name}</p>
        <p className="text-xs text-muted">{p.city}</p>
        <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2.5 ring-1 ring-emerald-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Earnings this month
          </p>
          <p className="text-numeral text-2xl text-emerald-700">
            {p.earnings.toLocaleString("en-US")} FCFA
          </p>
        </div>
      </div>
    </div>
  );
}
