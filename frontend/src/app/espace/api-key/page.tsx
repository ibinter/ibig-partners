import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PageHeader } from "@/components/ui";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

async function generateKey(userId: string) {
  "use server";
  const key = `ibig_${randomBytes(24).toString("hex")}`;
  await (prisma as any).partnerApiKey.upsert({
    where: { userId },
    update: { key, createdAt: new Date(), lastUsedAt: null },
    create: { id: `pak_${userId}`, userId, key },
  });
  revalidatePath("/espace/api-key");
}

export default async function ApiKeyPage() {
  const user = await requireUser();
  const record = await (prisma as any).partnerApiKey.findUnique({ where: { userId: user.id } });

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="API Partenaire" subtitle="Accédez à vos données via notre API REST sécurisée." />

      <div className="rounded-2xl border p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold mb-1">Votre clé API</p>
          {record ? (
            <code className="block bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-mono break-all">{record.key}</code>
          ) : (
            <p className="text-sm text-gray-400">Aucune clé générée.</p>
          )}
          {record?.lastUsedAt && (
            <p className="text-xs text-gray-400 mt-1">Dernière utilisation : {new Date(record.lastUsedAt).toLocaleString("fr-FR")}</p>
          )}
        </div>
        <form action={generateKey.bind(null, user.id)}>
          <button type="submit" className="rounded-xl bg-indigo-600 text-white px-5 py-2 text-sm font-semibold hover:bg-indigo-700">
            {record ? "🔄 Régénérer la clé" : "🔑 Générer une clé API"}
          </button>
        </form>
        {record && <p className="text-xs text-amber-600">Régénérer révoque l&apos;ancienne clé immédiatement.</p>}
      </div>

      <div className="rounded-2xl border p-5 space-y-3 text-sm">
        <p className="font-semibold">Endpoints disponibles</p>
        <div className="space-y-2 font-mono text-xs">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-emerald-600 font-bold">GET</span> /api/v1/partner/stats
            <p className="text-gray-500 font-sans mt-0.5">Ventes, commissions, filleuls, leads</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-emerald-600 font-bold">GET</span> /api/v1/partner/links
            <p className="text-gray-500 font-sans mt-0.5">Liste de vos liens affiliés avec stats de clics</p>
          </div>
        </div>
        <p className="text-gray-500">Passez la clé via header <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">X-Api-Key: votre_clé</code> ou paramètre <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">?api_key=</code></p>
      </div>
    </div>
  );
}
