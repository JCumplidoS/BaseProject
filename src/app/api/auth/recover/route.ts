import { NextResponse } from "next/server";

import {
  generateCodeChallenge,
  generateCodeVerifier,
  requestPasswordRecovery,
} from "@/lib/supabase/auth-api";
import { PKCE_VERIFIER_COOKIE, isSecureRequest } from "@/lib/supabase/cookies";
import { authErrorResponse, readJsonBody } from "@/lib/supabase/http";

interface RecoverBody {
  email?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { email } = await readJsonBody<RecoverBody>(request);

    if (!email) {
      return NextResponse.json({ error: "El email es obligatorio." }, { status: 400 });
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const origin = new URL(request.url).origin;
    const redirectTo = new URL("/api/auth/callback", origin);
    redirectTo.searchParams.set("next", "/reset-password");

    await requestPasswordRecovery({
      email,
      redirectTo: redirectTo.toString(),
      codeChallenge,
    });

    const response = NextResponse.json({ success: true });
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
