"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useLocale, useTranslations } from "@/components/i18n/i18n-provider";
import { signInWithPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { FormError, Label, TextInput } from "@/components/ui/form";

import { OAuthButtons } from "./oauth-buttons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayError = error ?? searchParams.get("error");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithPassword({ email, password });
      router.replace(`/${locale}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.login.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.login.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {t.login.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {displayError ? <FormError>{displayError}</FormError> : null}

        <div>
          <Label htmlFor="email">{t.common.email}</Label>
          <TextInput
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.common.emailPlaceholder}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.common.password}</Label>
            <Link
              href={`/${locale}/forgot-password`}
              className="mb-1.5 text-sm text-muted hover:text-foreground"
            >
              {t.login.forgotPassword}
            </Link>
          </div>
          <TextInput
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t.common.passwordPlaceholder}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.login.submitting : t.login.submit}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-subtle">
        <span className="h-px flex-1 bg-border" />
        {t.common.or}
        <span className="h-px flex-1 bg-border" />
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted">
        {t.login.noAccount}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-medium text-foreground hover:underline"
        >
          {t.login.signUp}
        </Link>
      </p>
    </div>
  );
}
