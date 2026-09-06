import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

async function sendNotification(fd: FormData) {
  "use server";
  const title = fd.get("title") as string;
  const message = fd.get("message") as string;
  const target = fd.get("target") as string; // ALL | LEVEL | USER
  const targetValue = fd.get("targetValue") as string;
  const type = fd.get("type") as string;

  if (!title || !message) return;

  try {
    if (target === "USER" && targetValue) {
      await (prisma as any).notification.create({
        data: { userId: targetValue, title, message, type: type || "INFO", read: false },
      });
    } else {
      const where: any = { role: "PARTNER", approved: true };
      const users = await prisma.user.findMany({ where, select: { id: true } });
      for (const u of users) {
        try {
          await (prisma as any).notification.create({
            data: { userId: u.id, title, message, type: type || "INFO", read: false },
          });
        } catch { /* skip */ }
      }
    }
  } catch { /* notification model may not exist */ }
}

export default async function AdminNotificationsPage() {
  await requireAdmin();

  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", approved: true },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true, code: true },
  });

  const recentNotifs = await (async () => {
    try {
      return await (prisma as any).notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { user: { select: { firstName: true, lastName: true, code: true } } },
      });
    } catch { return []; }
  })();

  const notifTypes = [
    { value: "INFO", label: "Information", color: "bg-blue-100 text-blue-700" },
    { value: "SUCCESS", label: "Succès", color: "bg-green-100 text-green-700" },
    { value: "WARNING", label: "Avertissement", color: "bg-yellow-100 text-yellow-700" },
    { value: "MISSION", label: "Mission", color: "bg-purple-100 text-purple-700" },
    { value: "CP", label: "Crédits PARTNERS", color: "bg-amber-100 text-amber-700" },
    { value: "PAYMENT", label: "Paiement", color: "bg-emerald-100 text-emerald-700" },
  ];

  const predefined = [
    { title: "Nouvelle mission disponible", message: "Une nouvelle mission vient d'être publiée. Consultez le catalogue pour postuler.", type: "MISSION" },
    { title: "Vérification de compte requise", message: "Votre compte nécessite une vérification. Merci de compléter votre profil.", type: "WARNING" },
    { title: "CP crédités", message: "Des Crédits PARTNERS ont été ajoutés à votre portefeuille suite à une mission validée.", type: "CP" },
    { title: "Félicitations — Nouveau niveau", message: "Vous venez d'atteindre un nouveau niveau partenaire. Découvrez vos nouveaux avantages.", type: "SUCCESS" },
    { title: "Commission en attente", message: "Une commission est en attente de validation. Elle sera traitée prochainement.", type: "PAYMENT" },
    { title: "Rappel : mission en cours", message: "Vous avez une mission en cours dont l'échéance approche. Pensez à soumettre votre preuve.", type: "WARNING" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Notifications admin"
        subtitle="Envoyer des notifications aux partenaires — ciblées ou groupées"
      />

      {/* Envoi notification */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Envoyer une notification</h2>
        <form action={sendNotification} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
              <input type="text" name="title" required placeholder="Titre de la notification" className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select name="type" className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600">
                {notifTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destinataires *</label>
              <select name="target" className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600">
                <option value="ALL">Tous les partenaires approuvés</option>
                <option value="USER">Partenaire spécifique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partenaire spécifique (si ciblé)</label>
              <select name="targetValue" className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600">
                <option value="">Sélectionner (si ciblé)</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.code})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
              <textarea name="message" required rows={3} placeholder="Contenu de la notification..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            Envoyer la notification
          </button>
        </form>
      </div>

      {/* Modèles prédéfinis */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Modèles prédéfinis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {predefined.map((n, i) => {
            const typeInfo = notifTypes.find((t) => t.value === n.type);
            return (
              <div key={i} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-medium text-sm">{n.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeInfo?.color}`}>{typeInfo?.label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{n.message}</p>
                <form action={sendNotification}>
                  <input type="hidden" name="title" value={n.title} />
                  <input type="hidden" name="message" value={n.message} />
                  <input type="hidden" name="type" value={n.type} />
                  <input type="hidden" name="target" value="ALL" />
                  <button type="submit" className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors">
                    Envoyer à tous
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Notifications récentes ({recentNotifs.length})</h2>
        {recentNotifs.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune notification envoyée pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 text-left text-gray-500">
                  <th className="pb-2 pr-4">Destinataire</th>
                  <th className="pb-2 pr-4">Titre</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2">Lu</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {recentNotifs.map((n: any) => {
                  const typeInfo = notifTypes.find((t) => t.value === n.type);
                  return (
                    <tr key={n.id}>
                      <td className="py-2 pr-4 font-medium">{n.user?.firstName} {n.user?.lastName} <span className="text-gray-400 text-xs">({n.user?.code})</span></td>
                      <td className="py-2 pr-4">{n.title}</td>
                      <td className="py-2 pr-4"><span className={`text-xs px-2 py-0.5 rounded ${typeInfo?.color}`}>{typeInfo?.label || n.type}</span></td>
                      <td className="py-2">{n.read ? <span className="text-green-600">✓</span> : <span className="text-gray-400">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
