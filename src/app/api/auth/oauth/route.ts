import { NextResponse } from "next/server";

import {
  buildAuthorizeUrl,
  generateCodeChallenge,
  generateCodeVerifier,
} from "@/lib/supabase/auth-api";
import { PKCE_VERIFIER_COOKIE, isSecureRequest } from "@/lib/supabase/cookies";
import { authErrorResponse } from "@/lib/supabase/http";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const provider = url.searchParams.get("provider");

    if (!provider) {
      return NextResponse.json({ error: "Falta el proveedor OAuth." }, { status: 400 });
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const redirectTo = new URL("/api/auth/callback", url.origin).toString();
    const authorizeUrl = buildAuthorizeUrl({ provider, redirectTo, codeChallenge });

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set(PKCE_VERIFIER_COOKIE, codeVerifier, {
      httpOnly: true,
      secure: isSecureRequest(request),
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
