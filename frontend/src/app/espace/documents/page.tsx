import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireUser();
  const contract = await (prisma as any).contract.findUnique({
    where: { userId: user.id },
  });
  const isVerified = user.verificationStatus === "VERIFIED";
  const hasSigned = !!contract?.confirmed;

  // ── Section 1 : Documents personnels (liés au compte) ──────────────────────
  const personalDocs = [
    {
      id: "contrat",
      label: "Mon Contrat de Partenariat",
      desc: "Contrat signé entre vous et IBIG SARL. Document officiel et juridiquement opposable.",
      icon: "📋",
      badge: hasSigned ? "Signé" : "Non signé",
      badgeColor: hasSigned ? "emerald" : "amber",
      href: isVerified && hasSigned ? `/api/contrat/${user.id}` : null,
      actionLabel: hasSigned ? "Télécharger PDF" : "Signer",
      actionHref: hasSigned ? (isVerified ? `/api/contrat/${user.id}` : null) : "/espace/contrat",
      pages: "4 pages",
      note: !hasSigned ? "Signez votre contrat pour accéder à votre espace" : (!isVerified ? "Compte en cours de vérification — PDF disponible après approbation" : null),
    },
  ];

  // ── Section 2 : Documents légaux et réglementaires ─────────────────────────
  const legalDocs = [
    {
      id: "cgu",
      label: "Conditions Générales d'Utilisation",
      desc: "Règles d'utilisation de la plateforme IBIG PARTNERS. Tout partenaire est tenu de les respecter.",
      icon: "📜",
      href: "/api/documents/cgu",
      pages: "3 pages",
      version: "v1.0",
    },
    {
      id: "charte-ethique",
      label: "Charte Éthique & Code de Conduite",
      desc: "Principes fondamentaux d'honnêteté, de respect et d'intégrité attendus de chaque partenaire.",
      icon: "🤝",
      href: "/api/documents/charte-ethique",
      pages: "2 pages",
      version: "v1.0",
    },
  ];

  // ── Section 3 : Guides et ressources ───────────────────────────────────────
  const guideDocs = [
    {
      id: "guide-demarrage",
      label: "Guide de Démarrage Rapide",
      desc: "Les 6 étapes clés pour générer vos premières commissions — activation, liens, prospection, déclaration.",
      icon: "🚀",
      href: "/api/documents/guide-demarrage",
      pages: "2 pages",
      version: "v1.0",
      highlight: true,
    },
    {
      id: "plan-compensation",
      label: "Plan de Compensation Officiel",
      desc: "Structure complète des commissions, niveaux (Starter → Elite), critères de promotion et conditions de paiement.",
      icon: "💎",
      href: "/api/documents/plan-compensation",
      pages: "2 pages",
      version: "v1.0",
    },
    {
      id: "bonnes-pratiques",
      label: "Guide des Bonnes Pratiques",
      desc: "Scripts de prospection, techniques de vente éthiques, utilisation des réseaux sociaux et développement du réseau.",
      icon: "📖",
      href: "/api/documents/bonnes-pratiques",
      pages: "2 pages",
      version: "v1.0",
    },
    {
      id: "kit-presentation",
      label: "Kit de Présentation des Offres",
      desc: "Présentation officielle des 10 branches, 14 logiciels, commissions par branche et appel à l'action — à partager avec vos prospects.",
      icon: "🎨",
      href: "/api/documents/kit-presentation",
      pages: "4 pages",
      version: "v1.0",
    },
    {
      id: "modele-devis",
      label: "Modèle de Devis Partenaire",
      desc: "Template de devis personnalisable pour proposer des solutions IBIG à vos clients professionnels — avec guide d'utilisation.",
      icon: "📄",
      href: "/api/documents/modele-devis",
      pages: "2 pages",
      version: "v1.0",
    },
    {
      id: "manuel-partenaire",
      label: "Manuel Officiel du Partenaire",
      desc: "Guide complet de référence — 20 modules : offres, commissions, statuts, parcours 30 jours, méthode B.E.S.O.I.N., éthique et FAQ.",
      icon: "📚",
      href: "/api/documents/manuel-partenaire",
      pages: "5 pages",
      version: "v1.0",
    },
  ];

  const comingSoon: { id: string; label: string; desc: string; icon: string }[] = [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mes Documents"
        subtitle="Tous vos documents officiels IBIG PARTNERS — téléchargeables en PDF."
      />

      {/* Statut rapide */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={`rounded-2xl border-2 px-4 py-3 ${isVerified ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Statut du compte</p>
          <p className={`mt-0.5 text-sm font-bold ${isVerified ? "text-emerald-700" : "text-amber-700"}`}>
            {isVerified ? "✅ Compte vérifié" : "⏳ En attente de vérification"}
          </p>
        </div>
        <div className={`rounded-2xl border-2 px-4 py-3 ${hasSigned ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contrat</p>
          <p className={`mt-0.5 text-sm font-bold ${hasSigned ? "text-emerald-700" : "text-rose-700"}`}>
            {hasSigned
              ? `✅ Signé le ${new Date(contract.signedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`
              : "⚠️ Non signé — action requise"}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Documents disponibles</p>
          <p className="mt-0.5 text-sm font-bold text-blue-700">📂 {1 + legalDocs.length + guideDocs.length} documents disponibles</p>
          {/* guideDocs now includes kit, devis, manuel */}
        </div>
      </div>

      {/* ── DOCUMENTS PERSONNELS ─────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-slate-800">📋 Documents personnels</h2>
        <div className="space-y-3">
          {personalDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{doc.icon}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{doc.label}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      doc.badgeColor === "emerald"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>{doc.badge}</span>
                    <span className="text-xs text-slate-400">{doc.pages}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{doc.desc}</p>
                  {doc.note && (
                    <p className="mt-1 text-xs font-medium text-amber-600">⚠️ {doc.note}</p>
                  )}
                </div>
              </div>
              {doc.actionHref ? (
                <a
                  href={doc.actionHref}
                  className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
                    hasSigned
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-rose-600 text-white hover:bg-rose-700"
                  }`}
                >
                  {hasSigned ? "📥 " : "✍️ "}{doc.actionLabel}
                </a>
              ) : (
                <span className="shrink-0 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400">
                  Indisponible
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCUMENTS LÉGAUX ─────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-slate-800">📜 Documents légaux & réglementaires</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {legalDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{doc.icon}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{doc.label}</p>
                    <span className="text-xs text-slate-400">{doc.version} · {doc.pages}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{doc.desc}</p>
                </div>
              </div>
              <a
                href={doc.href}
                className="mt-3 inline-flex items-center gap-1.5 self-start rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                📥 Télécharger PDF
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── GUIDES ───────────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-base font-bold text-slate-800">🚀 Guides & ressources partenaire</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guideDocs.map((doc) => (
            <div
              key={doc.id}
              className={`flex flex-col justify-between rounded-2xl border p-4 shadow-sm ${
                doc.highlight
                  ? "border-blue-300 bg-blue-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{doc.icon}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{doc.label}</p>
                      {doc.highlight && (
                        <span className="inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{doc.version} · {doc.pages}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{doc.desc}</p>
              </div>
              <a
                href={doc.href}
                className={`mt-4 inline-flex items-center gap-1.5 self-start rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  doc.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                📥 Télécharger PDF
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── BIENTÔT DISPONIBLE ───────────────────────────────────────────── */}
      {comingSoon.length > 0 && (
        <section>
          <h2 className="mb-1 text-base font-bold text-slate-800">🔜 Bientôt disponible</h2>
          <p className="mb-3 text-xs text-slate-500">Ces ressources sont en cours de préparation et seront disponibles prochainement.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {comingSoon.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
              >
                <span className="text-2xl shrink-0 opacity-50">{doc.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-400">{doc.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{doc.desc}</p>
                  <span className="mt-2 inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                    Bientôt disponible
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── NOTE BAS DE PAGE ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-xs text-blue-700">
          <strong>ℹ️ À propos de ces documents :</strong> Pour toute question sur un document, contactez-nous à{" "}
          <a href="mailto:support@ibigpartners.com" className="underline font-medium">support@ibigpartners.com</a>.
          IBIG SARL · {new Date().getFullYear()} · Abidjan, Cocody Riviera Palmeraie, Côte d&apos;Ivoire
        </p>
      </div>
    </div>
  );
}
