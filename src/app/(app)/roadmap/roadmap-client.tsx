"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ValidatedRoadmap } from "@/lib/ai/validate";

interface RoadmapClientProps {
  catalogName: string;
  initial: ValidatedRoadmap | null;
  generatedAt: string | null;
}

export function RoadmapClient({
  catalogName,
  initial,
  generatedAt,
}: RoadmapClientProps) {
  const [roadmap, setRoadmap] = useState<ValidatedRoadmap | null>(initial);
  const [stamp, setStamp] = useState<string | null>(generatedAt);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function generate() {
    setError(null);
    const res = await fetch("/api/roadmap", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Failed to generate roadmap.");
      return;
    }
    setRoadmap(body as ValidatedRoadmap);
    setStamp(new Date().toISOString());
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Graduation roadmap
          </h1>
          <p className="text-sm text-muted-foreground">{catalogName}</p>
        </div>
        <Button
          variant="north"
          onClick={() => startTransition(generate)}
          disabled={pending}
        >
          <Sparkles className="size-4" />
          {pending
            ? "Generating…"
            : roadmap
              ? "Regenerate"
              : "Generate roadmap"}
        </Button>
      </header>

      {error ? (
        <p className="rounded-md border border-north/40 bg-north/10 px-4 py-3 text-sm text-north">
          {error}
        </p>
      ) : null}

      {!roadmap ? (
        <EmptyState />
      ) : (
        <>
          {roadmap.warnings.length > 0 ? (
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <AlertTriangle className="size-4 text-north" />
                <CardTitle className="text-base">Adjustments we made</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {roadmap.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roadmap.semesters.map((sem, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{sem.term}</CardTitle>
                  <Badge variant="gold">{sem.totalCredits} cr</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sem.courses.map((c) => (
                    <div
                      key={c.code}
                      className="flex items-start justify-between gap-3 rounded-md bg-secondary/40 px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium">{c.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.title}
                        </div>
                      </div>
                      <Badge variant="muted">{c.credits} cr</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {roadmap.notes ? (
            <p className="rounded-lg border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
              {roadmap.notes}
            </p>
          ) : null}

          {stamp ? (
            <p className="text-xs text-muted-foreground">
              Last generated {new Date(stamp).toLocaleString()}.
            </p>
          ) : null}
        </>
      )}

      <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 p-4 text-xs text-muted-foreground">
        <Compass className="mt-0.5 size-4 shrink-0 text-north" />
        AI-generated. Confirm sequencing, substitutions, and credit counts with
        your official advisor before registering.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <Sparkles className="size-6 text-gold" />
        <h2 className="text-lg font-semibold">No roadmap yet</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Generate a personalized semester plan based on your completed courses
          and your degree&apos;s outstanding requirements.
        </p>
      </CardContent>
    </Card>
  );
}
