import { NextResponse } from "next/server";

import { updateUserPassword } from "@/lib/supabase/auth-api";
import { readSessionCookies } from "@/lib/supabase/cookies";
import { authErrorResponse, readJsonBody } from "@/lib/supabase/http";

interface UpdatePasswordBody {
  password?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { password } = await readJsonBody<UpdatePasswordBody>(request);

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 },
      );
    }

    const { accessToken } = await readSessionCookies();

    if (!accessToken) {
      return NextResponse.json(
        { error: "No hay una sesión válida para actualizar la contraseña." },
        { status: 401 },
      );
    }

    const user = await updateUserPassword(accessToken, password);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return authErrorResponse(error);
  }
}
