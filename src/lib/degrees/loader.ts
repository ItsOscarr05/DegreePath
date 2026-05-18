import { promises as fs } from "node:fs";
import path from "node:path";

import { catalogSchema, type Catalog } from "./schema";

const catalogCache = new Map<string, Catalog>();

function cacheKey(university: string, major: string, catalogYear: number) {
  return `${university}:${major}:${catalogYear}`;
}

const SUPPORTED = new Set([cacheKey("vt", "cs", 2024)]);

export const SUPPORTED_CATALOGS = [
  { universityId: "vt", universityName: "Virginia Tech", majorId: "cs", majorName: "Computer Science, BS", catalogYear: 2024 },
];

/**
 * Load a degree catalog by (university, major, catalog year).
 * MVP supports a single combination; future catalogs slot in via JSON files
 * under data/degrees/<university>/<major>-<year>.json.
 */
export async function getCatalog(
  universityId: string,
  majorId: string,
  catalogYear: number,
): Promise<Catalog> {
  const key = cacheKey(universityId, majorId, catalogYear);
  if (!SUPPORTED.has(key)) {
    throw new Error(
      `Catalog ${universityId}/${majorId}/${catalogYear} is not supported yet.`,
    );
  }
  const cached = catalogCache.get(key);
  if (cached) return cached;

  const file = path.join(
    process.cwd(),
    "data",
    "degrees",
    universityId,
    `${majorId}-${catalogYear}.json`,
  );
  const raw = await fs.readFile(file, "utf8");
  const parsed = catalogSchema.parse(JSON.parse(raw));
  catalogCache.set(key, parsed);
  return parsed;
}
