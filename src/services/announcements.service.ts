import { apiClient } from '@/lib/http/client';
import { buildQuery } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type { Announcement, CreateAnnouncementBody } from '@/types/phase6';

const BASE = '/announcements';

export interface AnnouncementListParams {
  sort?: string;
  fields?: string;
  page?: number;
  limit?: number;
  /** Admin-only: 'true' | 'false' | 'all' (stripped server-side for non-admins). */
  isArchived?: 'true' | 'false' | 'all';
}

export async function listAnnouncements(
  params?: AnnouncementListParams
): Promise<Phase1ListResult<Announcement>> {
  const response = await apiClient.get(BASE, {
    params: buildQuery(params as unknown as Record<string, unknown>),
  });
  const list = normalizeListResponse<Announcement>(response, ['announcements']);
  // Phase 6 envelope uses `total`/`page`/`limit` (not totalResults/currentPage).
  const body = response.data as { total?: number; page?: number; limit?: number };
  const total = body.total ?? list.totalResults;
  const limit = body.limit ?? params?.limit ?? 25;
  const page = body.page ?? params?.page ?? 1;
  return {
    ...list,
    totalResults: total,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  const response = await apiClient.get(`${BASE}/${encodeURIComponent(id)}`);
  return normalizeSingleResponse<Announcement>(response, ['announcement']);
}

export async function createAnnouncement(body: CreateAnnouncementBody): Promise<Announcement> {
  const response = await apiClient.post(BASE, body);
  return normalizeSingleResponse<Announcement>(response, ['announcement']);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${encodeURIComponent(id)}`);
}
