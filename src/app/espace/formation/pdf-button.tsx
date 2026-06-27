"use client";

import { STATUS_DETAILS } from "@/lib/constants";

// Génère et télécharge un PDF de la grille de commissions en pur HTML → print
export default function PdfDownloadButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  function generatePdf() {
    const html = buildPdfHtml();
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 500);
  }

  const cls =
    variant === "outline"
      ? "inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold text-white transition"
      : "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 transition shadow";

  return (
    <button onClick={generatePdf} className={cls}>
      📄 Télécharger le guide PDF
    </button>
  );
}

function buildPdfHtml(): string {
  const statusRows = STATUS_DETAILS.map(
    (s) => `
    <tr>
      <td>${s.label}</td>
      <td>${s.sales || "—"}</td>
      <td>${s.direct || "—"}</td>
      <td>${s.team || "—"}</td>
      <td style="font-weight:700;color:#2563eb">${s.bonus}</td>
      <td>${s.advantage}</td>
    </tr>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Guide Commissions IBIG PARTNERS</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 20px; }
  h1 { font-size: 18px; color: #1d4ed8; margin-bottom: 4px; }
  h2 { font-size: 13px; color: #1e40af; margin: 18px 0 6px; border-bottom: 2px solid #dbeafe; padding-bottom: 4px; }
  h3 { font-size: 11px; color: #374151; margin: 12px 0 4px; }
  .subtitle { color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  th { background: #1d4ed8; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; }
  .note { color: #64748b; font-size: 10px; font-style: italic; margin-top: 2px; }
  .section { margin-bottom: 20px; page-break-inside: avoid; }
  .footer { margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; color: #94a3b8; font-size: 10px; }
  @media print { @page { size: A4; margin: 15mm; } }
</style>
</head>
<body>
<h1>📚 Guide Commissions IBIG PARTNERS</h1>
<p class="subtitle">Votre référence complète pour comprendre et maximiser vos revenus d'affiliation.</p>

<div class="section">
<h2>🔢 Le système 3 niveaux</h2>
<table>
<thead><tr><th>Niveau</th><th>Qui</th><th>Taux appliqué</th><th>Exemple SaaS</th></tr></thead>
<tbody>
<tr><td><span class="badge">N1</span></td><td>Vos ventes directes</td><td>Taux plein</td><td>Vous vendez → 20% mois 1</td></tr>
<tr><td><span class="badge">N2</span></td><td>Ventes de vos filleuls</td><td>50% du taux N1</td><td>Votre filleul vend → 10% mois 1</td></tr>
<tr><td><span class="badge">N3</span></td><td>Ventes filleuls de filleuls</td><td>25% du taux N1</td><td>Son filleul vend → 5% mois 1</td></tr>
</tbody>
</table>
</div>

<div class="section">
<h2>📋 Grille complète des taux</h2>

<h3>💻 SaaS mensuels (Scolaby, HRM…)</h3>
<table>
<thead><tr><th>Période</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody>
<tr><td>Mois 1</td><td>20%</td><td>10%</td><td>5%</td></tr>
<tr><td>Mois 2</td><td>15%</td><td>8%</td><td>3%</td></tr>
<tr><td>Mois 3</td><td>10%</td><td>5%</td><td>2%</td></tr>
<tr><td>Mois 4</td><td>5%</td><td>3%</td><td>1%</td></tr>
</tbody>
</table>
<p class="note">Commissions versées chaque mois pendant 4 mois. Après 4 mois le cycle s'arrête pour ce client.</p>

<h3>📅 Abonnements annuels</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody><tr><td>One-shot à la souscription</td><td>20%</td><td>8%</td><td>3%</td></tr></tbody>
</table>

<h3>🎓 Formations catalogue IBIG EDUFORM</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody><tr><td>One-shot</td><td>10%</td><td>5%</td><td>2%</td></tr></tbody>
</table>

<h3>🤝 Formations sur mesure / Contrats entreprises</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody><tr><td>% du coût du marché</td><td>15%</td><td>7,5%</td><td>—</td></tr></tbody>
</table>

<h3>⚙️ IBIG SOFT — Développement sur mesure</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody><tr><td>% de la prestation</td><td>25%</td><td>12,5%</td><td>—</td></tr></tbody>
</table>

<h3>🏠 Immobilier — Vente / Location</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody>
<tr><td>Vente de bien</td><td>25%*</td><td>12,5%*</td><td>—</td></tr>
<tr><td>Location</td><td>25%*</td><td>12,5%*</td><td>—</td></tr>
</tbody>
</table>
<p class="note">* % de la commission de l'agence vendeur.</p>

<h3>🏢 Gérance d'immeuble</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody><tr><td>Par mandat</td><td>1 mois comm.**</td><td>—</td><td>—</td></tr></tbody>
</table>
<p class="note">** 1 mois de commission d'agence versé en 2 fois (50% + 50%).</p>

<h3>📦 Digital Kit IBIG</h3>
<table>
<thead><tr><th>Type</th><th>N1</th><th>N2</th><th>N3</th></tr></thead>
<tbody><tr><td>Prix de vente du kit</td><td>25%</td><td>10%</td><td>5%</td></tr></tbody>
</table>

<h3>🔨 Construction / Opportunités</h3>
<p class="note">Taux négocié au cas par cas. Contactez l'équipe IBIG.</p>
</div>

<div class="section">
<h2>🏆 Les 5 statuts partenaires</h2>
<table>
<thead><tr><th>Statut</th><th>Ventes perso</th><th>Filleuls N1</th><th>Équipe active</th><th>Bonus</th><th>Avantage</th></tr></thead>
<tbody>${statusRows}</tbody>
</table>
<p class="note">Équipe active = N1+N2+N3 ayant effectué au moins 1 vente confirmée. Le bonus s'ajoute à tous les taux de base.</p>
</div>

<div class="section">
<h2>📌 Règles importantes</h2>
<ul style="list-style:disc;padding-left:16px;line-height:1.8">
  <li>Cookie de tracking : <strong>90 jours</strong> après le clic sur votre lien.</li>
  <li>Seuil minimum de versement : <strong>5 000 FCFA</strong>.</li>
  <li>Versement sous <strong>7 jours ouvrables</strong> après encaissement confirmé.</li>
  <li>Les commissions MONTHLY_SUB s'arrêtent après <strong>4 mois</strong> par client.</li>
  <li>Pour les Elite représentants : le représentant officiel d'une zone est celui avec le <strong>score le plus élevé</strong>.</li>
</ul>
</div>

<div class="footer">
<p>IBIG PARTNERS — Guide commissions officiel · ibig-partners.vercel.app · Document généré depuis votre espace partenaire</p>
</div>
</body>
</html>`;
}
