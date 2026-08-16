export default function Loading() {
  return (
    <div className="space-y-5 animate-pulse max-w-xl">
      <div className="h-8 w-36 rounded-xl bg-slate-200" />
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-5 w-36 rounded-lg bg-slate-200" />
          <div className="h-4 w-24 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-slate-100" />)}
      </div>
      <div className="h-10 w-32 rounded-xl bg-slate-200" />
    </div>
  );
}
