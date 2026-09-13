"use client";

interface Props {
  variant?: "default" | "outline";
}

export default function PdfDownloadButton({ variant = "default" }: Props) {
  const cls =
    variant === "outline"
      ? "inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-semibold text-white transition"
      : "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50 transition shadow";

  return (
    <a
      href="/docs/manuel-partenaire-ibig-v2.docx"
      download="Manuel_Partenaire_IBIG_PARTNERS_V2.docx"
      className={cls}
    >
      📄 Télécharger le guide partenaire V2.0
    </a>
  );
}
