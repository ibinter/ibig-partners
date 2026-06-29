import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, StatCard } from "@/components/ui";
import { STATUS_LABELS, STATUS_COLORS, STATUS_RULES, STATUS_DETAILS, STATUSES } from "@/lib/constants";
import { PersonalGoalForm } from "./PersonalGoalForm";

export const dynamic = "force-dynamic";

const TIPS: Record<string, { icon: string; title: string; text: string }[]> = {
  STARTER: [
    { icon: "📲", title: "Partagez votre lien",        text: "Publiez votre lien de parrainage sur WhatsApp, Facebook et LinkedIn chaque jour." },
    { icon: "🤝", title: "Rencontrez des prospects",   text: "Identifiez 5 personnes de votre entourage qui pourraient avoir besoin des services IBIG." },
    { icon: "📚", title: "Formez-vous",                text: "Complétez les formations disponibles dans l'espace Formation pour mieux pitcher." },
  ],
  SILVER: [
    { icon: "👥", title: "Recrutez votre équipe",      text: "Invitez au moins 2 partenaires par semaine pour constituer votre réseau N1." },
    { icon: "🎯", title: "Ciblez les entreprises",     text: "Les clients entreprise génèrent des ventes récurrentes : ciblez les PME de votre ville." },
    { icon: "📊", title: "Suivez vos prospects",       text: "Utilisez l'espace Prospects pour ne laisser aucune opportunité de côté." },
  ],
  GOLD: [
    { icon: "🌍", title: "Animez votre réseau",        text: "Organisez une réunion mensuelle avec vos filleuls pour partager les bonnes pratiques." },
    { icon: "💼", title: "Approchez les institutions", text: "Les partenariats institutionnels et ONG ouvrent la porte à des contrats importants." },
    { icon: "🏆", title: "Visez le Master",            text: "Continuez à recruter et accompagner votre équipe pour atteindre 50 ventes collectives." },
  ],
  MASTER: [
    { icon: "🗺️", title: "Couvrez votre commune",     text: "En tant que Master, vous pouvez postuler comme Représentant Communal officiel IBIG." },
    { icon: "📣", title: "Formez vos filleuls",        text: "Plus votre équipe est active, plus vos revenus passifs augmentent : investissez dans leur formation." },
    { icon: "👑", title: "Visez l'Elite",              text: "100 ventes, 50 filleuls directs, 100 actifs en équipe — le sommet vous attend." },
  ],
  ELITE: [
    { icon: "🌐", title: "Représentant Pays",          text: "Vous êtes au sommet ! Contactez l'équipe IBIG pour officialiser votre statut de Représentant Pays." },
    { icon: "🎓", title: "Mentorez vos Masters",       text: "Accompagnez vos filleuls Masters vers le statut Elite pour renforcer votre réseau." },
    { icon: "📈", title: "Développez les partenariats", text: "Identifiez de nouveaux marchés et produits pour maximiser vos commissions Elite +12%." },
  ],
};

function ProgressBar({ value, max, colorClass = "from-blue-500 to-blue-600" }: { value: number; max: number; colorClass?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        {value} / {max} ({pct}%)
      </p>
    </div>
  );
}

function fcfa(n: number) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

export default async function ObjectifsPage() {
  const user = await requireUser();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [salesCount, monthlySales, monthlyCommissionsAgg, directReferralsCount, networkMembers] =
    await Promise.all([
      prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
      prisma.sale.count({
        where: { sellerId: user.id, status: "CONFIRMED", createdAt: { gte: startOfMonth } },
      }),
      prisma.commission.aggregate({
        where: {
          userId: user.id,
          status: { in: ["VALIDATED", "PAID"] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { sponsorId: user.id } }),
      prisma.user.findMany({
        where: { sponsorId: user.id },
        select: { id: true, active: true, approved: true, _count: { select: { sales: true } } },
      }),
    ]);

  const activeTeamCount = networkMembers.filter((m) => m._count.sales >= 1).length;
  const monthlyCommissions = monthlyCommissionsAgg._sum.amount ?? 0;

  // Determine next status
  const statusIndex = STATUSES.indexOf(user.status as typeof STATUSES[number]);
  const nextStatusKey = statusIndex < STATUSES.length - 1 ? STATUSES[statusIndex + 1] : null;
  const nextStatusRules = nextStatusKey
    ? (STATUS_RULES as Record<string, { sales: number; directReferrals?: number; activeTeam?: number }>)[nextStatusKey]
    : null;
  const nextStatusDetail = nextStatusKey
    ? STATUS_DETAILS.find((d) => d.status === nextStatusKey)
    : null;
  const currentStatusDetail = STATUS_DETAILS.find((d) => d.status === user.status);
  const colors = STATUS_COLORS[user.status] ?? STATUS_COLORS.STARTER;

  const tips = TIPS[user.status] ?? TIPS.STARTER;

  const isElite = user.status === "ELITE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Objectifs"
        subtitle="Suivez votre progression vers le prochain statut"
      />

      {/* Hero status card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentStatusDetail?.color ?? "from-slate-500 to-slate-600"} p-6 text-white shadow-lg`}>
        <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-md" />
        <div className="absolute -bottom-4 right-20 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white/80 mb-1">Statut actuel</p>
            <p className="text-3xl font-bold tracking-tight">
              {STATUS_LABELS[user.status]}
            </p>
            <p className="text-sm text-white/70 mt-1">
              {currentStatusDetail?.advantage}
            </p>
          </div>
          {nextStatusDetail && (
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-xs text-white/70 font-medium">Prochain statut</p>
              <p className="text-lg font-bold mt-0.5">{STATUS_LABELS[nextStatusDetail.status]}</p>
              <p className="text-xs text-white/60 mt-0.5">{nextStatusDetail.bonus}</p>
            </div>
          )}
          {isElite && (
            <div className="rounded-2xl bg-white/15 px-5 py-3 text-center backdrop-blur-sm">
              <p className="text-sm font-bold">👑 Niveau maximum atteint !</p>
              <p className="text-xs text-white/70 mt-1">Représentant Pays IBIG</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly performance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ventes totales confirmées"
          value={salesCount}
          sub="depuis votre inscription"
          accent="brand"
          icon="✅"
        />
        <StatCard
          label="Ventes ce mois"
          value={monthlySales}
          sub="mois en cours"
          accent="green"
          icon="📅"
        />
        <StatCard
          label="Commissions ce mois"
          value={fcfa(monthlyCommissions)}
          sub="validées + versées"
          accent="gold"
          icon="💰"
        />
        <StatCard
          label="Filleuls directs"
          value={directReferralsCount}
          sub={`${activeTeamCount} actif${activeTeamCount !== 1 ? "s" : ""} en équipe`}
          accent="slate"
          icon="👥"
        />
      </div>

      {/* Progress toward next status */}
      {nextStatusRules && nextStatusKey && (
        <Card className="p-5">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">
            Progression vers{" "}
            <span className={colors.text}>{STATUS_LABELS[nextStatusKey]}</span>
          </h2>
          <div className="space-y-5">
            {/* Sales */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">
                  🎯 Ventes confirmées
                </span>
                <Badge tone="gray">
                  {salesCount} / {nextStatusRules.sales}
                </Badge>
              </div>
              <ProgressBar
                value={salesCount}
                max={nextStatusRules.sales}
                colorClass="from-blue-500 to-blue-600"
              />
            </div>

            {/* Direct referrals (Gold+) */}
            {nextStatusRules.directReferrals !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    👤 Filleuls directs (N1)
                  </span>
                  <Badge tone="gray">
                    {directReferralsCount} / {nextStatusRules.directReferrals}
                  </Badge>
                </div>
                <ProgressBar
                  value={directReferralsCount}
                  max={nextStatusRules.directReferrals}
                  colorClass="from-emerald-500 to-teal-600"
                />
              </div>
            )}

            {/* Active team (Gold+) */}
            {nextStatusRules.activeTeam !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    🌳 Équipe active (N1+N2+N3)
                  </span>
                  <Badge tone="gray">
                    {activeTeamCount} / {nextStatusRules.activeTeam}
                  </Badge>
                </div>
                <ProgressBar
                  value={activeTeamCount}
                  max={nextStatusRules.activeTeam}
                  colorClass="from-violet-500 to-purple-700"
                />
              </div>
            )}

            {/* Condition text */}
            {nextStatusDetail?.condition && (
              <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
                Condition : {nextStatusDetail.condition}
              </p>
            )}
          </div>
        </Card>
      )}

      {isElite && (
        <Card className="p-5">
          <div className="text-center py-4">
            <p className="text-3xl mb-2">👑</p>
            <p className="font-bold text-slate-800 text-lg">Statut Elite atteint !</p>
            <p className="text-sm text-slate-500 mt-1">
              Vous êtes au sommet du réseau IBIG PARTNERS. Contactez l&apos;équipe pour
              officialiser votre statut de Représentant Pays.
            </p>
          </div>
        </Card>
      )}

      {/* Personal monthly goal (client component) */}
      <PersonalGoalForm monthlySales={monthlySales} />

      {/* Tips */}
      <div>
        <h2 className="font-semibold text-slate-800 text-sm mb-3">
          💡 Conseils pour progresser
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {tips.map((tip) => (
            <Card key={tip.title} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{tip.title}</p>
                  <p className="text-xs text-slate-500">{tip.text}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
