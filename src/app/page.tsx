import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  CheckCircle2,
  ChevronDown,
  Compass,
  Globe,
  ListChecks,
  MessageCircle,
  MoveRight,
  Navigation,
} from "lucide-react";

import { LandingHeaderAuth } from "@/components/layout/landing-header-auth";
import { createClient } from "@/lib/supabase/server";

const HERO_IMAGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDc92iKwNhq5qmrxALg-_yXdR2hS-47TmNlxJdDEYcy1ERGB6102OPw7LoYaUfV1tqLISB83z9CHggKP5g_OmZGcWaVxtinB19fCJXupcGjlHCdqo4LxBbD5RQ1XxQen1vDynnKBn8nCeOAzXGgP7OO7IJWg1e5T_QHXfMw3cp0pIa2JZhN8UVLuQbrVwL02EHXq5BpTpCo6cr03WNoyYfrE-wMPZvOkmDnW2Mdk9ZZiS73yeuWdeOWTCaEZxEchIdOatGVQe3IqXs";

const DETAIL_IMAGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuASHMcjcfvrQXA2KqRUlOQW5A1Jn-mqT1zEYMFLZ9uWvLhoPtpkaobc5t2HYNRN0X462r9YFIXlOfqdQ_3XflHeoe21F2V-3vZj4xGoopmASvSqfQCqjDqU2WNj6YbhWWaQ31nV05_fdNc5zmC3t5bgMQRd07ocQ6NY6XNpBo8NI7YT2-m0fV6GDnpo-bQ6HLLpCp4XRjwI100MvhUxtajflnR6hFlLszu7dH4piXaAsvomoygE8-LoGh4w9697rhiWB5eWtGD0hUU";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Checklist" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/chat", label: "Advisor" },
];

const TRUSTED_LOGOS = [
  "Virginia Tech",
  "Georgia Tech",
  "MIT",
  "Stanford",
  "Purdue",
];

const FAQ_ITEMS = [
  {
    q: "How accurate is the degree audit?",
    a: "We pull directly from each institution's published catalog, then validate every AI suggestion against the same rules — credit minimums, prerequisite chains, course offerings. DegreePath is a planning aid, so we still recommend confirming with your official advisor before registering.",
  },
  {
    q: "Can I import my current transcript?",
    a: "Today you log your completed courses manually with grades and terms. Bulk import from PDF transcripts is on the roadmap.",
  },
  {
    q: "Does this replace my academic advisor?",
    a: "No. Think of DegreePath as the calm second opinion that runs the math 24/7. Final approvals — substitutions, waivers, registration — still go through your registrar and human advisor.",
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const loggedIn = Boolean(user);

  return (
    <div className="min-h-screen overflow-x-hidden bg-stitch-bg font-sans text-stitch-onSurface antialiased">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-stitch-surface/80 px-4 backdrop-blur-md md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Compass
            className="size-6 fill-stitch-primary text-stitch-primary"
            strokeWidth={1.5}
          />
          <span className="text-xl font-semibold tracking-tight text-stitch-primary">
            DegreePath
          </span>
        </Link>

        <nav className="hidden items-center gap-12 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs font-medium tracking-wider text-stitch-onSurfaceVariant transition-colors duration-200 hover:text-stitch-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {loggedIn ? (
          <LandingHeaderAuth />
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="font-mono text-xs font-medium tracking-wider text-stitch-onSurfaceVariant transition-colors hover:text-stitch-onSurface"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded bg-stitch-primary px-4 py-2 font-mono text-xs font-medium tracking-wider text-stitch-onPrimaryContainer transition-all hover:opacity-90 active:scale-95"
            >
              Get started
            </Link>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1440px] px-4 md:px-10">
        <section className="flex flex-col items-center py-20 text-center md:py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-stitch-surfaceContainer px-4 py-1 font-mono text-xs font-medium tracking-wider text-stitch-secondary">
            <span className="size-1.5 animate-pulse rounded-full bg-stitch-primary" />
            Find your north — graduate on time
          </div>
          <h1 className="mb-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-[40px] md:leading-[48px]">
            The clearest path through{" "}
            <br className="hidden md:block" />
            your degree.
          </h1>
          <p className="mb-12 max-w-2xl text-lg leading-7 text-stitch-onSurfaceVariant">
            Tell DegreePath what you have completed. We map every remaining
            requirement, respect prerequisites, and generate a
            semester-by-semester plan you can trust.
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded bg-stitch-primary px-12 py-4 text-xl font-semibold leading-8 text-stitch-onPrimaryContainer transition-all hover:opacity-90 active:scale-95"
                >
                  Open dashboard
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  href="/courses"
                  className="rounded border border-white/20 px-12 py-4 text-xl font-semibold leading-8 text-stitch-onSurface transition-all hover:bg-white/5"
                >
                  Add completed courses
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 rounded bg-stitch-primary px-12 py-4 text-xl font-semibold leading-8 text-stitch-onPrimaryContainer transition-all hover:opacity-90 active:scale-95"
                >
                  Plan my degree
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  href="/login"
                  className="rounded border border-white/20 px-12 py-4 text-xl font-semibold leading-8 text-stitch-onSurface transition-all hover:bg-white/5"
                >
                  I already have an account
                </Link>
              </>
            )}
          </div>

          <div className="relative mt-20 w-full">
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-stitch-bg to-transparent" />
            <Image
              src={HERO_IMAGE_SRC}
              alt=""
              width={1400}
              height={800}
              priority
              className="w-full rounded-xl border border-white/10 object-cover opacity-60 shadow-2xl grayscale"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 py-20 md:grid-cols-3">
          <FeatureBento
            iconClass="bg-stitch-primary/10 text-stitch-primary"
            icon={<Navigation className="size-5" strokeWidth={1.75} />}
            title="Interactive Roadmap"
            body="An AI roadmap respects credit limits and unlocks classes in the right order. Never miss a prerequisite chain again."
          />
          <FeatureBento
            iconClass="bg-stitch-secondary/10 text-stitch-secondary"
            icon={<ListChecks className="size-5" strokeWidth={1.75} />}
            title="Audit Precision"
            body="See every requirement — core, elective, and specialty — at a glance. Validated against official university curriculum files."
          />
          <FeatureBento
            iconClass="bg-white/10 text-stitch-onSurface"
            icon={<MessageCircle className="size-5" strokeWidth={1.75} />}
            title="Advisor Collaboration"
            body="Share your live roadmap with your academic advisor. Export clean PDFs or synced digital links for one-click approvals."
          />
        </section>

        <section className="overflow-hidden border-y border-white/5 py-12">
          <p className="mb-6 text-center font-mono text-xs font-medium uppercase tracking-widest text-stitch-onSurfaceVariant">
            Trusted by students at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-all hover:grayscale-0">
            {TRUSTED_LOGOS.map((name) => (
              <span
                key={name}
                className="text-2xl font-bold leading-8 text-stitch-onSurface"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 items-center gap-12 py-20 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="group relative overflow-hidden rounded-xl border border-white/10">
              <Image
                src={DETAIL_IMAGE_SRC}
                alt=""
                width={800}
                height={600}
                className="w-full grayscale transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-stitch-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
          <div className="order-1 space-y-6 md:order-2">
            <div className="h-0.5 w-12 bg-stitch-primary" />
            <h2 className="text-[32px] font-semibold leading-10 tracking-tight">
              Navigational clarity for complex curriculums
            </h2>
            <p className="text-lg leading-7 text-stitch-onSurfaceVariant">
              Stop guessing which semester offers &lsquo;CS 4400&rsquo;. Our
              system tracks course availability, prerequisite paths, and credit
              caps to ensure your roadmap is actually feasible.
            </p>
            <ul className="space-y-4">
              {[
                "Dynamic prerequisite mapping",
                "Transfer credit synchronization",
                "Major-change simulations",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <CheckCircle2
                    className="size-5 shrink-0 text-stitch-secondary"
                    strokeWidth={2}
                  />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-stitch-primary decoration-stitch-primary underline-offset-4 hover:underline"
            >
              {loggedIn ? "Open your dashboard" : "Learn about core requirements"}
              <MoveRight className="size-4" />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl py-20">
          <h2 className="mb-20 text-center text-[32px] font-semibold leading-10 tracking-tight">
            Planning Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group overflow-hidden rounded-lg border border-white/10 bg-stitch-surface"
              >
                <summary className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-white/5 [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-semibold leading-7 text-stitch-onSurface">
                    {item.q}
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-stitch-onSurfaceVariant transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm leading-6 text-stitch-onSurfaceVariant">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-white/10 bg-stitch-surface py-12">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-4 md:grid-cols-4 md:px-10">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Compass
                className="size-6 fill-stitch-primary text-stitch-primary"
                strokeWidth={1.5}
              />
              <span className="text-xl font-semibold tracking-tight text-stitch-primary">
                DegreePath
              </span>
            </div>
            <p className="mb-6 max-w-xs text-sm text-stitch-onSurfaceVariant">
              Professional wayfinding for the modern student. Precise, reliable,
              and quietly powerful.
            </p>
            <div className="flex gap-4">
              <FooterIcon href="#" icon={<Globe className="size-4" />} />
              <FooterIcon href="#" icon={<AtSign className="size-4" />} />
            </div>
          </div>

          <FooterColumn
            heading="Product"
            links={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Roadmap AI", href: "/roadmap" },
              { label: "Course Catalog", href: "/courses" },
              { label: "Advisor Chat", href: "/chat" },
            ]}
          />
          <FooterColumn
            heading="Legal"
            links={[
              { label: "Privacy Policy", href: "#" },
              { label: "Terms of Service", href: "#" },
              { label: "FERPA Compliance", href: "#" },
              { label: "Security", href: "#" },
            ]}
          />
        </div>

        <div className="mx-auto mt-12 flex max-w-[1440px] flex-col items-center justify-between gap-4 border-t border-white/5 px-4 pt-6 md:flex-row md:px-10">
          <p className="font-mono text-xs font-medium tracking-wider text-stitch-onSurfaceVariant opacity-50">
            © {new Date().getFullYear()} DegreePath Technologies Inc. All
            rights reserved.
          </p>
          <div className="flex gap-6 font-mono text-xs font-medium uppercase tracking-widest text-stitch-onSurfaceVariant opacity-50">
            <span>Designed for North</span>
            <span>v1.4.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureBento({
  iconClass,
  icon,
  title,
  body,
}: {
  iconClass: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-stitch-surfaceContainer p-12 transition-all hover:shadow-[0_0_15px_rgba(255,83,91,0.2)]">
      <div
        className={`mb-6 flex size-10 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-2xl font-semibold leading-8">{title}</h3>
      <p className="text-sm leading-6 text-stitch-onSurfaceVariant">{body}</p>
    </div>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurface">
        {heading}
      </h4>
      <ul className="space-y-2 text-sm text-stitch-onSurfaceVariant">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="transition-colors hover:text-stitch-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterIcon({
  href,
  icon,
}: {
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex size-8 items-center justify-center rounded border border-white/10 text-stitch-onSurfaceVariant transition-colors hover:bg-white/5 hover:text-stitch-primary"
    >
      {icon}
    </a>
  );
}
