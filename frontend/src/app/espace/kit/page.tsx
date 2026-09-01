import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { STATUSES, STATUS_LABELS } from "@/lib/constants";
import KitFilter from "./kit-filter";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  ARGUMENT: "Argumentaire",
  VISUAL:   "Visuel",
  VIDEO:    "Vidéo",
};

const TYPE_ICON: Record<string, string> = {
  ARGUMENT: "💬",
  VISUAL:   "🖼️",
  VIDEO:    "🎥",
};

export default async function KitPage() {
  const user = await requireUser();
  const userRank = STATUSES.indexOf(user.status as (typeof STATUSES)[number]);

  const kits = await prisma.marketingKit.findMany({
    include: { branch: true, product: true },
    orderBy: { createdAt: "desc" },
  });

  const visible = kits.filter(
    (k) => STATUSES.indexOf(k.minStatus as (typeof STATUSES)[number]) <= userRank,
  );
  const locked = kits.filter(
    (k) => STATUSES.indexOf(k.minStatus as (typeof STATUSES)[number]) > userRank,
  );

  const countByType = (list: typeof kits, type: string) =>
    list.filter((k) => k.type === type).length;

  const affiliateInfo = {
    name:  `${user.firstName} ${user.lastName}`,
    code:  user.code,
    phone: user.phone ?? "",
    email: user.email,
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Kit Marketing"
        subtitle="Visuels, argumentaires et vidéos personnalisables pour vos campagnes d'affiliation."
      />

      {/* ── KPI cards ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-200">Disponibles</p>
          <p className="mt-1 text-2xl font-extrabold">{visible.length}</p>
          <p className="mt-0.5 text-xs text-blue-200">ressources accessibles</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-200">Argumentaires</p>
          <p className="mt-1 text-2xl font-extrabold">{countByType(visible, "ARGUMENT")}</p>
          <p className="mt-0.5 text-xs text-violet-200">messages personnalisés</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-200">Visuels</p>
          <p className="mt-1 text-2xl font-extrabold">{countByType(visible, "VISUAL")}</p>
          <p className="mt-0.5 text-xs text-emerald-200">images à partager</p>
        </div>
        <div className={`rounded-2xl p-4 text-white shadow-sm ${locked.length > 0 ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-gradient-to-br from-slate-600 to-slate-700"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Verrouillées</p>
          <p className="mt-1 text-2xl font-extrabold">{locked.length}</p>
          <p className="mt-0.5 text-xs text-white/60">{locked.length > 0 ? "progressez pour débloquer" : "tout est accessible"}</p>
        </div>
      </div>

      {/* ── Bannière personnalisation ── */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl shrink-0">✨</span>
            <div>
              <p className="font-semibold text-blue-900 text-sm">Ressources personnalisées automatiquement</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Les argumentaires s&apos;adaptent à votre nom <strong>{user.firstName} {user.lastName}</strong> et votre code <strong className="font-mono">{user.code}</strong>. Copiez, adaptez, partagez !
              </p>
            </div>
          </div>
          <Link
            href="/espace/coach"
            className="shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition shadow"
          >
            🤖 Coach IA pour rédiger →
          </Link>
        </div>
      </div>

      {/* ── Ressources disponibles ── */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-sm font-semibold text-slate-500">Aucune ressource disponible pour le moment</p>
          <p className="text-xs text-slate-400 mt-1">L&apos;équipe IBIG prépare des contenus pour votre statut. Revenez bientôt !</p>
        </div>
      ) : (
        <KitFilter kits={visible as any[]} affiliate={affiliateInfo} />
      )}

      {/* ── Ressources verrouillées ── */}
      {locked.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
              🔒 {locked.length} ressource{locked.length > 1 ? "s" : ""} à débloquer
            </p>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <span className="text-xl shrink-0">⭐</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Progressez pour accéder aux ressources premium</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Votre statut actuel : <strong>{STATUS_LABELS[user.status]}</strong>. Réalisez plus de ventes et recrutez des filleuls pour débloquer ces contenus.
              </p>
              <Link href="/espace/formation" className="mt-1.5 inline-block text-xs font-bold text-amber-700 hover:underline">
                Voir comment progresser →
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((k) => {
              const requiredStatus = STATUS_LABELS[k.minStatus] ?? k.minStatus;
              return (
                <div key={k.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm opacity-60 select-none">
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-2">
                    <div className="rounded-2xl bg-white border border-slate-200 shadow px-5 py-3 text-center">
                      <p className="text-2xl mb-1">🔒</p>
                      <p className="text-xs font-bold text-slate-700">Statut requis</p>
                      <p className="text-sm font-extrabold text-blue-700 mt-0.5">{requiredStatus}</p>
                    </div>
                  </div>
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      {TYPE_ICON[k.type]} {TYPE_LABELS[k.type] ?? k.type}
                    </span>
                    <span className="text-xs text-slate-300">{k.branch?.name ?? k.product?.name ?? "Général"}</span>
                  </div>
                  <h4 className="px-5 pb-4 pt-1 text-sm font-semibold text-slate-300 leading-snug">{k.title}</h4>
                  <div className="mx-5 mb-5 h-20 rounded-xl bg-slate-50" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Conseil usage ── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-5 py-3">
          <h3 className="font-semibold text-white text-sm">💡 Comment utiliser votre kit marketing</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { icon: "📋", title: "Copiez l'argumentaire", desc: "Cliquez « Copier » — votre nom et code sont déjà intégrés. Collez directement dans WhatsApp, email ou SMS." },
            { icon: "✏️", title: "Adaptez si nécessaire", desc: "Cliquez « Adapter » pour modifier le texte avant de l'envoyer. La version originale est toujours récupérable." },
            { icon: "🖼️", title: "Partagez les visuels", desc: "Téléchargez les images et publiez-les sur vos réseaux sociaux (WhatsApp Status, Facebook, Instagram)." },
            { icon: "🤖", title: "Générez des messages sur-mesure", desc: "Utilisez le Coach IA pour créer un message adapté à un prospect spécifique (son secteur, son besoin).", link: "/espace/coach", linkLabel: "Ouvrir le Coach IA →" },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div>
                <p className="font-semibold text-sm text-slate-800">{tip.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{tip.desc}</p>
                {tip.link && (
                  <Link href={tip.link} className="mt-1 inline-block text-xs font-bold text-blue-600 hover:underline">
                    {tip.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
