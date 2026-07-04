import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ModuleSeed = {
  slug: string;
  title: string;
  description: string;
  content: string;
  branchSlug?: string;
  duration: string;
  tags: string;
  order: number;
};

const MODULES: ModuleSeed[] = [
  {
    slug: "vendre-ibig-soft",
    title: "Comment vendre les logiciels IBIG SOFT",
    description: "Cibles, arguments clés et objections courantes pour Scolaby, Fleet 360, Lokativo, GESCOMXEL, Zelivry et STOCKFLOW ERP.",
    branchSlug: "ibig-soft",
    duration: "10 min",
    tags: "soft,scolaby,fleet360,lokativo,gescomxel,zelivry,stockflow,vente",
    order: 10,
    content: "IBIG SOFT regroupe 6 logiciels SaaS, chacun avec une cible précise : Scolaby pour les écoles, IBIG Fleet 360 pour les entreprises avec véhicules, Lokativo pour les agences immobilières, GESCOMXEL pour les boutiques et PME commerciales, Zelivry pour les entreprises de livraison, STOCKFLOW ERP pour les distributeurs.\n\nMéthode de prospection : identifiez d'abord le bon logiciel selon le métier de votre contact, puis demandez-lui quel problème concret il rencontre aujourd'hui (cahiers perdus, retards de paiement, suivi manuel des véhicules...). Présentez le logiciel comme la solution à CE problème précis, pas comme un produit générique.\n\nObjection fréquente : « C'est trop cher. » Réponse : rappelez que les abonnements démarrent bas (5 000 à 19 900 FCFA/mois selon le logiciel) et proposez l'abonnement annuel qui offre 1 à 2 mois gratuits. Comparez au coût du temps perdu ou des erreurs actuelles.\n\nObjection : « Je n'ai pas le temps de changer d'outil. » Réponse : proposez une démo de 10 minutes et rappelez que l'équipe IBIG accompagne la mise en route.\n\nAstuce : demandez toujours un essai ou une démo avant de conclure — c'est le meilleur déclencheur d'achat pour un logiciel.",
  },
  {
    slug: "vendre-ibig-eduform",
    title: "Comment vendre les formations IBIG EDUFORM",
    description: "Cibler les bons profils, argumenter le prix d'une formation certifiante et vendre en groupe pour les entreprises.",
    branchSlug: "ibig-eduform",
    duration: "10 min",
    tags: "eduform,formation,vente",
    order: 11,
    content: "IBIG EDUFORM propose plus de 25 formations, du grand public (comptabilité, RH, IA, Canva) aux formats entreprise sur mesure. Deux profils à cibler : le particulier en reconversion ou en recherche de certification, et le DRH/dirigeant qui veut former son équipe.\n\nPour un particulier : mettez en avant la certification et le retour sur investissement (ex : DAF Dirigeant = 100h pour devenir opérationnel comme directeur financier). Pour une entreprise : proposez une vente groupée (plusieurs employés en même temps) ou orientez vers le format « Sur Mesure Entreprise » si le besoin est spécifique.\n\nObjection : « C'est cher pour une formation. » Réponse : décomposez le prix par heure de formation (souvent moins cher qu'un cours particulier) et rappelez la valeur de la certification sur un CV ou pour l'entreprise.\n\nAstuce saisonnière : les entreprises budgètent leurs formations en début d'année — ciblez les DRH en janvier/février.",
  },
  {
    slug: "vendre-ibig-immo-trust",
    title: "Comment vendre IBIG IMMO TRUST",
    description: "Bien expliquer que la commission se base sur la commission d'agence, pas sur le prix du bien — et lever les objections classiques de l'immobilier.",
    branchSlug: "ibig-immo-trust",
    duration: "8 min",
    tags: "immo,gestion locative,vente immobilière,diaspora",
    order: 12,
    content: "IBIG IMMO TRUST couvre la gestion locative, la vente/achat, le conseil et l'accompagnement diaspora. Cible principale : propriétaires bailleurs fatigués de gérer leurs locataires, vendeurs pressés, et diaspora qui veut investir sans se déplacer.\n\n⚠️ Point clé à bien comprendre avant de vendre : sur les produits de gestion locative, votre commission se calcule sur le montant du produit affilié (souvent un mois de commission d'agence), pas sur la valeur du bien immobilier lui-même. Ne promettez jamais un pourcentage du prix du bien à un prospect — expliquez plutôt le service rendu.\n\nArgument fort pour la diaspora : « Vous n'avez pas besoin de vous déplacer, nous suivons le chantier ou la gestion locative à votre place, avec compte-rendu photo régulier. »\n\nObjection : « Je gère déjà moi-même mon bien. » Réponse : demandez combien de temps il y consacre chaque mois et proposez un essai sur un seul bien pour comparer la tranquillité d'esprit.",
  },
  {
    slug: "vendre-ibig-market",
    title: "Comment vendre IBIG MARKET",
    description: "Cibler les entreprises et institutions qui ont des besoins récurrents en matériel, mobilier et fournitures.",
    branchSlug: "ibig-market",
    duration: "6 min",
    tags: "market,ecommerce,btob,vente",
    order: 13,
    content: "IBIG MARKET vend du matériel informatique, du mobilier de bureau, des fournitures et du matériel BTP. Cible idéale : entreprises qui équipent de nouveaux bureaux, écoles/ONG qui font des achats groupés, chantiers BTP.\n\nArgument clé : proposez un devis B2B personnalisé plutôt qu'un simple prix catalogue — les entreprises apprécient un interlocuteur qui comprend leur besoin exact (quantité, délai, mode de paiement Mobile Money/Wave/carte).\n\nAstuce : gardez un œil sur vos contacts qui déménagent, ouvrent un nouveau bureau ou lancent un chantier — ce sont vos meilleurs prospects du moment.",
  },
  {
    slug: "vendre-ibig-digital",
    title: "Comment vendre IBIG DIGITAL",
    description: "Identifier les entreprises sans présence digitale professionnelle et argumenter la création de site/community management.",
    branchSlug: "ibig-digital",
    duration: "7 min",
    tags: "digital,site web,community management,vente",
    order: 14,
    content: "IBIG DIGITAL crée des sites vitrines, l'identité visuelle et gère les réseaux sociaux des entreprises. Cible : commerçants, PME et professionnels qui n'ont pas de site web ou dont les réseaux sociaux sont à l'abandon.\n\nMéthode simple : regardez le profil Facebook/Instagram de votre prospect. S'il n'a pas posté depuis longtemps ou n'a pas de site, c'est votre porte d'entrée : « J'ai remarqué que votre page n'est plus très active, ça peut faire perdre des clients face à la concurrence. »\n\nArgument pour le community management : proposer un abonnement mensuel rassure — pas de gros investissement ponctuel, un service continu.\n\nObjection : « Je n'ai pas de budget pour ça maintenant. » Réponse : présentez le site vitrine ou le community management comme un investissement qui ramène des clients, pas une dépense.",
  },
  {
    slug: "vendre-ibig-digital-kits",
    title: "Comment vendre IBIG DIGITAL KITS",
    description: "Vulgariser des sujets techniques (ERP, IA, chatbots) pour convaincre des dirigeants non-techniques.",
    branchSlug: "ibig-digital-kits",
    duration: "8 min",
    tags: "digital kits,erp,ia,chatbot,vente",
    order: 15,
    content: "IBIG DIGITAL KITS propose des solutions technologiques (ERP, applications mobiles, IA, chatbots) souvent perçues comme complexes par les dirigeants. Votre rôle : traduire la technique en bénéfice concret.\n\nExemple : au lieu de dire « nous intégrons un ERP », dites « vos ventes, vos stocks et votre facturation seront visibles en un clic, sans ressaisie ». Pour un chatbot IA : « votre entreprise répond aux clients 24h/24 sur WhatsApp, même la nuit et le week-end. »\n\nObjection : « C'est trop technique pour moi. » Réponse : rassurez sur l'accompagnement complet inclus dans la prestation — le client n'a rien à configurer lui-même.\n\nCible prioritaire : entreprises en croissance qui commencent à se sentir dépassées par leurs outils actuels (Excel, cahiers, WhatsApp non structuré).",
  },
  {
    slug: "vendre-ibig-conseil-plus",
    title: "Comment vendre IBIG CONSEIL+",
    description: "Vendre du conseil et de l'accompagnement à des entrepreneurs et dirigeants — une vente de confiance, pas de produit.",
    branchSlug: "ibig-conseil-plus",
    duration: "7 min",
    tags: "conseil,creation entreprise,audit,vente",
    order: 16,
    content: "IBIG CONSEIL+ vend de l'accompagnement (création d'entreprise, audit organisationnel, structuration juridique/comptable) — un service immatériel qui se vend sur la confiance et la crédibilité, pas sur un catalogue.\n\nCible : porteurs de projet qui hésitent à se lancer, dirigeants de PME en croissance rapide qui perdent en organisation, associations/ONG en structuration.\n\nMéthode : posez des questions ouvertes avant de proposer quoi que ce soit (« Où en êtes-vous dans votre projet ? Qu'est-ce qui vous bloque ? »). Le service se vend ensuite naturellement comme la réponse à un blocage identifié.\n\nObjection : « Je peux le faire moi-même. » Réponse : rappelez le temps et les erreurs évitées, et que l'accompagnement inclut un suivi, pas juste un conseil ponctuel.",
  },
  {
    slug: "developper-reseau-ibig-partners",
    title: "Comment présenter le programme IBIG PARTNERS lui-même",
    description: "Recruter de nouveaux filleuls : l'argumentaire pour convaincre quelqu'un de rejoindre le programme.",
    branchSlug: "ibig-partners-branch",
    duration: "6 min",
    tags: "recrutement,filleul,partners,vente",
    order: 17,
    content: "Contrairement aux autres branches, ici vous ne vendez pas un produit — vous recrutez un futur partenaire. L'argument central : inscription gratuite, aucun investissement, commissions sur 3 niveaux de parrainage.\n\nCible idéale : commerciaux, étudiants, personnes déjà actives sur les réseaux sociaux, membres d'associations professionnelles — bref, toute personne avec un réseau et de la motivation.\n\nScript court : « Je fais partie d'un programme d'affiliation gratuit, IBIG PARTNERS. Je gagne des commissions en recommandant des logiciels, formations et services utiles à mon entourage. Ça t'intéresserait d'en savoir plus, sans engagement ? »\n\nObjection : « Je n'ai pas le temps de vendre. » Réponse : rappelez que même 2-3 recommandations par mois génèrent des revenus, et que le réseau (filleuls N2/N3) travaille aussi pour vous.",
  },
  {
    slug: "vendre-ibig-multiservices",
    title: "Comment vendre IBIG MULTISERVICES",
    description: "Repérer les moments de vie (mariage, déménagement, recrutement) qui déclenchent un besoin immédiat.",
    branchSlug: "ibig-multiservices",
    duration: "7 min",
    tags: "multiservices,evenementiel,demenagement,placement,vente",
    order: 18,
    content: "IBIG MULTISERVICES couvre l'événementiel, le déménagement, la maintenance et le placement de personnel — des services liés à des moments précis de la vie personnelle ou professionnelle de vos contacts.\n\nMéthode : soyez attentif aux annonces de vos contacts (mariage à venir, nouveau bureau, recherche d'employé) — c'est le meilleur moment pour proposer le service adapté, pas après coup.\n\nArgument événementiel : « Vous n'avez qu'à profiter du jour J, on s'occupe de tout : lieu, traiteur, décoration. » Argument placement de personnel : « Nous présélectionnons les candidats, vous ne recevez que des profils vérifiés. »\n\nObjection : « Je préfère m'en occuper moi-même. » Réponse : mettez en avant le gain de temps et l'expérience d'IBIG sur ce type de prestation.",
  },
  {
    slug: "gerer-les-objections-courantes",
    title: "Gérer les objections courantes tous produits confondus",
    description: "Les 5 objections les plus fréquentes et comment y répondre, quel que soit le produit vendu.",
    duration: "8 min",
    tags: "objections,vente,technique",
    order: 19,
    content: "Quel que soit le produit IBIG que vous vendez, 5 objections reviennent presque toujours :\n\n1. « C'est trop cher » — Ne baissez jamais le prix. Recentrez sur la valeur : le temps gagné, le problème résolu, le retour sur investissement.\n\n2. « Je vais réfléchir » — Ne relancez pas dans le vide. Fixez une date de rappel précise (« Je vous rappelle jeudi, ça vous va ? ») et proposez d'envoyer un support (fiche produit, exemple chiffré).\n\n3. « Je n'ai pas confiance » — Montrez des preuves concrètes : site officiel du produit, témoignages, démonstration en direct.\n\n4. « Je n'ai pas le temps » — Réduisez l'effort perçu : proposez une démo de 10 minutes ou un rendez-vous court plutôt qu'un grand rendez-vous.\n\n5. « J'ai déjà une solution » — Ne dénigrez jamais le concurrent. Demandez ce qui manque à sa solution actuelle et montrez comment IBIG comble ce manque précis.\n\nRègle d'or : écoutez plus que vous ne parlez. Une objection est souvent une demande d'information déguisée.",
  },
];

export async function POST() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const branches = await prisma.branch.findMany({ select: { id: true, slug: true } });
  const branchIdBySlug = new Map(branches.map((b) => [b.slug, b.id]));

  let upserted = 0;
  for (const m of MODULES) {
    const branchId = m.branchSlug ? branchIdBySlug.get(m.branchSlug) : undefined;
    await prisma.trainingModule.upsert({
      where: { slug: m.slug },
      update: {
        title: m.title,
        description: m.description,
        type: "ARTICLE",
        content: m.content,
        duration: m.duration,
        tags: m.tags,
        order: m.order,
        branchId: branchId ?? null,
        active: true,
      },
      create: {
        slug: m.slug,
        title: m.title,
        description: m.description,
        type: "ARTICLE",
        content: m.content,
        duration: m.duration,
        tags: m.tags,
        order: m.order,
        branchId: branchId ?? null,
        active: true,
      },
    });
    upserted++;
  }

  return NextResponse.json({
    ok: true,
    upserted,
    message: `${upserted} module(s) de formation synchronisé(s) (guides de vente par branche + gestion des objections).`,
  });
}
