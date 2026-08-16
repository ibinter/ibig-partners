export default function Loading() {
  return (
    <div className="flex h-full animate-pulse gap-4">
      <div className="w-72 shrink-0 space-y-3">
        <div className="h-8 w-40 rounded-xl bg-slate-200" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100" />)}
      </div>
      <div className="flex-1 rounded-2xl bg-slate-100" />
    </div>
  );
}
