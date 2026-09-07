import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

async function addClient(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  await (prisma as any).partnerClient.create({
    data: {
      userId: user.id,
      name: fd.get("name") as string,
      phone: (fd.get("phone") as string) || null,
      email: (fd.get("email") as string) || null,
      product: (fd.get("product") as string) || null,
      notes: (fd.get("notes") as string) || null,
      status: (fd.get("status") as string) || "PROSPECT",
    },
  });
  revalidatePath("/espace/clients");
}

async function updateClientStatus(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  await (prisma as any).partnerClient.updateMany({
    where: { id: fd.get("id") as string, userId: user.id },
    data: { status: fd.get("status") as string },
  });
  revalidatePath("/espace/clients");
}

async function deleteClient(fd: FormData) {
  "use server";
  const { requireUser } = await import("@/lib/auth");
  const user = await requireUser();
  await (prisma as any).partnerClient.deleteMany({
    where: { id: fd.get("id") as string, userId: user.id },
  });
  revalidatePath("/espace/clients");
}

const STATUS_STYLE: Record<string, string> = {
  PROSPECT: "bg-blue-100 text-blue-700",
  CLIENT: "bg-emerald-100 text-emerald-700",
  INACTIF: "bg-slate-100 text-slate-500",
};

export default async function ClientsPage() {
  const user = await requireUser();
  const clients = await (prisma as any).partnerClient.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const counts = { PROSPECT: 0, CLIENT: 0, INACTIF: 0 };
  clients.forEach((c: any) => { if (c.status in counts) counts[c.status as keyof typeof counts]++; });

  return (
    <div className="space-y-6">
      <PageHeader title="Portefeuille clients" subtitle="Gérez vos contacts, prospects et clients personnels." />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[["🔵 Prospects", counts.PROSPECT, "blue"], ["✅ Clients", counts.CLIENT, "emerald"], ["😴 Inactifs", counts.INACTIF, "slate"]].map(([label, count, color]) => (
          <div key={String(label)} className={`rounded-xl border bg-${color}-50 border-${color}-100 p-3 text-center`}>
            <p className="text-2xl font-extrabold text-slate-800">{count}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire ajout */}
      <Card>
        <h2 className="mb-4 font-semibold text-slate-800">Ajouter un contact</h2>
        <form action={addClient} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Nom complet *" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="phone" placeholder="Téléphone" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="email" type="email" placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="product" placeholder="Produit/Service concerné" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <select name="status" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="PROSPECT">Prospect</option>
              <option value="CLIENT">Client</option>
              <option value="INACTIF">Inactif</option>
            </select>
            <input name="notes" placeholder="Notes (optionnel)" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Ajouter
          </button>
        </form>
      </Card>

      {/* Liste */}
      <Card className="p-0">
        {clients.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">Aucun contact dans votre portefeuille.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <tr>
                {["Nom","Contact","Produit","Notes","Statut","Ajouté","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.phone && <div>{c.phone}</div>}
                    {c.email && <div>{c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[120px] truncate">{c.product || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs max-w-[140px] truncate">{c.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {["PROSPECT","CLIENT","INACTIF"].filter(s => s !== c.status).map(s => (
                        <form key={s} action={updateClientStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="status" value={s} />
                          <button type="submit" className="rounded px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100">→{s}</button>
                        </form>
                      ))}
                      <form action={deleteClient}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="rounded px-2 py-0.5 text-xs font-medium text-rose-400 hover:bg-rose-50">✕</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
