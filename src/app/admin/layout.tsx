import { requireAdmin } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const NAV: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: "📈" },
  { href: "/admin/partenaires", label: "Partenaires", icon: "👥" },
  { href: "/admin/ventes", label: "Ventes", icon: "🧾" },
  { href: "/admin/commissions", label: "Commissions", icon: "💰" },
  { href: "/admin/paiements", label: "Paiements", icon: "🏦" },
  { href: "/admin/branches", label: "Branches & Produits", icon: "🗂️" },
  { href: "/admin/opportunites", label: "Opportunités", icon: "🤝" },
  { href: "/admin/tickets", label: "Tickets Support", icon: "🎫" },
  { href: "/admin/communication", label: "Communication", icon: "📣" },
  { href: "/admin/audit", label: "Journal d'audit", icon: "🔍" },
  { href: "/admin/parametres", label: "Paramètres", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <DashboardShell nav={NAV} user={user} variant="admin">
      {children}
    </DashboardShell>
  );
}
