"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  BookOpenCheck,
  CircleCheck,
  Code2,
  Layers,
  Sigma,
  Trash2,
} from "lucide-react";

import {
  addCompletedCourse,
  removeCompletedCourse,
  type CoursesFormState,
} from "./actions";
import { cn, normalizeCourseCode } from "@/lib/utils";

interface CatalogOption {
  code: string;
  title: string;
  credits: number;
}

interface CompletedRow {
  courseCode: string;
  credits: number;
  grade: string | null;
  term: string | null;
}

interface BentoGroup {
  id: string;
  label: string;
  kind: "all" | "pick" | "credits";
  satisfied: number;
  required: number;
}

const initial: CoursesFormState = undefined;

const BENTO_ICONS = [Code2, Sigma, Layers] as const;

const HERO_IMAGE_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuASINVZMs3T7efACKO0lOBcBuzC1ZAANqZfQ2e6T0GiRXK6cFxtE1IM1GFX3g33uOccGvp7AZDElihjOaTT8QDyd_6Ep7iRM15O5mffK5N40_J4H4nL4F5JupTRmIy1ZNjauTM6u3ECAsC0Nyt9EodfnHlwq6NWdCt1A5UOsETqBXBC2bODl-Gwt6hNMOsjWrOiX2CxquwOER-jliRjk1529KTz81M1Qlap1H2rcBWPqsJO1QYwGAIM8gBdTwhT_h42jQaDmQuCY90";

export function CoursesClient({
  universityName,
  majorName,
  bentoGroups,
  catalogCourses,
  completed,
}: {
  universityName: string;
  majorName: string;
  bentoGroups: BentoGroup[];
  catalogCourses: CatalogOption[];
  completed: CompletedRow[];
}) {
  const [state, formAction, pending] = useActionState(
    addCompletedCourse,
    initial,
  );
  const [search, setSearch] = useState("");

  const completedSet = useMemo(
    () => new Set(completed.map((c) => normalizeCourseCode(c.courseCode))),
    [completed],
  );

  const suggestions = useMemo(() => {
    const q = search.trim().toUpperCase();
    if (!q) return [];
    return catalogCourses
      .filter((c) => {
        if (completedSet.has(normalizeCourseCode(c.code))) return false;
        const code = c.code.toUpperCase();
        const title = c.title.toUpperCase();
        return code.includes(q) || title.includes(q);
      })
      .slice(0, 6);
  }, [search, catalogCourses, completedSet]);

  return (
    <div className="text-stitch-onSurface">
      <header className="mb-10">
        <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.02em]">
          Course Checklist
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-7 text-stitch-onSurfaceVariant">
          Track your progress towards graduation. We&apos;ve mapped your
          requirements for{" "}
          <span className="font-bold text-stitch-secondary">
            {universityName} — {majorName}
          </span>
          .
        </p>
      </header>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {bentoGroups.map((g, idx) => {
          const Icon = BENTO_ICONS[idx] ?? Code2;
          const pct =
            g.required === 0
              ? 0
              : Math.min(100, (g.satisfied / g.required) * 100);
          const unit = g.kind === "credits" ? "Credits" : "Courses";
          const remaining = Math.max(0, g.required - g.satisfied);
          return (
            <div
              key={g.id}
              className="flex flex-col gap-6 border border-white/5 bg-stitch-surfaceContainer p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-medium uppercase tracking-widest text-stitch-onSurfaceVariant">
                    Requirement
                  </span>
                  <h3 className="text-2xl font-semibold leading-8">{g.label}</h3>
                </div>
                <Icon
                  className="size-6 shrink-0 text-stitch-secondary"
                  strokeWidth={2}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs font-medium tracking-wider">
                  <span>Progress</span>
                  <span>
                    {g.satisfied} / {g.required} {unit}
                  </span>
                </div>
                <div className="h-1 w-full bg-stitch-surfaceContainerHighest">
                  <div
                    className="h-full bg-stitch-secondary transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <span className="rounded-full bg-white/5 px-2 py-1 font-mono text-[10px] tracking-wider text-stitch-onSurfaceVariant">
                  {remaining === 0
                    ? "Complete"
                    : `${remaining} ${unit} Left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-5">
          <div className="lg:sticky lg:top-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold leading-8">Add a course</h2>
              <p className="mt-2 text-sm leading-5 text-stitch-onSurfaceVariant">
                Record your academic history to update your roadmap.
              </p>
            </div>
            <div className="space-y-6 border border-white/5 bg-stitch-surfaceContainer p-6">
              <form action={formAction} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="courseCode"
                    className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant"
                  >
                    Course code
                  </label>
                  <input
                    id="courseCode"
                    name="courseCode"
                    type="text"
                    placeholder="e.g. CS 1114"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                    required
                    className="w-full border border-white/10 bg-stitch-bg px-4 py-2 font-mono text-sm text-stitch-onSurface placeholder:opacity-30 focus:border-stitch-secondary focus:outline-none transition-colors"
                  />
                  {suggestions.length > 0 ? (
                    <ul className="divide-y divide-white/5 overflow-hidden border border-white/10 bg-stitch-surfaceContainerHigh">
                      {suggestions.map((s) => (
                        <li key={s.code}>
                          <button
                            type="button"
                            onClick={() => setSearch(s.code)}
                            className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-white/5"
                          >
                            <div>
                              <div className="font-mono text-xs font-medium tracking-wider text-stitch-onSurface">
                                {s.code}
                              </div>
                              <div className="text-xs text-stitch-onSurfaceVariant">
                                {s.title}
                              </div>
                            </div>
                            <span className="font-mono text-[11px] text-stitch-onSurfaceVariant">
                              {s.credits} cr
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Credits">
                    <input
                      name="credits"
                      type="number"
                      min={0.5}
                      step={0.5}
                      placeholder="3"
                      className="w-full border border-white/10 bg-stitch-bg px-4 py-2 font-mono text-sm text-stitch-onSurface focus:border-stitch-secondary focus:outline-none transition-colors"
                    />
                  </FormField>
                  <FormField label="Grade">
                    <select
                      name="grade"
                      className="w-full border border-white/10 bg-stitch-bg px-4 py-2 font-mono text-sm text-stitch-onSurface focus:border-stitch-secondary focus:outline-none transition-colors"
                      defaultValue=""
                    >
                      <option value="">—</option>
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                      <option>D</option>
                      <option>IP</option>
                    </select>
                  </FormField>
                  <FormField label="Term">
                    <input
                      name="term"
                      type="text"
                      placeholder="Fall 24"
                      className="w-full border border-white/10 bg-stitch-bg px-4 py-2 font-mono text-sm text-stitch-onSurface focus:border-stitch-secondary focus:outline-none transition-colors"
                    />
                  </FormField>
                </div>

                {state?.error ? (
                  <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {state.error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-stitch-secondary py-3 font-mono text-xs font-bold uppercase tracking-wider text-[#342800] transition-transform duration-150 active:scale-95 disabled:opacity-60"
                >
                  {pending ? "Adding…" : "Add course"}
                </button>

                <div className="border-t border-white/5 pt-4">
                  <p className="text-center text-[11px] text-stitch-onSurfaceVariant">
                    Need to change your program?{" "}
                    <Link
                      href="/onboarding"
                      className="text-stitch-secondary hover:underline"
                    >
                      Update your profile
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold leading-8">
              Your courses
              <span className="ml-2 font-normal text-stitch-onSurfaceVariant opacity-50">
                ({completed.length})
              </span>
            </h2>
          </div>

          {completed.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/5 bg-stitch-surfaceContainer p-16 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stitch-surfaceContainerHighest">
                <BookOpenCheck
                  className="size-8 text-stitch-onSurfaceVariant"
                  strokeWidth={1.5}
                />
              </div>
              <p className="max-w-xs text-sm leading-5 text-stitch-onSurfaceVariant">
                No courses yet. Add classes you have completed so we can compute
                your remaining requirements.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5 border border-white/5 bg-stitch-surfaceContainer">
              {completed.map((c) => (
                <li
                  key={c.courseCode}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <CircleCheck
                      className="size-5 shrink-0 text-stitch-secondary"
                      strokeWidth={2}
                    />
                    <div>
                      <div className="font-mono text-xs font-semibold tracking-wider text-stitch-onSurface">
                        {c.courseCode}
                      </div>
                      <div className="text-xs text-stitch-onSurfaceVariant">
                        {c.credits} credits
                        {c.grade ? ` · ${c.grade}` : ""}
                        {c.term ? ` · ${c.term}` : ""}
                      </div>
                    </div>
                  </div>
                  <form action={removeCompletedCourse}>
                    <input
                      type="hidden"
                      name="courseCode"
                      value={c.courseCode}
                    />
                    <button
                      type="submit"
                      aria-label={`Remove ${c.courseCode}`}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded text-stitch-onSurfaceVariant transition-colors",
                        "hover:bg-white/5 hover:text-stitch-primary",
                      )}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12">
            <div className="relative h-48 w-full overflow-hidden rounded-lg">
              <Image
                src={HERO_IMAGE_SRC}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover opacity-30 grayscale transition-all duration-700 hover:grayscale-0"
              />
            </div>
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-stitch-onSurfaceVariant">
              Always verify with your official advisor.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-xs font-medium uppercase tracking-wider text-stitch-onSurfaceVariant">
        {label}
      </label>
      {children}
    </div>
  );
}
