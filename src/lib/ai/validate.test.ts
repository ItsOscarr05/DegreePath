import { describe, expect, it } from "vitest";

import { validateRoadmap } from "./validate";
import type { Catalog } from "@/lib/degrees/schema";

const catalog: Catalog = {
  universityId: "test",
  universityName: "Test U",
  majorId: "cs",
  catalogYear: 2024,
  major: {
    id: "cs",
    name: "CS",
    totalCredits: 30,
    defaultCreditsPerSemester: 15,
    maxCreditsPerSemester: 7,
    requirements: [
      {
        kind: "all",
        id: "core",
        label: "Core",
        courses: ["CS 100", "CS 200", "CS 300"],
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
  ],
};

describe("validateRoadmap", () => {
  it("accepts a well-ordered plan", () => {
    const r = validateRoadmap(
      {
        semesters: [
          { term: "F26", courses: ["CS 100"] },
          { term: "S27", courses: ["CS 200"] },
          { term: "F27", courses: ["CS 300"] },
        ],
      },
      catalog,
      [],
    );
    expect(r.semesters).toHaveLength(3);
    expect(r.warnings).toHaveLength(0);
    expect(r.isValid).toBe(true);
  });

  it("drops unknown courses and warns", () => {
    const r = validateRoadmap(
      { semesters: [{ term: "F26", courses: ["FAKE 999"] }] },
      catalog,
      [],
    );
    expect(r.semesters[0].courses).toHaveLength(0);
    expect(r.warnings[0]).toMatch(/unknown course/i);
  });

  it("drops courses with unmet prereqs", () => {
    const r = validateRoadmap(
      { semesters: [{ term: "F26", courses: ["CS 300"] }] },
      catalog,
      [],
    );
    expect(r.semesters[0].courses).toHaveLength(0);
    expect(r.warnings.join(" ")).toMatch(/prereq/i);
  });

  it("enforces the per-semester credit cap", () => {
    // Build a tiny catalog with three independent (no-prereq) 3-credit
    // courses and a cap of 7 so the third course must overflow.
    const capCatalog: Catalog = {
      ...catalog,
      major: { ...catalog.major, maxCreditsPerSemester: 7 },
      courses: [
        { code: "X 1", title: "X1", credits: 3, prerequisites: [], tags: [] },
        { code: "X 2", title: "X2", credits: 3, prerequisites: [], tags: [] },
        { code: "X 3", title: "X3", credits: 3, prerequisites: [], tags: [] },
      ],
    };
    const r = validateRoadmap(
      { semesters: [{ term: "F26", courses: ["X 1", "X 2", "X 3"] }] },
      capCatalog,
      [],
    );
    expect(r.semesters[0].courses).toHaveLength(2);
    expect(r.warnings.some((w) => /cap/i.test(w))).toBe(true);
  });

  it("honors already-completed prereqs", () => {
    const r = validateRoadmap(
      { semesters: [{ term: "F26", courses: ["CS 200"] }] },
      catalog,
      ["CS 100"],
    );
    expect(r.semesters[0].courses.map((c) => c.code)).toEqual(["CS 200"]);
  });
});
