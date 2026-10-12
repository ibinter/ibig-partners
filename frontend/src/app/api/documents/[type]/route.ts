import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  generateCGU,
  generateCharteEthique,
  generateGuideDemarrage,
  generatePlanCompensation,
  generateGuideBonnesPratiques,
  generateKitPresentation,
  generateModeleDevis,
  generateManuelPartenaire,
} from "@/lib/generate-documents";

const DOCUMENT_MAP: Record<string, { fn: () => Buffer; filename: string; label: string }> = {
  cgu:                  { fn: generateCGU,                  filename: "cgu-ibig-partners.pdf",              label: "CGU" },
  "charte-ethique":     { fn: generateCharteEthique,        filename: "charte-ethique-ibig-partners.pdf",   label: "Charte éthique" },
  "guide-demarrage":    { fn: generateGuideDemarrage,       filename: "guide-demarrage-ibig-partners.pdf",  label: "Guide de démarrage" },
  "plan-compensation":  { fn: generatePlanCompensation,     filename: "plan-compensation-ibig-partners.pdf",label: "Plan de compensation" },
  "bonnes-pratiques":   { fn: generateGuideBonnesPratiques, filename: "guide-bonnes-pratiques-ibig.pdf",    label: "Guide bonnes pratiques" },
  "kit-presentation":   { fn: generateKitPresentation,      filename: "kit-presentation-ibig-partners.pdf", label: "Kit de présentation" },
  "modele-devis":       { fn: generateModeleDevis,          filename: "modele-devis-partenaire-ibig.pdf",   label: "Modèle de devis" },
  "manuel-partenaire":  { fn: generateManuelPartenaire,     filename: "manuel-officiel-partenaire-ibig.pdf",label: "Manuel officiel" },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  await requireUser();
  const { type } = await params;
  const doc = DOCUMENT_MAP[type];
  if (!doc) {
    return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
  }
  const buf = doc.fn();
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
