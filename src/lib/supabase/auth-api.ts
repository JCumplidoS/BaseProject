import "server-only";

import type { SupabaseUser } from "@/lib/auth/types";

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: SupabaseUser;
}

export interface SignUpResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  user?: SupabaseUser;
}

export class AuthApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.code = code;
  }
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function getConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new AuthApiError(
      "Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno.",
      500,
      "missing_config",
    );
  }

  return { url: url.replace(/\/+$/, ""), anonKey };
}

function parseJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function supabaseFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, anonKey } = getConfig();

  const headers = new Headers(init.headers);
  headers.set("apikey", anonKey);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${url}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = parseJson(await response.text());

  if (!response.ok) {
    const message =
      (data?.error_description as string | undefined) ??
      (data?.msg as string | undefined) ??
      (data?.message as string | undefined) ??
      (data?.error as string | undefined) ??
      `Error de Supabase (${response.status})`;

    throw new AuthApiError(message, response.status, data?.error_code as string | undefined);
  }

  return data as T;
}

export function signUpWithPassword(email: string, password: string): Promise<SignUpResponse> {
  return supabaseFetch<SignUpResponse>("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  return supabaseFetch<AuthSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  return supabaseFetch<AuthSession>("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function exchangeCodeForSession(
  authCode: string,
  codeVerifier: string,
): Promise<AuthSession> {
  return supabaseFetch<AuthSession>("/auth/v1/token?grant_type=pkce", {
    method: "POST",
    body: JSON.stringify({ auth_code: authCode, code_verifier: codeVerifier }),
  });
}

export function fetchUser(accessToken: string): Promise<SupabaseUser> {
  return supabaseFetch<SupabaseUser>("/auth/v1/user", {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function revokeSession(accessToken: string): Promise<void> {
  await supabaseFetch<null>("/auth/v1/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function requestPasswordRecovery(params: {
  email: string;
  redirectTo: string;
  codeChallenge: string;
}): Promise<void> {
  await supabaseFetch<null>("/auth/v1/recover", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      redirect_to: params.redirectTo,
      code_challenge: params.codeChallenge,
      code_challenge_method: "s256",
    }),
  });
}

export function updateUserPassword(
  accessToken: string,
  password: string,
): Promise<SupabaseUser> {
  return supabaseFetch<SupabaseUser>("/auth/v1/user", {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password }),
  });
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

export function buildAuthorizeUrl(params: {
  provider: string;
  redirectTo: string;
  codeChallenge: string;
}): string {
  const { url } = getConfig();
  const search = new URLSearchParams({
    provider: params.provider,
    redirect_to: params.redirectTo,
    code_challenge: params.codeChallenge,
    code_challenge_method: "s256",
  });
  return `${url}/auth/v1/authorize?${search.toString()}`;
}
