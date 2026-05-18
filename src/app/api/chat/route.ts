import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/degrees/loader";
import { evaluateProgress } from "@/lib/degrees/engine";
import { getOpenAI, getModel } from "@/lib/ai/openai";
import { CHAT_SYSTEM_PROMPT, buildChatContext } from "@/lib/ai/chat-prompt";

export const runtime = "nodejs";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

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
      { error: "Finish onboarding first." },
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
  const context = buildChatContext(
    catalog,
    summary,
    completed.map((c) => c.courseCode),
  );

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: getModel(),
      temperature: 0.3,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        {
          role: "system",
          content: `Student context (read-only facts):\n${context}`,
        },
        ...parsed.data.messages,
      ],
    });
    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Empty response from AI." },
        { status: 502 },
      );
    }
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown AI error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
