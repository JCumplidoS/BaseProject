import "server-only";

import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import type { AuthSession } from "./auth-api";

export const ACCESS_TOKEN_COOKIE = "sb-access-token";
export const REFRESH_TOKEN_COOKIE = "sb-refresh-token";
export const EXPIRES_AT_COOKIE = "sb-expires-at";
export const PKCE_VERIFIER_COOKIE = "sb-pkce-verifier";

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export interface StoredSession {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export async function readSessionCookies(): Promise<StoredSession> {
  const store = await cookies();
  const expiresAtRaw = store.get(EXPIRES_AT_COOKIE)?.value;
  const parsed = expiresAtRaw ? Number(expiresAtRaw) : undefined;

  return {
    accessToken: store.get(ACCESS_TOKEN_COOKIE)?.value,
    refreshToken: store.get(REFRESH_TOKEN_COOKIE)?.value,
    expiresAt: parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined,
  };
}

interface SessionCookieOptions {
  secure: boolean;
}

export function setSessionCookies(
  response: NextResponse,
  session: AuthSession,
  { secure }: SessionCookieOptions,
): void {
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/" };
  const accessMaxAge = Math.max(session.expires_in || 3600, 60);
  const expiresAt = session.expires_at || Math.floor(Date.now() / 1000) + accessMaxAge;

  response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
    ...base,
    maxAge: accessMaxAge,
  });

  if (session.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
      ...base,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }

  response.cookies.set(EXPIRES_AT_COOKIE, String(expiresAt), {
    ...base,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, EXPIRES_AT_COOKIE]) {
    response.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
  }
}

export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) return forwardedProto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}
