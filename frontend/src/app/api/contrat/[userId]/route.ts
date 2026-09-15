import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContratPDF } from "@/lib/generate-contrat";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  // Seul l'utilisateur lui-même (ou un admin) peut télécharger son contrat
  const me = await requireUser();
  if (me.id !== userId && me.role !== "ADMIN" && me.role !== "SUPERADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Récupérer les données utilisateur + vérification approuvée
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      code: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      partnerType: true,
      orgName: true,
      approved: true,
      verificationStatus: true,
    },
  });

  if (!user || !user.approved || user.verificationStatus !== "VERIFIED") {
    return new NextResponse("Compte non vérifié", { status: 404 });
  }

  const verif = await (prisma as any).verificationRequest.findFirst({
    where: { userId, status: "APPROVED" },
    orderBy: { reviewedAt: "desc" },
    select: {
      fullName: true,
      country: true,
      city: true,
      idType: true,
      idNumber: true,
      reviewedAt: true,
    },
  });

  if (!verif) {
    return new NextResponse("Dossier de vérification introuvable", { status: 404 });
  }

  const pdfBuffer = generateContratPDF({
    fullName: verif.fullName || `${user.firstName} ${user.lastName}`,
    country: verif.country || "",
    city: verif.city || "",
    idType: verif.idType || "Pièce d'identité",
    idNumber: verif.idNumber || "",
    affiliateCode: user.code,
    email: user.email,
    phone: user.phone,
    partnerType: user.partnerType || "INDIVIDUAL",
    orgName: user.orgName,
    approvedAt: verif.reviewedAt ? new Date(verif.reviewedAt) : new Date(),
  });

  const filename = `contrat-ibig-partners-${user.code}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
