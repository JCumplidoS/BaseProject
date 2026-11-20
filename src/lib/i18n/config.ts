export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export const localeCookieName = "lang";

export function hasLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function localizedPath(locale: Locale, path: string): string {
  if (!path.startsWith("/")) return path;

  const [first] = path.split("/").slice(1);

  if (hasLocale(first)) return path;

  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");

  if (hasLocale(segments[1])) {
    segments[1] = locale;
    return segments.join("/");
  }

  return localizedPath(locale, pathname);
}
