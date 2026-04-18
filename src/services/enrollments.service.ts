import { apiClient } from '@/lib/http/client';
import { buildQuery, type EnrollmentListParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export type { EnrollmentListParams };

export type EnrollmentRecord = Record<string, unknown>;

/** Admin: UA, CA — `GET /enrollments` */
export async function getEnrollments(
  params?: EnrollmentListParams
): Promise<Phase1ListResult<EnrollmentRecord>> {
  const response = await apiClient.get('/enrollments', {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<EnrollmentRecord>(response, 'enrollments');
}

/** Student: `GET /enrollments/my` */
export async function getMyEnrollments(
  params?: Pick<EnrollmentListParams, 'page' | 'limit' | 'sort' | 'fields'>
): Promise<Phase1ListResult<EnrollmentRecord>> {
  const response = await apiClient.get('/enrollments/my', {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<EnrollmentRecord>(response, 'enrollments');
}

export async function getEnrollment(id: string): Promise<EnrollmentRecord> {
  const response = await apiClient.get(`/enrollments/${encodeURIComponent(id)}`);
  return normalizeSingleResponse<EnrollmentRecord>(response, 'enrollment');
}

/** Student self-enroll — `POST /enrollments` */
export async function createStudentEnrollment(courseOffering_id: string): Promise<EnrollmentRecord> {
  const response = await apiClient.post('/enrollments', { courseOffering_id });
  return normalizeSingleResponse<EnrollmentRecord>(response, 'enrollment');
}

/** Admin force — `POST /enrollments/force` */
export async function forceEnrollment(data: {
  student_id: string;
  courseOffering_id: string;
  overrideCapacity?: boolean;
  overrideCreditLimit?: boolean;
  reason?: string;
}): Promise<EnrollmentRecord> {
  const response = await apiClient.post('/enrollments/force', data);
  return normalizeSingleResponse<EnrollmentRecord>(response, 'enrollment');
}

/** `PATCH /enrollments/:id/withdraw` */
export async function withdrawEnrollment(id: string): Promise<EnrollmentRecord> {
  const response = await apiClient.patch(`/enrollments/${encodeURIComponent(id)}/withdraw`);
  return normalizeSingleResponse<EnrollmentRecord>(response, 'enrollment');
}
