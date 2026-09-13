import { prisma } from "@/lib/prisma";
import { ScrollReveal } from "@/components/scroll-reveal";

const fcfa = (n: number) => n.toLocaleString("fr-FR") + " FCFA";

/**
 * Section "Produits phares" — tire les vrais produits depuis la DB.
 * Affiche les 3 premiers produits actifs de chaque branche active.
 */
export async function FlagshipProducts() {
  let branches: {
    id: string;
    name: string;
    products: { id: string; name: string; price: number; rate: number; pricingType: string; category: string | null }[];
  }[] = [];

  try {
    branches = await prisma.branch.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        products: {
          where: { active: true },
          orderBy: { price: "desc" },
          take: 3,
          select: { id: true, name: true, price: true, rate: true, pricingType: true, category: true },
        },
      },
    });
  } catch {
    return null;
  }

  // Ne montrer que les branches qui ont au moins 1 produit
  const withProducts = branches.filter((b) => b.products.length > 0);
  if (withProducts.length === 0) return null;

  const BRANCH_STYLES: Record<string, { bar: string; chip: string; emoji: string }> = {
    "IBIG SOFT":            { bar: "from-brand-500 to-brand-700",   chip: "bg-brand-50 text-brand-700",   emoji: "💻" },
    "IBIG EDUFORM":         { bar: "from-amber-500 to-orange-600",  chip: "bg-amber-50 text-amber-700",   emoji: "🎓" },
    "IBIG IMMO TRUST":      { bar: "from-violet-500 to-purple-700", chip: "bg-violet-50 text-violet-700", emoji: "🏠" },
    "IBIG MARKET":          { bar: "from-emerald-500 to-teal-600",  chip: "bg-emerald-50 text-emerald-700", emoji: "🛍️" },
    "IBIG DIGITAL":         { bar: "from-indigo-500 to-blue-700",   chip: "bg-indigo-50 text-indigo-700", emoji: "🚀" },
    "IBIG DIGITAL KITS":    { bar: "from-teal-500 to-cyan-600",     chip: "bg-teal-50 text-teal-700",     emoji: "⚙️" },
    "IBIG CONSEIL+":        { bar: "from-orange-500 to-red-600",    chip: "bg-orange-50 text-orange-700", emoji: "📊" },
    "IBIG MULTISERVICES":   { bar: "from-rose-500 to-pink-600",     chip: "bg-rose-50 text-rose-700",     emoji: "🔧" },
    "IBIG FINANCEMENT":     { bar: "from-yellow-500 to-amber-600",  chip: "bg-amber-50 text-amber-800",   emoji: "💰" },
    "IBIG EMPLOI & TALENTS":{ bar: "from-slate-600 to-slate-800",   chip: "bg-slate-100 text-slate-700",  emoji: "🤝" },
  };

  const perLabel = (type: string) => {
    if (type === "MONTHLY_SUB") return "/mois";
    if (type === "ANNUAL_SUB")  return "/an";
    return "";
  };

  return (
    <section id="produits-phares" className="bg-white py-16 sm:py-20 lg:py-24 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <span className="label-caps inline-block rounded-full bg-brand-50 px-4 py-1.5 text-brand-600">
              Produits phares à promouvoir
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Ce que vous vendez — concret et rémunérateur
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Chaque produit est réel, livrable et déjà utilisé par des clients. Voici ce que vaut votre commission dès la première vente.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {withProducts.map((branch, bi) => {
            const style = BRANCH_STYLES[branch.name] ?? {
              bar: "from-slate-500 to-slate-700",
              chip: "bg-slate-50 text-slate-700",
              emoji: "📦",
            };
            const n1Rate = branch.products[0]?.rate ?? 10;

            return (
              <ScrollReveal key={branch.id} animation="fade-up" delay={bi * 80}>
                <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden h-full">
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${style.bar} px-5 py-4`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{style.emoji}</span>
                      <span className="font-extrabold text-white text-sm">{branch.name}</span>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="flex flex-col flex-1 divide-y divide-slate-50 p-1">
                    {branch.products.map((p) => {
                      const gain = Math.round(p.price * (p.rate / 100));
                      return (
                        <div key={p.id} className="flex items-start gap-3 px-4 py-3.5">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-ink text-sm leading-snug">{p.name}</p>
                            {p.category && (
                              <p className="text-xs text-muted mt-0.5">{p.category}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-0.5">
                              Prix : {fcfa(p.price)}{perLabel(p.pricingType)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-muted font-medium">Votre gain</p>
                            <p className="font-extrabold text-emerald-600 text-sm">{fcfa(gain)}</p>
                            {perLabel(p.pricingType) && (
                              <p className="text-[10px] text-slate-400">{perLabel(p.pricingType)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className={`px-5 py-3 ${style.chip} text-center`}>
                    <span className="text-xs font-bold">
                      Commission jusqu&apos;à {n1Rate}% N1
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/rejoindre"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-brand-700"
          >
            Choisir mes produits et commencer →
          </a>
          <p className="mt-3 text-xs text-muted">
            Accès à tous les produits dès l&apos;inscription · Gratuit · Sans stock
          </p>
        </div>
      </div>
    </section>
  );
}
