import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import {
  updateOpportunity, sendOpportunityMessage,
  approveOpportunity, rejectOpportunity,
  broadcastOpportunity,
  quickSplitOpportunity,
  addOpportunityShare, removeOpportunityShare,
  confirmOpportunityShares, markSharePaid,
  updateLeadStatus, addLeadNote,
  negotiateOpportunityCommission,
  adminCreateOpportunity,
} from "../actions";
import OpportunitesClient from "./opportunites-client";
import { ExportButton } from "@/components/export-button";
import { computeOpportunityMatches, inviteMatchedPartner, declineMatch } from "./matching-actions";

export const dynamic = "force-dynamic";

export default async function OpportunitesPage() {
  await requireAdmin();

  const safeQuery = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch { return fallback; }
  };

  const [opportunities, allMatches, allLeads, allActivities] = await Promise.all([
    safeQuery<any[]>(() => (prisma as any).opportunity.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: { select: { firstName: true, lastName: true, code: true, phone: true } },
        messages: { orderBy: { createdAt: "asc" } },
        _count: { select: { leads: true } },
        shares: {
          include: { user: { select: { firstName: true, lastName: true, code: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }), []),
    safeQuery<any[]>(() => (prisma as any).opportunityMatch.findMany({
      orderBy: { score: "desc" },
      include: { user: { select: { firstName: true, lastName: true, code: true, status: true } } },
    }), []),
    safeQuery<any[]>(() => (prisma as any).opportunityLead.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, code: true, status: true, phone: true } } },
    }), []),
    safeQuery<any[]>(() => (prisma as any).opportunityActivity.findMany({ orderBy: { createdAt: "asc" } }), []),
  ]);

  const matchesByOpp = new Map<string, any[]>();
  for (const m of allMatches) {
    if (!matchesByOpp.has(m.opportunityId)) matchesByOpp.set(m.opportunityId, []);
    matchesByOpp.get(m.opportunityId)!.push(m);
  }

  const leadsByOpp = new Map<string, any[]>();
  for (const l of allLeads) {
    if (!leadsByOpp.has(l.opportunityId)) leadsByOpp.set(l.opportunityId, []);
    leadsByOpp.get(l.opportunityId)!.push(l);
  }

  const activitiesByOpp = new Map<string, any[]>();
  for (const a of allActivities) {
    if (!activitiesByOpp.has(a.opportunityId)) activitiesByOpp.set(a.opportunityId, []);
    activitiesByOpp.get(a.opportunityId)!.push(a);
  }

  const rows = opportunities.map((o: any) => ({
    id: o.id,
    code: o.code ?? "",
    title: o.title,
    category: o.category ?? "AUTRE",
    description: o.description,
    estimatedValue: o.estimatedValue,
    status: o.status,
    handler: o.handler ?? "",
    visibility: o.visibility ?? "PRIVATE",
    commission: o.commission ?? 0,
    commissionType: o.commissionType ?? "FIXED",
    proposedCommission: o.proposedCommission ?? 0,
    proposedCommissionType: o.proposedCommissionType ?? "FIXED",
    partnerCommission: o.partnerCommission ?? 0,
    partnerCommissionType: o.partnerCommissionType ?? "FIXED",
    adminNote: o.adminNote ?? "",
    leadCount: o._count?.leads ?? 0,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
    partnerName: o.user ? `${o.user.firstName ?? ""} ${o.user.lastName ?? ""}`.trim() : "—",
    partnerCode: o.user?.code ?? "",
    partnerPhone: o.user?.phone ?? "",
    messages: (o.messages ?? []).map((m: any) => ({
      id: m.id,
      fromAdmin: m.fromAdmin,
      senderName: m.senderName,
      body: m.body,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    })),
    shares: (o.shares ?? []).map((s: any) => ({
      id: s.id,
      userId: s.userId,
      partnerName: s.user ? `${s.user.firstName ?? ""} ${s.user.lastName ?? ""}`.trim() : "—",
      partnerCode: s.user?.code ?? "",
      role: s.role,
      shareAmount: s.shareAmount,
      shareType: s.shareType,
      note: s.note ?? "",
      status: s.status,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
    })),
    matches: (matchesByOpp.get(o.id) ?? []).map((m: any) => ({
      id: m.id,
      userId: m.userId,
      partnerName: m.user ? `${m.user.firstName ?? ""} ${m.user.lastName ?? ""}`.trim() : "—",
      partnerCode: m.user?.code ?? "",
      partnerStatus: m.user?.status ?? "",
      score: m.score,
      status: m.status,
    })),
    leads: (leadsByOpp.get(o.id) ?? []).map((l: any) => ({
      id: l.id,
      userId: l.userId,
      partnerName: l.user ? `${l.user.firstName ?? ""} ${l.user.lastName ?? ""}`.trim() : "—",
      partnerCode: l.user?.code ?? "",
      partnerStatus: l.user?.status ?? "",
      partnerPhone: l.user?.phone ?? "",
      status: l.status,
      note: l.note ?? "",
      result: l.result ?? "",
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : String(l.createdAt),
    })),
    activities: (activitiesByOpp.get(o.id) ?? []).map((a: any) => ({
      id: a.id,
      leadId: a.leadId ?? null,
      type: a.type,
      content: a.content,
      createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : String(a.createdAt),
    })),
  }));

  const CATEGORIES = [
    "FORMATION","DIGITAL","INFORMATIQUE","IMMOBILIER","BTP","CONSEIL","FINANCEMENT",
    "COMMERCIAL","PARTENARIAT","MISE_EN_RELATION","EMPLOI_RH","EVENEMENTIEL",
    "MARKETING","SERVICES","COMMERCE","LOGISTIQUE","SANTE","AGRI","ENERGIE",
    "INTERNATIONAL","AUTRE",
  ];
  const CATEGORY_LABELS: Record<string, string> = {
    FORMATION:"🎓 Formation", DIGITAL:"💻 Digital & Web", INFORMATIQUE:"⚙️ Logiciels & IT",
    IMMOBILIER:"🏠 Immobilier", BTP:"🏗️ BTP & Construction", CONSEIL:"📋 Conseil",
    FINANCEMENT:"💰 Financement", COMMERCIAL:"🤝 Commercial", PARTENARIAT:"🌐 Partenariat",
    MISE_EN_RELATION:"🔗 Mise en relation", EMPLOI_RH:"👥 Emploi & RH",
    EVENEMENTIEL:"🎪 Événementiel", MARKETING:"📢 Marketing", SERVICES:"🛠️ Services B2B",
    COMMERCE:"🛒 Commerce", LOGISTIQUE:"🚚 Logistique", SANTE:"🏥 Santé",
    AGRI:"🌱 Agriculture", ENERGIE:"⚡ Énergie", INTERNATIONAL:"🌍 International",
    AUTRE:"💡 Autre",
  };

  const { SubmitButton: SB } = await import("@/components/submit-button");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunités B2B"
        subtitle="Pistes commerciales soumises par les partenaires — approuvez pour les rendre visibles à tout le réseau."
        action={<ExportButton type="opportunites" label="Exporter CSV" />}
      />

      {/* ── Créer une opportunité (admin) ── */}
      <details className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden group">
        <summary className="cursor-pointer px-5 py-3 font-semibold text-blue-800 text-sm flex items-center gap-2 select-none list-none">
          <span className="text-lg">➕</span> Créer une opportunité / annonce / affaire
          <span className="ml-auto text-blue-400 text-xs group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <form action={adminCreateOpportunity} className="px-5 pb-5 pt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-blue-100 bg-white">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Titre *</label>
            <input name="title" required placeholder="Ex : Recherche partenaire commercial immobilier Abidjan" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Catégorie *</label>
            <select name="category" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Visibilité</label>
            <select name="visibility" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
              <option value="PUBLIC">🌐 Public (visible par tous les partenaires)</option>
              <option value="PRIVATE">🔒 Privé (visible seulement par invitation)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
            <textarea name="description" required rows={4} placeholder="Décrivez l'opportunité, le besoin client, le contexte, les attentes…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Valeur estimée (FCFA)</label>
            <input name="estimatedValue" type="number" min="0" placeholder="0" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Commission partenaire</label>
              <input name="partnerCommission" type="number" min="0" placeholder="0" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
              <select name="partnerCommissionType" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option value="FIXED">FCFA</option>
                <option value="PERCENT">%</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date limite</label>
            <input name="deadline" type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note interne (admin)</label>
            <input name="adminNote" placeholder="Note visible uniquement en admin" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <SB variant="primary" pendingLabel="Création…">✅ Publier l&apos;opportunité</SB>
          </div>
        </form>
      </details>

      <OpportunitesClient
        rows={rows}
        updateAction={updateOpportunity}
        messageAction={sendOpportunityMessage}
        approveAction={approveOpportunity}
        rejectAction={rejectOpportunity}
        addShareAction={addOpportunityShare}
        removeShareAction={removeOpportunityShare}
        confirmSharesAction={confirmOpportunityShares}
        markSharePaidAction={markSharePaid}
        computeMatchesAction={computeOpportunityMatches}
        inviteMatchAction={inviteMatchedPartner}
        declineMatchAction={declineMatch}
        updateLeadStatusAction={updateLeadStatus}
        addLeadNoteAction={addLeadNote}
        broadcastAction={broadcastOpportunity}
        quickSplitAction={quickSplitOpportunity}
        negotiateCommissionAction={negotiateOpportunityCommission}
      />
    </div>
  );
}
