import "server-only";

import {
  AuthApiError,
  fetchUser,
  refreshAuthSession,
  type AuthSession,
} from "./auth-api";
import { readSessionCookies } from "./cookies";
import type { SupabaseUser } from "@/lib/auth/types";

export interface ResolvedSession {
  user: SupabaseUser;
  expiresAt: number | null;
  refreshed: AuthSession | null;
}

const EXPIRY_SKEW_SECONDS = 30;

export async function resolveSession(): Promise<ResolvedSession | null> {
  const { accessToken, refreshToken, expiresAt } = await readSessionCookies();
  if (!accessToken) return null;

  let currentAccessToken = accessToken;
  let currentExpiresAt = expiresAt ?? null;
  let refreshed: AuthSession | null = null;

  const isExpired =
    expiresAt !== undefined && Date.now() / 1000 >= expiresAt - EXPIRY_SKEW_SECONDS;

  if (isExpired && refreshToken) {
    refreshed = await refreshAuthSession(refreshToken);
    currentAccessToken = refreshed.access_token;
    currentExpiresAt = refreshed.expires_at;
  }

  try {
    const user = await fetchUser(currentAccessToken);
    return { user, expiresAt: currentExpiresAt, refreshed };
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401 && refreshToken && !refreshed) {
      refreshed = await refreshAuthSession(refreshToken);
      const user = await fetchUser(refreshed.access_token);
      return { user, expiresAt: refreshed.expires_at, refreshed };
    }
    throw error;
  }
}
