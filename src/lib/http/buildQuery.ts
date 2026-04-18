/**
 * Build axios-compatible query params from a loose object.
 * Drops undefined / null / empty string; keeps numbers and allowed string unions.
 */
export type QueryValue = string | number | boolean | undefined | null;

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  fields?: string;
  isArchived?: 'true' | 'false' | 'all';
  search?: string;
  [key: string]: QueryValue;
}

/** Phase 2 `GET /users` filters (`phase2_api_doc`). */
export interface UserListQueryParams extends ListQueryParams {
  role?: string;
  department_id?: string;
  college_id?: string;
  academicStatus?: string;
  level?: number;
}

/** Phase 3 `GET /course-catalog` */
export interface CourseCatalogListParams extends ListQueryParams {
  department_id?: string;
  college_id?: string;
  creditHours?: number;
}

/** Phase 3 `GET /course-offerings` */
export interface CourseOfferingListParams extends ListQueryParams {
  semester?: string;
  academicYear?: string;
  course_id?: string;
  department_id?: string;
  college_id?: string;
}

/** Phase 3 `GET /enrollments` (admin) / roster */
export interface EnrollmentListParams extends ListQueryParams {
  semester?: string;
  academicYear?: string;
  status?: string;
  student_id?: string;
  course_id?: string;
  college_id?: string;
}

export function buildQuery(params: Record<string, unknown> | undefined | null): Record<string, string | number> {
  if (!params) return {};
  const out: Record<string, string | number> = {};
  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null || raw === '') continue;
    if (typeof raw === 'boolean') {
      out[key] = raw ? 'true' : 'false';
      continue;
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
      out[key] = raw;
    }
  }
  return out;
}
