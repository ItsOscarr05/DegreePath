"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      startTransition(() => router.replace("/onboarding"));
      return;
    }
    setMessage("Check your email to confirm your account.");
  }

  async function handleGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          At least 8 characters.
        </p>
      </div>
      {error ? (
        <p className="rounded-md border border-north/40 bg-north/10 px-3 py-2 text-sm text-north">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold">
          {message}
        </p>
      ) : null}
      <Button type="submit" variant="north" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>
    </form>
  );
}
