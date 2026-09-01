import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { CelebrationToaster } from "@/components/celebration-toaster";
import OnboardingTourWrapper from "@/components/onboarding-tour-wrapper";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  // Afficher la visite guidee pour les nouveaux affilies (compte < 7 jours)
  const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
  const isNewUser = user.role === "PARTNER" && accountAgeMs < 7 * 24 * 60 * 60 * 1000;

  const unread = await prisma.notification.count({
    where: {
      read: false,
      OR: [{ userId: null }, { userId: user.id }],
    },
  });

  const NAV: NavItem[] = [
    { href: "/espace",              label: "Dashboard",       icon: "📊",  group: "Vue d'ensemble" },
    { href: "/espace/analytics",    label: "Analytics",       icon: "📈",  group: "Vue d'ensemble" },
    { href: "/espace/classement",   label: "Classement",      icon: "🏆",  group: "Vue d'ensemble" },
    { href: "/espace/objectifs",    label: "Mes Objectifs",   icon: "🎯",  group: "Vue d'ensemble" },
    { href: "/espace/simulateur",   label: "Simulateur gains",icon: "🧮",  group: "Vue d'ensemble" },
    { href: "/espace/bienvenue",    label: "Guide démarrage", icon: "🚀",  group: "Vue d'ensemble" },
    { href: "/espace/produits",     label: "Mes Produits",    icon: "🧩",  group: "Mon activité" },
    { href: "/espace/liens",        label: "Mes Liens",       icon: "🔗",  group: "Mon activité" },
    { href: "/espace/reseau",       label: "Mon Réseau",      icon: "🌳",  group: "Mon activité" },
    { href: "/espace/prospects",    label: "Mes Prospects",   icon: "📇",  group: "Mon activité" },
    { href: "/espace/ventes",       label: "Déclarer une vente", icon: "📝", group: "Mon activité" },
    { href: "/espace/commissions",  label: "Commissions",     icon: "💰",  group: "Revenus" },
    { href: "/espace/paiements",    label: "Mes Paiements",   icon: "🏦",  group: "Revenus" },
    { href: "/espace/academie",     label: "Académie IBIG",   icon: "🎓",  group: "Formation & Communauté" },
    { href: "/espace/coach",        label: "Coach IA",        icon: "✨",  group: "Formation & Communauté" },
    { href: "/espace/chat",         label: "Messages",        icon: "💬",  group: "Formation & Communauté" },
    { href: "/espace/badges",       label: "Mes Badges",      icon: "🏅",  group: "Formation & Communauté" },
    { href: "/espace/verification", label: "Vérifier mon compte", icon: "🔐", group: "Compte" },
    { href: "/espace/formation",    label: "Guide Commissions", icon: "📚",  group: "Ressources" },
    { href: "/espace/kit",          label: "Kit Marketing",   icon: "🎨",  group: "Ressources" },
    { href: "/espace/guide",        label: "Guide Affilié (PDF)", icon: "📖", group: "Ressources" },
    { href: "/espace/notifications",label: "Notifications",   icon: "🔔",  group: "Compte", badge: unread },
    { href: "/espace/support",      label: "Support",         icon: "🎫",  group: "Compte" },
    { href: "/espace/profil",       label: "Mon Profil",      icon: "⚙️",  group: "Compte" },
  ];

  // Bandeau persistant tant que le compte n'est pas vérifié (affiliés uniquement).
  const needsVerification =
    user.role === "PARTNER" && user.verificationStatus !== "VERIFIED";
  const verifRejected = user.verificationStatus === "REJECTED";
  const verifPending = user.verificationStatus === "SUBMITTED";

  return (
    <DashboardShell nav={NAV} user={user} variant="partner">
      {needsVerification && (
        <Link
          href="/espace/verification"
          className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors ${
            verifRejected
              ? "border-rose-200 bg-rose-50 hover:bg-rose-100"
              : "border-amber-200 bg-amber-50 hover:bg-amber-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{verifRejected ? "❌" : "🔐"}</span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  verifRejected ? "text-rose-900" : "text-amber-900"
                }`}
              >
                {verifRejected
                  ? "Votre dossier a été refusé — corrigez et renvoyez vos documents."
                  : verifPending
                    ? "Dossier en cours d'examen — suivez son avancement."
                    : "Votre compte n'est pas encore vérifié."}
              </p>
              <p
                className={`text-xs ${
                  verifRejected ? "text-rose-800" : "text-amber-800"
                }`}
              >
                Activez les paiements de commissions en envoyant vos documents (rapide et sécurisé).
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold text-white ${
              verifRejected ? "bg-rose-500" : "bg-amber-500"
            }`}
          >
            {verifPending ? "Voir mon dossier →" : "Vérifier mon compte →"}
          </span>
        </Link>
      )}
      {children}
      <CelebrationToaster />
      <OnboardingTourWrapper isNewUser={isNewUser} />
    </DashboardShell>
  );
}
