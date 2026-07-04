"use client";

export default function AcademieError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="p-8 rounded-2xl border border-red-200 bg-red-50 font-mono text-sm text-red-700 space-y-2">
      <p className="font-bold text-base">Erreur — {error.message}</p>
      {error.digest && <p className="text-xs text-red-500">Digest : {error.digest}</p>}
      <pre className="whitespace-pre-wrap text-xs text-red-600 overflow-auto max-h-64">{error.stack}</pre>
    </div>
  );
}
