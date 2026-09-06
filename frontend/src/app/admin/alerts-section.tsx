import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Alert = {
  key: string;
  icon: string;
  message: string;
  count: number;
  href: string;
  severity: "critical" | "warning" | "info";
};

export async function AdminAlertsSection() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    pendingApprovals,
    pendingKyb,
    pendingKybDocs,
    oppsNoMatch,
    staleLeads,
    unverifiedPartners,
  ] = await Promise.all([
    // Partenaires en attente de validation
    prisma.user.count({ where: { role: "PARTNER", approved: false } }),
    // KYB soumis en attente de décision admin
    prisma.user.count({ where: { role: "PARTNER", kybStatus: "SUBMITTED" } as any }),
    // Documents KYB PENDING non traités depuis +7j
    (prisma as any).kybDocument.count({
      where: { status: "PENDING", createdAt: { lt: sevenDaysAgo } },
    }),
    // Opportunités APPROVED sans aucun match calculé
    (prisma as any).opportunity.count({
      where: {
        status: "APPROVED",
        matches: { none: {} },
      },
    }),
    // Leads INTERESTED ou CONTACTED sans activité depuis +7j
    (prisma as any).opportunityLead.count({
      where: {
        status: { in: ["INTERESTED", "CONTACTED"] },
        updatedAt: { lt: sevenDaysAgo },
      },
    }),
    // Partenaires actifs non vérifiés depuis +30j
    prisma.user.count({
      where: {
        role: "PARTNER",
        approved: true,
        active: true,
        verificationStatus: { not: "VERIFIED" },
        createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const alerts: Alert[] = [
    pendingApprovals > 0 && {
      key: "approvals",
      icon: "🟡",
      message: `${pendingApprovals} partenaire${pendingApprovals > 1 ? "s" : ""} en attente de validation`,
      count: pendingApprovals,
      href: "/admin/partenaires",
      severity: "critical",
    },
    pendingKyb > 0 && {
      key: "kyb",
      icon: "🟠",
      message: `${pendingKyb} dossier${pendingKyb > 1 ? "s" : ""} KYB soumis non traité${pendingKyb > 1 ? "s" : ""}`,
      count: pendingKyb,
      href: "/admin/kyb",
      severity: "critical",
    },
    pendingKybDocs > 0 && {
      key: "kyb-docs",
      icon: "⏳",
      message: `${pendingKybDocs} document${pendingKybDocs > 1 ? "s" : ""} KYB en attente depuis +7 jours`,
      count: pendingKybDocs,
      href: "/admin/kyb",
      severity: "warning",
    },
    staleLeads > 0 && {
      key: "stale-leads",
      icon: "🔴",
      message: `${staleLeads} lead${staleLeads > 1 ? "s" : ""} sans suivi depuis +7 jours`,
      count: staleLeads,
      href: "/admin/opportunites",
      severity: "critical",
    },
    oppsNoMatch > 0 && {
      key: "no-match",
      icon: "🎯",
      message: `${oppsNoMatch} opportunité${oppsNoMatch > 1 ? "s" : ""} approuvée${oppsNoMatch > 1 ? "s" : ""} sans match calculé`,
      count: oppsNoMatch,
      href: "/admin/opportunites",
      severity: "warning",
    },
    unverifiedPartners > 0 && {
      key: "unverified",
      icon: "🔐",
      message: `${unverifiedPartners} partenaire${unverifiedPartners > 1 ? "s" : ""} actif${unverifiedPartners > 1 ? "s" : ""} non vérifié${unverifiedPartners > 1 ? "s" : ""} depuis +30 jours`,
      count: unverifiedPartners,
      href: "/admin/verifications",
      severity: "info",
    },
  ].filter(Boolean) as Alert[];

  if (alerts.length === 0) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <span className="text-xl">✅</span>
        <p className="text-sm font-medium text-green-800">Tout est à jour — aucune alerte en attente.</p>
      </div>
    );
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  const sorted = alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const severityStyle: Record<string, string> = {
    critical: "border-red-200 bg-red-50 hover:bg-red-100",
    warning: "border-amber-200 bg-amber-50 hover:bg-amber-100",
    info: "border-blue-200 bg-blue-50 hover:bg-blue-100",
  };
  const severityText: Record<string, string> = {
    critical: "text-red-800",
    warning: "text-amber-800",
    info: "text-blue-800",
  };
  const countStyle: Record<string, string> = {
    critical: "bg-red-500 text-white",
    warning: "bg-amber-400 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">
        Alertes ({alerts.length})
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((a) => (
          <Link
            key={a.key}
            href={a.href}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${severityStyle[a.severity]}`}
          >
            <span className="text-lg">{a.icon}</span>
            <p className={`flex-1 text-sm font-medium ${severityText[a.severity]}`}>
              {a.message}
            </p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${countStyle[a.severity]}`}>
              {a.count}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
