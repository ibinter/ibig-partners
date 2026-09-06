export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-100" />
      <div className="h-4 w-72 rounded-lg bg-slate-100" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
          <div className="h-5 w-2/3 rounded-lg bg-slate-100" />
          <div className="h-4 w-1/2 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
