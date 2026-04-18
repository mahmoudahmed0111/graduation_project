import { apiClient } from '@/lib/http/client';
import { buildQuery, type ListQueryParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';

export interface GetLocationsParams extends ListQueryParams {
  type?: string;
  status?: string;
  isArchived?: 'true' | 'false' | 'all';
}

/** GET /locations */
export async function getLocations(params?: GetLocationsParams): Promise<Phase1ListResult<Record<string, unknown>>> {
  const response = await apiClient.get('/locations', { params: buildQuery(params as Record<string, unknown>) });
  return normalizeListResponse<Record<string, unknown>>(response, 'locations');
}

/** GET /locations/:id */
export async function getLocation(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.get(`/locations/${encodeURIComponent(id)}`);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'location');
}

/** POST /locations */
export async function createLocation(data: {
  name: string;
  college_id?: string;
  capacity: number;
  type: 'lecture_hall' | 'lab' | 'section_room' | 'auditorium';
  building?: string;
  floor?: number;
  roomNumber?: string;
  readerId?: string;
}): Promise<Record<string, unknown>> {
  const body: Record<string, unknown> = {
    name: data.name,
    capacity: data.capacity,
    type: data.type,
  };
  if (data.college_id) body.college_id = data.college_id;
  if (data.building !== undefined && data.building !== '') body.building = data.building;
  if (data.floor !== undefined) body.floor = data.floor;
  if (data.roomNumber !== undefined && data.roomNumber !== '') body.roomNumber = data.roomNumber;
  if (data.readerId !== undefined && data.readerId !== '') body.readerId = data.readerId;
  const response = await apiClient.post('/locations', body);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'location');
}

/** PATCH /locations/:id */
export async function updateLocation(
  id: string,
  data: Partial<{
    name: string;
    building: string;
    floor: number;
    roomNumber: string;
    capacity: number;
    type: 'lecture_hall' | 'lab' | 'section_room' | 'auditorium';
    readerId: string;
  }>
): Promise<Record<string, unknown>> {
  const response = await apiClient.patch(`/locations/${encodeURIComponent(id)}`, data);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'location');
}

/** PATCH /locations/:id/status */
export async function updateLocationStatus(
  id: string,
  status: 'active' | 'maintenance'
): Promise<Record<string, unknown>> {
  const response = await apiClient.patch(`/locations/${encodeURIComponent(id)}/status`, { status });
  return normalizeSingleResponse<Record<string, unknown>>(response, 'location');
}

/** PATCH /locations/:id/archive — 204 */
export async function archiveLocation(id: string): Promise<void> {
  await apiClient.patch(`/locations/${encodeURIComponent(id)}/archive`);
}

/** PATCH /locations/:id/restore */
export async function restoreLocation(id: string): Promise<Record<string, unknown>> {
  const response = await apiClient.patch(`/locations/${encodeURIComponent(id)}/restore`);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'location');
}
