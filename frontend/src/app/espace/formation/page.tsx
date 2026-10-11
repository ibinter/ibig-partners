"use client";

import { useState } from "react";

export default function GuideCommissionsPage() {
  const [generating, setGenerating] = useState(false);

  async function downloadPdf() {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = 210;
      const MARGIN = 16;
      const CW = W - MARGIN * 2;
      let y = 0;

      function pb(need = 20) { if (y + need > 272) { doc.addPage(); y = 20; } }

      function header() {
        doc.setFillColor(15, 52, 96);
        doc.rect(0, 0, W, 26, "F");
        doc.setTextColor(255,255,255);
        doc.setFont("helvetica","bold"); doc.setFontSize(14);
        doc.text("IBIG PARTNERS — Guide Complet des Commissions", MARGIN, 11);
        doc.setFont("helvetica","normal"); doc.setFontSize(8);
        doc.text("Grille officielle · Exemples chiffrés · Calcul du bonus de statut", MARGIN, 19);
        doc.text("www.ibigpartners.com", W - MARGIN, 19, { align: "right" });
        y = 32;
      }

      function sTitle(t: string) {
        pb(14);
        doc.setFillColor(220, 230, 255);
        doc.rect(MARGIN, y, CW, 8, "F");
        doc.setTextColor(15,52,96); doc.setFont("helvetica","bold"); doc.setFontSize(10.5);
        doc.text(t, MARGIN + 3, y + 5.5);
        y += 12;
      }

      function sub(t: string) {
        pb(9);
        doc.setTextColor(20,80,160); doc.setFont("helvetica","bold"); doc.setFontSize(9.5);
        doc.text(t, MARGIN, y); y += 6;
      }

      function para(t: string, indent = 0) {
        pb(7);
        doc.setTextColor(50,50,50); doc.setFont("helvetica","normal"); doc.setFontSize(9);
        const lines = doc.splitTextToSize(t, CW - indent);
        doc.text(lines, MARGIN + indent, y);
        y += lines.length * 5 + 2;
      }

      function row(cols: string[], ws: number[], isHead = false, shade = false) {
        pb(7);
        let x = MARGIN;
        const h = 7;
        if (isHead) { doc.setFillColor(15,52,96); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(8.5); }
        else if (shade) { doc.setFillColor(245,248,255); doc.setTextColor(40,40,40); doc.setFont("helvetica","normal"); doc.setFontSize(8.5); }
        else { doc.setFillColor(255,255,255); doc.setTextColor(40,40,40); doc.setFont("helvetica","normal"); doc.setFontSize(8.5); }
        cols.forEach((c, i) => {
          if (isHead) doc.rect(x, y, ws[i], h, "F");
          else { doc.setDrawColor(200,210,230); doc.rect(x, y, ws[i], h, shade ? "FD" : "S"); }
          doc.text(c, x + 2.5, y + 4.8);
          x += ws[i];
        });
        y += h;
      }

      function tip(t: string) {
        pb(12);
        doc.setFillColor(255,248,200);
        doc.roundedRect(MARGIN, y, CW, 10, 2,2,"F");
        doc.setTextColor(100,70,0); doc.setFont("helvetica","bold"); doc.setFontSize(8.5);
        const lines = doc.splitTextToSize("⭐ " + t, CW - 6);
        doc.text(lines, MARGIN + 3, y + (lines.length > 1 ? 4 : 5.5));
        y += lines.length * 5 + 7;
      }

      function sp(n = 4) { y += n; }

      function exBox(title: string, lines2: string[]) {
        pb(14 + lines2.length * 5.5);
        doc.setFillColor(235,245,235);
        doc.roundedRect(MARGIN, y, CW, 8 + lines2.length * 5.5, 2,2,"F");
        doc.setTextColor(0,100,0); doc.setFont("helvetica","bold"); doc.setFontSize(9);
        doc.text("✅ Exemple : " + title, MARGIN + 3, y + 5.5);
        y += 8;
        doc.setFont("helvetica","normal"); doc.setFontSize(8.5); doc.setTextColor(30,70,30);
        lines2.forEach(l => { doc.text(l, MARGIN + 5, y); y += 5.5; });
        y += 3;
      }

      function footer() {
        const pages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pages; i++) {
          doc.setPage(i);
          doc.setDrawColor(200,210,230); doc.line(MARGIN, 284, W - MARGIN, 284);
          doc.setTextColor(150,150,150); doc.setFontSize(7.5); doc.setFont("helvetica","normal");
          doc.text("IBIG PARTNERS — Guide Commissions — Document confidentiel", MARGIN, 289);
          doc.text(`Page ${i} / ${pages}`, W - MARGIN, 289, { align: "right" });
        }
      }

      // ─── CONTENU ───
      header();

      sTitle("1. LE PRINCIPE DES COMMISSIONS MLM 3 NIVEAUX");
      para("Chaque vente générée dans votre réseau produit une commission. Vous gagnez sur VOS ventes directes (N1) mais aussi sur les ventes de vos filleuls (N2) et les filleuls de vos filleuls (N3).");
      sp();
      sub("Les 3 niveaux expliqués");
      row(["Niveau","Qui vend ?","Votre lien","Votre commission"], [20,60,45,49], true);
      row(["N1","Vous-même","Vente directe","Taux plein selon le produit"], [20,60,45,49], false, false);
      row(["N2","Vos filleuls directs","1 intermédiaire","Env. 50% du taux N1"], [20,60,45,49], false, true);
      row(["N3","Filleuls de vos filleuls","2 intermédiaires","Env. 25% du taux N1"], [20,60,45,49], false, false);
      sp(6);
      tip("Les commissions N2 et N3 sont automatiques — vous n'avez rien à faire une fois votre équipe construite. C'est votre revenu passif.");

      sTitle("2. ABONNEMENTS MENSUELS (SaaS) — DÉGRESSIF SUR 4 MOIS");
      para("Les abonnements mensuels génèrent des commissions pendant 4 mois consécutifs, à des taux décroissants. Après 4 mois, la commission s'arrête pour ce client sauf si une nouvelle vente a lieu.");
      sp();
      row(["Mois","N1 (vous)","N2 (filleul)","N3 (filleul du filleul)"], [20,45,45,64], true);
      row(["Mois 1","20%","10%","5%"], [20,45,45,64], false, false);
      row(["Mois 2","15%","8%","3%"], [20,45,45,64], false, true);
      row(["Mois 3","10%","5%","2%"], [20,45,45,64], false, false);
      row(["Mois 4","5%","3%","1%"], [20,45,45,64], false, true);
      sp(6);
      exBox("Abonnement mensuel IBIG Finance à 20 000 FCFA/mois (vous = N1)", [
        "Mois 1 : 20% × 20 000 = 4 000 FCFA",
        "Mois 2 : 15% × 20 000 = 3 000 FCFA",
        "Mois 3 : 10% × 20 000 = 2 000 FCFA",
        "Mois 4 : 5%  × 20 000 = 1 000 FCFA",
        "TOTAL SUR 4 MOIS : 10 000 FCFA pour UN client"
      ]);

      sTitle("3. ABONNEMENTS ANNUELS — ONE-SHOT");
      para("Pour un abonnement annuel, la commission est versée en une seule fois lors de la vente.");
      sp();
      row(["Niveau","Taux","Exemple (100 000 FCFA/an)"], [25,30,119], true);
      row(["N1","20%","20 000 FCFA"], [25,30,119], false, false);
      row(["N2","8%","8 000 FCFA"], [25,30,119], false, true);
      row(["N3","3%","3 000 FCFA"], [25,30,119], false, false);
      sp(6);
      tip("Un client annuel est 4× plus rentable qu'un client mensuel. Orientez vos prospects vers les offres annuelles.");

      sTitle("4. FORMATIONS IBIG EDUFORM — ONE-SHOT");
      para("Les formations du catalogue IBIG EDUFORM génèrent une commission unique à l'achat.");
      sp();
      row(["Niveau","Taux","Exemple (50 000 FCFA)"], [25,30,119], true);
      row(["N1","10%","5 000 FCFA"], [25,30,119], false, false);
      row(["N2","5%","2 500 FCFA"], [25,30,119], false, true);
      row(["N3","2%","1 000 FCFA"], [25,30,119], false, false);

      // Page 2
      doc.addPage(); header(); y = 32;

      sTitle("5. SERVICES & PRODUITS — TAUX DÉFINI PAR PRODUIT");
      para("Pour les services (conseil, prestation) et les produits physiques/digitaux, le taux N1 est défini individuellement sur chaque produit. Les taux N2 et N3 sont calculés automatiquement :");
      sp();
      para("• N2 = 50% du taux N1     • N3 = 25% du taux N1");
      sp(3);
      row(["Branche / Produit","Taux N1","Taux N2","Taux N3"], [70,30,30,44], true);
      row(["IBIG Digital Kits (tous produits)","15%","7,5%","3,75%"], [70,30,30,44], false, false);
      row(["IBIG Immo Trust (la plupart)","10%","5%","2,5%"], [70,30,30,44], false, true);
      row(["Gestion Locative Complète","50%*","25%","12,5%"], [70,30,30,44], false, false);
      row(["Autres services (voir produit)","Taux produit","×50%","×25%"], [70,30,30,44], false, true);
      sp(4);
      para("* Gestion Locative : 50% de la commission d'agence du 1er mois de mandat, versée une fois par mandat.");
      sp();
      exBox("IBIG Digital Kit Premium à 75 000 FCFA, vendu par votre filleul N2 :", [
        "Taux N1 du produit : 15%",
        "Votre commission (N2) : 15% × 50% = 7,5% × 75 000 = 5 625 FCFA",
      ]);

      sTitle("6. BONUS DE STATUT — S'APPLIQUE SUR TOUS LES TAUX");
      para("En progressant dans les statuts, vous bénéficiez d'un bonus qui s'ajoute à TOUS vos taux de commission N1 :");
      sp();
      row(["Statut","Bonus","Impact sur taux N1 abonnement M1","Taux effectif"], [38,20,80,36], true);
      row(["⭐ Starter","0%","20% + 0%","20%"], [38,20,80,36], false, false);
      row(["⭐⭐ Silver","+2%","20% + 2%","22%"], [38,20,80,36], false, true);
      row(["⭐⭐⭐ Gold","+5%","20% + 5%","25%"], [38,20,80,36], false, false);
      row(["🏆 Master","+8%","20% + 8%","28%"], [38,20,80,36], false, true);
      row(["👑 Elite","+12%","20% + 12%","32%"], [38,20,80,36], false, false);
      sp(6);
      exBox("Partenaire Gold vendant un abonnement mensuel M1 à 30 000 FCFA :", [
        "Taux de base N1 mois 1 : 20%",
        "Bonus Gold : +5%",
        "Taux effectif : 25%",
        "Commission : 25% × 30 000 = 7 500 FCFA (au lieu de 6 000 FCFA)"
      ]);
      tip("Atteindre le statut Gold vous rapporte 5 000 FCFA de plus sur une vente à 100 000 FCFA. Sur 20 ventes/mois, c'est +100 000 FCFA.");

      sTitle("7. BOOST COMMISSION CP");
      para("En dépensant vos Credits Points (CP), vous pouvez augmenter temporairement votre commission sur une vente spécifique :");
      sp();
      row(["CP dépensés","Boost accordé","Exemple commission de base 20 000 FCFA"], [35,30,109], true);
      row(["1 000 CP","+1%","20 000 × 21% = 21 000 FCFA (+1 000 FCFA)"], [35,30,109], false, false);
      row(["2 000 CP","+2%","20 000 × 22% = 22 000 FCFA (+2 000 FCFA)"], [35,30,109], false, true);
      row(["3 000 CP","+3%","20 000 × 23% = 23 000 FCFA (+3 000 FCFA)"], [35,30,109], false, false);
      row(["4 000 CP","+4%","20 000 × 24% = 24 000 FCFA (+4 000 FCFA)"], [35,30,109], false, true);
      row(["5 000 CP","+5%","20 000 × 25% = 25 000 FCFA (+5 000 FCFA)"], [35,30,109], false, false);
      sp(4);
      para("Règles : un seul boost par candidature · CP débités immédiatement · Disponible sur missions CASH et MIXED uniquement · Boost visible par l'admin lors de la validation.");

      sTitle("8. EXEMPLES DE REVENUS MENSUELS");
      sub("Partenaire Starter actif (10 ventes directes/mois)");
      row(["Produit","Taux N1","Prix","Commission"], [50,20,40,64], true);
      row(["Abonnement IBIG Finance M1","20%","25 000 FCFA","5 000 FCFA"], [50,20,40,64], false, false);
      row(["Formation EDUFORM","10%","50 000 FCFA","5 000 FCFA"], [50,20,40,64], false, true);
      row(["IBIG Digital Kit","15%","75 000 FCFA","11 250 FCFA"], [50,20,40,64], false, false);
      sp(4);
      para("10 ventes mixtes bien choisies peuvent générer entre 50 000 et 150 000 FCFA/mois dès le statut Starter.");
      sp(4);
      sub("Partenaire Gold avec réseau de 15 filleuls actifs");
      para("Ventes personnelles (10/mois) : ~100 000 FCFA + Bonus Gold (+5%) : ~5 000 FCFA");
      para("Commissions N2 (15 filleuls × 3 ventes × 7,5% moy.) : ~67 500 FCFA");
      para("Commissions N3 (filleuls des filleuls) : ~15 000 à 30 000 FCFA");
      para("TOTAL ESTIMÉ : 185 000 à 200 000 FCFA / mois");
      sp();
      tip("Ces chiffres sont des estimations basées sur la grille officielle. Vos résultats dépendent de votre activité, de la valeur des produits vendus et de l'activité de votre réseau.");

      footer();
      doc.save("Guide-Commissions-IBIG-Partners.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  const sections = [
    { title: "Le principe MLM 3 niveaux", desc: "N1/N2/N3 expliqués avec tableau" },
    { title: "Abonnements mensuels dégressifs", desc: "4 mois × taux décroissants + exemple chiffré" },
    { title: "Abonnements annuels", desc: "One-shot, taux N1/N2/N3" },
    { title: "Formations IBIG EDUFORM", desc: "Catalogue formations, taux par niveau" },
    { title: "Services & Produits", desc: "Taux par branche, Digital Kits, Immo Trust" },
    { title: "Bonus de statut", desc: "Starter → Elite : +0% à +12% sur tous les taux" },
    { title: "Boost Commission CP", desc: "1 000–5 000 CP = +1% à +5% sur une vente" },
    { title: "Exemples de revenus mensuels", desc: "Starter actif et Gold avec réseau" },
  ];

  const gridTable = [
    { type: "Abonnement mensuel M1", n1: "20%", n2: "10%", n3: "5%", note: "Dégressif 4 mois" },
    { type: "Abonnement mensuel M2", n1: "15%", n2: "8%", n3: "3%", note: "" },
    { type: "Abonnement mensuel M3", n1: "10%", n2: "5%", n3: "2%", note: "" },
    { type: "Abonnement mensuel M4", n1: "5%", n2: "3%", n3: "1%", note: "" },
    { type: "Abonnement annuel", n1: "20%", n2: "8%", n3: "3%", note: "One-shot" },
    { type: "Formation / Cours", n1: "10%", n2: "5%", n3: "2%", note: "One-shot" },
    { type: "Service / Produit", n1: "Taux produit", n2: "×50%", n3: "×25%", note: "Variable" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 p-8 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-emerald-200 text-sm font-semibold mb-2 uppercase tracking-wide">Guide officiel</p>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Guide des Commissions</h1>
            <p className="text-emerald-100 text-sm max-w-md">
              Grille complète, exemples chiffrés, bonus de statut, boost CP.
              8 sections · 2 pages A4.
            </p>
          </div>
          <button
            onClick={downloadPdf}
            disabled={generating}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            {generating ? <><span className="animate-spin">⏳</span> Génération…</> : <><span>📄</span> Télécharger PDF</>}
          </button>
        </div>
      </div>

      {/* Grille rapide en ligne */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Grille de commissions (résumé)</h2>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Type de produit</th>
                <th className="px-4 py-3 text-center">N1 (vous)</th>
                <th className="px-4 py-3 text-center">N2</th>
                <th className="px-4 py-3 text-center">N3</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gridTable.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-4 py-2.5 font-medium text-slate-700">{r.type}</td>
                  <td className="px-4 py-2.5 text-center font-bold text-emerald-700">{r.n1}</td>
                  <td className="px-4 py-2.5 text-center text-slate-600">{r.n2}</td>
                  <td className="px-4 py-2.5 text-center text-slate-500">{r.n3}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-400 hidden sm:table-cell">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-2">+ Bonus statut : Silver +2% · Gold +5% · Master +8% · Elite +12% (sur tous les taux N1)</p>
      </div>

      {/* Sommaire */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3">Contenu du guide PDF</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sections.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={downloadPdf}
          disabled={generating}
          className="flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-bold text-white hover:bg-emerald-800 transition-colors disabled:opacity-60"
        >
          {generating ? "Génération en cours…" : "📄 Télécharger le Guide Commissions (PDF)"}
        </button>
      </div>
    </div>
  );
}
