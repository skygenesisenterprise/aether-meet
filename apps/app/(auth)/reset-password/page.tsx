import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Réinitialisation du mot de passe</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          L’écran client est prêt, mais la finalisation dépend encore de l’endpoint backend de validation du token.
        </p>
        <Link className="mt-6 inline-flex text-sm font-medium text-primary" href="/forgot-password">
          Revenir à la demande de réinitialisation
        </Link>
      </div>
    </main>
  );
}
