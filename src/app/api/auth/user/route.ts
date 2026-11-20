import { NextResponse } from "next/server";

import { AuthApiError } from "@/lib/supabase/auth-api";
import { clearSessionCookies, isSecureRequest, setSessionCookies } from "@/lib/supabase/cookies";
import { authErrorResponse } from "@/lib/supabase/http";
import { resolveSession } from "@/lib/supabase/session";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const resolved = await resolveSession();

    if (!resolved) {
      return NextResponse.json({ user: null });
    }

    const response = NextResponse.json({ user: resolved.user });

    if (resolved.refreshed) {
      setSessionCookies(response, resolved.refreshed, { secure: isSecureRequest(request) });
    }

    return response;
  } catch (error) {
    if (error instanceof AuthApiError && (error.status === 401 || error.status === 400)) {
      const response = NextResponse.json({ user: null });
      clearSessionCookies(response);
      return response;
    }
    return authErrorResponse(error);
  }
}
