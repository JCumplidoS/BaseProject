import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { redirectIfAuthenticated } from "@/lib/auth/guest";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/register">): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return { title: dict.register.metadataTitle };
}

export default async function RegisterPage({
  params,
}: PageProps<"/[lang]/register">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  await redirectIfAuthenticated(lang);

  return <RegisterForm />;
}
