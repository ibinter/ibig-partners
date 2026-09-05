import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ─── Catégorie par mots-clés ───────────────────────── */
function detectCategory(name: string): string {
  const n = name.toLowerCase();
  if (/agriculture|agri|élevage|maraîchage|sylviculture|aquaculture|agroalimentaire/.test(n)) return "Agriculture";
  if (/btp|construction|bâtiment|travaux publics|génie civil|topographie|immobilier|foncier/.test(n)) return "BTP & Construction";
  if (/banque|bancaire|assurance|crédit|microfinance|finance islamique|recouvrement/.test(n)) return "Banque & Assurance";
  if (/beauté|bien-être|esthétique|coiffure|maquillage|spa|massage|cosmétique/.test(n)) return "Beauté & Bien-être";
  if (/communication professionnelle|prise de parole|expression orale|rédaction professionnelle|écriture professionnelle/.test(n)) return "Communication Professionnelle";
  if (/communication|médias|journalisme|rp\b|relations presse|influence|community/.test(n)) return "Communication";
  if (/création de contenu|content creator|youtub|podcast|réels|reel|tiktok|instagram/.test(n)) return "Création de Contenu";
  if (/comptabilité|fiscalité|tva|audit|finances|contrôle de gestion|bilan|trésorerie|budget|ifrs|syscohada/.test(n)) return "Comptabilité & Finance";
  if (/daf|direction administrative|secrétariat de direction|office manager|assistant(e)? de direction/.test(n)) return "Direction & Administration";
  if (/droit|juridique|contrat|réglementation|ohada|compliance|conformité|propriété intellectuelle|travail/.test(n)) return "Droit & Juridique";
  if (/développement personnel|confiance|soft skills|leadership|intelligence émotionnelle|gestion du stress|bien être/.test(n)) return "Développement Personnel";
  if (/entrepreneuriat|startup|création d'entreprise|business plan|auto-entrepreneur|innovation|pitch/.test(n)) return "Entrepreneuriat";
  if (/grh|ressources humaines|recrutement|paie|gpec|talent|rh\b/.test(n)) return "GRH";
  if (/commercial|marketing|vente|négociation|crm|prospection|fidélisation|digital marketing|e-commerce/.test(n)) return "Gestion Commerciale & Marketing";
  if (/ia\b|intelligence artificielle|chatgpt|machine learning|digitalisation|transformation digitale|numérique/.test(n)) return "IA & Digitalisation";
  if (/infographie|design|photoshop|illustrator|canva|indesign|vidéo|motion/.test(n)) return "Infographie & Design";
  if (/informatique|programmation|python|javascript|développement web|réseau|cybersécurité|base de données/.test(n)) return "Informatique & Tech";
  if (/logistique|supply chain|transport|douane|import|export|entrepôt|fret/.test(n)) return "Logistique & Supply Chain";
  if (/management|leadership|équipe|pilotage|stratégie|manager/.test(n)) return "Management & Leadership";
  if (/mine|énergie|pétrole|gaz|hydrocarbure|électricité|solaire|renouvelable/.test(n)) return "Mines, Énergie & Pétrole";
  if (/qhse|qualité|hygiène|sécurité|environnement|iso\b|haccp|norme/.test(n)) return "QHSE";
  if (/santé|pharmacie|infirmier|médical|soins infirmiers|urgences|nursing/.test(n)) return "Santé & Pharmacie";
  if (/tourisme|hôtellerie|hôtel|restauration|accueil|réception|guide touristique/.test(n)) return "Tourisme & Hôtellerie";
  if (/éducation|formation|pédagogie|enseignement|formation de formateur/.test(n)) return "Éducation & Formation";
  if (/gestion de projet|project management|pmi|prince2|agile|scrum|planification/.test(n)) return "Management & Leadership";
  if (/power bi|excel|tableur|bureautique|word|powerpoint/.test(n)) return "Informatique & Tech";
  return "Autres";
}

/* ─── Grille tarifaire ──────────────────────────────── */
function grille(price: number) {
  const pres = Math.round(price * 1.20);
  return {
    individuel_online:  price,
    individuel_pres:    pres,
    groupe_3_5_online:  Math.round(price * 0.87),
    groupe_3_5_pres:    Math.round(pres  * 0.87),
    groupe_6_10_online: Math.round(price * 0.80),
    groupe_6_10_pres:   Math.round(pres  * 0.80),
    groupe_10p_online:  Math.round(price * 0.75),
    groupe_10p_pres:    Math.round(pres  * 0.75),
  };
}

/* ─── Handler ───────────────────────────────────────── */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        branch: { slug: "ibig-eduform" },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        rate: true,
        siteUrl: true,
        pricingType: true,
      },
    });

    const data = products.map((p) => ({
      id:          p.id,
      name:        p.name,
      slug:        p.slug,
      description: p.description ?? "",
      price:       p.price,
      rate:        p.rate,
      siteUrl:     p.siteUrl ?? "https://ibig-eduform.com",
      category:    detectCategory(p.name),
      grille:      p.price > 0 ? grille(p.price) : null,
    }));

    const categories = [...new Set(data.map((p) => p.category))].sort((a, b) =>
      a === "Autres" ? 1 : b === "Autres" ? -1 : a.localeCompare(b, "fr")
    );

    return NextResponse.json(
      {
        ok:         true,
        total:      data.length,
        categories,
        updated_at: new Date().toISOString(),
        formations: data,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  } catch (err) {
    console.error("[api/catalogue]", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
