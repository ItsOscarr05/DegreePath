import Link from "next/link";
import { LogoCompass } from "@/components/layout/logo-compass";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-screen flex-col">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_hsl(var(--accent-north)/0.08),_transparent_55%)]" />
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoCompass size={26} />
          <span className="font-semibold tracking-tight">DegreePath</span>
        </Link>
      </header>
      <main className="container flex flex-1 items-center justify-center pb-16">
        {children}
      </main>
    </div>
  );
}
