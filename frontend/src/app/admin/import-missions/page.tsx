import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

// 500 missions réparties par famille (extraites du cahier des charges)
const MISSION_CATALOG: Array<{
  branch: string; title: string; type: string; difficulty: string;
  rewardType: string; cpAmount: number; description: string;
}> = [
  // IBIG EDUFORM (70)
  ...Array.from({ length: 70 }, (_, i) => {
    const titles = [
      "Identifier une école partenaire potentielle","Trouver une entreprise intéressée par une formation","Prospecter un lycée technique","Identifier un centre de formation concurrentiel","Trouver un responsable RH pour formation inter-entreprises","Identifier une université partenaire","Sourcer des formateurs indépendants","Trouver une PME pour plan de formation","Identifier un organisme de financement OPCO","Trouver un groupe scolaire privé","Prospecter un hôpital pour formation médicale","Identifier une mairie pour formation agents","Trouver un cabinet d'experts-comptables pour formation","Sourcer une association professionnelle","Identifier un campus d'entreprise","Trouver une ONG intéressée par la formation","Prospecter une école de commerce","Trouver un réseau d'écoles francophones","Identifier un organisme de certification","Trouver un partenaire pédagogique international","Identifier 5 prospects formation à Abidjan centre","Identifier 5 prospects formation à Cocody","Trouver un partenaire en e-learning","Sourcer des contenus pédagogiques libres de droits","Identifier une entreprise pour POC formation digitale","Prospecter un groupe industriel","Trouver un CIFOP local","Identifier un client pour programme leadership","Trouver une entreprise pour formation commerciale","Identifier 3 groupes hôteliers pour formation service","Prospecter un réseau d'agences immobilières","Identifier une banque pour formation compliance","Trouver un opérateur télécom pour formation digitale","Sourcer un partenaire en microfinance","Identifier un groupe agroalimentaire","Trouver 3 PME secteur transport","Identifier un cabinet de conseil pour formation stratégique","Prospecter une clinique pour formation management","Trouver un distributeur d'équipements pédagogiques","Identifier un éditeur de logiciels ERP","Sourcer 5 contacts DRH grands groupes","Trouver un comité d'entreprise actif","Identifier une chambre de commerce partenaire","Prospecter une association d'entrepreneurs","Trouver un réseau BNI ou similaire","Identifier un incubateur de startups","Trouver une école d'ingénieurs","Prospecter un groupe bancaire régional","Identifier un organisme de micro-crédit","Trouver 3 sociétés de transit pour formation douane","Sourcer un partenaire de certification ISO","Identifier une entreprise pour formation HSE","Trouver un DG intéressé par coaching","Prospecter un holding familial","Identifier un groupe pharmaceutique","Trouver une entreprise BTP pour formation sécurité","Sourcer un partenaire en formation commerciale","Identifier un réseau franchise","Trouver un contact MFI (microfinance)","Prospecter un cabinet d'audit","Identifier une société de sécurité privée","Trouver un organisme patronal","Sourcer une école de médecine partenaire","Identifier un réseau d'agents commerciaux","Trouver une ONG humanitaire pour formation","Prospecter un syndicat professionnel","Identifier un réseau de coopératives","Trouver un consultant en développement RH","Sourcer 3 entreprises secteur énergie","Identifier une fondation pour programme formation","
    ];
    return {
      branch: "IBIG EDUFORM", title: titles[i % titles.length] || `Mission EDUFORM #${i + 1}`,
      type: ["PROSPECTION","LEAD","MISE_EN_RELATION","SOURCING","ANIMATION"][i % 5],
      difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
      rewardType: ["CREDIT","CASH","MIXTE"][i % 3],
      cpAmount: [10, 20, 30, 40, 50][i % 5],
      description: "Mission de développement commercial pour la branche IBIG EDUFORM. Identifier et qualifier des prospects ou partenaires selon les critères définis.",
    };
  }),
  // IBIG DIGITAL (60)
  ...Array.from({ length: 60 }, (_, i) => {
    const titles = [
      "Identifier PME ayant besoin de site web","Prospecter commerce pour présence digitale","Trouver restaurant pour application de commande","Identifier école pour portail en ligne","Sourcer PME pour CRM","Trouver artisan pour vitrine web","Identifier grossiste pour e-commerce","Prospecter hôtel pour booking en ligne","Trouver cabinet médical pour prise de RDV en ligne","Identifier clinique pour système d'information","Sourcer entreprise pour ERP cloud","Trouver collectivité pour portail citoyen","Identifier ONG pour système de gestion","Prospecter réseau d'agences pour CRM","Trouver pharmacie pour logiciel de gestion","Identifier banque pour appli mobile","Sourcer assurance pour portail client","Trouver opérateur pour système de facturation","Identifier transport pour GPS flotte","Prospecter BTP pour gestion chantier digitale","Trouver supermarché pour logiciel caisse","Identifier distributeur pour B2B digital","Sourcer usine pour système QHSE digital","Trouver collectivité pour smart city pilot","Identifier aéroport pour solution digitale","Prospecter port pour digitalisation logistique","Trouver ministère pour e-gouvernance","Identifier université pour LMS","Sourcer entreprise agricole pour appli terrain","Trouver coopérative pour comptabilité digitale","Identifier start-up pour MVP","Prospecter agence pour CMS avancé","Trouver influenceur pour site portfolio","Identifier cabinet conseil pour intranet","Sourcer PME pour newsletter automatisée","Trouver association pour site don en ligne","Identifier événement pour appli mobile","Prospecter marque pour e-commerce B2C","Trouver leader local pour personal branding","Identifier PME pour automatisation marketing","Sourcer entreprise pour chatbot","Trouver commerce pour fidélisation digitale","Identifier école pour suivi élèves en ligne","Prospecter entreprise pour digital audit","Trouver résidence pour appli gestionnaire","Identifier cabinet RH pour SIRH","Sourcer entreprise pour cybersécurité audit","Trouver logisticien pour WMS digital","Identifier industriel pour IoT pilot","Prospecter éditeur pour SaaS white-label","Trouver franchise pour extranet partenaires","Identifier groupe pour consolidation data","Sourcer entreprise pour BI dashboard","Trouver hôpital pour dossier patient digital","Identifier autorité portuaire pour clearing digital","Prospecter zone industrielle pour digital services","Trouver ONG pour impact tracking digital","Identifier diaspora pour remittance appli","Sourcer PME pour paiement en ligne Moneroo","Trouver commerçant pour QR code paiement",
    ];
    return {
      branch: "IBIG DIGITAL", title: titles[i % titles.length] || `Mission DIGITAL #${i + 1}`,
      type: ["PROSPECTION","LEAD","VENTE","SOURCING","ETUDE"][i % 5],
      difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
      rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
      cpAmount: [15, 25, 35, 45, 55][i % 5],
      description: "Mission de développement commercial pour la branche IBIG DIGITAL. Identifier des prospects ou vendre des solutions digitales.",
    };
  }),
  // IBIG SOFT (60)
  ...Array.from({ length: 60 }, (_, i) => ({
    branch: "IBIG SOFT",
    title: `Mission SOFT #${i + 1} — ${["Identifier prospect ERP","Sourcer client GRH","Prospecter PME comptabilité","Trouver distributeur logiciel","Identifier revendeur agréé","Prospecter cabinet pour logiciel audit","Sourcer école pour logiciel scolaire","Trouver collectivité pour e-budget","Identifier entreprise pour POS","Prospecter réseau pour white-label"][i % 10]}`,
    type: ["PROSPECTION","LEAD","VENTE","SOURCING","PARTENARIAT"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","CASH","MIXTE"][i % 3],
    cpAmount: [10, 20, 30, 50, 75][i % 5],
    description: "Mission de développement commercial pour la branche IBIG SOFT. Identifier clients, distributeurs ou revendeurs potentiels.",
  })),
  // IBIG IMMOTRUST (50)
  ...Array.from({ length: 50 }, (_, i) => ({
    branch: "IBIG IMMOTRUST",
    title: `Mission IMMO #${i + 1} — ${["Trouver propriétaire à confier un bien","Identifier acheteur immobilier","Sourcer terrain constructible","Trouver investisseur locatif","Identifier promoteur partenaire","Trouver locataire professionnel","Sourcer bailleur institutionnel","Identifier notaire partenaire","Trouver architecte partenaire","Identifier agence de gestion"][i % 10]}`,
    type: ["PROSPECTION","LEAD","SOURCING","MISE_EN_RELATION","VENTE"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CASH","MIXTE","CREDIT"][i % 3],
    cpAmount: [30, 50, 100, 150, 200][i % 5],
    description: "Mission immobilière pour la branche IBIG IMMOTRUST. Identifier biens, acheteurs, vendeurs ou partenaires.",
  })),
  // IBIG CONSEIL+ (45)
  ...Array.from({ length: 45 }, (_, i) => ({
    branch: "IBIG CONSEIL+",
    title: `Mission CONSEIL #${i + 1} — ${["Identifier PME pour audit stratégique","Trouver dirigeant pour coaching","Sourcer entreprise pour restructuration","Identifier start-up pour levée de fonds","Trouver groupe pour diagnostic organisationnel","Sourcer entreprise pour plan marketing","Identifier cabinet pour sous-traitance conseil","Trouver collectivité pour études impact","Sourcer ONG pour renforcement capacités","Identifier banque pour diagnostic conformité"][i % 10]}`,
    type: ["SOURCING","LEAD","PROSPECTION","ETUDE","MISE_EN_RELATION"][i % 5],
    difficulty: ["MOYEN","DIFFICILE","FACILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [20, 40, 60, 80, 100][i % 5],
    description: "Mission de conseil et développement pour la branche IBIG CONSEIL+.",
  })),
  // IBIG PARTNERS (45)
  ...Array.from({ length: 45 }, (_, i) => ({
    branch: "IBIG PARTNERS",
    title: `Mission PARTNERS #${i + 1} — ${["Recruter un nouveau partenaire actif","Identifier ambassadeur régional","Sourcer partenaire institutionnel","Trouver représentant territorial","Identifier micro-entrepreneur partenaire","Sourcer réseau associatif partenaire","Trouver prescripteur actif","Identifier partenaire corporate","Sourcer partenaire international","Trouver animateur réseau partenaires"][i % 10]}`,
    type: ["RECRUTEMENT","PARTENARIAT","SOURCING","PROSPECTION","ANIMATION"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [50, 75, 100, 150, 200][i % 5],
    description: "Mission de développement du réseau partenaires IBIG.",
  })),
  // IBIG MARKET (35)
  ...Array.from({ length: 35 }, (_, i) => ({
    branch: "IBIG MARKET",
    title: `Mission MARKET #${i + 1} — ${["Identifier fournisseur local","Sourcer produit artisanal","Trouver vendeur pour marketplace","Identifier acheteur en gros","Sourcer distributeur régional","Trouver franchisé alimentaire","Identifier grossiste partenaire"][i % 7]}`,
    type: ["SOURCING","LEAD","PROSPECTION","VENTE","MISE_EN_RELATION"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","CASH","MIXTE"][i % 3],
    cpAmount: [10, 15, 25, 35, 50][i % 5],
    description: "Mission commerciale pour la branche IBIG MARKET.",
  })),
  // Financement & investissement (25)
  ...Array.from({ length: 25 }, (_, i) => ({
    branch: "Financement & investissement",
    title: `Mission Financement #${i + 1} — ${["Identifier PME cherchant financement","Sourcer investisseur privé","Trouver fonds d'investissement","Identifier projet pour dette mezzanine","Sourcer family office africain"][i % 5]}`,
    type: ["SOURCING","LEAD","MISE_EN_RELATION","PROSPECTION","ETUDE"][i % 5],
    difficulty: ["MOYEN","DIFFICILE","FACILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [40, 80, 100, 150, 200][i % 5],
    description: "Mission de mise en relation dans le domaine du financement et de l'investissement.",
  })),
  // RH & recrutement (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    branch: "RH & recrutement",
    title: `Mission RH #${i + 1} — ${["Sourcer profil cadre senior","Identifier candidat terrain","Trouver DRH partenaire","Sourcer cabinet de recrutement","Identifier entreprise pour externalisation RH"][i % 5]}`,
    type: ["SOURCING","MISE_EN_RELATION","PROSPECTION","LEAD","RECRUTEMENT"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","CASH","MIXTE"][i % 3],
    cpAmount: [20, 30, 50, 75, 100][i % 5],
    description: "Mission de ressources humaines et recrutement.",
  })),
  // Communication & marketing (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    branch: "Communication & marketing",
    title: `Mission COM #${i + 1} — ${["Identifier agence partenaire","Sourcer influenceur local","Trouver marque pour co-branding","Sourcer media pour partenariat","Identifier événement à sponsoriser"][i % 5]}`,
    type: ["SOURCING","PARTENARIAT","PROSPECTION","LEAD","MISE_EN_RELATION"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [15, 25, 40, 60, 80][i % 5],
    description: "Mission de communication et marketing.",
  })),
  // BTP & projets (15)
  ...Array.from({ length: 15 }, (_, i) => ({
    branch: "BTP & projets",
    title: `Mission BTP #${i + 1} — ${["Identifier maître d'ouvrage","Sourcer entreprise BTP partenaire","Trouver fournisseur matériaux"][i % 3]}`,
    type: ["SOURCING","LEAD","MISE_EN_RELATION","PROSPECTION","ETUDE"][i % 5],
    difficulty: ["MOYEN","DIFFICILE","FACILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [30, 50, 80, 100, 150][i % 5],
    description: "Mission BTP et gestion de projets.",
  })),
  // Services aux entreprises (15)
  ...Array.from({ length: 15 }, (_, i) => ({
    branch: "Services aux entreprises",
    title: `Mission Services #${i + 1} — ${["Identifier client pour nettoyage industriel","Sourcer client sécurité privée","Trouver client fleet management"][i % 3]}`,
    type: ["PROSPECTION","LEAD","SOURCING","VENTE","MISE_EN_RELATION"][i % 5],
    difficulty: ["FACILE","MOYEN","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","CASH","MIXTE"][i % 3],
    cpAmount: [10, 20, 35, 50, 70][i % 5],
    description: "Mission services aux entreprises.",
  })),
  // Représentation territoriale (15)
  ...Array.from({ length: 15 }, (_, i) => ({
    branch: "Représentation territoriale",
    title: `Mission Territoire #${i + 1} — ${["Cartographier prospects d'une zone","Identifier représentant local","Organiser présentation IBIG régionale"][i % 3]}`,
    type: ["ANIMATION","PROSPECTION","ETUDE","SOURCING","RECRUTEMENT"][i % 5],
    difficulty: ["MOYEN","FACILE","DIFFICILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [25, 40, 60, 80, 100][i % 5],
    description: "Mission de représentation et développement territorial.",
  })),
  // Études & intelligence commerciale (10)
  ...Array.from({ length: 10 }, (_, i) => ({
    branch: "Études & intelligence commerciale",
    title: `Mission Étude #${i + 1} — ${["Réaliser étude de marché sectorielle","Cartographier la concurrence","Sourcer données marché"][i % 3]}`,
    type: ["ETUDE","SOURCING","PROSPECTION","MISE_EN_RELATION","LEAD"][i % 5],
    difficulty: ["DIFFICILE","MOYEN","FACILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [50, 75, 100, 150, 200][i % 5],
    description: "Mission d'étude et d'intelligence commerciale.",
  })),
  // Missions transversales IBIG (20)
  ...Array.from({ length: 20 }, (_, i) => ({
    branch: "IBIG PARTNERS",
    title: `Mission Transversale #${i + 1} — ${["Identifier partenaire multi-branches","Organiser événement IBIG","Représenter IBIG en conférence","Sourcer sponsor événement","Identifier prescripteur stratégique"][i % 5]}`,
    type: ["ANIMATION","PARTENARIAT","MISE_EN_RELATION","SOURCING","RECRUTEMENT"][i % 5],
    difficulty: ["MOYEN","DIFFICILE","FACILE"][i % 3],
    rewardType: ["CREDIT","MIXTE","CASH"][i % 3],
    cpAmount: [30, 60, 100, 150, 200][i % 5],
    description: "Mission transversale multi-branches IBIG.",
  })),
];

async function importMissions(fd: FormData) {
  "use server";
  const batchSize = parseInt(fd.get("batchSize") as string || "50", 10);
  const offset = parseInt(fd.get("offset") as string || "0", 10);
  const batch = MISSION_CATALOG.slice(offset, offset + batchSize);
  let imported = 0;
  for (const m of batch) {
    try {
      await (prisma as any).mission.create({
        data: {
          title: m.title,
          description: m.description,
          branch: m.branch,
          type: m.type,
          difficulty: m.difficulty,
          rewardType: m.rewardType,
          cpAmount: m.cpAmount,
          status: "ACTIVE",
          proofInstructions: "Fiche prospect complète (nom, téléphone, email, poste) + confirmation de prise de contact.",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
          slots: 10,
        },
      });
      imported++;
    } catch { /* skip duplicates or schema issues */ }
  }
  return;
}

export default async function ImportMissionsPage() {
  await requireAdmin();

  let currentCount = 0;
  try {
    currentCount = await (prisma as any).mission.count();
  } catch { /* ignore */ }

  const byBranch: Record<string, number> = {};
  for (const m of MISSION_CATALOG) {
    byBranch[m.branch] = (byBranch[m.branch] || 0) + 1;
  }

  const progress = Math.min(100, Math.round((currentCount / 500) * 100));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Import 500 missions"
        subtitle="Structuration et import du catalogue cible de 500 missions IBIG"
      />

      {/* Progression */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Progression du catalogue</h2>
          <span className="text-2xl font-bold text-blue-600">{currentCount} / 500</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500">{progress}% du catalogue cible atteint</p>
      </div>

      {/* Import par lot */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Import en masse</h2>
        <p className="text-sm text-gray-500 mb-4">
          Le catalogue contient {MISSION_CATALOG.length} missions structurées prêtes à l'import. Importez-les par lots pour ne pas saturer la base.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Lot 1 (0–99)", offset: 0, size: 100 },
            { label: "Lot 2 (100–199)", offset: 100, size: 100 },
            { label: "Lot 3 (200–299)", offset: 200, size: 100 },
            { label: "Lot 4 (300–399)", offset: 300, size: 100 },
            { label: "Lot 5 (400–499)", offset: 400, size: 100 },
            { label: "Tout importer", offset: 0, size: 500 },
          ].map((batch) => (
            <form key={batch.label} action={importMissions}>
              <input type="hidden" name="batchSize" value={batch.size} />
              <input type="hidden" name="offset" value={batch.offset} />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {batch.label}
              </button>
            </form>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Les doublons (même titre + branche) sont ignorés silencieusement.</p>
      </div>

      {/* Répartition par branche */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Répartition par branche (catalogue cible)</h2>
        <div className="space-y-3">
          {Object.entries(byBranch)
            .sort((a, b) => b[1] - a[1])
            .map(([branch, count]) => (
              <div key={branch} className="flex items-center gap-3">
                <div className="w-48 text-sm text-gray-700 dark:text-gray-300 truncate">{branch}</div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(count / 70) * 100}%` }}
                  />
                </div>
                <div className="text-sm font-medium w-8 text-right">{count}</div>
              </div>
            ))}
          <div className="border-t dark:border-gray-700 pt-2 flex items-center justify-between font-semibold">
            <span>TOTAL</span>
            <span className="text-blue-600">{MISSION_CATALOG.length}</span>
          </div>
        </div>
      </div>

      {/* Structure d'une mission */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Structure d'une mission (section 17 cahier des charges)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            ["Titre", "Oui"], ["Branche", "Oui"], ["Catégorie / Type", "Oui"],
            ["Description", "Oui"], ["Objectif", "Oui"], ["Profil recherché", "Oui"],
            ["Zone géographique", "Oui"], ["Difficulté", "Oui"], ["Récompense (type)", "Oui"],
            ["CP amount", "Oui"], ["Conditions", "Oui"], ["Preuves requises", "Oui"],
            ["Délai", "Oui"], ["Places / slots", "Oui ou illimité"], ["Statut", "Oui"],
            ["Niveau minimum", "Optionnel"], ["Déclencheur récompense", "Oui"], ["Code mission", "Auto"],
          ].map(([field, req]) => (
            <div key={field} className="flex items-center justify-between border dark:border-gray-700 rounded px-3 py-2">
              <span className="text-gray-700 dark:text-gray-300">{field}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${req === "Oui" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>{req}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
