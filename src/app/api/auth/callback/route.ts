import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { exchangeCodeForSession } from "@/lib/supabase/auth-api";
import {
  PKCE_VERIFIER_COOKIE,
  clearSessionCookies,
  isSecureRequest,
  setSessionCookies,
} from "@/lib/supabase/cookies";

function errorRedirect(origin: string, message: string): NextResponse {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(message)}`, origin),
  );
}

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const oauthError =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (oauthError) return errorRedirect(origin, oauthError);
  if (!code) return errorRedirect(origin, "missing_code");

  const store = await cookies();
  const codeVerifier = store.get(PKCE_VERIFIER_COOKIE)?.value;
  if (!codeVerifier) return errorRedirect(origin, "missing_code_verifier");

  try {
    const session = await exchangeCodeForSession(code, codeVerifier);
    const response = NextResponse.redirect(new URL(next, origin));
    setSessionCookies(response, session, { secure: isSecureRequest(request) });
    response.cookies.delete(PKCE_VERIFIER_COOKIE);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "oauth_exchange_failed";
    const response = errorRedirect(origin, message);
    clearSessionCookies(response);
    response.cookies.delete(PKCE_VERIFIER_COOKIE);
    return response;
  }
}
