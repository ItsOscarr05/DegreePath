import Link from "next/link";
import { redirect } from "next/navigation";

import { CoursesClient } from "./courses-client";
import { getCatalog } from "@/lib/degrees/loader";
import { getCompletedCourses, getProfile } from "@/lib/profile";

export default async function CoursesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const [catalog, completed] = await Promise.all([
    getCatalog(profile.university_id, profile.major_id, profile.catalog_year),
    getCompletedCourses(),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Completed courses
        </h1>
        <p className="text-sm text-muted-foreground">
          Add the classes you have already taken. Search the catalog for{" "}
          <span className="font-medium text-foreground">
            {catalog.universityName} — {catalog.major.name}
          </span>
          , or add a course manually.
        </p>
      </header>
      <CoursesClient
        catalogCourses={catalog.courses.map((c) => ({
          code: c.code,
          title: c.title,
          credits: c.credits,
        }))}
        completed={completed.map((c) => ({
          courseCode: c.course_code,
          credits: c.credits,
          grade: c.grade,
          term: c.term,
        }))}
      />
      <p className="text-xs text-muted-foreground">
        Need to change your program?{" "}
        <Link href="/onboarding" className="text-gold hover:underline">
          Update your profile
        </Link>
        .
      </p>
    </div>
  );
}
