"use client";

import Link from "next/link";

import { SignOutButton } from "@/components/layout/sign-out-button";

export function LandingHeaderAuth() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        className="rounded bg-stitch-primary px-4 py-2 font-mono text-xs font-medium tracking-wider text-stitch-onPrimaryContainer transition-all hover:opacity-90 active:scale-95"
      >
        Dashboard
      </Link>
      <SignOutButton className="rounded border border-white/20 px-4 py-2 font-mono text-xs font-medium tracking-wider text-stitch-onSurfaceVariant transition-colors hover:bg-white/5 hover:text-stitch-onSurface" />
    </div>
  );
}
