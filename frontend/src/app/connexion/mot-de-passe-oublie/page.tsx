import Link from "next/link";
import { Logo } from "@/components/site-chrome";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Logo />
      <div className="card mt-6 w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-ink">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-muted">
          Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/connexion" className="font-medium text-brand-600 hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
