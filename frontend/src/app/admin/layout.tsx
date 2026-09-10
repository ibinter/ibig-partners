import { requireAdmin } from "@/lib/auth";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const NAV: NavItem[] = [
  // Vue globale
  { href: "/admin",               label: "Tableau de bord",         icon: "📈", group: "Vue globale" },

  // Partenaires — qui sont les membres du réseau
  { href: "/admin/partenaires",                 label: "Partenaires affiliés",        icon: "👥", group: "Partenaires" },
  { href: "/admin/entreprises",                 label: "Entreprises clientes",        icon: "🏢", group: "Partenaires" },
  { href: "/admin/partenaires-institutionnels", label: "Partenaires institutionnels", icon: "🌐", group: "Partenaires" },
  { href: "/admin/niveaux",                     label: "Niveaux & Progression",       icon: "🏅", group: "Partenaires" },
  { href: "/admin/bonus",                       label: "Bonus",                       icon: "⚡", group: "Partenaires" },
  { href: "/admin/connect",                     label: "IBIG CONNECT",                icon: "🔗", group: "Partenaires" },

  // Conformité — validation des identités et entreprises
  { href: "/admin/verifications", label: "Vérifications KYC", icon: "🔐", group: "Conformité" },
  { href: "/admin/kyb",           label: "KYB Entreprise",    icon: "🏢", group: "Conformité" },

  // Marché — opportunités, missions et matching
  { href: "/admin/opportunites", label: "Opportunités",       icon: "🤝", group: "Marché" },
  { href: "/admin/besoins",      label: "Besoins B2B",        icon: "🔍", group: "Marché" },
  { href: "/admin/appels",       label: "Appels à partenaires",icon: "📣", group: "Marché" },
  { href: "/admin/matching",     label: "Dashboard Matching", icon: "🎯", group: "Marché" },
  { href: "/admin/missions",     label: "Missions Partners",  icon: "🚀", group: "Marché" },

  // Finance
  { href: "/admin/ventes",      label: "Ventes",      icon: "🧾", group: "Finance" },
  { href: "/admin/commissions", label: "Commissions", icon: "💰", group: "Finance" },
  { href: "/admin/paiements",   label: "Paiements",   icon: "🏦", group: "Finance" },

  // Catalogue
  { href: "/admin/branches", label: "Branches & Produits",    icon: "🗂️", group: "Catalogue" },
  { href: "/admin/produits", label: "Pages de présentation",  icon: "📄", group: "Catalogue" },
  { href: "/admin/academie", label: "Académie IBIG",          icon: "🎓", group: "Catalogue" },

  // Communication
  { href: "/admin/messages",        label: "Messagerie",          icon: "💬", group: "Communication" },
  { href: "/admin/tickets",         label: "Tickets Support",     icon: "🎫", group: "Communication" },
  { href: "/admin/challenges",      label: "Challenges",          icon: "🏁", group: "Communication" },
  { href: "/admin/campagnes",       label: "Campagnes marketing", icon: "📢", group: "Communication" },
  { href: "/admin/evenements",      label: "Événements IBIG",     icon: "📅", group: "Communication" },
  { href: "/admin/email-templates", label: "Templates emails",    icon: "✉️", group: "Communication" },
  { href: "/admin/email-sequences", label: "Séquences email",     icon: "🔁", group: "Communication" },
  { href: "/admin/recompenses",     label: "Récompenses",         icon: "🎁", group: "Communication" },
  { href: "/admin/communication",   label: "Communication",       icon: "📣", group: "Communication" },

  // Analytics
  { href: "/admin/analytics",    label: "Analytics",              icon: "📈", group: "Analytics" },
  { href: "/admin/statistiques", label: "Statistiques globales",  icon: "📊", group: "Analytics" },
  { href: "/admin/reporting",    label: "Reporting avancé",       icon: "📊", group: "Analytics" },
  { href: "/admin/comparaison",  label: "Comparateur partenaires",icon: "⚖️", group: "Analytics" },
  { href: "/admin/devises",      label: "Taux de change",         icon: "💱", group: "Analytics" },

  // Administration
  { href: "/admin/notifications",   label: "Notifications",        icon: "🔔", group: "Administration" },
  { href: "/admin/recherche",       label: "Recherche globale",    icon: "🔍", group: "Administration" },
  { href: "/admin/activites",       label: "Journal d'activité",   icon: "👁️", group: "Administration" },
  { href: "/admin/audit",           label: "Journal d'audit",      icon: "📋", group: "Administration" },
  { href: "/admin/anti-abus",       label: "Anti-abus",            icon: "🛡️", group: "Administration" },
  { href: "/admin/corrections-cp",  label: "Corrections CP",       icon: "⚖️", group: "Administration" },
  { href: "/admin/litiges",         label: "Litiges",              icon: "⚠️", group: "Administration" },
  { href: "/admin/import-missions", label: "Import missions",      icon: "📥", group: "Administration" },
  { href: "/admin/nettoyage",       label: "Nettoyage données",    icon: "🧹", group: "Administration" },
  { href: "/admin/parametres",      label: "Paramètres",           icon: "⚙️", group: "Administration" },

  // Documents
  { href: "/admin/guide",         label: "Guide Admin (PDF)",    icon: "📘", group: "Documents" },
  { href: "/admin/projet",        label: "Présentation Projet",  icon: "📊", group: "Documents" },
  { href: "/admin/visite-guidee", label: "Visite guidée (test)", icon: "🎯", group: "Documents" },
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
