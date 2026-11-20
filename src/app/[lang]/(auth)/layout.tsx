import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <Link
              href={`/${lang}`}
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              {dict.common.brand}
            </Link>
            <LanguageSwitcher />
          </div>
          <p className="mt-1 text-sm text-muted">
            {dict.authLayout.subtitle}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
