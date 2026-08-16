export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-xl bg-slate-200" />
        <div className="h-10 w-32 rounded-xl bg-slate-200" />
      </div>
      <div className="h-11 rounded-xl bg-slate-100" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-100" />)}
      </div>
    </div>
  );
}
