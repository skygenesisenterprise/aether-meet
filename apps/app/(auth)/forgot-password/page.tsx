"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authApi } from "@/lib/api/auth";
import { forgotPasswordSchema } from "@/lib/auth/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await authApi.forgotPassword({ email: values.email });
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Demande impossible.");
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10">
      <Card className="w-full max-w-md border-white/10 bg-slate-900 text-white">
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription className="text-slate-400">
            Nous créons une demande de réinitialisation côté API et worker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Si un compte existe, une demande de réinitialisation a été enregistrée.
              </p>
              <Link className="text-sm text-sky-300 hover:text-sky-200" href="/login">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" className="border-white/10 bg-slate-950" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-sm text-rose-300">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
              {submitError ? <p className="text-sm text-rose-300">{submitError}</p> : null}
              <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer la demande"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
