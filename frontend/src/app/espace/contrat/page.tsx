import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function signContract(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? "unknown";
  const confirmed = fd.get("confirmed") === "on";
  if (!confirmed) return;
  await (prisma as any).contract.upsert({
    where: { userId: user.id },
    create: { id: `ctr_${user.id}`, userId: user.id, signedAt: new Date(), ipAddress: ip, confirmed: true },
    update: { signedAt: new Date(), ipAddress: ip, confirmed: true },
  });
  revalidatePath("/espace/contrat");
}

export default async function ContratPage() {
  const user = await requireUser();
  const contract = await (prisma as any).contract.findUnique({ where: { userId: user.id } });

  return (
    <div className="space-y-6">
      <PageHeader title="Contrat partenaire" subtitle="Lisez et signez votre contrat de partenariat IBIG." />

      <Card>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 space-y-4 max-h-[60vh] overflow-y-auto">
          <h2 className="text-base font-bold text-slate-900 text-center">CONTRAT DE PARTENARIAT AFFILIÉ — IBIG PARTNERS</h2>
          <p className="text-center text-xs text-slate-500">IBIG SARL · Abidjan, Plateau, Côte d'Ivoire · www.ibigpartners.com</p>

          <h3 className="font-semibold text-slate-900">Article 1 — Parties au contrat</h3>
          <p><strong>La Société :</strong> IBIG SARL, siège social à Abidjan, Plateau, Côte d'Ivoire, exploitant le programme d'affiliation IBIG PARTNERS.<br />
          <strong>Le Partenaire :</strong> toute personne physique ou morale ayant soumis un dossier KYC et dont le compte a été approuvé par IBIG SARL.</p>

          <h3 className="font-semibold text-slate-900">Article 2 — Déclarations et garanties du Partenaire</h3>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-800 text-xs">
            <strong>DÉCLARATION SOLENNELLE</strong> — Le Partenaire déclare sur l'honneur, sous peine de poursuites pénales pour faux et usage de faux (art. 370 Code Pénal ivoirien) et escroquerie (art. 380) : (a) que son identité est réelle et les documents fournis authentiques ; (b) qu'il agit pour son propre compte ; (c) qu'il n'a jamais été condamné pour fraude, escroquerie ou abus de confiance. Toute fausse déclaration engage sa responsabilité civile et pénale. IBIG SARL peut transmettre les éléments d'identification aux autorités judiciaires en cas de fraude avérée, sans notification préalable.
          </div>

          <h3 className="font-semibold text-slate-900">Article 3 — Objet du contrat</h3>
          <p>Le présent contrat définit les conditions de participation au programme IBIG PARTNERS : promotion des produits IBIG SARL, génération de ventes via des liens de tracking personnels, et perception de commissions sur les ventes confirmées.</p>

          <h3 className="font-semibold text-slate-900">Article 4 — Durée</h3>
          <p>Durée indéterminée à compter de la date d'activation du compte. Résiliation amiable avec préavis écrit de 30 jours. Résiliation immédiate pour fraude (voir Article 11).</p>

          <h3 className="font-semibold text-slate-900">Article 5 — Obligations du Partenaire</h3>
          <p>Le Partenaire s'engage à : (a) promouvoir les produits IBIG honnêtement et légalement ; (b) utiliser exclusivement ses liens de tracking personnels ; (c) déclarer honnêtement toutes les ventes ; (d) respecter la vie privée des clients et prospects ; (e) signaler tout incident ou fraude à support@ibigpartners.com.</p>

          <h3 className="font-semibold text-slate-900">Article 6 — Interdictions strictes et actes constitutifs de fraude</h3>
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-orange-900 text-xs space-y-1">
            <p><strong>Les actes suivants constituent une FRAUDE GRAVE engageant la responsabilité pénale :</strong></p>
            <p>1. Usurpation d'identité ou fourniture de documents falsifiés lors de l'inscription ou du KYC.<br />
            2. Création de faux comptes clients, fausses ventes ou auto-achats pour générer des commissions fictives.<br />
            3. Manipulation des liens de tracking ou injection de cookies frauduleux.<br />
            4. Recrutement de filleuls fictifs ou utilisation de fausses identités pour gonfler le réseau.<br />
            5. Détournement de commissions appartenant à d'autres partenaires.<br />
            6. Promesses mensongères de gains garantis à des prospects ou filleuls.<br />
            7. Utilisation du nom, logo ou de la marque IBIG PARTNERS sans autorisation écrite.<br />
            8. Divulgation volontaire de données confidentielles à des concurrents.</p>
          </div>

          <h3 className="font-semibold text-slate-900">Article 7 — Rémunération (commissions)</h3>
          <p>Le Partenaire perçoit une commission sur chaque vente confirmée générée via son lien de tracking. Les taux applicables sont ceux affichés dans l'Espace Partenaire au moment de la vente. IBIG SARL peut réviser ces taux avec un préavis de 15 jours.</p>

          <h3 className="font-semibold text-slate-900">Article 8 — Conditions de paiement et retenue pour fraude</h3>
          <p><strong>8.1 Paiement normal :</strong> Commissions versées sous 7 à 14 jours ouvrés après confirmation de la vente, dès atteinte du seuil minimum (5 000 FCFA), via le mode de paiement renseigné dans l'Espace Partenaire.<br />
          <strong>8.2 Retenue et récupération :</strong> IBIG SARL peut bloquer tout paiement pendant une enquête fraude, annuler et récupérer toutes commissions issues de ventes frauduleuses (avec intérêts de 2 %/mois), et déduire de tout paiement futur les montants indûment perçus.</p>

          <h3 className="font-semibold text-slate-900">Article 9 — Clause pénale (dommages et intérêts forfaitaires)</h3>
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-900 text-xs">
            En cas de fraude avérée, le Partenaire s'engage à verser à IBIG SARL : (a) le remboursement intégral de toutes les commissions perçues sur la période litigieuse, majoré de 50 % ; (b) une indemnité forfaitaire de <strong>500 000 FCFA</strong> pour atteinte à l'image et frais d'investigation. Cette clause ne fait pas obstacle à toute action pénale.
          </div>

          <h3 className="font-semibold text-slate-900">Article 10 — Droit d'audit et de contrôle</h3>
          <p>IBIG SARL peut à tout moment, sans préavis : (a) auditer les activités de vente et de recrutement ; (b) vérifier l'authenticité des ventes par recoupement ; (c) demander tout justificatif sous 72h sous peine de suspension immédiate ; (d) partager les données d'identification avec les autorités judiciaires en cas de présomption de fraude.</p>

          <h3 className="font-semibold text-slate-900">Article 11 — Résiliation et conséquences</h3>
          <p><strong>11.1 Résiliation amiable :</strong> préavis écrit de 30 jours. Commissions acquises restent dues.<br />
          <strong>11.2 Résiliation immédiate pour fraude :</strong> compte fermé sans préavis ni indemnité. Commissions en attente annulées. Commissions déjà versées issues des actes frauduleux récupérées.<br />
          <strong>11.3 Blacklist :</strong> Le Partenaire résilié pour fraude est inscrit sur liste noire permanente et ne peut réintégrer le programme sous aucune identité, directement ou via un tiers.</p>

          <h3 className="font-semibold text-slate-900">Article 12 — Confidentialité</h3>
          <p>Le Partenaire s'engage à ne divulguer aucune information confidentielle d'IBIG SARL (tarifs internes, base clients/partenaires, stratégies commerciales). Toute violation entraîne résiliation immédiate et action en dommages et intérêts.</p>

          <h3 className="font-semibold text-slate-900">Article 13 — Protection des données personnelles</h3>
          <p>Les données collectées (identité, documents KYC, coordonnées bancaires) sont traitées pour l'exécution du contrat et la prévention de la fraude. Elles peuvent être transmises aux autorités judiciaires sans consentement préalable en cas de fraude avérée.</p>

          <h3 className="font-semibold text-slate-900">Article 14 — Renonciation aux recours contre IBIG SARL</h3>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-900 text-xs">
            <strong>CLAUSE DE NON-RECOURS — LU ET ACCEPTÉ EXPRESSÉMENT</strong><br />
            Le Partenaire reconnaît expressément qu'IBIG SARL dispose d'un pouvoir discrétionnaire absolu pour : (a) suspendre ou fermer tout compte sans justification ni préavis en cas de suspicion de fraude, d'inactivité ou de comportement contraire aux intérêts du programme ; (b) modifier unilatéralement les taux de commission avec préavis de 15 jours ; (c) refuser tout paiement dont la légitimité est douteuse pendant la durée de l'enquête interne.<br /><br />
            <strong>Le Partenaire renonce expressément à tout recours judiciaire ou extrajudiciaire contre IBIG SARL pour les décisions prises dans ce cadre, sauf en cas de faute lourde avérée d'IBIG SARL.</strong>
          </div>

          <h3 className="font-semibold text-slate-900">Article 15 — Parrainage multi-niveaux</h3>
          <p>Le Partenaire bénéficie de commissions de parrainage sur les ventes générées par ses filleuls directs et indirects, selon les taux en vigueur sur la plateforme. Ces taux peuvent être révisés avec un préavis de 30 jours.</p>

          <h3 className="font-semibold text-slate-900">Article 16 — Droit applicable et juridiction compétente</h3>
          <p>Le présent contrat est régi exclusivement par le droit ivoirien. Tout litige est soumis en premier lieu à une tentative de règlement amiable (30 jours). À défaut, compétence exclusive aux Tribunaux d'Abidjan, y compris pour les Partenaires résidant à l'étranger.</p>

          <h3 className="font-semibold text-slate-900">Article 17 — Acceptation et valeur contractuelle</h3>
          <p>En cochant la case ci-dessous et en cliquant « Signer électroniquement », le Partenaire reconnaît avoir lu, compris et accepté sans réserve l'intégralité des présentes dispositions. Cette acceptation vaut signature électronique au sens de la loi ivoirienne n° 2013-546 du 30 juillet 2013. L'adresse IP et la date de signature constituent la preuve irréfutable de cette acceptation, conservée par IBIG SARL.</p>

          <p className="text-xs text-slate-400 text-center">Version 2.0 — {new Date().getFullYear()} IBIG SARL. Tous droits réservés.</p>
        </div>

        {contract?.confirmed ? (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-emerald-800">Contrat signé électroniquement</p>
                <p className="text-xs text-emerald-600">
                  Signé le {new Date(contract.signedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {contract.ipAddress ? ` · IP: ${contract.ipAddress}` : ""}
                </p>
              </div>
            </div>
            {user.verificationStatus === "VERIFIED" && (
              <a
                href={`/api/contrat/${user.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
              >
                📥 Télécharger mon contrat (PDF)
              </a>
            )}
          </div>
        ) : (
          <form action={signContract} className="mt-5 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="confirmed" required className="mt-0.5 accent-blue-600" />
              <span className="text-sm text-slate-700">
                J'ai lu et j'accepte les termes du contrat de partenariat IBIG. Je confirme que les informations de mon compte sont exactes et que je suis majeur(e).
              </span>
            </label>
            <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm">
              ✍️ Signer électroniquement
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
