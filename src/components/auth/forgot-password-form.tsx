"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { useLocale, useTranslations } from "@/components/i18n/i18n-provider";
import { requestPasswordReset } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  FormError,
  FormSuccess,
  Label,
  TextInput,
} from "@/components/ui/form";

export function ForgotPasswordForm() {
  const locale = useLocale();
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setSuccess(t.forgotPassword.success);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.forgotPassword.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {t.forgotPassword.title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t.forgotPassword.subtitle}
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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t.forgotPassword.submitting : t.forgotPassword.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link
          href={`/${locale}/login`}
          className="font-medium text-foreground hover:underline"
        >
          {t.forgotPassword.backToLogin}
        </Link>
      </p>
    </div>
  );
}
