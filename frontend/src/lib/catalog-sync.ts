import { prisma } from "@/lib/prisma";

/**
 * Moteur de synchronisation de catalogue AGNOSTIQUE DE LA SOURCE.
 *
 * Il compare le catalogue fourni (products) avec l'état actuel en base pour la
 * branche donnée, applique les changements (upsert + suppression des obsolètes
 * sans vente ni lien), calcule un diff (ajoutés / modifiés / retirés) et, si
 * demandé, crée une notification de diffusion (cloche) pour informer les
 * utilisateurs.
 *
 * La source des `products` est indifférente : tableau codé en dur, futur espace
 * superadmin (Voie B), ou futur flux JSON externe d'une plateforme IBIG (Voie A).
 */

export type SyncProduct = {
  slug: string;
  name: string;
  pricingType: string;
  price: number;
  rate: number;
  siteUrl?: string;
  description?: string;
};

export type SyncDiff = {
  added: string[];
  updated: string[];
  removed: number;
  total: number;
};

export type SyncResult =
  | { ok: true; diff: SyncDiff; notified: boolean }
  | { ok: false; error: string; status: number };

export async function syncBranchCatalog(
  branchSlug: string,
  branchLabel: string,
  products: SyncProduct[],
  opts: { notify?: boolean } = {}
): Promise<SyncResult> {
  const branch = await prisma.branch.findUnique({ where: { slug: branchSlug } });
  if (!branch) {
    return {
      ok: false,
      status: 404,
      error: `Branche ${branchLabel} introuvable. Synchronisez d'abord les branches.`,
    };
  }

  // Instantané "avant" pour détecter les changements.
  const before = await prisma.product.findMany({
    where: { branchId: branch.id },
    select: { slug: true, name: true, price: true, description: true, rate: true, pricingType: true, active: true },
  });
  const beforeMap = new Map(before.map((p) => [p.slug, p]));

  const knownSlugs = products.map((p) => p.slug);

  // Supprime les produits obsolètes qui n'ont ni vente ni lien rattaché.
  const deleted = await prisma.product.deleteMany({
    where: {
      branchId: branch.id,
      slug: { notIn: knownSlugs },
      sales: { none: {} },
      links: { none: {} },
    },
  });

  const BATCH_SIZE = 5;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((p) =>
        prisma.product.upsert({
          where: { slug: p.slug },
          update: {
            name: p.name,
            pricingType: p.pricingType,
            price: p.price,
            rate: p.rate,
            siteUrl: p.siteUrl,
            description: p.description,
            branchId: branch.id,
            active: true,
          },
          create: {
            slug: p.slug,
            name: p.name,
            pricingType: p.pricingType,
            price: p.price,
            rate: p.rate,
            siteUrl: p.siteUrl,
            description: p.description,
            branchId: branch.id,
            active: true,
          },
        })
      )
    );
  }

  // Diff : ajoutés (nouveaux ou réactivés) vs modifiés (prix/nom/desc/taux/type).
  const added: string[] = [];
  const updated: string[] = [];
  for (const p of products) {
    const prev = beforeMap.get(p.slug);
    if (!prev || !prev.active) {
      added.push(p.name);
    } else if (
      prev.name !== p.name ||
      prev.price !== p.price ||
      prev.rate !== p.rate ||
      prev.pricingType !== p.pricingType ||
      (p.description !== undefined && prev.description !== p.description)
    ) {
      updated.push(p.name);
    }
  }

  const diff: SyncDiff = { added, updated, removed: deleted.count, total: products.length };

  let notified = false;
  const hasChanges = added.length > 0 || updated.length > 0 || deleted.count > 0;
  if (opts.notify && hasChanges) {
    const parts: string[] = [];
    if (added.length) parts.push(`${added.length} nouveau${added.length > 1 ? "x" : ""}`);
    if (updated.length) parts.push(`${updated.length} mis à jour`);
    if (deleted.count) parts.push(`${deleted.count} retiré${deleted.count > 1 ? "s" : ""}`);
    const sample = [...added, ...updated].slice(0, 5).join(", ");
    const body = `${parts.join(" · ")}${sample ? ` — ${sample}${added.length + updated.length > 5 ? "…" : ""}` : ""}`.slice(0, 480);
    await prisma.notification.create({
      data: { userId: null, title: `Catalogue ${branchLabel} mis à jour`, body },
    });
    notified = true;
  }

  return { ok: true, diff, notified };
}
