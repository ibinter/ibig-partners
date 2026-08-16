export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-200" />
      <div className="h-4 w-64 rounded-lg bg-slate-100" />
      <div className="h-48 rounded-2xl bg-slate-100" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100" />)}
      </div>
    </div>
  );
}
