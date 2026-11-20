"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useTranslations } from "@/components/i18n/i18n-provider";
import { getSession, signOut as signOutRequest } from "@/lib/auth";
import type { ClientSession, SupabaseUser } from "@/lib/auth";

interface AuthContextValue {
  session: ClientSession | null;
  user: SupabaseUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function FullScreenLoader() {
  const t = useTranslations();

  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3 text-sm text-muted">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-primary" />
        {t.authProvider.loading}
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession()
      .then((current) => {
        if (!active) return;
        setSession(current);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setSession(await getSession());
    } catch {
      setSession(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutRequest();
    } finally {
      setSession(null);
      router.refresh();
    }
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      refresh,
      signOut,
    }),
    [session, loading, refresh, signOut],
  );

  if (loading) return <FullScreenLoader />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }

  return context;
}
