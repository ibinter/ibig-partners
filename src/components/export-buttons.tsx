"use client";

import { Button } from "@/components/ui";

// ─── Export Excel ──────────────────────────────────────────────────────────

export function ExportExcelButton({
  data,
  filename,
  label = "Exporter Excel",
}: {
  data: Record<string, string | number | null>[];
  filename: string;
  label?: string;
}) {
  async function handleExport() {
    const { utils, writeFile } = await import("xlsx");
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Données");
    writeFile(wb, `${filename}.xlsx`);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      ⬇ {label}
    </Button>
  );
}

// ─── Export PDF (jspdf + autotable) ───────────────────────────────────────

export function ExportPDFButton({
  title,
  columns,
  rows,
  filename,
  label = "Exporter PDF",
}: {
  title: string;
  columns: string[];
  rows: (string | number)[][];
  filename: string;
  label?: string;
}) {
  async function handleExport() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // En-tête
    doc.setFontSize(16);
    doc.setTextColor(11, 95, 255);
    doc.text("IBIG PARTNERS", 14, 14);
    doc.setFontSize(11);
    doc.setTextColor(91, 101, 119);
    doc.text(title, 14, 21);
    doc.setFontSize(9);
    doc.text(
      `Exporté le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`,
      14,
      27,
    );

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 32,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [11, 95, 255], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`${filename}.pdf`);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      📄 {label}
    </Button>
  );
}
