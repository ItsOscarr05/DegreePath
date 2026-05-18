import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return <AppShell email={user.email ?? undefined} avatarUrl={getAvatarUrl(user)}>{children}</AppShell>;
}

function getAvatarUrl(user: { user_metadata?: Record<string, unknown> }): string | null {
  const raw = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}
