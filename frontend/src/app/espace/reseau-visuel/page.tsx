import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NetworkTreeClient from "./network-tree-client";

async function fetchTree(affiliateCode: string, depth: number): Promise<any[]> {
  if (depth === 0) return [];
  const children = await (prisma as any).user.findMany({
    where: { sponsorCode: affiliateCode },
    select: { id: true, name: true, affiliateCode: true, createdAt: true },
  });
  return Promise.all(
    children.map(async (child: any) => ({
      ...child,
      children: await fetchTree(child.affiliateCode, depth - 1),
    }))
  );
}

export default async function ReseauVisuelPage() {
  const user = await requireUser();
  const myCode = (user as any).code ?? (user as any).affiliateCode ?? "";
  const children = await fetchTree(myCode, 3);
  const tree = { id: user.id, name: user.name ?? "Moi", affiliateCode: myCode, children };

  const countNodes = (node: any): number => 1 + (node.children ?? []).reduce((s: number, c: any) => s + countNodes(c), 0);
  const total = countNodes(tree) - 1;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Arbre de réseau</h1>
        <p className="text-sm text-gray-500 mt-1">{total} partenaire{total !== 1 ? "s" : ""} dans votre réseau (3 niveaux)</p>
      </div>
      <NetworkTreeClient tree={tree} />
    </div>
  );
}
