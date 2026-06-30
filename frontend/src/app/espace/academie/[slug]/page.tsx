import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { markModuleComplete, markModuleStarted } from "../actions";

export const dynamic = "force-dynamic";

function isYouTube(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isVimeo(url: string) {
  return url.includes("vimeo.com");
}

function toYouTubeEmbed(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
}

function toVimeoEmbed(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  return url;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;

  const mod = await (prisma as any).trainingModule.findUnique({
    where: { slug },
  });

  if (!mod || !mod.active) notFound();

  // Contrôle d'accès par statut minimum requis
  const STATUS_ORDER = ["STARTER", "SILVER", "GOLD", "MASTER", "ELITE"];
  const userRank = STATUS_ORDER.indexOf(user.status);
  const requiredRank = STATUS_ORDER.indexOf(mod.minStatus ?? "STARTER");
  if (requiredRank > userRank) {
    redirect("/espace/academie");
  }

  // Auto-mark as started
  await (prisma as any).trainingProgress.upsert({
    where: { userId_moduleId: { userId: user.id, moduleId: mod.id } },
    create: { userId: user.id, moduleId: mod.id, startedAt: new Date() },
    update: {},
  });

  // Increment view count
  await (prisma as any).trainingModule.update({
    where: { id: mod.id },
    data: { viewCount: { increment: 1 } },
  });

  const progress = await (prisma as any).trainingProgress.findUnique({
    where: { userId_moduleId: { userId: user.id, moduleId: mod.id } },
  });

  // Related modules
  const relatedWhere: Record<string, unknown> = {
    active: true,
    id: { not: mod.id },
  };
  if (mod.branchId) relatedWhere.branchId = mod.branchId;
  else if (mod.productId) relatedWhere.productId = mod.productId;

  const related = await (prisma as any).trainingModule.findMany({
    where: relatedWhere,
    orderBy: { order: "asc" },
    take: 3,
  });

  const TYPE_LABELS: Record<string, string> = {
    VIDEO: "Vidéo", PDF: "Guide PDF", ARTICLE: "Article",
    AI: "Assistant IA", QUIZ: "Quiz", AUDIO: "Audio", IMAGE: "Image",
  };

  const TYPE_COLORS: Record<string, string> = {
    VIDEO: "bg-blue-100 text-blue-700", PDF: "bg-amber-100 text-amber-700",
    ARTICLE: "bg-green-100 text-green-700", AI: "bg-violet-100 text-violet-700",
    QUIZ: "bg-orange-100 text-orange-700", AUDIO: "bg-pink-100 text-pink-700",
    IMAGE: "bg-teal-100 text-teal-700",
  };

  let questions: QuizQuestion[] = [];
  if (mod.type === "QUIZ" && mod.content) {
    try {
      questions = JSON.parse(mod.content);
    } catch {
      questions = [];
    }
  }

  if (mod.type === "AI") {
    redirect(`/espace/academie/assistant?topic=${mod.slug}`);
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-xs text-muted">
        <Link href="/espace/academie" className="hover:text-blue-600 transition-colors">
          Académie
        </Link>
        <span>/</span>
        <span className="text-ink font-medium">{mod.title}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <PageHeader title={mod.title} subtitle={mod.description ?? ""} />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TYPE_COLORS[mod.type] ?? "bg-slate-100 text-slate-700"}`}>
            {TYPE_LABELS[mod.type] ?? mod.type}
          </span>
          {mod.duration && (
            <span className="text-xs text-muted">⏱ {mod.duration}</span>
          )}
          {progress?.completedAt && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              ✓ Complété
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <Card>
        {/* VIDEO */}
        {mod.type === "VIDEO" && mod.content && (
          <div className="space-y-4">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              {isYouTube(mod.content) ? (
                <iframe
                  src={toYouTubeEmbed(mod.content)}
                  className="h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={mod.title}
                />
              ) : isVimeo(mod.content) ? (
                <iframe
                  src={toVimeoEmbed(mod.content)}
                  className="h-full w-full"
                  allowFullScreen
                  title={mod.title}
                />
              ) : (
                <video
                  src={mod.content}
                  controls
                  className="h-full w-full"
                  title={mod.title}
                />
              )}
            </div>
          </div>
        )}

        {/* PDF */}
        {mod.type === "PDF" && mod.content && (
          <div className="space-y-4">
            <iframe
              src={mod.content}
              className="h-[70vh] w-full rounded-xl border border-slate-200"
              title={mod.title}
            />
            <a
              href={mod.content}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 transition"
            >
              📥 Télécharger le PDF
            </a>
          </div>
        )}

        {/* ARTICLE */}
        {mod.type === "ARTICLE" && mod.content && (
          <div className="prose prose-slate max-w-none">
            <div className="rounded-xl bg-slate-50 p-6 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
              {mod.content}
            </div>
          </div>
        )}

        {/* AUDIO */}
        {mod.type === "AUDIO" && mod.content && (
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 p-6 border border-pink-100">
              <span className="text-5xl">🎧</span>
              <div className="flex-1">
                <p className="font-semibold text-ink mb-3">{mod.title}</p>
                <audio
                  src={mod.content}
                  controls
                  className="w-full"
                  title={mod.title}
                />
              </div>
            </div>
            <a
              href={mod.content}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-pink-400 hover:text-pink-700 transition"
            >
              📥 Télécharger l&apos;audio
            </a>
          </div>
        )}

        {/* IMAGE */}
        {mod.type === "IMAGE" && mod.content && (
          <div className="space-y-4 p-6">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mod.content}
                alt={mod.title}
                className="mx-auto max-h-[70vh] w-full object-contain"
              />
            </div>
            <div className="flex gap-3">
              <a
                href={mod.content}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-teal-400 hover:text-teal-700 transition"
              >
                📥 Télécharger l&apos;image
              </a>
              <a
                href={mod.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 transition"
              >
                🔍 Ouvrir en plein écran
              </a>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {mod.type === "QUIZ" && (
          <div className="space-y-6">
            {questions.length === 0 ? (
              <p className="text-sm text-muted">Ce quiz ne contient pas encore de questions.</p>
            ) : (
              questions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-slate-200 p-5">
                  <p className="mb-3 font-semibold text-ink text-sm">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition"
                      >
                        <input
                          type="radio"
                          name={`q_${qi}`}
                          value={oi}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Mark complete */}
      {!progress?.completedAt && (
        <div className="mt-6">
          <form action={markModuleComplete}>
            <input type="hidden" name="moduleId" value={mod.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
            >
              ✓ Marquer comme complété
            </button>
          </form>
        </div>
      )}

      {/* Related modules */}
      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-semibold text-ink text-sm">Modules similaires</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((r: any) => (
              <Link
                key={r.id}
                href={`/espace/academie/${r.slug}`}
                className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition"
              >
                <p className="font-medium text-sm text-ink group-hover:text-blue-700 transition-colors leading-snug">
                  {r.title}
                </p>
                {r.description && (
                  <p className="mt-1 text-xs text-muted line-clamp-2">{r.description}</p>
                )}
                <span className="mt-2 inline-block text-xs font-semibold text-blue-600">
                  Voir →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
