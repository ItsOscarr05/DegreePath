"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { SUPPORTED_CATALOGS } from "@/lib/degrees/loader";

const schema = z.object({
  universityId: z.string().min(1),
  majorId: z.string().min(1),
  minorId: z.string().optional().nullable(),
  catalogYear: z.coerce.number().int().min(2000).max(2100),
  expectedGraduationYear: z
    .union([z.coerce.number().int().min(2000).max(2100), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
});

export type OnboardingFormState = { error?: string } | undefined;

export async function saveOnboarding(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const parsed = schema.safeParse({
    universityId: formData.get("universityId"),
    majorId: formData.get("majorId"),
    minorId: formData.get("minorId") || null,
    catalogYear: formData.get("catalogYear"),
    expectedGraduationYear: formData.get("expectedGraduationYear"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }

  const isSupported = SUPPORTED_CATALOGS.some(
    (c) =>
      c.universityId === parsed.data.universityId &&
      c.majorId === parsed.data.majorId &&
      c.catalogYear === parsed.data.catalogYear,
  );
  if (!isSupported) {
    return {
      error:
        "That university + major + catalog year is not supported yet. Pick one from the list.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    university_id: parsed.data.universityId,
    major_id: parsed.data.majorId,
    minor_id: parsed.data.minorId,
    catalog_year: parsed.data.catalogYear,
    expected_graduation_year: parsed.data.expectedGraduationYear,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
