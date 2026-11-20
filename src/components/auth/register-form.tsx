"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useLocale, useTranslations } from "@/components/i18n/i18n-provider";
import { signUp } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  FormError,
  FormSuccess,
  Label,
  TextInput,
} from "@/components/ui/form";

import { OAuthButtons } from "./oauth-buttons";

export function RegisterForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t.register.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({ email, password });

      if (result.needsEmailConfirmation) {
        setSuccess(t.register.emailConfirmation);
      } else {
        router.replace(`/${locale}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.register.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t.register.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {t.register.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <FormError>{error}</FormError> : null}
        {success ? <FormSuccess>{success}</FormSuccess> : null}

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
          <Label htmlFor="password">{t.common.password}</Label>
          <TextInput
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t.common.minPasswordPlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">{t.common.confirmPassword}</Label>
          <TextInput
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={t.common.repeatPasswordPlaceholder}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.register.submitting : t.register.submit}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-subtle">
        <span className="h-px flex-1 bg-border" />
        {t.common.or}
        <span className="h-px flex-1 bg-border" />
      </div>

      <OAuthButtons />

      <p className="text-center text-sm text-muted">
        {t.register.haveAccount}{" "}
        <Link
          href={`/${locale}/login`}
          className="font-medium text-foreground hover:underline"
        >
          {t.register.signIn}
        </Link>
      </p>
    </div>
  );
}
