"use client";

import { useState } from "react";

export default function GuideAdminPage() {
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

      function pb(needed = 20) {
        if (y + needed > 270) { doc.addPage(); y = 20; }
      }

      function header() {
        doc.setFillColor(10, 36, 64);
        doc.rect(0, 0, W, 28, "F");
        doc.setFillColor(220, 50, 50);
        doc.rect(0, 24, W, 4, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("IBIG PARTNERS", MARGIN, 12);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Guide Administration — Usage interne IBIG SARL", MARGIN, 20);
        doc.setFontSize(8);
        doc.text("CONFIDENTIEL", W - MARGIN, 20, { align: "right" });
        y = 36;
      }

      function sTitle(title: string) {
        pb(16);
        doc.setFillColor(220, 50, 50);
        doc.roundedRect(MARGIN, y, CONTENT_W, 9, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text(title, MARGIN + 4, y + 6.2);
        y += 14;
      }

      function sub(title: string) {
        pb(10);
        doc.setTextColor(10, 36, 64);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(title, MARGIN, y);
        y += 6;
      }

      function para(text: string, indent = 0) {
        pb(8);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(text, CONTENT_W - indent);
        doc.text(lines, MARGIN + indent, y);
        y += lines.length * 5.2 + 2;
      }

      function bullet(text: string) {
        pb(7);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setFillColor(220, 50, 50);
        doc.circle(MARGIN + 3, y - 1.2, 1, "F");
        const lines = doc.splitTextToSize(text, CONTENT_W - 10);
        doc.text(lines, MARGIN + 8, y);
        y += lines.length * 5.2 + 1;
      }

      function warn(text: string) {
        pb(14);
        doc.setFillColor(255, 240, 240);
        doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "F");
        doc.setTextColor(160, 20, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize("⚠️ " + text, CONTENT_W - 8);
        doc.text(lines, MARGIN + 4, y + 6);
        y += lines.length * 5.2 + 6;
      }

      function tip(text: string) {
        pb(14);
        doc.setFillColor(255, 249, 220);
        doc.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "F");
        doc.setTextColor(120, 80, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        const lines = doc.splitTextToSize("💡 " + text, CONTENT_W - 8);
        doc.text(lines, MARGIN + 4, y + 6);
        y += lines.length * 5.2 + 6;
      }

      function row(cols: string[], widths: number[], isHeader = false) {
        pb(8);
        let x = MARGIN;
        if (isHeader) {
          doc.setFillColor(10, 36, 64);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFillColor(248, 250, 255);
          doc.setTextColor(50, 50, 50);
          doc.setFont("helvetica", "normal");
        }
        doc.setFontSize(9);
        const rowH = 7;
        cols.forEach((col, i) => {
          doc.rect(x, y, widths[i], rowH, isHeader ? "F" : "S");
          doc.text(col, x + 3, y + 4.8);
          x += widths[i];
        });
        y += rowH;
      }

      function sp(h = 4) { y += h; }

      function footer() {
        const pages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          doc.setDrawColor(200, 210, 230);
          doc.line(MARGIN, 284, W - MARGIN, 284);
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.text("IBIG SARL — Document interne confidentiel — Ne pas diffuser", MARGIN, 289);
          doc.text(`Page ${i} / ${pages}`, W - MARGIN, 289, { align: "right" });
        }
      }

      // ─── PAGE DE COUVERTURE ───
      header();
      doc.setFillColor(10, 36, 64);
      doc.rect(0, 0, W, 297, "F");
      doc.setFillColor(220, 50, 50);
      doc.rect(0, 68, W, 3, "F");
      doc.rect(0, 226, W, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("GUIDE ADMINISTRATEUR", W / 2, 90, { align: "center" });
      doc.setFontSize(14);
      doc.text("IBIG PARTNERS", W / 2, 104, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(180, 200, 230);
      doc.text("Gestion complète de la plateforme partenaires", W / 2, 116, { align: "center" });
      doc.setFontSize(9);
      doc.setTextColor(220, 50, 50);
      doc.text("⚠ DOCUMENT INTERNE — USAGE EXCLUSIF IBIG SARL", W / 2, 130, { align: "center" });
      doc.setTextColor(140, 160, 200);
      doc.setFontSize(8.5);
      const chapters = [
        "1. Tableau de bord et KPIs",
        "2. Gestion des partenaires",
        "3. Validation des missions",
        "4. Commissions et paiements",
        "5. Vérifications KYC / KYB",
        "6. Produits et branches",
        "7. Support et tickets",
        "8. Communication",
        "9. Analytics et reporting",
        "10. Paramètres et sécurité",
      ];
      chapters.forEach((ch, i) => {
        const col = i < 5 ? MARGIN + 10 : W / 2 + 5;
        const row2 = i < 5 ? i : i - 5;
        doc.text(ch, col, 152 + row2 * 10);
      });
      doc.setTextColor(100, 130, 180);
      doc.setFontSize(8);
      doc.text("www.ibigpartners.com", W / 2, 270, { align: "center" });
      doc.text(`Édition ${new Date().getFullYear()} — Confidentiel`, W / 2, 278, { align: "center" });

      // ─── PAGE 2 ───
      doc.addPage();
      header();

      sTitle("1. TABLEAU DE BORD ET KPIs");
      para("Le tableau de bord admin (/admin) affiche en temps réel les indicateurs clés de la plateforme. Consultez-le chaque matin pour détecter les anomalies avant de traiter les tâches du jour.");
      sp();
      sub("KPIs à surveiller quotidiennement");
      row(["Indicateur", "Seuil d'alerte", "Action si dépassé"], [60, 55, 59], true);
      row(["Ventes en attente validation", "> 20 depuis 48h", "Traiter en priorité"], [60, 55, 59]);
      row(["Missions en attente preuve", "> 10 depuis 24h", "Relancer partenaires"], [60, 55, 59]);
      row(["KYC en attente vérification", "> 5 depuis 72h", "Traiter immédiatement"], [60, 55, 59]);
      row(["Tickets support ouverts", "> 15 non assignés", "Assigner à un agent"], [60, 55, 59]);
      row(["Paiements non traités", "> 5e du mois", "Lancer virements"], [60, 55, 59]);
      sp(6);

      sTitle("2. GESTION DES PARTENAIRES");
      sub("Valider un nouveau compte (/admin/partenaires)");
      para("1. Ouvrir la fiche du partenaire → vérifier email, numéro, ville et coordonnées de paiement");
      para("2. S'assurer que l'email est vérifié (badge vert)");
      para("3. Cliquer « Approuver » → l'email de bienvenue est envoyé automatiquement via Resend");
      para("4. Si informations manquantes → « Demander complément » avec message personnalisé");
      sp();
      sub("Actions disponibles sur chaque compte");
      bullet("Suspendre un compte (accès lecture seule, commissions bloquées)");
      bullet("Réinitialiser le mot de passe (email envoyé automatiquement)");
      bullet("Modifier le statut manuellement (Silver/Gold/Master/Elite)");
      bullet("Consulter l'arbre de réseau et les commissions générées");
      bullet("Exporter les données du partenaire en CSV");
      sp();
      warn("Ne jamais supprimer un compte partenaire — suspendez-le. La suppression efface l'historique des commissions.");

      sTitle("3. VALIDATION DES MISSIONS (/admin/missions)");
      sub("Workflow de validation d'une preuve");
      para("1. Cliquer sur la candidature en statut « Preuve soumise »");
      para("2. Vérifier la preuve (lien, capture, document) selon les critères de la mission");
      para("3. Si valide → « Approuver » : la récompense (CASH/CP) est créditée automatiquement");
      para("4. Si invalide → « Rejeter » avec motif (le partenaire voit le motif dans son espace)");
      sp();
      sub("Logique CP Boost");
      para("Si le partenaire a activé un boost CP avant de candidater, la colonne « Boost » affiche le % utilisé (ex: +3% pour 3 000 CP). Lors de l'approbation d'une mission CASH, la commission finale est :");
      para("Commission finale = montant × (1 + boost%) — Les CP ont déjà été débités du solde du partenaire.");
      tip("Le boost CP ne s'applique que sur les missions CASH et MIXED. Pour CP pures, ignorer la colonne Boost.");
      sp();
      sub("Créer une nouvelle mission");
      bullet("Titre clair + description précise de la preuve attendue");
      bullet("Définir le type (CASH / CP / MIXED) et le montant");
      bullet("Fixer une deadline et le nombre de places maximum");
      bullet("Statut initial : DRAFT → publier en OPEN quand prête");
      warn("Une mission publiée en OPEN est visible de tous les partenaires actifs immédiatement.");

      // ─── PAGE 3 ───
      doc.addPage();
      header();

      sTitle("4. COMMISSIONS ET PAIEMENTS");
      sub("Valider une vente (/admin/ventes)");
      para("Chaque vente déclarée manuellement ou via API nécessite une validation admin :");
      bullet("Vérifier le produit, le montant et le partenaire déclarant");
      bullet("Contrôler la preuve si exigée (bon de commande, capture paiement)");
      bullet("Approuver → commissions N1/N2/N3 calculées et créditées automatiquement");
      bullet("Rejeter avec motif → aucune commission créditée");
      sp();
      sub("Traiter les paiements (/admin/paiements)");
      para("Les paiements sont à traiter entre le 5 et le 10 de chaque mois :");
      bullet("Filtrer par statut « En attente » — minimum 5 000 FCFA par partenaire");
      bullet("Vérifier la méthode de paiement et le numéro/RIB avant tout virement");
      bullet("Marquer comme « Payé » après virement effectif (jamais avant)");
      bullet("Exporter la liste des paiements du mois en CSV pour comptabilité");
      warn("Ne jamais marquer « Payé » avant que le virement soit réellement effectué. Une erreur ici bloque le partenaire.");
      sp();
      sub("Corrections de CP (/admin/corrections-cp)");
      para("Pour créditer ou débiter des CP manuellement (correction d'erreur, bonus exceptionnel) :");
      bullet("Saisir le montant en CP, le motif et la raison (conservé dans l'audit log)");
      bullet("Toute correction est irréversible — double-vérifier avant de valider");

      sTitle("5. VÉRIFICATIONS KYC / KYB");
      sub("KYC Particuliers (/admin/verifications)");
      para("Les partenaires doivent soumettre : CNI/passeport + justificatif de domicile + selfie avec pièce.");
      bullet("Statut SUBMITTED → examiner les 3 documents");
      bullet("VERIFIED → commissions débloquées, paiements autorisés");
      bullet("REJECTED → préciser exactement le document refusé et pourquoi");
      tip("Délai maximum : 48h après soumission. Au-delà, le partenaire voit une alerte dans son espace.");
      sp();
      sub("KYB Entreprises (/admin/kyb)");
      para("Pour les comptes entreprise : RCCM + Statuts + Attestation fiscale + pièce du gérant.");
      bullet("Vérifier la cohérence entre le nom de l'entreprise et les documents");
      bullet("En cas de doute → demande de complément avant de rejeter");

      sTitle("6. PRODUITS ET BRANCHES");
      sub("Gérer les produits (/admin/produits)");
      bullet("Créer/modifier : titre, slug, description, commission N1, URL du site produit");
      bullet("Activer/désactiver : un produit désactivé n'apparaît plus dans les espaces partenaires");
      bullet("Le champ siteUrl est critique : c'est l'URL utilisée pour la réconciliation des ventes API");
      warn("Modifier le slug d'un produit casse tous les liens affiliés existants de ce produit.");
      sp();
      sub("Gérer les branches (/admin/branches)");
      para("Les branches regroupent les produits par secteur (finance, digital, éducation...). Chaque branche a un slug unique. Ne modifiez pas les slugs des branches actives.");

      // ─── PAGE 4 ───
      doc.addPage();
      header();

      sTitle("7. SUPPORT ET TICKETS (/admin/tickets)");
      sub("Workflow de traitement");
      bullet("OPEN → Assigner à un agent (ou prendre en charge)");
      bullet("IN_PROGRESS → Traiter le problème, ajouter des notes internes si besoin");
      bullet("RESOLVED → Saisir la résolution, le partenaire est notifié automatiquement");
      bullet("CLOSED → Fermé après confirmation du partenaire ou délai de 48h sans réponse");
      sp();
      sub("Catégories de tickets fréquents");
      row(["Catégorie", "Délai cible", "Escalade si"], [55, 40, 79], true);
      row(["Paiement non reçu", "24h", "Virement confirmé mais non crédité"], [55, 40, 79]);
      row(["Vente refusée à tort", "48h", "Preuve valide mais rejetée"], [55, 40, 79]);
      row(["Compte suspendu par erreur", "4h", "Suspension sans motif valide"], [55, 40, 79]);
      row(["Problème d'accès", "2h", "Impossible de se connecter"], [55, 40, 79]);
      row(["Demande de correction CP", "48h", "Erreur de crédit avérée"], [55, 40, 79]);

      sTitle("8. COMMUNICATION (/admin/communication)");
      sub("Annonces et notifications");
      bullet("Annonce globale : visible dans l'espace de tous les partenaires");
      bullet("Notification ciblée : envoyer à un partenaire ou un groupe (statut, branche)");
      bullet("Campagne email : via Resend — utiliser les templates validés uniquement");
      warn("Les campagnes email depuis admin@ibigpartners.com utilisent le domaine mail.ibigpartners.com (Resend). Ne pas modifier l'adresse d'expédition EMAIL_FROM dans Vercel sans Redeploy.");
      sp();
      sub("Emails transactionnels automatiques (ne pas désactiver)");
      bullet("Bienvenue partenaire → déclenchement : approbation du compte");
      bullet("Vente validée → déclenchement : validation admin");
      bullet("Paiement effectué → déclenchement : statut paiement = PAID");
      bullet("KYC rejeté → déclenchement : rejet vérification avec motif");

      sTitle("9. ANALYTICS ET REPORTING");
      sub("Tableaux de bord analytics (/admin/analytics)");
      bullet("Ventes par période, par branche, par partenaire");
      bullet("Commissions distribuées N1/N2/N3");
      bullet("Croissance du réseau : nouveaux partenaires par semaine");
      bullet("Taux de conversion : partenaires actifs vs inscrits");
      sp();
      sub("Export reporting (/admin/reporting)");
      para("Générez des rapports CSV mensuels pour la comptabilité et les déclarations fiscales. Les exports incluent : toutes les commissions du mois, les paiements traités et le détail TVA si applicable.");

      sTitle("10. PARAMÈTRES ET SÉCURITÉ (/admin/parametres)");
      sub("Variables d'environnement critiques");
      row(["Variable", "Criticité", "Règle"], [55, 25, 94], true);
      row(["DATABASE_URL", "CRITIQUE", "Ne jamais modifier. Contacter Supabase si problème."], [55, 25, 94]);
      row(["MONEROO_WEBHOOK_SECRET", "CRITIQUE", "Doit être identique au Signing Secret Moneroo dashboard"], [55, 25, 94]);
      row(["EMAIL_FROM", "HAUTE", "Garder le préfixe mail. — ex: support@mail.ibigpartners.com"], [55, 25, 94]);
      row(["PARTNER_SALE_API_KEY", "HAUTE", "Clé secrète pour POST /api/partners/report-sale"], [55, 25, 94]);
      sp(4);
      warn("Toute modification d'une variable Vercel nécessite un Redeploy manuel pour être prise en compte. Sans Redeploy, l'ancienne valeur reste active en production.");
      sp();
      sub("Audit log (/admin/audit)");
      para("Toutes les actions admin (approbation, paiement, correction CP, suspension) sont tracées avec timestamp, admin ID et détail. L'audit log est en lecture seule et ne peut pas être modifié.");
      tip("Consultez l'audit log en cas de litige avec un partenaire. Il fait foi devant toute réclamation.");

      footer();
      doc.save("Guide-Admin-IBIG-Partners.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const sections = [
    { num: "01", title: "Tableau de bord & KPIs", desc: "Indicateurs clés, seuils d'alerte et actions correctives" },
    { num: "02", title: "Gestion des partenaires", desc: "Validation, suspension, modification de statut" },
    { num: "03", title: "Validation des missions", desc: "Workflow preuves, CP boost, création de missions" },
    { num: "04", title: "Commissions & paiements", desc: "Validation ventes, virements, corrections CP" },
    { num: "05", title: "Vérifications KYC / KYB", desc: "Particuliers et entreprises, délais, motifs refus" },
    { num: "06", title: "Produits & branches", desc: "Gestion catalogue, slugs, siteUrl critique" },
    { num: "07", title: "Support & tickets", desc: "Workflow, catégories, délais d'escalade" },
    { num: "08", title: "Communication", desc: "Annonces, notifications, emails transactionnels" },
    { num: "09", title: "Analytics & reporting", desc: "Tableaux de bord, exports CSV comptabilité" },
    { num: "10", title: "Paramètres & sécurité", desc: "Variables critiques, règles Vercel, audit log" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0a2440] to-[#1a3860] p-8 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wider">Usage interne</span>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-blue-200">Confidentiel</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Guide Administrateur</h1>
            <p className="text-blue-100 text-sm max-w-md">
              Procédures complètes pour gérer la plateforme IBIG Partners :
              partenaires, missions, commissions, KYC et paramètres système.
              10 sections · 4 pages A4.
            </p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={generating}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {generating ? (
              <><span className="animate-spin">⏳</span> Génération…</>
            ) : (
              <><span>📄</span> Télécharger PDF Admin</>
            )}
          </button>
        </div>
      </div>

      {/* Avertissement */}
      <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
        <span className="text-2xl mt-0.5">⚠️</span>
        <div>
          <p className="font-bold text-red-800 text-sm">Document à usage interne exclusif</p>
          <p className="text-sm text-red-700 mt-0.5">
            Ce guide contient des procédures et paramètres sensibles (variables d&apos;environnement, règles de validation).
            Ne pas partager avec les partenaires affiliés.
          </p>
        </div>
      </div>

      {/* Sommaire */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Sommaire du guide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map((s) => (
            <div key={s.num} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-red-200 hover:bg-red-50 transition-colors">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a2440] text-white text-xs font-extrabold">
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
      <div className="flex justify-center">
        <button
          onClick={downloadPdf}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-[#0a2440] px-8 py-3 text-sm font-bold text-white hover:bg-[#1a3860] transition-colors disabled:opacity-60"
        >
          {generating ? "Génération en cours…" : "📄 Télécharger le Guide Admin (PDF)"}
        </button>
      </div>
    </div>
  );
}
