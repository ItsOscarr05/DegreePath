"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Compass,
  LayoutDashboard,
  ListChecks,
  MapPin,
  MessageCircle,
} from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";
import { cn } from "@/lib/utils";

const DESKTOP_NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  match: "dashboard" | "checklist" | "path";
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: "dashboard" },
  {
    href: "/dashboard#requirements",
    label: "Checklist",
    icon: ListChecks,
    match: "checklist",
  },
  { href: "/roadmap", label: "Roadmap", icon: MapPin, match: "path" },
  { href: "/courses", label: "Courses", icon: BookOpen, match: "path" },
  { href: "/chat", label: "Advisor chat", icon: MessageCircle, match: "path" },
];

const MOBILE_NAV = DESKTOP_NAV.filter(
  (item) => item.label !== "Courses" && item.label !== "Advisor chat",
).concat([
  { href: "/chat", label: "Advisor", icon: MessageCircle, match: "path" },
]);

function navActive(
  match: string,
  pathname: string | null,
  hash: string,
  href: string,
): boolean {
  if (match === "checklist") {
    return pathname === "/dashboard" && hash === "#requirements";
  }
  if (match === "dashboard") {
    return pathname === "/dashboard" && hash !== "#requirements";
  }
  if (href.includes("#")) return false;
  if (pathname == null) return false;
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function AppNavigation({
  email,
  avatarUrl,
}: {
  email?: string;
  avatarUrl?: string | null;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash : "");
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const letter = email?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-stitch-surfaceContainer md:flex">
        <div className="flex h-16 items-center border-b border-white/5 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Compass
              className="size-6 text-stitch-primary"
              aria-hidden
              strokeWidth={1.5}
            />
            <span className="text-2xl font-semibold tracking-tight text-stitch-primary">
              DegreePath
            </span>
          </Link>
        </div>
        <nav className="stitch-scrollbar flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {DESKTOP_NAV.map((item) => {
            const Icon = item.icon;
            const active = navActive(item.match, pathname, hash, item.href);
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                  active
                    ? "bg-stitch-primaryContainer/10 font-bold text-stitch-onSurface"
                    : "text-stitch-onSurfaceVariant hover:bg-white/5 hover:text-stitch-onSurface",
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-4 border-t border-white/5 p-4">
          <div className="flex items-center gap-3 px-3">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-stitch-surfaceContainerHighest">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-stitch-onSurface">
                  {letter}
                </div>
              )}
            </div>
            <p
              className="truncate text-xs text-stitch-onSurface"
              title={email}
            >
              {email ?? "Signed in"}
            </p>
          </div>
          <SignOutButton className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-stitch-onSurfaceVariant transition-all hover:bg-white/5 hover:text-stitch-primary" />
          <p className="px-3 text-center text-[10px] text-stitch-onSurfaceVariant/60">
            Always verify with your official advisor.
          </p>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-stitch-surface/80 px-4 backdrop-blur-md md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Compass className="size-6 text-stitch-primary" strokeWidth={1.5} />
          <span className="text-2xl font-semibold tracking-tight text-stitch-primary">
            DegreePath
          </span>
        </Link>
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10 bg-stitch-surfaceContainerHighest">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium">
              {letter}
            </div>
          )}
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/10 bg-stitch-surfaceContainer px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = navActive(item.match, pathname, hash, item.href);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-full px-3 py-1 text-stitch-onSurfaceVariant transition-transform active:scale-90",
                active &&
                  "bg-stitch-primaryContainer/10 text-stitch-primary",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
