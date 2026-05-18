"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface SignOutButtonProps {
  /** Where to send the user after signing out (default: landing page). */
  redirectTo?: string;
  className?: string;
}

export function SignOutButton({
  redirectTo = "/",
  className,
}: SignOutButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    startTransition(() => {
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={pending}
      className={className ?? "w-full justify-center gap-2"}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
