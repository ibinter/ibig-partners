export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-xl w-64" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
      </div>
      {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
    </div>
  );
}
