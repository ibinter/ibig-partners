export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-44 rounded-xl bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-100" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100" />)}
      </div>
    </div>
  );
}
