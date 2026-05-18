import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, MapPin } from "lucide-react";

import { LogoCompass } from "@/components/layout/logo-compass";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--accent-gold)/0.08),_transparent_50%)]" />
      <header className="container flex items-center justify-between py-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoCompass size={28} />
          <span className="text-lg font-semibold tracking-tight">
            DegreePath
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium hover:bg-secondary"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-md bg-north px-4 text-sm font-medium text-north-foreground shadow-sm shadow-black/30 hover:bg-north/90"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="container flex flex-col items-center gap-8 py-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-north" />
          Find your north — graduate on time
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          The clearest path through your degree.
        </h1>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground">
          Tell DegreePath what you have completed. We map every remaining
          requirement, respect prerequisites, and generate a semester-by-semester
          plan you can trust.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-north px-6 text-base font-medium text-north-foreground shadow-sm shadow-black/30 hover:bg-north/90"
          >
            Plan my degree <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-base font-medium hover:bg-secondary"
          >
            I already have an account
          </Link>
        </div>
      </section>

      <section className="container grid gap-6 pb-24 md:grid-cols-3">
        <Feature
          icon={<MapPin className="text-north" />}
          title="Know where you stand"
          body="See every requirement — core, elective, prerequisite chain — at a glance."
        />
        <Feature
          icon={<Compass className="text-gold" />}
          title="Stay oriented"
          body="An AI roadmap respects credit limits and unlocks classes in the right order."
        />
        <Feature
          icon={<GraduationCap className="text-gold" />}
          title="Finish on time"
          body="Estimate your graduation date and adjust your plan as you go."
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="surface-card flex flex-col gap-3 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
