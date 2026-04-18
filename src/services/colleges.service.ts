import { apiClient } from '@/lib/http/client';
import { buildQuery, type ListQueryParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export type CollegeRecord = Record<string, unknown>;

export interface GetCollegesParams extends ListQueryParams {
  search?: string;
  isArchived?: 'true' | 'false' | 'all';
}

/**
 * GET /colleges — normalized list + pagination meta.
 */
export async function getColleges(params?: GetCollegesParams): Promise<Phase1ListResult<CollegeRecord>> {
  const response = await apiClient.get('/colleges', { params: buildQuery(params as Record<string, unknown>) });
  return normalizeListResponse<CollegeRecord>(response, 'colleges');
}

/** GET /colleges/:id */
export async function getCollege(id: string, query?: { isArchived?: 'true' }): Promise<CollegeRecord> {
  const response = await apiClient.get(`/colleges/${encodeURIComponent(id)}`, {
    params: buildQuery(query as Record<string, unknown>),
  });
  return normalizeSingleResponse<CollegeRecord>(response, 'college');
}

/** POST /colleges */
export async function createCollege(data: {
  name: string;
  code: string;
  description?: string;
  dean_id?: string;
  establishedYear?: number;
}): Promise<CollegeRecord> {
  const response = await apiClient.post('/colleges', data);
  return normalizeSingleResponse<CollegeRecord>(response, 'college');
}

/** PATCH /colleges/:id */
export async function updateCollege(
  id: string,
  data: {
    name?: string;
    description?: string;
    dean_id?: string | null;
    establishedYear?: number;
  }
): Promise<CollegeRecord> {
  const response = await apiClient.patch(`/colleges/${encodeURIComponent(id)}`, data);
  return normalizeSingleResponse<CollegeRecord>(response, 'college');
}

/** PATCH /colleges/:id/archive — 204 */
export async function archiveCollege(id: string): Promise<void> {
  await apiClient.patch(`/colleges/${encodeURIComponent(id)}/archive`);
}

/** PATCH /colleges/:id/restore */
export async function restoreCollege(id: string): Promise<CollegeRecord> {
  const response = await apiClient.patch(`/colleges/${encodeURIComponent(id)}/restore`);
  return normalizeSingleResponse<CollegeRecord>(response, 'college');
}

/** GET /colleges/:id/departments — UA only */
export async function getCollegeDepartments(
  collegeId: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: string;
    fields?: string;
    isArchived?: 'true' | 'false' | 'all';
  }
): Promise<Phase1ListResult<Record<string, unknown>>> {
  const response = await apiClient.get(`/colleges/${encodeURIComponent(collegeId)}/departments`, {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<Record<string, unknown>>(response, 'departments');
}

/** GET /colleges/:id/locations — UA only */
export async function getCollegeLocations(
  collegeId: string,
  params?: {
    type?: string;
    status?: string;
    isArchived?: 'true' | 'false' | 'all';
    page?: number;
    limit?: number;
  }
): Promise<Phase1ListResult<Record<string, unknown>>> {
  const response = await apiClient.get(`/colleges/${encodeURIComponent(collegeId)}/locations`, {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<Record<string, unknown>>(response, 'locations');
}

/** GET /colleges/:id/departments/:deptId — UA only */
export async function getCollegeDepartment(
  collegeId: string,
  deptId: string,
  query?: { isArchived?: 'true' }
): Promise<Record<string, unknown>> {
  const response = await apiClient.get(
    `/colleges/${encodeURIComponent(collegeId)}/departments/${encodeURIComponent(deptId)}`,
    { params: buildQuery(query as Record<string, unknown>) }
  );
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}

/** GET /colleges/:id/locations/:locId — UA only */
export async function getCollegeLocation(collegeId: string, locId: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get(
    `/colleges/${encodeURIComponent(collegeId)}/locations/${encodeURIComponent(locId)}`
  );
  return normalizeSingleResponse<Record<string, unknown>>(response, 'location');
}
