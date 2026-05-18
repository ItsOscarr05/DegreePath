import { z } from "zod";

import type { Catalog } from "@/lib/degrees/schema";
import { normalizeCourseCode } from "@/lib/utils";

export const roadmapSchema = z.object({
  semesters: z
    .array(
      z.object({
        term: z.string().min(1),
        courses: z.array(z.string()),
      }),
    )
    .min(1),
  notes: z.string().optional(),
});
export type RoadmapPayload = z.infer<typeof roadmapSchema>;

export interface ValidatedRoadmap {
  semesters: {
    term: string;
    courses: { code: string; credits: number; title: string }[];
    totalCredits: number;
  }[];
  notes?: string;
  warnings: string[];
  isValid: boolean;
}

/**
 * Validate and repair an AI-generated roadmap against the catalog.
 *
 * Repairs (silent): drop unknown courses, drop courses whose prerequisites
 * are still unmet by the time their semester runs, drop overflow courses
 * once a semester exceeds maxCreditsPerSemester.
 *
 * Warnings are surfaced to the user as "we adjusted this" notices.
 */
export function validateRoadmap(
  raw: unknown,
  catalog: Catalog,
  completedCodes: string[],
): ValidatedRoadmap {
  const parsed = roadmapSchema.parse(raw);
  const warnings: string[] = [];

  const courseIndex = new Map(
    catalog.courses.map((c) => [normalizeCourseCode(c.code), c] as const),
  );
  const completedSet = new Set(completedCodes.map(normalizeCourseCode));
  const seen = new Set<string>(completedSet);

  const cleaned = parsed.semesters.map((semester) => {
    const courses: { code: string; credits: number; title: string }[] = [];
    let credits = 0;
    for (const rawCode of semester.courses) {
      const code = normalizeCourseCode(rawCode);
      const course = courseIndex.get(code);
      if (!course) {
        warnings.push(`Removed unknown course "${rawCode}" from ${semester.term}.`);
        continue;
      }
      if (seen.has(code)) {
        warnings.push(`Removed duplicate "${code}" from ${semester.term}.`);
        continue;
      }
      const missing = course.prerequisites.filter(
        (p) => !seen.has(normalizeCourseCode(p)),
      );
      if (missing.length > 0) {
        warnings.push(
          `Removed "${code}" from ${semester.term} — prerequisites ${missing.join(", ")} not yet met.`,
        );
        continue;
      }
      if (credits + course.credits > catalog.major.maxCreditsPerSemester) {
        warnings.push(
          `Removed "${code}" from ${semester.term} — exceeds ${catalog.major.maxCreditsPerSemester}-credit cap.`,
        );
        continue;
      }
      courses.push({
        code: course.code,
        credits: course.credits,
        title: course.title,
      });
      credits += course.credits;
      seen.add(code);
    }
    return { term: semester.term, courses, totalCredits: credits };
  });

  return {
    semesters: cleaned,
    notes: parsed.notes,
    warnings,
    isValid: warnings.length === 0 && cleaned.every((s) => s.courses.length > 0),
  };
}
