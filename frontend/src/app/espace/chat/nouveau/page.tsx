import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { STATUS_LABELS } from "@/lib/constants";
import { StartConversationButton } from "./StartConversationButton";
import NouveauClient from "./nouveau-client";

export const dynamic = "force-dynamic";

export default async function NouvelleConversationPage() {
  const user = await requireUser();

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN";
  const filleulCount = isAdmin ? 1 : await prisma.user.count({ where: { sponsorId: user.id } });

  if (filleulCount === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/espace/chat" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 transition">
            ← Retour
          </Link>
        </div>
        <PageHeader title="Nouvelle conversation" subtitle="Disponible dès votre premier filleul" />
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-sm text-slate-600 mb-4">Recrutez votre premier affilié pour débloquer la messagerie.</p>
          <Link href="/espace/reseau" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition shadow">
            Voir mon réseau →
          </Link>
        </div>
      </div>
    );
  }

  const filleuls = await prisma.user.findMany({
    where: isAdmin
      ? { active: true, id: { not: user.id } }
      : { sponsorId: user.id, active: true },
    orderBy: [{ status: "desc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      photoUrl: true,
      city: true,
    },
  });

  // Compter les ventes confirmées pour chaque filleul
  const salesCounts = await prisma.sale.groupBy({
    by: ["sellerId"],
    where: {
      sellerId: { in: filleuls.map((f) => f.id) },
      status: "CONFIRMED",
    },
    _count: { id: true },
  });
  const salesMap = new Map(salesCounts.map((s) => [s.sellerId, s._count.id]));

  const contacts = filleuls.map((f) => ({
    id: f.id,
    firstName: f.firstName ?? "",
    lastName:  f.lastName ?? "",
    statusLabel: STATUS_LABELS[f.status] ?? f.status,
    photoUrl: f.photoUrl ?? null,
    city: f.city ?? null,
    salesCount: salesMap.get(f.id) ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/espace/chat" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 transition">
          ← Retour
        </Link>
      </div>

      <PageHeader
        title="Nouvelle conversation"
        subtitle={isAdmin ? `${contacts.length} affilié(s)` : `${contacts.length} filleul${contacts.length !== 1 ? "s" : ""} direct${contacts.length !== 1 ? "s" : ""}`}
      />

      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
          <p className="text-3xl mb-3">👥</p>
          <p className="text-sm text-slate-500 font-semibold">Aucun filleul direct actif</p>
          <p className="text-xs text-slate-400 mt-1">Partagez votre lien de parrainage pour recruter.</p>
          <Link href="/espace/reseau" className="mt-3 inline-block text-xs font-bold text-blue-600 hover:underline">
            Mon réseau →
          </Link>
        </div>
      ) : (
        <NouveauClient contacts={contacts} />
      )}
    </div>
  );
}
