import type { Catalog } from "@/lib/degrees/schema";
import type { EngineSummary } from "@/lib/degrees/engine";
import { summarizeForPrompt } from "@/lib/degrees/engine";

export const ROADMAP_SYSTEM_PROMPT = `You are DegreePath, an academic planning assistant.
Your job is to produce a semester-by-semester course plan that:
1. Only includes course codes that exist in the provided catalog.
2. Respects every listed prerequisite (a course may only appear in a semester
   AFTER all of its prerequisites have appeared in earlier semesters, OR are
   already completed).
3. Does not exceed the per-semester credit cap.
4. Does not repeat courses the student has already completed.
5. Aims to satisfy every outstanding requirement as efficiently as possible.

Return ONLY valid JSON conforming exactly to the requested schema. Do not include
prose, markdown, or explanations.`;

export function buildRoadmapUserPrompt(
  catalog: Catalog,
  summary: EngineSummary,
  completedCodes: string[],
) {
  const compact = summarizeForPrompt(summary);
  return JSON.stringify(
    {
      task: "Generate a graduation roadmap.",
      constraints: {
        defaultCreditsPerSemester: catalog.major.defaultCreditsPerSemester,
        maxCreditsPerSemester: catalog.major.maxCreditsPerSemester,
        targetTotalCredits: catalog.major.totalCredits,
      },
      completedCourses: completedCodes,
      progress: compact.progress,
      requirements: compact.requirements,
      readyCourses: compact.readyCourses,
      blockedCourses: compact.blockedCourses,
      catalogCourses: catalog.courses.map((c) => ({
        code: c.code,
        credits: c.credits,
        prerequisites: c.prerequisites,
        tags: c.tags,
      })),
      outputSchema: {
        type: "object",
        properties: {
          semesters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                term: { type: "string", description: "e.g. 'Fall 2026'" },
                courses: { type: "array", items: { type: "string" } },
              },
              required: ["term", "courses"],
            },
          },
          notes: { type: "string" },
        },
        required: ["semesters"],
      },
    },
    null,
    2,
  );
}
