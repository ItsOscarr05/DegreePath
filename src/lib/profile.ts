import { createClient } from "@/lib/supabase/server";
import type { CompletedCourseRow, ProfileRow } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as ProfileRow | null) ?? null;
}

export async function getCompletedCourses(): Promise<CompletedCourseRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("completed_courses")
    .select("*")
    .eq("user_id", user.id)
    .order("course_code", { ascending: true });
  return (data ?? []) as CompletedCourseRow[];
}
