import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

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
    { href: "/espace/produits",     label: "Mes Produits",    icon: "🧩",  group: "Mon activité" },
    { href: "/espace/liens",        label: "Mes Liens",       icon: "🔗",  group: "Mon activité" },
    { href: "/espace/reseau",       label: "Mon Réseau",      icon: "🌳",  group: "Mon activité" },
    { href: "/espace/prospects",    label: "Mes Prospects",   icon: "🎯",  group: "Mon activité" },
    { href: "/espace/commissions",  label: "Commissions",     icon: "💰",  group: "Revenus" },
    { href: "/espace/paiements",    label: "Mes Paiements",   icon: "🏦",  group: "Revenus" },
    { href: "/espace/verification", label: "Vérifier mon compte", icon: "🔐", group: "Compte" },
    { href: "/espace/formation",    label: "Ma Formation",    icon: "📚",  group: "Ressources" },
    { href: "/espace/kit",          label: "Kit Marketing",   icon: "🎨",  group: "Ressources" },
    { href: "/espace/notifications",label: "Notifications",   icon: "🔔",  group: "Compte", badge: unread },
    { href: "/espace/support",      label: "Support",         icon: "🎫",  group: "Compte" },
    { href: "/espace/profil",       label: "Mon Profil",      icon: "⚙️",  group: "Compte" },
  ];

  return (
    <DashboardShell nav={NAV} user={user} variant="partner">
      {children}
    </DashboardShell>
  );
}
