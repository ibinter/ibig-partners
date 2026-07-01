"use client";

import { useState } from "react";

export default function GuideAffilie() {
  const [loading,setLoading] = useState(false);

  // Accent-stripping helper — outside try so catch can use it
  function t(s: string): string {
    return s;
  }

  async function generatePDF() {
    setLoading(true);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      // @ts-ignore
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "portrait",unit: "mm",format: "a4"});
      const W = 210,H = 297;
      const BLUE = [11,95,255] as [number,number,number];
      const DARK = [15,23,41] as [number,number,number];
      const GOLD = [245,158,11] as [number,number,number];
      const GRAY = [100,116,139] as [number,number,number];
      const LIGHT = [241,245,249] as [number,number,number];
      const WHITE = [255,255,255] as [number,number,number];
      const GREEN = [16,185,129] as [number,number,number];

      const TOTAL_PAGES = 17;

      // ── Accent-stripping helper (also defined above for catch scope) ───────
      function t(s: string): string {
    return s;
      }

      // ── Layout helpers ──────────────────────────────────────────────────────
      function newPage() { doc.addPage(); }
      function header(n: number) {
        doc.setFillColor(...BLUE); doc.rect(0,0,W,12,"F");
        doc.setFontSize(8); doc.setTextColor(...WHITE);
        doc.text(t("IBIG PARTNERS Guide du Partenaire Affilié"),14,8);
        doc.text(t(`Page ${n} / ${TOTAL_PAGES}`),W - 14,8,{ align: "right"});
      }
      function footer() {
        doc.setFillColor(...DARK); doc.rect(0,H - 10,W,10,"F");
        doc.setFontSize(7); doc.setTextColor(...GOLD);
        doc.text(t("2026 IBIG SARL ibigpartners.com contact@ibigpartners.com"),W / 2,H - 4,{ align: "center"});
      }
      function secTitle(text: string,y: number) {
        doc.setFillColor(...BLUE); doc.roundedRect(14,y - 6,W - 28,10,2,2,"F");
        doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
        doc.text(t(text),20,y); return y + 12;
      }
      function sub(text: string,y: number) {
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE);
        doc.text(t(text),14,y);
        doc.setDrawColor(...BLUE); doc.setLineWidth(0.3); doc.line(14,y + 1.5,W - 14,y + 1.5);
        return y + 8;
      }
      function body(text: string,y: number,x = 14) {
        doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(t(text),W - x - 14);
        doc.text(lines,x,y); return y + lines.length * 5;
      }
      function bullet(text: string,y: number) {
        doc.setFillColor(...GOLD); doc.circle(18,y - 1.5,1,"F");
        doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(t(text),W - 30);
        doc.text(lines,22,y); return y + lines.length * 5 + 1;
      }
      function infoBox(text: string,y: number,bg: [number,number,number] = [239,246,255]) {
        const lines = doc.splitTextToSize(t(text),W - 34);
        const h = lines.length * 5 + 8;
        doc.setFillColor(...bg); doc.roundedRect(14,y,W - 28,h,2,2,"F");
        doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
        doc.text(lines,20,y + 7); return y + h + 5;
      }
      function checkPage(y: number,pg: number): number {
        if (y > 268) { newPage(); header(pg); footer(); return 22; }
        return y;
      }

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 1 : COUVERTURE
      // ══════════════════════════════════════════════════════════════════════
      doc.setFillColor(...DARK); doc.rect(0,0,W,H,"F");
      doc.setFillColor(...BLUE); doc.rect(0,75,W,125,"F");
      doc.setFillColor(...GOLD); doc.rect(0,75,W,3,"F"); doc.rect(0,197,W,3,"F");
      doc.setFontSize(40); doc.setFont("helvetica","bold");
      doc.setTextColor(...WHITE); doc.text("IBIG",W / 2,108,{ align: "center"});
      doc.setTextColor(...GOLD); doc.text("PARTNERS",W / 2,126,{ align: "center"});
      doc.setDrawColor(...WHITE); doc.setLineWidth(0.4); doc.line(50,134,W - 50,134);
      doc.setFontSize(13); doc.setFont("helvetica","normal"); doc.setTextColor(...WHITE);
      doc.text(t("GUIDE DU PARTENAIRE AFFILIÉ"),W / 2,144,{ align: "center"});
      doc.setFontSize(9); doc.setTextColor(180,200,255);
      doc.text(t("Programme d'Affiliation Multi-Niveaux Toutes les cles pour réussir"),W / 2,154,{ align: "center"});
      doc.text(t("INTERMARK BUSINESS INTERNATIONAL GROUP SARL"),W / 2,162,{ align: "center"});
      doc.setTextColor(...GOLD); doc.setFontSize(8);
      doc.text(t("Version 1.0 Juin 2026"),W / 2,174,{ align: "center"});
      doc.setFontSize(7.5); doc.setTextColor(130,155,200);
      doc.text(t("ibigpartners.com ibigpartners.com contact@ibigpartners.com +225 07 78 88 25 92"),W / 2,H - 14,{ align: "center"});

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 2 : TABLE DES MATIERES
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(2); footer();
      doc.setFillColor(...LIGHT); doc.rect(0,12,W,30,"F");
      doc.setFontSize(18); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
      doc.text(t("Table des matières"),14,30);
      doc.setFillColor(...GOLD); doc.rect(14,34,35,2,"F");
      const toc = [
        ["1.",t("Bienvenue dans IBIG PARTNERS"),"3"],
        ["2.",t("Inscription et activation du compte"),"3"],
        ["3.",t("Naviguer dans votre espace partenaire"),"4"],
        ["4.",t("Commissions - le système N1/N2/N3"),"5"],
        ["5.",t("Comment prospecter efficacement"),"6"],
        ["6.",t("Stratégies pour développer son réseau"),"7"],
        ["7.",t("Les branches et produits IBIG"),"8"],
        ["8.",t("KYC - Activér vos paiements"),"9"],
        ["9.",t("Liens d'affiliation et QR codes"),"9"],
        ["10.",t("Suivre vos ventes et commissions"),"10"],
        ["11.",t("Outils disponibles dans votre espace"),"11"],
        ["12.",t("Construire et animer votre réseau"),"12"],
        ["13.",t("Gestion des paiements et optimisation"),"13"],
        ["14.",t("Académie, formation et Coach IA"),"14"],
        ["15.",t("Badges, récompenses et classement"),"15"],
        ["16.",t("Support et contact"),"15"],
        ["17.",t("Conclusion"),"16"],
      ];
      let y = 46;
      toc.forEach(([num,title,page],i) => {
        if (i % 2 === 0) { doc.setFillColor(248,250,252); doc.rect(14,y - 5,W - 28,9,"F"); }
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE); doc.text(num,18,y);
        doc.setFont("helvetica","normal"); doc.setTextColor(...DARK); doc.text(title,28,y);
        doc.setTextColor(...GRAY); doc.text(page,W - 18,y,{ align: "right"});
        y += 9;
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 3 : PRESENTATION & INSCRIPTION
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(3); footer();
      y = 22; y = secTitle(t("1. Bienvenue dans IBIG PARTNERS"),y); y += 3;
      y = body(t("IBIG PARTNERS est le programme officiel d'affiliation multi-niveaux du groupe IBIG SARL. Il vous permet de gagner des commissions attractivés en recommandant les produits et services du groupe a votre entourage, et de construire un réseau de partenaires qui généré des revenus passifs automatiques."),y); y += 4;
      y = body(t("L'inscription est 100% GRATUITE. Aucun investissement requis. Vous êtes payé uniquement sur les ventes réalisées."),y); y += 5;

      y = sub(t("Pourquoi rejoindre IBIG PARTNERS ?"),y);
      y = bullet(t("Revenus passifs automatiques : vos filleuls vendent, vous gagnez sans effort supplémentaire."),y);
      y = bullet(t("Réseau illimite : recrutez autant de partenaires que vous voulez sur 3 niveaux."),y);
      y = bullet(t("Formations gratuités : accès a l'Académie IBIG avec modules, videos et quiz inclus."),y);
      y = bullet(t("Outils professionnels : liens traces, QR codes, simulateur, gestionnaire de prospects."),y);
      y = bullet(t("Support dédié : équipe disponible par email, WhatsApp et Coach IA 24h/24."),y);
      y += 4;

      y = infoBox(t("EXEMPLE CONCRET : Si vous vendez Scolaby a 30 000 FCFA/mois, vous gagnez 6 000 FCFA (20%). Votre filleul vend aussi Scolaby : vous gagnez automatiquement 3 000 FCFA supplémentaires (10% N2) sans rien faire de plus."),y,[240,253,244]);
      y += 3;

      y = sub(t("Les 9 Branches du Groupe IBIG SARL"),y);
      const branches = [
        [t("IBIG SOFT"),t("Logiciels SaaS : Scolaby, Fleet 360, GESCOMXEL, Zelivry, Lokativo, StockFlow — ibigsoft.com"),t("20%/10%/5%")],
        [t("IBIG EDUFORM"),t("Formations certifiantes : comptabilité, RH, QHSE, Sage, SAP, IA... — ibig-eduform.com"),t("10%/5%/2%")],
        [t("IBIG IMMO TRUST"),t("Immobilier sécurisé, BTP, gestion locative, transactions, diaspora — ibigimmotrust.com"),t("5%/2,5%/1%")],
        [t("IBIG MARKET"),t("Vente physique et e-commerce : IT, mobilier, fournitures, livraison — ibig-market.com"),t("8%/4%/2%")],
        [t("IBIG DIGITAL"),t("Création digitale, communication visuelle, site vitrine, identité visuelle, community management — intermark-business.com/digital"),t("10%/5%/2%")],
        [t("IBIG DIGITAL KITS"),t("Transformation numérique : ERP, app mobile, IA, chatbots, kits prêts à l'emploi — kits.intermark-business.com"),t("10%/5%/2%")],
        [t("IBIG CONSEIL+"),t("Structuration, comptabilité, juridique, conseil stratégique, création d'entreprise — intermark-business.com/conseil"),t("10%/5%/2%")],
        [t("IBIG PARTNERS"),t("Programme d'affiliation multi-niveaux, représentation commerciale, B2B — ibigpartners.com"),t("Variable")],
        [t("IBIG MULTISERVICES"),t("Événementiel, déménagement, maintenance, accueil VIP, logistique, BTP, tourisme — intermark-business.com/multiservices"),t("10%/5%/2%")],
      ];
      branches.forEach(([name,desc,comm]) => {
        y = checkPage(y,3);
        doc.setFillColor(...BLUE); doc.roundedRect(14,y,3,16,1,1,"F");
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
        doc.text(name,20,y + 6);
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
        doc.text(desc,20,y + 12);
        doc.setTextColor(...GOLD); doc.setFontSize(8);
        doc.text(t("Commissions N1/N2/N3 :") + comm,W - 14,y + 9,{ align: "right"});
        y += 20;
      });

      y += 3;
      y = secTitle(t("2. Inscription et activation du compte"),y); y += 3;
      const steps = [
        t("Allez sur ibigpartners.com - cliquez sur \"Devenir Partenaire\"."),
        t("Choisissez votre type : Particulier, Entreprise, ONG, Association ou Autre."),
        t("Remplissez le formulaire et créez votre mot de passe sécurisé."),
        t("Si vous avez un code parrain, saisissez-le dans le champ prévu a cet effet."),
        t("Votre code affilié unique est généré automatiquement (ex : AFF-DUPONT-042)."),
        t("L'équipe IBIG valide votre compte sous 24-48h - vous recevez un email de confirmation."),
        t("Completez ensuite votre KYC pour activér le versement de vos commissions."),
      ];
      steps.forEach((s,i) => {
        y = checkPage(y,3);
        doc.setFillColor(...BLUE); doc.circle(17,y - 1.5,3.5,"F");
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE); doc.text(String(i + 1),17,y,{ align: "center"});
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(s,W - 36); doc.text(lines,24,y); y += lines.length * 5 + 4;
      });

      y += 3;
      y = sub(t("Après l'inscription - ce qui se passe ensuite"),y);
      y = bullet(t("Email de bienvenue avec votre code affilié et vos identifiants de connexion."),y);
      y = bullet(t("Accès immediat a votre espace partenaire et a l'Académie IBIG."),y);
      y = bullet(t("Dossier KYC a soumettre pour activér les paiements (delai : 24-48h)."),y);
      y = bullet(t("Premier module de formation recommande : 'Decouvrir les produits IBIG'."),y);
      y = bullet(t("Activation de vos premiers liens d'affiliation dans la section 'Mes Liens'."),y);
      y += 4;

      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Type de partenaire"),t("Documents requis")]],
        body: [
          [t("Particulier"),t("CNI/Passeport, CV, contacts de référence")],
          [t("Entreprise"),t("RCCM, NIF, representant legal, adresse siege")],
          [t("ONG/Association"),t("Statuts, recepisse, representant legal")],
          [t("Autre"),t("Document d'identification valide")],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 4 : NAVIGUER DANS VOTRE ESPACE
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(4); footer();
      y = 22; y = secTitle(t("3. Naviguer dans votre espace partenaire"),y); y += 3;
      y = body(t("Votre espace partenaire (ibigpartners.com/espace) est votre centrale de controle. Toutes vos informations sont disponibles en temps reel. Voici un guide détaillé de chaque section du menu."),y); y += 5;

      const dash = [
        [t("Accueil"),t("Vue d'ensemble : commissions du mois, statut, ventes recentes, alertes importantes. Consultez-le chaque matin pour suivre votre activité."),t("Conseil : vérifiez vos alertes KYC et validations en attente.")],
        [t("Mes Liens"),t("Liens d'affiliation et QR codes pour chaque produit activé. Copiez et partagez vos liens traces pour suivre chaque conversion automatiquement."),t("Conseil : activéz d'abord les produits IBIG SOFT, les plus faciles a vendre.")],
        [t("Ventes"),t("Historique complet de toutes vos ventes avec montants et statuts. Filtrez par date, branche ou statut pour analyser vos performances."),t("Conseil : exportez en CSV chaque mois pour suivre votre progression.")],
        [t("Commissions"),t("Detail N1/N2/N3 : montant, statut (En attente / Validee / Payee). Toutes vos commissions sont calculees automatiquement a chaque vente confirmée."),t("Conseil : vérifiez vos commissions N2 pour voir la performance de vos filleuls.")],
        [t("Paiements"),t("Historique des virements reçus avec références et montants. Permet de reconcilier vos paiements et de contacter le support en cas d'ecart."),t("Conseil : seuil minimum 5 000 FCFA pour déclencher un paiement.")],
        [t("Mon Réseau"),t("Arbre de parrainage sur 3 niveaux avec performances de vos filleuls. Identifiez vos meilleurs filleuls et ceux qui ont besoin d'accompagnement."),t("Conseil : contactez vos filleuls inactifs pour les remotivér.")],
        [t("Prospects"),t("Gestion de vos contacts : Contacte - Demo - Converti - Perdu. Suivez chaque prospect de la première prise de contact jusqu'a la vente."),t("Conseil : visez 10 nouveaux prospects par semaine.")],
        [t("Badges"),t("Vos badges gagnes et objectifs en cours. Les badges debloquent des formations avancees et améliorent votre classement."),t("Conseil : l'objectif 'Première vente'est prioritaire.")],
        [t("Académie"),t("Modules de formation, videos, PDFs, quiz et ressources marketing. Completez un module par semaine pour progresser rapidement."),t("Conseil : commencez par le module 'Argumentaire Scolaby'.")],
        [t("Coach IA"),t("Assistant intelligent disponible 24h/24 pour toutes vos questions sur les produits, commissions, techniques de vente et gestion du réseau."),t("Conseil : préparez vos rendez-vous clients avec le Coach IA.")],
        [t("Communication"),t("Chat avec l'équipe IBIG (partenaires Gold+ et au-dessus). Posez vos questions directement a l'équipe pour des réponses personnalisees."),t("Conseil : accèssible des le statut GOLD.")],
        [t("Verification KYC"),t("Soumission et suivi de votre dossier de vérification. Indispensable pour recevoir vos commissions."),t("Conseil : soumettez votre KYC des la première semaine.")],
      ];
      dash.forEach(([name,desc,tip]) => {
        y = checkPage(y + 1,4);
        doc.setFillColor(248,250,255); doc.roundedRect(14,y - 4,W - 28,22,2,2,"F");
        doc.setFillColor(...BLUE); doc.roundedRect(14,y - 4,3,22,1,1,"F");
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE); doc.text(name,20,y + 2);
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
        const dl = doc.splitTextToSize(desc,W - 46); doc.text(dl,20,y + 8);
        doc.setFontSize(7.5); doc.setTextColor(...GRAY);
        const tl = doc.splitTextToSize(t("Pro tip :") + tip,W - 46); doc.text(tl,20,y + 8 + dl.length * 4.5);
        y += 26;
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 5 : COMMISSIONS
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(5); footer();
      y = 22; y = secTitle(t("4. Commissions - le système N1/N2/N3"),y); y += 3;
      y = body(t("Chaque vente que vous réalisez (N1) ou que vos filleuls réalisént (N2, N3) généré automatiquement une commission. Plus votre réseau est actif, plus vos revenus passifs augmentent sans effort supplémentaire de votre part."),y); y += 5;

      y = sub(t("Comment fonctionnent les 3 niveaux"),y);
      const niveaux = [
        { lvl: "N1",color: BLUE,label: t("VOS ventes directes"),taux: t("Taux plein (selon branche)") },
        { lvl: "N2",color: GREEN,label: t("Ventes de VOS filleuls"),taux: t("50% du taux N1") },
        { lvl: "N3",color: GOLD,label: t("Ventes des filleuls de vos filleuls"),taux: t("25% du taux N1") },
      ];
      niveaux.forEach((n,i) => {
        doc.setFillColor(...n.color); doc.roundedRect(14 + i * 63,y,58,22,2,2,"F");
        doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE);
        doc.text(n.lvl,43 + i * 63,y + 8,{ align: "center"});
        doc.setFontSize(8); doc.setFont("helvetica","normal");
        const l = doc.splitTextToSize(n.label,52); doc.text(l,43 + i * 63,y + 14,{ align: "center"});
        doc.setFontSize(7.5); doc.setTextColor(220,230,255);
        doc.text(n.taux,43 + i * 63,y + 20,{ align: "center"});
      });
      y += 30;

      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Branche"),t("N1 (Vos ventes)"),t("N2 (Filleuls)"),t("N3 (Filleuls2)")]],
        body: [
          [t("IBIG SOFT (mensuel)"),"20%","10%","5%"],
          [t("IBIG SOFT (annuel)"),"20%","8%","3%"],
          [t("IBIG EDUFORM"),"10%","5%","2%"],
          [t("IBIG IMMO TRUST"),"5%","2,5%","1%"],
          [t("IBIG MARKET"),"8%","4%","2%"],
          [t("IBIG DIGITAL"),"10%","5%","2%"],
          [t("IBIG DIGITAL KITS"),"10%","5%","2%"],
          [t("IBIG CONSEIL+"),"10%","5%","2%"],
          [t("IBIG MULTISERVICES"),"10%","5%","2%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK,halign: "center"},
        columnStyles: { 0: { halign: "left"} },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 6;

      y = infoBox(t("ABONNEMENTS MENSUELS IBIG SOFT : commissions versées sur 4 mois. Mois 1 : taux plein - Mois 2 : 75% - Mois 3 : 50% - Mois 4 : 25%. Recompense la fidélisation client sur la duree."),y,[255,251,235]);
      y += 3;

      y = sub(t("Exemple concret - Jean et son réseau"),y);
      y = infoBox(t("Jean recrute Marie (N1) et Paul (N1). Marie recrute Sophie (N2 de Jean). Sophie vend EDUFORM a 400 000 FCFA. Jean gagne : 400 000 x 2% (N2 EDUFORM) = 8 000 FCFA automatiquement, sans rien faire. Si Paul vend Scolaby a 30 000 FCFA : Jean gagne 30 000 x 10% (N2 SOFT) = 3 000 FCFA de plus."),y,[240,253,244]);
      y += 3;

      y = sub(t("Simulation : si je fais X ventes IBIG SOFT/mois (30 000 FCFA @ 20%)"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Nb ventes/mois"),t("Gain N1 personnel"),t("+ 5 filleuls actifs (N2)"),t("Total mensuel estime")]],
        body: [
          ["5 ventes",t("30 000 FCFA"),t("15 000 FCFA"),t("45 000 FCFA")],
          ["10 ventes",t("60 000 FCFA"),t("30 000 FCFA"),t("90 000 FCFA")],
          ["20 ventes",t("120 000 FCFA"),t("60 000 FCFA"),t("180 000 FCFA")],
        ],
        headStyles: { fillColor: GOLD,textColor: DARK,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK,halign: "center"},
        columnStyles: { 0: { halign: "left"} },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 6;

      y = sub(t("Statuts et bonus"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Statut"),t("Condition"),t("Avantage")]],
        body: [
          [t("STARTER"),t("Inscription validee"),t("Taux de base")],
          [t("SILVER"),t("500 000 FCFA CA cumule"),t("+1% sur toutes les commissions")],
          [t("GOLD"),t("2 000 000 FCFA CA cumule"),t("+2% Accès au Chat IBIG")],
          [t("MASTER"),t("5 000 000 FCFA CA cumule"),t("+3% Accès formation avancee")],
          [t("ELITE"),t("15 000 000 FCFA CA cumule"),t("+5% Avantages exclusifs")],
        ],
        headStyles: { fillColor: GOLD,textColor: DARK,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 6 : COMMENT PROSPECTER EFFICACEMENT
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(6); footer();
      y = 22; y = secTitle(t("5. Comment prospecter efficacement"),y); y += 3;
      y = body(t("La prospection est le moteur de vos revenus. Plus vous contactez de personnes qualifiées, plus vos chances de vente augmentent. Voici les 5 techniques les plus efficaces pour les affiliés IBIG PARTNERS."),y); y += 5;

      y = sub(t("5 techniques de prospection"),y);
      const techniques = [
        [t("Réseaux sociaux (Facebook, Instagram)"),t("Publiez des témoignages clients, des démonstrations de produits et des resultats concrets. Utilisez les visuels de l'Académie IBIG. Frequence : 1 post par jour minimum.")],
        [t("WhatsApp et groupes WhatsApp"),t("Partagez votre lien d'affiliation dans vos groupes. Envoyez des messages personnalises (pas de spam). Créez un groupe 'Opportunite IBIG'pour vos prospects chauds.")],
        [t("Bouche a oreille et networking"),t("Parlez d'IBIG PARTNERS a votre entourage professionnel : collegues, anciens camarades, membres d'associations. La confiance accelère la conversion.")],
        [t("Groupes Facebook thematiques"),t("Rejoignez des groupes de chefs d'entreprise, enseignants, RH, transporteurs, gerants d'immeubles. Proposez des solutions adaptees a leurs besoins spécifiques.")],
        [t("LinkedIn professionnel"),t("Ciblez les decideurs, DRH, directeurs d'écoles et gerants de PME. Redigez un message de connexion professionnel suivi d'une présentation personnalisee.")],
      ];
      techniques.forEach(([tech,desc],i) => {
        y = checkPage(y,6);
        doc.setFillColor(...BLUE); doc.circle(17,y - 1.5,3.5,"F");
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE); doc.text(String(i + 1),17,y,{ align: "center"});
        doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setTextColor(...DARK); doc.text(tech,24,y);
        y += 6;
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...GRAY);
        const lines = doc.splitTextToSize(desc,W - 38); doc.text(lines,24,y); y += lines.length * 4.5 + 5;
      });

      y = sub(t("Script de prospection WhatsApp personnalisable"),y);
      y = infoBox(
        t("Bonjour [Prenom], je pense a vous car je suis partenaire d'IBIG PARTNERS, un groupe ivoirien qui propose des logiciels de gestion, formations certifiantes et bien plus. Je connais [votre secteur] et je pense que [produit X] pourrait vraiment vous aider a [benefice concret]. Est-ce que vous avez 5 minutes cette semaine pour que je vous fasse une rapide démonstration ? Vous ne payéz rien pour découvrir. Cordialement,[Votre prenom]."),
        y,[239,246,255]
      ); y += 3;

      y = sub(t("Objections courantes et réponses type"),y);
      const objections = [
        [t("\"C'est trop cher\""),t("Réponse : 'Je comprends. Dites-moi quel budget vous avez en tete ? En fait, si ce logiciel vous fait gagner [X heures/mois], combien cela vaut-il pour vous ?'")],
        [t("\"Je n'ai pas le temps\""),t("Réponse : 'C'est justement pour ca que je vous contacte. Notre solution fait gagner du temps. Je vous propose 15 minutes seulement pour vous montrer comment.'")],
        [t("\"J'ai deja un outil similaire\""),t("Réponse : 'Parfait, vous avez deja compris la valeur de ce type d'outil. Ce qui différencié IBIG c'est [spécificité]. Que manque-t-il a votre solution actuelle ?'")],
        [t("\"Je dois y reflechir\""),t("Réponse : 'Bien sur. Qu'est-ce qui vous ferait prendre une decision positive ? Puis-je vous envoyer une fiche produit détaillée et vous rappeler dans 3 jours ?'")],
      ];
      objections.forEach(([obj,rep]) => {
        y = checkPage(y,6);
        doc.setFillColor(255,251,235); doc.roundedRect(14,y - 3,W - 28,20,2,2,"F");
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...GOLD); doc.text(obj,18,y + 2);
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(rep,W - 36); doc.text(lines,18,y + 8); y += lines.length * 4.5 + 10;
      });

      y = sub(t("Conseils pour les rendez-vous de présentation"),y);
      y = bullet(t("Preparez votre démonstration avec le Coach IA avant le rendez-vous."),y);
      y = bullet(t("Commencez par ecouter les besoins du prospect avant de présentér le produit."),y);
      y = bullet(t("Montrez une démonstration concrète sur votre écran ou tablette."),y);
      y = bullet(t("Proposez un essai gratuit si disponible pour le produit concerné."),y);
      y = bullet(t("Fixez toujours une date de suivi avant de quitter le rendez-vous."),y);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 7 : STRATEGIES POUR DEVELOPPER SON RESEAU
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(7); footer();
      y = 22; y = secTitle(t("6. Stratégies pour développer son réseau"),y); y += 3;
      y = body(t("Votre réseau de partenaires est votre moteur de revenus passifs. Un réseau de qualité, bien formé et motivé, généré des commissions N2 et N3 automatiquement. Voici comment le construire intelligemment."),y); y += 5;

      y = sub(t("Comment choisir ses filleuls (qualité vs quantite)"),y);
      y = body(t("Mieux vaut 5 filleuls actifs que 50 filleuls inactifs. Privilégiez des personnes avec : une capacité commerciale naturelle, un réseau personnel étendu, de la motivation et de la disponibilité, et une compréhension des outils numériques."),y); y += 4;

      y = bullet(t("Profils idéaux : commerciaux, enseignants, RH, chefs d'entreprise, agents immobiliers."),y);
      y = bullet(t("Évitez de recruter des personnes sans motivation ou uniquement attirés par les gains."),y);
      y = bullet(t("Évaluez le sérieux d'un prospect filleul lors d'un appel de 15 minutes."),y);
      y += 4;

      y = sub(t("Comment formér et motivér vos filleuls"),y);
      y = bullet(t("Envoyez-leur le lien vers l'Académie IBIG des leur inscription."),y);
      y = bullet(t("Partagez ce guide PDF avec eux pour qu'ils comprennent le système."),y);
      y = bullet(t("Organisez un appel de bienvenue de 30 minutes pour répondre a leurs questions."),y);
      y = bullet(t("Partagez vos propres succès pour les inspirer et les remotivér."),y);
      y = bullet(t("Créez un groupe WhatsApp de votre équipe pour partager astuces et motivation."),y);
      y += 4;

      y = sub(t("Organisation d'événements de recrutement"),y);
      y = body(t("Organisez des reunions d'information (présentiel ou visio) pour présentér IBIG PARTNERS a plusieurs prospects a la fois. C'est beaucoup plus efficace que des présentations individuelles."),y); y += 3;
      y = bullet(t("Reunion virtuelle : Zoom/Google Meet - 30 personnes max - 45 minutes."),y);
      y = bullet(t("Presentiel : salle associative, cafe d'affaires, bureau d'un membre."),y);
      y = bullet(t("Contenu : présentation du groupe IBIG, témoignage d'un partenaire, demo produit, Q&A."),y);
      y = bullet(t("Frequence recommandee : 1 événement par mois minimum."),y);
      y += 4;

      y = sub(t("Suivi des filleuls inactifs"),y);
      y = infoBox(t("Un filleul inactif depuis 30 jours mérite un contact. Envoyez un message personnalise : 'Bonjour [Prenom], j'ai vu que tu n'as pas encore réalisé ta première vente. Est-ce que tu as des questions ou des blocages ? Je suis disponible pour t'aider.'Un simple encouragement peut relancer un filleul."),y,[240,253,244]);
      y += 3;

      y = sub(t("Projection motivante : votre réseau dans 6 mois"),y);
      y = infoBox(t("Scénario : vous recrutez 4 filleuls actifs par mois. Au bout de 6 mois, vous avez 24 filleuls N1. Chacun fait en moyenne 2 ventes Scolaby/mois (30 000 FCFA). Vos commissions N2 : 24 x 2 x 3 000 FCFA = 144 000 FCFA/mois de revenus passifs, en plus de vos propres ventes."),y,[239,246,255]);
      y += 4;

      y = sub(t("Meilleures pratiques de gestion d'équipe"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Action"),t("Frequence"),t("Impact")],],
        body: [
          [t("Appel de suivi filleul"),t("1x/semaine"),t("Maintien de la motivation")],
          [t("Partage de ressources Académie"),t("2x/semaine"),t("Montee en compétence")],
          [t("Groupe WhatsApp équipe"),t("Quotidien"),t("Cohesion et partage d'astuces")],
          [t("Événement de recrutement"),t("1x/mois"),t("Croissance du réseau")],
          [t("Bilan mensuel des performances"),t("1x/mois"),t("Identification des blocages")],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 8 : PRODUITS
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(8); footer();
      y = 22; y = secTitle(t("7. Les branches et produits IBIG a promouvoir"),y); y += 3;

      y = infoBox(t("PRODUIT LE PLUS FACILE A VENDRE EN DEBUT : Scolaby (gestion scolaire). Cible facile a identifier (écoles, crèches, académies), besoin urgent et universel, prix abordable, démonstration rapide en 10 minutes."),y,[240,253,244]);
      y += 4;

      const prods = [
        {
          branch: t("IBIG SOFT - Commissions : N1=20%, N2=10%, N3=5%"),
          items: [
            t("Scolaby mensuel (gestion scolaire) - 30 000 FCFA/mois | N1=6 000, N2=3 000, N3=1 500 FCFA"),
            t("Scolaby Annuel - 300 000 FCFA/an | N1=60 000, N2=30 000, N3=15 000 FCFA"),
            t("IBIG Fleet 360 (gestion flotte) - 45 000 FCFA/mois | N1=9 000, N2=4 500, N3=2 250 FCFA"),
            t("Zelivry (gestion livraison) - 25 000 FCFA/mois | N1=5 000, N2=2 500, N3=1 250 FCFA"),
            t("Lokativo (gestion immobilière) - 35 000 FCFA/mois | N1=7 000, N2=3 500, N3=1 750 FCFA"),
            t("GESCOMXEL (gestion commerciale) - 20 000 FCFA/mois | N1=4 000, N2=2 000, N3=1 000 FCFA"),
            t("STOCKFLOW ERP - 40 000 FCFA/mois | N1=8 000, N2=4 000, N3=2 000 FCFA"),
          ],
        },
        {
          branch: t("IBIG EDUFORM - Commissions : N1=10%, N2=5%, N3=2%"),
          items: [
            t("Comptabilité & Finance 4 en 1 - 400 000 FCFA | N1=40 000, N2=20 000, N3=8 000 FCFA"),
            t("DAF Dirigeant - 425 000 FCFA | N1=42 500, N2=21 250, N3=8 500 FCFA"),
            t("Expert RH 3 en 1 - 450 000 FCFA | N1=45 000, N2=22 500, N3=9 000 FCFA"),
            t("QHSE Expert - 350 000 FCFA | N1=35 000, N2=17 500, N3=7 000 FCFA"),
            t("Logistique & Supply Chain - 450 000 FCFA | N1=45 000, N2=22 500, N3=9 000 FCFA"),
            t("Sage 100 (Compta, Paie, GESCOM) - 22 500 a 25 000 FCFA"),
            t("Power BI, SAP FI, IA Professionnels, Canva Pro..."),
            t("Formation Sur Mesure Entreprise - des 500 000 FCFA (sur devis)"),
            t("Formation Intra-Entreprise en Présentiel - des 350 000 FCFA/session"),
            t("Formation a Distance - International & Diaspora - 450 000 FCFA"),
            t("Coaching Individuel & Formation Particulier - des 150 000 FCFA"),
            t("Formation Individuelle pour Particulier - des 100 000 FCFA"),
            t("Déplacement Formateur a l'International - entierement sur devis"),
          ],
        },
        {
          branch: t("IBIG IMMO TRUST - Commissions : N1=5%, N2=2,5%, N3=1% — ibigimmotrust.com"),
          items: [
            t("Achat / Vente Immobilière - commissions sur prix de transaction"),
            t("Gestion Locative Garantie - commissions sur honoraires annuels"),
            t("Construction Cle en Main - commissions sur devis total"),
            t("Rénovation & Réhabilitation"),
            t("Service Diaspora - Suivi à Distance"),
          ],
        },
        {
          branch: t("IBIG MARKET - Commissions : N1=8%, N2=4%, N3=2% — ibig-market.com"),
          items: [
            t("Ordinateurs et matériel informatique"),
            t("Canon PIXMA G3410 Multifonction"),
            t("Mobilier & Aménagement Professionnel"),
            t("Fournitures de Bureau - Pack PME"),
            t("Matériel BTP & Construction"),
          ],
        },
        {
          branch: t("IBIG DIGITAL - Commissions : N1=10%, N2=5%, N3=2% — intermark-business.com/digital"),
          items: [
            t("Site Vitrine Professionnel"),
            t("Identité Visuelle & Logo"),
            t("Community Management (réseaux sociaux)"),
            t("Campagne Publicitaire en ligne"),
          ],
        },
        {
          branch: t("IBIG DIGITAL KITS - Commissions : N1=10%, N2=5%, N3=2% — kits.intermark-business.com"),
          items: [
            t("Site Vitrine Professionnel"),
            t("Application Mobile sur Mesure"),
            t("Intégration ERP (SAP, SAGE, Odoo)"),
            t("Chatbot & Intelligence Artificielle"),
            t("Kit Marketing Digital (community management, SEO, emailing)"),
          ],
        },
        {
          branch: t("IBIG CONSEIL+ - Commissions : N1=10%, N2=5%, N3=2% — intermark-business.com/conseil"),
          items: [
            t("Conseil & Diagnostic Stratégique"),
            t("Ingénierie Financière & Levée de Fonds"),
            t("Accompagnement Création d'Entreprise"),
            t("Étude de Marché & Analyse Sectorielle"),
            t("Structuration organisationnelle et mise en conformité juridique"),
          ],
        },
        {
          branch: t("IBIG MULTISERVICES - Commissions : N1=10%, N2=5%, N3=2% — intermark-business.com/multiservices"),
          items: [
            t("Organisation Événementielle (conférences, séminaires, mariages)"),
            t("Déménagement & Transport"),
            t("Maintenance & Dépannage (plomberie, électricité, climatisation)"),
            t("Accueil VIP & Conciergerie"),
          ],
        },
      ];
      prods.forEach(({ branch,items }) => {
        y = checkPage(y,8);
        doc.setFillColor(...BLUE); doc.roundedRect(14,y - 5,W - 28,9,2,2,"F");
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE); doc.text(branch,20,y);
        y += 8;
        items.forEach(item => {
          y = checkPage(y,8);
          doc.setFillColor(...GOLD); doc.circle(18,y - 1.5,1,"F");
          doc.setFontSize(8.5); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
          const lines = doc.splitTextToSize(item,W - 32); doc.text(lines,22,y); y += lines.length * 5 + 2;
        });
        y += 4;
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 9 : KYC + LIENS
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(9); footer();
      y = 22; y = secTitle(t("8. KYC - Activér vos paiements de commissions"),y); y += 3;
      y = body(t("La vérification KYC est obligatoire pour recevoir vos commissions. Sans KYC, vos commissions sont calculees et conservees mais non versées. Completez votre KYC des la première semaine."),y); y += 4;

      y = sub(t("Étapes de vérification"),y);
      const kyc = [
        t("Dans votre espace, cliquez sur 'Verification'dans le menu gauche."),
        t("Choisissez Particulier ou Entreprise - le formulaire s'adapte automatiquement."),
        t("Particulier : Nom état civil, type et numéro de piece d'identite, profession, contacts de référence, CV."),
        t("Entreprise/ONG : Raison sociale, RCCM, NIF, representant legal, adresse siege."),
        t("Ajoutez vos coordonnees de paiement : Orange Money, Wave, MTN MoMo, virement bancaire..."),
        t("Soumettez - l'équipe IBIG examine votre dossier sous 24-48h ouvrables."),
        t("Confirmation par notification et email - vos commissions en attente sont debloquees."),
      ];
      kyc.forEach((s,i) => {
        y = checkPage(y,9);
        doc.setFillColor(...BLUE); doc.circle(17,y - 1.5,3.5,"F");
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE); doc.text(String(i + 1),17,y,{ align: "center"});
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(s,W - 36); doc.text(lines,24,y); y += lines.length * 5 + 4;
      });

      y += 3;
      y = sub(t("Que se passe-t-il si mon KYC est rejeté ?"),y);
      y = infoBox(t("Si votre KYC est rejeté, vous recevez un email explicatif indiquant le motif du rejet (document illisible, information manquante, etc.). Vous pouvez corriger et soumettre à nouveau immediatement. En cas de doute, contactez le support a support@ibigpartners.com avec votre code affilié."),y,[255,235,235]);
      y += 3;

      y = sub(t("Delais de traitement et informations importantes"),y);
      y = bullet(t("Delai standard KYC : 24 a 48 heures ouvrables après soumission."),y);
      y = bullet(t("Vos commissions s'accumulent pendant le traitement du KYC et sont versées après validation."),y);
      y = bullet(t("La mise a jour des coordonnees de paiement necessite une revalidation partielle."),y);
      y = bullet(t("Le KYC est valable indéfiniment sauf changement de situation ou de documents."),y);
      y += 5;

      y = secTitle(t("9. Liens d'affiliation et QR codes"),y); y += 3;
      y = body(t("Vos liens d'affiliation uniques permettent le tracking automatique de vos ventes. Partagez-les partout pour générer des commissions. Chaque clic est trace pendant 90 jours."),y); y += 4;
      y = bullet(t("Rendez-vous dans 'Mes Liens'- activéz les produits souhaites."),y);
      y = bullet(t("Copiez votre lien unique (ex : ibigpartners.com/p/AFF-DUPONT-042)."),y);
      y = bullet(t("Téléchargez votre QR code pour vos supports imprimes (flyers, cartes, roll-up)."),y);
      y = bullet(t("Partagez par WhatsApp, réseaux sociaux, email, SMS, en face-a-face."),y);
      y = bullet(t("Cookie de tracking : 90 jours - toute inscription dans ce delai vous est attribuee."),y);
      y += 5;
      y = infoBox(t("Lien de parrainage : ibigpartners.com/rejoindre?ref=VOTRE-CODE - Tout nouveau partenaire qui s'inscrit via ce lien devient automatiquement votre filleul N1."),y,[240,253,244]);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 10 : VENTES ET COMMISSIONS
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(10); footer();
      y = 22; y = secTitle(t("10. Suivre vos ventes et commissions"),y); y += 3;
      y = sub(t("Statuts des ventes"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Statut"),t("Signification")]],
        body: [
          [t("EN ATTENTE"),t("Paiement client en cours de vérification")],
          [t("CONFIRMEE"),t("Paiement reçu - commissions générées automatiquement")],
          [t("ANNULEE"),t("Paiement echoue ou rembourse - aucune commission")],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 6;
      y = sub(t("Statuts des commissions"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Statut"),t("Signification"),t("A faire")]],
        body: [
          [t("EN ATTENTE"),t("Vente confirmée, commission calculee"),t("Rien - processus auto")],
          [t("VALIDEE"),t("Approuvee par l'équipe IBIG"),t("Attendre le virement")],
          [t("PAYEE"),t("Viree sur votre compte"),t("Vérifiér reception")],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 6;

      y = sub(t("Comment maximiser vos ventes"),y);
      y = bullet(t("Concentrez-vous sur 2-3 produits maximum au debut plutot que de tout vendre."),y);
      y = bullet(t("Preparez des témoignages clients authentiques pour chaque produit."),y);
      y = bullet(t("Utilisez le simulateur de revenus pour montrer le ROI concret a vos prospects."),y);
      y = bullet(t("Suivez vos prospects dans l'outil CRM de votre espace (section Prospects)."),y);
      y = bullet(t("Relancez systematiquement a J+3, J+7 et J+14 après une demo."),y);
      y += 4;

      y = sub(t("Conseils saisonniers et moments cles"),y);
      y = bullet(t("Rentree scolaire (septembre) : moment idéal pour Scolaby - ciblez les écoles en aout."),y);
      y = bullet(t("Debut d'annee (janvier) : ciblez les entreprises pour les formations et logiciels de gestion."),y);
      y = bullet(t("Fin d'annee (novembre-decembre) : budgets d'investissement a depenser dans les entreprises."),y);
      y = bullet(t("Après les bulletins de paie (fin de mois) : moment propice pour les achats B2B."),y);
      y += 4;

      y = sub(t("Methodes de paiement disponibles"),y);
      const payments = [
        t("Orange Money (Côte d'Ivoire)"),t("Wave (CI, Senegal)"),t("MTN MoMo (multi-pays)"),
        t("Moov Money / Airtel Money"),t("M-Pesa (Kenya, Tanzanie, RDC...)"),t("CinetPay (panafricain)"),
        t("Virement bancaire IBAN/SWIFT"),t("Western Union / MoneyGram"),
        t("Wise / WorldRemit / Remitly"),t("Juba Express / RIA Money Transfer"),
      ];
      let py2 = y;
      payments.forEach((p,i) => {
        const xi = i < 5 ? 14 : W / 2 + 3,yi = i < 5 ? py2 + (i * 12) : py2 + ((i - 5) * 12);
        doc.setFillColor(...GOLD); doc.circle(xi + 2,yi - 1.5,1,"F");
        doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
        doc.text(p,xi + 5,yi);
      });
      y = py2 + 5 * 12 + 5;
      y = infoBox(t("Seuil minimum de versement : 5 000 FCFA. Les commissions inferieures s'accumulent jusqu'a atteindre ce seuil. Les frais de transfert international (Western Union, virement SWIFT) sont déduits du montant verse. Delai de versement : 7 jours ouvrables après validation."),y,[255,251,235]);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 11 : OUTILS DISPONIBLES
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(11); footer();
      y = 22; y = secTitle(t("11. Outils disponibles dans votre espace"),y); y += 3;
      y = body(t("Votre espace partenaire contient des outils professionnels con?us pour maximiser votre productivite commerciale. Voici comment utiliser chacun d'eux au maximum de leur potentiel."),y); y += 5;

      const tools = [
        [
          t("Liens d'affiliation traces"),
          t("Comment utiliser : Activéz chaque produit que vous souhaitez vendre dans 'Mes Liens'. Copiez le lien unique généré et partagez-le directement dans vos messages et publications. Chaque clic est enregistre avec la date et la source."),
          t("Astuce : créez un lien court avec bit.ly ou tinyurl pour les partages sur les réseaux sociaux.")
        ],
        [
          t("QR codes personnalises"),
          t("Comment utiliser : Téléchargez le QR code de chaque produit en PNG haute résolution. Imprimez-le sur vos flyers, cartes de visite et affiches. Presentez-le lors de vos reunions pour une inscription instantanee."),
          t("Astuce : faites imprimer 50 cartes de visite avec votre QR code Scolaby pour vos contacts en écoles.")
        ],
        [
          t("Gestionnaire de prospects (CRM)"),
          t("Comment utiliser : Ajoutez chaque contact intèresse dans la section Prospects. Faites evoluer le statut : Contacte - Demo programmee - Demo réalisée - Converti - Perdu. Ajoutez des notes a chaque prospect."),
          t("Astuce : relancez les prospects 'Demo réalisée'a J+3 systematiquement.")
        ],
        [
          t("Simulateur de revenus"),
          t("Comment utiliser : Entrez votre volume de ventes estime et la taille de votre réseau. Le simulateur calcule automatiquement vos commissions N1, N2 et N3 potentielles. Montrez-le a vos prospects filleuls pour les convaincre."),
          t("Astuce : préparez 3 scénarios (conservateur, realiste, optimiste) avant votre présentation.")
        ],
        [
          t("Coach IA IBIG"),
          t("Comment utiliser : Posez vos questions en langage naturel. Le Coach connait tous les produits IBIG, les taux de commission, les techniques de vente et peut vous aider a rediger un email de prospection ou préparer une démonstration."),
          t("Astuce : avant chaque rendez-vous client, demandez au Coach : 'Comment présentér Scolaby a un directeur d'école ?'")
        ],
        [
          t("Tableau de bord et statistiques"),
          t("Comment utiliser : Consultez chaque matin votre dashboard pour voir vos commissions du mois, vos ventes recentes et les alertes importantes. Identifiez vos meilleures périodes de vente pour optimiser votre activité."),
          t("Astuce : exportez vos stats mensuelles pour suivre votre progression trimestre par trimestre.")
        ],
      ];
      tools.forEach(([name,how,tip]) => {
        y = checkPage(y,11);
        doc.setFillColor(248,250,255); doc.roundedRect(14,y - 4,W - 28,34,2,2,"F");
        doc.setFillColor(...GOLD); doc.roundedRect(14,y - 4,3,34,1,1,"F");
        doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK); doc.text(name,20,y + 2);
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
        const hl = doc.splitTextToSize(how,W - 40); doc.text(hl,20,y + 9);
        doc.setFontSize(7.5); doc.setTextColor(...GRAY);
        const tl = doc.splitTextToSize(t("Astuce pro :") + tip.replace(t("Astuce :"),""),W - 40);
        doc.text(tl,20,y + 9 + hl.length * 4.5);
        y += 38;
      });

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 12 : RESEAU
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(12); footer();
      y = 22; y = secTitle(t("12. Construire et animer votre réseau"),y); y += 3;
      y = body(t("Votre réseau de partenaires est votre moteur de revenus passifs. Chaque partenaire que vous recrutez devient votre filleul N1 et ses ventes vous rapportent automatiquement des commissions N2."),y); y += 5;

      y = sub(t("Comment recruter un partenaire"),y);
      y = bullet(t("Partagez votre lien de parrainage : ibigpartners.com/rejoindre?ref=VOTRE-CODE"),y);
      y = bullet(t("Votre filleul s'inscrit avec votre code - il apparait dans votre réseau N1."),y);
      y = bullet(t("Des sa 1ère vente, vous recevez votre commission N2 automatiquement."),y);
      y = bullet(t("Ses propres filleuls génèrent votre commission N3."),y);
      y += 5;

      y = sub(t("Outils de gestion réseau"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Outil"),t("Description")]],
        body: [
          [t("Mon Réseau"),t("Vue arbre 3 niveaux avec CA et performances de chaque filleul")],
          [t("Prospects"),t("Suivi de vos contacts : Contacte - Demo - Converti - Perdu")],
          [t("Objectifs"),t("Fixer et suivre vos objectifs mensuels de ventes et recrutements")],
          [t("Classement"),t("Votre rang parmi les meilleurs partenaires du mois")],
          [t("Simulateur"),t("Estimez vos revenus potentiels selon votre réseau et volume de ventes")],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 8;

      y = sub(t("Projection motivante : réseau de 20 filleuls actifs"),y);
      y = infoBox(t("Scénario : un réseau de 20 filleuls actifs chacun realisant 2 ventes Scolaby/mois (30 000 FCFA). Vos commissions N2 : 20 x 2 x 3 000 FCFA = 120 000 FCFA/mois de revenus passifs. Si 5 de vos filleuls ont eux-mêmes des filleuls (N3) : +30 000 FCFA supplem. Soit 150 000 FCFA/mois sans compter vos propres ventes."),y,[240,253,244]);
      y += 4;

      y = sub(t("Meilleures pratiques pour votre équipe"),y);
      y = bullet(t("Identifiez vos 3 filleuls les plus actifs et investissez davantage dans leur formation."),y);
      y = bullet(t("Organisez un challenge mensuel dans votre groupe WhatsApp pour stimuler la competition saine."),y);
      y = bullet(t("Partagez regulièrement vos propres succès pour montrer que c'est possible."),y);
      y = bullet(t("Recompensez symboliquement vos meilleurs filleuls (message de felicitations public)."),y);
      y = bullet(t("Faites des bilans trimestriels en visio avec vos filleuls les plus engages."),y);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 13 : GESTION DES PAIEMENTS
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(13); footer();
      y = 22; y = secTitle(t("13. Gestion des paiements et optimisation"),y); y += 3;
      y = body(t("Comprendre le cycle de paiement vous permet d'optimiser votre trésorerie et d'atteindre le seuil de versement plus rapidement. Voici tout ce que vous devez savoir sur les paiements IBIG PARTNERS."),y); y += 5;

      y = sub(t("Cycle complet d'un paiement"),y);
      const cycle = [
        t("Vous réalisez une vente et envoyez le lien/QR code au client."),
        t("Le client effectué son paiement sur la plateformé IBIG."),
        t("La vente passe en statut 'EN ATTENTE'(vérification 24-48h)."),
        t("La vente est 'CONFIRMEE'- votre commission est calculee automatiquement."),
        t("L'équipe IBIG valide les commissions (statut 'VALIDEE')."),
        t("Le virement est effectué sous 7 jours ouvrables (statut 'PAYEE')."),
        t("Vous recevez une notification et l'historique est mis a jour dans 'Paiements'."),
      ];
      cycle.forEach((s,i) => {
        y = checkPage(y,13);
        doc.setFillColor(...GOLD); doc.circle(17,y - 1.5,3.5,"F");
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(DARK[0],DARK[1],DARK[2]); doc.text(String(i + 1),17,y,{ align: "center"});
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(s,W - 36); doc.text(lines,24,y); y += lines.length * 5 + 4;
      });

      y += 3;
      y = sub(t("Conseils pour atteindre le seuil de paiement plus vite"),y);
      y = bullet(t("Cumulez les commissions N1 + N2 + N3 : même de petites ventes filleuls s'additionnent."),y);
      y = bullet(t("Privilégiez les produits a commission elevée (EDUFORM, IMMOTRUST) pour les gros montants."),y);
      y = bullet(t("Activéz les abonnements mensuels : vous touchez des commissions sur 4 mois par vente."),y);
      y = bullet(t("Suivez votre solde en temps reel dans 'Commissions'pour anticiper le versement."),y);
      y += 4;

      y = sub(t("Comment lire votre rélève de commissions"),y);
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Colonne"),t("Signification")]],
        body: [
          [t("Date"),t("Date de confirmation de la vente generatrice")],
          [t("Source"),t("N1 (votre vente), N2 (filleul direct), N3 (filleul de filleul)")],
          [t("Produit"),t("Nom du produit et branche IBIG")],
          [t("Montant vente"),t("Prix payé par le client final")],
          [t("Taux"),t("Pourcentage de commission applique selon votre statut")],
          [t("Commission"),t("Montant net qui vous est du")],
          [t("Statut"),t("En attente / Validee / Payee")],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 6;

      y = sub(t("Informations importantes sur les paiements"),y);
      y = bullet(t("Seuil minimum : 5 000 FCFA (les commissions inferieures s'accumulent)."),y);
      y = bullet(t("Delai de versement : 7 jours ouvrables après validation par l'équipe IBIG."),y);
      y = bullet(t("Frais de transfert international déduits du montant verse (Wave, OM : frais minimes)."),y);
      y = bullet(t("Mise a jour coordonnees bancaires : revalidation partielle KYC requise."),y);
      y = bullet(t("En cas d'ecart constate : contactez support@ibigpartners.com avec votre code affilié."),y);
      y += 4;

      y = infoBox(t("OPTIMISATION FISCALE : En Côte d'Ivoire, les commissions d'affiliation sont assujetties a l'IUTS si elles dépassént un certain seuil annuel. Renseignez-vous aupres d'un comptable local pour votre situation personnelle. IBIG SARL emet des justificatifs de commissions sur demande."),y,[255,251,235]);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 14 : ACADEMIE
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(14); footer();
      y = 22; y = secTitle(t("14. Académie, formation et Coach IA"),y); y += 3;
      y = body(t("L'Académie IBIG est votre espace d'apprentissage intégré. Elle contient des ressources variees pour vous aider a mieux vendre, mieux recruter et mieux comprendre les produits IBIG. Les meilleurs affiliés sont ceux qui se formént continuellement."),y); y += 5;

      y = sub(t("Parcours d'apprentissage recommande pour un nouvel affilié"),y);
      const parcours = [
        [t("Semaine 1"),t("Decouvrir les produits IBIG + Comprendre les commissions N1/N2/N3")],
        [t("Semaine 2"),t("Techniques de vente de base + Script de prospection WhatsApp")],
        [t("Semaine 3"),t("Argumentaire Scolaby détaillé + Preparation d'une démonstration")],
        [t("Semaine 4"),t("Stratégies de recrutement + Gestion de votre premier filleul")],
        [t("Mois 2"),t("Formations avancees sur EDUFORM et IMMOTRUST + Objectifs réseau")],
        [t("Mois 3+"),t("Formations spécifiques par branche + Leadership et gestion d'équipe")],
      ];
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Période"),t("Contenu recommande")]],
        body: parcours,
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 6;

      y = sub(t("Comment utiliser le Coach IA efficacement"),y);
      y = bullet(t("Preparation de rendez-vous : 'Comment présentér IBIG Fleet 360 a un transporteur ?'"),y);
      y = bullet(t("Réponse aux objections : 'Comment répondre si un client dit que c'est trop cher ?'"),y);
      y = bullet(t("Redaction de messages : 'Aide-moi a rediger un message WhatsApp pour prospecter une école.'"),y);
      y = bullet(t("Comprehension produit : 'Quelles sont les diffèrences entre Scolaby et GESCOMXEL ?'"),y);
      y = bullet(t("Calcul commissions : 'Si je vends EDUFORM a 400 000 FCFA, combien je gagne en N1 ?'"),y);
      y += 4;

      y = sub(t("Contenu disponible dans l'Académie"),y);
      const acad = [
        [t("Articles & Guides"),t("Techniques de vente, argumentaires produits, stratégies de recrutement.")],
        [t("Videos"),t("Demonstrations produits, témoignages, formations visuelles pas-a-pas.")],
        [t("PDF téléchargéables"),t("Supports de présentation, fiches produits, scripts de vente prêts a l'emploi.")],
        [t("Ressources visuelles"),t("Visuels prêts a l'emploi pour vos réseaux sociaux et WhatsApp.")],
        [t("Quiz"),t("Evaluations pour valider vos connaissances et debloquer des badges.")],
        [t("Coach IA IBIG"),t("Posez toutes vos questions 24h/24 - réponses instantanees.")],
        [t("Kit Marketing personnalisable"),t("Modeles de posts, textes de prospection et visuels que vous adaptez.")],
      ];
      acad.forEach(([icon,desc]) => {
        y = checkPage(y,14);
        doc.setFillColor(240,245,255); doc.roundedRect(14,y - 3,W - 28,13,2,2,"F");
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE); doc.text(icon as string,18,y + 4);
        doc.setFont("helvetica","normal"); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(desc as string,W - 46); doc.text(lines,62,y + 4); y += 16;
      });

      y += 3;
      y = sub(t("Comment les badges debloquent du contenu"),y);
      y = body(t("Certains modules avances de l'Académie sont réservés aux partenaires ayant obtenu des badges spécifiques. Par exemple, la formation 'Leadership et gestion d'équipe'est accèssible après le badge 'Recruteur'. Cela encourage la progression et garantit que vous avez les bases avant les modules avances."),y);
      y += 3;
      y = infoBox(t("CONSEIL : Consacrez 30 minutes par jour a votre formation IBIG. Les partenaires qui se formént regularièrement enregistrent en moyenne 3x plus de ventes que ceux qui ne suivent aucune formation."),y,[240,253,244]);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 15 : BADGES + SUPPORT
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(15); footer();
      y = 22; y = secTitle(t("15. Badges, récompenses et classement"),y); y += 3;
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Badge"),t("Condition d'obtention"),t("Avantage")]],
        body: [
          [t("Première vente"),t("Realiser votre toute première vente confirmée"),t("Accès module vente avance")],
          [t("Vendeur confirmé"),t("Atteindre 10 ventes confirmées"),t("Kit marketing premium")],
          [t("Champion des ventes"),t("Atteindre 50 ventes confirmées"),t("Formation leadership")],
          [t("Centurion"),t("Atteindre 100 ventes confirmées"),t("Avantages ELITE anticipes")],
          [t("Recruteur"),t("Parrainer votre 1er filleul direct"),t("Accès outils réseau avances")],
          [t("Batisseur d'équipe"),t("Atteindre 10 filleuls directs"),t("Formation gestion équipe")],
          [t("Ambassadeur Silver"),t("Atteindre le statut SILVER"),t("+1% commission permanente")],
          [t("Ambassadeur Gold"),t("Atteindre le statut GOLD"),t("+2% + Chat IBIG")],
          [t("Master Partner"),t("Atteindre le statut MASTER"),t("+3% + Formation avancee")],
          [t("Elite Representant"),t("Atteindre le statut ELITE - le sommet"),t("+5% + Avantages exclusifs")],
        ],
        headStyles: { fillColor: GOLD,textColor: DARK,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 8;

      y = secTitle(t("16. Support et contact"),y); y += 3;
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Canal"),t("Coordonnees"),t("Delai de réponse")]],
        body: [
          [t("Email support"),t("support@ibigpartners.com"),t("24-48h ouvrables")],
          [t("Email general"),t("contact@ibigpartners.com"),t("48-72h ouvrables")],
          [t("WhatsApp"),t("+225 07 78 88 25 92"),t("Heures ouvrables CI")],
          [t("Telephone"),t("+225 27 22 27 60 14"),t("Lun-Ven 8h-17h")],
          [t("Plateformé"),t("ibigpartners.com/espace"),t("Immediat (Coach IA)"),],
          [t("Site groupe"),t("intermark-business.com"),t("Informatif")],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 8;

      y = sub(t("Processus d'escalade du support"),y);
      const escalade = [
        t("Niveau 1 : Consultez d'abord le Coach IA et la FAQ de votre espace partenaire."),
        t("Niveau 2 : Envoyez un email a support@ibigpartners.com avec votre code affilié et une description precise."),
        t("Niveau 3 : Si pas de réponse sous 48h, contactez par WhatsApp en joignant votre email initial."),
        t("Niveau 4 : Pour les litiges de commission, joignez les captures d'écran de votre espace partenaire."),
      ];
      escalade.forEach((s,i) => {
        y = checkPage(y,15);
        doc.setFillColor(...BLUE); doc.circle(17,y - 1.5,3.5,"F");
        doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.setTextColor(...WHITE); doc.text(String(i + 1),17,y,{ align: "center"});
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(s,W - 36); doc.text(lines,24,y); y += lines.length * 5 + 4;
      });

      y += 4;
      y = sub(t("Communaute IBIG PARTNERS"),y);
      y = bullet(t("Groupe WhatsApp officiel : demandez le lien a support@ibigpartners.com après validation KYC."),y);
      y = bullet(t("Page Facebook IBIG PARTNERS : suivez pour les actualités, nouveaux produits et offrès speciales."),y);
      y = bullet(t("Chat interne : disponible dans votre espace pour les partenaires GOLD et au-dessus."),y);
      y = bullet(t("Événements mensuels : webinaires de formation et sessions Q&A avec l'équipe IBIG."),y);

      // ══════════════════════════════════════════════════════════════════════
      // PAGE 16-17 : CONCLUSION + FAQ
      // ══════════════════════════════════════════════════════════════════════
      newPage(); header(16); footer();
      y = 22; y = secTitle(t("17. Conclusion et prochaines étapes"),y); y += 3;
      y = body(t("Vous avez maintenant toutes les cles pour réussir en tant que Partenaire Affilié IBIG PARTNERS. Ce guide couvre l'ensemble du programme, de l'inscription a la gestion avancee de votre réseau. La réussite depend de votre constance et de votre engagement."),y); y += 5;

      y = sub(t("Plan d'action pour vos 30 premiers jours"),y);
      const plan30 = [
        [t("Jour 1-3"),t("Completer votre profil et soumettre votre KYC")],
        [t("Jour 4-7"),t("Suivre les 3 premiers modules de l'Académie")],
        [t("Jour 8-14"),t("Activér vos liens et réaliser votre 1ère prospection (10 contacts minimum)")],
        [t("Jour 15-21"),t("Viser votre 1ère vente et recruter votre 1er filleul")],
        [t("Jour 22-30"),t("Analyser vos resultats et ajuster votre stratégie")],
      ];
      // @ts-ignore
      autoTable(doc,{
        startY: y,
        head: [[t("Période"),t("Objectif")]],
        body: plan30,
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 8.5,textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: 14,right: 14 },styles: { cellPadding: 3 },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 8;

      y = sub(t("FAQ Rapide"),y);
      const faq = [
        [t("L'inscription est-elle payante ?"),t("Non. 100% gratuit, aucun investissement obligatoire.")],
        [t("Quand recois-je mes commissions ?"),t("Sous 7 jours ouvrables après validation par l'équipe IBIG, une fois le KYC approuve.")],
        [t("Puis-je m'inscrire depuis l'etranger ?"),t("Oui. La plateformé est ouverte a toute l'Afrique et a la diaspora mondiale.")],
        [t("Combien de filleuls puis-je recruter ?"),t("Illimite sur 3 niveaux.")],
        [t("Comment signaler un problème ?"),t("Via l'onglet Support de votre espace, ou a support@ibigpartners.com.")],
        [t("Les abonnements genèrent-ils des commissions chaque mois ?"),t("Oui, sur 4 mois avec un taux dégressif (100%, 75%, 50%, 25%).")],
        [t("Puis-je vendre plusieurs branches en même temps ?"),t("Oui, vous pouvez activér des liens pour toutes les branches simultanement.")],
      ];
      faq.forEach(([q,a]) => {
        y = checkPage(y,16);
        doc.setFillColor(239,246,255); doc.roundedRect(14,y,W - 28,4,1,1,"F");
        doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...BLUE); doc.text(t("Q :") + q,17,y + 3);
        y += 8;
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(t("R :") + a,W - 32); doc.text(lines,17,y); y += lines.length * 5 + 5;
      });

      // Pied de page final
      y = checkPage(y + 5,16);
      doc.setFillColor(...DARK); doc.roundedRect(14,y,W - 28,25,2,2,"F");
      doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.setTextColor(...GOLD);
      doc.text(t("Votre succès est notre succès."),W / 2,y + 10,{ align: "center"});
      doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(...WHITE);
      doc.text(t("Bienvenue dans la famille IBIG PARTNERS !"),W / 2,y + 18,{ align: "center"});
      doc.setFontSize(7.5); doc.setTextColor(180,200,255);
      doc.text(t("ibigpartners.com +225 07 78 88 25 92 contact@ibigpartners.com"),W / 2,y + 24,{ align: "center"});

      doc.save("IBIG_PARTNERS_Guide_Affilié_2026.pdf");
    } catch (err) {
      console.error(err);
      alert(t("Erreur PDF. Consultez la console."));
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-100">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 px-8 py-10 text-center">
          <p className="text-xs font-bold tracking-widest text-blue-300 uppercase mb-2">IBIG SARL — Programme Officiel</p>
          <h1 className="text-3xl font-extrabold text-white">IBIG PARTNERS</h1>
          <p className="text-yellow-400 font-bold text-lg mt-1">Guide du Partenaire Affilié</p>
          <p className="text-blue-200 text-sm mt-3">Version 1.0 — Juin 2026 — 17 pages — Format A4</p>
        </div>
        <div className="bg-white px-8 py-6 space-y-5">
          <p className="text-slate-600 text-sm leading-relaxed">
            Votre guide complet pour maîtriser la plateforme IBIG PARTNERS et maximiser vos revenus d&apos;affiliation. Prospection,commissions,réseau,outils,formations — tout est couvert.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
            {[
              "Inscription & activation","Navigation espace partenaire",
              "Commissions N1/N2/N3","Techniques de prospection",
              "Stratégies réseau","Tous les produits IBIG",
              "KYC & paiements","Outils professionnels",
              "Académie & Coach IA","Badges & classement",
            ].map(i => <div key={i}>{i}</div>)}
          </div>
          <button
            onClick={generatePDF}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-base font-bold text-white hover:from-blue-700 hover:to-blue-900 disabled:opacity-60 transition-all shadow-lg"
          >
            {loading ? "Génération en cours...": "Télécharger mon Guide Affilié (PDF)"}
          </button>
          <p className="text-center text-xs text-slate-400">
            Document officiel IBIG PARTNERS — INTERMARK BUSINESS INTERNATIONAL GROUP SARL
          </p>
        </div>
      </div>
    </div>
  );
}
