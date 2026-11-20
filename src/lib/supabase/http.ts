import "server-only";

import { NextResponse } from "next/server";

import { AuthApiError } from "./auth-api";

export function authErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code ?? null },
      { status: error.status },
    );
  }

  const message = error instanceof Error ? error.message : "Error inesperado";
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AuthApiError("Cuerpo de la petición inválido.", 400, "invalid_body");
  }
}
