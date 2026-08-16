export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100" />)}
      </div>
      <div className="h-72 rounded-2xl bg-slate-100" />
    </div>
  );
}
