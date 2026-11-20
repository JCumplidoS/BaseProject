import type { ClientSession, OAuthProvider, SignUpResult, SupabaseUser } from "./types";

export type { ClientSession, OAuthProvider, SignUpResult, SupabaseUser } from "./types";

export interface AuthCredentials {
  email: string;
  password: string;
}

export class AuthClientError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthClientError";
    this.status = status;
  }
}

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new AuthClientError(
      "Las funciones de sesión solo pueden invocarse desde el cliente (navegador).",
      500,
    );
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  assertBrowser();

  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "same-origin",
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `Error de autenticación (${response.status})`;
    throw new AuthClientError(message, response.status);
  }

  return data as T;
}

export function signUp({ email, password }: AuthCredentials): Promise<SignUpResult> {
  return request<SignUpResult>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signInWithPassword({
  email,
  password,
}: AuthCredentials): Promise<ClientSession> {
  return request<ClientSession>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signOut(): Promise<void> {
  await request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function getSession(): Promise<ClientSession | null> {
  const data = await request<{ session: ClientSession | null }>("/api/auth/session");
  return data.session;
}

export async function getUser(): Promise<SupabaseUser | null> {
  const data = await request<{ user: SupabaseUser | null }>("/api/auth/user");
  return data.user;
}

export async function refreshSession(): Promise<ClientSession | null> {
  const data = await request<{ session: ClientSession | null }>("/api/auth/refresh", {
    method: "POST",
  });
  return data.session;
}

export function requestPasswordReset({
  email,
}: {
  email: string;
}): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/auth/recover", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function updatePassword({
  password,
}: {
  password: string;
}): Promise<{ success: boolean }> {
  return request<{ success: boolean }>("/api/auth/update-password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function signInWithOAuth(provider: OAuthProvider): void {
  assertBrowser();
  const url = new URL("/api/auth/oauth", window.location.origin);
  url.searchParams.set("provider", provider);
  window.location.assign(url.toString());
}
