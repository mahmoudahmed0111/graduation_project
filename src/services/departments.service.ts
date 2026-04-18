import { apiClient } from '@/lib/http/client';
import { buildQuery, type ListQueryParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export interface GetDepartmentsParams extends ListQueryParams {
  search?: string;
  college_id?: string;
  isArchived?: 'true' | 'false' | 'all';
}

/** GET /departments */
export async function getDepartments(params?: GetDepartmentsParams): Promise<Phase1ListResult<Record<string, unknown>>> {
  const response = await apiClient.get('/departments', { params: buildQuery(params as Record<string, unknown>) });
  return normalizeListResponse<Record<string, unknown>>(response, 'departments');
}

/** GET /departments/:id */
export async function getDepartment(id: string, query?: { isArchived?: 'true' }): Promise<Record<string, unknown>> {
  const response = await apiClient.get(`/departments/${encodeURIComponent(id)}`, {
    params: buildQuery(query as Record<string, unknown>),
  });
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}

/** POST /departments */
export async function createDepartment(data: {
  name: string;
  code: string;
  description?: string;
  college_id?: string;
  head_id?: string;
}): Promise<Record<string, unknown>> {
  const response = await apiClient.post('/departments', data);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}

/** PATCH /departments/:id */
export async function updateDepartment(
  id: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    head_id?: string | null;
  }
): Promise<Record<string, unknown>> {
  const response = await apiClient.patch(`/departments/${encodeURIComponent(id)}`, data);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}

/** PATCH /departments/:id/archive — 204 */
export async function archiveDepartment(id: string): Promise<void> {
  await apiClient.patch(`/departments/${encodeURIComponent(id)}/archive`);
}

/** PATCH /departments/:id/restore */
export async function restoreDepartment(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.patch(`/departments/${encodeURIComponent(id)}/restore`);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}
