export default function AdminLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-56 rounded-xl bg-slate-200" />
          <div className="h-4 w-40 rounded-lg bg-slate-100 mt-2" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100" />
        ))}
      </div>

      <div className="h-72 rounded-2xl bg-slate-100" />
    </div>
  );
}
