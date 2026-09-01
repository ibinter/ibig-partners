import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui";
import { createTicket } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string>  = { OPEN: "Ouvert", IN_PROGRESS: "En cours", CLOSED: "Résolu" };
const PRIORITY_LABELS: Record<string, string> = { LOW: "Faible", NORMAL: "Normal", HIGH: "Haute", URGENT: "Urgent" };

const STATUS_STYLE: Record<string, string> = {
  OPEN:        "bg-amber-100 text-amber-800 border border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border border-blue-200",
  CLOSED:      "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

const PRIORITY_STYLE: Record<string, string> = {
  LOW:    "bg-slate-100 text-slate-600",
  NORMAL: "bg-blue-50 text-blue-700",
  HIGH:   "bg-orange-50 text-orange-700 font-bold",
  URGENT: "bg-rose-100 text-rose-700 font-bold",
};

const PRIORITY_DELAY: Record<string, string> = {
  LOW:    "Réponse sous 72h",
  NORMAL: "Réponse sous 48h",
  HIGH:   "Réponse sous 24h",
  URGENT: "Réponse prioritaire sous 12h",
};

const CATEGORIES = [
  { value: "Commission",    label: "💰 Commission",       desc: "Commission manquante, calcul incorrect, délai de versement" },
  { value: "Paiement",      label: "💸 Paiement",         desc: "Virement non reçu, mode de paiement, seuil de retrait" },
  { value: "KYC",           label: "🔐 Vérification KYC", desc: "Dossier rejeté, documents, délai d'examen" },
  { value: "Technique",     label: "🖥️ Technique",        desc: "Bug plateforme, lien cassé, accès impossible" },
  { value: "Produit",       label: "📦 Produit",          desc: "Activation produit, lien affiliation, prix" },
  { value: "Formation",     label: "🎓 Formation",        desc: "Accès cours, certification, contenu" },
  { value: "Autre",         label: "📝 Autre",            desc: "Tout autre sujet non listé" },
];

const FAQ_ITEMS = [
  {
    q: "Ma commission n'est pas créée après une vente via mon lien.",
    a: "Vérifiez que la vente est confirmée dans /espace/commissions. Si le client a effacé ses cookies ou utilisé un autre navigateur, le tracking peut avoir été perdu. Ouvrez un ticket Catégorie : Commission avec la référence de la vente.",
    link: "/espace/commissions",
    linkLabel: "Voir mes commissions",
  },
  {
    q: "Mon virement n'est pas arrivé après validation.",
    a: "Les virements sont traités sous 7 jours ouvrables. Vérifiez que votre KYC est validé et que vos coordonnées de paiement sont correctes dans votre profil.",
    link: "/espace/paiements",
    linkLabel: "Voir mes paiements",
  },
  {
    q: "Mon dossier KYC est rejeté, que faire ?",
    a: "Consultez le motif de rejet dans /espace/verification, corrigez les informations demandées (photo de la pièce en bonne qualité, document lisible) et soumettez à nouveau.",
    link: "/espace/verification",
    linkLabel: "Aller à la vérification",
  },
  {
    q: "Je ne peux pas activer un produit.",
    a: "Certains produits nécessitent que votre compte soit approuvé par l'équipe. Si votre compte est validé et le produit toujours inaccessible, ouvrez un ticket Catégorie : Produit.",
    link: "/espace/produits",
    linkLabel: "Mes produits",
  },
];

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default async function SupportPage() {
  const user = await requireUser();

  const tickets = await prisma.ticket.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { messages: true } } },
  });

  const openCount     = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const closedCount   = tickets.filter((t) => t.status === "CLOSED").length;
  const urgentCount   = tickets.filter((t) => t.priority === "URGENT" && t.status !== "CLOSED").length;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Support"
        subtitle="Notre équipe répond sous 12–48h selon la priorité. Consultez la FAQ avant d'ouvrir un ticket."
      />

      {/* ── 4 KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-100">Tickets ouverts</p>
          <p className="mt-1 text-2xl font-extrabold">{openCount}</p>
          <p className="mt-0.5 text-xs text-amber-100">en attente de réponse</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">En cours</p>
          <p className="mt-1 text-2xl font-extrabold">{inProgressCount}</p>
          <p className="mt-0.5 text-xs text-blue-200">traitement en cours</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Résolus</p>
          <p className="mt-1 text-2xl font-extrabold">{closedCount}</p>
          <p className="mt-0.5 text-xs text-emerald-200">tickets fermés</p>
        </div>
        <div className={`rounded-2xl p-4 text-white shadow-sm ${urgentCount > 0 ? "bg-gradient-to-br from-rose-600 to-rose-700" : "bg-gradient-to-br from-slate-600 to-slate-700"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Total tickets</p>
          <p className="mt-1 text-2xl font-extrabold">{tickets.length}</p>
          <p className="mt-0.5 text-xs text-white/60">{urgentCount > 0 ? `${urgentCount} urgent${urgentCount > 1 ? "s" : ""}` : "aucun urgent"}</p>
        </div>
      </div>

      {/* ── Alerte tickets urgents non résolus ── */}
      {urgentCount > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 flex items-start gap-3">
          <span className="text-xl shrink-0">🚨</span>
          <div>
            <p className="font-semibold text-rose-800 text-sm">{urgentCount} ticket{urgentCount > 1 ? "s" : ""} urgent{urgentCount > 1 ? "s" : ""} en attente</p>
            <p className="text-xs text-rose-700 mt-0.5">Notre équipe les traite en priorité sous 12h ouvrables.</p>
          </div>
        </div>
      )}

      {/* ── FAQ self-service ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-3">
          <h3 className="font-semibold text-white text-sm">💡 Avant d&apos;ouvrir un ticket — Vérifiez ces réponses rapides</h3>
          <p className="text-xs text-slate-300 mt-0.5">La plupart des questions sont résolues en quelques clics.</p>
        </div>
        <div className="divide-y divide-slate-50">
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} className="px-5 py-4">
              <p className="text-sm font-semibold text-slate-800 mb-1">{faq.q}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
              <Link href={faq.link} className="mt-1.5 inline-block text-xs font-semibold text-blue-600 hover:underline">
                {faq.linkLabel} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Formulaire nouveau ticket ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-5 py-4">
          <h3 className="font-bold text-white">✉️ Ouvrir un ticket de support</h3>
          <p className="text-xs text-blue-100 mt-0.5">Notre équipe répond sous 12–48h ouvrables selon la priorité.</p>
        </div>

        <form action={createTicket} className="p-5 space-y-5">
          {/* Catégorie + Priorité */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Catégorie <span className="text-rose-500">*</span>
              </label>
              <select name="category" required className={inputCls}>
                <option value="">— Choisir la catégorie —</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {CATEGORIES.slice(0, 4).map((c) => (
                  <p key={c.value} className="text-[10px] text-slate-400 leading-tight">{c.label} — {c.desc}</p>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priorité</label>
                <select name="priority" defaultValue="NORMAL" className={inputCls}>
                  <option value="LOW">Faible — {PRIORITY_DELAY.LOW}</option>
                  <option value="NORMAL">Normal — {PRIORITY_DELAY.NORMAL}</option>
                  <option value="HIGH">Haute — {PRIORITY_DELAY.HIGH}</option>
                  <option value="URGENT">Urgent — {PRIORITY_DELAY.URGENT}</option>
                </select>
              </div>
              <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-700">
                ℹ️ Utilisez <strong>Urgent</strong> uniquement pour les blocages empêchant toute activité (accès perdu, paiement bloqué, etc.).
              </div>
            </div>
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Sujet <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              required
              placeholder="Ex : Commission manquante sur vente VTE-0012 du 15/08"
              className={inputCls}
            />
            <p className="text-[11px] text-slate-400 mt-1">Soyez précis — incluez les références (VTE-XXXX, date, montant) si pertinent.</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Message détaillé <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="body"
              required
              rows={5}
              placeholder="Décrivez votre problème en détail : que s'est-il passé, quand, sur quel produit, quelles étapes avez-vous déjà essayées…"
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
            <p className="text-xs text-slate-400">
              Vous serez notifié par email à chaque réponse de notre équipe.
            </p>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:from-blue-700 hover:to-violet-700 transition"
            >
              Envoyer le ticket →
            </button>
          </div>
        </form>
      </div>

      {/* ── Liste des tickets ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 text-sm">Mes tickets ({tickets.length})</h3>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-sm font-semibold text-slate-500">Aucun ticket pour le moment</p>
            <p className="text-xs text-slate-400 mt-1">Consultez la FAQ ci-dessus avant d&apos;en créer un.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-50">
              {tickets.map((t) => {
                const isUrgentOpen = t.priority === "URGENT" && t.status !== "CLOSED";
                return (
                  <li key={t.id}>
                    <Link
                      href={`/espace/support/${t.id}`}
                      className={`flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors group gap-4 ${isUrgentOpen ? "border-l-4 border-rose-400 bg-rose-50/30" : ""}`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={`mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-[10px] uppercase tracking-wide ${PRIORITY_STYLE[t.priority]}`}>
                          {PRIORITY_LABELS[t.priority]}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                            {isUrgentOpen && "🚨 "}{t.subject}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {t._count.messages} message{t._count.messages !== 1 ? "s" : ""} · {formatDate(t.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded-xl px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[t.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {STATUS_LABELS[t.status] ?? t.status}
                        </span>
                        <span className="text-slate-300 group-hover:text-blue-400 text-sm">→</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* ── Contact direct ── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-sm text-slate-800 mb-3">Autres canaux de contact</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "💬", label: "WhatsApp Support", sub: "Réponse sous 24h", href: "https://wa.me/2250701000000", ext: true },
            { icon: "📧", label: "Email",            sub: "support@ibigpartners.com", href: "mailto:support@ibigpartners.com", ext: true },
            { icon: "🤖", label: "Assistant IA",    sub: "Réponse immédiate", href: "/espace/coach", ext: false },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.ext ? "_blank" : undefined}
              rel={c.ext ? "noopener noreferrer" : undefined}
              className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50 transition group"
            >
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{c.label}</p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
