import { NextResponse, type NextRequest } from "next/server";

import {
  defaultLocale,
  hasLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";

const cookieOptions = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const languages = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params.find((param) => param.trim().startsWith("q="));
      const value = quality ? Number(quality.split("=")[1]) : 1;

      return {
        tag: tag.toLowerCase(),
        quality: Number.isFinite(value) ? value : 0,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of languages) {
    const base = tag.split("-")[0];

    if (hasLocale(base)) return base;
  }

  return null;
}

function getLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(localeCookieName)?.value;

  if (hasLocale(cookie)) return cookie;

  return fromAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale;
}

function getPathnameLocale(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];

  return hasLocale(segment) ? segment : null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentLocale = getPathnameLocale(pathname);

  if (currentLocale) {
    if (request.cookies.get(localeCookieName)?.value === currentLocale) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    response.cookies.set(localeCookieName, currentLocale, cookieOptions);
    return response;
  }

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(localeCookieName, locale, cookieOptions);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
