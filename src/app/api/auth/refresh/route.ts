import { NextResponse } from "next/server";

import { AuthApiError, refreshAuthSession } from "@/lib/supabase/auth-api";
import { clearSessionCookies, isSecureRequest, readSessionCookies, setSessionCookies } from "@/lib/supabase/cookies";
import { authErrorResponse } from "@/lib/supabase/http";

export async function POST(request: Request): Promise<NextResponse> {
  const { refreshToken } = await readSessionCookies();

  if (!refreshToken) {
    const response = NextResponse.json({ session: null });
    clearSessionCookies(response);
    return response;
  }

  try {
    const session = await refreshAuthSession(refreshToken);
    const response = NextResponse.json({
      session: { user: session.user, expiresAt: session.expires_at },
    });
    setSessionCookies(response, session, { secure: isSecureRequest(request) });
    return response;
  } catch (error) {
    if (error instanceof AuthApiError) {
      const response = NextResponse.json({ session: null });
      clearSessionCookies(response);
      return response;
    }
    return authErrorResponse(error);
  }
}
