import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Vérification de l’adresse e-mail</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          La surface client est prête pour afficher l’état de vérification dès que le workflow backend/worker est finalisé.
        </p>
        <Link className="mt-6 inline-flex text-sm font-medium text-primary" href="/login">
          Aller à la connexion
        </Link>
      </div>
    </main>
  );
}
