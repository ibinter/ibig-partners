"use client";

import { Icon, type IconName } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useState } from "react";

interface KitItem {
  type: "VISUAL" | "ARGUMENT" | "VIDEO";
  title: string;
  description: string;
}

interface ProductKit {
  name: string;
  slug: string;
  icon: IconName;
  color: string;
  activeColor: string;
  kits: KitItem[];
}

const PRODUCT_KITS: ProductKit[] = [
  {
    name: "SCOLABY",
    slug: "scolaby",
    icon: "graduation",
    color: "from-brand-500 to-brand-700",
    activeColor: "bg-brand-600 text-white",
    kits: [
      { type: "ARGUMENT", title: "Argumentaire de vente", description: "\"Cher directeur, Scolaby automatise les bulletins, la gestion des inscriptions et la communication avec les parents. Fini les fichiers Excel ! Essai gratuit de 14 jours.\"" },
      { type: "ARGUMENT", title: "Message WhatsApp prêt à envoyer", description: "\"Bonjour ! Je représente Scolaby, le logiciel de gestion scolaire N°1. Plus de 200 écoles l'utilisent déjà. Voulez-vous une démo gratuite ? 👉 [votre lien affilié]\"" },
      { type: "VISUAL", title: "Visuel réseaux sociaux", description: "Bannière Facebook/Instagram mettant en avant les fonctionnalités clés : gestion des notes, emploi du temps et paiement scolarité en ligne." },
      { type: "VIDEO", title: "Vidéo démo 2 min", description: "Présentation rapide de l'interface Scolaby : tableau de bord, saisie de notes, génération de bulletins PDF." },
    ],
  },
  {
    name: "ZELIVRY",
    slug: "zelivry",
    icon: "rocket",
    color: "from-emerald-500 to-teal-600",
    activeColor: "bg-emerald-600 text-white",
    kits: [
      { type: "ARGUMENT", title: "Argumentaire de vente", description: "\"Gérez toutes vos livraisons depuis une seule app. Zelivry offre le suivi GPS en temps réel, la notification automatique aux clients et l'optimisation des tournées.\"" },
      { type: "ARGUMENT", title: "Message WhatsApp prêt à envoyer", description: "\"Salut ! Tu fais de la livraison ? Zelivry te permet de suivre tes colis en temps réel et tes clients reçoivent un SMS automatique. Teste gratuitement 👉 [lien]\"" },
      { type: "VISUAL", title: "Visuel avant/après", description: "Infographie comparant la gestion manuelle vs Zelivry : gain de temps, réduction des erreurs, satisfaction client." },
      { type: "VIDEO", title: "Témoignage client", description: "Un restaurateur explique comment Zelivry a réduit ses retards de livraison de 60%." },
    ],
  },
  {
    name: "STOCKFLOW",
    slug: "stockflow",
    icon: "layers",
    color: "from-violet-500 to-purple-700",
    activeColor: "bg-violet-600 text-white",
    kits: [
      { type: "ARGUMENT", title: "Argumentaire de vente", description: "\"StockFlow est l'ERP pensé pour les PME africaines. Stock, factures, comptabilité et rapports dans un seul outil cloud accessible depuis votre téléphone.\"" },
      { type: "ARGUMENT", title: "Message WhatsApp prêt à envoyer", description: "\"Tu perds de l'argent avec les ruptures de stock ? StockFlow te prévient avant la rupture et génère tes factures en 1 clic. Démo gratuite ici 👉 [lien]\"" },
      { type: "VISUAL", title: "Fiche produit PDF", description: "Document A4 professionnel listant toutes les fonctionnalités, les tarifs et les témoignages clients vérifiés." },
      { type: "VIDEO", title: "Tutoriel premiers pas", description: "Guide vidéo de 3 minutes pour créer son premier article, enregistrer une entrée en stock et générer une facture." },
    ],
  },
  {
    name: "LOKATIVO",
    slug: "lokativo",
    icon: "home",
    color: "from-amber-500 to-orange-600",
    activeColor: "bg-amber-600 text-white",
    kits: [
      { type: "ARGUMENT", title: "Argumentaire de vente", description: "\"Lokativo simplifie la gestion locative : publiez vos annonces, gérez les baux, envoyez les quittances et suivez les impayés automatiquement.\"" },
      { type: "ARGUMENT", title: "Message WhatsApp prêt à envoyer", description: "\"Tu gères des biens immobiliers ? Lokativo automatise tes quittances, relances et calculs de loyer. Plus de 150 agences l'utilisent. Essaie ici 👉 [lien]\"" },
      { type: "VISUAL", title: "Carrousel Instagram", description: "5 slides montrant le parcours : publier une annonce → recevoir des candidatures → signer le bail → encaisser le loyer." },
      { type: "VIDEO", title: "Vidéo pitch 90s", description: "Présentation dynamique du problème (gestion manuelle) et de la solution Lokativo avec chiffres clés." },
    ],
  },
  {
    name: "GESCOMXEL",
    slug: "gescomxel",
    icon: "chart",
    color: "from-indigo-500 to-blue-700",
    activeColor: "bg-indigo-600 text-white",
    kits: [
      { type: "ARGUMENT", title: "Argumentaire de vente", description: "\"Gescomxel gère tout votre cycle commercial : devis, commandes, livraisons et factures. Suivi clients et statistiques de ventes en temps réel.\"" },
      { type: "ARGUMENT", title: "Message WhatsApp prêt à envoyer", description: "\"Tu fais des devis sur Word ? Gescomxel les génère en 30 secondes avec suivi automatique. Tes stats de vente en un clic. Teste ici 👉 [lien]\"" },
      { type: "VISUAL", title: "Comparatif fonctionnalités", description: "Tableau comparant Gescomxel aux solutions concurrentes sur le marché africain : prix, fonctionnalités, support." },
      { type: "VIDEO", title: "Webinaire enregistré", description: "Session de 15 minutes expliquant comment un commerce de Douala a multiplié par 3 son suivi client avec Gescomxel." },
    ],
  },
  {
    name: "IBIG FLEET 360",
    slug: "ibig-fleet-360",
    icon: "cpu",
    color: "from-rose-500 to-pink-600",
    activeColor: "bg-rose-600 text-white",
    kits: [
      { type: "ARGUMENT", title: "Argumentaire de vente", description: "\"IBIG Fleet 360 vous donne le contrôle total de votre flotte : GPS en temps réel, alertes maintenance, suivi carburant et gestion des assurances.\"" },
      { type: "ARGUMENT", title: "Message WhatsApp prêt à envoyer", description: "\"Tu gères des véhicules ? Fleet 360 te montre où ils sont en temps réel, te prévient pour la maintenance et suit la conso carburant. Démo 👉 [lien]\"" },
      { type: "VISUAL", title: "Infographie ROI", description: "Visuel montrant les économies réalisées : -30% carburant, -50% pannes imprévues, +20% productivité flotte." },
      { type: "VIDEO", title: "Démo live dashboard", description: "Visite guidée du tableau de bord Fleet 360 : carte GPS, alertes, planning maintenance et rapport mensuel." },
    ],
  },
];

const TYPE_ICONS: Record<string, { icon: IconName; label: string; color: string }> = {
  VISUAL: { icon: "sparkles", label: "Visuel", color: "bg-pink-100 text-pink-700" },
  ARGUMENT: { icon: "puzzle", label: "Argumentaire", color: "bg-blue-100 text-blue-700" },
  VIDEO: { icon: "target", label: "Vidéo", color: "bg-purple-100 text-purple-700" },
};

export function MarketingKitPacks() {
  const [activeProduct, setActiveProduct] = useState(0);
  const product = PRODUCT_KITS[activeProduct];

  return (
    <section id="kits-marketing" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal animation="fade-up">
          <div className="text-center">
            <span className="label-caps inline-block rounded-full px-4 py-1.5 bg-pink-50 text-pink-600">
              Packs de vente prêts à l&apos;emploi
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">
              Kits Marketing par logiciel
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Pour chaque logiciel, recevez des argumentaires, visuels et vidéos prêts à partager.
              Copiez, personnalisez et envoyez à vos prospects.
            </p>
          </div>
        </ScrollReveal>

        {/* Product tabs */}
        <ScrollReveal animation="fade-up" delay={100}>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {PRODUCT_KITS.map((p, i) => (
              <button
                key={p.slug}
                onClick={() => setActiveProduct(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  i === activeProduct
                    ? p.activeColor + " shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200"
                }`}
              >
                <Icon name={p.icon} className="h-4 w-4" />
                {p.name}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Kit cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {product.kits.map((kit, i) => {
            const typeInfo = TYPE_ICONS[kit.type];
            return (
              <ScrollReveal key={`${product.slug}-${i}`} animation="fade-up" delay={i * 80}>
                <div className="card-premium h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-ink">{kit.title}</h3>
                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${typeInfo.color}`}>
                      <Icon name={typeInfo.icon} className="h-3 w-3" />
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 italic">
                    {kit.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                      <Icon name="link" className="h-3 w-3" />
                      Copier le texte
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-center text-white">
            <p className="font-bold">
              <Icon name="sparkles" className="inline h-5 w-5 text-gold-400 mr-1" />
              Tous ces kits sont disponibles dans votre espace partenaire dès l&apos;inscription
            </p>
            <p className="mt-1 text-sm text-brand-100">
              Visuels HD, argumentaires personnalisables et vidéos de démonstration inclus gratuitement.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
