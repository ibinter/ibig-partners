import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const SEQUENCES = [
  { day: 0,  label: "J+0 — Bienvenue",           emoji: "🎉" },
  { day: 3,  label: "J+3 — Premier lien",         emoji: "🔗" },
  { day: 7,  label: "J+7 — Académie IBIG",        emoji: "🎓" },
  { day: 14, label: "J+14 — Conseils 2 semaines", emoji: "💡" },
  { day: 30, label: "J+30 — Récap 1 mois",        emoji: "🏆" },
];

export default async function EmailSequencesPage() {
  await requireAdmin();

  const sends = await (prisma as any).emailSequenceSend.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  const countByDay: Record<number, number> = {};
  for (const s of sends) {
    countByDay[s.day] = (countByDay[s.day] ?? 0) + 1;
  }

  const recent = sends.slice(0, 20);

  const userIds = [...new Set(recent.map((s: any) => s.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds as string[] } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div className="space-y-6">
      <PageHeader title="Séquences email auto" subtitle="Emails automatiques envoyés aux partenaires après leur inscription." />

      {/* Stats par séquence */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {SEQUENCES.map((seq) => (
          <Card key={seq.day} className="text-center">
            <p className="text-2xl">{seq.emoji}</p>
            <p className="text-xl font-extrabold text-slate-800 mt-1">{countByDay[seq.day] ?? 0}</p>
            <p className="text-xs text-slate-500 mt-0.5">{seq.label}</p>
          </Card>
        ))}
      </div>

      {/* Derniers envois */}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-4">Derniers envois (20)</h2>
        {recent.length === 0 ? (
          <p className="text-slate-400 text-sm">Aucun envoi enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-2 text-slate-500 font-medium">Partenaire</th>
                  <th className="pb-2 text-slate-500 font-medium">Séquence</th>
                  <th className="pb-2 text-slate-500 font-medium text-right">Envoyé le</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s: any) => {
                  const u = userMap[s.userId];
                  const seq = SEQUENCES.find((x) => x.day === s.day);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2">
                        <p className="font-medium text-slate-800">{u ? `${u.firstName} ${u.lastName}` : s.userId}</p>
                        <p className="text-xs text-slate-400">{u?.email}</p>
                      </td>
                      <td className="py-2 text-slate-600">{seq ? `${seq.emoji} ${seq.label}` : `J+${s.day}`}</td>
                      <td className="py-2 text-right text-slate-400">{formatDate(s.sentAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
