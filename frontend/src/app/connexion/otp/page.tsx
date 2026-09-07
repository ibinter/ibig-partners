import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site-chrome";
import OtpForm from "./otp-form";

export default async function OtpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const store = await cookies();
  const pending = store.get("ibig_otp_pending")?.value;
  if (!pending) redirect("/connexion");

  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <Logo />
      <div className="card mt-6 w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📧</div>
          <h1 className="text-xl font-bold text-ink">Vérification en 2 étapes</h1>
          <p className="mt-1 text-sm text-muted">
            Un code à 6 chiffres a été envoyé à votre adresse email.
            Saisissez-le ci-dessous pour accéder à votre espace.
          </p>
        </div>
        <OtpForm next={next} />
        <p className="mt-5 text-center text-xs text-muted">
          Vérifiez vos spams si vous ne voyez pas l&apos;email.
        </p>
      </div>
    </div>
  );
}
