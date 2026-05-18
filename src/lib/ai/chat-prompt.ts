import type { Catalog } from "@/lib/degrees/schema";
import type { EngineSummary } from "@/lib/degrees/engine";
import { summarizeForPrompt } from "@/lib/degrees/engine";

export const CHAT_SYSTEM_PROMPT = `You are DegreePath, an academic planning advisor.
You answer concise, grounded questions about a student's degree plan.

Rules:
- Use ONLY the facts in the provided context (student profile, completed courses,
  outstanding requirements, ready/blocked courses). If the user asks something
  the context cannot answer, say you cannot confirm it and recommend talking to
  their official advisor.
- Be brief and structured. Prefer short paragraphs and bullet lists.
- Never invent course codes, prerequisites, or credit counts.
- End uncertain answers with: "Confirm with your official advisor."
`;

export function buildChatContext(
  catalog: Catalog,
  summary: EngineSummary,
  completedCodes: string[],
): string {
  const compact = summarizeForPrompt(summary);
  return JSON.stringify(
    {
      university: catalog.universityName,
      major: catalog.major.name,
      catalogYear: catalog.catalogYear,
      totalCredits: catalog.major.totalCredits,
      completedCourses: completedCodes,
      progress: compact.progress,
      requirements: compact.requirements,
      readyCourses: compact.readyCourses,
      blockedCourses: compact.blockedCourses,
    },
    null,
    2,
  );
}
