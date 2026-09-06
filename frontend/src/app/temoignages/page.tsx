import { prisma } from "@/lib/prisma";

export default async function TemoignagesPublicPage() {
  const testimonials = await (prisma as any).testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const withNames = await Promise.all(
    testimonials.map(async (t: any) => {
      const u = await (prisma as any).user.findUnique({ where: { id: t.userId }, select: { name: true } });
      return { ...t, name: u?.name ?? "Partenaire IBIG" };
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm mb-2">Ce que disent nos partenaires</p>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white">Témoignages</h1>
          <p className="text-gray-500 mt-2">Les vrais résultats de nos partenaires affiliés</p>
        </div>

        {withNames.length === 0 ? (
          <p className="text-center text-gray-400">Les témoignages arrivent bientôt.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {withNames.map((t: any) => (
              <div key={t.id} className="rounded-2xl border bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-yellow-400">⭐</span>)}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-300">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-[10px] text-gray-400">Partenaire IBIG</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <a href="/rejoindre" className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 text-white font-bold hover:bg-indigo-700 transition-colors">
            Devenir partenaire →
          </a>
        </div>
      </div>
    </main>
  );
}
