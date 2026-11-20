import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reset-password">): Promise<Metadata> {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return { title: dict.resetPassword.metadataTitle };
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
