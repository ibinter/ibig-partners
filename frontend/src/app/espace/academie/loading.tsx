export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-52 rounded-xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-44 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
