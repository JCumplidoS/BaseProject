import { NextResponse } from "next/server";

import { signInWithPassword } from "@/lib/supabase/auth-api";
import { isSecureRequest, setSessionCookies } from "@/lib/supabase/cookies";
import { authErrorResponse, readJsonBody } from "@/lib/supabase/http";

interface LoginBody {
  email?: string;
  password?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { email, password } = await readJsonBody<LoginBody>(request);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    const session = await signInWithPassword(email, password);
    const response = NextResponse.json({
      user: session.user,
      expiresAt: session.expires_at,
    });

    setSessionCookies(response, session, { secure: isSecureRequest(request) });
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
