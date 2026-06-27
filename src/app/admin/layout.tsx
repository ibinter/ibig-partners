import { requireAdmin } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const NAV: NavItem[] = [
  { href: "/admin",               label: "Tableau de bord",    icon: "📈", group: "Vue globale" },
  { href: "/admin/partenaires",   label: "Partenaires",        icon: "👥", group: "Réseau" },
  { href: "/admin/opportunites",  label: "Opportunités",       icon: "🤝", group: "Réseau" },
  { href: "/admin/ventes",        label: "Ventes",             icon: "🧾", group: "Finance" },
  { href: "/admin/commissions",   label: "Commissions",        icon: "💰", group: "Finance" },
  { href: "/admin/paiements",     label: "Paiements",          icon: "🏦", group: "Finance" },
  { href: "/admin/branches",      label: "Branches & Produits",icon: "🗂️", group: "Catalogue" },
  { href: "/admin/tickets",       label: "Tickets Support",    icon: "🎫", group: "Communication" },
  { href: "/admin/communication", label: "Communication",      icon: "📣", group: "Communication" },
  { href: "/admin/audit",         label: "Journal d'audit",    icon: "🔍", group: "Administration" },
  { href: "/admin/parametres",    label: "Paramètres",         icon: "⚙️", group: "Administration" },
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
