import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/site-chrome";
import { registerAction } from "../../auth-actions";
import RegisterForm from "../../rejoindre/register-form";
import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("https://")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://ibigpartners.com";

export const metadata: Metadata = {
  title: "Become a Partner — IBIG PARTNERS",
  description:
    "Join the IBIG PARTNERS pan-African affiliate program for free. Promote 14 business software products, training, real estate and services, and earn commissions on 3 levels.",
  alternates: {
    canonical: `${SITE_URL}/en/rejoindre`,
    languages: {
      fr: `${SITE_URL}/rejoindre`,
      en: `${SITE_URL}/en/rejoindre`,
      "x-default": `${SITE_URL}/rejoindre`,
    },
  },
};

export default async function EnJoinPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; parrain?: string; product?: string }>;
}) {
  const { ref, parrain, product } = await searchParams;
  const store = await cookies();
  const prefillCode = (ref || parrain || store.get("ibig_ref")?.value || "").toUpperCase();

  let sponsorName: string | null = null;
  if (prefillCode) {
    try {
      const sponsor = await prisma.user.findFirst({
        where: { code: prefillCode },
        select: { firstName: true, lastName: true },
      });
      if (sponsor) sponsorName = `${sponsor.firstName} ${sponsor.lastName}`;
    } catch (error) {
      // A temporary database outage must not block the sign-up form: the
      // sponsor name is only a display aid.
      console.error("Unable to preload sponsor:", error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-50 px-4 py-12">
      <Logo />
      <div className="card mt-6 w-full max-w-xl p-8">
        <h1 className="text-xl font-bold text-ink">Become an IBIG Partner</h1>
        <p className="mt-1 text-sm text-muted">
          Free sign-up.
          {product ? ` You discovered the program via ${product}.` : ""}
        </p>
        {sponsorName && (
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            Referred by <strong>{sponsorName}</strong> ({prefillCode})
          </p>
        )}
        <RegisterForm action={registerAction} prefillCode={prefillCode} lang="en" />
        <p className="mt-6 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/connexion" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <Link href="/en" className="mt-6 text-sm text-muted hover:underline">← Back to home</Link>
    </div>
  );
}
