import { redirect } from "next/navigation";

import { CoursesClient } from "./courses-client";
import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getCompletedCourses, getProfile } from "@/lib/profile";

export default async function CoursesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const [catalog, completed] = await Promise.all([
    getCatalog(profile.university_id, profile.major_id, profile.catalog_year),
    getCompletedCourses(),
  ]);

  const summary = evaluateProgress(
    catalog,
    completed.map((c) => ({
      courseCode: c.course_code,
      credits: c.credits,
      grade: c.grade,
    })),
  );

  return (
    <CoursesClient
      universityName={catalog.universityName}
      majorName={catalog.major.name}
      bentoGroups={summary.requirements.slice(0, 3).map((r) => ({
        id: r.id,
        label: r.label,
        kind: r.kind,
        satisfied: r.satisfied,
        required: r.required,
      }))}
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
  );
}
