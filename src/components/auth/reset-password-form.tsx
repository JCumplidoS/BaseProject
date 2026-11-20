"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { useLocale, useTranslations } from "@/components/i18n/i18n-provider";
import { getSession, updatePassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  FormError,
  FormSuccess,
  Label,
  TextInput,
} from "@/components/ui/form";

type Status = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (active) setStatus(session ? "ready" : "invalid");
      })
      .catch(() => {
        if (active) setStatus("invalid");
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError(t.resetPassword.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      await updatePassword({ password });
      setSuccess(t.resetPassword.success);
      router.replace(`/${locale}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.resetPassword.genericError,
      );
    } finally {
      setLoading(false);
    }
  }

  if (status === "checking") {
    return (
      <p className="text-sm text-muted">{t.resetPassword.checking}</p>
    );
  }

  if (status === "invalid") {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {t.resetPassword.invalidTitle}
        </h1>
        <FormError>{t.resetPassword.invalidMessage}</FormError>
        <Link
          href={`/${locale}/forgot-password`}
          className="inline-block text-sm font-medium text-foreground hover:underline"
        >
          {t.resetPassword.requestAnother}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {t.resetPassword.title}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t.resetPassword.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <FormError>{error}</FormError> : null}
        {success ? <FormSuccess>{success}</FormSuccess> : null}

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
          {loading ? t.resetPassword.submitting : t.resetPassword.submit}
        </Button>
      </form>
    </div>
  );
}
