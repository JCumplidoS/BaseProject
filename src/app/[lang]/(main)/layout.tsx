import type { ReactNode } from "react";

import { AuthProvider } from "@/components/auth/auth-provider";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
