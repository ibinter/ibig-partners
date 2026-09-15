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
  doc.text("IBIG SARL — RCCM CI-ABJ-2020-B-XXXXX — NIF XXXXXXXX — Abidjan, Plateau, Côte d'Ivoire", 14, y + 5);
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

  // ═══════════════════════════════════════
  // PAGE 1 — Parties et objet
  // ═══════════════════════════════════════
  header(doc);

  // Titre
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BLUE);
  doc.text("CONTRAT DE PARTENARIAT AFFILIÉ", 105, 36, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GREY);
  doc.text(`Référence : ${data.affiliateCode} — Signé le ${dateStr}`, 105, 43, { align: "center" });

  // Séparateur
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(14, 47, 196, 47);
  doc.setLineWidth(0.2);
  doc.setDrawColor(200, 200, 200);

  let y = 55;

  // --- Parties ---
  y = sectionTitle(doc, y, "ARTICLE 1 — PARTIES AU CONTRAT");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("1.1  La Société (IBIG SARL)", 16, y);
  y += 6;
  y = kv(doc, y, "Dénomination :", "IBIG SARL");
  y = kv(doc, y, "Siège social :", "Abidjan, Plateau, Côte d'Ivoire");
  y = kv(doc, y, "Programme :", "IBIG PARTNERS");
  y = kv(doc, y, "Site web :", "www.ibigpartners.com");
  y += 3;

  doc.setFont("helvetica", "bold");
  doc.text("1.2  L'Affilié(e)", 16, y);
  y += 6;
  y = kv(doc, y, "Nom complet :", data.fullName);
  y = kv(doc, y, "Type :", identiteLabel);
  y = kv(doc, y, "Pays / Ville :", `${data.country}${data.city ? ` — ${data.city}` : ""}`);
  y = kv(doc, y, "Pièce d'identité :", `${data.idType} n° ${data.idNumber}`);
  y = kv(doc, y, "Email :", data.email);
  y = kv(doc, y, "Téléphone :", data.phone);
  y = kv(doc, y, "Code affilié :", data.affiliateCode);
  y += 6;

  // --- Objet ---
  y = sectionTitle(doc, y, "ARTICLE 2 — OBJET DU CONTRAT");
  y = paragraph(
    doc,
    y,
    "Le présent contrat a pour objet de définir les conditions dans lesquelles l'Affilié(e) " +
      "s'engage à promouvoir les produits et services commercialisés par IBIG SARL dans le cadre " +
      "du programme IBIG PARTNERS, en contrepartie de commissions sur les ventes générées.",
  );
  y += 4;

  // --- Durée ---
  y = sectionTitle(doc, y, "ARTICLE 3 — DURÉE");
  y = paragraph(
    doc,
    y,
    `Le présent contrat prend effet à compter du ${dateStr} et est conclu pour une durée ` +
      "indéterminée. Chaque partie peut y mettre fin à tout moment, par notification écrite " +
      "(e-mail) avec un préavis de trente (30) jours calendaires.",
  );
  y += 4;

  // --- Obligations de l'affilié ---
  y = sectionTitle(doc, y, "ARTICLE 4 — OBLIGATIONS DE L'AFFILIÉ(E)");
  y = paragraph(
    doc,
    y,
    "L'Affilié(e) s'engage à :\n" +
      "  a) Promouvoir les produits IBIG PARTNERS de manière honnête, éthique et conforme aux\n" +
      "     réglementations en vigueur dans son pays de résidence ;\n" +
      "  b) Ne pas effectuer de publicité mensongère ou trompeuse ;\n" +
      "  c) Utiliser exclusivement ses liens de tracking personnels fournis par la plateforme ;\n" +
      "  d) Ne pas solliciter ou recruter des partenaires par des moyens frauduleux ;\n" +
      "  e) Signaler toute anomalie ou litige à support@ibigpartners.com dans les meilleurs délais.",
  );

  footer(doc, 1, 3);

  // ═══════════════════════════════════════
  // PAGE 2 — Rémunération, paiement, confidentialité
  // ═══════════════════════════════════════
  addPage(doc);
  header(doc);
  y = 30;

  y = sectionTitle(doc, y, "ARTICLE 5 — RÉMUNÉRATION (COMMISSIONS)");
  y = paragraph(
    doc,
    y,
    "L'Affilié(e) perçoit une commission sur chaque vente confirmée générée via son lien " +
      "de tracking. Les taux de commission applicables sont ceux affichés dans son Espace Partenaire " +
      "au moment de la vente, et peuvent être mis à jour par IBIG SARL avec un préavis de 15 jours.",
  );
  y += 4;

  // Tableau commissions indicatif
  doc.setFillColor(240, 247, 255);
  doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BLUE);
  doc.text("Niveau", 18, y + 5.5);
  doc.text("Commission Niveau 1 (vente directe)", 65, y + 5.5);
  doc.text("Commission Niveau 2 (réseau)", 145, y + 5.5);
  y += 8;

  const rows = [
    ["STARTER", "Variable selon produit", "Variable selon produit"],
    ["SILVER",  "Variable selon produit", "Variable selon produit"],
    ["GOLD",    "Variable selon produit", "Variable selon produit"],
    ["MASTER",  "Variable selon produit", "Variable selon produit"],
    ["ELITE",   "Variable selon produit", "Variable selon produit"],
  ];

  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(250, 251, 252);
      doc.rect(14, y, 182, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(row[0], 18, y + 4.5);
    doc.text(row[1], 65, y + 4.5);
    doc.text(row[2], 145, y + 4.5);
    y += 7;
  });
  y += 4;

  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.setFont("helvetica", "italic");
  doc.text(
    "Les taux exacts par produit sont consultables dans votre Espace Partenaire > Mes Liens.",
    16,
    y,
  );
  doc.setFont("helvetica", "normal");
  y += 8;

  y = sectionTitle(doc, y, "ARTICLE 6 — CONDITIONS DE PAIEMENT");
  y = paragraph(
    doc,
    y,
    "Les commissions sont créditées sur le compte de l'Affilié(e) dans un délai de 7 à 14 jours " +
      "ouvrés après confirmation définitive de la vente par le client final. " +
      "Le virement est effectué via le mode de paiement renseigné dans l'Espace Partenaire " +
      "(Mobile Money, virement bancaire, PayPal, etc.) dès que le solde disponible atteint " +
      "le seuil minimum de retrait fixé par l'Affilié(e) (minimum 5 000 FCFA ou équivalent).",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 7 — CONFIDENTIALITÉ");
  y = paragraph(
    doc,
    y,
    "L'Affilié(e) s'engage à garder strictement confidentiels tous les éléments non publics " +
      "communiqués par IBIG SARL dans le cadre de ce contrat (tarifs internes, taux de commission " +
      "négociés, documents internes, données clients), sous peine de résiliation immédiate du " +
      "présent contrat et d'action en dommages et intérêts.",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 8 — PROTECTION DES DONNÉES PERSONNELLES");
  y = paragraph(
    doc,
    y,
    "Les données personnelles de l'Affilié(e) collectées dans le cadre du présent contrat " +
      "(identité, coordonnées, données bancaires) sont traitées par IBIG SARL dans le respect des " +
      "lois applicables en matière de protection des données. Elles ne sont jamais cédées à des " +
      "tiers sans consentement explicite. L'Affilié(e) dispose d'un droit d'accès, de rectification " +
      "et de suppression sur simple demande à privacy@ibigpartners.com.",
  );

  footer(doc, 2, 3);

  // ═══════════════════════════════════════
  // PAGE 3 — Résiliation, droit, signatures
  // ═══════════════════════════════════════
  addPage(doc);
  header(doc);
  y = 30;

  y = sectionTitle(doc, y, "ARTICLE 9 — RÉSILIATION");
  y = paragraph(
    doc,
    y,
    "9.1  Résiliation amiable : Chaque partie peut résilier le présent contrat à tout moment " +
      "par notification écrite à l'autre partie, avec un préavis de 30 jours.\n\n" +
      "9.2  Résiliation pour faute : IBIG SARL se réserve le droit de résilier le présent " +
      "contrat sans préavis ni indemnité en cas de :\n" +
      "  — fraude avérée ou tentative de fraude ;\n" +
      "  — violation des présentes conditions ;\n" +
      "  — comportement préjudiciable à l'image d'IBIG SARL ou de ses produits.\n\n" +
      "9.3  En cas de résiliation, les commissions acquises avant la date effective de résiliation " +
      "restent dues et seront versées selon le calendrier normal.",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 10 — DROIT APPLICABLE ET LITIGES");
  y = paragraph(
    doc,
    y,
    "Le présent contrat est régi par le droit ivoirien. En cas de litige, les parties s'engagent " +
      "à rechercher en premier lieu une solution amiable. À défaut d'accord dans un délai de 30 " +
      "jours à compter de la notification du litige, celui-ci sera soumis aux tribunaux compétents " +
      "d'Abidjan (Côte d'Ivoire).",
  );
  y += 4;

  y = sectionTitle(doc, y, "ARTICLE 11 — ACCEPTATION");
  y = paragraph(
    doc,
    y,
    "En activant son compte IBIG PARTNERS et en soumettant son dossier de vérification KYC, " +
      "l'Affilié(e) reconnaît avoir lu, compris et accepté l'intégralité des dispositions du " +
      "présent contrat. L'activation du compte vaut signature électronique.",
  );
  y += 8;

  // Boite signatures
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);

  // Gauche
  doc.rect(14, y, 85, 48, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BLUE);
  doc.text("Pour IBIG SARL", 56, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text("La Direction Générale", 56, y + 14, { align: "center" });
  doc.text("Cachet et signature", 56, y + 44, { align: "center" });

  // Droite
  doc.rect(111, y, 85, 48, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...BLUE);
  doc.text("L'Affilié(e)", 153, y + 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text(data.fullName, 153, y + 14, { align: "center" });
  doc.text(`Code : ${data.affiliateCode}`, 153, y + 19, { align: "center" });
  doc.text(`Validé le ${dateStr}`, 153, y + 25, { align: "center" });
  doc.text("(signature électronique — activation du compte)", 153, y + 44, { align: "center" });

  y += 56;

  // Note légale
  doc.setFontSize(8);
  doc.setTextColor(...GREY);
  doc.setFont("helvetica", "italic");
  const note =
    "Ce document constitue un contrat juridiquement contraignant entre les parties. " +
    "Conservez-en une copie. Pour toute question : support@ibigpartners.com";
  doc.text(doc.splitTextToSize(note, 178) as string[], 16, y);

  footer(doc, 3, 3);

  // Retourner le buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
