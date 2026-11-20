import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/guest";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/login">): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return { title: dict.login.metadataTitle };
}

export default async function LoginPage({
  params,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  await redirectIfAuthenticated(lang);

  const dict = await getDictionary(lang);

  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted">{dict.login.loading}</p>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
