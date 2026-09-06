import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function approveTestimonial(id: string) {
  "use server";
  await (prisma as any).testimonial.update({ where: { id }, data: { status: "APPROVED" } });
  revalidatePath("/admin/temoignages");
}

async function rejectTestimonial(id: string) {
  "use server";
  await (prisma as any).testimonial.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/temoignages");
}

export default async function AdminTemoignagesPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/espace");

  const pending = await (prisma as any).testimonial.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" } });
  const withNames = await Promise.all(
    pending.map(async (t: any) => {
      const u = await (prisma as any).user.findUnique({ where: { id: t.userId }, select: { name: true } });
      return { ...t, name: u?.name ?? "Inconnu" };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Témoignages à modérer ({pending.length})</h1>
      {withNames.length === 0 ? (
        <p className="text-gray-400">Aucun témoignage en attente.</p>
      ) : (
        <div className="space-y-4">
          {withNames.map((t: any) => (
            <div key={t.id} className="rounded-2xl border bg-white dark:bg-gray-900 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex gap-1 mb-1">{Array.from({ length: t.rating }).map((_: any, i: number) => <span key={i}>⭐</span>)}</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{t.content}</p>
                  <p className="text-xs text-gray-400 mt-2">Par {t.name} — {new Date(t.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={approveTestimonial.bind(null, t.id)}>
                    <button type="submit" className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600">✓ Approuver</button>
                  </form>
                  <form action={rejectTestimonial.bind(null, t.id)}>
                    <button type="submit" className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600">✗ Rejeter</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
