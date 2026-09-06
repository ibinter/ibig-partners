import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LEVELS = [
  { name: "Bronze", min: 0, max: 4, color: "#cd7f32", bg: "bg-amber-50", border: "border-amber-200", perks: ["Accès à l'académie IBIG", "Support email standard", "Kit marketing de base"] },
  { name: "Argent", min: 5, max: 14, color: "#9ca3af", bg: "bg-gray-50", border: "border-gray-200", perks: ["Tout Bronze +", "Support prioritaire", "Formation avancée", "Badge Argent exclusif"] },
  { name: "Or", min: 15, max: 29, color: "#f59e0b", bg: "bg-yellow-50", border: "border-yellow-200", perks: ["Tout Argent +", "Manager dédié", "Commission boostée +5%", "Badge Or exclusif"] },
  { name: "Platine", min: 30, max: Infinity, color: "#8b5cf6", bg: "bg-violet-50", border: "border-violet-200", perks: ["Tout Or +", "Accès VIP événements", "Commission N2 boostée", "Badge Platine exclusif", "Invitation dîner annuel IBIG"] },
];

export default async function VipPage() {
  const user = await requireUser();
  const totalSales = await (prisma as any).sale.count({ where: { userId: user.id, status: "VALIDATED" } });

  const currentLevel = LEVELS.findLast((l) => totalSales >= l.min) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.min > totalSales);
  const progress = nextLevel ? Math.min(100, ((totalSales - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100) : 100;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Programme VIP</h1>
        <p className="text-sm text-gray-500 mt-1">Montez en grade et débloquez des avantages exclusifs</p>
      </div>

      <div className={`rounded-2xl border p-6 ${currentLevel.bg} ${currentLevel.border}`}>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl font-black border-4" style={{ borderColor: currentLevel.color, color: currentLevel.color }}>
            {currentLevel.name[0]}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: currentLevel.color }}>Votre niveau actuel</p>
            <p className="text-3xl font-black" style={{ color: currentLevel.color }}>{currentLevel.name}</p>
            <p className="text-sm text-gray-600">{totalSales} vente{totalSales !== 1 ? "s" : ""} validée{totalSales !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {nextLevel && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{totalSales} / {nextLevel.min} ventes pour {nextLevel.name}</span>
              <span>{nextLevel.min - totalSales} manquante{nextLevel.min - totalSales !== 1 ? "s" : ""}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: currentLevel.color }} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Vos avantages {currentLevel.name}</p>
        <ul className="space-y-2">
          {currentLevel.perks.map((p) => (
            <li key={p} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-emerald-500">✓</span> {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {LEVELS.map((l) => (
          <div key={l.name} className={`rounded-xl border p-3 text-center ${l.name === currentLevel.name ? `${l.bg} ${l.border}` : "opacity-50"}`}>
            <p className="text-lg font-black" style={{ color: l.color }}>{l.name}</p>
            <p className="text-[10px] text-gray-500">{l.min === 0 ? "0+" : `${l.min}+`} ventes</p>
          </div>
        ))}
      </div>
    </div>
  );
}
