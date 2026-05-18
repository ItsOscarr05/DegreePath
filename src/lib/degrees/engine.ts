import { normalizeCourseCode } from "@/lib/utils";
import type { Catalog, Course, RequirementGroup } from "./schema";

export interface CompletedCourseInput {
  courseCode: string;
  credits?: number;
  grade?: string | null;
}

export interface RequirementStatus {
  id: string;
  label: string;
  kind: RequirementGroup["kind"];
  required: number;
  satisfied: number;
  remaining: number;
  /** Course codes contributing to this requirement that are completed. */
  completedCourses: string[];
  /** Course codes still needed; for `credits` groups this is empty. */
  remainingCourses: string[];
  /** True when fully met. */
  isSatisfied: boolean;
}

export interface EngineSummary {
  totalRequiredCredits: number;
  completedCredits: number;
  remainingCredits: number;
  /** Fraction in [0, 1]. */
  graduationProgress: number;
  /** Heuristic semesters left given default course load. */
  semestersRemaining: number;
  requirements: RequirementStatus[];
  /** Courses ready to take next (prereqs met, not yet completed). */
  readyCourses: Course[];
  /** Courses still blocked by unmet prereqs. */
  blockedCourses: { course: Course; missingPrereqs: string[] }[];
}

function indexCourses(catalog: Catalog) {
  return new Map(
    catalog.courses.map((c) => [normalizeCourseCode(c.code), c] as const),
  );
}

function evaluateRequirement(
  group: RequirementGroup,
  completedSet: Set<string>,
  catalogIndex: Map<string, Course>,
  completedExtraCredits: number,
): RequirementStatus {
  if (group.kind === "all") {
    const completed = group.courses.filter((c) =>
      completedSet.has(normalizeCourseCode(c)),
    );
    return {
      id: group.id,
      label: group.label,
      kind: "all",
      required: group.courses.length,
      satisfied: completed.length,
      remaining: group.courses.length - completed.length,
      completedCourses: completed,
      remainingCourses: group.courses.filter(
        (c) => !completedSet.has(normalizeCourseCode(c)),
      ),
      isSatisfied: completed.length === group.courses.length,
    };
  }

  if (group.kind === "pick") {
    const completed = group.courses.filter((c) =>
      completedSet.has(normalizeCourseCode(c)),
    );
    const satisfied = Math.min(group.pick, completed.length);
    return {
      id: group.id,
      label: group.label,
      kind: "pick",
      required: group.pick,
      satisfied,
      remaining: Math.max(0, group.pick - satisfied),
      completedCourses: completed,
      remainingCourses: group.courses.filter(
        (c) => !completedSet.has(normalizeCourseCode(c)),
      ),
      isSatisfied: satisfied >= group.pick,
    };
  }

  // credits group: counts uncategorized completed courses up to N credits.
  const satisfied = Math.min(group.credits, completedExtraCredits);
  return {
    id: group.id,
    label: group.label,
    kind: "credits",
    required: group.credits,
    satisfied,
    remaining: Math.max(0, group.credits - satisfied),
    completedCourses: [],
    remainingCourses: [],
    isSatisfied: satisfied >= group.credits,
  };
}

function findReadyCourses(
  catalog: Catalog,
  completedSet: Set<string>,
): { ready: Course[]; blocked: { course: Course; missingPrereqs: string[] }[] } {
  const ready: Course[] = [];
  const blocked: { course: Course; missingPrereqs: string[] }[] = [];

  for (const course of catalog.courses) {
    if (completedSet.has(normalizeCourseCode(course.code))) continue;

    const missing = course.prerequisites.filter(
      (p) => !completedSet.has(normalizeCourseCode(p)),
    );
    if (missing.length === 0) {
      ready.push(course);
    } else {
      blocked.push({ course, missingPrereqs: missing });
    }
  }

  return { ready, blocked };
}

export function evaluateProgress(
  catalog: Catalog,
  completed: CompletedCourseInput[],
): EngineSummary {
  const catalogIndex = indexCourses(catalog);

  const normalized = completed.map((c) => ({
    code: normalizeCourseCode(c.courseCode),
    credits:
      c.credits ??
      catalogIndex.get(normalizeCourseCode(c.courseCode))?.credits ??
      3,
  }));

  const completedSet = new Set(normalized.map((c) => c.code));

  // Credits used by completed courses that are NOT named in any group
  // (we treat them as free electives).
  const namedCourseCodes = new Set<string>();
  for (const group of catalog.major.requirements) {
    if (group.kind === "all" || group.kind === "pick") {
      for (const code of group.courses)
        namedCourseCodes.add(normalizeCourseCode(code));
    }
  }
  const completedExtraCredits = normalized
    .filter((c) => !namedCourseCodes.has(c.code))
    .reduce((sum, c) => sum + c.credits, 0);

  const requirements = catalog.major.requirements.map((g) =>
    evaluateRequirement(g, completedSet, catalogIndex, completedExtraCredits),
  );

  const completedCredits = normalized.reduce((sum, c) => sum + c.credits, 0);
  const remainingCredits = Math.max(
    0,
    catalog.major.totalCredits - completedCredits,
  );
  const graduationProgress = Math.max(
    0,
    Math.min(1, completedCredits / catalog.major.totalCredits),
  );

  const { ready, blocked } = findReadyCourses(catalog, completedSet);

  const semestersRemaining = Math.ceil(
    remainingCredits / catalog.major.defaultCreditsPerSemester,
  );

  return {
    totalRequiredCredits: catalog.major.totalCredits,
    completedCredits,
    remainingCredits,
    graduationProgress,
    semestersRemaining,
    requirements,
    readyCourses: ready,
    blockedCourses: blocked,
  };
}

/**
 * Compact summary suitable for LLM prompts. Strips long descriptions
 * and irrelevant fields to keep tokens low.
 */
export function summarizeForPrompt(summary: EngineSummary) {
  return {
    progress: {
      completedCredits: summary.completedCredits,
      remainingCredits: summary.remainingCredits,
      totalRequiredCredits: summary.totalRequiredCredits,
      semestersRemaining: summary.semestersRemaining,
    },
    requirements: summary.requirements.map((r) => ({
      id: r.id,
      label: r.label,
      kind: r.kind,
      required: r.required,
      satisfied: r.satisfied,
      remaining: r.remaining,
      remainingCourses: r.remainingCourses,
    })),
    readyCourses: summary.readyCourses.map((c) => ({
      code: c.code,
      credits: c.credits,
    })),
    blockedCourses: summary.blockedCourses.map((b) => ({
      code: b.course.code,
      missingPrereqs: b.missingPrereqs,
    })),
  };
}
