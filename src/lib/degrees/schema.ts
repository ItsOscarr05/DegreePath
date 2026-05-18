import { z } from "zod";

/**
 * Degree catalog schema.
 *
 * The MVP supports a "standard path" only: linear requirements with
 * prerequisite chains, plus simple "pick N from a pool" elective groups.
 * Tracks, substitutions, and exceptions are intentionally out of scope.
 */

export const courseSchema = z.object({
  code: z.string().min(1),
  title: z.string().min(1),
  credits: z.number().min(0).max(12),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
});
export type Course = z.infer<typeof courseSchema>;

export const requirementGroupSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("all"),
    id: z.string(),
    label: z.string(),
    courses: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("pick"),
    id: z.string(),
    label: z.string(),
    pick: z.number().int().positive(),
    courses: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("credits"),
    id: z.string(),
    label: z.string(),
    credits: z.number().positive(),
    tag: z.string(),
  }),
]);
export type RequirementGroup = z.infer<typeof requirementGroupSchema>;

export const majorSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalCredits: z.number().positive(),
  defaultCreditsPerSemester: z.number().positive().default(15),
  maxCreditsPerSemester: z.number().positive().default(18),
  requirements: z.array(requirementGroupSchema),
});
export type Major = z.infer<typeof majorSchema>;

export const catalogSchema = z.object({
  universityId: z.string(),
  universityName: z.string(),
  majorId: z.string(),
  catalogYear: z.number().int(),
  major: majorSchema,
  courses: z.array(courseSchema),
});
export type Catalog = z.infer<typeof catalogSchema>;
