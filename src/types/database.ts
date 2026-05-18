export interface ProfileRow {
  id: string;
  university_id: string;
  major_id: string;
  minor_id: string | null;
  catalog_year: number;
  expected_graduation_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface CompletedCourseRow {
  user_id: string;
  course_code: string;
  credits: number;
  grade: string | null;
  term: string | null;
  created_at: string;
}

export interface RoadmapSnapshotRow {
  id: string;
  user_id: string;
  payload: unknown;
  created_at: string;
}
