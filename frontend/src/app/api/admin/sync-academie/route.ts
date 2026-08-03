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
  // ── DÉMARRAGE AFFILIÉ ────────────────────────────────────────────────────
  {
    slug: "demarrage-affilie-premiers-pas",
    title: "Premiers pas : tout ce qu'il faut faire dès l'inscription",
    description: "Checklist complète pour bien démarrer — profil, lien affilié, premier partage — et éviter les erreurs des débutants.",
    duration: "8 min",
    tags: "démarrage,onboarding,profil,affilié",
    order: 1,
    content: "Bienvenue dans IBIG PARTNERS. Voici exactement ce que tu dois faire dans tes 48 premières heures.\n\n✅ ÉTAPE 1 — Complète ton profil\nAjoute ta photo, ton numéro WhatsApp et une courte bio. Un profil complet inspire confiance à tes futurs filleuls et prospects.\n\n✅ ÉTAPE 2 — Génère tes liens affiliés\nDans ton tableau de bord, va sur chaque produit qui t'intéresse et génère ton lien unique. Commence par les produits que tu connais ou utilises toi-même.\n\n✅ ÉTAPE 3 — Identifie tes 10 premiers prospects\nNote sur papier ou sur ton téléphone 10 personnes de ton entourage qui pourraient être intéressées par un produit IBIG. Pour chaque personne, note le produit qui lui correspond.\n\n✅ ÉTAPE 4 — Prépare ton profil WhatsApp\nChange ton statut WhatsApp pour mentionner discrètement que tu recommandes des solutions utiles (logiciels, formations, services).\n\n✅ ÉTAPE 5 — Envoie ton premier message\nChoisis UNE personne de ta liste et envoie-lui un message personnalisé (pas un copier-coller générique). Parle d'abord de son problème, ensuite du produit.\n\n⚠️ Erreur à éviter : ne partagez pas votre lien en masse à tout le monde sans contexte. Un message ciblé à une personne vaut mieux que 50 messages génériques envoyés à tous vos contacts.",
  },
  {
    slug: "comprendre-commissions-ibig",
    title: "Comprendre les commissions : N1, N2, N3 — exemples chiffrés",
    description: "Comment sont calculées vos commissions à chaque niveau — avec des exemples concrets en FCFA pour comprendre vos revenus potentiels.",
    duration: "10 min",
    tags: "commissions,N1,N2,N3,revenus,calcul",
    order: 2,
    content: "Le programme IBIG PARTNERS fonctionne sur 3 niveaux de commission. Voici comment ça marche en pratique.\n\n📌 NIVEAU 1 (N1) — Vos ventes directes\nVous recommandez un produit, quelqu'un achète via votre lien : vous touchez la commission N1. C'est votre revenu principal.\n\nExemple : vous recommandez Scolaby (10 000 FCFA/mois, taux 20%). Un directeur d'école s'abonne → vous gagnez 2 000 FCFA chaque mois tant qu'il est abonné.\n\n📌 NIVEAU 2 (N2) — Les ventes de vos filleuls\nVous recrutez un affilié (filleul N1). Quand il fait une vente, vous touchez aussi un % sur ses ventes. Vous travaillez UNE FOIS pour recruter et vous gagnez sur tout ce qu'il vend.\n\n📌 NIVEAU 3 (N3) — Les ventes des filleuls de vos filleuls\nSi votre filleul recrute lui-même d'autres affiliés, vous touchez encore un % sur LEURS ventes. C'est là que le revenu devient passif.\n\n💡 Simulation rapide :\n- Vous avez 3 filleuls directs actifs\n- Chacun vend 1 abonnement Scolaby/mois (2 000 FCFA de commission N1 pour eux)\n- Vous touchez votre % N2 sur chacune de ces 3 ventes, chaque mois, sans bouger\n\nConseil : concentrez-vous d'abord sur vos ventes directes (N1) pour apprendre. Ensuite commencez à recruter des filleuls sérieux pour activer le levier N2/N3.",
  },

  // ── SCRIPTS DE VENTE ─────────────────────────────────────────────────────
  {
    slug: "scripts-whatsapp-prêts-à-envoyer",
    title: "Scripts WhatsApp prêts à envoyer (par type de produit)",
    description: "Des messages concrets à adapter et envoyer immédiatement — pour logiciels, formations, services et recrutement d'affiliés.",
    duration: "12 min",
    tags: "scripts,whatsapp,message,prospection,vente",
    order: 3,
    content: "Voici des scripts WhatsApp testés et efficaces. Adaptez toujours le prénom et le contexte avant d'envoyer — jamais de copier-coller mot pour mot.\n\n─── LOGICIEL (ex : Scolaby pour une école) ───\n« Bonjour [Prénom], j'espère que tu vas bien. Je voulais te parler d'une chose utile pour [ton école / ton établissement]. Il y a un logiciel qui gère automatiquement les inscriptions, les notes et les bulletins — ça évite tous les tableaux Excel et les erreurs. Ça s'appelle Scolaby, ça démarre à 10 000 FCFA/mois. Je peux t'envoyer la démo si tu veux voir comment ça marche ? »\n\n─── FORMATION (ex : EDUFORM) ───\n« Bonjour [Prénom], tu m'avais dit que tu cherchais à monter en compétences en [comptabilité / RH / management]. Il y a une formation certifiante que je viens de découvrir, IBIG EDUFORM. Elle est sérieuse, avec un certificat à la clé. Tu veux que je t'envoie le programme ? »\n\n─── SERVICE (ex : Community Management) ───\n« Bonjour [Prénom], j'ai vu que ta page [Facebook / Instagram] n'est plus très active. C'est dommage parce que tes concurrents, eux, continuent à poster. Il y a un service de gestion des réseaux à 35 000 FCFA/mois qui peut s'en occuper pour toi. Tu veux qu'on en parle ? »\n\n─── RECRUTEMENT D'UN FILLEUL ───\n« Bonjour [Prénom], je fais partie d'un programme d'affiliation qui me permet de gagner des commissions en recommandant des logiciels et formations utiles. C'est gratuit, sans investissement. Tu n'as pas à vendre agressivement — juste recommander à tes contacts ce qui peut leur être utile. Si ça t'intéresse, je t'explique en 5 minutes. »\n\n⚠️ Règle absolue : toujours commencer par une question ou une observation sur le prospect, jamais par le lien ou le tarif.",
  },
  {
    slug: "script-relance-prospect",
    title: "Comment relancer un prospect sans être lourd",
    description: "La méthode pour suivre un prospect qui n'a pas répondu — timing, formulations et moment d'arrêter.",
    duration: "6 min",
    tags: "relance,suivi,prospect,vente",
    order: 4,
    content: "La plupart des ventes ne se font pas au premier message. Voici comment relancer intelligemment.\n\n📅 CALENDRIER DE RELANCE RECOMMANDÉ\n\nJour 1 → Premier message (voir scripts)\nJour 3 → Relance 1 : « Bonjour [Prénom], je voulais savoir si tu avais eu le temps de regarder ce que je t'avais envoyé. Je reste dispo si tu as des questions. »\nJour 7 → Relance 2 (avec une nouvelle info utile) : « Bonjour [Prénom], j'ai pensé à toi en voyant ça — [donnée concrète, témoignage, actualité liée à son secteur]. Ça pourrait changer ta vision sur [le produit]. »\nJour 14 → Relance 3 (dernière) : « Bonjour [Prénom], je ne veux pas te déranger davantage. Si jamais tu es intéressé dans les prochaines semaines, je suis là. Je te souhaite une bonne continuation. »\n\nPourquoi 3 relances maximum ? Au-delà, ça devient du harcèlement. Et une personne qui ne répond pas après 3 tentatives bien espacées n'est pas prête aujourd'hui — ce n'est pas un refus définitif, c'est un « pas maintenant ».\n\n💡 Astuce : gardez un tableau simple (même sur papier) : Nom | Produit proposé | Date 1er contact | Statut. Ça vous permet de retrouver les prospects à relancer sans tout oublier.",
  },
  {
    slug: "methode-aida-vente-ibig",
    title: "La méthode AIDA appliquée aux produits IBIG",
    description: "La structure de vente la plus efficace — Attention, Intérêt, Désir, Action — avec des exemples concrets pour chaque produit IBIG.",
    duration: "9 min",
    tags: "AIDA,méthode,vente,structure,argumentation",
    order: 5,
    content: "AIDA est la structure de vente la plus utilisée au monde. Voici comment l'appliquer pour IBIG.\n\n🔴 A — ATTENTION\nCaptez l'attention avec une question ou une observation qui touche directement le prospect.\n❌ Mauvais : « Je vends un logiciel de gestion scolaire. »\n✅ Bon : « Est-ce que tu perds encore du temps à faire les bulletins à la main ? »\n\n🟡 I — INTÉRÊT\nMontrez que vous comprenez son problème et que vous avez quelque chose de pertinent.\n✅ « Scolaby est utilisé par des écoles comme la tienne pour automatiser les notes, les bulletins et les SMS aux parents — sans ressaisie manuelle. »\n\n🟢 D — DÉSIR\nFaites-lui imaginer sa vie avec le produit. Parlez de résultats concrets.\n✅ « Imagine : la remise des bulletins se fait en un clic, les parents reçoivent une notification SMS automatique. Plus de stress, plus d'erreurs. »\n\n🔵 A — ACTION\nDemandez clairement ce que vous voulez — une démo, un rendez-vous, un essai.\n✅ « Je peux t'organiser une démo de 10 minutes cette semaine. Tu préfères jeudi ou vendredi ? »\n\nNote : ne passez pas à l'Action avant que les 3 premières étapes aient créé de l'intérêt. Un prospect qui n'a pas encore compris la valeur du produit dira toujours non.",
  },

  // ── RÉSEAUX SOCIAUX ───────────────────────────────────────────────────────
  {
    slug: "vendre-sur-facebook-ibig",
    title: "Vendre sur Facebook : stratégie concrète pour affiliés IBIG",
    description: "Comment utiliser Facebook pour générer des prospects sans paraître un vendeur — posts, groupes, stories et messages directs.",
    duration: "10 min",
    tags: "facebook,réseaux sociaux,prospection,contenu,vente",
    order: 6,
    content: "Facebook reste le réseau le plus puissant en Côte d'Ivoire et dans la sous-région. Voici comment l'utiliser efficacement.\n\n📌 VOTRE PROFIL PERSONNEL\nVotre profil doit refléter une personne de confiance, pas un vendeur. Photo professionnelle, bio claire. Évitez de spammer votre mur de liens affiliés — ça fait fuir.\n\n📌 STRATÉGIE DE CONTENU (3 types de posts à alterner)\n\n1. Posts utiles (60% du temps) — Partagez des conseils, des infos utiles liées aux secteurs que vous couvrez (gestion d'entreprise, digitalisation, formation). Ces posts créent de la crédibilité.\nExemple : « 3 signes que votre entreprise a besoin d'un logiciel de gestion [puis liste utile] »\n\n2. Posts témoignages (20% du temps) — Partagez un résultat ou un retour positif (réel ou de l'équipe IBIG). Les gens achètent ce que d'autres ont validé.\n\n3. Posts offre (20% du temps) — Là seulement vous mentionnez un produit IBIG, avec votre lien. Soyez précis : quel produit, pour qui, pourquoi maintenant.\n\n📌 GROUPES FACEBOOK\nRejoignez des groupes actifs de chefs d'entreprise, DRH, directeurs d'écoles, agents immobiliers, selon les branches que vous vendez. N'envoyez pas de liens dans les groupes — participez aux discussions et apportez de la valeur. Les gens vous contactent ensuite en privé.\n\n💡 Fréquence recommandée : 3 à 4 posts par semaine minimum. La régularité bat l'intensité.",
  },
  {
    slug: "vendre-sur-whatsapp-statuts",
    title: "Vendre sur WhatsApp : statuts, groupes et messages directs",
    description: "WhatsApp est l'outil le plus direct — stratégie complète pour générer des ventes via vos statuts et vos conversations.",
    duration: "8 min",
    tags: "whatsapp,statuts,groupes,vente,réseaux sociaux",
    order: 7,
    content: "WhatsApp est l'outil numéro 1 en Afrique de l'Ouest pour la vente. Utilisez-le intelligemment.\n\n📌 LES STATUTS WHATSAPP\nVos statuts sont vus par tous vos contacts — c'est de la publicité gratuite. Stratégie recommandée :\n- Lundi/Mercredi : statut utile (conseil, astuce, fait intéressant lié à un secteur)\n- Vendredi : statut offre (produit IBIG avec visuels, avantages et lien affilié)\n- Dimanche : statut humain (votre quotidien, votre motivation) — ça crée de la proximité\n\nFormat idéal : image/visuel + texte court. Les statuts texte seuls sont moins vus.\n\n📌 GROUPES WHATSAPP\nSi vous gérez ou êtes dans des groupes professionnels, partagez des informations utiles régulièrement. Quand vous partagez un produit, contextualisez : « Pour ceux qui cherchent une solution pour gérer leur école / leur flotte / leur comptabilité... »\n\nNe spammez jamais un groupe sans rapport avec le produit — vous serez expulsé et vous perdrez votre crédibilité.\n\n📌 MESSAGES DIRECTS\nC'est votre canal le plus efficace. Un message personnalisé vaut 100 statuts. Repérez dans vos contacts qui a un besoin, et envoyez UN message ciblé (voir module Scripts).\n\n💡 Astuce : enregistrez vos meilleurs visuels et messages dans « Favoris » WhatsApp pour les retrouver rapidement lors d'une prospection.",
  },
  {
    slug: "vendre-sur-linkedin-ibig",
    title: "LinkedIn pour vendre les services B2B IBIG (CONSEIL+, DIGITAL, SOFT)",
    description: "LinkedIn est le réseau idéal pour les services aux entreprises — comment créer un profil crédible et prospecter des décideurs.",
    duration: "8 min",
    tags: "linkedin,B2B,réseaux sociaux,vente,prospection",
    order: 8,
    content: "LinkedIn est incontournable pour vendre IBIG CONSEIL+, IBIG DIGITAL et IBIG SOFT à des entreprises. Voici comment.\n\n📌 OPTIMISEZ VOTRE PROFIL LINKEDIN\nVotre profil est votre carte de visite numérique. Points essentiels :\n- Photo professionnelle (même fond neutre, tenue correcte)\n- Titre : ne mettez pas « Affilié IBIG » — mettez plutôt « Consultant en solutions digitales & logiciels pour entreprises » ou « Partenaire en transformation digitale »\n- Résumé : décrivez les problèmes que vous aidez à résoudre, pas les produits que vous vendez\n\n📌 COMMENT TROUVER DES PROSPECTS\nRecherchez dans LinkedIn : « Directeur » + votre ville, « DRH » + votre secteur, « Gérant PME » + votre pays. Envoyez d'abord une invitation sans message de vente. Attendez qu'elle soit acceptée, puis engagez la conversation.\n\n📌 MESSAGE D'APPROCHE LINKEDIN\n« Bonjour [Prénom], merci pour la connexion. Je vois que vous gérez [une équipe / une entreprise / un établissement]. Je travaille avec des solutions digitales qui aident les entreprises comme la vôtre à [gagner du temps / structurer leur gestion / former leurs équipes]. Si jamais ça vous intéresse d'en savoir plus, je suis disponible. »\n\n💡 LinkedIn fonctionne à moyen terme — soyez patient et publiez du contenu utile régulièrement pour établir votre crédibilité.",
  },

  // ── FICHES PRODUITS DÉTAILLÉES ────────────────────────────────────────────
  {
    slug: "fiche-produit-scolaby",
    title: "Fiche produit : Scolaby — tout savoir pour bien le vendre",
    description: "Fonctionnalités détaillées, cibles, tarifs, arguments clés et réponses aux questions fréquentes sur Scolaby.",
    branchSlug: "ibig-soft",
    duration: "7 min",
    tags: "scolaby,logiciel,école,fiche produit",
    order: 30,
    content: "Scolaby est un logiciel SaaS de gestion scolaire. Voici tout ce qu'il faut savoir pour le vendre.\n\n🎯 POUR QUI ?\nDirecteurs d'écoles maternelles, primaires, collèges, lycées, universités et BTS. Également pour les groupes scolaires multi-établissements.\n\n⚙️ CE QUE ÇA FAIT\n• Inscription et réinscription des élèves en ligne\n• Saisie et publication des notes et bulletins automatiques\n• Emploi du temps et gestion des absences\n• Communication avec les parents par SMS automatique\n• Paiement de la scolarité en ligne (Mobile Money, Wave)\n• Tableau de bord de direction avec indicateurs clés\n\n💰 TARIFS (taux affiliation 20%)\n• Maternelle/Primaire ≤300 élèves : 10 000 FCFA/mois → 2 000 FCFA/mois pour vous\n• Collège/Lycée ≤300 élèves : 20 000 FCFA/mois → 4 000 FCFA/mois pour vous\n• Université/BTS ≤300 étudiants : 35 000 FCFA/mois → 7 000 FCFA/mois pour vous\n• Groupe scolaire (multi-sites) : à partir de 80 000 FCFA/mois\n\n🗣️ ARGUMENTS CLÉS\n1. Économie de temps : plus de saisie manuelle des bulletins\n2. Professionnalisme : parents informés par SMS, paiement en ligne\n3. Tarif abordable : moins cher qu'un salaire de secrétaire\n\n❓ QUESTION FRÉQUENTE\n« Et si mon établissement n'a pas Internet ? » → Scolaby fonctionne sur mobile, les connexions data classiques suffisent. Une formation à la prise en main est incluse.",
  },
  {
    slug: "fiche-produit-fleet360",
    title: "Fiche produit : IBIG Fleet 360 — tout savoir pour bien le vendre",
    description: "Fonctionnalités, cibles, tarifs et arguments pour vendre le logiciel de gestion de flotte IBIG Fleet 360.",
    branchSlug: "ibig-soft",
    duration: "6 min",
    tags: "fleet360,logiciel,flotte,véhicules,fiche produit",
    order: 31,
    content: "IBIG Fleet 360 est un logiciel de gestion de flotte de véhicules. Voici comment le vendre.\n\n🎯 POUR QUI ?\nEntreprises, sociétés de transport, PME ayant une flotte de véhicules (minimum 2-3 véhicules), services de livraison, agences de location, entreprises BTP.\n\n⚙️ CE QUE ÇA FAIT\n• Suivi en temps réel des véhicules (position GPS)\n• Planification et suivi de la maintenance préventive\n• Suivi des consommations carburant et des coûts\n• Gestion des chauffeurs (permis, incidents, performances)\n• Rapports et tableaux de bord pour optimiser les coûts\n• Alertes automatiques (révision, assurance, vignette)\n\n💰 TARIFS (taux affiliation 20%)\n• Starter (≤10 véhicules) : 19 900 FCFA/mois → 3 980 FCFA/mois pour vous\n• Business : 49 900 FCFA/mois → 9 980 FCFA/mois pour vous\n• Professional : 99 900 FCFA/mois → 19 980 FCFA/mois pour vous\n\n🗣️ ARGUMENT CLÉ\n« Chaque mois, sans logiciel, vous ne savez pas exactement combien vous coûte chaque véhicule. Fleet 360 vous le dit en temps réel — et vous permet de réduire les pannes coûteuses grâce aux alertes de maintenance. »\n\n🎯 PROSPECT IDÉAL\nUn gérant qui a déjà eu une panne imprévue coûteuse, ou qui ne sait pas combien dépense chaque chauffeur en carburant — c'est votre meilleure entrée.",
  },
  {
    slug: "fiche-produit-digital-kits",
    title: "Fiche produit : IBIG DIGITAL KITS — tout savoir pour bien les vendre",
    description: "Qu'est-ce qu'un kit numérique, comment l'expliquer simplement et à qui le proposer — 80+ kits à 5 000 FCFA.",
    branchSlug: "ibig-digital-kits",
    duration: "6 min",
    tags: "digital kits,numérique,ressources,fiche produit",
    order: 32,
    content: "Les IBIG DIGITAL KITS sont des packs de ressources numériques téléchargeables. Voici comment les vendre efficacement.\n\n🎯 POUR QUI ?\nEntrepreneurs, étudiants, commerciaux, RH, managers, comptables, créateurs de contenu — presque tout le monde peut trouver un kit utile.\n\n⚙️ CE QUE C'EST\nChaque kit est un pack de ressources numériques (templates, guides, tableaux de bord, checklists, scripts, prompts IA) sur un thème précis — prêts à l'emploi. Livraison immédiate après paiement.\n\nExemples : Kit Commercial & Prospection, Kit Gestion RH, Kit IA & Automatisation, Kit Comptabilité Débutant...\n\n💰 TARIFS (taux affiliation 15%)\n• Kit individuel : 5 000 FCFA → 750 FCFA pour vous\n• Bundle : 9 000 FCFA → 1 350 FCFA pour vous\n\n🗣️ COMMENT LE PITCHER EN 10 SECONDES\n« C'est un kit numérique clé en main — tu télécharges et tu utilises directement sans rien créer. Pour 5 000 FCFA, tu économises des heures de travail. »\n\n💡 STRATÉGIE DE VENTE\nLes kits se vendent très bien en volume. Proposez le kit correspondant exactement au métier ou au problème actuel de votre prospect. Un vendeur → Kit Commercial. Un RH → Kit Gestion RH. Un directeur qui veut utiliser l'IA → Kit IA & Automatisation.",
  },

  // ── MOTIVATION & DISCIPLINE ───────────────────────────────────────────────
  {
    slug: "plan-hebdomadaire-affilie-gagnant",
    title: "Le plan hebdomadaire d'un affilié qui gagne",
    description: "Une routine concrète sur 7 jours pour prospecter régulièrement, suivre ses contacts et développer son réseau sans s'épuiser.",
    duration: "8 min",
    tags: "routine,organisation,planning,discipline,motivation",
    order: 40,
    content: "Les affiliés qui réussissent ne travaillent pas forcément plus — ils travaillent de façon régulière. Voici un plan hebdomadaire réaliste.\n\n📅 LUNDI — Planification (15 min)\nRevoyez votre liste de prospects. Qui devez-vous relancer cette semaine ? Qui n'a pas encore été contacté ? Fixez un objectif simple : 3 nouveaux contacts cette semaine.\n\n📅 MARDI — Prospection active (20-30 min)\nEnvoyez vos 1ères prises de contact. Pas en masse — 3 messages ciblés et personnalisés valent mieux que 30 copier-coller.\n\n📅 MERCREDI — Contenu réseaux sociaux (15 min)\nPubliez un post utile sur Facebook ou WhatsApp — pas une publicité, un contenu qui apporte de la valeur à votre audience.\n\n📅 JEUDI — Suivi et relances (15 min)\nRevenez vers les personnes qui n'ont pas répondu à vos messages de lundi. Relancez avec une nouvelle info ou question.\n\n📅 VENDREDI — Partage offre (10 min)\nPartagez un produit IBIG sur vos statuts WhatsApp ou Facebook — avec un visuel, un bénéfice clair et votre lien.\n\n📅 SAMEDI — Recrutement filleul (15 min)\nPensez à 1 ou 2 personnes dans votre entourage qui pourraient devenir affiliés. Envoyez-leur le message de recrutement.\n\n📅 DIMANCHE — Bilan (5 min)\nCombien de contacts cette semaine ? Combien de réponses ? Qu'est-ce qui a bien marché ? Ajustez pour la semaine suivante.\n\nTotal : environ 1h30 par semaine bien placée.",
  },
  {
    slug: "fixer-objectifs-affilié",
    title: "Comment fixer des objectifs réalistes et les atteindre",
    description: "Méthode SMART appliquée à l'affiliation — comment définir des objectifs chiffrés, mesurables et atteignables mois par mois.",
    duration: "7 min",
    tags: "objectifs,SMART,motivation,revenus,planification",
    order: 41,
    content: "Sans objectif précis, il est impossible de savoir si vous progressez. Voici comment vous fixer des objectifs qui fonctionnent.\n\n🎯 LA MÉTHODE SMART POUR L'AFFILIATION\n\nS — Spécifique : pas « je veux gagner de l'argent » mais « je veux générer 50 000 FCFA de commissions ».\nM — Mesurable : définissez le nombre de ventes et de produits nécessaires pour atteindre ce montant.\nA — Atteignable : pour 50 000 FCFA, avec un taux moyen de 2 000 FCFA/vente, il vous faut 25 ventes. Sur un mois, c'est moins d'une vente par jour.\nR — Réaliste : commencez par des objectifs modestes le premier mois (20 000 FCFA), puis augmentez progressivement.\nT — Temporel : fixez une date limite claire.\n\n📊 OBJECTIFS PAR MOIS (exemple progressif)\nMois 1 : 5 ventes → 10 000 à 15 000 FCFA de commissions (apprentissage)\nMois 2 : 10 ventes + 1 filleul → 20 000 à 30 000 FCFA\nMois 3 : 15 ventes + 3 filleuls actifs → 40 000 à 60 000 FCFA\n\n💡 Conseil : notez votre objectif mensuel et affichez-le là où vous le voyez chaque jour. Le cerveau atteint ce qu'il voit régulièrement.\n\n⚠️ Erreur fréquente : viser trop grand trop tôt, ne pas atteindre l'objectif et se décourager. Mieux vaut dépasser un petit objectif que rater un grand.",
  },
  {
    slug: "mindset-affilié-gagnant",
    title: "Le mindset de l'affilié qui réussit",
    description: "Les différences de pensée entre un affilié qui abandonne après 2 semaines et un affilié qui construit un revenu durable.",
    duration: "6 min",
    tags: "mindset,motivation,état d'esprit,persévérance,succès",
    order: 42,
    content: "L'affiliation est simple à comprendre mais difficile à maintenir dans le temps. Ce qui sépare ceux qui réussissent, c'est leur état d'esprit.\n\n🔴 PENSÉES D'UN AFFILIÉ QUI ABANDONNE\n• « J'ai envoyé 5 messages et personne n'a acheté, ça ne marche pas. »\n• « Je ne suis pas commercial de nature. »\n• « Les autres ont plus de contacts que moi. »\n• « Ce mois-ci j'ai été occupé, je recommence le mois prochain. »\n\n🟢 PENSÉES D'UN AFFILIÉ QUI RÉUSSIT\n• « Chaque 'non' me rapproche d'un 'oui'. »\n• « Je n'ai pas besoin d'être commercial — j'aide mes contacts à résoudre des problèmes réels. »\n• « Je commence petit, mais je suis régulier. »\n• « Mon réseau grandit chaque semaine — les résultats viennent avec le temps. »\n\n📌 LA VÉRITÉ SUR L'AFFILIATION\nLes premières semaines sont les plus dures — peu de résultats, beaucoup d'efforts. C'est normal. La grande majorité des affiliés abandonnent à ce stade. Ceux qui restent 3 mois commencent à voir les premières commissions régulières. Ceux qui restent 6 mois ont souvent un revenu complémentaire solide.\n\n💡 Exercice : à la fin de chaque semaine, notez 1 chose qui a bien marché, même petite. Un contact intéressé, un message bien reçu, un nouveau filleul inscrit. Ces petites victoires maintiennent la motivation.",
  },

  {
    slug: "vendre-ibig-soft",
    title: "Comment vendre les logiciels IBIG SOFT",
    description: "Cibles, arguments clés et objections courantes pour les 14 logiciels/ERP IBIG SOFT (Scolaby, Fleet 360, Lokativo, GESCOMXEL, Zelivry, STOCKFLOW, CONSTRUIRO, SANTAREX, AGRIFRIK, GESTMONEY, ANOUANZÊ, FactPro, SECRETIS, DocPro).",
    branchSlug: "ibig-soft",
    duration: "10 min",
    tags: "soft,scolaby,fleet360,lokativo,gescomxel,zelivry,stockflow,construiro,santarex,agrifrik,gestmoney,anouanze,factpro,secretis,docpro,vente",
    order: 10,
    content: "IBIG SOFT regroupe 14 logiciels/ERP SaaS, chacun avec une cible précise : Scolaby pour les écoles, IBIG Fleet 360 pour les entreprises avec véhicules, Lokativo pour les agences immobilières, GESCOMXEL pour les boutiques et PME commerciales, Zelivry pour les entreprises de livraison, STOCKFLOW ERP pour les distributeurs, CONSTRUIRO ERP pour les entreprises du BTP, SANTAREX ERP pour les cliniques et hôpitaux, AGRIFRIK pour les exploitations agricoles, GESTMONEY pour les réseaux Mobile Money, ANOUANZÊ ERP pour les associations et ONG, IBIG FactPro pour la facturation, SECRETIS ERP pour la gestion du courrier et du secrétariat, IBIG DocPro pour la génération de documents professionnels.\n\nMéthode de prospection : identifiez d'abord le bon logiciel selon le métier de votre contact, puis demandez-lui quel problème concret il rencontre aujourd'hui (cahiers perdus, retards de paiement, suivi manuel des véhicules...). Présentez le logiciel comme la solution à CE problème précis, pas comme un produit générique.\n\nObjection fréquente : « C'est trop cher. » Réponse : rappelez que les abonnements démarrent bas (5 000 à 19 900 FCFA/mois selon le logiciel) et proposez l'abonnement annuel qui offre 1 à 2 mois gratuits. Comparez au coût du temps perdu ou des erreurs actuelles.\n\nObjection : « Je n'ai pas le temps de changer d'outil. » Réponse : proposez une démo de 10 minutes et rappelez que l'équipe IBIG accompagne la mise en route.\n\nAstuce : demandez toujours un essai ou une démo avant de conclure — c'est le meilleur déclencheur d'achat pour un logiciel.",
  },
  {
    slug: "vendre-soft-btp-sante",
    title: "Vendre aux entreprises BTP & santé (CONSTRUIRO, SANTAREX)",
    description: "Cibler les entreprises du bâtiment et les structures de santé avec les ERP CONSTRUIRO et SANTAREX — arguments et objections.",
    branchSlug: "ibig-soft",
    duration: "7 min",
    tags: "soft,construiro,santarex,btp,santé,erp,vente",
    order: 20,
    content: "Deux ERP IBIG SOFT ciblent des secteurs à forte valeur : le BTP et la santé.\n\n🏗️ CONSTRUIRO ERP — pour les entreprises du BTP\nCible : entreprises de construction, bureaux d'études, artisans du bâtiment qui gèrent des chantiers. CONSTRUIRO aide à suivre les chantiers, les coûts et les équipes.\nPitch : « Combien vous coûte réellement chaque chantier ? CONSTRUIRO vous donne le suivi de vos chantiers et de vos dépenses au même endroit, sans tableaux Excel éparpillés. » Abonnement à partir de 15 000 FCFA/mois.\n\n🏥 SANTAREX ERP — pour les cliniques et hôpitaux\nCible : cliniques, cabinets médicaux, hôpitaux, centres de santé. SANTAREX structure la gestion des patients et de l'établissement.\nPitch : « Vos dossiers patients, vos rendez-vous et votre facturation dans un seul outil — plus de cahiers ni de perte d'information. » Abonnement à partir de 12 000 FCFA/mois.\n\n💰 Votre rémunération\nCommission de 20% au niveau 1 (N1), dégressive sur 4 mois. Un abonnement récurrent = une commission récurrente pendant cette période.\n\n🗣️ Méthode\nIdentifiez d'abord le métier du contact (chantier ou santé), demandez son problème concret actuel, puis présentez l'ERP comme la réponse à CE problème. Terminez toujours par une proposition de démo — c'est le meilleur déclencheur d'achat pour un logiciel.\n\nObjection « c'est trop cher » : rappelez que le prix démarre bas (à partir de 12 000 à 15 000 FCFA/mois) et comparez au coût du temps perdu et des erreurs actuelles.",
  },
  {
    slug: "vendre-soft-ong-agri-mobilemoney",
    title: "Vendre aux ONG, agriculteurs et réseaux Mobile Money",
    description: "Cibler les associations/ONG (ANOUANZÊ), les exploitations agricoles (AGRIFRIK) et les réseaux Mobile Money (GESTMONEY).",
    branchSlug: "ibig-soft",
    duration: "7 min",
    tags: "soft,anouanze,agrifrik,gestmoney,ong,agriculture,mobile money,erp,vente",
    order: 21,
    content: "Trois logiciels IBIG SOFT s'adressent à des secteurs de proximité souvent mal outillés.\n\n🤝 ANOUANZÊ ERP — pour les associations et ONG\nCible : associations, ONG, coopératives, mutuelles. ANOUANZÊ aide à gérer les membres, les activités et la transparence des comptes.\nPitch : « Vos bailleurs et vos membres veulent de la transparence. ANOUANZÊ centralise vos adhérents, vos projets et votre suivi financier. » À partir de 12 900 FCFA/mois.\n\n🌾 AGRIFRIK — pour les exploitations agricoles\nCible : exploitants agricoles, coopératives agricoles, planteurs. AGRIFRIK structure le suivi des productions et des ventes.\nPitch : « Suivez vos parcelles, vos récoltes et vos ventes sans tout noter sur des cahiers. » À partir de 6 500 FCFA/mois — le tarif d'entrée le plus accessible.\n\n💸 GESTMONEY — pour les réseaux Mobile Money\nCible : gérants de points Mobile Money, réseaux de distributeurs, kiosques. GESTMONEY aide à suivre les transactions, la caisse et les commissions.\nPitch : « Vous savez à tout moment où en est votre caisse et vos commissions, sans erreur de comptage. » À partir de 9 900 FCFA/mois.\n\n💰 Votre rémunération\nCommission de 20% au niveau 1 (N1), dégressive sur 4 mois, sur chaque abonnement.\n\n🗣️ Méthode\nCes prospects sont sensibles à la simplicité et au prix. Insistez sur la facilité de prise en main et l'accompagnement inclus, et proposez une démo courte de 10 minutes pour conclure.",
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
    message: `${upserted} module(s) de formation synchronisés — démarrage, commissions, scripts, réseaux sociaux, fiches produits, motivation.`,
  });
}
