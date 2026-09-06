import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";

const LEVELS = [
  { status: "ELITE",  min: 50 },
  { status: "MASTER", min: 25 },
  { status: "GOLD",   min: 10 },
  { status: "SILVER", min: 3  },
  { status: "STARTER",min: 0  },
];

const LEVEL_LABELS: Record<string, string> = {
  STARTER: "🌱 Starter",
  SILVER:  "🥈 Silver",
  GOLD:    "⭐ Gold",
  MASTER:  "💎 Master",
  ELITE:   "🏆 Elite",
};

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, firstName: true, email: true, status: true },
  });

  let upgraded = 0;
  for (const p of partners) {
    const salesCount = await prisma.sale.count({ where: { sellerId: p.id, status: "CONFIRMED" } });
    const newLevel = LEVELS.find((l) => salesCount >= l.min)?.status ?? "STARTER";
    if (newLevel !== p.status) {
      const currentIdx = LEVELS.findIndex((l) => l.status === p.status);
      const newIdx = LEVELS.findIndex((l) => l.status === newLevel);
      if (newIdx < currentIdx) {
        await prisma.user.update({ where: { id: p.id }, data: { status: newLevel } });
        try {
          await sendEmail({
            to: p.email,
            subject: `🎉 Félicitations ! Vous passez au niveau ${LEVEL_LABELS[newLevel]}`,
            html: `<p>Bonjour ${p.firstName},</p>
<p>Nous sommes ravis de vous annoncer que vous venez de passer au niveau <strong>${LEVEL_LABELS[newLevel]}</strong> dans le programme IBIG Partners !</p>
<p>Avec <strong>${salesCount} vente(s) confirmée(s)</strong>, vous avez atteint ce nouveau palier qui vous ouvre de nouveaux avantages.</p>
<p>Continuez sur cette lancée — votre prochain niveau vous attend !</p>
<p>L'équipe IBIG Partners</p>`,
          });
        } catch { /* continue */ }
        upgraded++;
      }
    }
  }

  return NextResponse.json({ checked: partners.length, upgraded });
}
