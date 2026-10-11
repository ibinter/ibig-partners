"use client";

import { useEffect, useState } from "react";

export default function GuideAffiliePage() {
  const [generating, setGenerating] = useState(false);

  async function downloadPdf() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const W = 210;
      const MARGIN = 18;
      const CONTENT_W = W - MARGIN * 2;
      let y = 0;

      function pageBreakIfNeeded(needed = 20) {
        if (y + needed > 270) { doc.addPage(); y = 20; }
      }

      function header() {
        doc.setFillColor(15, 52, 96);
        doc.rect(0, 0, W, 28, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("IBIG PARTNERS", MARGIN, 12);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Guide Officiel du Partenaire Affilié", MARGIN, 20);
        doc.setFontSize(8);
        doc.text(`www.ibigpartners.com`, W - MARGIN, 20, { align: "right" });
        y = 36;
      }

      function sectionTitle(title: string) {
        pageBreakIfNeeded(16);
        doc.setFillColor(235, 242, 255);
        doc.roundedRect(MARGIN, y, CONTENT_W, 9, 2, 2, "F");
        doc.setTextColor(15, 52, 96);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(title, MARGIN + 4, y + 6.2);
        y += 14;
      }

      function subTitle(title: string) {
        pageBreakIfNeeded(10);
        doc.setTextColor(30, 80, 160);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, MARGIN, y);
        y += 6;
      }

      function para(text: string, indent = 0) {
        pageBreakIfNeeded(8);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(text, CONTENT_W - indent);
        doc.text(lines, MARGIN + indent, y);
        y += lines.length * 5.2 + 2;
      }

      function bullet(text: string) {
        pageBreakIfNeeded(7);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setFillColor(15, 52, 96);
        doc.circle(MARGIN + 3, y - 1.2, 1, "F");
        const lines = doc.splitTextToSize(text, CONTENT_W - 10);
        doc.text(lines, MARGIN + 8, y);
        y += lines.length * 5.2 + 1;
      }

      function tip(text: string) {
        pageBreakIfNeeded(14);
        doc.setFillColor(255, 249, 220);
        doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "F");
        doc.setTextColor(120, 80, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize("💡 " + text, CONTENT_W - 8);
        doc.text(lines, MARGIN + 4, y + 6);
        y += lines.length * 5.2 + 6;
      }

      function space(h = 4) { y += h; }

      function tableRow(cols: string[], widths: number[], header = false) {
        pageBreakIfNeeded(8);
        let x = MARGIN;
        if (header) {
          doc.setFillColor(15, 52, 96);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFillColor(248, 250, 255);
          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "normal");
        }
        doc.setFontSize(9);
        let rowH = 7;
        cols.forEach((col, i) => {
          doc.rect(x, y, widths[i], rowH, header ? "F" : "S");
          doc.text(col, x + 3, y + 4.8);
          x += widths[i];
        });
        y += rowH;
      }

      function footer() {
        const pages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          doc.setDrawColor(200, 210, 230);
          doc.line(MARGIN, 284, W - MARGIN, 284);
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.text("IBIG PARTNERS — Document confidentiel réservé aux partenaires", MARGIN, 289);
          doc.text(`Page ${i} / ${pages}`, W - MARGIN, 289, { align: "right" });
        }
      }

      // ─── CONTENU ───
      header();

      // Page de titre
      doc.setFillColor(15, 52, 96);
      doc.rect(0, 0, W, 297, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("GUIDE OFFICIEL", W / 2, 100, { align: "center" });
      doc.setFontSize(20);
      doc.text("DU PARTENAIRE AFFILIÉ", W / 2, 115, { align: "center" });
      doc.setDrawColor(255, 200, 50);
      doc.setLineWidth(0.8);
      doc.line(MARGIN + 20, 122, W - MARGIN - 20, 122);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("IBIG SARL — Abidjan, Côte d'Ivoire", W / 2, 132, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(180, 200, 255);
      doc.text("8 branches métiers · Réseau MLM 3 niveaux · Commissions jusqu'à 20%", W / 2, 142, { align: "center" });
      doc.setFontSize(9);
      doc.text("www.ibigpartners.com", W / 2, 270, { align: "center" });
      doc.setTextColor(150, 170, 220);
      doc.text(`Édition ${new Date().getFullYear()}`, W / 2, 278, { align: "center" });

      // Page 2 — Bienvenue
      doc.addPage();
      header();
      y = 36;

      sectionTitle("1. BIENVENUE CHEZ IBIG PARTNERS");
      para("IBIG PARTNERS est le programme d'affiliation officiel d'IBIG SARL, société basée à Abidjan (Côte d'Ivoire). En tant que partenaire, vous recommandez les produits et services IBIG et percevez des commissions sur chaque vente confirmée.");
      space();
      subTitle("Pourquoi rejoindre IBIG PARTNERS ?");
      bullet("Commissions parmi les plus élevées du marché africain : jusqu'à 20% N1");
      bullet("Réseau MLM 3 niveaux : gagnez aussi sur les ventes de votre équipe (N2 et N3)");
      bullet("8 branches métiers : finance, immobilier, digital, éducation, santé, agri, BTP, services");
      bullet("Paiements via Orange Money, Wave, MTN MoMo ou virement bancaire");
      bullet("Outils professionnels : liens trackés, QR codes, Coach IA, kit marketing");
      bullet("Accès gratuit : inscription sans frais, aucun abonnement obligatoire");
      space();
      tip("Votre succès dépend de votre investissement. Les meilleurs partenaires IBIG consacrent au moins 2h par jour à leur activité.");

      sectionTitle("2. COMMENT DÉMARRER EN 5 ÉTAPES");
      subTitle("Étape 1 — Compléter votre profil");
      para("Allez dans Espace → Mon Profil. Renseignez votre ville, votre méthode de paiement (Orange Money, Wave...) et votre numéro. Un profil complet inspire confiance à vos prospects.");
      space();
      subTitle("Étape 2 — Activer vos produits");
      para("Dans Espace → Mes Produits, activez les branches qui vous correspondent. Chaque activation génère votre lien affilié unique. Vous ne pouvez promouvoir que les produits activés.");
      space();
      subTitle("Étape 3 — Copier vos liens d'affiliation");
      para("Dans Espace → Mes Liens, récupérez votre lien unique par produit. Format : ibigpartners.com/aff/VOTRE-CODE?p=slug-produit. Ce lien trace chaque visiteur pendant 90 jours.");
      space();
      subTitle("Étape 4 — Partager et prospecter");
      para("Utilisez les boutons de partage direct (WhatsApp, Telegram, Facebook, Instagram) depuis Mes Liens. Le Coach IA (Espace → Coach IA) vous aide à rédiger des messages percutants personnalisés.");
      space();
      subTitle("Étape 5 — Déclarer vos ventes");
      para("Quand un prospect signe ou achète via votre lien, sa vente peut être enregistrée automatiquement (si le site du produit est connecté) ou manuellement dans Espace → Déclarer une vente.");
      space();
      tip("Commencez par votre cercle proche : famille, amis, collègues. Une vente de proximité vaut mieux que 100 messages non ciblés.");

      // Page 3 — Liens et tracking
      doc.addPage();
      header();
      y = 36;

      sectionTitle("3. VOS LIENS D'AFFILIATION ET LE TRACKING");
      subTitle("Comment fonctionne le tracking ?");
      para("Quand un visiteur clique sur votre lien affilié, un cookie est posé sur son navigateur pendant 90 jours. Si ce visiteur effectue un achat ou s'inscrit comme partenaire dans ce délai, la vente ou le recrutement vous est attribué automatiquement.");
      space();
      subTitle("Format de vos liens");
      para("Lien court : ibigpartners.com/aff/VOTRE-CODE");
      para("Lien avec produit : ibigpartners.com/aff/VOTRE-CODE?p=ibig-finance");
      space();
      subTitle("QR Codes");
      para("Chaque produit dispose d'un QR code unique généré automatiquement. Imprimez-le sur vos flyers, cartes de visite ou affiches pour les événements physiques.");
      space();
      subTitle("Partage viral 1-clic");
      para("Depuis Mes Liens, cliquez sur WhatsApp, Telegram, Facebook ou X pour partager directement. Choisissez parmi 3 tonalités de message : Professionnel, Convaincant ou Personnel.");
      space();
      tip("WhatsApp Status est votre outil N°1 en Côte d'Ivoire. Publiez votre lien tous les 2-3 jours avec une histoire personnelle ou un témoignage pour maximiser les clics.");

      sectionTitle("4. GÉRER VOS PROSPECTS");
      para("La section Mes Prospects (CRM intégré) vous permet de suivre chaque contact :");
      bullet("Statuts : Contacté → Intéressé → Devis → Converti ou Perdu");
      bullet("Ajoutez des notes après chaque échange");
      bullet("Fixez des rappels de relance");
      bullet("Exportez votre liste en CSV");
      space();
      subTitle("Séquence de prospection recommandée");
      para("Jour 1 : Premier contact → présentation du produit + envoi du lien");
      para("Jour 3 : Relance WhatsApp si pas de réponse (le Coach IA rédige pour vous)");
      para("Jour 7 : Second message avec témoignage ou promo en cours");
      para("Jour 14 : Clôture → « Êtes-vous prêt à passer à l'étape suivante ? »");
      space();
      tip("80% des ventes se font après le 5ème contact. Ne baissez pas les bras après un premier non.");

      // Page 4 — Construire l'équipe
      doc.addPage();
      header();
      y = 36;

      sectionTitle("5. CONSTRUIRE VOTRE ÉQUIPE (MLM 3 NIVEAUX)");
      para("En plus de vos ventes directes, vous gagnez des commissions sur les ventes de votre réseau. C'est le principe du MLM (Marketing Multi-Niveaux) à 3 niveaux :");
      space();
      subTitle("Les 3 niveaux");
      tableRow(["Niveau", "Qui est concerné ?", "Votre commission sur leurs ventes"], [25, 85, 64], true);
      tableRow(["N1", "Personnes recrutées directement par vous", "Selon la grille complète (10% à 20%)"], [25, 85, 64]);
      tableRow(["N2", "Personnes recrutées par vos filleuls N1", "Environ 50% du taux N1"], [25, 85, 64]);
      tableRow(["N3", "Personnes recrutées par vos filleuls N2", "Environ 25% du taux N1"], [25, 85, 64]);
      space(6);
      subTitle("Recruter un filleul");
      para("Partagez votre lien de parrainage (ibigpartners.com/rejoindre?ref=VOTRE-CODE). Quand quelqu'un s'inscrit via ce lien et est validé par l'équipe IBIG, il devient votre filleul N1. Ses ventes génèrent des commissions pour vous automatiquement.");
      space();
      subTitle("Visualiser votre réseau");
      para("Consultez Espace → Mon Réseau pour voir l'arbre complet de votre équipe N1/N2/N3, le nombre de ventes par membre et votre commission générée par niveau.");
      space();
      tip("Un réseau de 10 filleuls actifs qui font chacun 2 ventes/mois vous rapporte autant que 20 ventes personnelles. Recrutez EN MÊME TEMPS que vous vendez.");

      sectionTitle("6. VOS STATUTS ET AVANTAGES");
      tableRow(["Statut", "Condition", "Bonus commission", "Avantage principal"], [28, 72, 38, 36], true);
      tableRow(["⭐ Starter", "Inscription validée", "+0%", "Accès complet"], [28, 72, 38, 36]);
      tableRow(["⭐⭐ Silver", "10 ventes confirmées", "+2%", "Kit marketing premium"], [28, 72, 38, 36]);
      tableRow(["⭐⭐⭐ Gold", "25 ventes + 10 filleuls", "+5%", "Badge Ambassadeur"], [28, 72, 38, 36]);
      tableRow(["🏆 Master", "50 ventes + 25 filleuls", "+8%", "Représentant communal"], [28, 72, 38, 36]);
      tableRow(["👑 Elite", "100 ventes + 50 filleuls", "+12%", "Représentant Pays"], [28, 72, 38, 36]);
      space();
      para("Votre statut est recalculé automatiquement après chaque vente confirmée. Il ne peut jamais régresser.");

      // Page 5 — Missions et CP
      doc.addPage();
      header();
      y = 36;

      sectionTitle("7. LES MISSIONS PARTNERS");
      para("Les missions sont des actions concrètes à accomplir pour IBIG en échange de commissions cash et/ou de Credits Points (CP). Elles sont créées par l'équipe IBIG et ouvertes à tous les partenaires.");
      space();
      subTitle("Types de missions");
      bullet("CASH : Commission fixe versée après validation de la preuve par l'admin");
      bullet("CP : Credits Points crédités sur votre solde après validation");
      bullet("MIXED : CP crédités immédiatement + Cash libéré après vente confirmée");
      space();
      subTitle("Comment participer ?");
      para("1. Espace → Missions Partners → Choisissez une mission ouverte");
      para("2. Cliquez sur « Candidater » pour réserver votre place");
      para("3. Accomplissez la mission selon les instructions");
      para("4. Soumettez votre preuve (lien, capture d'écran, document)");
      para("5. L'équipe IBIG valide sous 24-48h → récompense créditée automatiquement");

      sectionTitle("8. LES CREDITS POINTS (CP)");
      para("Les CP sont une monnaie de fidélité non-cash gagnée en accomplissant des missions. Ils ont une valeur réelle et des usages concrets :");
      space();
      subTitle("Valeur des CP");
      bullet("1 CP = 10 FCFA de remise sur les produits et abonnements IBIG");
      bullet("Exemple : 500 CP = 5 000 FCFA de remise sur votre abonnement");
      space();
      subTitle("Boost de commission");
      bullet("Dépensez 1 000 CP → +1% sur UNE vente (votre commission sur cette vente augmente de 1%)");
      bullet("Maximum : 5 000 CP = +5% sur une vente");
      bullet("Les CP sont débités immédiatement, le boost s'applique lors de la validation admin");
      bullet("Disponible uniquement sur les missions CASH et MIXED");
      space();
      tip("Cumulez vos CP sur les petites missions pour les utiliser sur une grande vente où le boost aura le plus d'impact.");

      sectionTitle("9. PAIEMENTS ET COMMISSIONS");
      subTitle("Calendrier de paiement");
      para("Les commissions validées sont regroupées et versées une fois par mois, entre le 5 et le 10 du mois suivant. Le montant minimum de paiement est de 5 000 FCFA.");
      space();
      subTitle("Méthodes de paiement");
      bullet("Orange Money (numéro CI)");
      bullet("Wave (numéro CI)");
      bullet("MTN MoMo (numéro CI)");
      bullet("Virement bancaire (RIB requis)");
      space();
      para("Configurez votre méthode préférée dans Espace → Mon Profil → Coordonnées bancaires.");
      space();
      tip("Vérifiez que votre numéro Mobile Money est correct dans votre profil. Les erreurs de virement ne peuvent pas toujours être corrigées.");

      // Page 6 — Outils et support
      doc.addPage();
      header();
      y = 36;

      sectionTitle("10. VOS OUTILS IBIG PARTNERS");
      subTitle("Coach IA — Espace → Coach IA");
      para("Un assistant conversationnel disponible 24h/24 qui connaît vos produits, votre statut et votre code affilié. Il rédige pour vous : messages WhatsApp, relances, pitchs, plans d'action personnalisés.");
      space();
      subTitle("Kit Marketing — Espace → Kit Marketing");
      para("Visuels, bannières, textes clés en main mis à jour par l'équipe IBIG. Utilisez-les sur vos réseaux sociaux, groupes WhatsApp et imprimés.");
      space();
      subTitle("Académie IBIG — Espace → Académie");
      para("Modules de formation gratuits sur la vente, le digital, l'affiliation. Complétez 80% des modules pour obtenir votre certificat IBIG Partners téléchargeable en PDF.");
      space();
      subTitle("Simulateur de gains — Espace → Simulateur");
      para("Calculez vos revenus potentiels en ajustant vos ventes personnelles, le nombre de filleuls et leur activité. Utilisez-le pour vous fixer des objectifs réalistes.");
      space();
      subTitle("Analytics — Espace → Analytics");
      para("Suivez les clics sur vos liens, les conversions, le taux de transformation et l'évolution de votre réseau semaine après semaine.");

      sectionTitle("11. RÈGLES ET CODE DE CONDUITE");
      bullet("Ne promettez jamais de gains garantis ni de « revenus passifs sans effort »");
      bullet("Soyez honnête sur les produits : ne vendez que ce que vous connaissez");
      bullet("Ne pratiquez pas le spam sur les groupes WhatsApp ou réseaux sociaux");
      bullet("Respectez la vie privée de vos prospects (pas de partage de leurs données)");
      bullet("Toute fraude (fausses ventes, faux leads) entraîne la suspension immédiate du compte");
      bullet("Les litiges se règlent via le support (Espace → Support)");
      space();
      tip("Votre réputation est votre capital le plus précieux. Un partenaire de confiance convertit 3x plus que le reste.");

      sectionTitle("12. SUPPORT ET RESSOURCES");
      bullet("Support intégré : Espace → Support (réponse sous 24-48h)");
      bullet("Email : support@ibigpartners.com");
      bullet("FAQ complète : Espace → FAQ (100 questions/réponses)");
      bullet("Guide Commissions : Espace → Guide Commissions (grille détaillée)");
      bullet("Plan de compensation : Espace → Plan de compensation (vision globale)");

      footer();
      doc.save("Guide-Affilie-IBIG-Partners.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const sections = [
    { num: "01", title: "Bienvenue chez IBIG Partners", desc: "Présentation du programme, avantages et opportunités" },
    { num: "02", title: "Démarrer en 5 étapes", desc: "Profil, activation produits, liens, partage, ventes" },
    { num: "03", title: "Liens d'affiliation et tracking", desc: "QR codes, cookies 90 jours, partage viral" },
    { num: "04", title: "Gérer vos prospects (CRM)", desc: "Séquence de prospection, relances, suivi" },
    { num: "05", title: "Construire votre équipe MLM", desc: "3 niveaux N1/N2/N3, recrutement, commissions réseau" },
    { num: "06", title: "Statuts et avantages", desc: "Starter → Silver → Gold → Master → Elite" },
    { num: "07", title: "Missions Partners", desc: "Types CASH/CP/MIXED, workflow de participation" },
    { num: "08", title: "Credits Points (CP)", desc: "Valeur, remises, boost de commission" },
    { num: "09", title: "Paiements et commissions", desc: "Calendrier, méthodes, minimum 5 000 FCFA" },
    { num: "10", title: "Outils IBIG Partners", desc: "Coach IA, Kit marketing, Académie, Simulateur" },
    { num: "11", title: "Règles et code de conduite", desc: "Bonnes pratiques, interdictions, éthique" },
    { num: "12", title: "Support et ressources", desc: "Contacts, FAQ, autres guides" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0f3460] to-[#1a5276] p-8 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-blue-200 text-sm font-semibold mb-2 uppercase tracking-wide">Guide officiel</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Guide du Partenaire Affilié</h1>
            <p className="text-blue-100 text-sm max-w-md">
              Tout ce qu'il faut savoir pour démarrer, progresser et maximiser vos revenus chez IBIG Partners.
              12 chapitres · 6 pages A4.
            </p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={generating}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f3460] hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            {generating ? (
              <><span className="animate-spin">⏳</span> Génération…</>
            ) : (
              <><span>📄</span> Télécharger PDF</>
            )}
          </button>
        </div>
      </div>

      {/* Sommaire */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Sommaire du guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map((s) => (
            <div key={s.num} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0f3460] text-white text-xs font-extrabold">
                {s.num}
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-center gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <p className="font-bold text-amber-800 text-sm">Conseil</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Téléchargez ce guide, lisez-le en intégralité et revenez sur les sections importantes.
            Partagez-le avec vos filleuls pour les aider à démarrer rapidement.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={downloadPdf}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-[#0f3460] px-8 py-3 text-sm font-bold text-white hover:bg-[#1a5276] transition-colors disabled:opacity-60"
        >
          {generating ? "Génération en cours…" : "📄 Télécharger le Guide Affilié (PDF)"}
        </button>
      </div>
    </div>
  );
}
