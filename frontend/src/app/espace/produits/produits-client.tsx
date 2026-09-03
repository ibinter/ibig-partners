"use client";

import { useState, useMemo } from "react";
import { toggleProduct } from "../actions";
import CopyButton from "../liens/copy-button";
import Link from "next/link";

// ── Simulateur commission formation ──────────────────────────────────────────
function CourseDetailPanel({ product }: { product: Product }) {
  const [participants, setParticipants] = useState(1);

  const r5 = (x: number) => Math.round(x / 5000) * 5000;
  const ref = product.price;
  const pres = r5(ref * 16000 / 11250);
  const rate = product.rate; // décimal ex: 0.10

  const modalities = [
    { icon: "🖥️", label: "E-learning",         prixLigne: r5(ref * 0.50), prixPres: null },
    { icon: "👤", label: "Individuel",          prixLigne: ref,            prixPres: pres },
    { icon: "👥", label: "Groupe 3–5 pers",    prixLigne: r5(ref * 0.70), prixPres: r5(pres * 0.70) },
    { icon: "👥", label: "Groupe 6–10 pers",   prixLigne: r5(ref * 0.55), prixPres: r5(pres * 0.55) },
    { icon: "🏢", label: "Groupe 10+ pers",    prixLigne: r5(ref * 0.45), prixPres: r5(pres * 0.45) },
  ];

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  const comm = (prix: number) => Math.round(prix * rate * participants);

  return (
    <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 space-y-4">
      {/* Simulateur */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 mb-2">🧮 Simulateur de commission</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Participants :</label>
            <div className="flex items-center gap-1">
              <button onClick={() => setParticipants(p => Math.max(1, p - 1))}
                className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition">−</button>
              <span className="w-8 text-center text-sm font-extrabold text-slate-800">{participants}</span>
              <button onClick={() => setParticipants(p => p + 1)}
                className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-sm flex items-center justify-center hover:bg-emerald-600 transition">+</button>
            </div>
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">Commission totale estimée</p>
            <p className="text-lg font-extrabold text-emerald-700">
              {fmt(comm(ref))} <span className="text-[10px] font-semibold text-emerald-500">(individuel en ligne)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tableau tarifs + commissions */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="px-3 py-2 font-extrabold text-slate-500 uppercase tracking-wide">Modalité</th>
              <th className="px-3 py-2 font-extrabold text-slate-500 uppercase tracking-wide text-right">💻 En ligne</th>
              <th className="px-3 py-2 font-extrabold text-slate-500 uppercase tracking-wide text-right">🏛️ Présentiel</th>
              <th className="px-3 py-2 font-extrabold text-emerald-600 uppercase tracking-wide text-right">Commission ×{participants}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {modalities.map(m => (
              <tr key={m.label} className="hover:bg-slate-50 transition">
                <td className="px-3 py-2 text-slate-700 font-medium">{m.icon} {m.label}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-800">{fmt(m.prixLigne)}</td>
                <td className="px-3 py-2 text-right font-bold text-slate-800">{m.prixPres ? fmt(m.prixPres) : "—"}</td>
                <td className="px-3 py-2 text-right">
                  <span className="font-extrabold text-emerald-700">{fmt(comm(m.prixLigne))}</span>
                  {m.prixPres && <span className="text-emerald-400 font-semibold"> / {fmt(comm(m.prixPres))}</span>}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <td className="px-3 py-2 text-slate-600 font-medium">🌍 Intra / International</td>
              <td className="px-3 py-2 text-right text-slate-400 italic" colSpan={2}>Sur devis</td>
              <td className="px-3 py-2 text-right text-slate-400 italic font-semibold">Sur devis</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 italic">* Commissions estimées basées sur {Math.round(rate * 100)}% du prix HT. Les montants exacts dépendent de la vente réalisée.</p>
    </div>
  );
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  siteUrl: string | null;
  price: number;
  pricingType: string;
  rate: number;
  commissionDisplay: string;
  commissionMin?: number | null;
  commissionMax?: number | null;
  priceDisplay: string;
  affiliateUrl: string | null;
  category?: string | null;
}

interface Branch {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  offerType: string;
  commissionModel: string;
  gradient: string;
  products: Product[];
  activeCount: number;
}

// Map branche → catégorie marché
const BRANCH_TO_SECTOR: Record<string, string> = {
  "ibig-eduform": "FORMATION",
  "ibig-soft": "INFORMATIQUE",
  "ibig-immo-trust": "IMMOBILIER",
  "ibig-digital": "DIGITAL",
  "ibig-digital-kits": "INFORMATIQUE",
  "ibig-conseil-plus": "CONSEIL",
  "ibig-market": "COMMERCE",
  "ibig-multiservices": "SERVICES",
  "ibig-financement": "FINANCEMENT",
  "ibig-emploi-talents": "EMPLOI_RH",
};

interface Props {
  branches: Branch[];
  totalProducts: number;
  totalActive: number;
  totalDocumented: number;
  marketSectors?: string[];
  affiliateCode?: string;
}

const PRICING_LABELS: Record<string, string> = {
  MONTHLY_SUB: "Abonnement mensuel",
  ANNUAL_SUB: "Abonnement annuel",
  COURSE: "Formation",
  SERVICE: "Prestation",
  PRODUCT: "Produit",
  ONE_TIME: "Achat unique",
};

const PRICING_BADGE: Record<string, string> = {
  MONTHLY_SUB: "bg-blue-100 text-blue-700",
  ANNUAL_SUB: "bg-violet-100 text-violet-700",
  COURSE: "bg-amber-100 text-amber-700",
  SERVICE: "bg-teal-100 text-teal-700",
  PRODUCT: "bg-slate-100 text-slate-600",
  ONE_TIME: "bg-slate-100 text-slate-600",
};

const BRANCH_ICONS: Record<string, string> = {
  "ibig-soft": "⚙️",
  "ibig-eduform": "🎓",
  "ibig-immo-trust": "🏠",
  "ibig-market": "🛒",
  "ibig-digital": "💻",
  "ibig-digital-kits": "🔧",
  "ibig-conseil-plus": "📋",
  "ibig-partners-branch": "🌐",
  "ibig-multiservices": "🛠️",
  "ibig-financement": "💰",
  "ibig-emploi-talents": "👥",
};

// Opportunités du moment (static — sera dynamique plus tard)
const HOT_OPPORTUNITIES = [
  { icon: "🖥️", label: "Logiciels de gestion", detail: "PME cherchant à digitaliser leur activité" },
  { icon: "🎓", label: "Formations professionnelles", detail: "Entreprises ayant besoin de former leurs équipes" },
  { icon: "🏠", label: "Gestion locative", detail: "Propriétaires cherchant un gestionnaire" },
  { icon: "🌐", label: "Sites web professionnels", detail: "Entreprises sans présence en ligne" },
  { icon: "👥", label: "Recrutement de profils", detail: "PME en phase de croissance" },
  { icon: "📋", label: "Création d'entreprise", detail: "Entrepreneurs voulant se formaliser" },
];

function ProductCard({
  product,
  branchName,
  branchGradient,
  branchSlug,
  recommended,
  affiliateCode,
}: {
  product: Product;
  branchName: string;
  branchGradient: string;
  branchSlug: string;
  recommended?: boolean;
  affiliateCode?: string;
}) {
  const active = product.affiliateUrl !== null;
  const isCourse = product.pricingType === "COURSE";
  const [showDetail, setShowDetail] = useState(false);
  const destination = product.siteUrl
    ? product.siteUrl.startsWith("http") ? product.siteUrl : `https://${product.siteUrl}`
    : null;

  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
        active ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-100"
      }`}
    >
      {/* Top band */}
      <div className={`rounded-t-2xl bg-gradient-to-r ${branchGradient} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-xs font-bold text-white/90 truncate">
          {BRANCH_ICONS[branchSlug] ?? "📦"} {branchName}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {recommended && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold text-amber-900 uppercase tracking-wide">
              ★ Mon marché
            </span>
          )}
          {active && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
              ✓ Activé
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <div className="flex items-start gap-2 mb-1.5">
            <p className="font-semibold text-slate-900 text-sm leading-snug flex-1">{product.name}</p>
            <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PRICING_BADGE[product.pricingType] ?? "bg-slate-100 text-slate-500"}`}>
              {PRICING_LABELS[product.pricingType] ?? product.pricingType}
            </span>
          </div>
          {product.description && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{product.description}</p>
          )}
        </div>

        {/* Prix + Commission */}
        {isCourse ? (
          /* Formation : affichage simplifié — le détail est dans le panel */
          <div className="flex items-center gap-2 mt-auto rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
            <span className="text-emerald-600 text-base">💰</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">Commission N1</p>
              <p className="text-sm font-extrabold text-emerald-700">
                {Math.round(product.rate * 100)}% par participant · par formule
              </p>
            </div>
            <p className="text-[10px] font-semibold text-emerald-400 text-right shrink-0">
              Voir détail →
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Prix</p>
              <p className="text-sm font-bold text-slate-700 truncate">{product.priceDisplay}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">Commission N1</p>
              <p className="text-sm font-bold text-emerald-700 truncate">{product.commissionDisplay}</p>
            </div>
          </div>
        )}

        {/* Lien affilié si actif */}
        {active && product.affiliateUrl && (
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-2.5 py-1.5">
            <span className="font-mono text-[11px] text-slate-500 truncate flex-1 min-w-0">
              {product.affiliateUrl}
            </span>
            <CopyButton text={product.affiliateUrl} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
          <Link
            href={affiliateCode ? `/offres/${product.slug}?ref=${affiliateCode}` : `/offres/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1.5"
          >
            📄 Présenter
          </Link>
          {isCourse && (
            <button
              type="button"
              onClick={() => setShowDetail(v => !v)}
              className={`flex items-center gap-1 text-xs font-bold transition rounded-lg px-2.5 py-1.5 ${showDetail ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
            >
              🧮 {showDetail ? "Masquer" : "Tarifs & commissions"}
            </button>
          )}
          {destination && !isCourse && (
            <a
              href={destination}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition font-medium"
            >
              Voir l&apos;offre ↗
            </a>
          )}
          <div className="flex-1" />
          <form action={toggleProduct}>
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                active
                  ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              {active ? "Désactiver" : "Activer →"}
            </button>
          </form>
        </div>
      </div>
      {isCourse && showDetail && <CourseDetailPanel product={product} />}
    </div>
  );
}

const EDUFORM_BRANCH_ID = "cmqwirc1z000fvn9w0gic2jhd";

export default function ProduitsClient({ branches, totalProducts, totalActive, marketSectors = [], affiliateCode = "" }: Props) {
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Flatten all products with branch info + recommended flag
  const allProducts = useMemo(() =>
    branches.flatMap(b => {
      const branchSector = BRANCH_TO_SECTOR[b.id] ?? "";
      const recommended = marketSectors.length > 0 && marketSectors.includes(branchSector);
      return b.products.map(p => ({
        ...p,
        branchId: b.id,
        branchSlug: b.id.slice(0, 30),
        branchName: b.name,
        branchGradient: b.gradient,
        branchSlugKey: b.id,
        recommended,
      }));
    }), [branches, marketSectors]);

  // Branch slugs — on utilise l'id comme clé stable
  const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b])), [branches]);

  // Catégories disponibles pour la branche sélectionnée (si elle a des catégories)
  const availableCategories = useMemo(() => {
    const pool = selectedBranch === "ALL" ? allProducts : allProducts.filter(p => p.branchId === selectedBranch);
    const cats = new Set<string>();
    pool.forEach(p => { if (p.category) cats.add(p.category); });
    return Array.from(cats).sort();
  }, [allProducts, selectedBranch]);

  // Réinitialise la catégorie quand on change de branche
  const handleBranchChange = (id: string) => {
    setSelectedBranch(id);
    setSelectedCategory("ALL");
  };

  const filtered = useMemo(() => {
    const results = allProducts.filter(p => {
      if (selectedBranch !== "ALL" && p.branchId !== selectedBranch) return false;
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
      if (filter === "active" && !p.affiliateUrl) return false;
      if (filter === "inactive" && p.affiliateUrl) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q) && !p.branchName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    // Recommended first when market sectors set
    if (marketSectors.length > 0) {
      results.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
    }
    return results;
  }, [allProducts, selectedBranch, selectedCategory, filter, search, marketSectors]);

  const totalCommissionPotential = filtered.filter(p => p.affiliateUrl).reduce((s, p) => s + (p.price > 0 ? Math.round(p.price * p.rate / 100) : 0), 0);

  return (
    <div className="space-y-6">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)" }} />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">IBIG PARTNERS — Marketplace</p>
          <h1 className="text-2xl font-extrabold leading-tight mb-2">
            Trouvez. Recommandez. Connectez. <span className="text-blue-400">Gagnez.</span>
          </h1>
          <p className="text-sm text-white/70 max-w-lg leading-relaxed">
            {totalProducts}+ offres à promouvoir — logiciels, formations, immobilier, conseil, financement et bien plus.
            Activez celles qui correspondent à votre réseau et générez des commissions.
          </p>
          {marketSectors.length === 0 && (
            <Link href="/espace/mon-marche"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-900 font-bold text-xs px-4 py-2 transition">
              🗺️ Définir Mon Marché pour voir les recommandations →
            </Link>
          )}
          {marketSectors.length > 0 && (
            <p className="mt-2 text-xs text-amber-300 font-semibold">
              ★ Les offres de votre marché ({marketSectors.length} secteur{marketSectors.length > 1 ? "s" : ""}) apparaissent en premier.
              <Link href="/espace/mon-marche" className="ml-2 underline underline-offset-2 hover:text-amber-200">Modifier →</Link>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
              <p className="text-xl font-extrabold">{totalProducts}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Offres disponibles</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2 text-center">
              <p className="text-xl font-extrabold">{branches.length}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Secteurs</p>
            </div>
            <div className="rounded-xl bg-emerald-500/20 px-4 py-2 text-center">
              <p className="text-xl font-extrabold text-emerald-300">{totalActive}</p>
              <p className="text-[10px] text-white/60 uppercase tracking-wide">Mes offres activées</p>
            </div>
            {totalCommissionPotential > 0 && (
              <div className="rounded-xl bg-amber-500/20 px-4 py-2 text-center">
                <p className="text-xl font-extrabold text-amber-300">
                  {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(totalCommissionPotential)} F
                </p>
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Potentiel commissions N1</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── OPPORTUNITÉS DU MOMENT ─────────────────────────────── */}
      <div className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🔥</span>
          <p className="text-sm font-bold text-orange-800">Opportunités du moment</p>
          <span className="ml-auto text-[10px] text-orange-500 font-semibold uppercase tracking-wide">Mis à jour régulièrement</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HOT_OPPORTUNITIES.map((o, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white border border-orange-100 px-3 py-2.5">
              <span className="text-xl shrink-0">{o.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{o.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{o.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-orange-700">
          Vous avez identifié une de ces opportunités dans votre réseau ?{" "}
          <Link href="/espace/reseau" className="font-bold underline underline-offset-2">Soumettez-la →</Link>
        </p>
      </div>

      {/* ── FILTRES BRANCHES ────────────────────────────────────── */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => handleBranchChange("ALL")}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition border ${
              selectedBranch === "ALL"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Tout ({totalProducts})
          </button>
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => handleBranchChange(b.id)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                selectedBranch === b.id
                  ? `bg-gradient-to-r ${b.gradient} text-white border-transparent`
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {BRANCH_ICONS[b.id] ?? "📦"} {b.name.replace("IBIG ", "")} ({b.products.length})
            </button>
          ))}
        </div>
      </div>

      {/* ── FILTRE CATÉGORIES (si disponible) ──────────────────── */}
      {availableCategories.length > 1 && (
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition border ${
                selectedCategory === "ALL"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Toutes catégories
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-[11px] font-bold transition border ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── BARRE RECHERCHE + FILTRES ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="search"
            placeholder="Rechercher un produit, service, formation…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {(["all", "active", "inactive"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition border ${
                filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "Toutes" : f === "active" ? "✓ Activées" : "À activer"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 shrink-0 rounded-xl border border-slate-200 bg-white p-1">
          <button onClick={() => setViewMode("grid")} className={`rounded-lg px-2.5 py-1.5 text-xs transition ${viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-700"}`}>
            ⊞ Grille
          </button>
          <button onClick={() => setViewMode("list")} className={`rounded-lg px-2.5 py-1.5 text-xs transition ${viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-700"}`}>
            ☰ Liste
          </button>
        </div>
      </div>

      {/* Compteur résultats */}
      <p className="text-xs text-slate-400 -mt-2">
        <span className="font-bold text-slate-700">{filtered.length}</span> offre{filtered.length !== 1 ? "s" : ""}
        {selectedBranch !== "ALL" && ` · ${branchMap.get(selectedBranch)?.name ?? ""}`}
        {selectedCategory !== "ALL" && ` · ${selectedCategory}`}
        {search && ` · recherche : « ${search} »`}
        {filter !== "all" && ` · ${filter === "active" ? "activées" : "non activées"}`}
      </p>

      {/* ── GRILLE PRODUITS ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-500 text-sm font-semibold">Aucun résultat</p>
          <p className="text-xs text-slate-400 mt-1">Essayez un autre filtre ou une autre recherche.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              branchName={p.branchName}
              branchGradient={p.branchGradient}
              branchSlug={p.branchId}
              recommended={p.recommended}
              affiliateCode={affiliateCode}
            />
          ))}
          {/* CTA Soumettre une opportunité */}
          <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 flex flex-col items-center justify-center p-6 text-center gap-3">
            <span className="text-4xl">💼</span>
            <div>
              <p className="font-bold text-blue-800 text-sm">Vous avez une opportunité ?</p>
              <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                Un client potentiel, un projet, un besoin identifié dans votre réseau ?
              </p>
            </div>
            <Link
              href="/espace/reseau"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 transition"
            >
              Soumettre une opportunité →
            </Link>
          </div>
        </div>
      ) : (
        /* Vue liste compacte */
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
          {filtered.map(p => {
            const active = p.affiliateUrl !== null;
            return (
              <div key={p.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50/60 transition ${active ? "bg-blue-50/30" : ""}`}>
                <span className={`shrink-0 h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${PRICING_BADGE[p.pricingType] ?? "bg-slate-100 text-slate-500"}`}>
                      {PRICING_LABELS[p.pricingType] ?? p.pricingType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{p.branchName}</p>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  <p className="text-xs text-slate-600">{p.priceDisplay}</p>
                  <p className="text-xs font-bold text-emerald-600">{p.commissionDisplay}</p>
                </div>
                <form action={toggleProduct}>
                  <input type="hidden" name="productId" value={p.id} />
                  <button type="submit" className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${active ? "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                    {active ? "Désact." : "Activer"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CTA BAS DE PAGE ─────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white text-center">
        <p className="text-xl font-extrabold mb-2">Votre réseau vaut de l&apos;argent.</p>
        <p className="text-sm text-white/80 max-w-lg mx-auto leading-relaxed mb-4">
          Vous connaissez une entreprise qui cherche un logiciel, une formation, un site web ou un financement ?
          Soumettez l&apos;opportunité à IBIG — si elle aboutit, vous êtes rémunéré.
        </p>
        <Link
          href="/espace/reseau"
          className="inline-block rounded-xl bg-white text-blue-700 font-bold text-sm px-6 py-3 hover:bg-blue-50 transition shadow-lg"
        >
          Soumettre une opportunité →
        </Link>
      </div>

    </div>
  );
}
