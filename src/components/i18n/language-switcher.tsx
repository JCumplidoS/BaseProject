"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  locales,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n/config";

import { useI18n } from "./i18n-provider";

const labels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

export function LanguageSwitcher() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();

  return (
    <nav
      aria-label={dict.common.language}
      className="flex items-center gap-1 text-xs font-medium"
    >
      {locales.map((value) => {
        const active = value === locale;

        return (
          <Link
            key={value}
            href={switchLocalePath(pathname, value)}
            hrefLang={value}
            aria-current={active ? "true" : undefined}
            className={`rounded-md px-2 py-1 transition ${
              active
                ? "bg-elevated text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {labels[value]}
          </Link>
        );
      })}
    </nav>
  );
}
