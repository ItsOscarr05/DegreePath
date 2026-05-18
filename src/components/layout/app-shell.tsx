import Link from "next/link";
import { Compass, LayoutDashboard, MessageCircle, MapPin, BookOpen } from "lucide-react";
import { LogoCompass } from "@/components/layout/logo-compass";
import { SignOutButton } from "@/components/layout/sign-out-button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Completed courses", icon: BookOpen },
  { href: "/roadmap", label: "Roadmap", icon: MapPin },
  { href: "/chat", label: "Advisor chat", icon: MessageCircle },
];

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/50 p-5 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2">
          <LogoCompass size={26} />
          <span className="font-semibold tracking-tight">DegreePath</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <Icon className="size-4 text-muted-foreground group-hover:text-gold" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 pt-6">
          {email ? (
            <p className="truncate text-xs text-muted-foreground" title={email}>
              {email}
            </p>
          ) : null}
          <SignOutButton />
          <p className="flex items-center gap-2 text-[11px] leading-snug text-muted-foreground">
            <Compass className="size-3 text-north" />
            Always verify with your official advisor.
          </p>
        </div>
      </aside>
      <main className="flex-1 bg-background">
        <div className="container max-w-5xl py-10">{children}</div>
      </main>
    </div>
  );
}
