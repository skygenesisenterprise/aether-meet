"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Connexion impossible.");
    }
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(29,78,216,0.2),transparent_34%),linear-gradient(180deg,#050816_0%,#0b1020_55%,#111827_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden rounded-4xl border border-white/10 bg-white/5 p-10 backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-sky-100">
                Aether Meet
              </div>
              <h1 className="max-w-xl font-serif text-5xl leading-tight">
                Accédez à votre espace de collaboration sécurisé.
              </h1>
              <p className="max-w-lg text-sm text-slate-300">
                Le JWT d’accès reste uniquement en mémoire. La session navigateur est restaurée à partir du cookie refresh HttpOnly.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Auth locale réelle, rotation des refresh tokens et routes protégées alignées sur l’API Go.
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                Rechargement complet de page pris en charge via `/api/v1/auth/refresh`.
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <Card className="w-full max-w-md border-white/10 bg-slate-950/85 text-white shadow-2xl">
              <CardHeader className="space-y-3">
                <CardTitle className="text-3xl font-semibold">Connexion</CardTitle>
                <CardDescription className="text-slate-400">
                  Utilisez votre compte local Aether Meet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={onSubmit} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="border-white/10 bg-slate-900 pl-9"
                        {...form.register("email")}
                      />
                    </div>
                    {form.formState.errors.email ? (
                      <p className="text-sm text-rose-300">{form.formState.errors.email.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Link className="text-sm text-sky-300 hover:text-sky-200" href="/forgot-password">
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className="border-white/10 bg-slate-900 pl-9 pr-11"
                        {...form.register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password ? (
                      <p className="text-sm text-rose-300">{form.formState.errors.password.message}</p>
                    ) : null}
                  </div>

                  {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}

                  <Button className="w-full" disabled={isLoading || form.formState.isSubmitting} type="submit">
                    {isLoading || form.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Se connecter"
                    )}
                  </Button>

                  <p className="text-center text-sm text-slate-400">
                    Pas encore de compte ?{" "}
                    <Link className="text-sky-300 hover:text-sky-200" href="/register">
                      Créer un compte
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
