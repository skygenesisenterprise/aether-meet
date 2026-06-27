"use client";

import * as React from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import { registerSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterFormValues = z.infer<typeof registerSchema>;

const passwordRequirements = [
  "12 caractères minimum",
  "1 majuscule",
  "1 minuscule",
  "1 chiffre",
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      workspaceName: "",
    },
  });

  const passwordValue = form.watch("password");

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await register({
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        workspaceName: values.workspaceName || undefined,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Inscription impossible.");
    }
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="order-2 rounded-4xl border border-slate-200 bg-white p-8 shadow-xl lg:order-1">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white">
                Pré requis
              </div>
              <h1 className="font-serif text-4xl leading-tight">
                Créez un compte local prêt pour les routes protégées de la plateforme.
              </h1>
              <p className="text-sm text-slate-600">
                L’inscription ouvre une session applicative complète: cookie refresh HttpOnly, JWT d’accès en mémoire et bootstrap automatique après rechargement.
              </p>
            </div>
            <div className="mt-8 rounded-3xl bg-slate-950 p-6 text-slate-100">
              <p className="text-sm uppercase tracking-[0.18em] text-sky-300">Mot de passe</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {passwordRequirements.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${passwordValue && passwordValue.length > 0 ? "bg-emerald-400" : "bg-slate-700"}`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="order-1 flex items-center justify-center lg:order-2">
            <Card className="w-full max-w-xl border-slate-200 bg-white shadow-2xl">
              <CardHeader className="space-y-3">
                <CardTitle className="text-3xl">Créer un compte</CardTitle>
                <CardDescription>
                  Le premier workspace personnel est créé automatiquement si vous ne renseignez rien.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" noValidate onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom affiché</Label>
                    <Input id="displayName" {...form.register("displayName")} />
                    {form.formState.errors.displayName ? (
                      <p className="text-sm text-rose-600">{form.formState.errors.displayName.message}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse e-mail</Label>
                      <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
                      {form.formState.errors.email ? (
                        <p className="text-sm text-rose-600">{form.formState.errors.email.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workspaceName">Workspace initial</Label>
                      <Input id="workspaceName" placeholder="Optionnel" {...form.register("workspaceName")} />
                      {form.formState.errors.workspaceName ? (
                        <p className="text-sm text-rose-600">{form.formState.errors.workspaceName.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pr-11"
                          {...form.register("password")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                          onClick={() => setShowPassword((value) => !value)}
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.password ? (
                        <p className="text-sm text-rose-600">{form.formState.errors.password.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmation</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pr-11"
                          {...form.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                          onClick={() => setShowConfirmPassword((value) => !value)}
                          aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.confirmPassword ? (
                        <p className="text-sm text-rose-600">{form.formState.errors.confirmPassword.message}</p>
                      ) : null}
                    </div>
                  </div>

                  {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

                  <Button className="w-full" disabled={isLoading || form.formState.isSubmitting} type="submit">
                    {isLoading || form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
                  </Button>

                  <p className="text-center text-sm text-slate-600">
                    Déjà inscrit ?{" "}
                    <Link className="font-medium text-slate-950 hover:text-slate-700" href="/login">
                      Se connecter
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
