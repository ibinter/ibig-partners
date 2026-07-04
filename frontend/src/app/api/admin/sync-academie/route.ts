import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    description: "Cibles, arguments clÃ©s et objections courantes pour Scolaby, Fleet 360, Lokativo, GESCOMXEL, Zelivry et STOCKFLOW ERP.",
    branchSlug: "ibig-soft",
    duration: "10 min",
    tags: "soft,scolaby,fleet360,lokativo,gescomxel,zelivry,stockflow,vente",
    order: 10,
    content: "IBIG SOFT regroupe 6 logiciels SaaS, chacun avec une cible prÃ©cise : Scolaby pour les Ã©coles, IBIG Fleet 360 pour les entreprises avec vÃ©hicules, Lokativo pour les agences immobiliÃ¨res, GESCOMXEL pour les boutiques et PME commerciales, Zelivry pour les entreprises de livraison, STOCKFLOW ERP pour les distributeurs.\n\nMÃ©thode de prospection : identifiez d'abord le bon logiciel selon le mÃ©tier de votre contact, puis demandez-lui quel problÃ¨me concret il rencontre aujourd'hui (cahiers perdus, retards de paiement, suivi manuel des vÃ©hicules...). PrÃ©sentez le logiciel comme la solution Ã  CE problÃ¨me prÃ©cis, pas comme un produit gÃ©nÃ©rique.\n\nObjection frÃ©quente : Â« C'est trop cher. Â» RÃ©ponse : rappelez que les abonnements dÃ©marrent bas (5 000 Ã  19 900 FCFA/mois selon le logiciel) et proposez l'abonnement annuel qui offre 1 Ã  2 mois gratuits. Comparez au coÃ»t du temps perdu ou des erreurs actuelles.\n\nObjection : Â« Je n'ai pas le temps de changer d'outil. Â» RÃ©ponse : proposez une dÃ©mo de 10 minutes et rappelez que l'Ã©quipe IBIG accompagne la mise en route.\n\nAstuce : demandez toujours un essai ou une dÃ©mo avant de conclure â€” c'est le meilleur dÃ©clencheur d'achat pour un logiciel.",
  },
  {
    slug: "vendre-ibig-eduform",
    title: "Comment vendre les formations IBIG EDUFORM",
    description: "Cibler les bons profils, argumenter le prix d'une formation certifiante et vendre en groupe pour les entreprises.",
    branchSlug: "ibig-eduform",
    duration: "10 min",
    tags: "eduform,formation,vente",
    order: 11,
    content: "IBIG EDUFORM propose plus de 25 formations, du grand public (comptabilitÃ©, RH, IA, Canva) aux formats entreprise sur mesure. Deux profils Ã  cibler : le particulier en reconversion ou en recherche de certification, et le DRH/dirigeant qui veut former son Ã©quipe.\n\nPour un particulier : mettez en avant la certification et le retour sur investissement (ex : DAF Dirigeant = 100h pour devenir opÃ©rationnel comme directeur financier). Pour une entreprise : proposez une vente groupÃ©e (plusieurs employÃ©s en mÃªme temps) ou orientez vers le format Â« Sur Mesure Entreprise Â» si le besoin est spÃ©cifique.\n\nObjection : Â« C'est cher pour une formation. Â» RÃ©ponse : dÃ©composez le prix par heure de formation (souvent moins cher qu'un cours particulier) et rappelez la valeur de la certification sur un CV ou pour l'entreprise.\n\nAstuce saisonniÃ¨re : les entreprises budgÃ¨tent leurs formations en dÃ©but d'annÃ©e â€” ciblez les DRH en janvier/fÃ©vrier.",
  },
  {
    slug: "vendre-ibig-immo-trust",
    title: "Comment vendre IBIG IMMO TRUST",
    description: "Bien expliquer que la commission se base sur la commission d'agence, pas sur le prix du bien â€” et lever les objections classiques de l'immobilier.",
    branchSlug: "ibig-immo-trust",
    duration: "8 min",
    tags: "immo,gestion locative,vente immobiliÃ¨re,diaspora",
    order: 12,
    content: "IBIG IMMO TRUST couvre la gestion locative, la vente/achat, le conseil et l'accompagnement diaspora. Cible principale : propriÃ©taires bailleurs fatiguÃ©s de gÃ©rer leurs locataires, vendeurs pressÃ©s, et diaspora qui veut investir sans se dÃ©placer.\n\nâš ï¸ Point clÃ© Ã  bien comprendre avant de vendre : sur les produits de gestion locative, votre commission se calcule sur le montant du produit affiliÃ© (souvent un mois de commission d'agence), pas sur la valeur du bien immobilier lui-mÃªme. Ne promettez jamais un pourcentage du prix du bien Ã  un prospect â€” expliquez plutÃ´t le service rendu.\n\nArgument fort pour la diaspora : Â« Vous n'avez pas besoin de vous dÃ©placer, nous suivons le chantier ou la gestion locative Ã  votre place, avec compte-rendu photo rÃ©gulier. Â»\n\nObjection : Â« Je gÃ¨re dÃ©jÃ  moi-mÃªme mon bien. Â» RÃ©ponse : demandez combien de temps il y consacre chaque mois et proposez un essai sur un seul bien pour comparer la tranquillitÃ© d'esprit.",
  },
  {
    slug: "vendre-ibig-market",
    title: "Comment vendre IBIG MARKET",
    description: "Cibler les entreprises et institutions qui ont des besoins rÃ©currents en matÃ©riel, mobilier et fournitures.",
    branchSlug: "ibig-market",
    duration: "6 min",
    tags: "market,ecommerce,btob,vente",
    order: 13,
    content: "IBIG MARKET vend du matÃ©riel informatique, du mobilier de bureau, des fournitures et du matÃ©riel BTP. Cible idÃ©ale : entreprises qui Ã©quipent de nouveaux bureaux, Ã©coles/ONG qui font des achats groupÃ©s, chantiers BTP.\n\nArgument clÃ© : proposez un devis B2B personnalisÃ© plutÃ´t qu'un simple prix catalogue â€” les entreprises apprÃ©cient un interlocuteur qui comprend leur besoin exact (quantitÃ©, dÃ©lai, mode de paiement Mobile Money/Wave/carte).\n\nAstuce : gardez un Å“il sur vos contacts qui dÃ©mÃ©nagent, ouvrent un nouveau bureau ou lancent un chantier â€” ce sont vos meilleurs prospects du moment.",
  },
  {
    slug: "vendre-ibig-digital",
    title: "Comment vendre IBIG DIGITAL",
    description: "Identifier les entreprises sans prÃ©sence digitale professionnelle et argumenter la crÃ©ation de site/community management.",
    branchSlug: "ibig-digital",
    duration: "7 min",
    tags: "digital,site web,community management,vente",
    order: 14,
    content: "IBIG DIGITAL crÃ©e des sites vitrines, l'identitÃ© visuelle et gÃ¨re les rÃ©seaux sociaux des entreprises. Cible : commerÃ§ants, PME et professionnels qui n'ont pas de site web ou dont les rÃ©seaux sociaux sont Ã  l'abandon.\n\nMÃ©thode simple : regardez le profil Facebook/Instagram de votre prospect. S'il n'a pas postÃ© depuis longtemps ou n'a pas de site, c'est votre porte d'entrÃ©e : Â« J'ai remarquÃ© que votre page n'est plus trÃ¨s active, Ã§a peut faire perdre des clients face Ã  la concurrence. Â»\n\nArgument pour le community management : proposer un abonnement mensuel rassure â€” pas de gros investissement ponctuel, un service continu.\n\nObjection : Â« Je n'ai pas de budget pour Ã§a maintenant. Â» RÃ©ponse : prÃ©sentez le site vitrine ou le community management comme un investissement qui ramÃ¨ne des clients, pas une dÃ©pense.",
  },
  {
    slug: "vendre-ibig-digital-kits",
    title: "Comment vendre IBIG DIGITAL KITS",
    description: "Vulgariser des sujets techniques (ERP, IA, chatbots) pour convaincre des dirigeants non-techniques.",
    branchSlug: "ibig-digital-kits",
    duration: "8 min",
    tags: "digital kits,erp,ia,chatbot,vente",
    order: 15,
    content: "IBIG DIGITAL KITS propose des solutions technologiques (ERP, applications mobiles, IA, chatbots) souvent perÃ§ues comme complexes par les dirigeants. Votre rÃ´le : traduire la technique en bÃ©nÃ©fice concret.\n\nExemple : au lieu de dire Â« nous intÃ©grons un ERP Â», dites Â« vos ventes, vos stocks et votre facturation seront visibles en un clic, sans ressaisie Â». Pour un chatbot IA : Â« votre entreprise rÃ©pond aux clients 24h/24 sur WhatsApp, mÃªme la nuit et le week-end. Â»\n\nObjection : Â« C'est trop technique pour moi. Â» RÃ©ponse : rassurez sur l'accompagnement complet inclus dans la prestation â€” le client n'a rien Ã  configurer lui-mÃªme.\n\nCible prioritaire : entreprises en croissance qui commencent Ã  se sentir dÃ©passÃ©es par leurs outils actuels (Excel, cahiers, WhatsApp non structurÃ©).",
  },
  {
    slug: "vendre-ibig-conseil-plus",
    title: "Comment vendre IBIG CONSEIL+",
    description: "Vendre du conseil et de l'accompagnement Ã  des entrepreneurs et dirigeants â€” une vente de confiance, pas de produit.",
    branchSlug: "ibig-conseil-plus",
    duration: "7 min",
    tags: "conseil,creation entreprise,audit,vente",
    order: 16,
    content: "IBIG CONSEIL+ vend de l'accompagnement (crÃ©ation d'entreprise, audit organisationnel, structuration juridique/comptable) â€” un service immatÃ©riel qui se vend sur la confiance et la crÃ©dibilitÃ©, pas sur un catalogue.\n\nCible : porteurs de projet qui hÃ©sitent Ã  se lancer, dirigeants de PME en croissance rapide qui perdent en organisation, associations/ONG en structuration.\n\nMÃ©thode : posez des questions ouvertes avant de proposer quoi que ce soit (Â« OÃ¹ en Ãªtes-vous dans votre projet ? Qu'est-ce qui vous bloque ? Â»). Le service se vend ensuite naturellement comme la rÃ©ponse Ã  un blocage identifiÃ©.\n\nObjection : Â« Je peux le faire moi-mÃªme. Â» RÃ©ponse : rappelez le temps et les erreurs Ã©vitÃ©es, et que l'accompagnement inclut un suivi, pas juste un conseil ponctuel.",
  },
  {
    slug: "developper-reseau-ibig-partners",
    title: "Comment prÃ©senter le programme IBIG PARTNERS lui-mÃªme",
    description: "Recruter de nouveaux filleuls : l'argumentaire pour convaincre quelqu'un de rejoindre le programme.",
    branchSlug: "ibig-partners-branch",
    duration: "6 min",
    tags: "recrutement,filleul,partners,vente",
    order: 17,
    content: "Contrairement aux autres branches, ici vous ne vendez pas un produit â€” vous recrutez un futur partenaire. L'argument central : inscription gratuite, aucun investissement, commissions sur 3 niveaux de parrainage.\n\nCible idÃ©ale : commerciaux, Ã©tudiants, personnes dÃ©jÃ  actives sur les rÃ©seaux sociaux, membres d'associations professionnelles â€” bref, toute personne avec un rÃ©seau et de la motivation.\n\nScript court : Â« Je fais partie d'un programme d'affiliation gratuit, IBIG PARTNERS. Je gagne des commissions en recommandant des logiciels, formations et services utiles Ã  mon entourage. Ã‡a t'intÃ©resserait d'en savoir plus, sans engagement ? Â»\n\nObjection : Â« Je n'ai pas le temps de vendre. Â» RÃ©ponse : rappelez que mÃªme 2-3 recommandations par mois gÃ©nÃ¨rent des revenus, et que le rÃ©seau (filleuls N2/N3) travaille aussi pour vous.",
  },
  {
    slug: "vendre-ibig-multiservices",
    title: "Comment vendre IBIG MULTISERVICES",
    description: "RepÃ©rer les moments de vie (mariage, dÃ©mÃ©nagement, recrutement) qui dÃ©clenchent un besoin immÃ©diat.",
    branchSlug: "ibig-multiservices",
    duration: "7 min",
    tags: "multiservices,evenementiel,demenagement,placement,vente",
    order: 18,
    content: "IBIG MULTISERVICES couvre l'Ã©vÃ©nementiel, le dÃ©mÃ©nagement, la maintenance et le placement de personnel â€” des services liÃ©s Ã  des moments prÃ©cis de la vie personnelle ou professionnelle de vos contacts.\n\nMÃ©thode : soyez attentif aux annonces de vos contacts (mariage Ã  venir, nouveau bureau, recherche d'employÃ©) â€” c'est le meilleur moment pour proposer le service adaptÃ©, pas aprÃ¨s coup.\n\nArgument Ã©vÃ©nementiel : Â« Vous n'avez qu'Ã  profiter du jour J, on s'occupe de tout : lieu, traiteur, dÃ©coration. Â» Argument placement de personnel : Â« Nous prÃ©sÃ©lectionnons les candidats, vous ne recevez que des profils vÃ©rifiÃ©s. Â»\n\nObjection : Â« Je prÃ©fÃ¨re m'en occuper moi-mÃªme. Â» RÃ©ponse : mettez en avant le gain de temps et l'expÃ©rience d'IBIG sur ce type de prestation.",
  },
  {
    slug: "gerer-les-objections-courantes",
    title: "GÃ©rer les objections courantes tous produits confondus",
    description: "Les 5 objections les plus frÃ©quentes et comment y rÃ©pondre, quel que soit le produit vendu.",
    duration: "8 min",
    tags: "objections,vente,technique",
    order: 19,
    content: "Quel que soit le produit IBIG que vous vendez, 5 objections reviennent presque toujours :\n\n1. Â« C'est trop cher Â» â€” Ne baissez jamais le prix. Recentrez sur la valeur : le temps gagnÃ©, le problÃ¨me rÃ©solu, le retour sur investissement.\n\n2. Â« Je vais rÃ©flÃ©chir Â» â€” Ne relancez pas dans le vide. Fixez une date de rappel prÃ©cise (Â« Je vous rappelle jeudi, Ã§a vous va ? Â») et proposez d'envoyer un support (fiche produit, exemple chiffrÃ©).\n\n3. Â« Je n'ai pas confiance Â» â€” Montrez des preuves concrÃ¨tes : site officiel du produit, tÃ©moignages, dÃ©monstration en direct.\n\n4. Â« Je n'ai pas le temps Â» â€” RÃ©duisez l'effort perÃ§u : proposez une dÃ©mo de 10 minutes ou un rendez-vous court plutÃ´t qu'un grand rendez-vous.\n\n5. Â« J'ai dÃ©jÃ  une solution Â» â€” Ne dÃ©nigrez jamais le concurrent. Demandez ce qui manque Ã  sa solution actuelle et montrez comment IBIG comble ce manque prÃ©cis.\n\nRÃ¨gle d'or : Ã©coutez plus que vous ne parlez. Une objection est souvent une demande d'information dÃ©guisÃ©e.",
  },
];

export async function POST() {`n  try {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Non autorisÃ©" }, { status: 403 });
  }

  const branches = await prisma.branch.findMany({ select: { id: true, slug: true } });
  const branchIdBySlug = new Map(branches.map((b) => [b.slug, b.id]));

  await Promise.all(
    MODULES.map((m) => {
      const branchId = m.branchSlug ? branchIdBySlug.get(m.branchSlug) : undefined;
      return prisma.trainingModule.upsert({
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
    })
  );
  const upserted = MODULES.length;

  return NextResponse.json({
    ok: true,
    upserted,
    message: `${upserted} module(s) de formation synchronisÃ©(s) (guides de vente par branche + gestion des objections).`,
  });
  } catch (err: any) {
    console.error("sync-academie error:", err);
    return NextResponse.json({ error: err?.message ?? "Erreur serveur" }, { status: 500 });
  }
}
