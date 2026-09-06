import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email-utils";

const SEQUENCES = [
  { day: 0,  subject: "🎉 Bienvenue chez IBIG Partners !",            bodyFn: (n: string) => `<p>Bonjour ${n},</p><p>Bienvenue dans le programme IBIG Partners ! Votre compte est activé. Commencez par créer votre premier lien d'affiliation sur <a href="https://ibigpartners.com/espace/liens">votre espace</a>.</p>` },
  { day: 3,  subject: "🔗 Avez-vous partagé votre lien de parrainage ?", bodyFn: (n: string) => `<p>Bonjour ${n},</p><p>3 jours se sont écoulés depuis votre inscription. Avez-vous déjà partagé votre lien d'affiliation ? C'est la clé pour générer vos premières commissions !</p><p><a href="https://ibigpartners.com/espace/liens">Accéder à mes liens →</a></p>` },
  { day: 7,  subject: "🎓 Découvrez l'Académie IBIG",                  bodyFn: (n: string) => `<p>Bonjour ${n},</p><p>Saviez-vous que l'Académie IBIG vous propose des formations pour booster vos ventes ? Consultez nos modules sur <a href="https://ibigpartners.com/espace/academie">l'Académie</a>.</p>` },
  { day: 14, subject: "💡 Conseils pour vos 2 premières semaines",      bodyFn: (n: string) => `<p>Bonjour ${n},</p><p>Voici 3 conseils pour réussir chez IBIG Partners :</p><ol><li>Partagez vos liens dans vos réseaux professionnels</li><li>Déclarez chaque vente rapidement pour activer vos commissions</li><li>Parrainer un ami = 20 pts bonus !</li></ol>` },
  { day: 30, subject: "🏆 1 mois chez IBIG Partners — récap & objectifs", bodyFn: (n: string) => `<p>Bonjour ${n},</p><p>Vous avez 1 mois d'activité ! Consultez votre tableau de bord pour voir votre progression et définir vos objectifs du mois.</p><p><a href="https://ibigpartners.com/espace">Mon espace →</a></p>` },
];

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const partners = await prisma.user.findMany({
    where: { role: "PARTNER", active: true, approved: true },
    select: { id: true, firstName: true, email: true, createdAt: true },
  });

  let sent = 0;
  for (const p of partners) {
    const daysSince = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / 86400000);
    for (const seq of SEQUENCES) {
      if (daysSince >= seq.day && daysSince < seq.day + 2) {
        const already = await (prisma as any).emailSequenceSend.findUnique({
          where: { userId_day: { userId: p.id, day: seq.day } },
        });
        if (!already) {
          try {
            await sendEmail({ to: p.email, subject: seq.subject, html: seq.bodyFn(p.firstName) });
            await (prisma as any).emailSequenceSend.create({
              data: { id: `seq_${p.id}_${seq.day}`, userId: p.id, day: seq.day },
            });
            sent++;
          } catch { /* continue */ }
          await new Promise((r) => setTimeout(r, 120));
        }
      }
    }
  }

  return NextResponse.json({ checked: partners.length, sent });
}
