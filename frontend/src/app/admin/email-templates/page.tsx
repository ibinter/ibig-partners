import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function updateTemplate(fd: FormData) {
  "use server";
  await requireAdmin();
  const slug = fd.get("slug") as string;
  await (prisma as any).emailTemplate.upsert({
    where: { slug },
    create: {
      id: `etpl_${slug}`,
      slug,
      subject: fd.get("subject") as string,
      body: fd.get("body") as string,
    },
    update: {
      subject: fd.get("subject") as string,
      body: fd.get("body") as string,
    },
  });
  revalidatePath("/admin/email-templates");
}

export default async function EmailTemplatesPage() {
  await requireAdmin();
  const templates = await (prisma as any).emailTemplate.findMany({ orderBy: { slug: "asc" } });

  const SLUG_LABELS: Record<string, string> = {
    onboarding: "🎉 Onboarding (nouveau partenaire approuvé)",
    paiement: "💸 Confirmation de paiement",
    rappel: "⏰ Rappel d'activité",
    bienvenue: "👋 Bienvenue (compte validé)",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Templates emails" subtitle="Personnalisez les emails automatiques envoyés aux partenaires. Variables disponibles : {{firstName}}, {{code}}, {{amount}}, {{referralUrl}}" />

      <div className="space-y-5">
        {templates.map((t: any) => (
          <Card key={t.id}>
            <h2 className="mb-4 font-semibold text-slate-800">{SLUG_LABELS[t.slug] ?? t.slug}</h2>
            <form action={updateTemplate} className="space-y-3">
              <input type="hidden" name="slug" value={t.slug} />
              <div>
                <label className="block text-xs text-slate-500 mb-1">Objet</label>
                <input name="subject" defaultValue={t.subject} required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Corps du message</label>
                <textarea name="body" defaultValue={t.body} required rows={6}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono" />
              </div>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
                Enregistrer
              </button>
            </form>
          </Card>
        ))}
        {templates.length === 0 && (
          <Card><p className="text-sm text-slate-400">Aucun template. Les templates par défaut seront créés automatiquement au prochain déploiement.</p></Card>
        )}
      </div>
    </div>
  );
}
