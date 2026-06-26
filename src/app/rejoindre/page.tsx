import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/site-chrome";
import { registerAction } from "../auth-actions";
import RegisterForm from "./register-form";

export default async function RejoindrePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; parrain?: string; product?: string }>;
}) {
  const { ref, parrain, product } = await searchParams;
  const store = await cookies();
  const prefillCode = (ref || parrain || store.get("ibig_ref")?.value || "").toUpperCase();

  let sponsorName: string | null = null;
  if (prefillCode) {
    const sponsor = await prisma.user.findFirst({
      where: { code: prefillCode },
      select: { firstName: true, lastName: true },
    });
    if (sponsor) sponsorName = `${sponsor.firstName} ${sponsor.lastName}`;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12">
      <Logo />
      <div className="card mt-6 w-full max-w-xl p-8">
        <h1 className="text-xl font-bold text-ink">Devenir Partenaire IBIG</h1>
        <p className="mt-1 text-sm text-muted">
          Inscription gratuite.
          {product ? ` Vous découvrez le programme via ${product}.` : ""}
        </p>
        {sponsorName && (
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            Parrainé par <strong>{sponsorName}</strong> ({prefillCode})
          </p>
        )}
        <RegisterForm action={registerAction} prefillCode={prefillCode} />
        <p className="mt-6 text-center text-sm text-muted">
          Déjà inscrit&nbsp;?{" "}
          <Link href="/connexion" className="font-medium text-brand-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
      <Link href="/" className="mt-6 text-sm text-muted hover:underline">← Retour à l&apos;accueil</Link>
    </div>
  );
}
