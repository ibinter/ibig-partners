// Seed NON-DESTRUCTIF : insère uniquement les badges et les modules de
// formation de démarrage, sans toucher au reste de la base.
// Usage : npx tsx prisma/seed-academy.ts
// (À lancer après un redémarrage du serveur dev pour que le client Prisma
//  régénéré connaisse les modèles Badge / TrainingModule.)

import { prisma } from "../src/lib/prisma";

const db = prisma as any;

const BADGES = [
  { slug: "first-sale",    title: "Première vente",      description: "Vous avez conclu votre toute première vente.",        icon: "🎉", condition: "FIRST_SALE" },
  { slug: "sales-10",      title: "Vendeur confirmé",    description: "10 ventes confirmées à votre actif.",                 icon: "🔥", condition: "SALES_10" },
  { slug: "sales-50",      title: "Champion des ventes", description: "50 ventes confirmées — performance remarquable !",     icon: "🚀", condition: "SALES_50" },
  { slug: "status-gold",   title: "Ambassadeur Gold",    description: "Vous avez atteint le statut Gold.",                   icon: "⭐", condition: "STATUS_GOLD" },
  { slug: "status-master", title: "Master Partner",      description: "Vous avez atteint le statut Master Partner.",         icon: "🏆", condition: "STATUS_MASTER" },
  { slug: "status-elite",  title: "Elite Représentant",  description: "Vous avez atteint le sommet : Elite Représentant.",   icon: "👑", condition: "STATUS_ELITE" },
  { slug: "team-10",       title: "Bâtisseur d'équipe",  description: "10 filleuls directs recrutés dans votre réseau.",      icon: "🤝", condition: "TEAM_10" },
];

const MODULES = [
  {
    title: "Bienvenue dans le programme IBIG PARTNERS",
    slug: "bienvenue-ibig-partners",
    description: "Découvrez le fonctionnement du programme d'affiliation et vos premiers pas.",
    type: "ARTICLE",
    content:
      "Bienvenue dans la famille IBIG PARTNERS !\n\nVous venez de rejoindre le programme d'affiliation multi-niveaux du groupe IBIG SARL.\n\nVos premiers pas :\n1. Complétez votre profil et vérifiez votre compte.\n2. Activez les produits que vous souhaitez promouvoir.\n3. Partagez vos liens d'affiliation.\n4. Construisez votre équipe en parrainant de nouveaux partenaires.\n\nBonne réussite !",
    minStatus: "STARTER", order: 1, active: true, featured: true, duration: "5 min", tags: "démarrage,bases",
  },
  {
    title: "Comprendre les commissions sur 3 niveaux",
    slug: "comprendre-commissions-3-niveaux",
    description: "Le système N1 / N2 / N3 expliqué simplement avec des exemples.",
    type: "ARTICLE",
    content:
      "Le système de commissions IBIG fonctionne sur 3 niveaux :\n\n• Niveau 1 (N1) : vos ventes directes — taux plein.\n• Niveau 2 (N2) : les ventes de vos filleuls — 50% de votre taux N1.\n• Niveau 3 (N3) : les ventes des filleuls de vos filleuls — 25% de votre taux N1.\n\nPlus votre réseau est actif, plus vos revenus passifs augmentent.\n\nConsultez le Guide Commissions complet dans votre espace pour tous les détails par produit.",
    minStatus: "STARTER", order: 2, active: true, featured: true, duration: "8 min", tags: "commissions,revenus",
  },
  {
    title: "Techniques de vente : conclure efficacement",
    slug: "techniques-vente-conclure",
    description: "Les meilleures pratiques pour transformer un prospect en client.",
    type: "ARTICLE",
    content:
      "Pour conclure une vente avec succès :\n\n1. Écoutez le besoin réel du client avant de proposer.\n2. Présentez le produit IBIG adapté à SA situation.\n3. Répondez aux objections avec des faits et des démonstrations.\n4. Proposez un essai ou une démo quand c'est possible.\n5. Accompagnez le client jusqu'à la prise en main complète.\n\nUn client satisfait devient votre meilleur ambassadeur.",
    minStatus: "STARTER", order: 3, active: true, featured: false, duration: "10 min", tags: "vente,prospection",
  },
  {
    title: "Assistant IA de formation IBIG",
    slug: "assistant-ia-formation",
    description: "Posez toutes vos questions à l'assistant intelligent IBIG, 24h/24.",
    type: "AI",
    content: "assistant",
    minStatus: "STARTER", order: 4, active: true, featured: true, duration: "Illimité", tags: "ia,assistant,aide",
  },
];

async function main() {
  console.log("Insertion des badges…");
  for (const b of BADGES) {
    await db.badge.upsert({ where: { slug: b.slug }, update: b, create: b });
  }

  console.log("Insertion des modules de formation…");
  for (const m of MODULES) {
    await db.trainingModule.upsert({ where: { slug: m.slug }, update: m, create: m });
  }

  console.log(`✅ ${BADGES.length} badges et ${MODULES.length} modules en place.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
