import { apiClient } from '@/lib/http/client';
import { buildQuery, type CourseCatalogListParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export type { CourseCatalogListParams };

export type CourseCatalogRecord = Record<string, unknown>;

export async function getCourseCatalogs(
  params?: CourseCatalogListParams
): Promise<Phase1ListResult<CourseCatalogRecord>> {
  const response = await apiClient.get('/course-catalog', {
    params: buildQuery(params as Record<string, unknown>),
  });
  return normalizeListResponse<CourseCatalogRecord>(response, 'courseCatalogs');
}

export async function getCourseCatalog(id: string): Promise<CourseCatalogRecord> {
  const response = await apiClient.get(`/course-catalog/${encodeURIComponent(id)}`);
  return normalizeSingleResponse<CourseCatalogRecord>(response, 'courseCatalog');
}

export async function createCourseCatalog(data: {
  title: string;
  code: string;
  description?: string;
  creditHours: number;
  department_id: string;
  prerequisites_ids?: string[];
}): Promise<CourseCatalogRecord> {
  const response = await apiClient.post('/course-catalog', data);
  return normalizeSingleResponse<CourseCatalogRecord>(response, 'courseCatalog');
}

export async function updateCourseCatalog(
  id: string,
  data: {
    title?: string;
    description?: string;
    creditHours?: number;
    prerequisites_ids?: string[];
  }
): Promise<CourseCatalogRecord> {
  const response = await apiClient.patch(`/course-catalog/${encodeURIComponent(id)}`, data);
  return normalizeSingleResponse<CourseCatalogRecord>(response, 'courseCatalog');
}

export async function archiveCourseCatalog(id: string): Promise<CourseCatalogRecord> {
  const response = await apiClient.patch(`/course-catalog/${encodeURIComponent(id)}/archive`);
  return normalizeSingleResponse<CourseCatalogRecord>(response, 'courseCatalog');
}

export async function restoreCourseCatalog(id: string): Promise<CourseCatalogRecord> {
  const response = await apiClient.patch(`/course-catalog/${encodeURIComponent(id)}/restore`);
  return normalizeSingleResponse<CourseCatalogRecord>(response, 'courseCatalog');
}
