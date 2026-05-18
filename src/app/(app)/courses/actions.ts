"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/degrees/loader";
import { normalizeCourseCode } from "@/lib/utils";

const addSchema = z.object({
  courseCode: z.string().min(2).max(20),
  credits: z.coerce.number().min(0.5).max(12).optional(),
  grade: z
    .string()
    .max(3)
    .transform((v) => v.trim() || null)
    .optional(),
  term: z
    .string()
    .max(40)
    .transform((v) => v.trim() || null)
    .optional(),
});

export type CoursesFormState = { error?: string } | undefined;

async function getProfileForUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data } = await supabase
    .from("profiles")
    .select("university_id, major_id, catalog_year")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) throw new Error("Please finish onboarding first.");
  return { supabase, user, profile: data };
}

export async function addCompletedCourse(
  _prev: CoursesFormState,
  formData: FormData,
): Promise<CoursesFormState> {
  const parsed = addSchema.safeParse({
    courseCode: formData.get("courseCode"),
    credits: formData.get("credits") || undefined,
    grade: formData.get("grade") || undefined,
    term: formData.get("term") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  try {
    const { supabase, user, profile } = await getProfileForUser();
    const code = normalizeCourseCode(parsed.data.courseCode);
    const catalog = await getCatalog(
      profile.university_id,
      profile.major_id,
      profile.catalog_year,
    );
    const catalogCourse = catalog.courses.find(
      (c) => normalizeCourseCode(c.code) === code,
    );
    const credits = parsed.data.credits ?? catalogCourse?.credits ?? 3;

    const { error } = await supabase.from("completed_courses").upsert({
      user_id: user.id,
      course_code: code,
      credits,
      grade: parsed.data.grade ?? null,
      term: parsed.data.term ?? null,
    });
    if (error) return { error: error.message };
    revalidatePath("/courses");
    revalidatePath("/dashboard");
    revalidatePath("/roadmap");
    return undefined;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error." };
  }
}

export async function removeCompletedCourse(formData: FormData): Promise<void> {
  const code = String(formData.get("courseCode") ?? "");
  if (!code) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("completed_courses")
    .delete()
    .eq("user_id", user.id)
    .eq("course_code", normalizeCourseCode(code));
  revalidatePath("/courses");
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
}
