import Link from "next/link";
import { Logo } from "@/components/site-chrome";
import { loginAction } from "../auth-actions";
import LoginForm from "./login-form";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Logo />
      <div className="card mt-6 w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-ink">Connexion à votre espace</h1>
        <p className="mt-1 text-sm text-muted">
          Partenaires et équipe IBIG.
        </p>
        <LoginForm action={loginAction} next={next} />
        <p className="mt-6 text-center text-sm text-muted">
          Pas encore partenaire&nbsp;?{" "}
          <Link href="/rejoindre" className="font-medium text-brand-600 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
<Link href="/" className="mt-6 text-sm text-muted hover:underline">← Retour à l&apos;accueil</Link>
    </div>
  );
}
