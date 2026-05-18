"use client";

import { useMemo, useState, useActionState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  addCompletedCourse,
  removeCompletedCourse,
  type CoursesFormState,
} from "./actions";
import { normalizeCourseCode } from "@/lib/utils";

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

const initial: CoursesFormState = undefined;

export function CoursesClient({
  catalogCourses,
  completed,
}: {
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
      .slice(0, 8);
  }, [search, catalogCourses, completedSet]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add a course</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course code</Label>
              <Input
                id="courseCode"
                name="courseCode"
                placeholder="CS 1114"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                required
              />
              {suggestions.length > 0 ? (
                <ul className="surface-card divide-y divide-border/60 overflow-hidden">
                  {suggestions.map((s) => (
                    <li key={s.code}>
                      <button
                        type="button"
                        onClick={() => setSearch(s.code)}
                        className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-secondary"
                      >
                        <div>
                          <div className="font-medium">{s.code}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.title}
                          </div>
                        </div>
                        <Badge variant="muted">{s.credits} cr</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input id="credits" name="credits" type="number" min={0.5} step={0.5} placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input id="grade" name="grade" placeholder="A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Input id="term" name="term" placeholder="Fall 24" />
              </div>
            </div>
            {state?.error ? (
              <p className="rounded-md border border-north/40 bg-north/10 px-3 py-2 text-sm text-north">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Adding…" : "Add course"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Your courses
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({completed.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No courses yet. Add classes you have completed so we can compute
              your remaining requirements.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {completed.map((c) => (
                <li
                  key={c.courseCode}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <div className="font-medium">{c.courseCode}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.credits} credits
                      {c.grade ? ` · ${c.grade}` : ""}
                      {c.term ? ` · ${c.term}` : ""}
                    </div>
                  </div>
                  <form action={removeCompletedCourse}>
                    <input
                      type="hidden"
                      name="courseCode"
                      value={c.courseCode}
                    />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${c.courseCode}`}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
