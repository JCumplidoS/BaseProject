import "server-only";

import { redirect } from "next/navigation";

import { resolveSession } from "@/lib/supabase/session";

export async function redirectIfAuthenticated(lang: string): Promise<void> {
  let hasSession = false;

  try {
    hasSession = Boolean(await resolveSession());
  } catch {
    hasSession = false;
  }

  if (hasSession) redirect(`/${lang}`);
}
