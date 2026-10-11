import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { DescriptionBlock } from "@/components/DescriptionBlock";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const mission = await (prisma as any).mission.findUnique({ where: { id }, select: { title: true, description: true, branch: true } });
  if (!mission) return { title: "Mission introuvable" };
  return {
    title: `${mission.title} | IBIG PARTNERS`,
    description: mission.description?.slice(0, 160) ?? `Mission ${mission.branch} sur IBIG PARTNERS`,
  };
}

const BRANCH_COLOR: Record<string, { bg: string; text: string; border: string; gradient: string; emoji: string }> = {
  "Commercial — transversal":  { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa", gradient: "from-orange-500 to-red-600",   emoji: "💼" },
  "IBIG Soft":                 { bg: "#f5f3ff", text: "#6d28d9", border: "#ddd6fe", gradient: "from-violet-500 to-purple-700",emoji: "⚙️" },
  "IBIG EduForm":              { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe", gradient: "from-blue-500 to-indigo-700",  emoji: "🎓" },
  "IBIG Immo Trust":           { bg: "#fffbeb", text: "#b45309", border: "#fde68a", gradient: "from-amber-400 to-orange-600", emoji: "🏠" },
  "IBIG Digital":              { bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc", gradient: "from-cyan-500 to-sky-700",     emoji: "💻" },
  "IBIG Digital Kits":         { bg: "#f0fdfa", text: "#0f766e", border: "#99f6e4", gradient: "from-teal-500 to-emerald-700", emoji: "🔧" },
  "IBIG Conseil Plus":         { bg: "#f8fafc", text: "#475569", border: "#cbd5e1", gradient: "from-slate-500 to-slate-700",  emoji: "📋" },
  "IBIG Market":               { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", gradient: "from-rose-500 to-pink-700",    emoji: "🛒" },
  "IBIG Multiservices":        { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa", gradient: "from-orange-400 to-amber-600", emoji: "🛠️" },
  "IBIG Financement":          { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0", gradient: "from-emerald-500 to-green-700",emoji: "💰" },
  "IBIG Emploi & Talents":     { bg: "#fdf4ff", text: "#86198f", border: "#f0abfc", gradient: "from-fuchsia-500 to-purple-700",emoji: "👥" },
  "IBIG PARTNERS & alliances": { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd", gradient: "from-sky-500 to-blue-700",    emoji: "🤝" },
};
const DEFAULT_COLOR = { bg: "#f8fafc", text: "#334155", border: "#cbd5e1", gradient: "from-slate-500 to-slate-700", emoji: "📦" };

function getBranchColor(branch: string) {
  if (BRANCH_COLOR[branch]) return BRANCH_COLOR[branch];
  return DEFAULT_COLOR;
}

const REWARD_LABEL: Record<string, string> = {
  CP:    "Lead validé (CP)",
  CASH:  "Vente encaissée (CASH)",
  MIXED: "Lead + Vente (MIXED)",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY:   "🟢 Facile",
  MEDIUM: "🟡 Moyen",
  HARD:   "🔴 Difficile",
};

const MISSION_TYPE_LABELS: Record<string, string> = {
  LEAD: "Apport de lead", VENTE: "Vente directe", RECRUTEMENT: "Recrutement",
  REPRESENTATION: "Représentation", PROSPECTION: "Prospection",
  SOURCING: "Sourcing", MISE_EN_RELATION: "Mise en relation",
  ETUDE: "Étude", ANIMATION: "Animation", PARTENARIAT: "Partenariat",
  IDENTIFICATION: "Identification d'opportunité", AUTRE: "Autre",
};

// Explications pédagogiques selon le type de mission
const MISSION_TYPE_HOWTO: Record<string, { action: string; trigger: string; proof: string }> = {
  LEAD: {
    action: "Trouver et référer un contact qualifié intéressé par ce produit ou service.",
    trigger: "La commission est versée dès que le lead est validé par l'équipe IBIG (contact joint, intérêt confirmé).",
    proof: "Fournissez le nom, numéro de téléphone et email du contact. Un échange WhatsApp ou une fiche de contact suffit.",
  },
  VENTE: {
    action: "Convaincre un client d'acheter le produit ou service et finaliser la transaction.",
    trigger: "La commission est versée après encaissement effectif du paiement par le client.",
    proof: "La vente doit passer par votre lien d'affiliation ou être déclarée via votre espace partenaire avec preuve de paiement.",
  },
  RECRUTEMENT: {
    action: "Identifier et parrainer un nouveau partenaire actif dans votre réseau.",
    trigger: "La commission est versée quand le filleul réalise sa première vente validée.",
    proof: "Le nouveau partenaire doit s'inscrire via votre lien de parrainage et compléter son profil.",
  },
  PROSPECTION: {
    action: "Identifier et contacter des prospects correspondant au profil cible défini dans cette mission.",
    trigger: "La commission est versée pour chaque prospect qualifié validé par l'équipe IBIG.",
    proof: "Soumettez une liste de contacts avec nom, téléphone, secteur d'activité et niveau d'intérêt.",
  },
  MISE_EN_RELATION: {
    action: "Mettre en contact deux parties définies dans la mission (client ↔ prestataire, acheteur ↔ vendeur, employeur ↔ candidat…).",
    trigger: "La commission est versée dès que les deux parties se sont rencontrées / échangées et que la relation est confirmée.",
    proof: "Fournissez la preuve de la mise en relation (échange WhatsApp, email de confirmation, attestation des deux parties).",
  },
  SOURCING: {
    action: "Trouver et référer des fournisseurs, prestataires ou ressources correspondant aux critères définis.",
    trigger: "La commission est versée après validation du sourcing par l'équipe IBIG.",
    proof: "Soumettez les coordonnées et devis/catalogue des fournisseurs identifiés.",
  },
  REPRESENTATION: {
    action: "Représenter IBIG SARL ou un de ses produits lors d'un événement, réunion ou rendez-vous client.",
    trigger: "La commission est versée après validation du compte-rendu de représentation.",
    proof: "Fournissez un compte-rendu écrit + photo ou signature de présence de l'événement.",
  },
  PARTENARIAT: {
    action: "Identifier et négocier un accord de partenariat commercial ou institutionnel au nom d'IBIG SARL.",
    trigger: "La commission est versée à la signature d'un accord de partenariat formalisé.",
    proof: "Soumettez le document d'accord signé par les deux parties.",
  },
};

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const mission = await (prisma as any).mission.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      branch: true,
      rewardType: true,
      cpAmount: true,
      compensationAmount: true,
      compensationType: true,
      rewardTrigger: true,
      proofInstructions: true,
      difficulty: true,
      zone: true,
      slots: true,
      deadline: true,
      status: true,
      category: true,
      missionType: true,
      minLevel: true,
      minCpRequired: true,
      _count: { select: { applications: true } },
    },
  });

  if (!mission || mission.status === "ARCHIVED" || mission.active === false) notFound();

  const c = getBranchColor(mission.branch);
  const isClosed = mission.status === "CLOSED";

  const cashAmt  = mission.compensationAmount ?? 0;
  const cpAmt    = mission.cpAmount ?? 0;
  const isPct    = mission.compensationType === "PERCENT";
  const cashFmt  = isPct ? `${(cashAmt / 100).toFixed(1)}%` : `${cashAmt.toLocaleString("fr-FR")} FCFA`;
  let rewardLine = "";
  let rewardSub  = "";
  if (mission.rewardType === "CP") {
    rewardLine = cpAmt > 0 ? `${cpAmt.toLocaleString("fr-FR")} CP` : "";
    rewardSub  = "Points de crédit versés après validation du lead";
  } else if (mission.rewardType === "CASH") {
    rewardLine = cashAmt > 0 ? cashFmt : "";
    rewardSub  = "Commission versée après encaissement de la vente";
  } else if (mission.rewardType === "MIXED") {
    rewardLine = [cashAmt > 0 ? cashFmt : "", cpAmt > 0 ? `${cpAmt.toLocaleString("fr-FR")} CP` : ""].filter(Boolean).join(" + ");
    rewardSub  = "Lead validé (CP) + commission après encaissement (CASH)";
  }

  // Guide pédagogique selon missionType
  const howto = mission.missionType ? MISSION_TYPE_HOWTO[mission.missionType] : null;

  const related = await (prisma as any).mission.findMany({
    where: { branch: mission.branch, status: "OPEN", id: { not: id } },
    take: 3,
    select: { id: true, title: true, rewardType: true, difficulty: true },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <header className={`relative bg-gradient-to-br ${c.gradient} overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5" />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 pt-6 pb-10">
          <div className="flex items-center gap-2 text-white/60 text-xs mb-5">
            <Link href="/missions" className="hover:text-white transition">Catalogue des missions</Link>
            <span>/</span>
            <span className="text-white/80 truncate max-w-xs">{mission.branch}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/25 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white">
              {c.emoji} {mission.branch}
            </span>
            {mission.missionType && (
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70">
                {MISSION_TYPE_LABELS[mission.missionType] ?? mission.missionType}
              </span>
            )}
            {mission.difficulty && (
              <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/70">
                {DIFFICULTY_LABEL[mission.difficulty]}
              </span>
            )}
            {isClosed ? (
              <span className="ml-auto text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-red-500/80 text-white border border-red-400/50">🔒 Clôturée</span>
            ) : (
              <span className="ml-auto text-[11px] font-extrabold px-3 py-1.5 rounded-full bg-emerald-400/80 text-white border border-emerald-300/50 animate-pulse">✅ Ouverte</span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-5" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.2)" }}>
            {mission.title}
          </h1>

          {/* Récompense mise en avant */}
          <div className="flex flex-wrap gap-3">
            {rewardLine ? (
              <div className="rounded-2xl bg-amber-400/90 border border-amber-300/50 backdrop-blur-sm px-5 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-900/70 mb-0.5">🏆 Vous gagnez</p>
                <p className="text-2xl font-extrabold text-amber-900">{rewardLine}</p>
                {rewardSub && <p className="text-[11px] text-amber-800/70 mt-0.5 font-medium">{rewardSub}</p>}
              </div>
            ) : null}
            {mission.zone && (
              <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-0.5">🌍 Zone</p>
                <p className="text-sm font-extrabold text-white">{mission.zone}</p>
              </div>
            )}
            {mission.slots && (
              <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-0.5">🎯 Places</p>
                <p className="text-sm font-extrabold text-white">{mission.slots} dispo.</p>
              </div>
            )}
            {mission.deadline && (
              <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 mb-0.5">📅 Limite</p>
                <p className="text-sm font-extrabold text-white">{new Date(mission.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Corps */}
      <main className="mx-auto max-w-4xl w-full px-4 py-8 flex-1">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">

            {/* ═══ BLOC 1 : CE QUE VOUS DEVEZ FAIRE ═══ */}
            <div className="rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100" style={{ background: c.bg }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xl" style={{ background: c.border }}>🎯</span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Ce que vous devez faire</h2>
                  <p className="text-[11px] text-slate-500">Tâche concrète à accomplir</p>
                </div>
              </div>
              <div className="px-6 py-5">
                {/* Description principale */}
                <DescriptionBlock text={mission.description} />

                {/* Guide pédagogique si disponible */}
                {howto && (
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-2">💡 En pratique</p>
                    <p className="text-sm text-blue-900 leading-relaxed">{howto.action}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ BLOC 2 : COMMENT DÉCLENCHER LA COMMISSION ═══ */}
            <div className="rounded-3xl overflow-hidden border border-emerald-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-emerald-100 bg-emerald-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-xl">💰</span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Comment déclencher votre commission</h2>
                  <p className="text-[11px] text-slate-500">Condition exacte de paiement</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                {/* Déclencheur stocké en base */}
                {mission.rewardTrigger ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-sm text-emerald-900 leading-relaxed font-medium">{mission.rewardTrigger}</p>
                  </div>
                ) : howto ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-sm text-emerald-900 leading-relaxed">{howto.trigger}</p>
                  </div>
                ) : null}

                {/* Tableau récapitulatif récompense */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Type</p>
                    <p className="text-sm font-extrabold text-slate-800">{REWARD_LABEL[mission.rewardType] ?? mission.rewardType}</p>
                  </div>
                  {rewardLine && (
                    <div className="rounded-2xl bg-amber-50 p-4 text-center border border-amber-100">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 mb-1">Montant</p>
                      <p className="text-lg font-extrabold text-amber-700">{rewardLine}</p>
                    </div>
                  )}
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Délai</p>
                    <p className="text-sm font-extrabold text-slate-800">7 jours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <span className="text-xl shrink-0">ℹ️</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Le paiement est effectué par <strong>Orange Money, Wave ou virement bancaire</strong> dans les 7 jours suivant la validation de votre action par l&apos;équipe IBIG PARTNERS.
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ BLOC 3 : CE QU'IL FAUT SOUMETTRE / PROUVER ═══ */}
            <div className="rounded-3xl overflow-hidden border border-violet-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-violet-100 bg-violet-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-xl">📎</span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Ce qu&apos;il faut soumettre pour être payé</h2>
                  <p className="text-[11px] text-slate-500">Preuve requise pour valider votre action</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                {mission.proofInstructions ? (
                  <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                    <p className="text-sm text-violet-900 leading-relaxed font-medium">{mission.proofInstructions}</p>
                  </div>
                ) : howto ? (
                  <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                    <p className="text-sm text-violet-900 leading-relaxed">{howto.proof}</p>
                  </div>
                ) : null}

                {/* Check-list visuelle */}
                <div className="space-y-2">
                  {(mission.rewardType === "LEAD" || mission.rewardType === "MIXED" || mission.missionType === "LEAD" || mission.missionType === "MISE_EN_RELATION" || mission.missionType === "PROSPECTION") && (
                    <>
                      {[
                        "Nom complet du contact référé",
                        "Numéro de téléphone (WhatsApp de préférence)",
                        "Email si disponible",
                        "Contexte : pourquoi ce contact est intéressé ?",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white text-xs">✓</span>
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {(mission.rewardType === "CASH" || mission.missionType === "VENTE") && (
                    <>
                      {[
                        "Capture d'écran ou reçu du paiement client",
                        "Nom du client et produit acheté",
                        "Date de la transaction",
                        "Votre code partenaire doit être lié à la vente",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white text-xs">✓</span>
                          <span className="text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <span className="text-xl shrink-0">⚠️</span>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <strong>Important :</strong> Sans preuve valide soumise dans votre espace partenaire, la commission ne peut pas être versée. En cas de doute, contactez le support IBIG PARTNERS avant de soumettre.
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ BLOC 4 : ÉTAPES POUR RÉUSSIR ═══ */}
            <div className="rounded-3xl overflow-hidden border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl">🗺️</span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Comment réussir cette mission — pas à pas</h2>
                  <p className="text-[11px] text-slate-500">Suivez ces étapes dans l&apos;ordre</p>
                </div>
              </div>
              <div className="px-6 py-5">
                <ol className="space-y-4">
                  {[
                    { step: "1", title: "Inscrivez-vous / connectez-vous", desc: "Créez votre compte IBIG PARTNERS gratuitement pour accéder à cette mission et récupérer votre lien tracé." },
                    { step: "2", title: "Candidatez à la mission", desc: "Dans votre espace partenaire, cliquez sur « Candidater » pour cette mission. Vous recevez alors toutes les instructions détaillées." },
                    { step: "3", title: "Accomplissez la tâche", desc: `${mission.missionType ? (MISSION_TYPE_LABELS[mission.missionType] ?? "Réalisez") : "Réalisez"} la mission selon les conditions décrites ci-dessus.` },
                    { step: "4", title: "Soumettez votre preuve", desc: "Via votre espace partenaire → Mes Missions → Soumettre une preuve. Joignez les documents requis." },
                    { step: "5", title: "Encaissez votre commission", desc: `Après validation par l'équipe IBIG (sous 72h), votre commission${rewardLine ? ` de ${rewardLine}` : ""} est versée sous 7 jours.` },
                  ].map((s) => (
                    <li key={s.step} className="flex gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-md" style={{ background: `linear-gradient(135deg, ${c.text}, #041B4D)` }}>
                        {s.step}
                      </span>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900">{s.title}</p>
                        <p className="mt-0.5 text-sm text-muted leading-relaxed">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ═══ BLOC 5 : DÉTAILS TECHNIQUES ═══ */}
            <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: c.bg }}>
                <span className="text-xl">⚙️</span>
                <h2 className="text-sm font-extrabold text-slate-800">Détails de la mission</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { label: "Branche", value: mission.branch, icon: c.emoji },
                  mission.missionType && { label: "Type de mission", value: MISSION_TYPE_LABELS[mission.missionType] ?? mission.missionType, icon: "🏷️" },
                  { label: "Type de récompense", value: REWARD_LABEL[mission.rewardType] ?? mission.rewardType, icon: "💎" },
                  rewardLine && { label: "Récompense", value: rewardLine, icon: "🏆" },
                  mission.difficulty && { label: "Difficulté", value: DIFFICULTY_LABEL[mission.difficulty], icon: "📊" },
                  mission.zone && { label: "Zone géographique", value: mission.zone, icon: "🌍" },
                  mission.minLevel && { label: "Niveau minimum requis", value: mission.minLevel, icon: "⭐" },
                  mission.slots && { label: "Places disponibles", value: `${mission.slots} place${mission.slots > 1 ? "s" : ""}`, icon: "🎯" },
                  mission.deadline && { label: "Date limite", value: new Date(mission.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }), icon: "📅" },
                  mission._count.applications > 0 && { label: "Candidatures", value: `${mission._count.applications} partenaire${mission._count.applications > 1 ? "s" : ""}`, icon: "👥" },
                ].filter(Boolean).map((row: any) => (
                  <div key={row.label} className="flex items-center gap-4 px-6 py-3.5">
                    <span className="text-xl shrink-0">{row.icon}</span>
                    <span className="text-xs font-bold text-slate-400 w-44 shrink-0">{row.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missions liées */}
            {related.length > 0 && (
              <div className="rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3" style={{ background: c.bg }}>
                  <span className="text-xl">🔗</span>
                  <h2 className="text-sm font-extrabold text-slate-800">Autres missions {mission.branch}</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {related.map((r: { id: string; title: string; rewardType: string; difficulty: string | null }) => (
                    <Link key={r.id} href={`/missions/${r.id}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition group">
                      <span className="text-lg shrink-0">{c.emoji}</span>
                      <span className="text-sm text-slate-700 font-medium flex-1 leading-snug group-hover:text-[#041B4D] transition">{r.title}</span>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-[#FF6A00] transition shrink-0">→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar sticky */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-100 bg-white">
                <div className={`bg-gradient-to-br ${c.gradient} px-5 py-6 text-center text-white`}>
                  {rewardLine && (
                    <>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1">Votre gain potentiel</p>
                      <p className="text-3xl font-extrabold">{rewardLine}</p>
                      <p className="text-xs text-white/60 mt-1">{rewardSub}</p>
                    </>
                  )}
                  {!rewardLine && (
                    <>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-2">Pour candidater</p>
                      <p className="text-base font-extrabold leading-snug">Inscription gratuite requise</p>
                    </>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  {isClosed ? (
                    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
                      🔒 Mission clôturée
                    </div>
                  ) : (
                    <>
                      <Link
                        href="/rejoindre"
                        className="block w-full rounded-2xl py-3.5 text-center text-sm font-extrabold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                        style={{ background: `linear-gradient(135deg, ${c.text}, #041B4D)` }}
                      >
                        🚀 S&apos;inscrire et candidater →
                      </Link>
                      <Link
                        href="/connexion"
                        className="block w-full rounded-2xl py-3 text-center text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                      >
                        Déjà partenaire ? Connexion
                      </Link>
                    </>
                  )}
                  <div className="pt-2 space-y-2">
                    {["✅ Inscription 100% gratuite", "💰 Commissions transparentes", "📱 Paiement Mobile Money", "🌍 Réseau panafricain"].map(txt => (
                      <div key={txt} className="text-xs text-slate-500 font-medium">{txt}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ rapide */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5 space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Questions fréquentes</p>
                {[
                  { q: "Dois-je payer pour candidater ?", a: "Non. L'inscription et la candidature sont 100% gratuites." },
                  { q: "Combien de missions puis-je faire ?", a: "Autant que vous voulez, en parallèle, sans limite." },
                  { q: "Quand suis-je payé ?", a: "Sous 7 jours après validation de votre preuve par l'équipe IBIG." },
                ].map(({ q, a }) => (
                  <div key={q} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs font-bold text-slate-800">{q}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Branche</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{mission.branch}</p>
                    <p className="text-[11px] text-slate-400">Réseau IBIG PARTNERS</p>
                  </div>
                </div>
                <Link href={`/missions?branch=${encodeURIComponent(mission.branch)}`} className="mt-3 block text-xs font-semibold text-[#041B4D] hover:text-[#FF6A00] transition">
                  Voir toutes les missions →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA mobile bas */}
        <div className={`mt-8 lg:hidden rounded-3xl bg-gradient-to-br ${c.gradient} text-white p-6 text-center space-y-3`}>
          <p className="font-extrabold text-lg">Candidater à cette mission</p>
          {rewardLine && <p className="text-2xl font-extrabold">{rewardLine}</p>}
          <p className="text-sm text-white/70">Inscrivez-vous gratuitement pour accéder à toutes les missions.</p>
          <div className="flex flex-col gap-2">
            <Link href="/rejoindre" className="block rounded-2xl bg-white py-3 text-sm font-extrabold" style={{ color: c.text }}>
              🚀 S&apos;inscrire gratuitement →
            </Link>
            <Link href="/connexion" className="block rounded-2xl bg-white/15 border border-white/25 py-3 text-sm font-semibold text-white">
              Déjà partenaire ? Connexion
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/missions" className="text-sm font-semibold text-slate-500 hover:text-[#FF6A00] transition">
            ← Retour au catalogue des missions
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
