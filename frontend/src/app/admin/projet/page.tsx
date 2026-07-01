"use client";

import { useState } from "react";

const TOTAL_PAGES = 25;

export default function ProjetPage() {
  const [loading,setLoading] = useState(false);

  // Outside try so catch can access it
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

      const W = 210;
      const H = 297;
      const BLUE = [11,95,255] as [number,number,number];
      const DARK = [15,23,41] as [number,number,number];
      const GOLD = [245,158,11] as [number,number,number];
      const GRAY = [100,116,139] as [number,number,number];
      const LIGHT = [241,245,249] as [number,number,number];
      const WHITE = [255,255,255] as [number,number,number];
      const GREEN = [16,185,129] as [number,number,number];

      let pageNum = 0;

      function newPage() { doc.addPage(); pageNum++; }

      function header(n: number,total: number) {
        doc.setFillColor(...BLUE);
        doc.rect(0,0,W,12,"F");
        doc.setFontSize(8);
        doc.setTextColor(...WHITE);
        doc.setFont("helvetica","normal");
        doc.text(t("IBIG PARTNERS - Document de Présentation du Projet"),14,8);
        doc.text(`Page ${n} / ${total}`,W - 14,8,{ align: "right"});
      }

      function footer() {
        doc.setFillColor(...DARK);
        doc.rect(0,H - 10,W,10,"F");
        doc.setFontSize(7);
        doc.setTextColor(...GOLD);
        doc.text(t("2026 IBIG SARL - INTERMARK BUSINESS INTERNATIONAL GROUP SARL - ibigpartners.com"),W / 2,H - 4,{ align: "center"});
      }

      function sectionTitle(text: string,y: number): number {
        doc.setFillColor(...BLUE);
        doc.roundedRect(14,y - 6,W - 28,11,2,2,"F");
        doc.setFontSize(12);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...WHITE);
        doc.text(t(text),20,y + 1);
        return y + 14;
      }

      function subTitle(text: string,y: number): number {
        doc.setFontSize(10);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text(t(text),14,y);
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(0.3);
        doc.line(14,y + 1.5,W - 14,y + 1.5);
        return y + 8;
      }

      function body(text: string,y: number,x = 14): number {
        doc.setFontSize(9);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(t(text),W - x - 14);
        doc.text(lines,x,y);
        return y + lines.length * 5 + 2;
      }

      function bullet(text: string,y: number): number {
        doc.setFontSize(9);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        doc.setFillColor(...GOLD);
        doc.circle(18,y - 1.5,1,"F");
        const lines = doc.splitTextToSize(t(text),W - 30);
        doc.text(lines,22,y);
        return y + lines.length * 5 + 1;
      }

      function infoBox(text: string,y: number,bg: [number,number,number] = [239,246,255]): number {
        const lines = doc.splitTextToSize(t(text),W - 34);
        const h = lines.length * 5 + 10;
        doc.setFillColor(...bg);
        doc.roundedRect(14,y,W - 28,h,2,2,"F");
        doc.setFontSize(9);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        doc.text(lines,20,y + 7);
        return y + h + 5;
      }

      function checkPage(y: number,needed = 30): number {
        if (y > 260) {
          newPage();
          header(pageNum,TOTAL_PAGES);
          footer();
          return 22;
        }
        return y;
      }

      // ═══════════════════════════════════════════════════════════
      // PAGE 1 — COUVERTURE
      // ═══════════════════════════════════════════════════════════
      pageNum = 1;
      doc.setFillColor(...DARK);
      doc.rect(0,0,W,H,"F");

      doc.setFillColor(...BLUE);
      doc.rect(0,75,W,140,"F");

      doc.setFillColor(...GOLD);
      doc.rect(0,75,W,3,"F");
      doc.rect(0,212,W,3,"F");

      doc.setFontSize(36);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...WHITE);
      doc.text("IBIG PARTNERS",W / 2,108,{ align: "center"});

      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.5);
      doc.line(30,115,W - 30,115);

      doc.setFontSize(13);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...GOLD);
      doc.text(t("DOCUMENT DE PRÉSENTATION DU PROJET"),W / 2,127,{ align: "center"});

      doc.setFontSize(10);
      doc.setFont("helvetica","normal");
      doc.setTextColor(200,220,255);
      doc.text(t("PROGRAMME D'AFFILIATION PANAFRICAIN MULTI-NIVEAUX"),W / 2,140,{ align: "center"});

      doc.setFontSize(9);
      doc.setTextColor(...WHITE);
      doc.text(t("INTERMARK BUSINESS INTERNATIONAL GROUP SARL"),W / 2,152,{ align: "center"});

      doc.setLineWidth(0.3);
      doc.setDrawColor(...GOLD);
      doc.line(50,160,W - 50,160);

      doc.setFontSize(8);
      doc.setTextColor(...GOLD);
      doc.text(t("Version 1.0 - Juin 2026 - DOCUMENT CONFIDENTIEL"),W / 2,170,{ align: "center"});

      doc.setFontSize(7);
      doc.setTextColor(150,170,210);
      doc.text("ibigpartners.com",W / 2,H - 30,{ align: "center"});
      doc.text("contact@ibigpartners.com | +225 27 22 27 60 14",W / 2,H - 23,{ align: "center"});
      doc.text(t("Cocody Riviera Palmeraie, Abidjan, Côte d'Ivoire"),W / 2,H - 16,{ align: "center"});

      // ═══════════════════════════════════════════════════════════
      // PAGE 2 — SOMMAIRE
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();

      doc.setFillColor(...LIGHT);
      doc.rect(0,12,W,28,"F");
      doc.setFontSize(18);
      doc.setFont("helvetica","bold");
      doc.setTextColor(...DARK);
      doc.text(t("Sommaire"),14,30);
      doc.setFillColor(...GOLD);
      doc.rect(14,35,30,2,"F");

      const toc = [
        ["1.",t("Résumé Exécutif"),"3"],
        ["2.",t("Présentation du Groupe IBIG SARL"),"5"],
        ["3.",t("Vision, Mission et Valeurs"),"5"],
        ["4.",t("Historique et Positionnement"),"6"],
        ["5.",t("IBIG SOFT - Logiciels SaaS de Gestion"),"7"],
        ["6.",t("IBIG EDUFORM - Formations Professionnelles Certifiantes"),"7"],
        ["7.",t("IBIG IMMO TRUST - Immobilier et BTP"),"8"],
        ["8.",t("IBIG MARKET - Commerce et Distribution"),"8"],
        ["9.",t("IBIG DIGITAL KITS - Technologies et Transformation Numérique"),"9"],
        ["10.",t("IBIG CONSEIL+ - Structuration, Comptabilité et Juridique"),"9"],
        ["11.",t("IBIG MULTISERVICES - Solutions Polyvalentes"),"10"],
        ["10.",t("Système de Commissions N1/N2/N3"),"10"],
        ["11.",t("Dégressivité commissions IBIG SOFT mensuel"),"11"],
        ["12.",t("Simulation de revenus passifs"),"11"],
        ["13.",t("Statuts Partenaires et Avantages"),"12"],
        ["14.",t("Gamification et Badges"),"12"],
        ["15.",t("Plateforme Technologique - Stack et Modules"),"13"],
        ["16.",t("Sécurité, Conformité et Performance"),"14"],
        ["17.",t("Processus d'Affiliation"),"15"],
        ["18.",t("Méthodes de Paiement"),"16"],
        ["19.",t("Académie IBIG - Formation Intégrée"),"17"],
        ["20.",t("Coach IA IBIG"),"18"],
        ["21.",t("Stratégie de Développement 2026-2028"),"19"],
        ["22.",t("Avantages Concurrentiels"),"20"],
        ["23.",t("Comparaison avec les alternatives du marché"),"20"],
        ["24.",t("Cadre Juridique et Conformité"),"21"],
        ["25.",t("Organisation et Gouvernance"),"22"],
        ["26.",t("Questions Fréquemment Posées (FAQ)"),"24"],
        ["27.",t("Contacts et Opportunités de Partenariat"),"25"],
        ["28.",t("Conclusion"),"25"],
      ];

      let y = 48;
      toc.forEach(([num,title,page],i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248,250,252);
          doc.rect(14,y - 5,W - 28,8,"F");
        }
        doc.setFontSize(9);
        doc.setFont("helvetica","bold");
        doc.setTextColor(...BLUE);
        doc.text(num,16,y);
        doc.setFont("helvetica","normal");
        doc.setTextColor(...DARK);
        doc.text(title,28,y);
        doc.setTextColor(...GRAY);
        doc.text(t(`p. ${page}`),W - 16,y,{ align: "right"});
        y += 8;
      });

      // ═══════════════════════════════════════════════════════════
      // PAGE 3-4 — RESUME EXECUTIF
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();
      y = 22;
      y = sectionTitle(t("Résumé Exécutif"),y);

      y = body(t("IBIG PARTNERS est le programme officiel d'affiliation multi-niveaux du groupe INTERMARK BUSINESS INTERNATIONAL GROUP SARL (IBIG SARL), société de droit ivoirien spécialisée dans la fourniture de solutions technologiques, educatives, immobilières, commerciales et de conseil stratégique en Afrique subsaharienne."),y);
      y += 3;
      y = body(t("Le programme permet a toute personne physique ou morale de devenir Partenaire Affilié et de percevoir des commissions sur les ventes de produits et services IBIG qu'elle généré directement (N1) ou via son réseau de filleuls (N2, N3). Aucun investissement initial n'est requis pour rejoindre le programme."),y);
      y += 3;
      y = body(t("Chiffres clés : 5 branches d'activité, 30+ produits au catalogue, commissions jusqu'à 20% N1, système 3 niveaux de profondeur, statuts évolutifs de STARTER a ELITE, paiements via 10+ méthodes panafricaines."),y);
      y += 3;
      y = body(t("Objectif 2026 : 500 partenaires actifs, 50M FCFA de commissions versées, couverture Afrique de l'Ouest."),y);
      y += 5;

      y = checkPage(y,80);
      y = subTitle(t("Indicateurs clés de performance - Projections"),y);

      autoTable(doc,{
        startY: y,
        head: [[t("Indicateur"),t("2026"),t("2027"),t("2028")]],
        body: [
          [t("Partenaires actifs"),"500","2 000","8 000"],
          [t("CA généré réseau"),"250M FCFA","1 Md FCFA","4 Mds FCFA"],
          [t("Commissions versées"),"50M FCFA","200M FCFA","800M FCFA"],
          [t("Pays couverts"),"1 (CI)","6","15"],
          [t("Branches activées"),"5","5","7"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 9,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      y = checkPage(y,60);
      y = subTitle(t("Proposition de valeur unique"),y);
      y = bullet(t("Zéro investissement requis : inscription 100% gratuite, aucun stock a acheter"),y);
      y = bullet(t("Commissions sur 3 niveaux de profondeur (N1, N2, N3)"),y);
      y = bullet(t("5 branches d'activité : technologie, formation, immobilier, commerce, conseil"),y);
      y = bullet(t("Revenus récurrents sur abonnements logiciels mensuels"),y);
      y = bullet(t("Académie IBIG intégrée + Coach IA 24h/24 pour maximiser les performances"),y);
      y = bullet(t("12 méthodes de paiement dont mobile money panafricain"),y);
      y = bullet(t("Statuts évolutifs STARTER > SILVER > GOLD > MASTER > ELITE avec bonus"),y);
      y += 5;

      y = checkPage(y,30);
      y = infoBox(t("IBIG PARTNERS n'est pas un schéma pyramidal. Chaque commission est directement liée à la vente d'un produit ou service reel. Le programme est conformé au droit OHADA et au code de commerce ivoirien."),y,[235,255,245]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 5-6 — PRESENTATION DU GROUPE IBIG SARL
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();
      y = 22;
      y = sectionTitle(t("Présentation du Groupe IBIG SARL"),y);

      autoTable(doc,{
        startY: y,
        body: [
          [t("Nom légal"),t("INTERMARK BUSINESS INTERNATIONAL GROUP SARL")],
          [t("Forme juridique"),t("Société a Responsabilité Limitée (SARL) de droit ivoirien")],
          [t("Siege social"),t("Cocody Riviera Palmeraie, Abidjan, Côte d'Ivoire")],
          [t("Secteurs d'activité"),t("Technologies, Formation, Immobilier, Commerce, Conseil")],
          [t("Site groupe"),"intermark-business.com"],
          [t("Plateforme affiliés"),"ibigpartners.com"],
          [t("Email"),"contact@ibigpartners.com"],
          [t("Téléphone"),"+225 27 22 27 60 14"],
        ],
        columnStyles: {
          0: { fontStyle: "bold",fillColor: LIGHT,textColor: BLUE,cellWidth: 55 },
          1: { textColor: DARK },
        },
        bodyStyles: { fontSize: 9 },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      y = checkPage(y,40);
      y = subTitle(t("Vision"),y);
      y = body(t("Devenir le leader africain des solutions intégrées pour les entreprises et les particuliers, en combinant technologie, formation, immobilier et services de conseil pour accélérer le développement économique du continent."),y);
      y += 4;

      y = checkPage(y,40);
      y = subTitle(t("Mission"),y);
      y = body(t("Fournir à chaque client africain, qu'il soit entrepreneur, PME, institution ou particulier, des outils de gestion modernes, des formations certifiantes, des solutions immobilières fiables et un accompagnement stratégique de qualité internationale, au juste prix."),y);
      y += 4;

      y = checkPage(y,60);
      y = subTitle(t("Valeurs fondamentales"),y);
      y = bullet(t("Excellence : Qualité internationale dans chaque produit et service"),y);
      y = bullet(t("Proximité : Comprendre et répondre aux réalités africaines"),y);
      y = bullet(t("Innovation : Technologies de pointe adaptées aux marchés émergents"),y);
      y = bullet(t("Intégrité : Transparence totale dans les commissions et les operations"),y);
      y = bullet(t("Inclusion : Programme ouvert à tous, sans discrimination ni investissement requis"),y);
      y += 4;

      y = checkPage(y,50);
      y = subTitle(t("Historique et positionnement"),y);
      y = body(t("IBIG SARL est née de la volonté de ses fondateurs de créer un écosystème de solutions africaines pour les africains. Face à la fragmentation du marché (multiples prestataires spécialisés, prix élevés, peu d'adaptation locale), IBIG SARL a construit un modèle intégré couvrant les besoins essentiels des entreprises et des particuliers en croissance."),y);
      y += 3;
      y = body(t("Le programme IBIG PARTNERS prolonge naturellement cette vision en transformant les clients satisfaits et les professionnels connectés en ambassadeurs rémunérés, créant ainsi un réseau de distribution organique et panafricain."),y);

      // ═══════════════════════════════════════════════════════════
      // PAGE 7-9 — LES 5 BRANCHES DU GROUPE
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();
      y = 22;
      y = sectionTitle(t("Les 5 Branches du Groupe IBIG"),y);

      // --- IBIG SOFT ---
      y = subTitle(t("IBIG SOFT - Logiciels SaaS de Gestion"),y);
      y = body(t("Division technologique d'IBIG SARL, IBIG SOFT développe et distribue des logiciels SaaS (Software as a Service) de gestion sur abonnement mensuel ou annuel. Les solutions couvrent la gestion scolaire, la flotte de véhicules, le commerce, la livraison, la gestion immobilière et la gestion des stocks."),y);
      y += 3;

      autoTable(doc,{
        startY: y,
        head: [[t("Logiciel"),t("Prix/mois"),t("Prix/an"),t("Cible")],],
        body: [
          [t("Scolaby"),"30 000 FCFA","300 000 FCFA",t("Écoles, lycées, universités")],
          [t("IBIG Fleet 360"),"45 000 FCFA","450 000 FCFA",t("Transporteurs, flottes entreprises")],
          [t("GESCOMXEL"),"20 000 FCFA","200 000 FCFA",t("PME, commerçants, distributeurs")],
          [t("Zelivry"),"25 000 FCFA","250 000 FCFA",t("Sociétés de livraison, coursiers")],
          [t("Lokativo"),"35 000 FCFA","350 000 FCFA",t("Agences immobilières, bailleurs")],
          [t("StockFlow ERP"),"40 000 FCFA","400 000 FCFA",t("Industries, grandes surfaces")],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 3;
      y = body(t("Commissions : N1=20%, N2=10%, N3=5% (mensuel, dégressif sur 4 mois) | N1=20%, N2=8%, N3=3% (annuel, one-shot)"),y);
      y += 2;
      y = infoBox(t("Particularité IBIG SOFT : pour les abonnements mensuels, la commission est versée sur 4 mois consécutifs avec dégressivité (100% M1, 75% M2, 50% M3, 25% M4). Cette structure récompense la fidélisation client."),y);

      y = checkPage(y,80);
      // --- IBIG EDUFORM ---
      y = subTitle(t("IBIG EDUFORM - Formations Professionnelles Certifiantes"),y);
      y = body(t("Organisme de formation professionnelle certifiant, IBIG EDUFORM propose des parcours intensifs dans les domaines de la comptabilité, des ressources humaines, de la qualité, de la logistique, des ERP et des nouvelles technologies."),y);
      y += 3;

      autoTable(doc,{
        startY: y,
        head: [[t("Formation"),t("Duree"),t("Prix"),t("Certification")]],
        body: [
          [t("Comptabilité et Finance 4 en 1"),"3 mois","400 000 FCFA",t("Attestation IBIG")],
          [t("DAF Dirigeant"),"3 mois","425 000 FCFA",t("Attestation IBIG")],
          [t("Expert RH 3 en 1"),"3 mois","450 000 FCFA",t("Attestation IBIG")],
          [t("QHSE Expert"),"2 mois","350 000 FCFA",t("Attestation IBIG")],
          [t("Logistique et Supply Chain"),"3 mois","450 000 FCFA",t("Attestation IBIG")],
          [t("Sage 100 Comptabilité"),"1 mois","22 500 FCFA",t("Attestation IBIG")],
          [t("Power BI Avancé"),"3 semaines","25 000 FCFA",t("Attestation IBIG")],
          [t("SAP FI (Finance)"),"6 semaines","35 000 FCFA",t("Attestation IBIG")],
          [t("Intelligence Artificielle Pro"),"4 semaines","30 000 FCFA",t("Attestation IBIG")],
          [t("Canva Pro Design"),"2 semaines","15 000 FCFA",t("Attestation IBIG")],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 3;
      y = body(t("Commissions : N1=10%, N2=5%, N3=2% par inscription validee"),y);
      y += 4;

      y = checkPage(y,70);
      // --- IBIG IMMO TRUST ---
      y = subTitle(t("IBIG IMMO TRUST - Immobilier et BTP"),y);
      y = body(t("Division spécialisée dans les transactions immobilières, la gestion locative, la construction et la rénovation au profit des particuliers et des entreprises en Afrique de l'Ouest. Service diaspora inclus pour les Africains de l'étranger."),y);
      y += 3;

      autoTable(doc,{
        startY: y,
        head: [[t("Service"),t("Base de commission"),t("N1"),t("N2"),t("N3")]],
        body: [
          [t("Achat/Vente Immobilière"),t("Prix de vente"),"5%","2.5%","1%"],
          [t("Gestion Locative Garantie"),t("Loyers annuels"),"5%","2.5%","1%"],
          [t("Construction Clé en Main"),t("Budget construction"),"5%","2.5%","1%"],
          [t("Rénovation et Réhabilitation"),t("Budget travaux"),"5%","2.5%","1%"],
          [t("Service Diaspora"),t("Valeur projet"),"5%","2.5%","1%"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 3;
      y = body(t("Cibles : particuliers investisseurs, entrepreneurs, diaspora africaine, institutions"),y);
      y += 4;

      y = checkPage(y,70);
      // --- IBIG MARKET ---
      y = subTitle(t("IBIG MARKET - Commerce et Distribution"),y);
      y = body(t("Plateforme de commerce B2B et B2C proposant du matériel informatique, du mobilier professionnel, des fournitures de bureau et du matériel BTP. IBIG Market est le guichet unique d'approvisionnement des PME africaines."),y);
      y += 3;

      autoTable(doc,{
        startY: y,
        head: [[t("Categorie"),t("Exemples produits"),t("Gamme prix")]],
        body: [
          [t("Matériel informatique"),t("Ordinateurs, imprimantes, accessoires"),"50 000 - 2 000 000 FCFA"],
          [t("Mobilier professionnel"),t("Bureaux, chaises, cloisons"),"25 000 - 5 000 000 FCFA"],
          [t("Fournitures de bureau"),t("Papeterie, consommables, archives"),"5 000 - 500 000 FCFA"],
          [t("Matériel BTP"),t("Outils, matériaux, équipements"),"10 000 - 10 000 000 FCFA"],
          [t("Équipement multimedia"),t("Écrans, projecteurs, systèmes son"),"100 000 - 3 000 000 FCFA"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 3;
      y = body(t("Commissions : N1=8%, N2=4%, N3=2% par commande confirmée"),y);
      y += 4;

      y = checkPage(y,70);
      // --- INTERMARK BUSINESS ---
      y = subTitle(t("INTERMARK BUSINESS - Conseil et Ingénierie de Projets"),y);
      y = body(t("Cabinet de conseil en stratégie, ingénierie financière, développement commercial et digitalisation. Accompagne les PME, ETI et institutions dans leur structuration, croissance et transformation digitale."),y);
      y += 3;

      autoTable(doc,{
        startY: y,
        head: [[t("Service"),t("Description"),t("Tarif indicatif")]],
        body: [
          [t("Diagnostic Stratégique"),t("Audit complet + recommandations"),"500 000 - 2 000 000 FCFA"],
          [t("Ingénierie Financière"),t("Levée de fonds, business plan, credit"),"1 000 000 - 5 000 000 FCFA"],
          [t("Digitalisation ERP"),t("Déploiement logiciels, formation équipes"),"500 000 - 10 000 000 FCFA"],
          [t("Developpement Commercial"),t("Prospection, partenariats, contrats"),t("Commission sur CA généré")],
          [t("Accompagnement RH"),t("Recrutement, manuel, processus"),"300 000 - 1 500 000 FCFA"],
          [t("Conformité et Audit"),t("OHADA, fiscalité, procédures internes"),"500 000 - 3 000 000 FCFA"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 3;
      y = body(t("Commissions : N1=8%, N2=4%, N3=2% sur le montant de la mission"),y);

      // ═══════════════════════════════════════════════════════════
      // PAGE 10-11 — SYSTEME DE COMMISSIONS DETAILLE
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();
      y = 22;
      y = sectionTitle(t("Système de Commissions - Architecture N1/N2/N3"),y);

      y = subTitle(t("Principe fondamental"),y);
      y = body(t("Le programme IBIG PARTNERS repose sur un système de commissions à 3 niveaux de profondeur. Lorsqu'un Partenaire (niveau N1) réalisé directement une vente, il perçoit une commission de niveau N1. Lorsqu'un de ses filleuls directs (niveau N2) réalisé une vente, le partenaire filleul perçoit sa commission N1, et le partenaire parrain perçoit une commission N2. De même, lorsqu'un filleul de filleul (niveau N3) réalisé une vente, le parrain de parrain perçoit une commission N3. Ce système permet de construire un revenu passif croissant en développant un réseau de partenaires actifs."),y);
      y += 5;

      y = checkPage(y,80);
      y = subTitle(t("Tableau synthétique des commissions par branche"),y);

      autoTable(doc,{
        startY: y,
        head: [[t("Branche"),t("Produit"),t("Prix"),t("N1"),t("N2"),t("N3"),t("Gain N1"),t("Gain N2"),t("Gain N3")]],
        body: [
          [t("IBIG SOFT"),t("Scolaby mensuel"),"30 000","20%","10%","5%","6 000","3 000","1 500"],
          [t("IBIG SOFT"),t("Fleet 360 mensuel"),"45 000","20%","10%","5%","9 000","4 500","2 250"],
          [t("IBIG SOFT"),t("Scolaby annuel"),"300 000","20%","8%","3%","60 000","24 000","9 000"],
          [t("IBIG EDUFORM"),t("Comptabilité"),"400 000","10%","5%","2%","40 000","20 000","8 000"],
          [t("IBIG EDUFORM"),t("Expert RH"),"450 000","10%","5%","2%","45 000","22 500","9 000"],
          [t("IBIG IMMO TRUST"),t("Terrain 50M"),"50 000 000","5%","2.5%","1%","2 500 000","1 250 000","500 000"],
          [t("IBIG MARKET"),t("PC portable"),"500 000","8%","4%","2%","40 000","20 000","10 000"],
          [t("IBIG CONSEIL+"),t("Mission conseil"),"2 000 000","10%","5%","2%","200 000","100 000","40 000"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 7 },
        bodyStyles: { fontSize: 7,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
        columnStyles: {
          6: { textColor: [0,140,0] as [number,number,number],fontStyle: "bold"},
          7: { textColor: [0,100,200] as [number,number,number] },
          8: { textColor: [...GRAY] as [number,number,number] },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      y = checkPage(y,70);
      y = subTitle(t("Dégressivité des commissions IBIG SOFT mensuel"),y);
      y = body(t("Pour les abonnements mensuels IBIG SOFT, les commissions sont versées sur 4 mois consecutifs avec une dégressivité progressive récompensant la fidélisation du client."),y);
      y += 3;

      autoTable(doc,{
        startY: y,
        head: [[t("Mois"),t("Taux appliqué"),t("Scolaby N1 (30 000)"),t("Scolaby N2"),t("Scolaby N3")]],
        body: [
          [t("Mois 1"),"100%","6 000 FCFA","3 000 FCFA","1 500 FCFA"],
          [t("Mois 2"),"75%","4 500 FCFA","2 250 FCFA","1 125 FCFA"],
          [t("Mois 3"),"50%","3 000 FCFA","1 500 FCFA","750 FCFA"],
          [t("Mois 4"),"25%","1 500 FCFA","750 FCFA","375 FCFA"],
          [t("TOTAL 4 mois"),"","15 000 FCFA","7 500 FCFA","3 750 FCFA"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 9,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        rowPageBreak: "auto",
        margin: { left: 14,right: 14 },
        theme: "grid",
        didParseCell: (data: any) => {
          if (data.row.index === 4) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [220,240,220];
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      y = checkPage(y,70);
      y = subTitle(t("Simulation de revenus passifs (réseau actif)"),y);

      autoTable(doc,{
        startY: y,
        head: [[t("Scénario"),t("Filleuls N1 actifs"),t("Filleuls N2 actifs"),t("Ventes/mois/filleul"),t("Revenu mensuel total")]],
        body: [
          [t("Débutant"),"5","0","2","60 000 FCFA"],
          [t("Intermédiaire"),"10","20","3","360 000 FCFA"],
          [t("Avancé"),"20","80","4","1 560 000 FCFA"],
          [t("Expert"),"50","250","5","7 500 000 FCFA"],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 9 },
        bodyStyles: { fontSize: 9,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
        columnStyles: {
          4: { fontStyle: "bold",textColor: [0,130,0] as [number,number,number] },
        },
      });
      y = (doc as any).lastAutoTable.finalY + 5;
      y = infoBox(t("Ces projections sont basées sur le produit Scolaby mensuel (30 000 FCFA, N1=20%, N2=10%). Avec des produits de plus haute valeur comme l'immobilier ou le conseil, les revenus peuvent être exponentiellement supérieurs."),y);

      // ═══════════════════════════════════════════════════════════
      // PAGE 12 — STATUTS ET PROGRESSION
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();
      y = 22;
      y = sectionTitle(t("Statuts Partenaires et Avantages"),y);

      autoTable(doc,{
        startY: y,
        head: [[t("Statut"),t("CA requis"),t("Bonus"),t("Avantages exclusifs"),t("Support")]],
        body: [
          [t("STARTER"),"0 FCFA",t("Taux de base"),t("Accès plateforme, liens, kit marketing"),"Email/WhatsApp"],
          [t("SILVER"),"500 000 FCFA","+1% sur tout",t("Statistiques avancées, objectifs"),t("Prioritaire")],
          [t("GOLD"),"2 000 000 FCFA","+2% sur tout",t("Chat GOLD+, badge Gold, visibilite"),t("Dédié")],
          [t("MASTER"),"5 000 000 FCFA","+3% sur tout",t("Webinaires exclusifs, co-branding IBIG"),t("Manager attitré")],
          [t("ELITE"),"15 000 000 FCFA","+5% sur tout",t("Événements VIP, partenariat stratégique"),t("Directeur commercial")],
        ],
        headStyles: { fillColor: DARK,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
        didParseCell: (data: any) => {
          if (data.column.index === 0) {
            const colors: Record<string,[number,number,number]> = {
              "STARTER": [100,116,139],
              "SILVER": [148,163,184],
              "GOLD": [245,158,11],
              "MASTER": [59,130,246],
              "ELITE": [139,92,246],
            };
            const val = data.cell.raw as string;
            if (colors[val]) {
              data.cell.styles.fillColor = colors[val];
              data.cell.styles.textColor = [255,255,255];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      y = checkPage(y,60);
      y = subTitle(t("Badges et gamification"),y);
      y = body(t("IBIG PARTNERS intègre un système de gamification complet pour motiver et fideliser les partenaires affiliés. Des badges sont attribués automatiquement lors d'événements clés : première vente, premier filleul recruté, 10 ventes, 50 ventes, premier paiement reçu, premier mois avec plus de 1M FCFA de CA, etc."),y);
      y += 3;
      y = bullet(t("Badge 'Première Vente': decerne des la 1ère vente confirmée"),y);
      y = bullet(t("Badge 'Recruteur Bronze': 1er filleul direct actif"),y);
      y = bullet(t("Badge 'Recruteur Argent': 10 filleuls directs actifs"),y);
      y = bullet(t("Badge 'Top Performer': top 10 des ventes du mois"),y);
      y = bullet(t("Badge 'Multi-Branches': ventes sur au moins 3 branches différentes"),y);
      y = bullet(t("Badge 'Millionnaire IBIG': 1 000 000 FCFA cumulés de commissions"),y);
      y += 3;
      y = infoBox(t("Les badges sont visibles sur le profil public du partenaire et dans les classements. Ils servent d'indicateurs de crédibilité pour recruter de nouveaux filleuls et convaincre des prospects."),y,[255,250,235]);

      // ═══════════════════════════════════════════════════════════
      // PAGE 13-14 — PLATEFORME TECHNOLOGIQUE
      // ═══════════════════════════════════════════════════════════
      newPage();
      header(pageNum,TOTAL_PAGES);
      footer();
      y = 22;
      y = sectionTitle(t("Plateforme IBIG PARTNERS - Architecture Technologique"),y);

      y = subTitle(t("Stack technologique"),y);
      y = bullet(t("Next.js 15 (App Router) - Framework React de dernière génération"),y);
      y = bullet(t("PostgreSQL (Supabase) - Base de données relationnelle managée"),y);
      y = bullet(t("Prisma ORM - Gestion des migrations et des requêtes"),y);
      y = bullet(t("Vercel - Déploiement serverless CDN mondial"),y);
      y = bullet(t("Resend - Emails transactionnels (notifications, validations)"),y);
      y = bullet(t("jsPDF + jspdf-autotable - Génération PDF côté client"),y);
      y = bullet(t("OAuth / JWT sessions - Authentification sécurisée"),y);
      y = bullet(t("API Moneroo - Paiements en ligne intégrés"),y);
      y += 5;

      y = checkPage(y,100);
      y = subTitle(t("Modules de la plateforme"),y);

      autoTable(doc,{
        startY: y,
        head: [[t("Module"),t("Fonctionnalité principale"),t("Utilisateurs")]],
        body: [
          [t("Dashboard temps réel"),t("KPIs, commissions, ventes, alertes"),t("Partenaires")],
          [t("Gestion des liens"),t("Liens uniques, QR codes, tracking 90j"),t("Partenaires")],
          [t("Suivi des commissions"),t("N1/N2/N3 automatique, statuts"),t("Partenaires")],
          [t("Réseau/Parrainage"),t("Arbre visuel 3 niveaux, performances"),t("Partenaires")],
          [t("KYC Verification"),t("Formulaire, validation admin, notifications"),t("Partenaires + Admin")],
          [t("Académie IBIG"),t("Videos, PDF, audio, images, quiz, IA"),t("Partenaires")],
          [t("Coach IA"),t("GPT personnalisé sur produits IBIG"),t("Partenaires")],
          [t("Kit Marketing"),t("Argumentaires, visuels personnalisables"),t("Partenaires")],
          [t("Prospects CRM"),t("Suivi pipeline commercial"),t("Partenaires")],
          [t("Paiements"),t("Multi-méthodes, historique, virements"),t("Partenaires + Admin")],
          [t("Admin SUPERADMIN"),t("Gestion complète, audit, paramètres"),t("Administrateurs")],
          [t("API Moneroo"),t("Paiements en ligne intégrés"),t("Système")],
        ],
        headStyles: { fillColor: BLUE,textColor: WHITE,fontStyle: "bold",fontSize: 8 },
        bodyStyles: { fontSize: 8,textColor: DARK },
        alternateRowStyles: { fillColor: [248,250,252] },
        margin: { left: 14,right: 14 },
        theme: "grid",
      });
      y = (doc as any).lastAutoTable.finalY + 8;

      y = checkPage(y,50);
      y = subTitle(t("Sécurité et conformité"),y);
      y = bullet(t("Sessions JWT chiffrées avec rotation automatique"),y);
      y = bullet(t("HTTPS obligatoire (TLS 1.3) sur toutes les communications"),y);
      y = bullet(t("Audit log de toutes les actions admin (qui, quoi, quand)"),y);
      y = bullet(t("KYC obligatoire avant tout premier paiement de commission"),y);
      y = bullet(t("Conformité OHADA - droit des affaires africain"),y);
      y = bullet(t("Protection des données personnelles - chiffrement AES-256 au repos"),y);
      y += 4;

      y = checkPage(y,40);
      y = subTitle(t("Performance et disponibilité"),y);
      y = bullet(t("Déploiement Vercel avec CDN mondial (Edge Network)"),y);
      y = bullet(t("Uptime cible : 99.9% (SLA Vercel Pro)"),y);
      y = bullet(t("Base de données Supabase PostgreSQL managee avec haute disponibilité"),y);
      y = bullet(t("Sauvegardes automatiques quotidiennes avec retention 7 jours"),y);
      y = bullet(t("Monitoring temps réel des erreurs et performances"),y);

      // ═══════════════════════════════════════════════════════════
      // PAGE 15 — PROCESSUS D'AFFILIATION
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Processus d'Affiliation - De l'Inscription au Premier Paiement"), y);

 y = body(t("Le processus d'affiliation IBIG PARTNERS est simple, digital et transparent. De l'inscription gratuite jusqu'au premier virement de commission, chaque étape est tracée et notifiée en temps réel."), y);
 y += 5;

 autoTable(doc,{
 startY: y,
 head: [[t("Etape"), t("Responsable"), t("Délai"), t("Action requise")]],
 body: [
 ["1", t("Partenaire"), t("Immédiat"), t("Inscription gratuite sur ibigpartners.com/rejoindre")],
 ["2", t("Equipe IBIG"),"24-48h", t("Validation du compte par l'équipe IBIG")],
 ["3", t("Partenaire"), t("Immédiat"), t("Complétion du KYC (identité + coordonnées paiement)")],
 ["4", t("Équipe IBIG"),"24-48h", t("Validation KYC par le responsable vérification")],
 ["5", t("Système"), t("Automatique"), t("Activation des liens d'affiliation par produit")],
 ["6", t("Partenaire"), t("Continu"), t("Partage des liens et prospection clients")],
 ["7", t("Client"), t("Variable"), t("Conversion client (achat produit IBIG via lien)")],
 ["8", t("Equipe IBIG"),"24-72h", t("Confirmation et validation de la vente")],
 ["9", t("Systeme"), t("Automatique"), t("Génération automatique de la commission N1/N2/N3")],
 ["10", t("Admin paiements"),"7 jours", t("Validation de la commission en attente")],
 ["11", t("Equipe IBIG"), t("Sous 48h"), t("Virement de la commission sur compte declare")],
 ["12", t("Systeme"), t("Immédiat"), t("Notification de paiement par email et dashboard")],
 ],
 headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle:"bold", fontSize: 8 },
 bodyStyles: { fontSize: 8, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme:"grid",
 columnStyles: {
 0: { cellWidth: 12, halign:"center", fontStyle:"bold", fillColor: BLUE, textColor: WHITE },
 2: { cellWidth: 22 },
 },
 });
 y = (doc as any).lastAutoTable.finalY + 8;
 y = infoBox(t("Délai total moyen de la premiere commission : 2 à 4 semaines après inscription. Les partenaires proactifs avec un reseau existant peuvent recevoir leur premiere commission en moins d'une semaine."), y,[235, 255, 245]);

 // 
 // PAGE 16 — METHODES DE PAIEMENT
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Méthodes de Paiement - Versement des Commissions"), y);

 autoTable(doc,{
 startY: y,
 head: [[t("Methode"), t("Zone géographique"), t("Délai"), t("Frais"), t("Minimum")]],
 body: [
 [t("Orange Money"), t("CI, Burkina, Mali, Sénégal, Cameroun"), t("Instantané"),"0%","5 000 FCFA"],
 [t("Wave"), t("CI, Sénégal, Burkina, Mali"), t("Instantané"),"0%","5 000 FCFA"],
 [t("MTN MoMo"), t("CI, Ghana, Cameroun, Uganda, Rwanda"),"24h","0%","5 000 FCFA"],
 [t("Moov Money"), t("CI, Togo, Bénin, Niger"),"24h","0%","5 000 FCFA"],
 [t("Airtel Money"), t("Kenya, Tanzania, Zambie, RDC"),"24h","0-1%","5 000 FCFA"],
 [t("M-Pesa"), t("Kenya, Tanzania, Mozambique"),"24h","0-1%","5 000 FCFA"],
 [t("CinetPay"), t("Panafricain (20 pays)"),"48h","1-2%","10 000 FCFA"],
 [t("PayPal"), t("International"),"3-5 jours","3-4%","50 000 FCFA"],
 [t("Virement bancaire IBAN"), t("International"),"5-7 jours", t("Frais SWIFT"),"100 000 FCFA"],
 [t("Western Union"), t("Mondial (200 pays)"),"24h", t("Variable"),"50 000 FCFA"],
 [t("Wise / WorldRemit"), t("Europe, Amériques, Asie"),"1-3 jours","0.5-2%","50 000 FCFA"],
 [t("Juba Express / RIA"), t("Afrique, diaspora"),"24h", t("Variable"),"30 000 FCFA"],
 ],
 headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: "bold", fontSize: 7 },
 bodyStyles: { fontSize: 7, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme: "grid",
 });
 y = (doc as any).lastAutoTable.finalY + 5;
 y = infoBox(t("Seuil minimum de versement : 5 000 FCFA pour les mobile money locaux. Les commissions inférieures au seuil s'accumulént jusqu'à dépasser le minimum. Les frais de transfert internationaux sont à la charge du bénéficiaire."), y);

 // 
 // PAGE 17-18 — ACADÉMIE IBIG
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Académie IBIG - Plateforme de Formation Intégrée"), y);

 y = subTitle(t("Objectif de l'Académie"), y);
 y = body(t("Former les partenaires affiliés pour maximiser leurs performances commerciales. L'Académie IBIG est une bibliothèque de ressources pédagogiques couvrant les produits, les techniques de vente, le recrutement de partenaires et le développement personnel. Elle est accessible 24h/24, 7j/7 directement depuis le dashboard partenaire."), y);
 y += 5;

 y = checkPage(y, 80);
 y = subTitle(t("Types de contenus disponibles"), y);

 autoTable(doc,{
 startY: y,
 head: [[t("Type"), t("Format"), t("Exemples de modules"), t("Accès")]],
 body: [
 [t("Videos"), t("YouTube, Vimeo, MP4"), t("Demo Scolaby, Pitch EDUFORM, Tutoriels"), t("Selon statut")],
 [t("Guides PDF"), t("Documents téléchargeable"), t("Fiches produits, scripts de vente"), t("Selon statut")],
 [t("Articlés"), t("Texte enrichi Markdown"), t("Techniques prospection, gestion objections"),"STARTER+"],
 [t("Podcasts Audio"), t("MP3, streaming"), t("Témoignages partenaires, conseils terrain"),"STARTER+"],
 [t("Infographies"), t("Images haute résolution"), t("Catalogue produits, organigramme commissions"),"STARTER+"],
 [t("Quiz"), t("Évaluation interactive"), t("Test connaissances produits, certification"),"STARTER+"],
 [t("Coach IA"), t("GPT personnalisé IBIG"), t("Préparation entretien, calcul commission"),"STARTER+"],
 [t("Kit Marketing"), t("Templates personnalisables"), t("Arguments WhatsApp, scripts appel"),"STARTER+"],
 ],
 headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
 bodyStyles: { fontSize: 8, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme: "grid",
 });
 y = (doc as any).lastAutoTable.finalY + 8;

 y = checkPage(y, 60);
 y = subTitle(t("Parcours recommandé pour un nouveau partenaire"), y);

 const parcours = [
 t("Semaine 1 : Lire le Guide Affilié + regarder la vidéo de présentation IBIG PARTNERS"),
 t("Semaine 2 : Maîtriser 2 produits prioritaires (Scolaby + EDUFORM Comptabilité)"),
 t("Semaine 3 : Utiliser le Coach IA pour préparer ses 10 premiers argumentaires"),
 t("Semaine 4 : Prospecter 20 contacts, objectif 3 conversions minimum"),
 t("Mois 2 : Recruter ses 3 premiers filleuls directs et les former"),
 t("Mois 3 : Atteindre le statut SILVER (500 000 FCFA CA cumulé)"),
 ];
 parcours.forEach((step, i) => {
 doc.setFillColor(...BLUE);
 doc.circle(18, y - 1.5, 3,"F");
 doc.setFontSize(7);
 doc.setTextColor(...WHITE);
 doc.setFont("helvetica","bold");
 doc.text(`${i + 1}`, 18, y - 0.5,{ align: "center"});
 doc.setFontSize(9);
 doc.setFont("helvetica","normal");
 doc.setTextColor(...DARK);
 const lines = doc.splitTextToSize(step, W - 36);
 doc.text(lines, 25, y);
 y += lines.length * 5 + 3;
 });
 y += 3;

 y = checkPage(y, 50);
 y = subTitle(t("Coach IA IBIG - Intelligence Artificielle Embarquee"), y);
 y = body(t("Le Coach IA IBIG est un assistant conversationnel entraîné spécifiquement sur les produits, commissions et processus d'IBIG PARTNERS. Il répond aux questions des partenaires 24h/24,7j/7,en français et en anglais. Cas d'usage principaux : calcul de commissions, préparation de scripts de vente, simulation de revenus, réponses aux objections clients les plus courantes, conseils de recrutement réseau, et préparation d'argumentaires personnalises par branche et par cible."), y);
 y += 3;
 y = infoBox(t("Le Coach IA est une innovation unique sur le marché de l'affiliation en Afrique. Aucun autre programme d'affiliation ne propose un assistant IA entraine specifiquement sur ses produits et processus. C'est un avantage compétitif majeur d'IBIG PARTNERS."), y,[255, 250, 235]);

 // 
 // PAGE 19 — STRATEGIES DE DEVELOPPEMENT
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Stratégie de Développement 2026-2028"), y);

 y = subTitle(t("Phase 1 : Lancement et consolidation (2026)"), y);
 y = bullet(t("Cible : 500 partenaires actifs en Côte d'Ivoire"), y);
 y = bullet(t("Focus géographique : Abidjan (Plateau, Cocody, Yopougon, Marcory, Treichville)"), y);
 y = bullet(t("Actions : Événements de lancement, formations initiales, publicite digitale (Meta, Google)"), y);
 y = bullet(t("KPI : 50M FCFA commissions versées, 250M FCFA CA réseau généré"), y);
 y += 4;

 y = subTitle(t("Phase 2 : Expansion régionale (2027)"), y);
 y = bullet(t("Cible : 2 000 partenaires en Afrique de l'Ouest"), y);
 y = bullet(t("Nouveaux pays : Burkina Faso,Mali,Sénégal,Ghana,Togo,Bénin"), y);
 y = bullet(t("Actions : Bureaux représentants locaux,partenariats avec chambres de commerce"), y);
 y = bullet(t("KPI : 200M FCFA commissions,1Md FCFA CA reseau"), y);
 y += 4;

 y = subTitle(t("Phase 3 : Leadership panafricain (2028)"), y);
 y = bullet(t("Cible : 8 000 partenaires sur 15 pays africains"), y);
 y = bullet(t("Extension : Afrique Centrale,Afrique de l'Est, Maghreb, diaspora mondiale"), y);
 y = bullet(t("Actions : Franchise IBIG PARTNERS, académie régionale, application mobile"), y);
 y = bullet(t("KPI : 800M FCFA commissions, 4Mds FCFA CA réseau"), y);
 y += 5;

 y = checkPage(y, 60);
 autoTable(doc,{
 startY: y,
 head: [[t("Phase"), t("Annee"), t("Partenaires"), t("Pays"), t("Commissions versées"), t("CA généré")]],
 body: [
 [t("Phase 1"),"2026","500","1 (CI)","50M FCFA","250M FCFA"],
 [t("Phase 2"),"2027","2 000","6","200M FCFA","1 000M FCFA"],
 [t("Phase 3"),"2028","8 000","15","800M FCFA","4 000M FCFA"],
 ],
 headStyles: { fillColor: DARK, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
 bodyStyles: { fontSize: 9, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme: "grid",
 columnStyles: {
 4: { fontStyle: "bold", textColor: [0, 130, 0] as [number, number, number] },
 5: { fontStyle: "bold", textColor: [...BLUE] as [number, number, number] },
 },
 });

 // 
 // PAGE 20 — AVANTAGES CONCURRENTIELS
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Avantages Concurrentiels d'IBIG PARTNERS"), y);

 autoTable(doc,{
 startY: y,
 head: [[t("Avantage"), t("Description"), t("Impact")]],
 body: [
 [t("Modèle intégré"), t("5 branches couvrant besoins essentiels PME/particuliers"), t("Ventes croisees,client captif")],
 [t("Commissions attractives"), t("Jusqu'a 20% N1, système 3 niveaux"), t("ROI partenaire exceptionnel")],
 [t("Plateforme technologique"), t("Dashboard temps réel, tracking automatique"), t("Transparence et confiance")],
 [t("Formation intégrée"), t("Académie + Coach IA 24/7"), t("Autonomie et performance partenaires")],
 [t("Diversité paiements"), t("12 méthodes dont mobile money pan-africain"), t("Accessibilité maximale")],
 [t("Produits SaaS récurrents"), t("Commissions récurrentes sur abonnements mensuels"), t("Revenu passif stable")],
 [t("Ancrage local"), t("Équipe et support bases en Côte d'Ivoire"), t("Reactivite et confiance")],
 [t("Programme gamifié"), t("Badges,statuts,classements,competitions"), t("Engagement et retention")],
 [t("Coach IA personnalise"), t("GPT entraîné specifiquement sur IBIG"), t("Avantage unique sur le marché")],
 [t("Inscription gratuite"), t("Zéro investissement,zero risque"), t("Adoption maximale")],
 ],
 headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle:"bold", fontSize: 8 },
 bodyStyles: { fontSize: 8, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme:"grid",
 columnStyles: {
 0: { fontStyle:"bold", cellWidth: 42 },
 2: { fontStyle:"bold", textColor: [0, 130, 0] as [number, number, number], cellWidth: 45 },
 },
 });
 y = (doc as any).lastAutoTable.finalY + 8;

 y = checkPage(y, 70);
 y = subTitle(t("Comparaison avec les alternatives du marché"), y);

 autoTable(doc,{
 startY: y,
 head: [[t("Critère"), t("IBIG PARTNERS"), t("MLM traditionnels"), t("Affiliation classique"), t("Emploi salarie")]],
 body: [
 [t("Investissement initial"),"0 FCFA","50K-500K FCFA","0 FCFA","0 FCFA"],
 [t("Niveaux commissions"),"3 (N1/N2/N3)","5-10 niveaux","1 niveau","0 niveau"],
 [t("Commissions récurrentes"), t("Oui (SaaS)"), t("Rarement"),"Non", t("Non (fixe)")],
 [t("Risque financier"),"Nul", t("Moyen à élevé"), t("Faible"),"Nul"],
 [t("Plafond de revenus"), t("Illimite"), t("Illimite"), t("Limite"), t("Plafonné")],
 [t("Produits reels"),"Oui (5 branches)", t("Parfois douteux"),"Oui", t("Selon employeur")],
 [t("Formation Intégrée"), t("Oui (Academie IBIG)"), t("Rarement"),"Non", t("Variable")],
 [t("Support dedie"),"Oui", t("Variable"),"Non","RH"],
 ],
 headStyles: { fillColor: DARK, textColor: WHITE, fontStyle:"bold", fontSize: 7 },
 bodyStyles: { fontSize: 7, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme:"grid",
 columnStyles: {
 1: { fontStyle:"bold", textColor: [...BLUE] as [number, number, number] },
 },
 });

 // 
 // PAGE 21 — CADRE JURIDIQUE ET CONFORMITE
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Cadre Juridique et Conformité"), y);

 y = subTitle(t("Statut légal du programme"), y);
 y = body(t("IBIG PARTNERS est un programme d'affiliation commerciale licite, distinct des schémas pyramidaux illégaux. Chaque commission est directement liée à la vente d'un produit ou service reel du catalogue IBIG. Il n'existe aucune obligation d'achat,aucun investissement requis et aucune promesse de gain garantie. Le programme est conforme aux dispositions du droit OHADA et de la législation commerciale ivoirienne."), y);
 y += 5;

 y = subTitle(t("Cadre juridique applicable"), y);
 y = bullet(t("Droit OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires)"), y);
 y = bullet(t("Code de commerce ivoirien"), y);
 y = bullet(t("Loi n° 2013-546 du 30 juillet 2013 relative aux transactions électroniques en Côte d'Ivoire"), y);
 y = bullet(t("Réglementation ARTCI sur les services de communications électroniques"), y);
 y = bullet(t("Conformité UEMOA pour les transactions financières transfrontalières"), y);
 y += 5;

 y = subTitle(t("Protection des partenaires"), y);
 y = bullet(t("Contrat de partenariat signe électroniquement a l'inscription"), y);
 y = bullet(t("Transparence totale sur le calcul des commissions (accessible en temps réel)"), y);
 y = bullet(t("Droit de rétractation sous 14 jours a compter de l'inscription"), y);
 y = bullet(t("Aucune clause de non-concurrence"), y);
 y = bullet(t("Possibilité de résiliation a tout moment sans pénalité ni frais"), y);
 y += 5;

 y = subTitle(t("Protection des données personnelles"), y);
 y = bullet(t("Données chiffrées en transit (HTTPS/TLS 1.3) et au repos (AES-256)"), y);
 y = bullet(t("Accès aux données personnelles limité au strictement nécessaire (principe de minimisation)"), y);
 y = bullet(t("Droit a l'oubli sur demande écrite - suppression sous 30 jours"), y);
 y = bullet(t("Aucune revente de données à des tiers commerciaux"), y);
 y = bullet(t("Audit log de tous les accès administrateurs aux données partenaires"), y);
 y += 5;

 y = checkPage(y, 40);
 y = subTitle(t("KYC et lutte contre le blanchiment"), y);
 y = body(t("La vérification KYC (Know Your Customer) est obligatoire avant tout versement de commission. Elle permet a IBIG SARL de se se conformer aux réglementations anti-blanchiment (AML) et de vérifier l'identité réelle de chaque bénéficiaire. Les pièces fournies sont conservees de maniere securisee et ne sont pas partagées avec des tiers. Les documents requis : pièce d'identité nationale valide (CNI, passeport ou titre de séjour) + justificatif de domicile de moins de 3 mois + coordonnées bancaires ou mobile money pour le virement."), y);

 // 
 // PAGE 22-23 — ORGANISATION ET GOUVERNANCE
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Organisation et Gouvernance du Programme"), y);

 y = subTitle(t("Structure organisationnelle"), y);
 y = body(t("Le programme IBIG PARTNERS est géré par une équipe dédiée au sein d'IBIG SARL,comprenant un Directeur du Programme,des Gestionnaires de Comptes,une équipe technique et un service support multicanal (email,WhatsApp,téléphone). Chaque rôle est clairement défini pour garantir réactivité et qualité de service."), y);
 y += 5;

 autoTable(doc,{
 startY: y,
 head: [[t("Rôle"), t("Responsabilites"), t("Contact")]],
 body: [
 [t("Directeur Programme IBIG PARTNERS"), t("Stratégie, partenariats, décisions majeures"),"direction@ibigpartners.com"],
 [t("Responsable Validations"), t("KYC, approbation comptes,litiges"),"validation@ibigpartners.com"],
 [t("Responsable Paiements"), t("Traitement virements, réconciliation"),"paiements@ibigpartners.com"],
 [t("Support Partenaires"), t("Questions, tickets,WhatsApp"),"support@ibigpartners.com"],
 [t("Équipe Technique"), t("Plateforme, bugs, améliorations"),"tech@ibigpartners.com"],
 [t("Academie IBIG"), t("Contenu, formations,Coach IA"),"academie@ibigpartners.com"],
 ],
 headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle:"bold", fontSize: 8 },
 bodyStyles: { fontSize: 8, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme:"grid",
 });
 y = (doc as any).lastAutoTable.finalY + 8;

 y = checkPage(y, 60);
 y = subTitle(t("Processus de décision"), y);
 y = bullet(t("Validation des inscriptions : équipe validation sous 24-48h ouvrées"), y);
 y = bullet(t("Approbation KYC : responsable validation sous 48h ouvrées"), y);
 y = bullet(t("Validation des commissions : responsable paiements sous 7 jours ouvrés"), y);
 y = bullet(t("Traitement des litiges : direction programme sous 14 jours"), y);
 y = bullet(t("Modifications du programme : direction + juridique + notification 30j aux partenaires actifs"), y);
 y += 5;

 y = subTitle(t("Reporting et transparence"), y);
 y = bullet(t("Dashboard temps réel accessible 24h/24,7j/7 par chaque partenaire"), y);
 y = bullet(t("Rapport mensuel de performance envoyé par email automatique"), y);
 y = bullet(t("Audit annuel indépendant des commissions versées"), y);
 y = bullet(t("Publication des conditions du programme sur ibigpartners.com/conditions"), y);
 y += 5;

 y = checkPage(y, 40);
 y = infoBox(t("La gouvernance d'IBIG PARTNERS repose sur le principe de transparence totale. Chaque partenaire a accès en temps réel a l'historique complet de ses commissions,ventes,et paiements. Aucune commission ne peut être modifiée sans notification au partenaire concerne."), y,[239, 246, 255]);

 // 
 // PAGE 24 — FAQ PROJET
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Questions Fréquemment Posées sur le Projet"), y);

 const faq = [
 {
 q: t("IBIG PARTNERS est-il un schéma pyramidal ?"),
 r: t("Non. IBIG PARTNERS est un programme d'affiliation commerciale légitime. Chaque commission est liée a la vente d'un produit ou service reel. Il n'existe aucune obligation d'investissement ni de recrutement obligatoire. Le programme est conforme au droit OHADA."),
 },
 {
 q: t("Comment est garanti le paiement des commissions ?"),
 r: t("Les commissions sont calculées automatiquement par la plateforme des la confirmation d'une vente. Elles sont validées et versées sous 7 jours ouvrés. Un historique complet est accessible en temps réel. IBIG SARL s'engage contractuellement au versement de toutes les commissions dues."),
 },
 {
 q: t("Peut-on s'inscrire depuis un pays hors Côte d'Ivoire ?"),
 r: t("Oui. IBIG PARTNERS est ouvert à toute l'Afrique subsaharienne et à la diaspora africaine mondiale. Les commissions sont versées via Wave, MTN MoMo, Western Union, virement bancaire, PayPal et d'autres méthodes internationales."),
 },
 {
 q: t("Quel est le potentiel de revenus maximum ?"),
 r: t("Le potentiel est illimite. Un partenaire avec 50 filleuls actifs et 5 ventes/mois sur Scolaby peut generer plus de 7 500 000 FCFA/mois. Les partenaires ELITE avec un grand reseau sur plusieurs branches peuvent gagner des dizaines de millions par mois."),
 },
 {
 q: t("Combien de temps faut-il pour les premieres commissions ?"),
 r: t("Avec de la proactivité,un premier partenaire peut réaliser sa 1ere vente en 3 a 7 jours. La commission est versée sous 7 jours après validation. En pratique,les nouveaux partenaires perçoivent leur premiere commission en 2 a 4 semaines."),
 },
 {
 q: t("Les produits IBIG sont-ils compétitifs sur le marché ?"),
 r: t("Oui. IBIG SOFT propose des logiciels SaaS à des prix nettement inférieurs aux solutions internationales (SAP,Sage international) tout en etant adaptés aux réalités africaines. IBIG EDUFORM propose des formations certifiantes 3 à 5 fois moins chères que les instituts internationaux."),
 },
 {
 q: t("Est-il possible de cumulér les commissions de plusieurs branches ?"),
 r: t("Absolument. Un partenaire peut promouvoir simultanément les 5 branches et cumulér des commissions sur toutes. Un client peut acheter un logiciel IBIG SOFT,s'inscrire en formation EDUFORM et commander du matériel IBIG MARKET - le partenaire perçoit une commission sur chacune de ces transactions."),
 },
 {
 q: t("Comment rejoindre IBIG PARTNERS en tant qu'entreprise ?"),
 r: t("Les entreprises (SARL,SA,SAS,ONG,associations) peuvent s'inscrire en choisissant le type'Entreprise'ou 'ONG'lors de l'inscription. Le KYC entreprise requiert le RCCM,le NIF,et les coordonnées du représentant légal."),
 },
 {
 q: t("Existe-t-il un plafond de commissions mensuel ?"),
 r: t("Non. Il n'existe aucun plafond. Les commissions sont calculées sur la totalité des ventes générées par le partenaire et son réseau, sans limitation mensuelle ni annuelle."),
 },
 {
 q: t("Comment contacter l'équipe IBIG PARTNERS ?"),
 r: t("Email : contact@ibigpartners.com | Support : support@ibigpartners.com | WhatsApp : +225 07 78 88 25 92 | Tel : +225 27 22 27 60 14 | Site : ibigpartners.com"),
 },
 ];

 faq.forEach((item, i) => {
 y = checkPage(y, 30);
 doc.setFillColor(...BLUE);
 doc.roundedRect(14, y - 4, W - 28, 8, 1, 1,"F");
 doc.setFontSize(9);
 doc.setFont("helvetica","bold");
 doc.setTextColor(...WHITE);
 doc.text(`Q${i + 1}. ${item.q}`, 18, y + 1);
 y += 9;
 doc.setFontSize(9);
 doc.setFont("helvetica","normal");
 doc.setTextColor(...DARK);
 const lines = doc.splitTextToSize(item.r, W - 32);
 doc.text(lines, 18, y);
 y += lines.length * 5 + 5;
 });

 // 
 // PAGE 25 — CONTACTS ET CONCLUSION
 // 
 newPage();
 header(pageNum, TOTAL_PAGES);
 footer();
 y = 22;
 y = sectionTitle(t("Contacts et Opportunités de Partenariat"), y);

 y = subTitle(t("Nous rejoindre comme partenaire affilie"), y);
 y = body(t("Inscription gratuite sur ibigpartners.com/rejoindre. Code d'affiliation généré instantanément. Activation du compte sous 24-48h. Premier lien d'affiliation disponible des la validation du compte. Aucun investissement,aucun engagement,aucun risque financier."), y);
 y += 4;

 y = subTitle(t("Partenariats institutionnels"), y);
 y = body(t("IBIG SARL est ouvert aux partenariats avec des institutions,organismes de formation,chambres de commerce,associations professionnelles et réseaux d'entrepreneurs souhaitant proposer les solutions IBIG à leurs membres ou adhérents."), y);
 y = body(t("Contact : partenariats@ibigpartners.com"), y);
 y += 4;

 y = subTitle(t("Partenariats B2B (resellers et intégrateurs)"), y);
 y = body(t("Pour les entreprises de conseil, ESN (Entreprises de Services Numeriques), agences de communication et cabinets RH souhaitant intégrer les solutions IBIG a leur offre de services, des conditions préférentielles sont disponibles."), y);
 y = body(t("Contact : b2b@ibigpartners.com"), y);
 y += 4;

 y = subTitle(t("Investisseurs et financement"), y);
 y = body(t("IBIG SARL étudie les opportunités de financement pour accélérer le développement du programme IBIG PARTNERS. Pour toute discussion sur un investissement en equity ou dette, contactez la direction."), y);
 y = body(t("Contact : direction@ibigpartners.com"), y);
 y += 5;

 y = checkPage(y, 60);
 autoTable(doc,{
 startY: y,
 head: [[t("Canal"), t("Coordonnées"), t("Usage")]],
 body: [
 [t("Site officiel"),"ibigpartners.com", t("Inscription, espace partenaire")],
 [t("Site groupe"),"intermark-business.com", t("Présentation IBIG SARL")],
 [t("Email general"),"contact@ibigpartners.com", t("Informations, demandes")],
 [t("Email support"),"support@ibigpartners.com", t("Aide technique, litiges")],
 [t("WhatsApp"),"+225 07 78 88 25 92", t("Support rapide, questions")],
 [t("Tel direct"),"+225 27 22 27 60 14", t("Appels professionnels")],
 [t("Siege social"), t("Cocody Riviera Palmeraie, Abidjan"), t("Visites sur RDV")],
 ],
 headStyles: { fillColor: BLUE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
 bodyStyles: { fontSize: 9, textColor: DARK },
 alternateRowStyles: { fillColor: [248, 250, 252] },
 margin: { left: 14, right: 14 },
 theme: "grid",
 });
 y = (doc as any).lastAutoTable.finalY + 10;

 // CONCLUSION PREMIUM 
 y = checkPage(y, 80);
 doc.setFillColor(...DARK);
 doc.roundedRect(14, y, W - 28, 70, 3, 3,"F");
 doc.setFillColor(...BLUE);
 doc.roundedRect(14, y + 10, W - 28, 20, 0, 0,"F");
 doc.setFillColor(...GOLD);
 doc.rect(14, y + 10, W - 28, 2,"F");
 doc.rect(14, y + 28, W - 28, 2,"F");

 doc.setFontSize(14);
 doc.setFont("helvetica","bold");
 doc.setTextColor(...GOLD);
 doc.text(t("IBIG PARTNERS - L'AFFILIATION QUI CHANGE DES VIES"), W / 2, y + 23,{ align:"center"});

 doc.setFontSize(8);
 doc.setFont("helvetica","normal");
 doc.setTextColor(200, 220, 255);
 const closingText = t("Rejoignez des aujourd'hui le premier programme d'affiliation multi-branches panafricain. Construisez un revenu supplementaire ou principal en partageant des solutions qui répondent aux vrais besoins des entreprises et particuliers africains. Chaque partenaire IBIG contribue a l'émergence économique de l'Afrique tout en bâtissant sa propre prospérité.");
 const closingLines = doc.splitTextToSize(closingText, W - 50);
 doc.text(closingLines, W / 2, y + 40,{ align:"center"});

 doc.setFontSize(11);
 doc.setFont("helvetica","bold");
 doc.setTextColor(...GOLD);
 doc.text(t("Rejoignez le mouvement. Bâtissez votre avenir avec IBIG."), W / 2, y + 60,{ align:"center"});

 // Save
 doc.save("IBIG_PARTNERS_Document_Présentation_Projet_2026.pdf");
 } catch (err) {
 console.error("Erreur de génération PDF:", err);
 alert(t("Une erreur est survenue lors de la génération du PDF. Vérifiez la console."));
 } finally {
 setLoading(false);
 }
 }

 const sections = [
 { icon:"", title:"Résumé Exécutif", desc:"Vision,chiffres clés,objectifs 2026-2028"},
 { icon: "", title:"Groupe IBIG SARL", desc:"Présentation, vision, mission, valeurs"},
 { icon: "", title:"IBIG SOFT", desc:"6 logiciels SaaS de gestion, tarifs, commissions — ibigsoft.com"},
 { icon: "", title:"IBIG EDUFORM", desc:"200+ formations professionnelles certifiantes — ibig-eduform.com"},
 { icon: "", title:"IBIG IMMO TRUST", desc:"Immobilier sécurisé, BTP, service diaspora — ibigimmotrust.com"},
 { icon: "", title:"IBIG MARKET", desc:"Commerce B2B/B2C, matériel IT, e-commerce — ibig-market.com"},
 { icon: "", title:"IBIG DIGITAL KITS", desc:"ERP, site web, app mobile, IA, marketing digital — kits.intermark-business.com"},
 { icon: "", title:"IBIG CONSEIL+", desc:"Structuration, comptabilité, juridique, conseil stratégique"},
 { icon: "", title:"IBIG MULTISERVICES", desc:"Événementiel, déménagement, maintenance, logistique, tourisme"},
 { icon: "", title:"Système de commissions", desc:"Architecture N1/N2/N3, tableaux détaillés"},
 { icon: "", title:"Dégressivité commissions", desc:"Modèle 4 mois IBIG SOFT mensuel"},
 { icon: "", title:"Simulation revenus", desc:"4 scénarios de revenus passifs"},
 { icon: "*", title:"Statuts partenaires", desc:"STARTER > SILVER > GOLD > MASTER > ELITE"},
 { icon: "", title:"Gamification", desc:"Badges,classements,competitions"},
 { icon: "", title:"Plateforme technologique", desc:"Stack Next.js, modules, sécurité"},
 { icon: "", title:"Sécurité et conformité", desc:"KYC,JWT,HTTPS,audit log"},
 { icon: "", title:"Processus d'affiliation", desc: "12 étapes inscription > premier paiement"},
 { icon: "", title: "Méthodes de paiement", desc: "12 méthodes dont mobile money africain"},
 { icon: "", title: "Académie IBIG", desc: "Videos, PDF, quiz, Coach IA, kit marketing"},
 { icon: "", title: "Coach IA IBIG", desc: "GPT entraîné sur produits IBIG 24/7"},
 { icon: "", title: "Stratégie 2026-2028", desc: "3 phases d'expansion panafricaine"},
 { icon: "", title:"Avantages concurrentiels", desc:"Comparaison vs MLM,affiliation,emploi"},
 { icon: "", title:"Cadre juridique", desc:"OHADA, droit ivoirien, protection données"},
 { icon: "", title:"Gouvernance", desc:"Equipe,processus,reporting,transparence"},
 { icon: "", title:"FAQ Projet", desc:"10 questions essentielles avec réponses"},
 { icon: "", title:"Contacts", desc:"Tous les canaux et opportunités de partenariat"},
 { icon: "", title:"Conclusion", desc:"Vision panafricaine et appel à l'action"},
 ];

 return (
 <div className="min-h-screen bg-gray-50">
 {/* Header */}
 <div className="bg-gradient-to-r from-[#0b5fff] to-[#0f1729] text-white px-6 py-10">
 <div className="max-w-5xl mx-auto">
 <div className="flex items-center gap-3 mb-2">
 <span className="text-2xl"></span>
 <span className="text-sm font-medium uppercase tracking-widest text-blue-200">Document Officiel</span>
 </div>
 <h1 className="text-3xl font-bold mb-2">Document de Presentation du Projet</h1>
 <p className="text-blue-200 text-lg mb-1">IBIG PARTNERS — Programme d'Affiliation Panafricain Multi-Niveaux</p>
          <p className="text-blue-300 text-sm">
            INTERMARK BUSINESS INTERNATIONAL GROUP SARL · Version 1.0 · Juin 2026 · {TOTAL_PAGES} pages · Confidentiel
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 p-6 bg-white rounded-2xl shadow-md border border-blue-100">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Télécharger le Document de Présentation (PDF)
            </h2>
            <p className="text-gray-500 text-sm">
              Document complet A4 · {TOTAL_PAGES} pages · Couverture premium · Tableaux détaillés · Chiffres à jour 2026
            </p>
          </div>
          <button
            onClick={generatePDF}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0b5fff] hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg text-sm whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5"viewBox="0 0 24 24"fill="none">
                  <circle className="opacity-25"cx="12"cy="12"r="10"stroke="currentColor"strokeWidth="4"/>
                  <path className="opacity-75"fill="currentColor"d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Génération en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24">
                  <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Télécharger le PDF ({TOTAL_PAGES} pages)
              </>
            )}
          </button>
        </div>

        {/* Sections Grid */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">Contenu du document ({sections.length} sections)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {sections.map((s,i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-0.5">{s.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { label: "Format",value: "A4 Portrait"},
            { label: "Pages",value: `${TOTAL_PAGES} pages`},
            { label: "Sections",value: `${sections.length} chapitres`},
            { label: "Version",value: "Juin 2026"},
          ].map((item,i) => (
            <div key={i} className="bg-[#0b5fff] text-white rounded-xl p-4">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-blue-200 text-xs mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
