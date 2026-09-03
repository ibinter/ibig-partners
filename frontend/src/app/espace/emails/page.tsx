import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const SEQ_LABELS: Record<string, string> = {
  ONBOARDING: "Onboarding",
  ACTIVATION:  "Activation",
  REENGAGE:    "Réengagement",
  STATUS_UP:   "Montée de statut",
};

const STEP_LABELS: Record<string, { title: string; desc: string }> = {
  J0:        { title: "Bienvenue & Guide PDF",           desc: "Email de bienvenue avec votre guide affilié et code" },
  J1:        { title: "Les 11 branches IBIG",            desc: "Tableau des branches et taux de commission" },
  J3:        { title: "Scripts WhatsApp",                desc: "Scripts de prospection prêts à copier" },
  J7:        { title: "Bilan semaine 1",                 desc: "Récap + plan d'action personnalisé" },
  J14:       { title: "Méthodes des affiliés actifs",    desc: "Ce que font les partenaires qui réussissent" },
  J21:       { title: "Motivation parrainage",           desc: "La force du réseau gagnant-gagnant" },
  J45:       { title: "Nouvelles branches IBIG",         desc: "IBIG FINANCEMENT & EMPLOI & TALENTS" },
  J60:       { title: "Votre espace vous attend",        desc: "Reprenez quand vous voulez" },
  IMMEDIATE: { title: "Notification immédiate",          desc: "Email envoyé en temps réel" },
};

const SEQ_COLOR: Record<string, string> = {
  ONBOARDING: "bg-blue-100 text-blue-700",
  ACTIVATION:  "bg-amber-100 text-amber-700",
  REENGAGE:    "bg-rose-100 text-rose-700",
  STATUS_UP:   "bg-emerald-100 text-emerald-700",
};

const ONBOARDING_STEPS = ["J0","J1","J3","J7"];
const ACTIVATION_STEPS = ["J14","J21"];

export default async function EmailsPage() {
  const user = await requireUser();

  const logs = await prisma.emailSequenceLog.findMany({
    where: { userId: user.id },
    orderBy: { sentAt: "desc" },
  });

  const sentSet = new Set(logs.map(l => `${l.sequence}:${l.step}`));
  const onboardingDone = ONBOARDING_STEPS.filter(s => sentSet.has(`ONBOARDING:${s}`)).length;
  const pct = Math.round((onboardingDone / ONBOARDING_STEPS.length) * 100);

  return (
    <div>
      <PageHeader
        title="Mes emails reçus"
        subtitle="Historique de vos emails de parcours IBIG PARTNERS."
      />

      {/* Progression onboarding */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink">Parcours d&apos;onboarding</h2>
          <span className="text-sm font-bold text-brand-600">{pct}%</span>
        </div>
        <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-2.5 rounded-full bg-brand-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ONBOARDING_STEPS.map(step => {
            const done = sentSet.has(`ONBOARDING:${step}`);
            return (
              <div
                key={step}
                className={`rounded-xl border px-3 py-2.5 text-center ${
                  done
                    ? "border-blue-200 bg-blue-50"
                    : "border-dashed border-slate-200 bg-slate-50 opacity-50"
                }`}
              >
                <p className="text-lg">{done ? "✅" : "⏳"}</p>
                <p className="text-xs font-semibold text-ink">{step}</p>
                <p className="text-xs text-muted leading-tight mt-0.5">
                  {STEP_LABELS[step]?.title ?? step}
                </p>
              </div>
            );
          })}
        </div>

        {/* Séquence activation */}
        {ACTIVATION_STEPS.some(s => sentSet.has(`ACTIVATION:${s}`)) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Séquence Activation
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVATION_STEPS.map(step => {
                const done = sentSet.has(`ACTIVATION:${step}`);
                return (
                  <div
                    key={step}
                    className={`rounded-xl border px-3 py-2.5 text-center ${
                      done
                        ? "border-amber-200 bg-amber-50"
                        : "border-dashed border-slate-200 bg-slate-50 opacity-40"
                    }`}
                  >
                    <p className="text-lg">{done ? "✅" : "⏳"}</p>
                    <p className="text-xs font-semibold text-ink">{step}</p>
                    <p className="text-xs text-muted leading-tight mt-0.5">
                      {STEP_LABELS[step]?.title ?? step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Historique */}
      <Card>
        <h2 className="mb-4 font-semibold text-ink">Historique complet</h2>
        {logs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-3xl mb-2">📬</p>
            <p className="text-muted text-sm">Aucun email de séquence enregistré pour l&apos;instant.</p>
            <p className="text-muted text-xs mt-1">Votre parcours démarrera automatiquement après validation de votre compte.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const info = STEP_LABELS[log.step];
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div className="mt-0.5 text-xl">📧</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${SEQ_COLOR[log.sequence] ?? "bg-slate-100 text-slate-600"}`}>
                        {SEQ_LABELS[log.sequence] ?? log.sequence}
                      </span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-mono font-semibold text-slate-600">
                        {log.step}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-ink truncate">
                      {info?.title ?? log.step}
                    </p>
                    <p className="text-xs text-muted">{info?.desc}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted whitespace-nowrap">{formatDate(log.sentAt)}</p>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
