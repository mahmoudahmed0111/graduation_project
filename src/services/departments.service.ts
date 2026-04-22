import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/http/client';
import { buildQuery, type ListQueryParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export interface GetDepartmentsParams extends ListQueryParams {
  search?: string;
  college_id?: string;
  isArchived?: 'true' | 'false' | 'all';
}

/**
 * GET /api/v1/departments — Phase 1 Module 2 (`phase1_api_docs.md`).
 * Query: `college_id` (UA), `isArchived`, plus list `page` / `limit` / `sort`.
 */
export async function getDepartments(params?: GetDepartmentsParams): Promise<Phase1ListResult<Record<string, unknown>>> {
  const response = await apiClient.get('/departments', { params: buildQuery(params as Record<string, unknown>) });
  return normalizeListResponse<Record<string, unknown>>(response, 'departments');
}

/** GET /api/v1/departments/:id — optional `?isArchived=true` for archived rows. */
export async function getDepartment(id: string, query?: { isArchived?: 'true' }): Promise<Record<string, unknown>> {
  const response = await apiClient.get(`/departments/${encodeURIComponent(id)}`, {
    params: buildQuery(query as Record<string, unknown>),
  });
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}

/** Detail: retry with `?isArchived=true` on 404 (archived department). */
export async function getDepartmentResolvingArchived(id: string): Promise<Record<string, unknown>> {
  try {
    return await getDepartment(id);
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) {
      return await getDepartment(id, { isArchived: 'true' });
    }
    throw e;
  }
}

/** POST /api/v1/departments */
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

/** PATCH /api/v1/departments/:id */
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

/** PATCH /api/v1/departments/:id/archive — 204 */
export async function archiveDepartment(id: string): Promise<void> {
  await apiClient.patch(`/departments/${encodeURIComponent(id)}/archive`);
}

/** PATCH /api/v1/departments/:id/restore */
export async function restoreDepartment(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.patch(`/departments/${encodeURIComponent(id)}/restore`);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'department');
}
