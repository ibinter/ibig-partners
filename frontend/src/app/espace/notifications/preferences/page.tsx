import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function savePreferences(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  const bool = (key: string) => fd.get(key) === "on";
  await (prisma as any).notificationPreference.upsert({
    where: { userId: user.id },
    update: {
      emailSale: bool("emailSale"), emailComm: bool("emailComm"),
      emailMsg: bool("emailMsg"), emailEvent: bool("emailEvent"),
      smsSale: bool("smsSale"), smsComm: bool("smsComm"),
    },
    create: {
      id: `np_${Date.now()}`, userId: user.id,
      emailSale: bool("emailSale"), emailComm: bool("emailComm"),
      emailMsg: bool("emailMsg"), emailEvent: bool("emailEvent"),
      smsSale: bool("smsSale"), smsComm: bool("smsComm"),
    },
  });
  revalidatePath("/espace/notifications/preferences");
}

export default async function NotificationPreferencesPage() {
  const user = await requireUser();
  const prefs = await (prisma as any).notificationPreference.findUnique({ where: { userId: user.id } }) ?? {};

  const Toggle = ({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) => (
    <label className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 cursor-pointer group">
      <span className="text-sm text-slate-700 group-hover:text-slate-900">{label}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked}
        className="w-5 h-5 rounded accent-amber-500 cursor-pointer" />
    </label>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader title="Préférences de notifications" subtitle="Choisissez quand et comment vous souhaitez être notifié." />

      <form action={savePreferences} className="space-y-4">
        <Card>
          <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">📧 Notifications par email</h2>
          <p className="text-xs text-slate-400 mb-3">Envoyées à {user.email}</p>
          <Toggle name="emailSale"  label="Nouvelle vente confirmée"        defaultChecked={prefs.emailSale  ?? true} />
          <Toggle name="emailComm"  label="Commission créditée ou payée"    defaultChecked={prefs.emailComm  ?? true} />
          <Toggle name="emailMsg"   label="Nouveau message reçu"            defaultChecked={prefs.emailMsg   ?? true} />
          <Toggle name="emailEvent" label="Événement IBIG (inscription...)" defaultChecked={prefs.emailEvent ?? true} />
        </Card>

        <Card>
          <h2 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">📱 Notifications par SMS</h2>
          <p className="text-xs text-slate-400 mb-3">Envoyés au {user.phone}</p>
          <Toggle name="smsSale" label="Nouvelle vente confirmée" defaultChecked={prefs.smsSale ?? false} />
          <Toggle name="smsComm" label="Paiement de commission"   defaultChecked={prefs.smsComm ?? false} />
        </Card>

        <button type="submit"
          className="w-full rounded-2xl bg-amber-500 text-white py-3 font-semibold hover:bg-amber-600 transition-colors">
          Enregistrer mes préférences
        </button>
      </form>
    </div>
  );
}
