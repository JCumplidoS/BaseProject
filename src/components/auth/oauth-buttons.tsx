"use client";

import { useTranslations } from "@/components/i18n/i18n-provider";
import { signInWithOAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  const t = useTranslations();

  return (
    <div className="grid gap-2">
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => signInWithOAuth("google")}
      >
        {t.oauth.google}
      </Button>
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => signInWithOAuth("github")}
      >
        {t.oauth.github}
      </Button>
    </div>
  );
}
