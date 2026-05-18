import { describe, expect, it } from "vitest";

import { evaluateProgress } from "./engine";
import type { Catalog } from "./schema";

const sampleCatalog: Catalog = {
  universityId: "test",
  universityName: "Test U",
  majorId: "cs",
  catalogYear: 2024,
  major: {
    id: "cs",
    name: "Computer Science",
    totalCredits: 30,
    defaultCreditsPerSemester: 15,
    maxCreditsPerSemester: 18,
    requirements: [
      {
        kind: "all",
        id: "core",
        label: "Core",
        courses: ["CS 100", "CS 200", "CS 300"],
      },
      {
        kind: "pick",
        id: "elec",
        label: "Electives",
        pick: 1,
        courses: ["CS 400", "CS 401"],
      },
      {
        kind: "credits",
        id: "free",
        label: "Free electives",
        credits: 6,
        tag: "elective",
      },
    ],
  },
  courses: [
    { code: "CS 100", title: "Intro", credits: 3, prerequisites: [], tags: [] },
    {
      code: "CS 200",
      title: "Mid",
      credits: 3,
      prerequisites: ["CS 100"],
      tags: [],
    },
    {
      code: "CS 300",
      title: "Adv",
      credits: 3,
      prerequisites: ["CS 200"],
      tags: [],
    },
    {
      code: "CS 400",
      title: "AI",
      credits: 3,
      prerequisites: ["CS 300"],
      tags: [],
    },
    {
      code: "CS 401",
      title: "Net",
      credits: 3,
      prerequisites: ["CS 300"],
      tags: [],
    },
  ],
};

describe("evaluateProgress", () => {
  it("reports zero progress with no completed courses", () => {
    const result = evaluateProgress(sampleCatalog, []);
    expect(result.completedCredits).toBe(0);
    expect(result.graduationProgress).toBe(0);
    expect(result.semestersRemaining).toBe(2);
    expect(result.readyCourses.map((c) => c.code)).toEqual(["CS 100"]);
    expect(result.blockedCourses).toHaveLength(4);
  });

  it("marks an 'all' requirement satisfied when every course is completed", () => {
    const result = evaluateProgress(sampleCatalog, [
      { courseCode: "CS 100" },
      { courseCode: "CS 200" },
      { courseCode: "CS 300" },
    ]);
    const core = result.requirements.find((r) => r.id === "core");
    expect(core?.isSatisfied).toBe(true);
    expect(core?.remainingCourses).toEqual([]);
  });

  it("counts a 'pick' requirement once even with extra completions", () => {
    const result = evaluateProgress(sampleCatalog, [
      { courseCode: "CS 100" },
      { courseCode: "CS 200" },
      { courseCode: "CS 300" },
      { courseCode: "CS 400" },
      { courseCode: "CS 401" },
    ]);
    const elec = result.requirements.find((r) => r.id === "elec");
    expect(elec?.satisfied).toBe(1);
    expect(elec?.required).toBe(1);
    expect(elec?.isSatisfied).toBe(true);
  });

  it("treats uncategorized completions as free elective credits", () => {
    const result = evaluateProgress(sampleCatalog, [
      { courseCode: "HIST 101", credits: 3 },
      { courseCode: "PHIL 110", credits: 3 },
    ]);
    const free = result.requirements.find((r) => r.id === "free");
    expect(free?.satisfied).toBe(6);
    expect(free?.isSatisfied).toBe(true);
  });

  it("normalizes course codes (case + whitespace)", () => {
    const result = evaluateProgress(sampleCatalog, [
      { courseCode: " cs  100 " },
    ]);
    const core = result.requirements.find((r) => r.id === "core");
    expect(core?.completedCourses).toContain("CS 100");
  });

  it("unblocks downstream courses when a prereq is satisfied", () => {
    const result = evaluateProgress(sampleCatalog, [{ courseCode: "CS 100" }]);
    const readyCodes = result.readyCourses.map((c) => c.code);
    expect(readyCodes).toContain("CS 200");
    expect(readyCodes).not.toContain("CS 300");
  });
});
