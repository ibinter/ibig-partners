import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import KybClient from "./kyb-client";
import { submitKybDocument, deleteKybDocument } from "./actions";

export const dynamic = "force-dynamic";

export default async function KybPage() {
  const user = await requireUser();

  const docs = await (prisma as any).kybDocument.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const kybStatus: string = (user as any).kybStatus ?? "NONE";

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Vérification Entreprise (KYB)"
        subtitle="Faites certifier votre entreprise pour afficher le badge Entreprise vérifiée sur vos opportunités B2B."
      />
      <KybClient
        kybStatus={kybStatus}
        docs={docs.map((d: any) => ({
          id: d.id,
          docType: d.docType,
          docName: d.docName,
          fileUrl: d.fileUrl,
          note: d.note ?? "",
          status: d.status,
          adminNote: d.adminNote ?? "",
          createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
        }))}
        submitAction={submitKybDocument}
        deleteAction={deleteKybDocument}
      />
    </div>
  );
}
