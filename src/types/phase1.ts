/**
 * Contracts from `phase1_api_docs.md` only (Colleges, Departments, Settings, Locations).
 * Do not infer fields from server implementation details — use these shapes for typing and UI mapping.
 */

export type Phase1Semester = 'fall' | 'spring';

/** Standard list envelope (Option B) */
export interface Phase1ListResponse<TKey extends string, TItem> {
  status: string;
  results: number;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  data: Record<TKey, TItem[]>;
}

/** Module 1 — College (see doc examples) */
export interface Phase1College {
  _id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  establishedYear?: number;
  dean_id?: Phase1DeanRef | string | null;
  isArchived: boolean;
  archivedAt?: string | null;
  createdAt?: string;
  deptCount?: number;
  studentCount?: number;
}

export interface Phase1DeanRef {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

/** Module 2 — Department */
export interface Phase1Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  college_id: Phase1CollegeRef | string;
  head_id?: Phase1HeadRef | string | null;
  isArchived: boolean;
  archivedAt?: string | null;
  createdAt?: string;
}

export interface Phase1CollegeRef {
  _id: string;
  name: string;
  code: string;
}

export interface Phase1HeadRef {
  _id: string;
  name: string;
  email?: string;
  role?: string;
}

/** Module 3 — Settings singleton */
export interface Phase1Settings {
  _id: string;
  currentAcademicYear: string;
  currentSemester: Phase1Semester;
  isEnrollmentOpen: boolean;
  gradePoints: Record<string, number>;
  defaultCreditLimit: {
    good_standing: number;
    probation: number;
    honors: number;
  };
}

/** Module 4 — Location */
export type Phase1LocationType = 'lecture_hall' | 'lab' | 'section_room' | 'auditorium';
export type Phase1LocationStatus = 'active' | 'maintenance';

export interface Phase1Location {
  _id: string;
  name: string;
  college_id: { _id: string; name: string } | string;
  building?: string;
  floor?: number;
  roomNumber?: string;
  capacity: number;
  type: Phase1LocationType;
  status: Phase1LocationStatus;
  readerId?: string;
  slug: string;
  isArchived: boolean;
  archivedAt?: string | null;
}
