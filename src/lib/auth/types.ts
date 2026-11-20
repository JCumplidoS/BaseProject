export interface SupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ClientSession {
  user: SupabaseUser;
  expiresAt: number | null;
}

export interface SignUpResult {
  user: SupabaseUser | null;
  needsEmailConfirmation: boolean;
}

export type OAuthProvider =
  | "google"
  | "github"
  | "gitlab"
  | "azure"
  | "facebook"
  | "discord"
  | "apple"
  | "linkedin"
  | "twitter"
  | (string & {});
