/**
 * Générateurs de documents PDF officiels IBIG PARTNERS
 * Utilise jsPDF côté serveur (Node.js).
 */

import { jsPDF } from "jspdf";

// ─── Couleurs ─────────────────────────────────────────────────────────────────
const BLUE  = [11, 95, 255]   as const;
const DARK  = [15, 23, 41]    as const;
const GREY  = [91, 101, 119]  as const;
const LIGHT = [241, 245, 249] as const;
const GREEN = [22, 163, 74]   as const;
const RED   = [220, 38, 38]   as const;

const ADDR = "Abidjan, Cocody Riviera Palmeraie, Côte d'Ivoire";
const SITE = "www.ibigpartners.com";

// ─── Helpers communs ──────────────────────────────────────────────────────────

function header(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("IBIG PARTNERS", 105, 9, { align: "center" });
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 105, 16, { align: "center" });
  doc.setTextColor(...DARK);
}

function footer(doc: jsPDF, page: number, total: number, version = "1.0") {
  const y = 287;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(14, y, 196, y);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text(`IBIG SARL · ${ADDR} · ${SITE}`, 14, y + 4.5);
  doc.text(`v${version} — Page ${page}/${total}`, 196, y + 4.5, { align: "right" });
  doc.setTextColor(...DARK);
}

function title(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...BLUE);
  doc.text(text, 105, y, { align: "center" });
  doc.setTextColor(...DARK);
  return y + 8;
}

function section(doc: jsPDF, text: string, y: number): number {
  doc.setFillColor(...LIGHT);
  doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text(text, 17, y + 5.5);
  doc.setTextColor(...DARK);
  return y + 13;
}

function para(doc: jsPDF, text: string, y: number, maxW = 178): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(text, maxW) as string[];
  doc.text(lines, 16, y);
  return y + lines.length * 5.2 + 1;
}

function bullet(doc: jsPDF, items: string[], y: number): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, 172) as string[];
    doc.text(lines, 20, y);
    y += lines.length * 5.2;
  }
  return y + 1;
}

function box(doc: jsPDF, text: string, y: number, h: number,
  fill: readonly [number,number,number], stroke: readonly [number,number,number],
  textColor: readonly [number,number,number]): number {
  doc.setFillColor(...fill);
  doc.setDrawColor(...stroke);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 182, h, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  const lines = doc.splitTextToSize(text, 174) as string[];
  doc.text(lines, 16, y + 6);
  doc.setTextColor(...DARK);
  return y + h + 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CGU — Conditions Générales d'Utilisation
// ─────────────────────────────────────────────────────────────────────────────

export function generateCGU(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const year = new Date().getFullYear();
  const P = 3;

  header(doc, "Conditions Générales d'Utilisation de la Plateforme");
  let y = title(doc, "CONDITIONS GÉNÉRALES D'UTILISATION", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text(`Version 1.0 — ${year} · IBIG SARL`, 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 10;

  y = section(doc, "ARTICLE 1 — OBJET ET CHAMP D'APPLICATION", y);
  y = para(doc, `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme IBIG PARTNERS (accessible sur ${SITE}) par toute personne inscrite en tant que partenaire affilié (ci-après « l'Utilisateur »). Toute utilisation de la plateforme implique l'acceptation sans réserve des présentes CGU.`, y);

  y = section(doc, "ARTICLE 2 — ACCÈS À LA PLATEFORME", y);
  y = para(doc, "L'accès à la plateforme est réservé aux personnes physiques majeures ou aux personnes morales dûment représentées. IBIG SARL se réserve le droit de refuser ou de suspendre l'accès à tout Utilisateur sans justification préalable, notamment en cas de suspicion de fraude ou de comportement contraire aux présentes CGU.", y);

  y = section(doc, "ARTICLE 3 — INSCRIPTION ET SÉCURITÉ DU COMPTE", y);
  y = bullet(doc, [
    "L'Utilisateur s'engage à fournir des informations exactes et à jour lors de l'inscription.",
    "Il est seul responsable de la confidentialité de ses identifiants de connexion.",
    "Toute utilisation frauduleuse du compte doit être signalée immédiatement à support@ibigpartners.com.",
    "IBIG SARL ne saurait être tenu responsable des dommages résultant d'une utilisation non autorisée du compte.",
  ], y);

  y = section(doc, "ARTICLE 4 — UTILISATION ACCEPTABLE DE LA PLATEFORME", y);
  y = para(doc, "L'Utilisateur s'interdit notamment de :", y);
  y = bullet(doc, [
    "Tenter de pirater, déstabiliser ou surcharger les serveurs de la plateforme.",
    "Publier des contenus illicites, diffamatoires, obscènes ou portant atteinte aux droits de tiers.",
    "Utiliser des robots, scripts ou outils automatisés pour accéder à la plateforme.",
    "Copier, reproduire ou exploiter le contenu de la plateforme sans autorisation écrite.",
    "Usurper l'identité d'IBIG SARL ou d'un autre utilisateur.",
  ], y);

  footer(doc, 1, P);

  // Page 2
  doc.addPage(); header(doc, "Conditions Générales d'Utilisation"); y = 30;

  y = section(doc, "ARTICLE 5 — PROPRIÉTÉ INTELLECTUELLE", y);
  y = para(doc, "Tous les éléments de la plateforme (logo, textes, graphismes, interface, outils) sont la propriété exclusive d'IBIG SARL et protégés par le droit ivoirien et international de la propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation écrite préalable.", y);

  y = section(doc, "ARTICLE 6 — DONNÉES PERSONNELLES", y);
  y = para(doc, "IBIG SARL collecte et traite les données personnelles des Utilisateurs conformément à sa Politique de Confidentialité, dans le respect des lois applicables. Les données sont utilisées pour la gestion des comptes, le calcul des commissions, la prévention de la fraude et l'amélioration des services. Pour exercer vos droits : privacy@ibigpartners.com.", y);

  y = section(doc, "ARTICLE 7 — DISPONIBILITÉ ET MAINTENANCE", y);
  y = para(doc, "IBIG SARL s'efforce de maintenir la plateforme accessible 24h/24 et 7j/7, mais ne garantit pas une disponibilité ininterrompue. Des interruptions pour maintenance peuvent survenir avec ou sans préavis. IBIG SARL ne saurait être tenu responsable des préjudices liés à une indisponibilité temporaire.", y);

  y = section(doc, "ARTICLE 8 — LIMITATION DE RESPONSABILITÉ", y);
  y = para(doc, "Dans les limites permises par la loi, IBIG SARL ne saurait être tenu responsable des dommages indirects, pertes de revenus ou manques à gagner résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme. La responsabilité totale d'IBIG SARL est limitée au montant des commissions versées au cours des 3 derniers mois.", y);

  y = section(doc, "ARTICLE 9 — MODIFICATIONS DES CGU", y);
  y = para(doc, "IBIG SARL se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront informés des modifications par email avec un préavis de 15 jours. La poursuite de l'utilisation de la plateforme après ce délai vaut acceptation des nouvelles CGU.", y);

  footer(doc, 2, P);

  // Page 3
  doc.addPage(); header(doc, "Conditions Générales d'Utilisation"); y = 30;

  y = section(doc, "ARTICLE 10 — RÉSILIATION ET SUSPENSION", y);
  y = para(doc, "L'Utilisateur peut résilier son compte à tout moment en contactant support@ibigpartners.com. IBIG SARL peut suspendre ou résilier un compte sans préavis en cas de violation des présentes CGU, de fraude avérée ou de comportement préjudiciable. Les commissions acquises avant la résiliation restent dues, sauf en cas de fraude.", y);

  y = section(doc, "ARTICLE 11 — DROIT APPLICABLE ET JURIDICTION", y);
  y = para(doc, `Les présentes CGU sont régies par le droit ivoirien. Tout litige relatif à leur interprétation ou exécution sera soumis à la compétence exclusive des Tribunaux d'Abidjan, Côte d'Ivoire.`, y);

  y = section(doc, "ARTICLE 12 — CONTACT", y);
  y = bullet(doc, [
    "Support technique : support@ibigpartners.com",
    "Questions juridiques : legal@ibigpartners.com",
    "Protection des données : privacy@ibigpartners.com",
    `Adresse : IBIG SARL · ${ADDR}`,
  ], y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 14, "F");
  doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text(`En utilisant la plateforme IBIG PARTNERS, vous reconnaissez avoir lu, compris et accepté les présentes CGU.`, 105, y + 5, { align: "center" });
  doc.text(`Version 1.0 — © ${year} IBIG SARL. Tous droits réservés.`, 105, y + 11, { align: "center" });

  footer(doc, 3, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Charte éthique & code de conduite
// ─────────────────────────────────────────────────────────────────────────────

export function generateCharteEthique(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 2;

  header(doc, "Charte Éthique & Code de Conduite des Partenaires");
  let y = title(doc, "CHARTE ÉTHIQUE & CODE DE CONDUITE", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Applicable à tous les partenaires affiliés IBIG PARTNERS", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 12;

  y = box(doc, "IBIG PARTNERS est bâti sur la confiance, l'intégrité et le respect mutuel. En rejoignant notre programme, vous vous engagez à respecter les principes fondamentaux de cette charte. Tout manquement peut entraîner la suspension ou la résiliation définitive du compte.", y, 18, [240, 247, 255], [11, 95, 255], [15, 23, 41]);

  y = section(doc, "1. HONNÊTETÉ DANS LA COMMUNICATION", y);
  y = bullet(doc, [
    "Promouvoir les produits IBIG avec exactitude — ne jamais exagérer les résultats ou garantir des gains.",
    "Toujours se présenter clairement comme affilié indépendant, jamais comme employé d'IBIG SARL.",
    "Ne pas utiliser de techniques de vente sous pression, manipulation psychologique ou urgence artificielle.",
    "Fournir aux prospects toutes les informations nécessaires pour une décision éclairée.",
  ], y);

  y = section(doc, "2. RESPECT DES CLIENTS ET PROSPECTS", y);
  y = bullet(doc, [
    "Traiter chaque personne contactée avec respect et dignité, sans distinction de genre, d'origine ou de statut.",
    "Respecter scrupuleusement les refus et ne jamais harceler un prospect qui ne souhaite pas être contacté.",
    "Protéger les données personnelles des clients — ne jamais les partager sans consentement.",
    "Honorer ses engagements envers les clients et signaler tout problème à IBIG SARL rapidement.",
  ], y);

  y = section(doc, "3. INTÉGRITÉ DANS LES DÉCLARATIONS DE VENTE", y);
  y = bullet(doc, [
    "Ne déclarer que des ventes réelles, effectuées avec de vrais clients identifiables.",
    "Ne jamais créer de faux comptes clients ni réaliser d'auto-achats pour générer des commissions.",
    "Signaler immédiatement toute erreur dans les commissions ou les déclarations.",
    "Ne jamais manipuler les liens de tracking ou les codes affiliés.",
  ], y);

  y = section(doc, "4. COMPORTEMENT SUR LES RÉSEAUX SOCIAUX", y);
  y = bullet(doc, [
    "Ne publier que des contenus véridiques sur les produits et résultats IBIG PARTNERS.",
    "Ne pas dénigrer les concurrents, les autres partenaires ou les clients mécontents publiquement.",
    "Obtenir l'autorisation d'IBIG SARL avant toute campagne publicitaire payante au nom du programme.",
    "Ne pas utiliser le logo ou la marque IBIG sans respecter la charte graphique officielle.",
  ], y);

  footer(doc, 1, P);

  // Page 2
  doc.addPage(); header(doc, "Charte Éthique & Code de Conduite"); y = 30;

  y = section(doc, "5. RECRUTEMENT ÉTHIQUE DES FILLEULS", y);
  y = bullet(doc, [
    "Recruter uniquement des personnes genuinement intéressées par le programme, jamais sous contrainte.",
    "Présenter honnêtement les revenus potentiels — les résultats dépendent de l'effort personnel.",
    "Ne jamais promettre de revenus garantis ou de « revenus passifs automatiques ».",
    "Accompagner et soutenir ses filleuls, ne pas les laisser seuls après leur inscription.",
  ], y);

  y = section(doc, "6. CONFIDENTIALITÉ ET PROTECTION DES INFORMATIONS", y);
  y = bullet(doc, [
    "Ne jamais divulguer les informations internes d'IBIG SARL (tarifs, stratégies, données clients).",
    "Protéger les identifiants de connexion à la plateforme — ne jamais les partager.",
    "Ne pas collecter ni stocker les données personnelles des clients sans leur consentement explicite.",
    "Signaler immédiatement toute fuite de données ou tentative de piratage à support@ibigpartners.com.",
  ], y);

  y = section(doc, "7. SIGNALEMENT ET COOPÉRATION", y);
  y = para(doc, "Tout partenaire qui constate une fraude, une violation de la présente charte ou un comportement non éthique de la part d'un autre partenaire est tenu de le signaler à IBIG SARL à l'adresse compliance@ibigpartners.com. Le signalement de bonne foi est protégé et encouragé.", y);

  y = section(doc, "8. SANCTIONS EN CAS DE MANQUEMENT", y);
  y = para(doc, "Le non-respect de la présente charte peut entraîner, selon la gravité :", y);
  y = bullet(doc, [
    "Avertissement formel et mise en demeure.",
    "Suspension temporaire du compte et des commissions.",
    "Résiliation définitive sans préavis ni indemnité.",
    "Action en dommages et intérêts et/ou poursuites pénales pour les cas graves.",
  ], y);

  y += 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 20, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(21, 128, 61);
  doc.text("ENGAGEMENT DU PARTENAIRE", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(
    doc.splitTextToSize("En signant le contrat de partenariat IBIG PARTNERS, le partenaire s'engage expressément à respecter la présente charte éthique dans l'intégralité de ses activités de promotion et de recrutement.", 174) as string[],
    16, y + 12,
  );
  doc.setTextColor(...DARK);

  footer(doc, 2, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Guide de démarrage rapide
// ─────────────────────────────────────────────────────────────────────────────

export function generateGuideDemarrage(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 2;

  header(doc, "Guide de Démarrage Rapide — Programme IBIG PARTNERS");
  let y = title(doc, "GUIDE DE DÉMARRAGE RAPIDE", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Tout ce qu'il faut savoir pour démarrer et générer vos premières commissions", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 12;

  // Étape 1
  doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...BLUE);
  doc.text("ÉTAPE 1 — Activez vos produits à promouvoir", 17, y + 5);
  doc.setTextColor(...DARK); y += 11;
  y = para(doc, "Rendez-vous dans Espace > Mes Produits. Parcourez le catalogue et activez les produits qui correspondent à votre réseau. Pour chaque produit activé, vous obtenez automatiquement un lien de tracking unique.", y);
  y = bullet(doc, [
    "Choisissez des produits que vous connaissez et que vous pouvez recommander sincèrement.",
    "Commencez par 2 à 3 produits maximum pour vous concentrer efficacement.",
    "Lisez la fiche produit complète avant de le promouvoir.",
  ], y); y += 2;

  // Étape 2
  doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...BLUE);
  doc.text("ÉTAPE 2 — Obtenez vos liens de tracking", 17, y + 5);
  doc.setTextColor(...DARK); y += 11;
  y = para(doc, "Dans Espace > Mes Liens, retrouvez tous vos liens d'affiliation personnalisés. Chaque lien est unique et tracé à votre nom. Copiez-le et utilisez-le dans toutes vos communications.", y);
  y = bullet(doc, [
    "Lien direct : partage rapide vers la page produit avec votre code affilié.",
    "Page de présentation : page IBIG complète avec toutes les infos sur le produit.",
    "QR code : idéal pour les supports imprimés et les présentations en personne.",
  ], y); y += 2;

  // Étape 3
  doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...BLUE);
  doc.text("ÉTAPE 3 — Prospectez et partagez", 17, y + 5);
  doc.setTextColor(...DARK); y += 11;
  y = para(doc, "Identifiez votre réseau cible et partagez vos liens via les canaux adaptés :", y);
  y = bullet(doc, [
    "WhatsApp & groupes : envoyez un message personnalisé avec votre lien.",
    "Facebook & Instagram : publications, stories, messages directs.",
    "Bouche-à-oreille : recommandations en personne lors de réunions ou événements.",
    "Email : envoyez une présentation personnalisée à vos contacts professionnels.",
  ], y);

  footer(doc, 1, P);

  // Page 2
  doc.addPage(); header(doc, "Guide de Démarrage Rapide"); y = 30;

  // Étape 4
  doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...BLUE);
  doc.text("ÉTAPE 4 — Déclarez vos ventes", 17, y + 5);
  doc.setTextColor(...DARK); y += 11;
  y = para(doc, "Dès qu'un client effectue un achat via votre lien, la vente est automatiquement créditée sur votre compte si le tracking fonctionne. Pour les ventes en personne ou par téléphone, déclarez-les manuellement dans Espace > Déclarer une vente.", y);
  y = bullet(doc, [
    "Renseignez les coordonnées du client et le produit vendu.",
    "Joignez une preuve de vente si disponible (reçu, capture d'écran, confirmation).",
    "La vente sera vérifiée et validée par l'équipe IBIG sous 48h.",
  ], y); y += 2;

  // Étape 5
  doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...BLUE);
  doc.text("ÉTAPE 5 — Suivez et encaissez vos commissions", 17, y + 5);
  doc.setTextColor(...DARK); y += 11;
  y = para(doc, "Consultez vos commissions en temps réel dans Espace > Commissions. Dès que votre solde atteint votre seuil minimum de retrait, une demande de paiement est automatiquement générée.", y);
  y = bullet(doc, [
    "Vérifiez votre mode de paiement dans Mon Profil > Coordonnées de paiement.",
    "Les paiements sont effectués sous 7 à 14 jours ouvrés.",
    "Consultez l'historique complet dans Espace > Mes Paiements.",
  ], y); y += 4;

  // Étape 6 — Développer son réseau
  doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...BLUE);
  doc.text("ÉTAPE 6 — Recrutez des filleuls et multipliez vos revenus", 17, y + 5);
  doc.setTextColor(...DARK); y += 11;
  y = para(doc, "Partagez votre lien de parrainage avec des personnes motivées. Pour chaque vente que vos filleuls réalisent, vous touchez une commission de réseau supplémentaire.", y);
  y = bullet(doc, [
    "Votre code parrain se trouve dans Mon Profil > Mon Code Affilié.",
    "Accompagnez vos filleuls — leur succès est aussi le vôtre.",
    "Consultez votre réseau dans Espace > Mon Réseau.",
  ], y); y += 4;

  // Tips box
  doc.setFillColor(255, 247, 237); doc.setDrawColor(234, 88, 12); doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 28, "FD"); doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(154, 52, 18);
  doc.text("CONSEILS POUR RÉUSSIR RAPIDEMENT", 105, y + 7, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  const tips = doc.splitTextToSize(
    "1. Fixez-vous un objectif : minimum 3 ventes par semaine. 2. Consacrez au moins 1h/jour à la prospection. 3. Suivez l'Académie IBIG pour monter en compétences. 4. Rejoignez les événements IBIG pour apprendre des meilleurs partenaires. 5. Utilisez le Coach IA pour obtenir des scripts de vente personnalisés.",
    174,
  ) as string[];
  doc.setTextColor(120, 53, 15);
  doc.text(tips, 16, y + 14);

  footer(doc, 2, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Plan de compensation — taux réels de la plateforme
// ─────────────────────────────────────────────────────────────────────────────

export function generatePlanCompensation(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 3;

  header(doc, "Plan de Compensation Officiel — Programme IBIG PARTNERS");
  let y = title(doc, "PLAN DE COMPENSATION OFFICIEL", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Taux officiels · 3 niveaux · 5 statuts · Cookie tracking 90 jours", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 10;

  y = section(doc, "PRINCIPE — 3 NIVEAUX DE COMMISSION", y);
  // 3 colonnes N1/N2/N3
  const cols = [
    { lvl: "N1", label: "Vous vendez directement", color: [37, 99, 235] as const },
    { lvl: "N2", label: "Votre filleul vend", color: [124, 58, 237] as const },
    { lvl: "N3", label: "Le filleul de votre filleul", color: [79, 70, 229] as const },
  ];
  const bw = 56;
  cols.forEach((c, i) => {
    const x = 14 + i * (bw + 5);
    doc.setFillColor(c.color[0], c.color[1], c.color[2]);
    doc.roundedRect(x, y, bw, 20, 3, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(255,255,255);
    doc.text(c.lvl, x + bw / 2, y + 8, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    doc.text(doc.splitTextToSize(c.label, bw - 4) as string[], x + bw / 2, y + 14, { align: "center" });
  });
  doc.setTextColor(...DARK);
  y += 26;

  // ── Tableau abonnement mensuel
  y = section(doc, "ABONNEMENT MENSUEL (SaaS) — Commissions dégres­sives sur 4 mois", y);
  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(255,255,255);
  doc.text("Mois", 22, y + 5); doc.text("N1 (vous)", 80, y + 5); doc.text("N2 (filleul)", 120, y + 5); doc.text("N3 (filleul²)", 160, y + 5);
  y += 7; doc.setTextColor(...DARK);
  const monthly = [[1,"20 %","10 %","5 %"],[2,"15 %","8 %","3 %"],[3,"10 %","5 %","2 %"],[4,"5 %","3 %","1 %"],["Total","50 %","26 %","11 %"]];
  monthly.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14, y, 182, 7, "F"); }
    const isTot = r[0] === "Total";
    doc.setFont("helvetica", isTot ? "bold" : "normal"); doc.setFontSize(8.5);
    if (isTot) { doc.setFillColor(240,247,255); doc.rect(14, y, 182, 7, "F"); }
    if (isTot) { doc.setTextColor(11,95,255); } else { doc.setTextColor(...DARK); }
    doc.text(String(r[0] === "Total" ? "Total 4 mois" : `Mois ${r[0]}`), 22, y + 5);
    doc.text(String(r[1]), 80, y + 5); doc.text(String(r[2]), 120, y + 5); doc.text(String(r[3]), 160, y + 5);
    y += 7;
  });
  doc.setTextColor(...DARK);
  y += 3;

  // ── Tableau abonnement annuel + formations
  y = section(doc, "ABONNEMENT ANNUEL & FORMATIONS — Commission one-shot à la signature", y);
  doc.setFillColor(...BLUE); doc.rect(14, y, 90, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255,255,255);
  doc.text("Abonnement annuel", 17, y + 5);
  doc.setFillColor(180, 83, 9); doc.rect(105, y, 91, 7, "F");
  doc.text("Formations (catalogue)", 108, y + 5);
  y += 7; doc.setTextColor(...DARK);
  const oneshot = [["N1","20 %","10 %"],["N2","8 %","5 %"],["N3","3 %","2 %"]];
  oneshot.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14, y, 182, 7, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
    doc.text(r[0], 22, y + 5); doc.text(r[1], 55, y + 5);
    doc.text(r[0], 115, y + 5); doc.text(r[2], 148, y + 5);
    y += 7;
  });
  y += 3;

  // ── Services (taux variable par branche)
  y = section(doc, "SERVICES & PRODUITS (taux variable par branche) — N2 = N1÷2 · N3 = N1÷4", y);
  const branches = [
    { name: "IBIG IMMO TRUST", n1: "10 %", n2: "5 %", n3: "2,5 %" },
    { name: "IBIG CONSEIL+",   n1: "20 %", n2: "10 %", n3: "5 %"   },
    { name: "IBIG DIGITAL",    n1: "15 %", n2: "7,5 %", n3: "3,75 %" },
  ];
  doc.setFillColor(248,250,252); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GREY);
  doc.text("Branche", 17, y + 5); doc.text("N1 (direct)", 80, y + 5); doc.text("N2", 120, y + 5); doc.text("N3", 160, y + 5);
  y += 7; doc.setTextColor(...DARK);
  branches.forEach((b, i) => {
    if (i % 2 === 0) { doc.setFillColor(255,255,255); doc.rect(14, y, 182, 7, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    doc.text(b.name, 17, y + 5); doc.text(b.n1, 80, y + 5); doc.text(b.n2, 120, y + 5); doc.text(b.n3, 160, y + 5);
    y += 7;
  });

  footer(doc, 1, P);

  // ── PAGE 2 : Statuts + Bonus
  doc.addPage(); header(doc, "Plan de Compensation Officiel"); y = 30;

  y = section(doc, "5 STATUTS — CRITÈRES ET BONUS DE PROGRESSION", y);
  y = para(doc, "Votre statut détermine un bonus supplémentaire qui s'ajoute à votre taux N1 sur TOUS les produits. Il évolue automatiquement chaque mois selon vos performances cumulées.", y);

  const statuts = [
    { label: "STARTER", crit: "Dès l'inscription (0 vente)", bonus: "+0 %",   ventes: "0",   direct: "-",  team: "-" },
    { label: "SILVER",  crit: "10 ventes confirmées",        bonus: "+2 %",   ventes: "10",  direct: "-",  team: "-" },
    { label: "GOLD",    crit: "25 ventes + 10 filleuls",     bonus: "+5 %",   ventes: "25",  direct: "10", team: "20" },
    { label: "MASTER",  crit: "50 ventes + 25 filleuls",     bonus: "+8 %",   ventes: "50",  direct: "25", team: "50" },
    { label: "ELITE",   crit: "100 ventes + 50 filleuls",    bonus: "+12 %",  ventes: "100", direct: "50", team: "100" },
  ];

  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255,255,255);
  doc.text("Statut", 17, y + 5); doc.text("Ventes totales", 58, y + 5); doc.text("Filleuls directs", 100, y + 5); doc.text("Équipe active", 140, y + 5); doc.text("Bonus N1", 170, y + 5);
  y += 7; doc.setTextColor(...DARK);
  statuts.forEach((s, i) => {
    if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14, y, 182, 8, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
    doc.text(s.label, 17, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.text(s.ventes, 58, y + 5.5); doc.text(s.direct, 100, y + 5.5); doc.text(s.team, 140, y + 5.5);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...GREEN as unknown as [number,number,number]);
    doc.text(s.bonus, 170, y + 5.5);
    doc.setTextColor(...DARK);
    y += 8;
  });
  y += 4;

  // Exemple calcul concret
  y = section(doc, "EXEMPLE CONCRET — Abonnement mensuel à 45 000 F/mois (statut GOLD)", y);
  const eg = [
    { label: "Mois 1 — N1 (20 % + 5 % bonus)", montant: "11 250 F" },
    { label: "Mois 2 — N1 (15 % + 5 % bonus)", montant: "9 000 F" },
    { label: "Mois 3 — N1 (10 % + 5 % bonus)", montant: "6 750 F" },
    { label: "Mois 4 — N1 (5 % + 5 % bonus)", montant: "4 500 F" },
    { label: "TOTAL N1 sur ce seul abonnement", montant: "31 500 F" },
  ];
  eg.forEach((r, i) => {
    const isTotal = i === eg.length - 1;
    if (isTotal) { doc.setFillColor(240,247,255); } else if (i % 2 === 0) { doc.setFillColor(248,250,252); } else { doc.setFillColor(255,255,255); }
    doc.rect(14, y, 182, 7, "F");
    doc.setFont("helvetica", isTotal ? "bold" : "normal"); doc.setFontSize(8.5);
    if (isTotal) { doc.setTextColor(11,95,255); } else { doc.setTextColor(...DARK); }
    doc.text(r.label, 17, y + 5); doc.text(r.montant, 185, y + 5, { align: "right" });
    y += 7;
  });
  doc.setTextColor(...DARK);
  y += 4;

  y = box(doc, "Cookie tracking : 90 jours — Si un prospect clique votre lien aujourd'hui et achète dans les 90 jours, vous touchez la commission même sans nouvelle interaction de votre part.", y, 14, [240,247,255], [11,95,255] as const, DARK);

  footer(doc, 2, P);

  // ── PAGE 3 : Paiements + Règles
  doc.addPage(); header(doc, "Plan de Compensation Officiel"); y = 30;

  y = section(doc, "CONDITIONS DE PAIEMENT", y);
  y = bullet(doc, [
    "Seuil minimum de retrait : 5 000 FCFA.",
    "Délai de paiement : 7 à 14 jours ouvrés après validation de la vente.",
    "Commissions issues de ventes annulées ou remboursées automatiquement annulées.",
    "En cas de suspicion de fraude : paiements suspendus jusqu'à résolution de l'enquête.",
  ], y);

  y = section(doc, "MODES DE PAIEMENT ACCEPTÉS", y);
  y = bullet(doc, [
    "Mobile Money : Orange Money, Wave, MTN MoMo, Moov Money, Flooz, T-Money",
    "CinetPay, KKiaPay",
    "Virement bancaire IBAN/SWIFT (délai +3-5 jours ouvrés)",
    "PayPal, Wise, Skrill (partenaires hors zone FCFA)",
  ], y);

  y = section(doc, "RÈGLES DE CONFORMITÉ", y);
  y = bullet(doc, [
    "Toute vente suspecte (auto-achat, faux client, manipulation de tracking) entraîne annulation des commissions.",
    "Les commissions issues d'un réseau fictif sont récupérées intégralement.",
    "IBIG SARL peut auditer toute vente et demander des justificatifs sous 72h.",
    "En cas de fraude avérée : pénalité forfaitaire de 500 000 FCFA + remboursement majoré de 50 % (voir Contrat).",
  ], y);

  y = section(doc, "RÉVISION DU PLAN", y);
  y = para(doc, "IBIG SARL se réserve le droit de modifier les taux de commission avec un préavis de 15 jours. Les statuts sont réévalués chaque mois. Une régression de statut est possible en cas d'inactivité de plus de 60 jours.", y);

  y += 4;
  doc.setFillColor(240,253,244); doc.setDrawColor(...GREEN); doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 22, "FD"); doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(21,128,61);
  doc.text("SIMULEZ VOS REVENUS EN TEMPS RÉEL", 105, y + 7, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(
    doc.splitTextToSize("Connectez-vous à l'Espace Partenaire > Simulateur de gains pour modéliser vos revenus selon vos ventes, votre réseau et votre statut — avec les taux réels de la plateforme.", 174) as string[],
    16, y + 14,
  );

  footer(doc, 3, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Guide des bonnes pratiques
// ─────────────────────────────────────────────────────────────────────────────

export function generateGuideBonnesPratiques(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 2;

  header(doc, "Guide des Bonnes Pratiques — Vente & Recrutement Éthique");
  let y = title(doc, "GUIDE DES BONNES PRATIQUES", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Vente, prospection et recrutement éthique pour maximiser vos résultats", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 12;

  y = section(doc, "1. IDENTIFIER ET CIBLER SON MARCHÉ", y);
  y = para(doc, "La clé du succès en affiliation est de proposer le bon produit à la bonne personne. Avant de prospecter, définissez clairement votre cible :", y);
  y = bullet(doc, [
    "Qui dans votre réseau a un besoin que les produits IBIG peuvent satisfaire ?",
    "Quels sont les secteurs (éducation, agriculture, immobilier, digital) les plus représentés autour de vous ?",
    "Quelle est la capacité financière de votre cible ? (adapte le produit au budget)",
    "Utilisez l'outil Mon Marché dans votre espace pour analyser votre zone géographique.",
  ], y);

  y = section(doc, "2. SCRIPTS DE PROSPECTION EFFICACES", y);
  y = para(doc, "Abordez vos prospects naturellement, sans pression. Exemple de script WhatsApp :", y);

  doc.setFillColor(248, 250, 252); doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.3);
  doc.rect(14, y, 182, 22, "FD"); doc.setLineWidth(0.2);
  doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(51, 65, 85);
  const script = `"Bonjour [Prénom], j'espère que tu vas bien ! Je travaille avec IBIG PARTNERS et je viens de découvrir [Nom du produit] qui m'a vraiment intéressé pour [bénéfice concret]. Je me suis dit que ça pourrait t'intéresser aussi. Tu veux que je t'envoie les détails ?"`;
  doc.text(doc.splitTextToSize(script, 174) as string[], 16, y + 6);
  doc.setTextColor(...DARK); y += 26;

  y = bullet(doc, [
    "Personnalisez toujours votre message — jamais de copier-coller générique.",
    "Attendez la réponse avant d'envoyer le lien — ne pas spammer.",
    "Si refus : remerciez et passez à la suite. Ne relancez pas plus de 2 fois.",
  ], y);

  y = section(doc, "3. PRÉSENTATION PRODUIT EN PERSONNE", y);
  y = bullet(doc, [
    "Préparez-vous : maîtrisez le produit, ses avantages et son prix avant toute présentation.",
    "Posez des questions : comprenez le besoin avant de présenter la solution.",
    "Montrez la page produit IBIG sur votre téléphone — la crédibilité de la plateforme rassure.",
    "Gérez les objections : prix, délai, confiance. Répondez calmement avec des faits.",
    "Closez naturellement : 'Est-ce que tu veux qu'on procède maintenant ?' ou 'Tu préfères réfléchir ?'",
  ], y);

  footer(doc, 1, P);

  // Page 2
  doc.addPage(); header(doc, "Guide des Bonnes Pratiques"); y = 30;

  y = section(doc, "4. UTILISER LES RÉSEAUX SOCIAUX EFFICACEMENT", y);
  y = bullet(doc, [
    "Créez du contenu éducatif (témoignages, avant/après, tutoriels) plutôt que de la publicité directe.",
    "Publiez régulièrement (3 à 5 fois/semaine) pour rester visible dans les fils d'actualité.",
    "Les stories Instagram et WhatsApp ont un fort taux d'engagement — utilisez-les quotidiennement.",
    "Créez un groupe WhatsApp dédié à vos prospects intéressés pour partager les actualités IBIG.",
    "Évitez le spam dans les groupes publics — cela nuit à votre réputation et à celle d'IBIG.",
  ], y);

  y = section(doc, "5. SUIVI ET RELANCE DES PROSPECTS", y);
  y = bullet(doc, [
    "Tenez un suivi simple : notez dans votre téléphone le nom, le produit présenté et la date.",
    "Relancez après 3 jours si pas de réponse : 'Tu as eu le temps de regarder ?'",
    "Après 2 relances sans réponse : respectez la décision et passez à d'autres prospects.",
    "Utilisez Espace > Mes Prospects pour organiser votre pipeline de vente.",
    "Un non aujourd'hui peut devenir un oui dans 3 mois — gardez le contact courtois.",
  ], y);

  y = section(doc, "6. ACCOMPAGNER ET FORMER SES FILLEULS", y);
  y = bullet(doc, [
    "Organisez un premier appel de 30 min avec chaque nouveau filleul pour l'orienter.",
    "Partagez le présent guide et le Guide de démarrage rapide dès leur inscription.",
    "Créez un groupe WhatsApp avec vos filleuls actifs pour partager les meilleures pratiques.",
    "Célébrez les réussites de vos filleuls — la motivation est contagieuse.",
    "Un filleul actif = une commission supplémentaire pour vous à chaque vente.",
  ], y);

  y = section(doc, "7. LES ERREURS À ÉVITER ABSOLUMENT", y);
  y = bullet(doc, [
    "Promettre des revenus garantis ou exagérer les résultats — c'est interdit et contre-productif.",
    "Harceler des prospects qui ont dit non — cela détruit votre réputation.",
    "Prospecter sans connaître le produit — vous perdrez toute crédibilité.",
    "Négliger le suivi après la vente — les clients satisfaits sont les meilleurs ambassadeurs.",
    "Abandonner après les premiers échecs — la persévérance est la clé du succès en affiliation.",
  ], y);

  y += 4;
  doc.setFillColor(240, 247, 255); doc.setDrawColor(...BLUE); doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 16, "FD"); doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...BLUE);
  doc.text("RESSOURCES DISPONIBLES DANS VOTRE ESPACE", 105, y + 7, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30, 58, 138);
  doc.text("Académie IBIG · Coach IA · Kit Marketing · Simulateur de gains · Guide de démarrage · Opportunités & Annonces", 105, y + 13, { align: "center" });

  footer(doc, 2, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Kit de Présentation des Offres IBIG
// ─────────────────────────────────────────────────────────────────────────────

export function generateKitPresentation(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 4;

  // ── PAGE 1 : COUVERTURE ───────────────────────────────────────────────────
  doc.setFillColor(11, 95, 255); doc.rect(0, 0, 210, 297, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
  doc.text("IBIG PARTNERS", 105, 60, { align: "center" });
  doc.setFontSize(7); doc.setFont("helvetica", "normal");
  doc.text("ENSEMBLE, PLUS DE POSSIBILITÉS", 105, 68, { align: "center" });
  doc.setFontSize(28); doc.setFont("helvetica", "bold");
  doc.text("KIT DE", 105, 110, { align: "center" });
  doc.text("PRÉSENTATION", 105, 126, { align: "center" });
  doc.text("DES OFFRES", 105, 142, { align: "center" });
  doc.setFillColor(234, 88, 12); doc.rect(0, 155, 210, 2, "F");
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(200, 220, 255);
  doc.text("La présentation officielle à partager avec vos prospects", 105, 168, { align: "center" });
  doc.text("10 branches · 14 logiciels · Formations · Immobilier · Digital · Et plus", 105, 177, { align: "center" });
  doc.setFontSize(8); doc.setTextColor(150, 180, 255);
  doc.text(`${ADDR} · ${SITE}`, 105, 260, { align: "center" });
  doc.text(`Version 1.0 — ${new Date().getFullYear()} IBIG SARL`, 105, 268, { align: "center" });

  // ── PAGE 2 : QUI EST IBIG + 11 BRANCHES ─────────────────────────────────
  doc.addPage();
  header(doc, "Kit de Présentation des Offres IBIG PARTNERS");
  let y = title(doc, "LE GROUPE IBIG EN UN COUP D'ŒIL", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("INTERMARK BUSINESS INTERNATIONAL GROUP SARL — Abidjan, Côte d'Ivoire", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 10;

  doc.setFillColor(240, 247, 255); doc.setDrawColor(...BLUE); doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 14, "FD"); doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...BLUE);
  doc.text("« Démocratiser l'accès aux opportunités économiques et commerciales en Afrique »", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY);
  doc.text("Inscription gratuite · Commissions sur 3 niveaux · Cookie tracking 90 jours · Paiements Mobile Money", 105, y + 11, { align: "center" });
  doc.setTextColor(...DARK);
  y += 20;

  y = section(doc, "LES 11 BRANCHES DU GROUPE IBIG", y);
  const branches6 = [
    { icon: "⚙️", name: "IBIG SOFT",             desc: "14 logiciels SaaS métiers (scolaire, commerce, RH, immobilier, BTP, santé, agriculture…)" },
    { icon: "🎓", name: "IBIG EDUFORM",           desc: "Formations professionnelles, certifications, e-learning, coaching et insertion" },
    { icon: "🏠", name: "IBIG IMMO TRUST",        desc: "Vente, location, gestion locative, foncier, assistance diaspora et projets BTP" },
    { icon: "🛒", name: "IBIG MARKET",            desc: "Matériel IT, mobilier, fournitures, énergie solaire, matériel médical et audiovisuel" },
    { icon: "💻", name: "IBIG DIGITAL",           desc: "Sites web, e-commerce, applications, identité visuelle, contenus et community management" },
    { icon: "🔧", name: "IBIG DIGITAL KITS",      desc: "ERP, IA, GED, cybersécurité, développement sur mesure et infogérance" },
    { icon: "📊", name: "IBIG CONSEIL+",          desc: "Création d'entreprise, comptabilité, audit, fiscalité, stratégie, certification ISO" },
    { icon: "🤝", name: "IBIG PARTNERS",          desc: "Affiliation, mise en relation B2B, développement de marchés et réseau de partenaires" },
    { icon: "🔧", name: "IBIG MULTISERVICES",     desc: "Événementiel, logistique, sécurité, nettoyage, déménagement, tourisme et transport" },
    { icon: "👥", name: "IBIG EMPLOI & TALENTS",  desc: "Recrutement, placement, intérim, externalisation RH, insertion et accompagnement" },
  ];
  branches6.forEach((b, i) => {
    const bh = 10;
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, bh, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLUE);
    doc.text(`${b.name}`, 22, y + 6.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(b.desc, 115) as string[];
    doc.text(lines, 78, y + (bh - lines.length * 4) / 2 + 4);
    y += bh;
  });

  footer(doc, 2, P);

  // ── PAGE 3 : 14 LOGICIELS IBIG SOFT ─────────────────────────────────────
  doc.addPage();
  header(doc, "Kit de Présentation — IBIG SOFT");
  y = title(doc, "IBIG SOFT — 14 LOGICIELS MÉTIERS", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Solutions SaaS pour entreprises, PME, administrations et institutions", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK);
  y += 10;

  const softs6 = [
    { name: "SCOLABY",        cible: "Écoles, collèges, lycées",            tarif: "10 000 F/mois" },
    { name: "ZELIVRY",        cible: "Livreurs, e-commerçants",             tarif: "4 900 F/mois"  },
    { name: "STOCKFLOW",      cible: "PME, distributeurs",                   tarif: "5 000 F/mois"  },
    { name: "LOKATIVO",       cible: "Agences immo, propriétaires",         tarif: "9 900 F/mois"  },
    { name: "GESCOMXEL",      cible: "Commerçants, boutiques",              tarif: "5 000 F/mois"  },
    { name: "IBIG FLEET 360", cible: "Entreprises de transport",            tarif: "19 900 F/mois" },
    { name: "CONSTRUIRO",     cible: "Entreprises BTP, bureaux d'études",   tarif: "15 000 F/mois" },
    { name: "SANTAREX",       cible: "Cliniques, hôpitaux",                 tarif: "12 000 F/mois" },
    { name: "AGRIFRIK",       cible: "Agriculteurs, coopératives",          tarif: "6 500 F/mois"  },
    { name: "GESTMONEY",      cible: "Réseaux Mobile Money",                tarif: "9 900 F/mois"  },
    { name: "ANOUANZÊ",       cible: "ONG, associations",                   tarif: "12 900 F/mois" },
    { name: "IBIG FACTPRO",   cible: "Tous professionnels",                 tarif: "4 900 F/mois"  },
    { name: "SECRETIS",       cible: "Entreprises, administrations",        tarif: "4 900 F/mois"  },
    { name: "IBIG DOCPRO",    cible: "Entreprises, particuliers",           tarif: "100 F/doc"     },
  ];

  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("Solution", 18, y + 5); doc.text("Cible principale", 70, y + 5);
  doc.text("Tarif indicatif", 135, y + 5); doc.text("Comm. N1", 170, y + 5);
  y += 7; doc.setTextColor(...DARK);

  softs6.forEach((s, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 8, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...BLUE);
    doc.text(s.name, 18, y + 5.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    doc.text(s.cible, 70, y + 5.5); doc.text(s.tarif, 135, y + 5.5);
    doc.setTextColor(22, 163, 74); doc.text("20 %", 170, y + 5.5);
    doc.setTextColor(...DARK); y += 8;
  });

  footer(doc, 3, P);

  // ── PAGE 4 : COMMISSIONS + CTA ──────────────────────────────────────────
  doc.addPage();
  header(doc, "Kit de Présentation — Commissions & Rejoindre");
  y = title(doc, "COMMISSIONS PAR BRANCHE", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Taux officiels — consultez l'Espace Partenaire pour les mises à jour", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK); y += 10;

  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("Branche", 18, y + 5); doc.text("N1 (direct)", 85, y + 5);
  doc.text("N2 (filleul)", 125, y + 5); doc.text("N3", 165, y + 5);
  y += 7; doc.setTextColor(...DARK);

  const rates6 = [
    ["IBIG SOFT (mensuel)", "20 % → 5 % (4 mois)", "10 % → 3 %", "5 % → 1 %"],
    ["IBIG SOFT (annuel)", "20 %", "8 %", "3 %"],
    ["IBIG EDUFORM", "10 %", "5 %", "2 %"],
    ["IBIG IMMO TRUST", "10 %", "5 %", "2,5 %"],
    ["IBIG MARKET", "8 %", "4 %", "2 %"],
    ["IBIG DIGITAL", "10 %", "5 %", "2 %"],
    ["IBIG DIGITAL KITS", "15 %", "7,5 %", "3,75 %"],
    ["IBIG CONSEIL+", "10-20 %*", "5 %", "2 %"],
    ["IBIG MULTISERVICES", "10 %", "5 %", "2 %"],
    ["IBIG EMPLOI & TALENTS", "10 %", "5 %", "2 %"],
  ];
  rates6.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 8, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...DARK);
    doc.text(r[0], 18, y + 5.5);
    doc.setTextColor(11, 95, 255); doc.setFont("helvetica", "bold"); doc.text(r[1], 85, y + 5.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(124, 58, 237); doc.text(r[2], 125, y + 5.5);
    doc.setTextColor(79, 70, 229); doc.text(r[3], 165, y + 5.5);
    doc.setTextColor(...DARK); y += 8;
  });
  doc.setFont("helvetica", "italic"); doc.setFontSize(7.5); doc.setTextColor(...GREY);
  doc.text("* Taux exact visible dans Espace Partenaire > Mes Liens avant toute communication à un prospect.", 16, y + 4);
  y += 12;

  doc.setFillColor(11, 95, 255); doc.rect(14, y, 182, 35, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(255, 255, 255);
  doc.text("REJOIGNEZ IBIG PARTNERS — INSCRIPTION GRATUITE", 105, y + 10, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text("Inscription · Vérification · Contrat · Commissions · Paiement Mobile Money", 105, y + 18, { align: "center" });
  doc.setFillColor(234, 88, 12); doc.rect(65, y + 22, 80, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(255, 255, 255);
  doc.text(SITE, 105, y + 27.5, { align: "center" });

  footer(doc, 4, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Modèle de Devis Partenaire
// ─────────────────────────────────────────────────────────────────────────────

export function generateModeleDevis(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 2;
  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const validStr = new Date(today.getTime() + 30 * 86400000)
    .toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  // ── PAGE 1 : DEVIS ───────────────────────────────────────────────────────
  doc.setFillColor(...BLUE); doc.rect(0, 0, 210, 30, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
  doc.text("IBIG PARTNERS", 14, 12);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text("INTERMARK BUSINESS INTERNATIONAL GROUP SARL", 14, 20);
  doc.text(ADDR, 14, 26);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11);
  doc.text("DEVIS / PROPOSITION COMMERCIALE", 196, 12, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
  doc.text(`Date : ${dateStr}`, 196, 20, { align: "right" });
  doc.text(`Valable jusqu'au : ${validStr}`, 196, 26, { align: "right" });
  doc.setTextColor(...DARK);

  let y = 38;

  doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLUE);
  doc.text("N° DEVIS : DEV-IBIG-[VOTRE CODE]-[NUMÉRO]", 17, y + 5.5);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...GREY);
  doc.text("Partenaire Affilié : [Prénom NOM] · Code : [VOTRE CODE]", 130, y + 5.5);
  doc.setTextColor(...DARK); y += 14;

  doc.setFillColor(240, 247, 255); doc.rect(14, y, 87, 32, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLUE);
  doc.text("DESTINATAIRE (CLIENT)", 17, y + 7);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.setFontSize(8.5);
  doc.text("[Nom / Raison sociale]", 17, y + 14);
  doc.text("[Adresse]", 17, y + 20);
  doc.text("[Ville, Pays]", 17, y + 26);
  doc.text("[Email · Téléphone]", 17, y + 32);

  doc.setFillColor(248, 250, 252); doc.rect(109, y, 87, 32, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLUE);
  doc.text("PARTENAIRE APPORTEUR", 112, y + 7);
  doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
  doc.text("[Prénom NOM]", 112, y + 14);
  doc.text("Code affilié : [VOTRE CODE]", 112, y + 20);
  doc.text("[Votre email]", 112, y + 26);
  doc.text("[Votre téléphone]", 112, y + 32);
  y += 40;

  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(255, 255, 255);
  doc.text("Désignation", 17, y + 5.5); doc.text("Branche IBIG", 95, y + 5.5);
  doc.text("Durée / Qté", 135, y + 5.5); doc.text("Prix unit.", 160, y + 5.5);
  doc.text("Montant", 186, y + 5.5, { align: "right" });
  y += 8; doc.setTextColor(...DARK);

  const lignes7 = [
    "[Nom de la solution ou du service]",
    "[Option ou module complémentaire]",
    "[Formation ou accompagnement]",
  ];
  lignes7.forEach((l, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 10, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
    doc.text(l, 17, y + 6.5);
    doc.setTextColor(...GREY);
    doc.text("[Branche]", 95, y + 6.5); doc.text("[Durée]", 135, y + 6.5);
    doc.text("[Prix]", 160, y + 6.5); doc.text("[Montant]", 186, y + 6.5, { align: "right" });
    doc.setTextColor(...DARK); y += 10;
  });

  doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.3);
  doc.line(14, y, 196, y); y += 5;

  const totaux7 = [
    { label: "Sous-total HT", val: "[Montant]", bold: false },
    { label: "Remise (si applicable)", val: "- [Montant]", bold: false },
    { label: "TOTAL À PAYER (FCFA)", val: "[TOTAL]", bold: true },
  ];
  totaux7.forEach((t) => {
    if (t.bold) { doc.setFillColor(11, 95, 255); doc.rect(100, y - 2, 96, 9, "F"); doc.setTextColor(255, 255, 255); }
    else { doc.setTextColor(...DARK); }
    doc.setFont("helvetica", t.bold ? "bold" : "normal"); doc.setFontSize(t.bold ? 9.5 : 8.5);
    doc.text(t.label, 103, y + 4); doc.text(t.val, 186, y + 4, { align: "right" });
    doc.setTextColor(...DARK); y += 9;
  });
  y += 6;

  y = section(doc, "CONDITIONS DE RÈGLEMENT", y);
  y = bullet(doc, [
    "Paiement via : Orange Money, Wave, MTN MoMo, virement bancaire, CinetPay.",
    "Acompte de 30 % à la signature — solde à l'activation du service.",
    "Devis valable 30 jours à compter de la date d'émission.",
    "Les tarifs sont indiqués en FCFA, toutes taxes comprises.",
  ], y);

  footer(doc, 1, P);

  // ── PAGE 2 : GUIDE D'UTILISATION ────────────────────────────────────────
  doc.addPage();
  header(doc, "Modèle de Devis Partenaire — Guide d'utilisation");
  y = title(doc, "COMMENT UTILISER CE MODÈLE DE DEVIS", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("Instructions pratiques pour vos propositions commerciales", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK); y += 12;

  y = section(doc, "ÉTAPE 1 — PERSONNALISEZ LE DEVIS", y);
  y = bullet(doc, [
    "Remplacez tous les champs entre crochets [ ] par les informations réelles.",
    "Votre code affilié (visible dans Espace > Mon Profil) est obligatoire.",
    "Vérifiez les tarifs officiels dans Espace Partenaire > Mes Liens avant d'inscrire un prix.",
  ], y);

  y = section(doc, "ÉTAPE 2 — BUNDLES RECOMMANDÉS (plus de commissions)", y);
  y = bullet(doc, [
    "PME : GESCOMXEL + IBIG FACTPRO + IBIG CONSEIL+ (3 commissions sur un seul client).",
    "École : SCOLABY + formation IBIG EDUFORM pour les enseignants.",
    "Entrepreneur : site IBIG DIGITAL + ERP STOCKFLOW + formation gestion.",
    "Propriétaire immo : LOKATIVO + service gestion IBIG IMMO TRUST.",
  ], y);

  y = section(doc, "ÉTAPE 3 — TRANSMETTEZ ET SUIVEZ", y);
  y = bullet(doc, [
    "Enregistrez le prospect dans Espace > Mes Prospects pour suivre l'avancement.",
    "Si le client accepte : transmettez le dossier via support@ibigpartners.com avec votre code affilié.",
    "Commission créditée dès confirmation de vente par IBIG (sous 7 jours ouvrés).",
  ], y);

  y = section(doc, "RÈGLES IMPORTANTES", y);
  y = bullet(doc, [
    "Ne modifiez jamais les prix officiels IBIG sans autorisation.",
    "Ce devis est une proposition de votre part en tant que partenaire affilié indépendant.",
    "Vous n'êtes pas salarié ni représentant légal d'IBIG SARL — ne vous présentez jamais ainsi.",
    "En cas de doute : contactez support@ibigpartners.com avant d'envoyer le devis.",
  ], y);

  footer(doc, 2, P);
  return Buffer.from(doc.output("arraybuffer"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Manuel Officiel du Partenaire
// ─────────────────────────────────────────────────────────────────────────────

export function generateManuelPartenaire(): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const P = 5;

  // ── PAGE 1 : COUVERTURE ───────────────────────────────────────────────────
  doc.setFillColor(15, 23, 41); doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(11, 95, 255); doc.rect(0, 0, 6, 297, "F");
  doc.setFillColor(234, 88, 12); doc.rect(0, 140, 210, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(11, 95, 255);
  doc.text("IBIG PARTNERS", 24, 55);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(100, 120, 160);
  doc.text("INTERMARK BUSINESS INTERNATIONAL GROUP SARL", 24, 63);
  doc.setFont("helvetica", "bold"); doc.setFontSize(26); doc.setTextColor(255, 255, 255);
  doc.text("MANUEL OFFICIEL", 24, 95);
  doc.text("DU PARTENAIRE", 24, 115);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(180, 200, 230);
  doc.text("Comprendre · Promouvoir · Connecter · Développer · Réussir", 24, 152);
  doc.text("La référence pédagogique et opérationnelle du réseau IBIG PARTNERS", 24, 162);
  doc.setFontSize(8.5); doc.setTextColor(80, 100, 140);
  doc.text("Version 1.0", 24, 260);
  doc.text(ADDR, 24, 267);
  doc.text(SITE, 24, 274);

  // ── PAGE 2 : SOMMAIRE ─────────────────────────────────────────────────────
  doc.addPage();
  header(doc, "Manuel Officiel du Partenaire IBIG PARTNERS");
  let y = title(doc, "SOMMAIRE — 20 MODULES", 34);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...GREY);
  doc.text("De la présentation du programme à la FAQ et aux scripts commerciaux", 105, y + 2, { align: "center" });
  doc.setTextColor(...DARK); y += 10;

  doc.setFillColor(254, 249, 195); doc.setDrawColor(234, 179, 8); doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 12, "FD"); doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(113, 63, 18);
  doc.text("RÈGLE FONDAMENTALE : IBIG PARTNERS rémunère l'activité commerciale éligible.", 105, y + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("L'inscription seule ne constitue pas une source de revenu. Aucun revenu n'est garanti.", 105, y + 10, { align: "center" });
  doc.setTextColor(...DARK); y += 18;

  const modules8 = [
    "1. Présentation d'IBIG PARTNERS", "2. La proposition de valeur du partenaire",
    "3. Le portefeuille d'offres (10 branches)", "4. Les activités du partenaire",
    "5. Les missions commerciales", "6. Commissions et paiement",
    "7. Le réseau N1 / N2 / N3", "8. Les statuts et la progression",
    "9. Parcours de démarrage 30 jours", "10. La méthode commerciale B.E.S.O.I.N.",
    "11. Prospecter efficacement", "12. Présenter une offre et obtenir un RDV",
    "13. Convertir et suivre une opportunité", "14. Outils et kits marketing",
    "15. Construire et animer son réseau", "16. Éthique, conformité et règles",
    "17. Indicateurs de performance", "18. FAQ du partenaire",
    "19. Scripts commerciaux prêts à l'emploi", "20. Annexes et procédures",
  ];
  modules8.forEach((m, i) => {
    const col = i % 2; const row = Math.floor(i / 2);
    const rx = 14 + col * 92; const ry = y + row * 9;
    if (row % 2 === 0 && col === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, ry - 2, 182, 9, "F"); }
    doc.setTextColor(...BLUE); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
    doc.text("▸", rx + 2, ry + 4);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    doc.text(m, rx + 7, ry + 4);
  });

  footer(doc, 2, P);

  // ── PAGE 3 : MODULES 1-5 ─────────────────────────────────────────────────
  doc.addPage();
  header(doc, "Manuel — Modules 1 à 5");
  y = 30;

  y = section(doc, "MODULE 1 — QU'EST-CE QU'IBIG PARTNERS ?", y);
  y = para(doc, "IBIG PARTNERS est la plateforme centrale d'affiliation et de partenariat commercial d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL. Elle permet d'accéder à l'écosystème de produits et services du Groupe depuis un compte partenaire unique.", y);
  y = bullet(doc, [
    "Le partenaire est un acteur du développement commercial : il identifie des besoins, oriente vers les bonnes solutions, crée des connexions et développe une équipe.",
    "Inscription gratuite · 3 niveaux de commissions · Cookie tracking 90 jours · Paiements Mobile Money.",
    "Ce n'est pas une rémunération basée uniquement sur l'inscription de membres — l'activité commerciale est requise.",
  ], y); y += 2;

  y = section(doc, "MODULE 2 — LES 7 ACTIVITÉS DU PARTENAIRE", y);
  const activites8 = [
    ["Promouvoir",        "Présenter une offre IBIG → Vente / prospect qualifié"],
    ["Recommander",       "Orienter vers la bonne solution → Mise en relation / conversion"],
    ["Apporter affaire",  "Identifier un besoin commercial → Dossier qualifié transmis à IBIG"],
    ["Mission",           "Exécuter une mission publiée → Validation et paiement"],
    ["Obtenir un RDV",    "Mettre en relation avec un décideur → Rendez-vous qualifié"],
    ["Développer réseau", "Parrainer et accompagner → Commission N2/N3 sur ventes filleuls"],
    ["Partenariat B2B",   "Identifier entreprises/projets → Opportunité de collaboration"],
  ];
  activites8.forEach(([act, res]) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLUE);
    doc.text(`• ${act}`, 18, y);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.text(res, 65, y);
    y += 6;
  });
  y += 2;

  y = section(doc, "MODULE 3 — 10 BRANCHES DU GROUPE IBIG", y);
  y = para(doc, "IBIG SOFT (14 logiciels) · IBIG EDUFORM (formations) · IBIG IMMO TRUST (immobilier) · IBIG MARKET (commerce) · IBIG DIGITAL (création web/app) · IBIG DIGITAL KITS (ERP/IA/cybersécurité) · IBIG CONSEIL+ (comptabilité/juridique) · IBIG PARTNERS (affiliation/B2B) · IBIG MULTISERVICES (événementiel/logistique) · IBIG EMPLOI & TALENTS (RH/recrutement)", y);

  y = section(doc, "MODULE 5 — MISSIONS COMMERCIALES", y);
  y = bullet(doc, [
    "CP — Lead validé : rémunère une action commerciale qualifiée (ex: obtenir un RDV décideur).",
    "CASH — Vente encaissée : liée à une vente ou un encaissement confirmé.",
    "MIXED — Lead + Vente : combine prospection qualifiée et conversion.",
  ], y);

  footer(doc, 3, P);

  // ── PAGE 4 : MODULES 6-12 ─────────────────────────────────────────────────
  doc.addPage();
  header(doc, "Manuel — Modules 6 à 12");
  y = 30;

  y = section(doc, "MODULE 6 — GRILLE DE COMMISSIONS OFFICIELLE", y);
  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("Branche", 17, y + 5); doc.text("N1", 90, y + 5); doc.text("N2", 125, y + 5); doc.text("N3", 158, y + 5);
  y += 7; doc.setTextColor(...DARK);
  const rates8 = [
    ["IBIG SOFT mensuel", "20%→5% (4 mois)", "10%→3%", "5%→1%"],
    ["IBIG SOFT annuel", "20%", "8%", "3%"],
    ["IBIG EDUFORM", "10%", "5%", "2%"],
    ["IBIG IMMO TRUST", "10%", "5%", "2,5%"],
    ["IBIG DIGITAL KITS", "15%", "7,5%", "3,75%"],
    ["IBIG DIGITAL / CONSEIL+", "10%", "5%", "2%"],
    ["IBIG MARKET / MULTISERVICES", "8-10%", "4-5%", "2%"],
  ];
  rates8.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 7, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...DARK);
    doc.text(r[0], 17, y + 5);
    doc.setTextColor(11, 95, 255); doc.text(r[1], 90, y + 5);
    doc.setTextColor(124, 58, 237); doc.text(r[2], 125, y + 5);
    doc.setTextColor(79, 70, 229); doc.text(r[3], 158, y + 5);
    doc.setTextColor(...DARK); y += 7;
  });
  y += 4;

  y = section(doc, "MODULE 8 — STATUTS ET BONUS DE PROGRESSION", y);
  const st8 = [
    ["STARTER", "Dès l'inscription", "+0 %"],
    ["SILVER",  "10 ventes", "+2 % sur N1"],
    ["GOLD",    "25 ventes + 10 filleuls + 20 équipe", "+5 % sur N1"],
    ["MASTER",  "50 ventes + 25 filleuls + 50 équipe", "+8 % sur N1"],
    ["ELITE",   "100 ventes + 50 filleuls + 100 équipe", "+12 % sur N1"],
  ];
  doc.setFillColor(...BLUE); doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("Statut", 17, y + 5); doc.text("Critères", 55, y + 5); doc.text("Bonus", 168, y + 5);
  y += 7;
  st8.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 7, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...BLUE);
    doc.text(r[0], 17, y + 5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.text(r[1], 55, y + 5);
    doc.setTextColor(22, 163, 74); doc.text(r[2], 168, y + 5);
    doc.setTextColor(...DARK); y += 7;
  });
  y += 4;

  y = section(doc, "MODULE 9 — PARCOURS DE DÉMARRAGE 30 JOURS", y);
  const j30 = [
    ["J 1-3",  "Comprendre", "Profil, CGU, offres, commissions, missions disponibles."],
    ["J 4-7",  "Choisir",    "Sélectionner 1-2 niches et préparer les supports."],
    ["Sem. 2", "Prospecter", "20 à 50 contacts ciblés, messages personnalisés, qualification."],
    ["Sem. 3", "Convertir",  "Démos, rendez-vous, devis, transmission de prospects qualifiés."],
    ["Sem. 4", "Optimiser",  "Mesurer, identifier le meilleur produit, répéter et préparer réseau."],
  ];
  j30.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, y, 182, 9, "F"); }
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLUE);
    doc.text(r[0], 17, y + 6); doc.text(r[1], 42, y + 6);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK); doc.setFontSize(8);
    doc.text(doc.splitTextToSize(r[2], 118) as string[], 78, y + 4.5);
    y += 9;
  });

  footer(doc, 4, P);

  // ── PAGE 5 : MÉTHODE + ÉTHIQUE + FAQ ─────────────────────────────────────
  doc.addPage();
  header(doc, "Manuel — Méthode B.E.S.O.I.N. · Éthique · FAQ");
  y = 30;

  y = section(doc, "MODULE 10 — MÉTHODE COMMERCIALE B.E.S.O.I.N.", y);
  const besoin8 = [
    ["B", "Besoin",     "Identifier le problème réel avant de parler produit."],
    ["E", "Écoute",     "Poser des questions ouvertes, faire parler le prospect."],
    ["S", "Solution",   "Associer le besoin identifié à une offre IBIG précise."],
    ["O", "Objection",  "Traiter calmement avec des faits — ne pas forcer."],
    ["I", "Invitation", "Proposer démo, devis, rendez-vous ou mise en relation."],
    ["N", "Next step",  "Définir la prochaine action et la date — ne jamais terminer sans RDV suivant."],
  ];
  besoin8.forEach((r, i) => {
    if (i % 2 === 0) { doc.setFillColor(240, 247, 255); doc.rect(14, y, 182, 8, "F"); }
    doc.setFillColor(...BLUE); doc.rect(14, y, 12, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
    doc.text(r[0], 20, y + 5.5, { align: "center" });
    doc.setFontSize(8.5); doc.setTextColor(...BLUE);
    doc.text(r[1], 30, y + 5.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    doc.text(doc.splitTextToSize(r[2], 128) as string[], 60, y + 3.5);
    y += 8;
  });
  y += 4;

  y = section(doc, "MODULE 16 — RÈGLES ÉTHIQUES ET DE CONFORMITÉ", y);
  y = bullet(doc, [
    "Ne jamais se présenter comme salarié ou représentant légal d'IBIG SARL.",
    "Ne jamais promettre un revenu garanti ou automatique à un prospect ou un filleul.",
    "Utiliser uniquement les supports officiels IBIG — ne pas modifier les prix ni les conditions.",
    "Respecter les refus : ne pas relancer un prospect qui a clairement décliné.",
    "Signaler toute fraude ou comportement non éthique à compliance@ibigpartners.com.",
  ], y); y += 4;

  y = section(doc, "MODULE 18 — FAQ ESSENTIELLE", y);
  const faq8 = [
    ["L'inscription est-elle payante ?", "Non. Inscription 100 % gratuite. Aucun frais d'adhésion ni achat obligatoire."],
    ["Quand suis-je payé(e) ?", "Commissions versées sous 7-14 jours ouvrés dès le seuil de 5 000 FCFA atteint."],
    ["Puis-je recruter sans vendre ?", "Oui, mais les commissions ne sont versées que sur les ventes réelles, pas sur les inscriptions."],
    ["Comment déclarer une vente ?", "Via Espace > Déclarer une vente, ou automatiquement via votre lien de tracking."],
    ["Que faire si je ne connais pas le tarif d'un produit ?", "Vérifiez dans Espace > Mes Liens ou contactez support@ibigpartners.com avant de communiquer un prix."],
  ];
  faq8.forEach(([q, a]) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLUE);
    doc.text(`Q: ${q}`, 17, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(`R: ${a}`, 174) as string[];
    doc.text(lines, 17, y); y += lines.length * 5 + 3;
  });

  footer(doc, 5, P);
  return Buffer.from(doc.output("arraybuffer"));
}
