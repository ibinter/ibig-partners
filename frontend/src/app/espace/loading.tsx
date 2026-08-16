export default function EspaceLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 rounded-xl bg-slate-200" />
      <div className="h-4 w-72 rounded-lg bg-slate-100" />

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-64 rounded-2xl bg-slate-100" />
      <div className="h-40 rounded-2xl bg-slate-100" />
    </div>
  );
}
