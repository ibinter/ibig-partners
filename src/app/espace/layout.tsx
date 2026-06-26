import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  // Badge notifications non lues (globales + ciblées)
  const unread = await prisma.notification.count({
    where: {
      read: false,
      OR: [{ userId: null }, { userId: user.id }],
    },
  });

  const NAV: NavItem[] = [
    { href: "/espace", label: "Dashboard", icon: "📊" },
    { href: "/espace/produits", label: "Mes Produits", icon: "🧩" },
    { href: "/espace/liens", label: "Mes Liens", icon: "🔗" },
    { href: "/espace/reseau", label: "Mon Réseau", icon: "🌳" },
    { href: "/espace/commissions", label: "Mes Commissions", icon: "💰" },
    { href: "/espace/kit", label: "Kit Marketing", icon: "🎨" },
    { href: "/espace/prospects", label: "Mes Prospects", icon: "🎯" },
    { href: "/espace/analytics", label: "Analytics", icon: "📈" },
    { href: "/espace/classement", label: "Classement", icon: "🏆" },
    { href: "/espace/notifications", label: "Notifications", icon: "🔔", badge: unread },
    { href: "/espace/support", label: "Support", icon: "🎫" },
    { href: "/espace/profil", label: "Mon Profil", icon: "⚙️" },
  ];

  return (
    <DashboardShell nav={NAV} user={user} variant="partner">
      {children}
    </DashboardShell>
  );
}
