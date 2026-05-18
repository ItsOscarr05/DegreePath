import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  PlusCircle,
  Sparkles,
} from "lucide-react";

import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getCompletedCourses, getProfile } from "@/lib/profile";
import { formatPercent } from "@/lib/utils";

/** Optional hero image (Stitch export); swap for your own asset in `public/` if preferred. */
const CAMPUS_HERO_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCNUXOij8EYb4RV9xEwRAozC4T3QRNM3yVDPVUBcC3N3OyM2JnjERT74NvRSgBmiNsancurxQjV5nWPlsEhp6PcGP-7W_sLZiXqjTY54dyN0qt4c1yieyhZIr4y9iOZQho0p53pTpEEKHebHVr1rnoFOTBj2nGF9qpoyzI4_kPdJyPkp_B8CnBuvttpmgm1fVQYWx0-kpzLCxWhUpQDLxwsayTax78-4aXLzaRXaOnuNe6YolZsYkDQCRulV8rCH45EUCQH1R-cV3I";

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const [catalog, completed] = await Promise.all([
    getCatalog(profile.university_id, profile.major_id, profile.catalog_year),
    getCompletedCourses(),
  ]);

  const summary = evaluateProgress(
    catalog,
    completed.map((c) => ({
      courseCode: c.course_code,
      credits: c.credits,
      grade: c.grade,
    })),
  );

  const pct = summary.graduationProgress * 100;

  return (
    <div className="text-stitch-onSurface">
      <header className="mb-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-widest text-stitch-onSurfaceVariant">
              {catalog.universityName}
            </span>
            <h1 className="mt-1 text-4xl font-bold leading-[48px] tracking-[-0.02em] text-stitch-onSurface md:text-[40px] md:leading-[48px]">
              {catalog.major.name}
            </h1>
            <p className="mt-2 text-sm leading-5 text-stitch-onSurfaceVariant">
              Verify all recommendations with your official advisor.
            </p>
          </div>
          <div className="w-fit rounded-full border border-stitch-secondary/20 bg-stitch-secondaryContainer/20 px-3 py-1">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-secondary">
              Catalog {catalog.catalogYear}
            </span>
          </div>
        </div>
      </header>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-stitch-surfaceContainer p-6">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
              Graduation Progress
            </span>
            <h2 className="mt-2 text-[32px] font-semibold leading-10 tracking-[-0.02em] text-stitch-secondary">
              {formatPercent(summary.graduationProgress)}
            </h2>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-stitch-surfaceContainerHighest">
            <div
              className="h-full bg-stitch-secondary transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-stitch-surfaceContainer p-6">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
            Credits Completed
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-stitch-onSurface">
              {summary.completedCredits}
            </h2>
            <span className="text-stitch-onSurfaceVariant">
              / {summary.totalRequiredCredits}
            </span>
          </div>
          <p className="mt-2 text-sm leading-5 text-stitch-onSurfaceVariant">
            {summary.remainingCredits} credits remaining
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-stitch-surfaceContainer p-6">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
            Semesters Left
          </span>
          <h2 className="mt-2 text-[32px] font-semibold leading-10 tracking-[-0.02em] text-stitch-primary">
            {summary.semestersRemaining}
          </h2>
          <p className="mt-2 text-sm leading-5 text-stitch-onSurfaceVariant">
            At {catalog.major.defaultCreditsPerSemester} credits / semester
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div id="requirements" className="scroll-mt-24 space-y-6 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold leading-8 text-stitch-onSurface">
                Requirements
              </h3>
              <p className="text-sm leading-5 text-stitch-onSurfaceVariant">
                Live status against the {catalog.major.name} catalog.
              </p>
            </div>
          </div>

          {summary.requirements.map((req) => {
            const showMore =
              req.remainingCourses.length > 8
                ? req.remainingCourses.length - 8
                : 0;
            const displayChips = req.remainingCourses.slice(0, 8);
            const countLabel =
              req.kind === "credits"
                ? `${req.satisfied}/${req.required} credits`
                : `${req.satisfied}/${req.required} courses`;

            return (
              <div
                key={req.id}
                className="overflow-hidden rounded-xl border border-white/5 bg-stitch-surfaceContainer"
              >
                <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] p-6">
                  <div className="flex items-center gap-4">
                    {req.isSatisfied ? (
                      <CheckCircle2 className="size-6 shrink-0 text-stitch-secondary" />
                    ) : (
                      <Circle className="size-6 shrink-0 text-stitch-onSurfaceVariant" />
                    )}
                    <h4 className="text-2xl font-semibold leading-8 text-stitch-onSurface">
                      {req.label}
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
                    {countLabel}
                  </span>
                </div>
                <div className="p-6">
                  {req.kind === "credits" ? (
                    <p className="text-sm text-stitch-onSurfaceVariant">
                      Free-elective pool: {req.satisfied} of {req.required}{" "}
                      credits from courses not counted toward named requirements.
                    </p>
                  ) : displayChips.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displayChips.map((code) => (
                        <span
                          key={code}
                          className="rounded border border-white/10 bg-stitch-surfaceContainerHighest px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurface"
                        >
                          {code}
                        </span>
                      ))}
                      {showMore > 0 ? (
                        <span className="py-1 font-mono text-xs font-medium text-stitch-onSurfaceVariant">
                          +{showMore} more
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-stitch-secondary">
                      Complete — all courses in this group satisfied.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="relative overflow-hidden rounded-xl border border-white/5 bg-stitch-surfaceContainer p-6">
            <div className="absolute top-0 left-0 h-full w-1 bg-stitch-primary/20" />
            <h3 className="text-2xl font-semibold leading-8 text-stitch-onSurface">
              Ready next
            </h3>
            <p className="mb-6 text-sm leading-5 text-stitch-onSurfaceVariant">
              Prerequisites met — eligible to take.
            </p>
            {summary.readyCourses.length === 0 ? (
              <p className="text-sm text-stitch-onSurfaceVariant">
                Nothing is currently eligible. Add completed courses or check
                remaining prerequisites.
              </p>
            ) : (
              <div className="space-y-4">
                {summary.readyCourses.slice(0, 8).map((c) => (
                  <Link
                    key={c.code}
                    href="/courses"
                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-white/5 bg-stitch-surfaceContainerHigh p-4 transition-colors hover:border-stitch-primary/40"
                  >
                    <div>
                      <h5 className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurface">
                        {c.code}
                      </h5>
                      <p className="text-xs text-stitch-onSurfaceVariant">
                        {c.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-medium text-stitch-onSurfaceVariant">
                        {c.credits} cr
                      </span>
                      <PlusCircle className="size-5 text-stitch-primaryContainer transition-transform group-hover:scale-110" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center rounded-xl border border-stitch-primary/20 bg-stitch-primary/5 p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stitch-primary/10">
              <Sparkles className="size-8 text-stitch-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-semibold leading-8 text-stitch-onSurface">
              Plan Ahead
            </h3>
            <p className="mt-2 mb-6 text-sm leading-5 text-stitch-onSurfaceVariant">
              Generate a balanced path optimized for your completed work and
              degree rules.
            </p>
            <Link
              href="/roadmap"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-stitch-primary py-3 text-base font-semibold text-stitch-onPrimaryContainer transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <span>Generate full roadmap</span>
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="relative h-48 overflow-hidden rounded-xl border border-white/5 bg-stitch-surfaceContainer">
            <Image
              src={CAMPUS_HERO_SRC}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover opacity-40 grayscale transition-all duration-700 hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stitch-surface to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-secondary">
                Academic Commons
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[10px] text-stitch-onSurfaceVariant/60 md:text-left">
        DegreePath is a planning aid, not an official transcript or audit.
        Confirm sequencing and substitutions with your advisor.
      </p>
    </div>
  );
}
