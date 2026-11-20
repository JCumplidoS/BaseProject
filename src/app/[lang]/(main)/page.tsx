"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useLocale, useTranslations } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";
import { interpolate } from "@/lib/i18n/format";

export default function HomePage() {
  const { user, signOut } = useAuth();
  const locale = useLocale();
  const t = useTranslations();
  const [signingOut, setSigningOut] = useState(false);

  const provider =
    typeof user?.app_metadata?.provider === "string"
      ? user.app_metadata.provider
      : "email";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <span className="text-sm font-semibold tracking-tight">
            {t.common.brand}
          </span>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden text-sm text-muted sm:inline">
                  {user.email}
                </span>
                <LanguageSwitcher />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? t.home.signingOut : t.home.signOut}
                </Button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                >
                  {t.home.signIn}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {user ? (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {interpolate(t.home.greeting, {
                email: user.email ?? t.home.defaultUser,
              })}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {t.home.signedIn}
            </p>

            <section className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t.home.sessionActive}
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info label={t.home.labels.id} value={user.id} />
                <Info label={t.home.labels.email} value={user.email ?? "—"} />
                <Info label={t.home.labels.provider} value={provider} />
                <Info
                  label={t.home.labels.role}
                  value={user.role ?? "authenticated"}
                />
              </dl>
            </section>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t.home.publicTitle}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              {t.home.publicMessage}
            </p>
            <section className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <p className="text-sm text-muted">{t.home.publicHint}</p>
              <Link
                href={`/${locale}/login`}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              >
                {t.home.signIn}
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-subtle">
        {label}
      </dt>
      <dd className="mt-1 break-all text-sm text-foreground">
        {value}
      </dd>
    </div>
  );
}
