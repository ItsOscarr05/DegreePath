import { redirect } from "next/navigation";

import { RoadmapClient } from "./roadmap-client";
import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getCompletedCourses, getProfile } from "@/lib/profile";
import type { ValidatedRoadmap } from "@/lib/ai/validate";

export default async function RoadmapPage() {
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const supabase = await createClient();
  const [catalog, completed, snapshotResp] = await Promise.all([
    getCatalog(profile.university_id, profile.major_id, profile.catalog_year),
    getCompletedCourses(),
    supabase
      .from("roadmap_snapshots")
      .select("payload, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const summary = evaluateProgress(
    catalog,
    completed.map((c) => ({
      courseCode: c.course_code,
      credits: c.credits,
      grade: c.grade,
    })),
  );

  const latest =
    (snapshotResp.data?.payload as ValidatedRoadmap | undefined) ?? null;
  const generatedAt = snapshotResp.data?.created_at ?? null;

  return (
    <RoadmapClient
      catalogName={`${catalog.universityName} — ${catalog.major.name}`}
      initial={latest}
      generatedAt={generatedAt}
      stats={{
        completedCredits: summary.completedCredits,
        totalRequiredCredits: summary.totalRequiredCredits,
        graduationProgress: summary.graduationProgress,
        coursesRemaining: summary.requirements
          .filter((r) => r.kind !== "credits")
          .reduce(
            (sum, r) => sum + Math.max(0, r.required - r.satisfied),
            0,
          ),
        criticalPaths: summary.blockedCourses.length,
      }}
    />
  );
}
