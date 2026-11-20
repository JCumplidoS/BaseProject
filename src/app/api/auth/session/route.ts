import { NextResponse } from "next/server";

import { AuthApiError } from "@/lib/supabase/auth-api";
import { clearSessionCookies, isSecureRequest, setSessionCookies } from "@/lib/supabase/cookies";
import { authErrorResponse } from "@/lib/supabase/http";
import { resolveSession } from "@/lib/supabase/session";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const resolved = await resolveSession();

    if (!resolved) {
      return NextResponse.json({ session: null });
    }

    const response = NextResponse.json({
      session: { user: resolved.user, expiresAt: resolved.expiresAt },
    });

    if (resolved.refreshed) {
      setSessionCookies(response, resolved.refreshed, { secure: isSecureRequest(request) });
    }

    return response;
  } catch (error) {
    if (error instanceof AuthApiError && (error.status === 401 || error.status === 400)) {
      const response = NextResponse.json({ session: null });
      clearSessionCookies(response);
      return response;
    }
    return authErrorResponse(error);
  }
}
