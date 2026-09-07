import Link from "next/link";
import { Logo } from "@/components/site-chrome";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
        <Logo />
        <div className="card mt-6 w-full max-w-md p-8 text-center">
          <p className="text-rose-600 font-medium">Lien invalide ou manquant.</p>
          <Link href="/connexion/mot-de-passe-oublie" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Logo />
      <div className="card mt-6 w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-ink">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-muted">
          Choisissez un nouveau mot de passe sécurisé pour votre compte.
        </p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
