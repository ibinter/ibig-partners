"use client";

import { useState } from "react";

export default function PlanCompensationPage() {
  const [generating, setGenerating] = useState(false);

  async function downloadPdf() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = 297; const H = 210;
      const MARGIN = 16;
      let y = 0;

      function pb(need = 20) { if (y + need > H - 18) { doc.addPage(); y = 22; } }

      function header() {
        doc.setFillColor(15, 52, 96);
        doc.rect(0, 0, W, 24, "F");
        doc.setFillColor(255, 185, 0);
        doc.rect(0, 24, W, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        doc.text("IBIG PARTNERS", MARGIN, 11);
        doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text("Plan de Compensation Officiel — Programme d'Affiliation MLM 3 Niveaux", MARGIN, 19);
        doc.setFontSize(8);
        doc.text("www.ibigpartners.com", W - MARGIN, 19, { align: "right" });
        y = 34;
      }

      function sTitle(t: string) {
        pb(12);
        doc.setFillColor(15, 52, 96);
        doc.rect(MARGIN, y, W - MARGIN * 2, 7.5, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
        doc.text(t, MARGIN + 3, y + 5.2);
        y += 11;
      }

      function para(t: string, color: [number,number,number] = [50,50,50]) {
        pb(8);
        doc.setTextColor(...color);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        const lines = doc.splitTextToSize(t, W - MARGIN * 2);
        doc.text(lines, MARGIN, y);
        y += lines.length * 5 + 2;
      }

      function sp(n = 4) { y += n; }

      function footer() {
        const pages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          doc.setDrawColor(200,210,230); doc.line(MARGIN, H - 10, W - MARGIN, H - 10);
          doc.setTextColor(150,150,150); doc.setFontSize(7); doc.setFont("helvetica","normal");
          doc.text("IBIG PARTNERS — Plan de Compensation — Document confidentiel réservé aux partenaires", MARGIN, H - 5);
          doc.text(`Page ${i} / ${pages}`, W - MARGIN, H - 5, { align: "right" });
        }
      }

      // ─── PAGE 1 — SCHÉMA PYRAMIDAL ───
      header();

      // Titre central page 1
      doc.setTextColor(15, 52, 96);
      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.text("STRUCTURE MLM 3 NIVEAUX — COMMENT ÇA MARCHE ?", W / 2, y + 2, { align: "center" });
      y += 10;

      // Dessin pyramide MLM
      const cx = W / 2;

      // Vous (sommet)
      doc.setFillColor(15, 52, 96);
      doc.roundedRect(cx - 35, y, 70, 18, 3, 3, "F");
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text("VOUS", cx, y + 7.5, { align: "center" });
      doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text("(Partenaire IBIG)", cx, y + 13.5, { align: "center" });
      const topY = y + 18;

      y += 30;

      // N1 — 3 filleuls
      const n1Positions = [cx - 80, cx, cx + 80];
      const n1Labels = ["Filleul N1 — A", "Filleul N1 — B", "Filleul N1 — C"];
      n1Positions.forEach((nx, idx) => {
        // Ligne depuis vous
        doc.setDrawColor(15, 52, 96); doc.setLineWidth(0.5);
        doc.line(cx, topY, nx + 28, y);
        // Boîte N1
        doc.setFillColor(30, 100, 200);
        doc.roundedRect(nx, y, 56, 14, 2, 2, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
        doc.text(n1Labels[idx], nx + 28, y + 5.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        doc.text("Commission sur vos ventes :", nx + 28, y + 10, { align: "center" });
      });
      const n1Y = y + 14;
      y += 26;

      // N2 — 3 filleuls (un par N1)
      const n2Positions = [cx - 80, cx, cx + 80];
      const n2Labels = ["Filleul N2 (de A)", "Filleul N2 (de B)", "Filleul N2 (de C)"];
      n2Positions.forEach((nx, idx) => {
        doc.setDrawColor(30, 100, 200); doc.setLineWidth(0.4);
        doc.line(n1Positions[idx] + 28, n1Y, nx + 28, y);
        doc.setFillColor(80, 160, 100);
        doc.roundedRect(nx, y, 56, 14, 2, 2, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8);
        doc.text(n2Labels[idx], nx + 28, y + 5.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
        doc.text("Env. 50% du taux N1", nx + 28, y + 10, { align: "center" });
      });
      const n2Y = y + 14;
      y += 26;

      // N3 — 3 filleuls
      const n3Positions = [cx - 80, cx, cx + 80];
      const n3Labels = ["Filleul N3 (de N2-A)", "Filleul N3 (de N2-B)", "Filleul N3 (de N2-C)"];
      n3Positions.forEach((nx, idx) => {
        doc.setDrawColor(80, 160, 100); doc.setLineWidth(0.3);
        doc.line(n2Positions[idx] + 28, n2Y, nx + 28, y);
        doc.setFillColor(180, 100, 30);
        doc.roundedRect(nx, y, 56, 14, 2, 2, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
        doc.text(n3Labels[idx], nx + 28, y + 5.5, { align: "center" });
        doc.setFont("helvetica", "normal"); doc.setFontSize(7);
        doc.text("Env. 25% du taux N1", nx + 28, y + 10, { align: "center" });
      });
      y += 22;

      // Légende
      doc.setFillColor(240, 245, 255);
      doc.roundedRect(MARGIN, y, (W - MARGIN * 2) * 0.65, 16, 2, 2, "F");
      doc.setTextColor(15, 52, 96); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text("Lecture du schéma :", MARGIN + 3, y + 5.5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("• Bleu foncé = Vous (ventes directes = taux plein)", MARGIN + 3, y + 11);
      doc.text("• Bleu clair = N1 (vos filleuls directs)  • Vert = N2  • Marron = N3", MARGIN + 3, y + 16);
      y += 20;

      doc.setFillColor(255, 248, 200);
      doc.roundedRect(W - MARGIN - 85, y - 20, 85, 18, 2, 2, "F");
      doc.setTextColor(100, 70, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      doc.text("⭐ La force du MLM :", W - MARGIN - 82, y - 14);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("Plus votre réseau est profond,", W - MARGIN - 82, y - 9);
      doc.text("plus vos revenus passifs grandissent.", W - MARGIN - 82, y - 4);

      // ─── PAGE 2 — STATUTS ET REVENUS ───
      doc.addPage(); header(); y = 34;

      sTitle("LES 5 STATUTS — CONDITIONS ET AVANTAGES");

      const statuts = [
        { s: "⭐ STARTER",  cond: "Inscription validée",                       sales: "0 ventes",    filleuls: "0",    team: "0",    bonus: "+0%",  color: [100,110,130] as [number,number,number],  bg: [240,242,248] as [number,number,number] },
        { s: "⭐⭐ SILVER",  cond: "10 ventes confirmées",                       sales: "10 ventes",   filleuls: "0",    team: "0",    bonus: "+2%",  color: [30,100,200] as [number,number,number],   bg: [235,242,255] as [number,number,number] },
        { s: "⭐⭐⭐ GOLD",  cond: "25 ventes + 10 filleuls directs + 20 actifs",sales: "25 ventes",   filleuls: "10",   team: "20",   bonus: "+5%",  color: [160,110,0] as [number,number,number],    bg: [255,248,220] as [number,number,number] },
        { s: "🏆 MASTER",   cond: "50 ventes + 25 filleuls directs + 50 actifs",sales: "50 ventes",   filleuls: "25",   team: "50",   bonus: "+8%",  color: [100,30,180] as [number,number,number],   bg: [245,235,255] as [number,number,number] },
        { s: "👑 ELITE",    cond: "100 ventes + 50 filleuls + 100 actifs",       sales: "100 ventes",  filleuls: "50",   team: "100",  bonus: "+12%", color: [180,110,0] as [number,number,number],    bg: [255,250,230] as [number,number,number] },
      ];

      // Header tableau
      const ws = [38, 75, 26, 22, 22, 22, 60];
      doc.setFillColor(15, 52, 96);
      let tx = MARGIN;
      const tHeaders = ["Statut", "Condition", "Ventes", "Filleuls", "Équipe", "Bonus", "Avantage principal"];
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(8.5);
      tHeaders.forEach((h, i) => {
        doc.rect(tx, y, ws[i], 8, "F");
        doc.text(h, tx + 2, y + 5.5);
        tx += ws[i];
      });
      y += 8;

      const avantages = [
        "Accès complet à la plateforme",
        "Kit marketing premium",
        "Badge Ambassadeur IBIG",
        "Représentant communal officiel",
        "Représentant Pays IBIG SARL",
      ];

      statuts.forEach((s, idx) => {
        pb(9);
        tx = MARGIN;
        const rowH = 9;
        const vals = [s.s, s.cond, s.sales, s.filleuls, s.team, s.bonus, avantages[idx]];
        vals.forEach((v, i) => {
          doc.setFillColor(...s.bg);
          doc.setDrawColor(200, 210, 230);
          doc.rect(tx, y, ws[i], rowH, "FD");
          doc.setTextColor(...s.color);
          doc.setFont("helvetica", i === 5 ? "bold" : "normal"); doc.setFontSize(8);
          const lines = doc.splitTextToSize(v, ws[i] - 4);
          doc.text(lines, tx + 2, y + (rowH / 2) + 1.5);
          tx += ws[i];
        });
        y += rowH;
      });

      y += 8;

      sTitle("SIMULATION DE REVENUS SELON LE NIVEAU D'ACTIVITÉ");

      const sims = [
        { profil: "Débutant actif", ventes: 5, filleuls: 2, statut: "Starter", rev: "25 000 – 50 000" },
        { profil: "Partenaire régulier", ventes: 10, filleuls: 5, statut: "Silver", rev: "80 000 – 120 000" },
        { profil: "Partenaire confirmé", ventes: 20, filleuls: 15, statut: "Gold", rev: "200 000 – 350 000" },
        { profil: "Master Partner", ventes: 30, filleuls: 30, statut: "Master", rev: "400 000 – 700 000" },
        { profil: "Elite Représentant", ventes: 50, filleuls: 60, statut: "Elite", rev: "700 000 – 1 500 000+" },
      ];

      const sw = [50, 26, 26, 32, 55];
      doc.setFillColor(15, 52, 96); tx = MARGIN;
      ["Profil", "Ventes/mois", "Filleuls actifs", "Statut", "Revenus mensuels estimés (FCFA)"].forEach((h, i) => {
        doc.rect(tx, y, sw[i], 8, "F");
        doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(8.5);
        doc.text(h, tx + 2, y + 5.5);
        tx += sw[i];
      });
      y += 8;

      sims.forEach((s, idx) => {
        pb(8);
        tx = MARGIN;
        const rowH = 8;
        [s.profil, String(s.ventes), String(s.filleuls), s.statut, s.rev].forEach((v, i) => {
          doc.setFillColor(idx % 2 === 0 ? 248 : 240, idx % 2 === 0 ? 252 : 248, idx % 2 === 0 ? 248 : 245);
          doc.setDrawColor(200, 210, 230);
          doc.rect(tx, y, sw[i], rowH, "FD");
          doc.setTextColor(i === 4 ? 0 : 50, i === 4 ? 120 : 50, i === 4 ? 0 : 50);
          doc.setFont("helvetica", i === 4 ? "bold" : "normal"); doc.setFontSize(8.5);
          doc.text(v, tx + 2, y + 5.2);
          tx += sw[i];
        });
        y += rowH;
      });

      y += 6;
      doc.setFillColor(255, 249, 220);
      doc.roundedRect(MARGIN, y, W - MARGIN * 2, 12, 2, 2, "F");
      doc.setTextColor(100, 70, 0); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("⭐ Ces estimations supposent une activité régulière (2h/jour minimum) et des produits variés vendus.", MARGIN + 3, y + 5.5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
      doc.text("Les revenus réels peuvent être inférieurs ou supérieurs selon votre marché, vos produits et l'activité de votre réseau.", MARGIN + 3, y + 10);

      footer();
      doc.save("Plan-Compensation-IBIG-Partners.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const statuts = [
    { label: "⭐ Starter", cond: "Inscription validée", bonus: "+0%", color: "bg-slate-100 text-slate-700" },
    { label: "⭐⭐ Silver", cond: "10 ventes confirmées", bonus: "+2%", color: "bg-blue-100 text-blue-700" },
    { label: "⭐⭐⭐ Gold", cond: "25 ventes + 10 filleuls + 20 actifs", bonus: "+5%", color: "bg-amber-100 text-amber-700" },
    { label: "🏆 Master", cond: "50 ventes + 25 filleuls + 50 actifs", bonus: "+8%", color: "bg-violet-100 text-violet-700" },
    { label: "👑 Elite", cond: "100 ventes + 50 filleuls + 100 actifs", bonus: "+12%", color: "bg-yellow-100 text-yellow-700" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0f3460] via-[#1a5276] to-[#0d6e88] p-8 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-blue-200 text-sm font-semibold mb-2 uppercase tracking-wide">Document officiel</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Plan de Compensation</h1>
            <p className="text-blue-100 text-sm max-w-md">
              Schéma complet du MLM 3 niveaux, progression des statuts et simulation de revenus.
              Format paysage A4 — 2 pages.
            </p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={generating}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0f3460] hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            {generating ? <><span className="animate-spin">⏳</span> Génération…</> : <><span>📊</span> Télécharger PDF</>}
          </button>
        </div>
      </div>

      {/* Schéma MLM simplifié */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Structure MLM 3 niveaux</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {/* Vous */}
          <div className="flex justify-center mb-4">
            <div className="rounded-xl bg-[#0f3460] text-white px-8 py-3 text-center font-bold text-sm shadow-lg">
              VOUS (Partenaire IBIG)
              <div className="text-xs font-normal text-blue-200 mt-0.5">Commissions taux plein</div>
            </div>
          </div>
          {/* Ligne */}
          <div className="flex justify-center mb-2"><div className="w-px h-6 bg-blue-300" /></div>
          {/* N1 */}
          <div className="flex justify-center gap-3 mb-2 flex-wrap">
            {["Filleul N1 — A", "Filleul N1 — B", "Filleul N1 — C"].map(l => (
              <div key={l} className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-center text-xs font-semibold shadow">
                {l}<div className="text-[10px] font-normal text-blue-200 mt-0.5">Vous gagnez N2 sur eux</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mb-2"><div className="text-xs text-blue-400">↓ leurs filleuls ↓</div></div>
          {/* N2 */}
          <div className="flex justify-center gap-3 mb-2 flex-wrap">
            {["N2 (de A)", "N2 (de B)", "N2 (de C)"].map(l => (
              <div key={l} className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-center text-xs font-semibold shadow">
                {l}<div className="text-[10px] font-normal text-emerald-200 mt-0.5">~50% du taux N1</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mb-2"><div className="text-xs text-emerald-400">↓ leurs filleuls ↓</div></div>
          {/* N3 */}
          <div className="flex justify-center gap-3 flex-wrap">
            {["N3 (de N2-A)", "N3 (de N2-B)", "N3 (de N2-C)"].map(l => (
              <div key={l} className="rounded-xl bg-amber-600 text-white px-4 py-2 text-center text-xs font-semibold shadow">
                {l}<div className="text-[10px] font-normal text-amber-200 mt-0.5">~25% du taux N1</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            Chaque niveau supplémentaire génère des revenus automatiques pour vous.
          </p>
        </div>
      </div>

      {/* Statuts */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Progression des statuts</h2>
        <div className="space-y-2">
          {statuts.map((s) => (
            <div key={s.label} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${s.color.includes("slate") ? "border-slate-200" : s.color.includes("blue") ? "border-blue-200" : s.color.includes("amber") ? "border-amber-200" : s.color.includes("violet") ? "border-violet-200" : "border-yellow-200"} bg-white`}>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.color}`}>{s.label}</span>
                <span className="text-sm text-slate-600">{s.cond}</span>
              </div>
              <span className="font-bold text-emerald-700 text-sm">{s.bonus}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={downloadPdf}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-[#0f3460] px-8 py-3 text-sm font-bold text-white hover:bg-[#1a5276] transition-colors disabled:opacity-60"
        >
          {generating ? "Génération en cours…" : "📊 Télécharger le Plan de Compensation (PDF)"}
        </button>
      </div>
    </div>
  );
}
