import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fcfa } from "@/lib/format";
import { Button, Field, PageHeader } from "@/components/ui";
import { PAYOUT_METHODS, PAYOUT_METHOD_LABELS, STATUS_LABELS, STATUS_DETAILS } from "@/lib/constants";
import { getNetwork } from "@/lib/metrics";
import { updateProfile } from "../actions";
import { FileUpload } from "@/components/file-upload";

export const dynamic = "force-dynamic";

const KYC_STATUS: Record<string, { label: string; color: string; dot: string }> = {
  NONE:      { label: "Non vérifié",   color: "text-amber-700 bg-amber-50 border-amber-200",   dot: "bg-amber-400" },
  SUBMITTED: { label: "En examen",     color: "text-blue-700 bg-blue-50 border-blue-200",       dot: "bg-blue-400" },
  VERIFIED:  { label: "Vérifié ✓",    color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  REJECTED:  { label: "Rejeté ✗",     color: "text-rose-700 bg-rose-50 border-rose-200",        dot: "bg-rose-400" },
};

export default async function ProfilPage() {
  const session = await requireUser();
  const user: any = await (prisma as any).user.findUnique({ where: { id: session.id } });

  const [salesCount, commissionsAgg, networkRaw, linksCount] = await Promise.all([
    prisma.sale.count({ where: { sellerId: user.id, status: "CONFIRMED" } }),
    prisma.commission.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    getNetwork(user.id),
    prisma.affiliateLink.count({ where: { userId: user.id } }),
  ]);

  const totalComm   = commissionsAgg._sum.amount ?? 0;
  const directCount = networkRaw.filter((m: any) => m.level === 1).length;
  const initials    = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");
  const kycStatus   = user.verificationStatus ?? "NONE";
  const kyc         = KYC_STATUS[kycStatus] ?? KYC_STATUS.NONE;

  const currentStatusDef = STATUS_DETAILS.find((s) => s.status === user.status) ?? STATUS_DETAILS[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Mon Profil" subtitle="Vos informations personnelles et paramètres de paiement." />

      {/* ── Alerte KYC si non vérifié ── */}
      {kycStatus === "NONE" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Compte non vérifié</p>
              <p className="text-xs text-amber-700 mt-0.5">Vos commissions sont calculées mais pas versées tant que votre identité n&apos;est pas confirmée.</p>
            </div>
          </div>
          <Link
            href="/espace/verification"
            className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white transition shadow"
          >
            Vérifier mon compte →
          </Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── Carte identité ── */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-6 right-8 h-16 w-16 rounded-full bg-white/10" />
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold text-white mb-4">
                {initials}
              </div>
              <p className="text-lg font-bold tracking-tight">{user.firstName} {user.lastName}</p>
              <p className="text-blue-200 text-sm mt-0.5 break-all">{user.email}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                  <span className="text-xs text-blue-200">Code partenaire</span>
                  <span className="text-xs font-bold font-mono text-white tracking-wider">{user.code}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                  <span className="text-xs text-blue-200">Statut</span>
                  <span className="text-xs font-bold text-white">{currentStatusDef.label}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                  <span className="text-xs text-blue-200">Compte</span>
                  <span className={`text-xs font-bold ${user.approved ? "text-emerald-300" : "text-amber-300"}`}>
                    {user.approved ? "✅ Validé" : "⏳ En attente"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                  <span className="text-xs text-blue-200">KYC</span>
                  <span className={`text-xs font-bold ${kycStatus === "VERIFIED" ? "text-emerald-300" : kycStatus === "SUBMITTED" ? "text-blue-200" : "text-amber-300"}`}>
                    {kyc.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-blue-600">{salesCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">Ventes</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-violet-600">{directCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">Filleuls N1</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
              <p className="text-lg font-extrabold text-emerald-600">{fcfa(totalComm)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">Commissions</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-slate-600">{linksCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">Liens actifs</p>
            </div>
          </div>

          {/* Accès rapides */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Accès rapides</p>
            {[
              { href: "/espace/verification", icon: "🔐", label: "Vérification KYC",  sub: kyc.label },
              { href: "/espace/paiements",    icon: "💸", label: "Mes paiements",     sub: `${PAYOUT_METHOD_LABELS[user.payoutMethod] ?? "—"}` },
              { href: "/espace/commissions",  icon: "📊", label: "Mes commissions",   sub: fcfa(totalComm) },
              { href: "/espace/reseau",       icon: "👥", label: "Mon réseau",        sub: `${networkRaw.length} filleuls` },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition group"
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">{item.label}</p>
                  <p className="text-[11px] text-slate-400 truncate">{item.sub}</p>
                </div>
                <span className="text-slate-300 group-hover:text-blue-400 text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Formulaire ── */}
        <div className="lg:col-span-2 space-y-4">
          <form action={updateProfile} className="space-y-4">

            {/* Section contact */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-3">
                <h3 className="font-semibold text-white text-sm">📞 Informations de contact</h3>
                <p className="text-xs text-slate-300 mt-0.5">Utilisées pour les communications et le versement des commissions.</p>
              </div>
              <div className="p-5 grid gap-4 sm:grid-cols-2">
                <Field label="Téléphone / WhatsApp" name="phone" defaultValue={user.phone} placeholder="+225 07 00 00 00 00" />
                <Field label="Ville" name="city" defaultValue={user.city ?? ""} placeholder="Abidjan" />
                <Field label="Pays" name="country" defaultValue={user.country ?? ""} placeholder="Côte d'Ivoire" />
              </div>
            </div>

            {/* Section paiement */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3">
                <h3 className="font-semibold text-white text-sm">💰 Coordonnées de paiement</h3>
                <p className="text-xs text-emerald-100 mt-0.5">Comment vous souhaitez recevoir vos commissions.</p>
              </div>
              <div className="p-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Mode de paiement
                  </label>
                  <select
                    name="payoutMethod"
                    defaultValue={user.payoutMethod}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {PAYOUT_METHODS.map((m) => (
                      <option key={m} value={m}>{PAYOUT_METHOD_LABELS[m]}</option>
                    ))}
                  </select>
                </div>
                <Field
                  label="N° Mobile Money / IBAN / RIB"
                  name="payoutDetail"
                  defaultValue={user.payoutDetail ?? ""}
                  placeholder="+225 07 00 00 00 00"
                />
                <div className="sm:col-span-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs text-amber-700">
                  ⚠️ Pour modifier votre mode de paiement de façon permanente (RCCM, coordonnées bancaires complètes), rendez-vous dans{" "}
                  <Link href="/espace/verification" className="font-bold underline">Vérification KYC</Link>.
                </div>
              </div>
            </div>

            {/* Section profil public */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-3">
                <h3 className="font-semibold text-white text-sm">🌐 Profil public partenaire</h3>
                <p className="text-xs text-violet-200 mt-0.5">Visible sur /partenaires si vous êtes Gold+ et vérifié.</p>
              </div>
              <div className="p-5 space-y-4">
                {/* Photo de profil avec aperçu */}
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="Photo" className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-sm" />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-200">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <FileUpload
                      name="photoUrl"
                      defaultUrl={user.photoUrl}
                      folder="ibig-photos"
                      accept="image/jpeg,image/png,image/webp"
                      label="Photo de profil"
                      hint="JPEG ou PNG · max 5 Mo · format carré recommandé"
                      preview="image"
                      maxMb={5}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio / Présentation courte</label>
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue={user.bio ?? ""}
                    placeholder="Décrivez votre activité, votre expertise, vos domaines…"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none resize-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <Field label="Site web / LinkedIn" name="website" defaultValue={user.website ?? ""} placeholder="https://..." />
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="publicListing"
                    defaultChecked={user.publicListing}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">Afficher mon profil sur la page publique des partenaires</p>
                    <p className="text-xs text-slate-400">Votre nom, bio et spécialités seront visibles par les prospects.</p>
                  </div>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Enregistrer les modifications
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
