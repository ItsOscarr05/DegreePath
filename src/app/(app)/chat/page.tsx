import { redirect } from "next/navigation";

import { ChatClient } from "./chat-client";
import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getCompletedCourses, getProfile } from "@/lib/profile";

export default async function ChatPage() {
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

  const recent = completed
    .slice(-3)
    .reverse()
    .map((c) => {
      const match = catalog.courses.find(
        (cat) => cat.code.toUpperCase() === c.course_code.toUpperCase(),
      );
      return {
        code: c.course_code,
        title: match?.title ?? "Completed course",
      };
    });

  return (
    <ChatClient
      majorName={catalog.major.name}
      stats={{
        completedCredits: summary.completedCredits,
        totalRequiredCredits: summary.totalRequiredCredits,
        graduationProgress: summary.graduationProgress,
      }}
      recentCompleted={recent}
    />
  );
}
