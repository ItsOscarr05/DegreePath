import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Circle, Compass } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getCompletedCourses, getProfile } from "@/lib/profile";
import { formatPercent } from "@/lib/utils";

export default async function DashboardPage() {
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
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {catalog.universityName}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {catalog.major.name}
          </h1>
          <Badge variant="gold">Catalog {catalog.catalogYear}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Verify all recommendations with your official advisor.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Graduation progress"
          value={formatPercent(summary.graduationProgress)}
          accent="gold"
          footer={
            <Progress value={summary.graduationProgress * 100} className="mt-3" />
          }
        />
        <StatCard
          label="Credits completed"
          value={`${summary.completedCredits} / ${summary.totalRequiredCredits}`}
          accent="gold"
          footer={
            <p className="mt-3 text-xs text-muted-foreground">
              {summary.remainingCredits} credits remaining
            </p>
          }
        />
        <StatCard
          label="Semesters left"
          value={String(summary.semestersRemaining)}
          accent="north"
          footer={
            <p className="mt-3 text-xs text-muted-foreground">
              At {catalog.major.defaultCreditsPerSemester} credits / semester
            </p>
          }
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Live status against the {catalog.major.name} catalog.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.requirements.map((req) => {
              const pct =
                req.required === 0
                  ? 0
                  : Math.min(100, (req.satisfied / req.required) * 100);
              return (
                <div
                  key={req.id}
                  className="rounded-lg border border-border/60 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {req.isSatisfied ? (
                        <CheckCircle2 className="size-4 text-gold" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{req.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {req.kind === "credits"
                        ? `${req.satisfied}/${req.required} credits`
                        : `${req.satisfied}/${req.required} courses`}
                    </span>
                  </div>
                  <Progress value={pct} className="mt-3" />
                  {req.remainingCourses.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {req.remainingCourses.slice(0, 8).map((code) => (
                        <Badge key={code} variant="outline">
                          {code}
                        </Badge>
                      ))}
                      {req.remainingCourses.length > 8 ? (
                        <span className="text-xs text-muted-foreground">
                          +{req.remainingCourses.length - 8} more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ready next</CardTitle>
            <CardDescription>
              Prerequisites met — eligible to take.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.readyCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing is currently eligible. Try adding more completed courses.
              </p>
            ) : (
              <ul className="space-y-2">
                {summary.readyCourses.slice(0, 8).map((c) => (
                  <li
                    key={c.code}
                    className="flex items-center justify-between gap-2 rounded-md bg-secondary/40 px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">{c.code}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.title}
                      </div>
                    </div>
                    <Badge variant="muted">{c.credits} cr</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/roadmap"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-north hover:underline"
            >
              Generate full roadmap <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
        <Compass className="mt-0.5 size-4 shrink-0 text-north" />
        DegreePath is a planning aid, not an official transcript or audit. Always
        confirm sequencing and substitutions with your advisor.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "gold",
  footer,
}: {
  label: string;
  value: string;
  accent?: "gold" | "north";
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={
            "mt-2 text-3xl font-semibold tracking-tight " +
            (accent === "north" ? "text-north" : "text-gold")
          }
        >
          {value}
        </p>
        {footer}
      </CardContent>
    </Card>
  );
}
