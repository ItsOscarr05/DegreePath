import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getOpenAI, getModel } from "@/lib/ai/openai";
import {
  ROADMAP_SYSTEM_PROMPT,
  buildRoadmapUserPrompt,
} from "@/lib/ai/roadmap-prompt";
import { validateRoadmap } from "@/lib/ai/validate";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json(
      { error: "Finish onboarding before generating a roadmap." },
      { status: 400 },
    );
  }

  const { data: completedRows } = await supabase
    .from("completed_courses")
    .select("course_code, credits, grade")
    .eq("user_id", user.id);
  const completed = (completedRows ?? []).map((c) => ({
    courseCode: c.course_code as string,
    credits: c.credits as number,
    grade: (c.grade as string | null) ?? null,
  }));

  const catalog = await getCatalog(
    profile.university_id,
    profile.major_id,
    profile.catalog_year,
  );
  const summary = evaluateProgress(catalog, completed);
  const completedCodes = completed.map((c) => c.courseCode);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: getModel(),
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        { role: "system", content: ROADMAP_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildRoadmapUserPrompt(catalog, summary, completedCodes),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 502 },
      );
    }
    const validated = validateRoadmap(JSON.parse(raw), catalog, completedCodes);

    await supabase.from("roadmap_snapshots").insert({
      user_id: user.id,
      payload: validated,
    });

    return NextResponse.json(validated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown AI error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
