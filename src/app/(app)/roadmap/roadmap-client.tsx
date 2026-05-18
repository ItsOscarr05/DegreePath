"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Info,
  Lock,
  MapPin,
  NavigationOff,
  Settings,
  Sparkles,
} from "lucide-react";

import type { ValidatedRoadmap } from "@/lib/ai/validate";
import { cn, formatPercent } from "@/lib/utils";

interface RoadmapStats {
  completedCredits: number;
  totalRequiredCredits: number;
  graduationProgress: number;
  coursesRemaining: number;
  criticalPaths: number;
}

interface RoadmapClientProps {
  catalogName: string;
  initial: ValidatedRoadmap | null;
  generatedAt: string | null;
  stats: RoadmapStats;
}

const PATH_PREVIEW_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC3ptYVtDrcCnUHqKsa7ruhpD1wUrdFHcsrWuUHS2C61snnygWakOsa7TV3qWx3cv-e2P0xsc2ooJwpCVK5gMgEczzyL2mG2ap1XOCR9YWqnWCyc4SJKID0p6NPfxvyZc3hA7-DKqGBIA5NFDlSRWR20vntW6bcXmIIUR8Y5gkojlIH3H7ib4cgElpQwaXlCf5dPtvGvXABtv5uCqvGRa3ZOhioFiz0RTgcv5hy7EDJePurwQs-yS4onTn8gN5fbN4-jLow4DyR7UM";

export function RoadmapClient({
  catalogName,
  initial,
  generatedAt,
  stats,
}: RoadmapClientProps) {
  const [roadmap, setRoadmap] = useState<ValidatedRoadmap | null>(initial);
  const [stamp, setStamp] = useState<string | null>(generatedAt);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function generate() {
    setError(null);
    const res = await fetch("/api/roadmap", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Failed to generate roadmap.");
      return;
    }
    setRoadmap(body as ValidatedRoadmap);
    setStamp(new Date().toISOString());
  }

  const upcoming = roadmap?.semesters.slice(0, 3) ?? [];

  return (
    <div className="text-stitch-onSurface">
      <div className="-mx-6 mb-6 flex h-12 items-center justify-between border-b border-white/10 bg-stitch-surface/80 px-6 backdrop-blur-md md:-mx-10 md:px-10">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-stitch-onSurfaceVariant" />
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
            Roadmap / Graduation Plan
          </span>
        </div>
        <div className="flex items-center gap-4 text-stitch-onSurfaceVariant">
          <Settings className="size-4 cursor-pointer hover:text-stitch-primary" />
        </div>
      </div>

      <div className="space-y-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.02em]">
              Graduation roadmap
            </h1>
            <p className="mt-2 text-lg leading-7 text-stitch-onSurfaceVariant">
              {catalogName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => startTransition(generate)}
            disabled={pending}
            className={cn(
              "group flex items-center gap-3 rounded-lg bg-stitch-primaryContainer px-6 py-3 font-semibold text-white shadow-[0_0_15px_2px_rgba(230,57,70,0.15)]",
              "transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60",
            )}
          >
            <Sparkles className="size-5" strokeWidth={2.25} />
            {pending
              ? "Generating…"
              : roadmap
                ? "Regenerate"
                : "Generate roadmap"}
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {roadmap && roadmap.warnings.length > 0 ? (
          <div className="rounded-xl border border-white/10 border-l-4 border-l-stitch-primaryContainer bg-stitch-surfaceContainer p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-stitch-primary" />
              <div className="space-y-1">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stitch-primary">
                  Adjustments we made
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-stitch-onSurfaceVariant">
                  {roadmap.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-12 gap-5">
          {!roadmap ? (
            <div className="relative col-span-12 flex min-h-[400px] flex-col items-center justify-center space-y-6 overflow-hidden rounded-xl border border-white/10 bg-stitch-surfaceContainer p-16 text-center lg:col-span-8">
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 bg-stitch-primary/5 blur-[100px]" />
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-stitch-surfaceContainerHigh">
                <NavigationOff
                  className="size-8 text-stitch-secondary"
                  strokeWidth={1.5}
                />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-semibold leading-8">
                  No roadmap yet
                </h2>
                <p className="text-sm leading-5 text-stitch-onSurfaceVariant">
                  Generate a personalized semester plan based on your completed
                  courses and your degree&apos;s outstanding requirements.
                </p>
              </div>
            </div>
          ) : (
            <div className="col-span-12 space-y-5 lg:col-span-8">
              <div className="grid gap-5 sm:grid-cols-2">
                {roadmap.semesters.map((sem, idx) => (
                  <div
                    key={idx}
                    className="space-y-4 rounded-xl border border-white/10 bg-stitch-surfaceContainer p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-secondary">
                          {sem.term}
                        </span>
                        <h4 className="text-lg font-bold leading-7">
                          {sem.courses.length} course
                          {sem.courses.length === 1 ? "" : "s"}
                        </h4>
                      </div>
                      <span className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
                        {sem.totalCredits} Credits
                      </span>
                    </div>
                    <div className="space-y-2">
                      {sem.courses.map((c) => (
                        <div
                          key={c.code}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-stitch-bg/40 p-3"
                        >
                          <div>
                            <div className="font-mono text-xs font-semibold tracking-wider text-stitch-onSurface">
                              {c.code}
                            </div>
                            <div className="text-xs text-stitch-onSurfaceVariant">
                              {c.title}
                            </div>
                          </div>
                          <span className="font-mono text-xs text-stitch-onSurfaceVariant">
                            {c.credits} cr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">
            <div className="space-y-6 rounded-xl border border-white/10 bg-stitch-surface p-6">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-stitch-secondary">
                Academic Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stitch-onSurfaceVariant">
                    Credits Earned
                  </span>
                  <span className="font-mono text-xs font-medium tracking-wider">
                    {stats.completedCredits} / {stats.totalRequiredCredits}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-stitch-secondary"
                    style={{
                      width: `${stats.graduationProgress * 100}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-2 text-sm">
                  <span className="text-stitch-onSurfaceVariant">
                    Completion
                  </span>
                  <span className="font-mono text-xs font-medium tracking-wider">
                    {formatPercent(stats.graduationProgress)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 border-l-4 border-l-stitch-primaryContainer bg-stitch-surfaceContainer p-6">
              <div className="flex items-start gap-3">
                <Info className="mt-1 size-5 text-stitch-primary" />
                <p className="text-sm leading-6 text-stitch-onSurfaceVariant">
                  AI-generated. Confirm sequencing, substitutions, and credit
                  counts with your official advisor before registering.
                </p>
              </div>
            </div>

            {stamp ? (
              <p className="text-center font-mono text-[10px] uppercase tracking-widest text-stitch-onSurfaceVariant">
                Last generated {new Date(stamp).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>

        {upcoming.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-stitch-primaryContainer" />
              <h3 className="text-2xl font-semibold leading-8">
                Upcoming Semesters
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((sem, idx) => (
                <div
                  key={`upc-${idx}`}
                  className={cn(
                    "space-y-4 rounded-xl border border-white/10 bg-stitch-surfaceContainer p-6",
                    idx > 0 && "opacity-70",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={cn(
                          "font-mono text-xs font-medium uppercase tracking-wider",
                          idx === 0
                            ? "text-stitch-secondary"
                            : "text-stitch-onSurfaceVariant",
                        )}
                      >
                        {sem.term}
                      </span>
                      <h4 className="text-lg font-bold leading-7">
                        {idx === 0
                          ? "Up next"
                          : idx === 1
                            ? "Following"
                            : "Future"}
                      </h4>
                    </div>
                    <span className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
                      {sem.totalCredits} Cr
                    </span>
                  </div>
                  {sem.courses.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-white/5">
                      <Lock className="size-5 text-stitch-onSurfaceVariant" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sem.courses.slice(0, 4).map((c) => (
                        <div
                          key={c.code}
                          className="flex items-center justify-between rounded-lg border border-dashed border-white/10 p-3"
                        >
                          <span className="font-mono text-xs font-medium tracking-wider text-stitch-onSurface">
                            {c.code}
                          </span>
                          <span className="font-mono text-[11px] text-stitch-onSurfaceVariant">
                            {c.credits} cr
                          </span>
                        </div>
                      ))}
                      {sem.courses.length > 4 ? (
                        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-stitch-onSurfaceVariant">
                          +{sem.courses.length - 4} more
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-stitch-surface p-10">
          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-semibold leading-8">
                Visual path analysis
              </h2>
              <p className="max-w-md text-sm leading-5 text-stitch-onSurfaceVariant">
                Once your roadmap is generated, we&apos;ll show you a graph of
                your prerequisite dependencies. See exactly how one course
                unlocks the rest of your degree.
              </p>
              <div className="flex gap-10">
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold leading-8 text-stitch-secondary">
                    {stats.coursesRemaining}
                  </span>
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
                    Courses Left
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold leading-8 text-stitch-primary">
                    {stats.criticalPaths}
                  </span>
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
                    Blocked Courses
                  </span>
                </div>
              </div>
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black/40 md:w-1/2">
              <Image
                src={PATH_PREVIEW_SRC}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover opacity-20 grayscale transition-all duration-700 hover:opacity-50 hover:grayscale-0"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="rounded-lg border border-white/10 bg-stitch-surface/50 px-6 py-3 font-mono text-xs font-medium uppercase tracking-widest text-stitch-onSurfaceVariant backdrop-blur">
                  Previewing Engine
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
