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
        doc.text(t("IBIG PARTNERS - Guide Utilisateur Officiel"),14,8);
        doc.text(`Page ${pageNum} / ${total}`,W - 14,8,{ align: "right"});
      }

      function footer() {
        doc.setFillColor(...DARK);
        doc.rect(0,H - 10,W,10,"F");
        doc.setFontSize(7);
        doc.setTextColor(...GOLD);
        doc.text(t("2026 IBIG SARL - INTERMARK BUSINESS INTERNATIONAL GROUP SARL - ibigpartners.com"),W / 2,H - 4,{ align: "center"});
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
      doc.text(t("Version 2.0 - Septembre 2026"),W / 2,175,{ align: "center"});

      // Bas de page couverture
      doc.setFontSize(8);
      doc.setTextColor(150,170,210);
      doc.text(t("CONFIDENTIEL - Usage interne et partenaires agréés"),W / 2,H - 20,{ align: "center"});
      doc.text("ibigpartners.com . contact@ibigpartners.com . +225 27 22 27 60 14",W / 2,H - 13,{ align: "center"});

      // ═══════════════════════════════════════════════════════════
      // PAGE 2 — TABLE DES MATIÈRES
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(2,14);
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
        ["1.", "Présentation d'IBIG PARTNERS", "3"],
        ["2.", "Inscription et types de comptes", "4"],
        ["3.", "Tableau de bord partenaire", "5"],
        ["4.", "Programme d'affiliation - Commissions sur 3 niveaux", "6"],
        ["5.", "Catalogue complet des produits par branche", "7"],
        ["6.", "Vérification KYC - Activation des paiements", "9"],
        ["7.", "Liens d'affiliation et QR codes", "9"],
        ["8.", "Suivi des ventes et commissions", "10"],
        ["9.", "Réseau et parrainage", "11"],
        ["10.", "Académie IBIG - Formation", "11"],
        ["11.", "Espace SUPERADMIN", "12"],
        ["12.", "Badges et récompenses", "13"],
        ["13.", "Support, contact et FAQ", "13"],
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
      header(3,14);
      footer();

      let py = 22;
      py = sectionTitle("1. Présentation d'IBIG PARTNERS",py);
      py += 4;

      py = body("IBIG PARTNERS est la plateforme officielle d'affiliation multi-niveaux d'INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL). Elle permet à toute personne ou organisation de devenir Partenaire Affilié et de générer des revenus en recommandant les produits et services du groupe IBIG.",py);
      py += 4;

      py = subTitle("Vision & Mission",py);
      py = body("Notre vision : créer le plus grand réseau de partenaires commerciaux panafricains, capables de distribuer des solutions de qualité mondiale adaptées aux réalités africaines.",py);
      py += 3;
      py = body("Notre mission : offrir à chaque partenaire les outils, la formation et les commissions attractives pour bâtir un revenu durable et construire son propre réseau.",py);
      py += 5;

      py = subTitle("Les 11 Branches du Groupe IBIG SARL",py);

      const branches = [
        ["IBIG SOFT","14 logiciels/ERP SaaS (Scolaby, Fleet 360, GESCOMXEL, Zelivry, Lokativo, StockFlow, CONSTRUIRO, SANTAREX, AGRIFRIK, GESTMONEY, ANOUANZÊ, FactPro, SECRETIS, DocPro) — ibigsoft.com","Commission : 20% N1 - 10% N2 - 5% N3 (dégressive sur 4 mois)"],
        ["IBIG EDUFORM","Formations professionnelles certifiantes (comptabilité, RH, QHSE, Sage, SAP, IA...) — ibig-eduform.com","Commission : 10% N1 - 5% N2 - 2% N3 par inscription"],
        ["IBIG IMMO TRUST","Immobilier sécurisé, BTP, gestion locative, construction clé en main, diaspora — ibigimmotrust.com","Commission : 10% N1 - 5% N2 - 2,5% N3 (modèle spécial pour la Gestion Locative)"],
        ["IBIG MARKET","Vente physique et e-commerce : IT, mobilier, fournitures, logistique — ibig-market.com","Commission : 8% N1 - 4% N2 - 2% N3 par vente"],
        ["IBIG DIGITAL","Création digitale : site vitrine, e-commerce, refonte web, identité visuelle, community management, production photo/vidéo, campagnes (Meta/Google/TikTok Ads), email marketing, SEO, formation réseaux sociaux — intermark-business.com/digital","Commission : 10% N1 - 5% N2 - 2% N3"],
        ["IBIG DIGITAL KITS","Transformation numérique : intégration ERP (SAP/SAGE/Odoo/IBIG), développement web sur mesure, application mobile iOS & Android, chatbot IA, GED, kit marketing digital, formation ERP, cybersécurité & audit SI — kits.intermark-business.com","Commission : 10% N1 - 5% N2 - 2% N3"],
        ["IBIG CONSEIL+","Structuration, comptabilité, juridique, conseil stratégique, création d'entreprise — intermark-business.com/conseil","Commission : 10% N1 - 5% N2 - 2% N3 sur la mission"],
        ["IBIG FINANCEMENT","Crédit PME, assurances (auto, santé, vie, RC pro, transport), épargne retraite, leasing, financement agricole, gestion de patrimoine — 20 offres","Commission : 5% N1 - 2,5% N2 - 1% N3"],
        ["IBIG EMPLOI & TALENTS","Recrutement CDI/CDD, placement cadres, audit RH, coaching dirigeants, outplacement, externalisation RH, GPEC, marque employeur — 20 offres","Commission : 10% N1 - 5% N2 - 2% N3"],
        ["IBIG PARTNERS","Programme d'affiliation multi-niveaux, représentation commerciale, B2B — ibigpartners.com","Commission : Variable selon branche & niveau"],
        ["IBIG MULTISERVICES","Événementiel, déménagement, maintenance, accueil VIP, logistique, gardiennage, transport VIP et 55 services — intermark-business.com/multiservices","Commission : 10% N1 - 5% N2 - 2% N3"],
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

      py = infoBox("IBIG PARTNERS est 100% gratuit - aucun investissement requis. L'inscription est ouverte à tous : particuliers, entreprises, ONG, associations. Vos commissions sont calculées automatiquement et versées sur votre méthode de paiement préférée.",py,[239,246,255]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 4 — INSCRIPTION
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(4,14);
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
        "Cliquez sur « Créer mon compte partenaire » - votre code d'affiliation est généré automatiquement.",
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

      py = infoBox("Votre code d'affiliation unique (ex : AFF-DUPONT-042) est votre identité sur la plateforme. Partagez-le pour parrainer de nouveaux partenaires et construire votre réseau.",py,[240,253,244]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 5 — TABLEAU DE BORD
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(5,14);
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
        ["Retrait self-service","Demandez votre retrait directement depuis votre espace, a tout moment, sans passer par le support. Disponible apres validation KYC. Virement sous 48h."],
        ["Kit Marketing","Argumentaires personnalises avec votre nom et code, visuels prets a partager, scripts WhatsApp, videos de presentation par branche."],
        ["Mon Réseau","Visualisation de votre arbre de parrainage sur 3 niveaux avec les performances de chaque filleul."],
        ["Prospects","Gestion de vos prospects : ajout, suivi du statut (Contacté, Démo, Converti, Perdu)."],
        ["Badges","Collection de vos badges gagnés : 1ère vente, 10 ventes, statut Gold, équipe de 10..."],
        ["Académie","Modules de formation IBIG : articles, vidéos, quiz et assistant IA pour progresser."],
        ["Coach IA","Assistant intelligent formé sur les produits IBIG pour répondre à toutes vos questions."],
        ["Communication","Chat avec l'équipe IBIG et les autres partenaires, dès le 1er filleul parrainé."],
        ["Paramètres","Modification du profil, méthode de paiement, mot de passe, préférences."],
        ["Vérification KYC","Soumission de votre dossier de vérification pour activer les paiements de commissions."],
      ];

      sections.forEach(([name,desc]) => {
        if (py > 260) { newPage(); header(5,14); footer(); py = 22; }
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
      header(6,14);
      footer();

      py = 22;
      py = sectionTitle("4. Programme d'affiliation - Commissions sur 3 niveaux",py);
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
          ["IBIG IMMO TRUST","10%","5%","2,5%"],
          ["IBIG MARKET","8%","4%","2%"],
          ["IBIG DIGITAL","10%","5%","2%"],
          ["IBIG DIGITAL KITS","10%","5%","2%"],
          ["IBIG CONSEIL+","10%","5%","2%"],
          ["IBIG FINANCEMENT","5%","2,5%","1%"],
          ["IBIG EMPLOI & TALENTS","10%","5%","2%"],
          ["IBIG MULTISERVICES","10%","5%","2%"],
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
          ["SILVER","10 ventes confirmées","+2% sur toutes les commissions"],
          ["GOLD","25 ventes + 10 filleuls directs + 20 équipe active","+5% sur toutes les commissions"],
          ["MASTER","50 ventes + 25 filleuls directs + 50 équipe active","+8% sur toutes les commissions"],
          ["ELITE","100 ventes + 50 filleuls directs + 100 équipe active","+12% sur toutes les commissions"],
        ],
        headStyles: { fillColor: GOLD,textColor: DARK,fontStyle: "bold",fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 3 },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 8;

      py = infoBox("Pour les abonnements MENSUELS IBIG SOFT, les commissions sont versées sur 4 mois consécutifs : Mois 1 (taux plein) -> Mois 2 (75%) -> Mois 3 (50%) -> Mois 4 (25%). C'est conçu pour récompenser les partenaires qui fidélisent leurs clients sur la durée.",py,[255,251,235]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 7-8 — CATALOGUE COMPLET DES PRODUITS
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(7,14);
      footer();

      py = 22;
      py = sectionTitle("5. Catalogue Complet des Produits par Branche",py);
      py = body("Référence complète de tous les produits et services que vous pouvez promouvoir en tant que partenaire IBIG. Les tarifs sont indicatifs. Les commissions s'appliquent sur le montant facturé au client.",py);
      py += 4;

      // ── IBIG SOFT ──
      py = subTitle("IBIG SOFT — 14 Logiciels SaaS de Gestion (110+ formules)",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Logiciel","Cible","Starter/mois","Pro/mois","Annuel (dès)","N1"]],
        body: [
          ["Scolaby","Établissements scolaires","10 000","20 000","99 600 FCFA","20%"],
          ["IBIG Fleet 360","Flottes & transport","19 900","35 000","199 000 FCFA","20%"],
          ["Lokativo","Agences immo / bailleurs","9 900","19 900","99 900 FCFA","20%"],
          ["GESCOMXEL","PME / commerçants","5 000","12 000","50 000 FCFA","20%"],
          ["Zelivry","Sociétés de livraison","4 900","9 900","49 000 FCFA","20%"],
          ["STOCKFLOW ERP","Industries / grandes surfaces","5 000","12 000","50 000 FCFA","20%"],
          ["CONSTRUIRO ERP","BTP / construction","15 000","28 000","150 000 FCFA","20%"],
          ["SANTAREX ERP","Cliniques / pharmacies","12 000","22 000","120 000 FCFA","20%"],
          ["AGRIFRIK","Exploitations agricoles","6 500","13 000","65 000 FCFA","20%"],
          ["GESTMONEY","Agents Mobile Money","9 900","18 000","99 000 FCFA","20%"],
          ["ANOUANZÊ ERP","ONG / associations","12 900","22 000","129 000 FCFA","20%"],
          ["IBIG FactPro","TPE / indépendants","4 900","9 000","49 000 FCFA","20%"],
          ["SECRETIS ERP","Secrétariats / bureaux","4 900","9 000","49 000 FCFA","20%"],
          ["IBIG DocPro","Génération documents","Dès 100 F/doc","-","À l'usage","20%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7 },
        bodyStyles: { fontSize: 7,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 5: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 3;

      // ── IBIG EDUFORM ──
      py = subTitle("IBIG EDUFORM — Formations Certifiantes",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Formation","Durée","Prix","N1"]],
        body: [
          ["Comptabilité et Finance 4 en 1","3 mois","400 000 FCFA","10%"],
          ["DAF Dirigeant","3 mois","425 000 FCFA","10%"],
          ["Expert RH 3 en 1","3 mois","450 000 FCFA","10%"],
          ["QHSE Expert","2 mois","350 000 FCFA","10%"],
          ["Logistique et Supply Chain","3 mois","450 000 FCFA","10%"],
          ["Sage 100 Comptabilité","1 mois","22 500 FCFA","10%"],
          ["Power BI Avancé","3 semaines","25 000 FCFA","10%"],
          ["SAP FI (Finance)","6 semaines","35 000 FCFA","10%"],
          ["Intelligence Artificielle Pro","4 semaines","30 000 FCFA","10%"],
          ["Canva Pro Design","2 semaines","15 000 FCFA","10%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 3: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 5;

      // ── PAGE 8 DU GUIDE ──
      newPage();
      header(8,14);
      footer();
      py = 22;

      // ── IBIG IMMO TRUST ──
      py = subTitle("IBIG IMMO TRUST — N1=10% · N2=5% · N3=2,5%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Base de calcul","Valeur exemple","N1","N2","N3"]],
        body: [
          ["Achat / Vente immobilière","Commission agence","1 000 000 FCFA","10%","5%","2,5%"],
          ["Gestion Locative Garantie","1 mois d'agence","150 000 FCFA","10%","5%","2,5%"],
          ["Construction Clé en Main","Budget construction","50 000 000 FCFA","10%","5%","2,5%"],
          ["Rénovation & Réhabilitation","Budget travaux","5 000 000 FCFA","10%","5%","2,5%"],
          ["Service Diaspora","Valeur du projet","Sur devis","10%","5%","2,5%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2.5 },
        columnStyles: {
          3: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" },
          4: { textColor: [0,100,200] as [number,number,number],halign: "center" },
          5: { textColor: GRAY,halign: "center" },
        },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG MARKET ──
      py = subTitle("IBIG MARKET — N1=8% · N2=4% · N3=2%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Catégorie","Exemples de produits","Gamme de prix","N1"]],
        body: [
          ["Matériel informatique","Ordinateurs, imprimantes, réseaux, accessoires","50 000 - 2 000 000 FCFA","8%"],
          ["Mobilier professionnel","Bureaux, chaises ergonomiques, cloisons","25 000 - 5 000 000 FCFA","8%"],
          ["Fournitures de bureau","Papeterie, consommables, archivage","5 000 - 500 000 FCFA","8%"],
          ["Matériel BTP","Outils, matériaux, équipements chantier","10 000 - 10 000 000 FCFA","8%"],
          ["Équipement multimédia","Écrans, projecteurs, systèmes son","100 000 - 3 000 000 FCFA","8%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2.5 },
        columnStyles: { 3: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG DIGITAL ──
      py = subTitle("IBIG DIGITAL — N1=10% · N2=5% · N3=2%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Tarif indicatif","N1"]],
        body: [
          ["Site Vitrine Professionnel","300 000 - 800 000 FCFA","10%"],
          ["Site E-commerce","500 000 - 1 500 000 FCFA","10%"],
          ["Refonte de Site Web","200 000 - 600 000 FCFA","10%"],
          ["Identité Visuelle & Logo","100 000 - 400 000 FCFA","10%"],
          ["Production Photo & Vidéo Pro","150 000 - 800 000 FCFA","10%"],
          ["Community Management","50 000 - 150 000 FCFA/mois","10%"],
          ["Campagne Publicitaire (Meta/Google/TikTok Ads)","150 000 - 500 000 FCFA","10%"],
          ["Email Marketing & Automation","75 000 - 200 000 FCFA/mois","10%"],
          ["Stratégie Contenu & SEO","100 000 - 300 000 FCFA/mois","10%"],
          ["Formation Réseaux Sociaux","75 000 - 200 000 FCFA","10%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 2: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG DIGITAL KITS ──
      py = subTitle("IBIG DIGITAL KITS — N1=10% · N2=5% · N3=2%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Tarif indicatif","N1"]],
        body: [
          ["Intégration ERP (SAP/SAGE/Odoo/IBIG SOFT)","800 000 - 10 000 000 FCFA","10%"],
          ["Développement Web Sur Mesure","500 000 - 3 000 000 FCFA","10%"],
          ["Application Mobile iOS & Android","1 000 000 - 5 000 000 FCFA","10%"],
          ["Chatbot & Intelligence Artificielle","300 000 - 1 000 000 FCFA","10%"],
          ["GED & Digitalisation des Processus","500 000 - 3 000 000 FCFA","10%"],
          ["Kit Marketing Digital (SEO + Analytics + Emailing)","100 000 - 300 000 FCFA/mois","10%"],
          ["Formation ERP & Outils Numériques","50 000 - 300 000 FCFA","10%"],
          ["Cybersécurité & Audit Système d'Information","500 000 - 2 000 000 FCFA","10%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 2: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG CONSEIL+ ──
      py = subTitle("IBIG CONSEIL+ — N1=10% · N2=5% · N3=2%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Tarif indicatif","N1"]],
        body: [
          ["Audit Organisationnel","500 000 - 2 000 000 FCFA","10%"],
          ["Conseil Stratégique","500 000 - 3 000 000 FCFA","10%"],
          ["Ingénierie Financière","1 000 000 - 5 000 000 FCFA","10%"],
          ["Création d'Entreprise (RCCM, NIF, statuts)","150 000 - 500 000 FCFA","10%"],
          ["Étude de Marché","300 000 - 1 500 000 FCFA","10%"],
          ["Conformité Juridique OHADA","500 000 - 3 000 000 FCFA","10%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 2: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG FINANCEMENT ──
      if (py > 240) { newPage(); header(8,14); footer(); py = 22; }
      py = subTitle("IBIG FINANCEMENT — N1=5% · N2=2,5% · N3=1%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Tarif indicatif","N1"]],
        body: [
          ["Microcrédit PME (500 000 à 5 000 000 FCFA)","Sur devis","5%"],
          ["Crédit de Trésorerie & Fonds de Roulement PME","Sur devis","5%"],
          ["Financement Équipement / Leasing","Sur devis","5%"],
          ["Financement Immobilier (Crédit hypothécaire)","Sur devis","5%"],
          ["Financement Agricole & Rural","Sur devis","5%"],
          ["Assurance Santé Collective","Dès 50 000 FCFA/mois","5%"],
          ["Assurance Vie & Prévoyance","Dès 25 000 FCFA/mois","5%"],
          ["Assurance Entreprise Multirisques","Dès 300 000 FCFA/an","5%"],
          ["Assurance Auto Flotte Professionnelle","Dès 150 000 FCFA/an/véhicule","5%"],
          ["Assurance RC Professionnelle & Décennale","Sur devis","5%"],
          ["Plan d'Épargne Retraite Individuel","Dès 25 000 FCFA/mois","5%"],
          ["Aide à la Levée de Fonds","Dès 400 000 FCFA","5%"],
          ["Conseil en Investissement & Gestion de Patrimoine","Sur devis","5%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 2: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG EMPLOI & TALENTS ──
      if (py > 240) { newPage(); header(8,14); footer(); py = 22; }
      py = subTitle("IBIG EMPLOI & TALENTS — N1=10% · N2=5% · N3=2%",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Tarif indicatif","N1"]],
        body: [
          ["Mission de Recrutement CDI","Dès 300 000 FCFA","10%"],
          ["Mission de Recrutement CDD / Intérim","Dès 150 000 FCFA","10%"],
          ["Placement de Profils Qualifiés / Cadres","Dès 200 000 FCFA","10%"],
          ["Externalisation RH Complète","Dès 200 000 FCFA/mois","10%"],
          ["Gestion du Personnel Externalisée","Dès 100 000 FCFA/mois","10%"],
          ["Portage Salarial","Sur devis","10%"],
          ["Audit RH & Diagnostic Organisationnel","Dès 200 000 FCFA","10%"],
          ["Executive Coaching & Coaching de Dirigeants","Dès 150 000 FCFA/mois","10%"],
          ["Assessment Center & Recrutement par Simulation","Dès 250 000 FCFA","10%"],
          ["Outplacement & Accompagnement au Départ","Dès 300 000 FCFA","10%"],
          ["GPEC & Gestion Prévisionnelle des Compétences","Dès 350 000 FCFA","10%"],
          ["Tests de Compétences & Évaluation","Dès 80 000 FCFA","10%"],
          ["Marque Employeur & Communication RH","Dès 200 000 FCFA","10%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 2: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;

      // ── IBIG MULTISERVICES ──
      if (py > 240) { newPage(); header(8,14); footer(); py = 22; }
      py = subTitle("IBIG MULTISERVICES — N1=10% · N2=5% · N3=2% (55 services)",py);
      // @ts-ignore
      autoTable(doc,{
        startY: py,
        head: [["Service","Tarif indicatif","N1"]],
        body: [
          ["Organisation Événementielle Corporate","Dès 300 000 FCFA","10%"],
          ["Organisation Événement Privé (Mariage, Gala)","Dès 150 000 FCFA","10%"],
          ["Déménagement Particuliers & Entreprises","Dès 80 000 FCFA","10%"],
          ["Nettoyage & Entretien de Locaux","Dès 40 000 FCFA/mois","10%"],
          ["Gardiennage & Sécurité","Dès 80 000 FCFA/mois","10%"],
          ["Accueil VIP & Conciergerie d'Entreprise","Dès 75 000 FCFA","10%"],
          ["Maintenance & Dépannage d'Urgence","Dès 25 000 FCFA","10%"],
          ["Chauffeur Privé & Transport VIP","Dès 30 000 FCFA/jour","10%"],
          ["Location Véhicules / Matériel Événementiel","Sur devis","10%"],
          ["Travaux de Rénovation & Construction","Sur devis","10%"],
          ["Et 45+ autres services (pressing, soins, livraison, secrétariat...)","Variable","10%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7.5 },
        bodyStyles: { fontSize: 7.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },
        styles: { cellPadding: 2 },
        columnStyles: { 2: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold",halign: "center" } },
      });
      // @ts-ignore
      py = (doc as any).lastAutoTable.finalY + 4;
      py = infoBox("Catalogue complet : 11 branches · 14 logiciels SaaS · 10 formations certifiantes · 5 services immobiliers · 5 catégories commerce · 10 services digitaux · 8 solutions numériques · 6 missions conseil · 20 offres financement & assurances · 20 offres emploi & RH · 55 multiservices = 330+ produits et formules disponibles à promouvoir.",py,[235,255,245]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 9 — KYC ET LIENS
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(9,14);
      footer();

      py = 22;
      py = sectionTitle("6. Vérification KYC - Activation des paiements",py);
      py += 4;

      py = body("La vérification KYC (Know Your Customer) est obligatoire pour percevoir vos commissions. Sans KYC validé, vos commissions sont calculées et conservées mais non versées.",py);
      py += 5;

      py = subTitle("Étapes de vérification",py);
      const kyc = [
        ["Accéder","Dans votre espace partenaire, cliquez sur « Vérification » dans le menu gauche."],
        ["Choisir votre profil","Particulier ou Entreprise/Organisation - le formulaire s'adapte automatiquement."],
        ["Remplir le formulaire","Particulier : Nom état civil, pièce d'identité, profession, contacts, CV. | Entreprise : Raison sociale, RCCM, NIF, représentant légal, adresse siège."],
        ["Coordonnées de paiement","Indiquez comment vous souhaitez recevoir vos commissions : Orange Money, Wave, MTN MoMo ou virement bancaire."],
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

      py = body("Chaque partenaire dispose de liens d'affiliation uniques pour chaque produit qu'il active. Ces liens contiennent votre code affilié et permettent le tracking automatique de vos ventes.",py);
      py += 5;

      py = subTitle("Comment obtenir vos liens",py);
      py = bullet("Rendez-vous dans « Mes Liens » depuis votre espace partenaire.",py);
      py = bullet("Activez les produits que vous souhaitez promouvoir (cliquez sur « Activer »).",py);
      py = bullet("Copiez votre lien unique (ex : ibigpartners.com/p/AFF-DUPONT-042)",py);
      py = bullet("Téléchargez votre QR code personnalisé pour vos supports imprimés.",py);
      py = bullet("Partagez par WhatsApp, réseaux sociaux, email, SMS ou en personne.",py);
      py += 5;

      py = subTitle("Tracking et cookie d'affiliation",py);
      py = body("Lorsqu'un prospect clique sur votre lien, un cookie est déposé sur son navigateur pendant 90 jours. Si ce prospect s'inscrit ou achète pendant cette période - même s'il ne clique plus sur votre lien - la vente vous est automatiquement attribuée.",py);

      // ═══════════════════════════════════════════════════════════
      // PAGE 8 — VENTES ET COMMISSIONS SUIVI
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(10,14);
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
          ["EN ATTENTE","Vente confirmée, commission calculée, en attente de validation admin","Aucune - processus automatique"],
          ["VALIDÉE","Commission approuvée par l'équipe IBIG - prête à être versée","Attendre le virement"],
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
        ["Orange Money","Virement mobile instantané"],
        ["Wave","Paiement mobile Wave"],
        ["MTN MoMo","MTN Mobile Money"],
        ["Virement bancaire","Transfert bancaire"],
      ];
      let col1y = py,col2y = py;
      payments.forEach(([method,desc],i) => {
        const ycur = i < 2 ? col1y : col2y;
        const xcur = i < 2 ? 14 : W / 2 + 3;
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
        if (i < 2) col1y += 13; else col2y += 13;
      });
      py = Math.max(col1y,col2y) + 5;

      py = infoBox("Seuil minimum de versement : 5 000 FCFA. Les commissions inférieures à ce seuil s'accumulent jusqu'à atteindre le minimum requis.",py,[255,251,235]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 9 — RÉSEAU + ACADÉMIE
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(11,14);
      footer();

      py = 22;
      py = sectionTitle("9. Réseau et parrainage",py);
      py += 4;

      py = body("La section « Mon Réseau » vous permet de visualiser et gérer votre arbre de partenaires sur 3 niveaux. C'est votre moteur de revenus passifs.",py);
      py += 5;

      py = subTitle("Comment recruter un partenaire",py);
      py = bullet("Partagez votre code affilié ou votre lien de parrainage (ibigpartners.com/rejoindre?ref=AFF-XXXX-000).",py);
      py = bullet("Votre filleul s'inscrit en utilisant votre code dans le champ « Code parrain ».",py);
      py = bullet("Son compte est lié au vôtre automatiquement - il apparaît dans votre réseau N1.",py);
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
          ["Prospects","Suivi de vos contacts potentiels : Contacté -> Démo -> Converti"],
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

      py = sectionTitle("10. Académie IBIG - Formation",py);
      py += 4;

      py = body("L'Académie IBIG est votre espace d'apprentissage intégré. Elle contient des modules de formation conçus pour vous aider à mieux vendre les produits IBIG et à développer votre réseau.",py);
      py += 5;

      py = subTitle("Types de contenus disponibles",py);
      const academy = [
        ["Articles","Guides détaillés sur les produits, techniques de vente, stratégies de recrutement."],
        ["Vidéos","Démonstrations produits, témoignages de partenaires, formations en ligne."],
        ["Audios","Capsules sonores, podcasts partenaires, interviews terrain - écoutable en déplacement."],
        ["Images & Infographies","Visuels pédagogiques, organigrammes commissions, fiches produit illustrées."],
        ["Quiz","Évaluations interactives pour valider vos connaissances et débloquer des badges."],
        ["Assistant IA","Posez toutes vos questions sur les produits IBIG, les commissions ou les techniques de vente - réponse instantanée 24h/24."],
        ["Coach IA IBIG","Assistant personnel intelligent formé spécifiquement sur les valeurs, produits et processus d'IBIG PARTNERS."],
      ];
      academy.forEach(([icon,desc]) => {
        if (py > 265) { newPage(); header(11,14); footer(); py = 22; }
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
      header(12,14);
      footer();

      py = 22;
      py = sectionTitle("11. Espace SUPERADMIN - Administration de la plateforme",py);
      py += 4;

      py = infoBox("L'espace SUPERADMIN est réservé exclusivement à l'équipe IBIG SARL. Il permet la gestion complète de la plateforme : partenaires, ventes, commissions, catalogue, contenu et paramètres.",py,[255,243,205]);
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
          ["Paiements","Gestion des virements, retrait self-service (validation demandes partenaires), marquage Payé, référence transaction"],
          ["Branches & Produits","Création/modification des branches et produits du catalogue"],
          ["Académie IBIG","Gestion des modules de formation, contenus, badges"],
          ["Opportunités","Suivi des grandes opportunités commerciales du réseau"],
          ["Communication","Messagerie, annonces globales, tickets support"],
          ["Journal d'audit","Traçabilité de toutes les actions administratives"],
          ["Paramètres","Configuration globale : seuils, délais, coordonnées IBIG"],
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
      py = bullet("Un nouveau partenaire s'inscrit -> dossier KYC créé automatiquement avec statut « En attente ».",py);
      py = bullet("L'admin accède à /admin/vérifications et clique sur « Examiner » pour voir le dossier complet.",py);
      py = bullet("Après vérification des informations : cliquer « Valider » (active le compte) ou « Rejeter » (avec motif).",py);
      py = bullet("Le partenaire reçoit automatiquement une notification et un email de confirmation/rejet.",py);
      py = bullet("Un partenaire rejeté peut corriger son dossier et le soumettre à nouveau depuis son espace.",py);

      // ═══════════════════════════════════════════════════════════
      // PAGE 11 — BADGES + FAQ
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(13,14);
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
          ["Bâtisseur d'équipe","Atteindre 10 filleuls directs"],
          ["Ambassadeur Silver","Accéder au statut SILVER"],
          ["Ambassadeur Gold","Accéder au statut GOLD"],
          ["Master Partner","Accéder au statut MASTER"],
          ["Elite Représentant","Accéder au statut ELITE - le sommet"],
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
          ["Plateforme","ibigpartners.com","Espace partenaire"],
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
        ["Par ou commencer quand on est nouveau partenaire ?","Plan d'action 7 jours : Jour 1 - KYC + parcourir le catalogue 330+ produits. Jour 2 - Activer vos liens d'affiliation. Jour 3 - Partager a 10 contacts de confiance. Jours 4-5 - Recruter votre 1er filleul. Jours 6-7 - Completer 3 modules de l'Academie IBIG."],
        ["L'inscription est-elle payante ?","Non. L'inscription sur IBIG PARTNERS est 100% gratuite et sans investissement obligatoire."],
        ["Quand sont versées les commissions ?","Les commissions sont validées par l'équipe IBIG puis virées selon votre méthode de paiement configurée. Délai standard : 7 jours ouvrés après validation."],
        ["Puis-je m'inscrire depuis n'importe quel pays ?","Oui. IBIG PARTNERS est une plateforme panafricaine ouverte à tous les pays d'Afrique et à la diaspora mondiale."],
        ["Combien de filleuls puis-je recruter ?","Illimité. Vous pouvez recruter autant de partenaires que vous le souhaitez sur vos 3 niveaux."],
        ["Que se passe-t-il si je ne valide pas mon KYC ?","Vos commissions sont calculées et conservées mais non versées. Elles seront débloquées dès la validation de votre KYC."],
        ["Comment signaler un problème technique ?","Utilisez la section « Support » dans votre espace (tickets), envoyez un email à support@ibigpartners.com ou contactez-nous sur WhatsApp."],
      ];
      faq.forEach(([q,a]) => {
        if (py > 255) { newPage(); header(13,14); footer(); py = 22; }
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
      header(14,14);
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

  const chapters = [
    { num: "01", title: "Présentation & Branches",       desc: "11 branches, vision, mission, engagement IBIG SARL",       icon: "🌍" },
    { num: "02", title: "Inscription & Types de comptes", desc: "Particulier, entreprise, ONG — processus étape par étape", icon: "✍️" },
    { num: "03", title: "Tableau de bord",                desc: "Vue d'ensemble, KPIs temps réel, alertes, navigation",     icon: "📊" },
    { num: "04", title: "Commissions N1/N2/N3",           desc: "Taux par branche, statuts, bonus, dégressivité SOFT",      icon: "💰" },
    { num: "05", title: "Catalogue des produits",          desc: "330+ produits : 14 ERP, 10 formations, immo, market, digital, kits, conseil, multiservices", icon: "📦" },
    { num: "06", title: "KYC & Activation paiements",     desc: "Vérification identité, étapes, délais, méthodes",          icon: "🔐" },
    { num: "07", title: "Liens & QR codes",               desc: "Génération, cookie 90j, partage WhatsApp/réseaux",         icon: "🔗" },
    { num: "07b", title: "Kit Marketing",                  desc: "Argumentaires personnalisés, visuels, scripts WhatsApp, vidéos par branche", icon: "🎨" },
    { num: "08", title: "Ventes, commissions & retrait",  desc: "Cycle vente, statuts, retrait self-service sans support, virements", icon: "💳" },
    { num: "09", title: "Réseau & parrainage",            desc: "Arbre 3 niveaux, prospects, opportunités, classement",     icon: "🌐" },
    { num: "10", title: "Académie IBIG",                  desc: "Articles, vidéos, audios, images, quiz, Coach IA 24/7",    icon: "🎓" },
    { num: "11", title: "Espace SUPERADMIN",              desc: "Gestion partenaires, KYC, ventes, paiements, audit",       icon: "⚙️" },
    { num: "12", title: "Badges & récompenses",           desc: "Jalons, badges automatiques, gamification du programme",   icon: "🏅" },
    { num: "13", title: "FAQ & contacts",                 desc: "Questions fréquentes, canaux support, équipe IBIG",        icon: "🏆" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-[#0f1729] via-[#0b3db5] to-[#0f1729] px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="inline-block rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">
                Document Officiel · IBIG SARL
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Guide Utilisateur Officiel</h1>
              <p className="text-yellow-400 font-bold text-base mt-1">IBIG PARTNERS — Programme d&apos;Affiliation Panafricain</p>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-blue-200">
                <span>📄 14 pages A4</span>
                <span>📅 Version 2.0 · Septembre 2026</span>
                <span>🔒 Document confidentiel</span>
              </div>
            </div>
            <button
              onClick={generatePDF}
              disabled={loading}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 px-6 py-3.5 text-sm font-bold text-slate-900 transition-all shadow-xl"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Génération...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  Télécharger le PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chapitres */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contenu du guide — 13 chapitres</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c) => (
            <div key={c.num} className="flex items-start gap-3 rounded-xl bg-white border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                {c.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-400">{c.num}</span>
                  <p className="text-sm font-bold text-slate-800 truncate">{c.title}</p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pied de page */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>INTERMARK BUSINESS INTERNATIONAL GROUP SARL · Cocody Riviera Palmeraie, Abidjan, Côte d&apos;Ivoire</span>
        <span>contact@ibigpartners.com · +225 27 22 27 60 14</span>
      </div>
    </div>
  );
}
