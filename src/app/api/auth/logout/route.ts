import { NextResponse } from "next/server";

import { revokeSession } from "@/lib/supabase/auth-api";
import { clearSessionCookies, readSessionCookies } from "@/lib/supabase/cookies";

export async function POST(): Promise<NextResponse> {
  const { accessToken } = await readSessionCookies();

  if (accessToken) {
    try {
      await revokeSession(accessToken);
    } catch {
      // El token ya no es válido; igualmente limpiamos la sesión local.
    }
  }

  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}
