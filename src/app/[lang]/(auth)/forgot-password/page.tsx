import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { redirectIfAuthenticated } from "@/lib/auth/guest";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/forgot-password">): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return { title: dict.forgotPassword.metadataTitle };
}

export default async function ForgotPasswordPage({
  params,
}: PageProps<"/[lang]/forgot-password">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  await redirectIfAuthenticated(lang);

  return <ForgotPasswordForm />;
}
