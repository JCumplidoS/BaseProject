import { NextResponse } from "next/server";

import { signUpWithPassword, type AuthSession } from "@/lib/supabase/auth-api";
import { isSecureRequest, setSessionCookies } from "@/lib/supabase/cookies";
import { authErrorResponse, readJsonBody } from "@/lib/supabase/http";

interface SignUpBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { email, password } = await readJsonBody<SignUpBody>(request);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    const data = await signUpWithPassword(email, password);
    const response = NextResponse.json({
      user: data.user ?? null,
      needsEmailConfirmation: !data.access_token,
    });

    if (data.access_token && data.refresh_token && data.user) {
      const session: AuthSession = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type ?? "bearer",
        expires_in: data.expires_in ?? 3600,
        expires_at:
          data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
        user: data.user,
      };
      setSessionCookies(response, session, { secure: isSecureRequest(request) });
    }

    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
