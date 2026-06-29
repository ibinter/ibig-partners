"use client";
import { useState } from "react";

interface Props {
  completed: number;
  total: number;
  partnerName: string;
  partnerCode: string;
}

/**
 * Bannière de certification — affiche la progression et permet de télécharger
 * le certificat IBIG PARTNERS quand l'utilisateur a complété 80% des modules.
 */
export function CertificationBanner({ completed, total, partnerName, partnerCode }: Props) {
  const [downloading, setDownloading] = useState(false);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const canCertify = pct >= 80;

  const download = async () => {
    setDownloading(true);
    try {
      // Génération PDF côté client avec jsPDF
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

      // Fond bleu
      doc.setFillColor(11, 79, 224);
      doc.rect(0, 0, 297, 210, "F");

      // Cadre intérieur blanc
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, 15, 267, 180, 4, 4, "F");

      // Bordure dorée
      doc.setDrawColor(245, 183, 61);
      doc.setLineWidth(1);
      doc.roundedRect(20, 20, 257, 170, 3, 3, "S");

      // Logo / Titre
      doc.setFontSize(11);
      doc.setTextColor(11, 79, 224);
      doc.setFont("helvetica", "bold");
      doc.text("IBIG PARTNERS", 148.5, 35, { align: "center" });

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("INTERMARK BUSINESS INTERNATIONAL GROUP SARL", 148.5, 41, { align: "center" });

      // Titre principal
      doc.setFontSize(28);
      doc.setTextColor(15, 23, 41);
      doc.setFont("helvetica", "bold");
      doc.text("CERTIFICAT DE FORMATION", 148.5, 65, { align: "center" });

      // Décoration
      doc.setDrawColor(245, 183, 61);
      doc.setLineWidth(0.6);
      doc.line(110, 72, 187, 72);

      // Texte
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text("Il est attribué à", 148.5, 87, { align: "center" });

      // Nom
      doc.setFontSize(24);
      doc.setTextColor(11, 79, 224);
      doc.setFont("helvetica", "bold");
      doc.text(partnerName, 148.5, 102, { align: "center" });

      // Décoration sous nom
      doc.setDrawColor(11, 79, 224);
      doc.setLineWidth(0.4);
      const nameWidth = doc.getTextWidth(partnerName) * 0.4;
      doc.line(148.5 - nameWidth, 106, 148.5 + nameWidth, 106);

      // Code partenaire
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text(`Code partenaire : ${partnerCode}`, 148.5, 114, { align: "center" });

      // Description
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      const desc1 = `pour avoir suivi avec succès le parcours de formation`;
      const desc2 = `IBIG PARTNERS — Vendeur certifié`;
      doc.text(desc1, 148.5, 130, { align: "center" });
      doc.setFont("helvetica", "bold");
      doc.text(desc2, 148.5, 138, { align: "center" });

      // Stats
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`${completed} modules complétés sur ${total} (${pct}%)`, 148.5, 148, { align: "center" });

      // Date
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
      doc.setFontSize(9);
      doc.text(`Délivré le ${dateStr} · Abidjan, Côte d'Ivoire`, 148.5, 158, { align: "center" });

      // Signature
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("La Direction IBIG SARL", 220, 180);
      doc.setDrawColor(120, 120, 120);
      doc.line(195, 178, 260, 178);

      // QR / ID
      doc.setFontSize(7);
      doc.text(`Certif. ID : IBIG-${partnerCode}-${Date.now().toString(36).toUpperCase()}`, 35, 185);

      doc.save(`Certificat-IBIG-PARTNERS-${partnerCode}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du certificat. Réessayez.");
    } finally {
      setDownloading(false);
    }
  };

  if (total === 0) return null;

  return (
    <div
      data-testid="certification-banner"
      className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-200 p-5 shadow-sm relative"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-gold-500" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md text-2xl">
            🎓
          </div>
          <div>
            <h3 className="font-extrabold text-ink text-lg leading-tight">
              Parcours Certifiant IBIG
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              {canCertify
                ? "🎉 Bravo ! Vous pouvez télécharger votre certificat officiel."
                : `Atteignez ${Math.ceil(total * 0.8)} modules complétés pour obtenir votre certificat.`}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 w-48 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    canCertify
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                      : "bg-gradient-to-r from-amber-400 via-orange-500 to-gold-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-amber-700">
                {completed}/{total} · {pct}%
              </span>
            </div>
          </div>
        </div>

        <button
          data-testid="download-certificate"
          onClick={download}
          disabled={!canCertify || downloading}
          className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold shadow-md transition-all ${
            canCertify
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:-translate-y-0.5 hover:shadow-xl"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          {downloading ? (
            "Génération…"
          ) : canCertify ? (
            <>📜 Télécharger mon certificat</>
          ) : (
            "🔒 Certificat verrouillé"
          )}
        </button>
      </div>
    </div>
  );
}
