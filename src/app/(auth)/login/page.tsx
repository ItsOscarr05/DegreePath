import Link from "next/link";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Log in to see your roadmap and remaining requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginFormWrapper searchParams={searchParams} />
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-gold hover:underline">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect, error } = await searchParams;
  return <LoginForm redirect={redirect} initialError={error} />;
}
