"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, dict }),
    [locale, dict],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within <I18nProvider>.");
  }

  return context;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useTranslations(): Dictionary {
  return useI18n().dict;
}
