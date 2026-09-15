/**
 * Génération du contrat de partenariat affilié — IBIG PARTNERS
 * Utilise jsPDF côté serveur (Node.js).
 */

import { jsPDF } from "jspdf";

export interface ContratData {
  // Affilié
  fullName: string;
  country: string;
  city: string;
  idType: string;
  idNumber: string;
  affiliateCode: string;
  email: string;
  phone: string;
  partnerType: string; // INDIVIDUAL | COMPANY | ...
  orgName?: string | null;
  // Dates
  approvedAt: Date;
}

const BLUE = [11, 95, 255] as const;
const DARK = [15, 23, 41] as const;
const GREY = [91, 101, 119] as const;
const LIGHT = [241, 245, 249] as const;

function addPage(doc: jsPDF) {
  doc.addPage();
}

function header(doc: jsPDF) {
  // Bandeau bleu
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("IBIG PARTNERS — Programme d'affiliation IBIG SARL", 105, 10, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Abidjan, Côte d'Ivoire · www.ibigpartners.com", 105, 17, { align: "center" });
  doc.setTextColor(...DARK);
}

function footer(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = 287;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, 196, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text("IBIG SARL — RCCM CI-ABJ-2020-B-XXXXX — NIF XXXXXXXX — Abidjan, Cocody Riviera Palmeraie, Côte d'Ivoire", 14, y + 5);
  doc.text(`Page ${pageNum} / ${totalPages}`, 196, y + 5, { align: "right" });
  doc.setTextColor(...DARK);
}

function sectionTitle(doc: jsPDF, y: number, text: string): number {
  doc.setFillColor(...LIGHT);
  doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text(text, 17, y + 5.5);
  doc.setTextColor(...DARK);
  return y + 13;
}

function paragraph(doc: jsPDF, y: number, text: string, maxWidth = 178): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, 16, y);
  return y + lines.length * 5.5;
}

function kv(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...GREY);
  doc.text(label, 16, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(value || "—", 75, y);
  return y + 6.5;
}

export function generateContratPDF(data: ContratData): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const dateStr = data.approvedAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const identiteLabel =
    data.partnerType === "COMPANY" ? `Entreprise : ${data.orgName || data.fullName}` : "Particulier";

  const TOTAL_PAGES = 4;

  // ═══════════════════════════════════════
  // PAGE 1 — Parties, déclarations, objet, durée
  // ═══════════════════════════════════════
  header(doc);

  // Titre
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...BLUE);
  doc.text("CONTRAT DE PARTENARIAT AFFILIÉ", 105, 35, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text(`Référence : ${data.affiliateCode} — Signé le ${dateStr}`, 105, 42, { align: "center" });

  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(14, 46, 196, 46);
  doc.setLineWidth(0.2);
  doc.setDrawColor(200, 200, 200);

  let y = 53;

  // --- Parties ---
  y = sectionTitle(doc, y, "ARTICLE 1 — PARTIES AU CONTRAT");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("1.1  La Société", 16, y);
  y += 5.5;
  y = kv(doc, y, "Dénomination :", "IBIG SARL");
  y = kv(doc, y, "Siège social :", "Abidjan, Cocody Riviera Palmeraie, Côte d'Ivoire");
  y = kv(doc, y, "Programme :", "IBIG PARTNERS — www.ibigpartners.com");
  y += 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("1.2  L'Affilié(e) (ci-après « le Partenaire »)", 16, y);
  y += 5.5;
  y = kv(doc, y, "Nom complet :", data.fullName);
  y = kv(doc, y, "Type :", identiteLabel);
  y = kv(doc, y, "Pays / Ville :", `${data.country}${data.city ? ` — ${data.city}` : ""}`);
  y = kv(doc, y, "Pièce d'identité :", `${data.idType} n° ${data.idNumber}`);
  y = kv(doc, y, "Email :", data.email);
  y = kv(doc, y, "Téléphone :", data.phone);
  y = kv(doc, y, "Code affilié :", data.affiliateCode);
  y += 4;

  // --- Déclarations solennelles ---
  y = sectionTitle(doc, y, "ARTICLE 2 — DÉCLARATIONS ET GARANTIES DU PARTENAIRE");

  // Encadré avertissement
  doc.setFillColor(255, 243, 243);
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 28, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text("DÉCLARATION SOLENNELLE — ENGAGEMENT PERSONNEL", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const declLines = doc.splitTextToSize(
    "Le Partenaire déclare sur l'honneur, sous peine de poursuites pénales pour faux et usage de faux " +
    "(article 370 du Code Pénal ivoirien) et escroquerie (article 380 du même Code) : (a) que son identité " +
    "est réelle et les documents fournis authentiques ; (b) qu'il agit pour son propre compte ; " +
    "(c) qu'il n'a jamais été condamné pour fraude, escroquerie ou abus de confiance.",
    174,
  ) as string[];
  doc.text(declLines, 16, y + 13);
  doc.setDrawColor(200, 200, 200);
  y += 33;

  y = paragraph(doc, y,
    "Toute fausse déclaration engage la responsabilité civile et pénale du Partenaire. " +
    "IBIG SARL se réserve le droit de transmettre les éléments d'identification aux autorités " +
    "judiciaires compétentes en cas de fraude avérée, sans notification préalable au contrevenant.",
  );
  y += 3;

  // --- Objet ---
  y = sectionTitle(doc, y, "ARTICLE 3 — OBJET DU CONTRAT");
  y = paragraph(doc, y,
    "Le présent contrat définit les conditions de participation du Partenaire au programme " +
    "d'affiliation IBIG PARTNERS : promotion des produits IBIG SARL, génération de ventes " +
    "via des liens de tracking personnels, et perception de commissions sur les ventes confirmées.",
  );
  y += 3;

  // --- Durée ---
  y = sectionTitle(doc, y, "ARTICLE 4 — DURÉE");
  y = paragraph(doc, y,
    `Le présent contrat prend effet le ${dateStr} pour une durée indéterminée. ` +
    "Résiliation amiable possible avec préavis de 30 jours par écrit. " +
    "La résiliation pour fraude est immédiate, sans préavis ni indemnité (voir Article 10).",
  );

  footer(doc, 1, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 2 — Obligations, interdictions strictes, commissions
  // ═══════════════════════════════════════
  addPage(doc);
  header(doc);
  y = 30;

  y = sectionTitle(doc, y, "ARTICLE 5 — OBLIGATIONS DU PARTENAIRE");
  y = paragraph(doc, y,
    "Le Partenaire s'engage à :\n" +
    "  a) Promouvoir les produits IBIG de manière honnête, éthique et légale ;\n" +
    "  b) Utiliser exclusivement ses liens de tracking personnels ;\n" +
    "  c) Déclarer honnêtement toutes les ventes réalisées via la plateforme ;\n" +
    "  d) Respecter la vie privée des clients et prospects ;\n" +
    "  e) Signaler tout incident, anomalie ou tentative de fraude à support@ibigpartners.com.",
  );
  y += 4;

  // Encadré interdictions — fond orange/rouge
  y = sectionTitle(doc, y, "ARTICLE 6 — INTERDICTIONS STRICTES ET ACTES CONSTITUTIFS DE FRAUDE");

  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 62, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(154, 52, 18);
  doc.text("Les actes suivants constituent une FRAUDE GRAVE engageant la responsabilité pénale :", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const fraudLines = doc.splitTextToSize(
    "1. Usurpation d'identité ou fourniture de documents falsifiés lors de l'inscription ou de la vérification KYC.\n" +
    "2. Création de faux comptes clients, fausses ventes ou auto-achats pour générer des commissions fictives.\n" +
    "3. Manipulation des liens de tracking ou injection de cookies frauduleux.\n" +
    "4. Recrutement de filleuls fictifs ou utilisation de fausses identités pour gonfler le réseau.\n" +
    "5. Détournement de commissions appartenant à d'autres partenaires.\n" +
    "6. Promesses mensongères de gains garantis à des prospects ou filleuls.\n" +
    "7. Utilisation du nom, logo ou de la marque IBIG PARTNERS sans autorisation écrite.\n" +
    "8. Divulgation volontaire de données confidentielles à des concurrents.",
    174,
  ) as string[];
  doc.setTextColor(120, 53, 15);
  doc.text(fraudLines, 16, y + 13);
  doc.setDrawColor(200, 200, 200);
  y += 67;

  y = sectionTitle(doc, y, "ARTICLE 7 — RÉMUNÉRATION (COMMISSIONS)");
  y = paragraph(doc, y,
    "Le Partenaire perçoit une commission sur chaque vente confirmée générée via son lien de tracking. " +
    "Les taux applicables sont ceux affichés dans l'Espace Partenaire au moment de la vente. " +
    "IBIG SARL peut réviser ces taux avec un préavis de 15 jours.",
  );
  y += 3;

  // Tableau
  doc.setFillColor(240, 247, 255);
  doc.rect(14, y, 182, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...BLUE);
  doc.text("Niveau", 18, y + 5);
  doc.text("Commission N1 (vente directe)", 65, y + 5);
  doc.text("Commission N2 (réseau)", 148, y + 5);
  y += 7;

  [["STARTER","Variable selon produit","Variable selon produit"],
   ["SILVER","Variable selon produit","Variable selon produit"],
   ["GOLD","Variable selon produit","Variable selon produit"],
   ["MASTER","Variable selon produit","Variable selon produit"],
   ["ELITE","Variable selon produit","Variable selon produit"]].forEach((row, i) => {
    if (i % 2 === 0) { doc.setFillColor(250, 251, 252); doc.rect(14, y, 182, 6.5, "F"); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
    doc.text(row[0], 18, y + 4.5); doc.text(row[1], 65, y + 4.5); doc.text(row[2], 148, y + 4.5);
    y += 6.5;
  });
  y += 2;
  doc.setFontSize(8); doc.setTextColor(...GREY); doc.setFont("helvetica", "italic");
  doc.text("Taux exacts par produit : Espace Partenaire > Mes Liens.", 16, y);
  doc.setFont("helvetica", "normal");

  footer(doc, 2, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 3 — Paiement, sanctions, audit, résiliation
  // ═══════════════════════════════════════
  addPage(doc);
  header(doc);
  y = 30;

  y = sectionTitle(doc, y, "ARTICLE 8 — CONDITIONS DE PAIEMENT ET RETENUE POUR FRAUDE");
  y = paragraph(doc, y,
    "8.1  Paiement normal : Les commissions sont versées dans un délai de 7 à 14 jours ouvrés " +
    "après confirmation de la vente, dès atteinte du seuil minimum (5 000 FCFA), via le mode " +
    "de paiement renseigné dans l'Espace Partenaire.\n\n" +
    "8.2  Retenue et récupération : IBIG SARL se réserve le droit de :\n" +
    "  — Bloquer tout paiement en attente dès ouverture d'une enquête pour fraude ;\n" +
    "  — Annuler et récupérer toutes commissions versées issues de ventes frauduleuses, " +
    "fausses déclarations ou manipulation du système, avec intérêts de retard de 2 % par mois ;\n" +
    "  — Déduire de tout paiement futur les montants indûment perçus.",
  );
  y += 4;

  // Encadré clause pénale
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 30, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text("ARTICLE 9 — CLAUSE PÉNALE (DOMMAGES ET INTÉRÊTS FORFAITAIRES)", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const penalLines = doc.splitTextToSize(
    "En cas de fraude avérée (fausse identité, fausses ventes, manipulation du système, " +
    "recrutement frauduleux), le Partenaire s'engage à verser à IBIG SARL, à titre de clause pénale " +
    "et indépendamment de tout préjudice supplémentaire prouvé : (a) le remboursement intégral de " +
    "toutes les commissions perçues sur la période litigieuse, majoré de 50 % ; (b) une indemnité " +
    "forfaitaire de 500 000 FCFA pour atteinte à l'image et frais d'investigation. " +
    "Cette clause ne fait pas obstacle à toute action pénale.",
    174,
  ) as string[];
  doc.setTextColor(20, 83, 45);
  doc.text(penalLines, 16, y + 13);
  doc.setDrawColor(200, 200, 200);
  y += 35;

  y = sectionTitle(doc, y, "ARTICLE 10 — DROIT D'AUDIT ET DE CONTRÔLE");
  y = paragraph(doc, y,
    "IBIG SARL se réserve le droit, à tout moment et sans préavis, de :\n" +
    "  a) Auditer les activités de vente et de recrutement du Partenaire sur la plateforme ;\n" +
    "  b) Vérifier l'authenticité des ventes déclarées par recoupement avec les partenaires produits ;\n" +
    "  c) Demander au Partenaire tout justificatif complémentaire (preuve de vente, identité client, etc.) " +
    "dans un délai de 72 heures sous peine de suspension immédiate du compte ;\n" +
    "  d) Partager les données d'identification et d'activité avec les autorités judiciaires " +
    "en cas de présomption sérieuse de fraude, sans notification préalable.",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 11 — RÉSILIATION ET CONSÉQUENCES");
  y = paragraph(doc, y,
    "11.1  Résiliation amiable : préavis écrit de 30 jours. Les commissions acquises restent dues.\n\n" +
    "11.2  Résiliation immédiate pour fraude : IBIG SARL peut fermer le compte sans préavis ni " +
    "indemnité dans les cas de l'Article 6. Toutes les commissions en attente sont annulées. " +
    "Les commissions déjà versées issues des actes frauduleux sont récupérées conformément à l'Article 8.\n\n" +
    "11.3  Blacklist : Le Partenaire résilié pour fraude est inscrit sur liste noire et ne peut " +
    "réintégrer le programme IBIG PARTNERS sous aucune identité, directement ou via un tiers.",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 12 — CONFIDENTIALITÉ");
  y = paragraph(doc, y,
    "Le Partenaire s'engage à ne divulguer aucune information confidentielle d'IBIG SARL " +
    "(tarifs internes, taux négociés, base de données clients/partenaires, stratégies commerciales). " +
    "Toute violation entraîne résiliation immédiate et action en dommages et intérêts.",
  );

  footer(doc, 3, TOTAL_PAGES);

  // ═══════════════════════════════════════
  // PAGE 4 — RGPD, droit applicable, signatures
  // ═══════════════════════════════════════
  addPage(doc);
  header(doc);
  y = 30;

  y = sectionTitle(doc, y, "ARTICLE 13 — PROTECTION DES DONNÉES PERSONNELLES");
  y = paragraph(doc, y,
    "Les données personnelles collectées (identité, documents KYC, coordonnées bancaires) " +
    "sont traitées par IBIG SARL pour l'exécution du présent contrat et la prévention de la fraude. " +
    "Elles peuvent être transmises aux autorités judiciaires sans consentement préalable du Partenaire " +
    "si la loi l'exige ou en cas de fraude avérée. Droit d'accès et de rectification : privacy@ibigpartners.com.",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 14 — RENONCIATION AUX RECOURS CONTRE IBIG SARL");

  doc.setFillColor(255, 243, 243);
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.4);
  doc.rect(14, y, 182, 38, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(185, 28, 28);
  doc.text("CLAUSE DE NON-RECOURS — LU ET ACCEPTÉ EXPRESSÉMENT", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const renoncLines = doc.splitTextToSize(
    "Le Partenaire reconnaît expressément et irrévocablement qu'IBIG SARL dispose d'un pouvoir " +
    "discrétionnaire absolu pour : (a) suspendre ou fermer tout compte, à tout moment, sans justification " +
    "ni préavis, en cas de suspicion de fraude, d'inactivité prolongée ou de comportement contraire aux " +
    "intérêts du programme ; (b) modifier unilatéralement les taux de commission, les règles du programme " +
    "ou les conditions d'accès, avec un préavis de 15 jours ; (c) refuser tout paiement dont la légitimité " +
    "est douteuse, pendant la durée de l'enquête interne. " +
    "Le Partenaire renonce expressément à tout recours judiciaire ou extrajudiciaire contre IBIG SARL " +
    "pour les décisions prises dans ce cadre, sauf en cas de faute lourde avérée d'IBIG SARL.",
    174,
  ) as string[];
  doc.setTextColor(120, 20, 20);
  doc.text(renoncLines, 16, y + 13);
  doc.setDrawColor(200, 200, 200);
  y += 43;

  y = sectionTitle(doc, y, "ARTICLE 16 — DROIT APPLICABLE ET JURIDICTION COMPÉTENTE");
  y = paragraph(doc, y,
    "Le présent contrat est régi exclusivement par le droit ivoirien. Tout litige sera soumis " +
    "en premier lieu à une tentative de règlement amiable (30 jours). À défaut, les parties " +
    "attribuent compétence exclusive aux Tribunaux d'Abidjan (Côte d'Ivoire), " +
    "y compris pour les Partenaires résidant à l'étranger.",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 17 — ACCEPTATION ET VALEUR CONTRACTUELLE");
  y = paragraph(doc, y,
    "En soumettant son dossier KYC et en activant son compte IBIG PARTNERS, le Partenaire " +
    "reconnaît avoir lu, compris et accepté sans réserve l'intégralité des dispositions du " +
    "présent contrat. Cette acceptation vaut signature électronique au sens de la loi ivoirienne " +
    "n° 2013-546 du 30 juillet 2013 relative aux transactions électroniques. " +
    "L'adresse IP d'activation et la date d'approbation constituent la preuve irréfutable de " +
    "cette acceptation et sont conservées par IBIG SARL.",
  );
  y += 6;

  // Encadré récapitulatif identité
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 182, 22, "FD");
  doc.setLineWidth(0.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text("IDENTIFIANT D'ACCEPTATION ÉLECTRONIQUE", 105, y + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.text(`Code affilié : ${data.affiliateCode}   |   Nom : ${data.fullName}   |   Pièce : ${data.idType} n° ${data.idNumber}`, 105, y + 12, { align: "center" });
  doc.text(`Date d'activation : ${dateStr}   |   Ce document est une preuve légale d'acceptation des présentes conditions.`, 105, y + 18, { align: "center" });
  doc.setDrawColor(200, 200, 200);
  y += 27;

  // Bloc signatures
  doc.setLineWidth(0.3);

  // Gauche — IBIG SARL
  doc.rect(14, y, 85, 52, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...BLUE);
  doc.text("Pour IBIG SARL", 56, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY);
  doc.text("La Direction Générale", 56, y + 14, { align: "center" });
  doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.2);
  doc.line(24, y + 42, 90, y + 42);
  doc.text("Cachet et signature", 56, y + 48, { align: "center" });

  // Droite — Partenaire
  doc.rect(111, y, 85, 52, "S");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...BLUE);
  doc.text("Le Partenaire", 153, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GREY);
  doc.text(data.fullName, 153, y + 14, { align: "center" });
  doc.text(`Code : ${data.affiliateCode}`, 153, y + 20, { align: "center" });
  doc.text(`Activé le ${dateStr}`, 153, y + 26, { align: "center" });
  doc.line(121, y + 42, 187, y + 42);
  doc.text("Signature électronique (activation du compte)", 153, y + 48, { align: "center" });

  y += 58;

  // Note légale finale
  doc.setFontSize(7.5); doc.setTextColor(...GREY); doc.setFont("helvetica", "italic");
  doc.text(
    doc.splitTextToSize(
      "Document contractuel juridiquement contraignant. Toute fraude est passible de poursuites pénales " +
      "devant les juridictions ivoiriennes. Conservation légale : 10 ans. Contact juridique : legal@ibigpartners.com",
      178,
    ) as string[],
    16, y,
  );

  footer(doc, 4, TOTAL_PAGES);

  // Retourner le buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
