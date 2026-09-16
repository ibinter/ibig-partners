import { PageHeader } from "@/components/ui";
import FaqClient, { type FaqCategory } from "./faq-client";

export const metadata = { title: "FAQ — 100 questions IBIG PARTNERS" };

const FAQ: FaqCategory[] = [
  {
    icon: "🚀",
    title: "Inscription & Accès",
    items: [
      { q: "L'inscription à IBIG PARTNERS est-elle vraiment gratuite ?", a: "Oui, totalement gratuite. Aucun frais d'adhésion, aucun abonnement, aucune carte bancaire requise. Vous créez votre compte en 2 minutes sur ibigpartners.com/rejoindre." },
      { q: "Qui peut devenir partenaire IBIG ?", a: "Toute personne majeure résidant en Afrique ou dans la diaspora africaine, qu'elle soit salariée, indépendante, étudiante ou entrepreneur. Pas de diplôme ni d'expérience commerciale requis." },
      { q: "Peut-on s'inscrire depuis l'étranger (Europe, Amérique, etc.) ?", a: "Oui. Le programme est ouvert à la diaspora. Le paiement peut se faire via virement bancaire international (SWIFT/SEPA) ou via des partenaires de transfert d'argent. Orange Money et Wave sont réservés aux numéros locaux." },
      { q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur « Mot de passe oublié » sur la page de connexion. Un email de réinitialisation vous sera envoyé sous 2 minutes. Vérifiez vos spams si vous ne le recevez pas." },
      { q: "Mon compte est bloqué (trop de tentatives de connexion), comment débloquer ?", a: "Le blocage dure 15 minutes automatiquement. Passé ce délai, vous pouvez réessayer. Si le problème persiste, utilisez la réinitialisation de mot de passe ou contactez le support." },
      { q: "Je ne reçois pas les emails IBIG PARTNERS, pourquoi ?", a: "Vérifiez d'abord vos spams/courrier indésirable. Les emails sont envoyés depuis noreply@mail.ibigpartners.com — ajoutez cette adresse à vos contacts pour éviter les filtres." },
      { q: "Puis-je avoir plusieurs comptes partenaires ?", a: "Non. Un seul compte par personne est autorisé. Les doublons sont détectés et peuvent entraîner la suspension des deux comptes. Si vous avez un problème d'accès, contactez le support." },
      { q: "Combien de temps dure l'approbation de mon compte ?", a: "L'approbation manuelle est généralement effectuée sous 24 à 48h ouvrées après votre inscription. Vous recevez un email de confirmation dès que votre compte est validé." },
      { q: "Peut-on changer son adresse email après inscription ?", a: "Oui, via Mon Profil → section contact. Un email de confirmation est envoyé à la nouvelle adresse pour valider le changement." },
      { q: "Qu'est-ce que le code partenaire (ex: AFF-KOFFI-001) ?", a: "C'est votre identifiant unique d'affiliation. Il est inclus dans tous vos liens de tracking et permet à IBIG de vous attribuer les commissions sur les clients qui passent par vous. Ne le partagez jamais avec d'autres partenaires." },
    ],
  },
  {
    icon: "📋",
    title: "Contrat & KYC",
    items: [
      { q: "Pourquoi dois-je signer un contrat pour accéder à l'espace partenaire ?", a: "Le contrat fixe les règles du partenariat (taux de commission, conditions de paiement, obligations de chaque partie). Il vous protège juridiquement et permet à IBIG de vous payer légalement. C'est une étape obligatoire." },
      { q: "Comment signer le contrat de partenariat ?", a: "Depuis votre espace, allez dans Mon Contrat → Contrat digital. Le contrat s'affiche, vous le lisez et vous le signez électroniquement en cochant la case de validation. La signature est horodatée et conservée." },
      { q: "Qu'est-ce que le KYC (Know Your Customer) ?", a: "C'est la vérification de votre identité obligatoire pour recevoir vos paiements. Vous soumettez une pièce d'identité (CNI, passeport ou permis de conduire) et vos informations personnelles. Cela évite la fraude et respecte la réglementation." },
      { q: "Quels documents sont acceptés pour le KYC ?", a: "Carte Nationale d'Identité (CNI), passeport en cours de validité, permis de conduire, ou titre de séjour. Les documents doivent être lisibles, non expirés, et en couleur si possible." },
      { q: "Combien de temps prend la validation KYC ?", a: "Généralement 24 à 72h ouvrées après soumission de votre dossier complet. Vous recevez un email dès que votre dossier est validé ou si des corrections sont demandées." },
      { q: "Mon KYC a été rejeté, pourquoi et que faire ?", a: "Les motifs fréquents : document flou ou illisible, document expiré, nom différent du compte. Retournez dans Vérification de compte, corrigez ce qui est demandé dans la note de rejet, et soumettez à nouveau." },
      { q: "Que se passe-t-il si je ne fais pas mon KYC ?", a: "Vous pouvez utiliser l'espace partenaire et déclarer des ventes, mais vos commissions seront en attente et non versées tant que le KYC n'est pas validé. Le paiement est conditionné à la vérification d'identité." },
      { q: "Je suis une entreprise, dois-je faire le KYC ou le KYB ?", a: "Si vous opérez en tant qu'entreprise (SARL, SA, ONG, etc.), vous devez faire le KYB (Know Your Business) via la section Vérification Entreprise. Cela inclut les documents légaux de la société (RCCM, statuts, etc.)." },
      { q: "Mon contrat a-t-il une durée limitée ?", a: "Le contrat est à durée indéterminée et se renouvelle tacitement. Il peut être résilié à tout moment par l'une ou l'autre partie avec un préavis de 30 jours, sans pénalité si toutes les commissions dues ont été versées." },
      { q: "Puis-je modifier mes informations personnelles après le KYC validé ?", a: "Oui pour les informations non-vérifiées (bio, photo, téléphone). Pour les informations d'identité (nom, numéro de pièce), contactez le support — une nouvelle vérification peut être demandée." },
    ],
  },
  {
    icon: "🧩",
    title: "Produits & Activation",
    items: [
      { q: "Comment activer un produit pour obtenir mon lien affilié ?", a: "Allez dans Mes Produits → trouvez le produit souhaité → cliquez sur « Activer ». Votre lien affilié unique est immédiatement généré et disponible dans Mes Liens." },
      { q: "Combien de produits puis-je activer ?", a: "Autant que vous voulez. Il n'y a pas de limite. Cependant, il est recommandé de se concentrer sur 3 à 5 produits que vous maîtrisez bien pour être plus efficace." },
      { q: "Quelle est la différence entre les 10 branches du groupe IBIG ?", a: "Chaque branche couvre un secteur d'activité : IBIG SOFT (14 logiciels SaaS), EDUFORM (800+ formations), IMMO TRUST (immobilier), MARKET (commerce), DIGITAL (création digitale), DIGITAL KITS (transformation numérique), CONSEIL+ (conseil & juridique), EMPLOI & TALENTS (recrutement), MULTISERVICES (55 services), PARTNERS (programme affilié lui-même)." },
      { q: "Quels produits génèrent les meilleures commissions ?", a: "Les abonnements mensuels SaaS (IBIG SOFT) offrent des commissions récurrentes chaque mois tant que le client est abonné. Les formations certifiantes (EDUFORM) ont des montants unitaires élevés. Le meilleur produit est celui que vous connaissez et pouvez défendre face à un client." },
      { q: "Comment choisir le bon produit à promouvoir pour mon réseau ?", a: "Analysez votre audience : des chefs d'entreprise → logiciels de gestion (Scolaby, Fleet 360, GescomXEL). Des professionnels en formation → EDUFORM. Des entrepreneurs immobiliers → IMMO TRUST. Des PME qui veulent se digitaliser → DIGITAL KITS." },
      { q: "Les prix des produits peuvent-ils changer ?", a: "Oui. Les prix sont définis par IBIG SARL et peuvent évoluer. Votre lien affilié s'adapte automatiquement. Votre commission est toujours calculée sur le prix réel payé par le client au moment de la vente." },
      { q: "Qu'est-ce qu'un produit 'Sur devis' ?", a: "Certains produits premium (projets immobiliers, prestations sur mesure) n'ont pas de prix fixe — ils dépendent de la situation du client. Pour ces produits, vous prenez contact avec le client et IBIG établit un devis. La commission est calculée sur le montant final validé." },
      { q: "Puis-je promouvoir des produits de toutes les branches simultanément ?", a: "Oui. Votre compte vous donne accès à l'ensemble du catalogue. Vous pouvez activer et promouvoir des produits de plusieurs branches en même temps." },
      { q: "Un client peut-il passer commande directement depuis ma page partenaire ?", a: "Oui. Votre page de vente personnalisée (/p/VOTRECODE/slug-produit) présente le produit et redirige le client vers la page officielle IBIG avec votre code de tracking. La commission vous est attribuée automatiquement." },
      { q: "Que faire si un produit que je promeuve est temporairement suspendu ?", a: "Votre lien redirige vers la page officielle qui indiquera la situation. Vos commissions en cours ne sont pas affectées. Vous êtes notifié par email et dans vos notifications en cas de suspension ou de retrait d'un produit." },
    ],
  },
  {
    icon: "🔗",
    title: "Liens & Tracking",
    items: [
      { q: "Comment fonctionne le tracking de mes liens affiliés ?", a: "Quand quelqu'un clique sur votre lien (/aff/VOTRECODE?p=slug), un cookie est déposé dans son navigateur pendant 30 jours. Si ce visiteur souscrit au produit dans ces 30 jours, la vente vous est attribuée, même s'il revient plus tard directement sur le site." },
      { q: "Combien de jours dure le cookie de tracking ?", a: "30 jours. Si un prospect clique sur votre lien le 1er du mois et achète le 25, la commission vous revient. S'il achète au 31ème jour sans recliquer, la commission ne vous est plus attribuée." },
      { q: "Que se passe-t-il si un prospect clique sur mon lien ET sur celui d'un autre partenaire ?", a: "Le dernier clic gagne. Si votre prospect a cliqué sur votre lien en décembre puis sur celui d'un collègue en janvier avant d'acheter, la commission va au collègue. Relancez régulièrement vos prospects." },
      { q: "Comment copier rapidement mes liens ?", a: "Dans Mes Liens, la section « Copie rapide » en haut de page affiche vos 3 liens les plus cliqués avec un bouton Copier. Pour les autres liens, cliquez sur la carte du produit concerné." },
      { q: "Puis-je utiliser mon code partenaire sans lien (code promo) ?", a: "Oui. Votre code partenaire (ex: AFF-KOFFI-001) peut être saisi manuellement par le client lors du paiement sur les plateformes IBIG qui le permettent. Vérifiez avec le support quels produits supportent cette option." },
      { q: "Comment créer un lien UTM personnalisé pour suivre mes campagnes ?", a: "Dans Mes Liens, utilisez le générateur UTM (bouton « UTM »). Ajoutez une source (whatsapp, instagram, email), un medium et une campagne. Le lien généré intègre votre tracking affilié ET les paramètres UTM pour vos analytics." },
      { q: "Puis-je créer un QR code à partir de mes liens ?", a: "Oui. Dans Mon Réseau, un générateur de QR code est disponible. Entrez votre lien affilié et téléchargez le QR code en PNG pour vos flyers, présentations ou réseaux sociaux." },
      { q: "Pourquoi mon lien n'enregistre-t-il pas de clics ?", a: "Vérifiez que vous utilisez le bon format de lien (/aff/CODE?p=slug ou /offres/slug?ref=CODE). Si vous testez depuis votre propre navigateur, les clics sur vos propres liens peuvent ne pas être comptabilisés pour éviter la fraude." },
      { q: "Puis-je raccourcir mes liens affiliés ?", a: "Oui. Vous pouvez utiliser un raccourcisseur (bit.ly, rebrand.ly) sur vos liens. Cela ne casse pas le tracking tant que les redirections 301/302 transmettent les paramètres d'URL. Testez avant de diffuser." },
      { q: "Ma page de vente personnalisée (/p/CODE/slug) est-elle publique ?", a: "Oui, elle est accessible à tous sans connexion. Elle affiche votre photo, votre bio et le produit avec un CTA qui redirige vers la page officielle avec votre tracking. Partagez ce lien directement à vos prospects." },
    ],
  },
  {
    icon: "💰",
    title: "Commissions & Calculs",
    items: [
      { q: "Comment sont calculées mes commissions ?", a: "Commission = Montant de la vente × Taux de commission du produit × Coefficient de votre statut. Ex: vente de 150 000 FCFA, taux produit 20%, statut STARTER (coefficient 1) → 30 000 FCFA de commission N1." },
      { q: "Qu'est-ce que les commissions sur 3 niveaux ?", a: "N1 : vous vendez directement → taux plein (ex: 20%). N2 : votre filleul direct vend → vous touchez un % supplémentaire (ex: 10%). N3 : le filleul de votre filleul vend → encore un % (ex: 5%). Vous gagnez ainsi sur les ventes de tout votre réseau." },
      { q: "Les taux de commission sont-ils les mêmes pour tous les produits ?", a: "Non. Chaque produit a son propre taux défini par IBIG SARL. Les taux varient généralement de 5% à 20% selon la branche et le type de produit. Consultez la fiche de chaque produit dans Mes Produits pour voir le taux exact." },
      { q: "Qu'est-ce qu'une commission récurrente ?", a: "Pour les abonnements mensuels (SaaS IBIG SOFT), vous touchez une commission chaque mois que le client reste abonné, pas seulement à la première vente. Si un client paie 50 000 FCFA/mois pendant 12 mois, vous percevez votre % chaque mois." },
      { q: "Mon statut (SILVER, GOLD…) influence-t-il mes commissions ?", a: "Oui. Les statuts SILVER et supérieurs bénéficient de coefficients multiplicateurs sur certains produits. Consultez le Plan de compensation (/espace/plan-compensation) pour voir les avantages de chaque statut." },
      { q: "Quand vois-je mes commissions apparaître ?", a: "Une commission apparaît dans Mes Commissions dès qu'une vente est déclarée et validée par l'équipe IBIG. Le statut est d'abord PENDING (en attente), puis VALIDATED (validée), puis PAID (versée)." },
      { q: "Quelle est la différence entre commission PENDING, VALIDATED et PAID ?", a: "PENDING : vente déclarée, en cours de vérification par IBIG. VALIDATED : vente confirmée, commission approuvée, en attente de virement. PAID : commission versée sur votre compte de paiement." },
      { q: "Puis-je voir le détail de chaque commission (produit, client, taux) ?", a: "Oui. Dans Mes Commissions, cliquez sur une ligne pour voir le détail : produit, montant de la vente, taux appliqué, date, niveau (N1/N2/N3), et le statut. Vous pouvez aussi télécharger un relevé mensuel en PDF." },
      { q: "Mes commissions peuvent-elles être annulées ?", a: "Oui, si la vente sous-jacente est annulée (remboursement client, fraude détectée, vente non conforme). Dans ce cas, la commission passe en statut CANCELLED. Les commissions déjà versées ne sont pas récupérées si la vente a été correctement déclarée." },
      { q: "Comment obtenir mon attestation fiscale annuelle ?", a: "Dans Mes Paiements, cliquez sur « Attestation fiscale 2026 ». La page s'ouvre avec le récapitulatif de toutes vos commissions et virements de l'année, prête à imprimer ou exporter en PDF via votre navigateur (Ctrl+P → Enregistrer en PDF)." },
    ],
  },
  {
    icon: "🏦",
    title: "Paiements & Virements",
    items: [
      { q: "Comment recevoir mes paiements ?", a: "Configurez votre méthode de paiement dans Mes Paiements → Configurer. Options disponibles : Orange Money, Wave, MTN MoMo, virement bancaire local ou international. Entrez votre numéro ou IBAN selon la méthode choisie." },
      { q: "Quel est le seuil minimum de paiement ?", a: "5 000 FCFA par défaut. En dessous, les commissions s'accumulent jusqu'à atteindre ce seuil. Vous pouvez ajuster ce seuil dans Mes Paiements jusqu'à un minimum de 1 000 FCFA ou un maximum de 50 000 FCFA selon votre préférence." },
      { q: "Comment demander un virement ?", a: "Dans Mes Paiements, si votre solde de commissions validées ≥ votre seuil et que votre KYC est validé, le bouton « Demander un virement » est actif. Cliquez dessus — le virement est traité sous 48h ouvrées." },
      { q: "Les virements sont-ils automatiques ou manuels ?", a: "Manuel actuellement. Vous devez cliquer sur « Demander un virement » quand votre solde est suffisant. IBIG peut aussi initier des virements groupés en fin de mois pour les partenaires actifs sans demande manuelle." },
      { q: "Des frais sont-ils prélevés sur mes commissions ?", a: "Des frais de transaction peuvent s'appliquer selon la méthode choisie (ex: frais Orange Money ou frais de virement bancaire international). Ces frais sont visibles sur votre relevé de virement avant confirmation." },
      { q: "Puis-je changer de méthode de paiement ?", a: "Oui, à tout moment dans Mes Paiements → Configurer. Le changement prend effet pour les prochains virements. Les virements en cours de traitement utilisent encore l'ancienne méthode." },
      { q: "Combien de temps prend un virement Orange Money ou Wave ?", a: "Généralement instantané à quelques minutes après validation IBIG. En cas de problème technique, le délai peut aller jusqu'à 24h. Si vous n'avez pas reçu votre virement après 48h, contactez le support avec votre numéro de référence." },
      { q: "Comment obtenir un reçu de virement pour ma comptabilité ?", a: "Dans Mes Paiements, chaque virement reçu a un bouton « Reçu ». Cliquez dessus pour accéder à la page de reçu officiel IBIG, avec référence, montant, date et méthode. Imprimez ou exportez en PDF." },
      { q: "Je n'ai pas reçu mon virement, que faire ?", a: "1. Vérifiez le statut dans Mes Paiements (PAID = virement effectué). 2. Vérifiez que votre numéro/IBAN est correct. 3. Si tout est bon et que 48h se sont écoulées, contactez le support avec la référence du virement visible dans l'historique." },
      { q: "Puis-je recevoir mes paiements en devises (EUR, USD) ?", a: "Oui si vous avez configuré un virement bancaire international (SWIFT) avec un compte en devises. Vos commissions en FCFA sont converties au taux en vigueur le jour du virement. Configurez votre préférence de devise dans Mon Profil." },
    ],
  },
  {
    icon: "🌳",
    title: "Réseau & Parrainage",
    items: [
      { q: "Comment parrainer un nouveau partenaire ?", a: "Partagez votre lien de parrainage (dans Mon Réseau → Lien de parrainage). Quand quelqu'un s'inscrit via ce lien, il devient votre filleul N1. Vous toucherez des commissions sur toutes ses ventes futures." },
      { q: "Combien de niveaux de parrainage sont pris en compte ?", a: "3 niveaux. N1 : vos filleuls directs. N2 : leurs filleuls. N3 : les filleuls de vos filleuls N2. Au-delà du niveau 3, les ventes ne génèrent pas de commission pour vous." },
      { q: "Quel est le taux de commission sur les ventes de mon réseau ?", a: "Cela dépend du produit. En général : N1 = taux plein du produit, N2 = moitié du taux N1, N3 = moitié du taux N2. Ex : pour un produit à 20% N1 → 10% N2 → 5% N3. Consultez la fiche de chaque produit pour les taux exacts." },
      { q: "Comment voir la performance de mon réseau ?", a: "Dans Mon Réseau, vous voyez : le nombre de filleuls par niveau, leurs ventes du mois, votre commission générée par leur activité, et un arbre visuel de votre réseau dans Arbre de réseau." },
      { q: "Puis-je voir qui sont mes filleuls ?", a: "Oui. Dans Mon Réseau, la liste de vos filleuls N1 est visible avec leur prénom, statut et nombre de ventes. Pour les N2 et N3, vous voyez les chiffres agrégés mais pas les noms individuels (confidentialité)." },
      { q: "Un filleul peut-il changer de parrain ?", a: "Non. Le parrainage est permanent et attribué lors de l'inscription via votre lien. Même si le filleul rejoint IBIG par un autre canal par la suite, son parrain d'origine reste le même." },
      { q: "Que se passe-t-il si mon filleul se désinscrit ?", a: "Vos commissions déjà générées par ses ventes passées restent acquises. Les ventes futures ne génèrent plus de commission puisque le compte est inactif. Si le filleul se réinscrit (nouveau compte), le nouveau compte n'est pas lié au vôtre." },
      { q: "Y a-t-il des bonus pour le recrutement de nouveaux partenaires ?", a: "IBIG peut proposer des bonus de parrainage ponctuels dans le cadre de challenges ou de campagnes spéciales. Consultez la section Challenges et les annonces dans vos Notifications pour être informé." },
      { q: "Mes messages WhatsApp modèles (dans Mon Réseau) sont-ils personnalisables ?", a: "Les modèles affichés sont pré-remplis avec votre code et votre lien. Copiez le texte et adaptez-le à votre style avant d'envoyer — l'important est de conserver votre lien de parrainage dans le message." },
      { q: "Comment accéder à l'arbre visuel de mon réseau ?", a: "Dans Réseau → Arbre de réseau. L'arbre interactif montre votre position et vos filleuls sur 3 niveaux, avec des indicateurs de performance (actif/inactif) pour chaque nœud." },
    ],
  },
  {
    icon: "🏆",
    title: "Statuts & Progression",
    items: [
      { q: "Quels sont les 5 statuts IBIG PARTNERS et leurs avantages ?", a: "STARTER : débutant, accès complet de base. SILVER : 2+ ventes confirmées, bonus de commission. GOLD : 5+ ventes, accès à des produits premium. MASTER : 15+ ventes et réseau actif, coaching dédié. ELITE : top partenaire, commissions majorées, représentant officiel IBIG." },
      { q: "Comment passer de STARTER à SILVER ?", a: "Confirmez au moins 2 ventes (statut CONFIRMED) et maintenez un réseau d'au moins 1 filleul actif. Le passage de statut est automatique dès que les critères sont remplis — vous êtes notifié par email et dans l'application." },
      { q: "Le passage de statut est-il définitif ?", a: "Non. Le statut est réévalué mensuellement. Si votre activité baisse en dessous des critères d'un statut, vous pouvez rétrograder. Maintenez une activité régulière pour conserver votre statut." },
      { q: "Comment voir ma progression vers le statut suivant ?", a: "Sur votre Dashboard, une barre de progression indique où vous en êtes par rapport aux critères du prochain statut. Allez aussi dans Mes Objectifs pour voir le détail des critères." },
      { q: "Qu'est-ce que les challenges et comment y participer ?", a: "Les challenges sont des défis mensuels (ex: « 5 ventes en 30 jours ») avec des récompenses (bonus en espèces, points, badges). Allez dans Challenges pour voir les défis en cours et suivre votre progression. La participation est automatique dès que vous remplissez les conditions." },
      { q: "Qu'est-ce que les streaks ?", a: "Un streak est une série de jours consécutifs avec au moins une activité (clic, vente déclarée, prospect ajouté). Plus votre streak est long, plus vous gagnez de points bonus. Consultez Mes Streaks pour suivre votre série." },
      { q: "À quoi servent les points IBIG ?", a: "Les points sont gagnés via les ventes, les challenges, les streaks et certaines activités. Ils peuvent être échangés contre des récompenses dans la section Boutique (réductions sur formations, cashback, cadeaux IBIG)." },
      { q: "Comment fonctionne le classement mensuel ?", a: "Chaque mois, les partenaires sont classés selon leur chiffre d'affaires généré. Le top 20 est visible dans Classement. Le classement se remet à zéro le 1er de chaque mois. L'objectif est la motivation — les positions ne conditionnent pas les commissions." },
      { q: "Mes badges sont-ils permanents ?", a: "Oui. Une fois un badge obtenu (ex: « Première vente », « 10 filleuls »), il reste affiché sur votre profil définitivement même si votre activité baisse. Les badges attestent de vos accomplissements historiques." },
      { q: "Qu'est-ce que le programme VIP IBIG ?", a: "Le programme VIP est réservé aux partenaires ELITE et MASTER sélectionnés. Il offre des avantages exclusifs : accès prioritaire aux nouveaux produits, sessions de coaching individuelles, invitations aux événements IBIG, et commission majorée sur certains produits." },
    ],
  },
  {
    icon: "⚙️",
    title: "Outils & Fonctionnalités",
    items: [
      { q: "Comment déclarer une vente ?", a: "Dans Mes Ventes → Déclarer une vente. Choisissez le produit, entrez le montant et joignez une preuve (capture de paiement, bon de commande, etc.). Ajoutez optionnellement le nom du client et ses coordonnées. La vente est soumise à validation IBIG." },
      { q: "Qu'est-ce qu'une « preuve de vente » et est-ce obligatoire ?", a: "La preuve (capture d'écran du paiement, email de confirmation, bon de commande signé) aide IBIG à valider rapidement votre vente. Sans preuve, la validation peut prendre plus de temps ou être refusée. Fournissez-la systématiquement." },
      { q: "Comment ajouter un prospect dans mon CRM ?", a: "Dans Mes Prospects → Ajouter un prospect. Entrez le nom, téléphone/email, le produit d'intérêt et le statut (Contacté, Intéressé, Devis, etc.). Ajoutez des notes et des rappels pour ne rien oublier." },
      { q: "Comment configurer un webhook pour connecter mon CRM externe ?", a: "Dans Webhook / API (section Compte de la sidebar). Entrez l'URL de votre endpoint (Zapier, Make, votre serveur). Générez un secret pour sécuriser les appels. À chaque vente confirmée, IBIG envoie automatiquement un POST JSON vers votre URL." },
      { q: "Comment vérifier la signature d'un webhook reçu ?", a: "Chaque webhook inclut le header X-IBIG-Signature: sha256=XXX. Calculez HMAC-SHA256 du corps JSON avec votre secret, et comparez avec la signature reçue. Si elles correspondent, le webhook est authentique." },
      { q: "Les notifications en temps réel fonctionnent-elles sur mobile ?", a: "Oui. La cloche de notification dans la sidebar se met à jour toutes les 30 secondes. Sur mobile, si vous avez activé les notifications push (si proposé par votre navigateur), vous recevez des alertes même sans avoir l'onglet ouvert." },
      { q: "Comment accéder à mon rapport mensuel ?", a: "Dans Mes Ventes → Mon Rapport mensuel. Le rapport récapitule : clics, ventes, commissions, prospects, et compare avec le mois précédent. Il est exportable en PDF pour vos archives." },
      { q: "Comment utiliser le Coach IA ?", a: "Dans Coach IA (section Formation). Posez vos questions sur les techniques de vente, les produits IBIG, comment répondre à une objection client, ou comment développer votre réseau. Le coach s'adapte à votre niveau et votre portefeuille de produits." },
      { q: "Comment générer le PDF Guide partenaire à jour ?", a: "Dans Mes Ressources → Guide partenaire. Cliquez sur « Télécharger le guide ». Le PDF est généré en temps réel avec les dernières informations sur les branches, les taux et les bonnes pratiques." },
      { q: "À quoi sert l'export de données ?", a: "Dans Export, vous pouvez télécharger en CSV : votre liste de prospects, vos commissions, vos ventes, ou votre réseau. Utile pour vos propres analyses, votre comptabilité ou pour importer dans votre CRM." },
    ],
  },
  {
    icon: "💡",
    title: "Stratégies & Conseils",
    items: [
      { q: "Par où commencer quand on vient de rejoindre IBIG PARTNERS ?", a: "1. Signez votre contrat. 2. Faites votre KYC. 3. Activez 2 ou 3 produits que vous connaissez bien. 4. Copiez vos liens et partagez à 10 personnes dans votre entourage professionnel. 5. Ajoutez ces contacts dans Mes Prospects. Ne cherchez pas à tout activer d'un coup." },
      { q: "Quelle est la meilleure façon de promouvoir les logiciels SaaS IBIG SOFT ?", a: "Ciblez les chefs d'entreprise, gérants de PME, comptables, RH. Proposez une démonstration (le Coach IA vous aide à préparer votre argumentaire). Mettez en avant le gain de temps et la conformité OHADA. La commission est récurrente — un seul client abonné paie chaque mois." },
      { q: "Comment promouvoir efficacement sur WhatsApp sans être bloqué ?", a: "N'envoyez pas de messages en masse à des inconnus — c'est du spam. Partagez dans des groupes professionnels pertinents avec un message contextualisé. Privilégiez les échanges individuels avec des personnes que vous connaissez. Utilisez votre page perso (/p/CODE) comme carte de visite digitale." },
      { q: "Combien de temps faut-il pour faire sa première vente ?", a: "Cela dépend de votre réseau et de votre activité. Les partenaires les plus rapides font leur première vente dans la première semaine en partageant à leur réseau professionnel existant. En moyenne, comptez 2 à 4 semaines pour la première vente avec un effort régulier." },
      { q: "Vaut-il mieux se concentrer sur la vente directe ou sur le recrutement de filleuls ?", a: "Les deux sont complémentaires mais ne négligez pas les ventes directes. Les ventes directes génèrent des commissions immédiates et plus élevées (N1). Les filleuls génèrent des revenus passifs à long terme (N2/N3) mais plus faibles individuellement. Stratégie gagnante : vendre ET recruter simultanément." },
      { q: "Quels secteurs d'activité sont les plus réceptifs aux produits IBIG ?", a: "TPE/PME (logiciels de gestion), établissements d'enseignement (Scolaby), transporteurs et flottes (Fleet 360), professionnels des RH (formations EDUFORM), agences immobilières (IMMO TRUST), restaurateurs et commerçants (logiciels de facturation). Identifiez dans votre réseau les personnes dans ces secteurs." },
      { q: "Comment gérer les objections des clients sceptiques ?", a: "Objection fréquente « C'est trop cher » → comparez au coût d'un employé ou d'un expert-comptable pour la même tâche. « Je n'ai pas besoin » → montrez un cas concret de gain de temps. « Je ne vous connais pas » → proposez une démonstration gratuite sans engagement. Le Coach IA vous aide à préparer des réponses." },
      { q: "Comment utiliser LinkedIn pour développer son réseau IBIG ?", a: "Créez ou mettez à jour votre profil LinkedIn avec votre rôle de « Partenaire Commercial IBIG PARTNERS ». Publiez régulièrement des contenus sur les problèmes que résolvent les produits IBIG (pas de publicité directe). Répondez aux posts de chefs d'entreprise qui mentionnent des difficultés de gestion." },
      { q: "Comment suivre la performance de mes actions marketing ?", a: "Utilisez des liens UTM différents par canal (un lien pour WhatsApp, un pour LinkedIn, un pour email). Dans Mes Liens, vous voyez le nombre de clics par lien. Dans Analytics, vous voyez les conversions. Doubler les efforts sur ce qui fonctionne." },
      { q: "Quel est le profil des partenaires qui réussissent le mieux chez IBIG ?", a: "Les meilleurs partenaires partagent ces traits : ils ciblent un secteur précis qu'ils connaissent bien, ils maintiennent un suivi régulier de leurs prospects (au moins 1 relance/semaine), ils maîtrisent 3 à 5 produits en profondeur, et ils recrutent activement dans leur réseau. La constance bat le talent — 1h par jour vaut mieux que 10h par semaine de façon irrégulière." },
    ],
  },
];

export default function FaqPage() {
  const total = FAQ.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900">FAQ Partenaire</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} questions essentielles pour maîtriser IBIG PARTNERS
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FAQ.map((c) => (
            <span key={c.title} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
              {c.icon} {c.items.length}
            </span>
          ))}
        </div>
      </div>

      <FaqClient categories={FAQ} />
    </div>
  );
}
