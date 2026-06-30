"use client";

import { useState } from "react";

export default function GuidePage() {
  const [loading,setLoading] = useState(false);

  async function generatePDF() {
    setLoading(true);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      // @ts-ignore
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "portrait",unit: "mm",format: "a4"});

      // Fix: jsPDF Helvetica ne supporte pas les caracteres accentues
      function t(s: string): string {
    return s;
      }

      const W = 210;
      const H = 297;
      const BLUE = [11,95,255] as [number,number,number];
      const DARK = [15,23,41] as [number,number,number];
      const GOLD = [245,158,11] as [number,number,number];
      const GRAY = [100,116,139] as [number,number,number];
      const LIGHT = [241,245,249] as [number,number,number];
      const WHITE = [255,255,255] as [number,number,number];

      // ── Helpers ────────────────────────────────────────────────
      function newPage() { doc.addPage(); }

      function header(pageNum: number,total: number) {
        doc.setFillColor(...BLUE);
        doc.rect(0,0,W,12,"F");
        doc.setFontSize(8);
        doc.setTextColor(...WHITE);
        doc.text(t("IBIG PARTNERS — Guide Utilisateur Officiel"),14,8);
        doc.text(`Page ${pageNum} / ${total}`,W - 14,8,{ align: "right"});
      }

      function footer() {
        doc.setFillColor(...DARK);
        doc.rect(0,H - 10,W,10,"F");
        doc.setFontSize(7);
        doc.setTextColor(...GOLD);
        doc.text(t("2026 IBIG SARL — INTERMARK BUSINESS INTERNATIONAL GROUP SARL — ibigpartners.com"),W / 2,H - 4,{ align: "center"});
      }

      function sectionTitle(text: string,y: number) {
        doc.setFillColor(...BLUE);
        doc.roundedRect(14,y - 6,W - 28,10,2,2,"F");
        doc.setFontSize(12);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...WHITE);
        doc.text(t(text),20,y);
        return y + 12;
      }

      function subTitle(text: string,y: number) {
        doc.setFontSize(10);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text(t(text),14,y);
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(0.3);
        doc.line(14,y + 1.5,W - 14,y + 1.5);
        return y + 8;
      }

      function body(text: string,y: number,indent = 14) {
        doc.setFontSize(9);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(t(text),W - indent - 14);
        doc.text(lines,indent,y);
        return y + lines.length * 5;
      }

      function bullet(text: string,y: number) {
        doc.setFontSize(9);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        doc.setFillColor(...GOLD);
        doc.circle(18,y - 1.5,1,"F");
        const lines = doc.splitTextToSize(t(text),W - 30);
        doc.text(lines,22,y);
        return y + lines.length * 5 + 1;
      }

      function infoBox(text: string,y: number,color: [number,number,number] = [239,246,255]) {
        const lines = doc.splitTextToSize(t(text),W - 34);
        const h = lines.length * 5 + 8;
        doc.setFillColor(...color);
        doc.roundedRect(14,y,W - 28,h,2,2,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        doc.text(lines,20,y + 7);
        return y + h + 5;
      }

      // ═══════════════════════════════════════════════════════════
      // PAGE 1 — COUVERTURE
      // ═══════════════════════════════════════════════════════════
      // Fond dégradé simulé
      doc.setFillColor(...DARK);
      doc.rect(0,0,W,H,"F");

      // Bande bleue centrale
      doc.setFillColor(...BLUE);
      doc.rect(0,70,W,130,"F");

      // Accent gold
      doc.setFillColor(...GOLD);
      doc.rect(0,70,W,3,"F");
      doc.rect(0,197,W,3,"F");

      // Logo texte
      doc.setFontSize(42);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...WHITE);
      doc.text("IBIG",W / 2,105,{ align: "center"});
      doc.setTextColor(...GOLD);
      doc.text("PARTNERS",W / 2,125,{ align: "center"});

      // Trait décoratif
      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.5);
      doc.line(50,133,W - 50,133);

      doc.setFontSize(13);
      doc.setFont("helvetica","normal");
      doc.setTextColor(...WHITE);
      doc.text("GUIDE UTILISATEUR OFFICIEL",W / 2,143,{ align: "center"});

      doc.setFontSize(9);
      doc.setTextColor(200,215,255);
      doc.text(t("Programme d'Affiliation Multi-Niveaux"),W / 2,153,{ align: "center"});
      doc.text(t("INTERMARK BUSINESS INTERNATIONAL GROUP SARL"),W / 2,160,{ align: "center"});

      // Version & date
      doc.setFontSize(8);
      doc.setTextColor(...GOLD);
      doc.text(t("Version 1.0 - Juin 2026"),W / 2,175,{ align: "center"});

      // Bas de page couverture
      doc.setFontSize(8);
      doc.setTextColor(150,170,210);
      doc.text(t("CONFIDENTIEL - Usage interne et partenaires agréés"),W / 2,H - 20,{ align: "center"});
      doc.text("ibigpartners.com · contact@ibigpartners.com · +225 27 22 27 60 14",W / 2,H - 13,{ align: "center"});

      // ═══════════════════════════════════════════════════════════
      // PAGE 2 — TABLE DES MATIÈRES
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(2,12);
      footer();

      doc.setFillColor(...LIGHT);
      doc.rect(0,12,W,30,"F");
      doc.setFontSize(20);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...DARK);
      doc.text(t("Table des matières"),14,32);
      doc.setFillColor(...GOLD);
      doc.rect(14,36,40,2,"F");

      const toc = [
        ["1.","Présentation d'IBIG PARTNERS","3"],
        ["2.","Inscription et types de comptes","4"],
        ["3.","Tableau de bord partenaire","5"],
        ["4.","Programme d'affiliation — Commissions sur 3 niveaux","6"],
        ["5.","Catalogue des branches et produits","7"],
        ["6.","Vérification KYC — Activation des paiements","8"],
        ["7.","Liens d'affiliation et QR codes","9"],
        ["8.","Suivi des ventes et commissions","10"],
        ["9.","Réseau et parrainage","10"],
        ["10.","Académie IBIG — Formation","11"],
        ["11.","Espace SUPERADMIN","11"],
        ["12.","Support, contact et FAQ","12"],
      ];

      let y = 50;
      toc.forEach(([num,title,page],i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248,250,252);
          doc.rect(14,y - 5,W - 28,9,"F");
        }
        doc.setFontSize(10);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text(num,18,y);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        doc.text(title,28,y);
        doc.setTextColor(...GRAY);
        doc.text(page,W - 18,y,{ align: "right"});
        // Points de conduite
        const titleWidth = doc.getTextWidth(title);
        doc.setDrawColor(...LIGHT);
        doc.setLineWidth(0.2);
        for (let x = 32 + titleWidth + 3; x < W - 22; x += 3) {
          doc.circle(x,y - 1,0.3,"F");
        }
        y += 10;
      });

      // ═══════════════════════════════════════════════════════════
      // PAGE 3 — PRÉSENTATION
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(3,12);
      footer();

      let py = 22;
      py = sectionTitle("1. Présentation d'IBIG PARTNERS",py);
      py += 4;

      py = body("IBIG PARTNERS est la plateformé officielle d'affiliation multi-niveaux d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL). Elle permet à toute personne ou organisation de devenir Partenaire Affilié et de générer des revenus en recommandant les produits et services du groupe IBIG.",py);
      py += 4;

      py = subTitle("Vision & Mission",py);
      py = body("Notre vision : créer le plus grand réseau de partenaires commerciaux panafricains, capables de distribuer des solutions de qualité mondiale adaptées aux réalités africaines.",py);
      py += 3;
      py = body("Notre mission : offrir à chaque partenaire les outils, la formation et les commissions attractivés pour bâtir un revenu durable et construire son propre réseau.",py);
      py += 5;

      py = subTitle("Les 5 Branches du Groupe IBIG",py);

      const branches = [
        ["IBIG SOFT","Logiciels SaaS de gestion (Scolaby, Fleet 360, GESCOMXEL, Zelivry, Lokativo, StockFlow)","Commission : 20% N1 • 10% N2 • 5% N3 (dégressive sur 4 mois)"],
        ["IBIG EDUFORM","Formations professionnelles certifiantes (comptabilité, RH, QHSE, Sage, SAP, IA...)","Commission : 10% N1 • 5% N2 • 2% N3 par inscription"],
        ["IBIG IMMOTRUST","Immobilier, BTP, gestion locative, construction clé en main, diaspora","Commission : 5% N1 • 2, 5% N2 • 1% N3 sur la valeur"],
        ["IBIG MARKET","Commerce, distribution, matériel informatique, mobilier, fournitures BTP","Commission : 8% N1 • 4% N2 • 2% N3 par vente"],
        ["INTERMARK BUSINESS","Conseil stratégique, ingénierie de projets, digitalisation, levée de fonds","Commission : 8% N1 • 4% N2 • 2% N3 sur la mission"],
      ];

      branches.forEach(([name,desc,comm]) => {
        doc.setFillColor(...BLUE);
        doc.roundedRect(14,py,4,18,1,1,"F");
        doc.setFontSize(10);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...DARK);
        doc.text(name,22,py + 6);
        doc.setFont("helvetica","normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...GRAY);
        doc.text(desc,22,py + 12);
        doc.setTextColor(...GOLD);
        doc.text(comm,22,py + 17);
        py += 24;
      });

      py = infoBox("IBIG PARTNERS est 100% gratuit — aucun investissement requis. L'inscription est ouverte à tous : particuliers, entreprises, ONG, associations. Vos commissions sont calculées automatiquement et versées sur votre méthode de paiement préférée.",py,[239,246,255]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 4 — INSCRIPTION
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(4,12);
      footer();

      py = 22;
      py = sectionTitle("2. Inscription et types de comptes",py);
      py += 4;

      py = subTitle("Comment s'inscrire",py);
      const steps = [
        "Rendez-vous sur ibigpartners.com et cliquez sur « Devenir Partenaire ».",
        "Choisissez votre type de compte : Particulier, Entreprise, ONG, Association ou Autre.",
        "Remplissez le formulaire : prénom, nom, email, téléphone, ville, mot de passe.",
        "Si vous avez été recommandé par un partenaire, entrez son code parrain (ex : AFF-KOFFI-001).",
        "Cliquez sur « Créer mon compte partenaire » — votre code d'affiliation est généré automatiquement.",
        "Votre compte est en attente de validation par l'équipe IBIG (sous 24-48h ouvrées).",
        "Une fois validé, vous recevez un email de confirmation et accédez à toutes les fonctionnalités.",
      ];
      steps.forEach((s,i) => {
        doc.setFillColor(...BLUE);
        doc.circle(17,py - 1.5,3.5,"F");
        doc.setFontSize(8);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...WHITE);
        doc.text(String(i + 1),17,py,{ align: "center"});
        doc.setFont("helvetica","normal");
        doc.setFontSize(9);
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(s,W - 36);
        doc.text(lines,24,py);
        py += lines.length * 5 + 4;
      });

      py += 4;
      py = subTitle("Types de partenaires",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Type","Pour qui ?","Documents KYC requis"]],
        body: [
          ["Particulier","Toute personne physique souhaitant gagner des commissions","CNI/Passeport, CV, contacts de référence"],
          ["Entreprise","Sociétés, SARL, SAS, SA...","RCCM, NIF, représentant légal"],
          ["ONG","Organisations non gouvernementales","Statuts, acte de création, représentant"],
          ["Association","Associations déclarées","Récépissé, statuts, bureau exécutif"],
          ["Autre","Coopératives, groupements, etc.","Documents d'identification appropriés"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 8;

      py = infoBox("Votre code d'affiliation unique (ex : AFF-DUPONT-042) est votre identité sur la plateformé. Partagez-le pour parrainer de nouveaux partenaires et construire votre réseau.",py,[240,253,244]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 5 — TABLEAU DE BORD
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(5,12);
      footer();

      py = 22;
      py = sectionTitle("3. Tableau de bord partenaire",py);
      py += 4;

      py = body("Votre espace partenaire (ibigpartners.com/espace) centralise toutes vos informations en temps réel. Voici les sections disponibles :",py);
      py += 5;

      const sections = [
        ["Accueil","Vue d'ensemble : commissions du mois, ventes récentes, statut actuel, badges gagnés et alertes importantes."],
        ["Mes Liens","Génération de liens d'affiliation pour chaque produit. QR Code téléchargeable. Suivi des clics en temps réel."],
        ["Ventes","Historique complet de toutes vos ventes confirmées, en attente et annulées, avec montants et dates."],
        ["Commissions","Détail de chaque commission : niveau (N1/N2/N3), montant, statut (En attente / Validée / Payée)."],
        ["Paiements","Historique des virements reçus avec références, montants et méthodes de paiement."],
        ["Mon Réseau","Visualisation de votre arbre de parrainage sur 3 niveaux avec les performances de chaque filleul."],
        ["Prospects","Gestion de vos prospects : ajout, suivi du statut (Contacté, Démo, Converti, Perdu)."],
        ["Badges","Collection de vos badges gagnés : 1ère vente, 10 ventes, statut Gold, équipe de 10..."],
        ["Académie","Modules de formation IBIG : articles, vidéos, quiz et assistant IA pour progresser."],
        ["Coach IA","Assistant intelligent formé sur les produits IBIG pour répondre à toutes vos questions."],
        ["Communication","Chat avec l'équipe IBIG et les autrès partenaires Gold+."],
        ["Paramètrès","Modification du profil, méthode de paiement, mot de passe, préférences."],
        ["Vérification KYC","Soumission de votre dossier de vérification pour activér les paiements de commissions."],
      ];

      sections.forEach(([name,desc]) => {
        if (py > 260) { newPage(); header(5,12); footer(); py = 22; }
        doc.setFillColor(248,250,255);
        doc.roundedRect(14,py - 4,W - 28,14,2,2,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text(name,18,py + 2);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(desc,W - 50);
        doc.text(lines,18,py + 7);
        py += 17;
      });

      // ═══════════════════════════════════════════════════════════
      // PAGE 6 — COMMISSIONS
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(6,12);
      footer();

      py = 22;
      py = sectionTitle("4. Programme d'affiliation — Commissions sur 3 niveaux",py);
      py += 4;

      py = body("Le système de commissions IBIG PARTNERS fonctionne sur 3 niveaux de profondeur. Plus votre réseau est actif, plus vos revenus passifs augmentent automatiquement.",py);
      py += 5;

      py = subTitle("Principe des 3 niveaux",py);

      // Schéma simplifié
      const boxW = 50;
      const levels = [
        { label: "VOUS",sub: "Partenaire",color: BLUE as [number,number,number],x: W / 2 - 25 },
      ];
      doc.setFillColor(...BLUE);
      doc.roundedRect(W / 2 - 25,py,boxW,12,2,2,"F");
      doc.setFontSize(9);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...WHITE);
      doc.text("VOUS",W / 2,py + 8,{ align: "center"});

      doc.setDrawColor(...GRAY);
      doc.setLineWidth(0.5);
      // Flèches vers N1
      doc.line(W / 2 - 25,py + 6,W / 2 - 60,py + 30);
      doc.line(W / 2 + 25,py + 6,W / 2 + 60,py + 30);

      const n1y = py + 28;
      [-60,60].forEach(offset => {
        doc.setFillColor(16,185,129);
        doc.roundedRect(W / 2 + offset - 20,n1y,42,11,2,2,"F");
        doc.setFontSize(8);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...WHITE);
        doc.text("Filleul N1",W / 2 + offset + 1,n1y + 7,{ align: "center"});
      });

      doc.setFontSize(8);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...GOLD);
      doc.text(t("Commissions N1 = TAUX PLEIN"),W / 2,n1y + 18,{ align: "center"});

      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY);
      doc.text(t("(Les filleuls N1 ont leurs propres filleuls N2 qui vous rapportent des commissions)"),W / 2,n1y + 24,{ align: "center"});
      doc.text(t("(Les filleuls N2 ont leurs propres filleuls N3 qui vous rapportent des commissions)"),W / 2,n1y + 30,{ align: "center"});

      py = n1y + 40;

      // Tableau des taux
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Branche","Taux N1 (Vos ventes)","Taux N2 (Ventes de vos filleuls)","Taux N3 (Filleuls de filleuls)"]],
        body: [
          ["IBIG SOFT (mensuel)","20%","10%","5%"],
          ["IBIG SOFT (annuel)","20%","8%","3%"],
          ["IBIG EDUFORM","10%","5%","2%"],
          ["IBIG IMMOTRUST","5%","2, 5%","1%"],
          ["IBIG MARKET","8%","4%","2%"],
          ["INTERMARK BUSINESS","8%","4%","2%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3,halign: "center"},
        columnStyles: { 0: { halign: "left"} },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 8;

      py = subTitle("Statuts et bonus de commission",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Statut","Condition d'obtention","Bonus commissions"]],
        body: [
          ["STARTER","Inscription validée","Taux de base"],
          ["SILVER","500 000 FCFA de CA cumulé","+1% sur toutes les commissions"],
          ["GOLD","2 000 000 FCFA de CA cumulé","+2% sur toutes les commissions"],
          ["MASTER","5 000 000 FCFA de CA cumulé","+3% sur toutes les commissions"],
          ["ELITE","15 000 000 FCFA de CA cumulé","+5% sur toutes les commissions"],
        ],
        headStyles: { fillColor: GOLD,textColor: DARK,fontStyle: "bold",fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 8;

      py = infoBox("Pour les abonnements MENSUELS IBIG SOFT, les commissions sont versées sur 4 mois consécutifs : Mois 1 (taux plein) → Mois 2 (75%) → Mois 3 (50%) → Mois 4 (25%). C'est conçu pour récompenser les partenaires qui fidélisent leurs clients sur la durée.",py,[255,251,235]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 7 — KYC ET LIENS
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(7,12);
      footer();

      py = 22;
      py = sectionTitle("6. Vérification KYC — Activation des paiements",py);
      py += 4;

      py = body("La vérification KYC (Know Your Customer) est obligatoire pour percevoir vos commissions. Sans KYC validé, vos commissions sont calculées et conservées mais non versées.",py);
      py += 5;

      py = subTitle("Étapes de vérification",py);
      const kyc = [
        ["Accéder","Dans votre espace partenaire, cliquez sur « Vérification » dans le menu gauche."],
        ["Choisir votre profil","Particulier ou Entreprise/Organisation — le formulaire s'adapte automatiquement."],
        ["Remplir le formulaire","Particulier : Nom état civil, pièce d'identité, profession, contacts, CV. | Entreprise : Raison sociale, RCCM, NIF, représentant légal, adresse siège."],
        ["Coordonnées de paiement","Indiquez comment vous souhaitez recevoir vos commissions : Orange Money, Wave, MTN MoMo, virement bancaire, PayPal ou Western Union."],
        ["Soumettre","Cliquez sur « Soumettre mon dossier ». L'équipe IBIG examine votre dossier sous 24-48h."],
        ["Confirmation","Vous recevez une notification et un email dès que votre dossier est approuvé. Vos commissions en attente sont débloquées."],
      ];

      kyc.forEach(([title,desc]) => {
        doc.setFillColor(...BLUE);
        doc.roundedRect(14,py - 3,W - 28,16,2,2,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...GOLD);
        doc.text(title,19,py + 4);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...WHITE);
        const lines = doc.splitTextToSize(desc,W - 38);
        doc.text(lines,19,py + 10);
        py += lines.length * 5 + 12;
      });

      py += 5;
      py = sectionTitle("7. Liens d'affiliation et QR codes",py);
      py += 4;

      py = body("Chaque partenaire dispose de liens d'affiliation uniques pour chaque produit qu'il activé. Ces liens contiennent votre code affilié et permettent le tracking automatique de vos ventes.",py);
      py += 5;

      py = subTitle("Comment obtenir vos liens",py);
      py = bullet("Rendez-vous dans « Mes Liens » depuis votre espace partenaire.",py);
      py = bullet("Activéz les produits que vous souhaitez promouvoir (cliquez sur « Activér »).",py);
      py = bullet("Copiez votre lien unique (ex : ibigpartners.com/p/AFF-DUPONT-042)",py);
      py = bullet("Téléchargez votre QR code personnalisé pour vos supports imprimés.",py);
      py = bullet("Partagez par WhatsApp, réseaux sociaux, email, SMS ou en personne.",py);
      py += 5;

      py = subTitle("Tracking et cookie d'affiliation",py);
      py = body("Lorsqu'un prospect clique sur votre lien, un cookie est déposé sur son navigateur pendant 90 jours. Si ce prospect s'inscrit ou achète pendant cette période — même s'il ne clique plus sur votre lien — la vente vous est automatiquement attribuée.",py);

      // ═══════════════════════════════════════════════════════════
      // PAGE 8 — VENTES ET COMMISSIONS SUIVI
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(8,12);
      footer();

      py = 22;
      py = sectionTitle("8. Suivi des ventes et commissions",py);
      py += 4;

      py = subTitle("Cycle de vie d'une vente",py);
      const cycle = [
        ["EN ATTENTE","Le client a initié le paiement. Confirmation en cours.",[245,158,11]],
        ["CONFIRMÉE","Paiement reçu et validé. Les commissions sont générées.",[16,185,129]],
        ["ANNULÉE","Paiement échoué ou remboursé. Aucune commission.",[239,68,68]],
      ];
      let cx = 14;
      cycle.forEach(([status,desc,color]) => {
        doc.setFillColor(...(color as [number,number,number]));
        doc.roundedRect(cx,py,55,20,2,2,"F");
        doc.setFontSize(8.5);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...WHITE);
        doc.text(status as string,cx + 27,py + 8,{ align: "center"});
        doc.setFont("helvetica","normal");
        doc.setFontSize(7.5);
        const lines = doc.splitTextToSize(desc as string,50);
        doc.text(lines,cx + 27,py + 14,{ align: "center"});
        if (cx < 100) {
          doc.setDrawColor(...GRAY);
          doc.setLineWidth(0.5);
          doc.line(cx + 55,py + 10,cx + 60,py + 10);
          doc.line(cx + 57,py + 8,cx + 60,py + 10);
          doc.line(cx + 57,py + 12,cx + 60,py + 10);
        }
        cx += 62;
      });
      py += 30;

      py = subTitle("Statuts des commissions",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Statut","Signification","Action requise"]],
        body: [
          ["EN ATTENTE","Vente confirmée, commission calculée, en attente de validation admin","Aucune — processus automatique"],
          ["VALIDÉE","Commission approuvée par l'équipe IBIG — prête à être versée","Attendre le virement"],
          ["PAYÉE","Commission virée sur votre compte de paiement","Vérifier votre réception"],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 8;

      py = subTitle("Méthodes de paiement disponibles",py);
      const payments = [
        ["Orange Money","Virement mobile instantané (Côte d'Ivoire)"],
        ["Wave","Paiement mobile Wave (Côte d'Ivoire, Sénégal)"],
        ["MTN MoMo","MTN Mobile Money (CI, Ghana, Cameroun...)"],
        ["Moov Money / Airtel Money","Mobile money Moov et Airtel"],
        ["M-Pesa","Mobile money (Kenya, Tanzanie, RDC...)"],
        ["CinetPay","Agrégateur panafricain"],
        ["Virement bancaire (IBAN/SWIFT)","Transfert bancaire international"],
        ["Western Union / MoneyGram","Transfert physique international"],
        ["Wise / WorldRemit / Remitly","Transfert en ligne international"],
        ["Juba Express / RIA Money Transfer","Transfert de fonds panafricain"],
      ];
      let col1y = py,col2y = py;
      payments.forEach(([method,desc],i) => {
        const ycur = i < 5 ? col1y : col2y;
        const xcur = i < 5 ? 14 : W / 2 + 3;
        doc.setFillColor(...GOLD);
        doc.circle(xcur + 2,ycur - 1.5,1,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...DARK);
        doc.text(method,xcur + 5,ycur);
        doc.setFont("helvetica","normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(desc,xcur + 5,ycur + 5);
        if (i < 5) col1y += 13; else col2y += 13;
      });
      py = Math.max(col1y,col2y) + 5;

      py = infoBox("Seuil minimum de versement : 5 000 FCFA. Les commissions inférieures à ce seuil s'accumulent jusqu'à atteindre le minimum requis. Les frais de transfert international sont déduits du montant versé.",py,[255,251,235]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 9 — RÉSEAU + ACADÉMIE
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(9,12);
      footer();

      py = 22;
      py = sectionTitle("9. Réseau et parrainage",py);
      py += 4;

      py = body("La section « Mon Réseau » vous permet de visualiser et gérer votre arbre de partenaires sur 3 niveaux. C'est votre moteur de revenus passifs.",py);
      py += 5;

      py = subTitle("Comment recruter un partenaire",py);
      py = bullet("Partagez votre code affilié ou votre lien de parrainage (ibigpartners.com/rejoindre?ref=AFF-XXXX-000).",py);
      py = bullet("Votre filleul s'inscrit en utilisant votre code dans le champ « Code parrain ».",py);
      py = bullet("Son compte est lié au vôtre automatiquement — il apparaît dans votre réseau N1.",py);
      py = bullet("Dès qu'il fait une vente, vous percevez automatiquement votre commission N2.",py);
      py = bullet("Si ses filleuls font des ventes, vous percevez votre commission N3.",py);
      py += 5;

      py = subTitle("Outils de gestion du réseau",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Fonctionnalité","Description"]],
        body: [
          ["Vue arbre","Visualisation hiérarchique de votre réseau jusqu'à 3 niveaux"],
          ["Performances filleuls","CA généré, nombre de ventes et statut de chaque filleul"],
          ["Prospects","Suivi de vos contacts potentiels : Contacté → Démo → Converti"],
          ["Opportunités","Gestion des opportunités commerciales importantes avec valeur estimée"],
          ["Classement","Votre position parmi les meilleurs partenaires du mois"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 10;

      py = sectionTitle("10. Académie IBIG — Formation",py);
      py += 4;

      py = body("L'Académie IBIG est votre espace d'apprentissage intégré. Elle contient des modules de formation conçus pour vous aider à mieux vendre les produits IBIG et à développer votre réseau.",py);
      py += 5;

      py = subTitle("Types de contenus disponibles",py);
      const academy = [
        ["Articles","Guides détaillés sur les produits, techniques de vente, stratégies de recrutement."],
        ["Vidéos","Démonstrations produits, témoignages de partenaires, formations en ligne."],
        ["Quiz","Évaluations interactivés pour valider vos connaissances et débloquer des badges."],
        ["Assistant IA","Posez toutes vos questions sur les produits IBIG, les commissions ou les techniques de vente — réponse instantanée 24h/24."],
        ["Coach IA IBIG","Assistant personnel intelligent formé spécifiquement sur les valeurs, produits et processus d'IBIG PARTNERS."],
      ];
      academy.forEach(([icon,desc]) => {
        if (py > 265) { newPage(); header(9,12); footer(); py = 22; }
        doc.setFillColor(240,245,255);
        doc.roundedRect(14,py - 3,W - 28,13,2,2,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text(icon as string,18,py + 4);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(desc as string,W - 46);
        doc.text(lines,30,py + 4);
        py += 17;
      });

      // ═══════════════════════════════════════════════════════════
      // PAGE 10 — ESPACE SUPERADMIN
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(10,12);
      footer();

      py = 22;
      py = sectionTitle("11. Espace SUPERADMIN — Administration de la plateformé",py);
      py += 4;

      py = infoBox("L'espace SUPERADMIN est réservé exclusivement à l'équipe IBIG SARL. Il permet la gestion complète de la plateformé : partenaires, ventes, commissions, catalogue, contenu et paramètrès.",py,[255,243,205]);
      py += 3;

      py = subTitle("Modules d'administration disponibles",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Module","Fonctionnalités clés"]],
        body: [
          ["Tableau de bord","KPIs temps réel, activité récente, alertes, graphiques CA & commissions"],
          ["Partenaires","Liste complète, validation/rejet, suspension, promotion de grade"],
          ["Vérifications KYC","Examen des dossiers, validation avec notification automatique, rejet avec motif"],
          ["Partenaires institutionnels","Gestion des partenaires publics affichés sur la page d'accueil"],
          ["Ventes","Historique global, confirmation/annulation, détail client"],
          ["Commissions","Validation en masse, suivi par partenaire, export"],
          ["Paiements","Gestion des virements, marquage 'Payé', référence de transaction"],
          ["Branches & Produits","Création/modification des branches et produits du catalogue"],
          ["Académie IBIG","Gestion des modules de formation, contenus, badges"],
          ["Opportunités","Suivi des grandes opportunités commerciales du réseau"],
          ["Communication","Messagerie, annonces globales, tickets support"],
          ["Journal d'audit","Traçabilité de toutes les actions administratives"],
          ["Paramètrès","Configuration globale : seuils, délais, coordonnées IBIG"],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2.5 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 10;

      py = subTitle("Processus de validation KYC (Admin)",py);
      py = bullet("Un nouveau partenaire s'inscrit → dossier KYC créé automatiquement avec statut « En attente ».",py);
      py = bullet("L'admin accède à /admin/vérifications et clique sur « Examiner » pour voir le dossier complet.",py);
      py = bullet("Après vérification des informations : cliquer « Valider » (activé le compte) ou « Rejeter » (avec motif).",py);
      py = bullet("Le partenaire reçoit automatiquement une notification et un email de confirmation/rejet.",py);
      py = bullet("Un partenaire rejeté peut corriger son dossier et le soumettre à nouveau depuis son espace.",py);

      // ═══════════════════════════════════════════════════════════
      // PAGE 11 — BADGES + FAQ
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(11,12);
      footer();

      py = 22;
      py = sectionTitle("Badges et récompenses",py);
      py += 4;

      py = body("Les badges sont des récompenses automatiquement attribuées lorsque vous atteignez certains jalons. Ils valorisent votre progression et sont visibles sur votre profil.",py);
      py += 5;

      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Badge","Condition d'obtention"]],
        body: [
          ["Première vente","Réaliser votre toute première vente confirmée"],
          ["Vendeur confirmé","Atteindre 10 ventes confirmées"],
          ["Champion des ventes","Atteindre 50 ventes confirmées"],
          ["Centurion","Atteindre 100 ventes confirmées"],
          ["Recruteur","Parrainer votre 1er filleul"],
          ["‍‍ Bâtisseur d'équipe","Atteindre 10 filleuls directs"],
          ["Ambassadeur Silver","Accéder au statut SILVER"],
          ["Ambassadeur Gold","Accéder au statut GOLD"],
          ["Master Partner","Accéder au statut MASTER"],
          ["Elite Représentant","Accéder au statut ELITE — le sommet"],
        ],
        headStyles: { fillColor: GOLD,textColor: DARK,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 10;

      py = sectionTitle("12. Support, contact et FAQ",py);
      py += 5;

      py = subTitle("Nous contacter",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Canal","Coordonnées","Usage"]],
        body: [
          ["Email général","contact@ibigpartners.com","Informations, partenariats"],
          ["Email support","support@ibigpartners.com","Problèmes techniques, demandes"],
          ["WhatsApp","+225 07 78 88 25 92","Support rapide, questions urgentes"],
          ["Téléphone","+225 27 22 27 60 14","Appels professionnels"],
          ["Site officiel","intermark-business.com","Groupe IBIG SARL"],
          ["Plateformé","ibigpartners.com","Espace partenaire"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 10;

      py = subTitle("Questions fréquentes (FAQ)",py);
      const faq = [
        ["L'inscription est-elle payante ?","Non. L'inscription sur IBIG PARTNERS est 100% gratuité et sans investissement obligatoire."],
        ["Quand sont versées les commissions ?","Les commissions sont validées par l'équipe IBIG puis virées selon votre méthode de paiement configurée. Délai standard : 7 jours ouvrés après validation."],
        ["Puis-je m'inscrire depuis n'importe quel pays ?","Oui. IBIG PARTNERS est une plateformé panafricaine ouverte à tous les pays d'Afrique et à la diaspora mondiale."],
        ["Combien de filleuls puis-je recruter ?","Illimité. Vous pouvez recruter autant de partenaires que vous le souhaitez sur vos 3 niveaux."],
        ["Que se passe-t-il si je ne valide pas mon KYC ?","Vos commissions sont calculées et conservées mais non versées. Elles seront débloquées dès la validation de votre KYC."],
        ["Comment signaler un problème technique ?","Utilisez la section « Support » dans votre espace (tickets), envoyez un email à support@ibigpartners.com ou contactez-nous sur WhatsApp."],
      ];
      faq.forEach(([q,a]) => {
        if (py > 255) { newPage(); header(11,12); footer(); py = 22; }
        doc.setFillColor(239,246,255);
        doc.roundedRect(14,py,W - 28,4,1,1,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text("Q :"+ q,17,py + 3);
        py += 8;
        doc.setFont("helvetica","normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize("R :"+ a,W - 32);
        doc.text(lines,17,py);
        py += lines.length * 5 + 6;
      });

      // ═══════════════════════════════════════════════════════════
      // PAGE 12 — CONCLUSION
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(12,12);
      footer();

      // Fond premium
      doc.setFillColor(...DARK);
      doc.rect(0,12,W,H - 22,"F");

      doc.setFillColor(...BLUE);
      doc.roundedRect(20,50,W - 40,180,6,6,"F");

      doc.setFontSize(22);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...WHITE);
      doc.text(t("Bienvenue dans la famille"),W / 2,80,{ align: "center"});
      doc.setTextColor(...GOLD);
      doc.text("IBIG PARTNERS",W / 2,96,{ align: "center"});

      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.3);
      doc.line(50,103,W - 50,103);

      doc.setFontSize(10);
      doc.setFont("helvetica","normal");
      doc.setTextColor(200,220,255);
      const closing = t("Vous faites maintenant partie du programme d'affiliation panafricain le plus structuré du groupe IBIG SARL. Chaque vente que vous réalisez, chaque partenaire que vous recrutez construit votre revenu durable et contribue au développement économique de l'Afrique.");
      const closingLines = doc.splitTextToSize(closing,W - 60);
      doc.text(closingLines,W / 2,115,{ align: "center"});

      doc.setFontSize(11);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...WHITE);
      doc.text(t("Votre succès est notre succès."),W / 2,150,{ align: "center"});

      doc.setFontSize(9);
      doc.setFont("helvetica","normal");
      doc.setTextColor(...GOLD);
      doc.text("ibigpartners.com",W / 2,165,{ align: "center"});
      doc.text("contact@ibigpartners.com",W / 2,173,{ align: "center"});
      doc.text("+225 27 22 27 60 14 . +225 07 78 88 25 92",W / 2,181,{ align: "center"});

      doc.setFontSize(8);
      doc.setTextColor(150,170,210);
      doc.text("INTERMARK BUSINESS INTERNATIONAL GROUP SARL",W / 2,198,{ align: "center"});
      doc.text(t("Cocody Riviera Palmeraie - Abidjan, Côte d'Ivoire"),W / 2,205,{ align: "center"});

      // Watermark discret
      doc.setFontSize(7);
      doc.setTextColor(80,100,140);
      doc.text(t("Document confidentiel - Usage réservé aux administrateurs IBIG PARTNERS agréés"),W / 2,220,{ align: "center"});

      doc.save("IBIG_PARTNERS_Guide_Utilisateur_Officiel_2026.pdf");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF. Consultez la console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100">
        {/* Header premium */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-8 py-10 text-center">
          <p className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-2">IBIG SARL — Programme Officiel</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">IBIG PARTNERS</h1>
          <p className="text-yellow-400 font-bold text-lg mt-1">Guide Utilisateur Officiel</p>
          <p className="text-blue-200 text-sm mt-3">Version 1.0 — Juin 2026 · 12 pages · Format A4</p>
        </div>

        {/* Contenu */}
        <div className="bg-white px-8 py-6 space-y-5">
          <p className="text-slate-600 text-sm leading-relaxed">
            Ce guide couvre l'intégralité de la plateformé IBIG PARTNERS de A à Z : inscription, KYC, liens d'affiliation,commissions sur 3 niveaux,réseau,académie,espace admin et FAQ.
          </p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              "Présentation & Branches",
              "Inscription & Types de comptes",
              "Tableau de bord complet",
              "Commissions N1/N2/N3",
              "KYC & Activation paiements",
              "Liens & QR codes",
              "Suivi ventes & commissions",
              "Réseau & parrainage",
              "Académie & formations",
              "Espace SUPERADMIN",
              "Badges & récompenses",
              "Contact & FAQ",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-slate-700">{item}</div>
            ))}
          </div>

          <button
            onClick={generatePDF}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-base font-bold text-white hover:from-blue-700 hover:to-blue-900 disabled:opacity-60 transition-all shadow-lg"
          >
            {loading ? "Génération du PDF en cours…": "Télécharger le Guide PDF (Premium)"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Document officiel IBIG PARTNERS · INTERMARK BUSINESS INTERNATIONAL GROUP SARL<br />
            Cocody Riviera Palmeraie,Abidjan,Côte d'Ivoire
          </p>
        </div>
      </div>
    </div>
  );
}
