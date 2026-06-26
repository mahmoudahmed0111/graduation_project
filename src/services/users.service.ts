import { apiClient } from '@/lib/http/client';
import { buildQuery, type UserListQueryParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type { Phase2ApiUser } from '@/types/phase2-user';

export type { UserListQueryParams };

export async function getUsers(params?: UserListQueryParams): Promise<Phase1ListResult<Phase2ApiUser>> {
  const response = await apiClient.get('/users', { params: buildQuery(params as Record<string, unknown>) });
  return normalizeListResponse<Phase2ApiUser>(response, 'users');
}

export async function getUser(id: string): Promise<Phase2ApiUser> {
  const response = await apiClient.get(`/users/${encodeURIComponent(id)}`);
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

export async function getMe(): Promise<Phase2ApiUser> {
  const response = await apiClient.get('/users/me');
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

export async function lookupUser(nationalID: string): Promise<Phase2ApiUser> {
  const response = await apiClient.post('/users/lookup', { nationalID });
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

export async function createUser(formData: FormData): Promise<Phase2ApiUser> {
  const response = await apiClient.post('/users', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

/** Per-row failure reason — backends commonly return these under `errors`/`failures`/`details`. */
export interface BulkImportRowError {
  row?: number;
  email?: string;
  nationalID?: string;
  message?: string;
  reason?: string;
  error?: string;
}

export interface BulkImportResult {
  created: number;
  failed: number;
  /** BulkImportLog id — feed to `resendCredentials` to retry failed email deliveries. */
  log?: { id?: string };
  /** Per-row reasons when rows are rejected (shape varies by backend). */
  errors?: BulkImportRowError[];
}

/** Pull a per-row error array out of the response under any of the common key names. */
function extractRowErrors(data: Record<string, unknown> | undefined): BulkImportRowError[] | undefined {
  if (!data) return undefined;
  for (const key of ['errors', 'failures', 'failed', 'details', 'invalidRows', 'rows']) {
    const v = data[key];
    if (Array.isArray(v) && v.length && typeof v[0] === 'object') return v as BulkImportRowError[];
  }
  return undefined;
}

/** `POST /users/bulk-import` — multipart `.xlsx`/`.csv` (≤2MB, ≤500 rows). Role comes from the file. */
export async function bulkImportUsers(formData: FormData): Promise<BulkImportResult> {
  const response = await apiClient.post('/users/bulk-import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = (response.data?.data ?? {}) as Record<string, unknown>;
  return {
    created: Number(data.created ?? 0),
    failed: Number(data.failed ?? 0),
    log: data.log as BulkImportResult['log'],
    errors: extractRowErrors(data),
  };
}

export interface ResendCredentialsResult {
  sent: number;
  failed: number;
  total: number;
}

/** `PATCH /users/resend-credentials` — retry temp-password emails that failed during bulk import. */
export async function resendCredentials(logId: string): Promise<ResendCredentialsResult> {
  const response = await apiClient.patch('/users/resend-credentials', { logId });
  return (response.data?.data ?? { sent: 0, failed: 0, total: 0 }) as ResendCredentialsResult;
}

export async function updateUser(id: string, formData: FormData): Promise<Phase2ApiUser> {
  const response = await apiClient.patch(`/users/${encodeURIComponent(id)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

/** 204 No Content */
export async function deactivateUser(id: string): Promise<void> {
  await apiClient.patch(`/users/${encodeURIComponent(id)}/deactivate`);
}

export async function restoreUser(id: string): Promise<Phase2ApiUser> {
  const response = await apiClient.patch(`/users/${encodeURIComponent(id)}/restore`);
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

/** 204 No Content */
export async function unlockUser(id: string): Promise<void> {
  await apiClient.patch(`/users/${encodeURIComponent(id)}/unlock`);
}

/** 204 No Content */
export async function forceLogoutUser(id: string): Promise<void> {
  await apiClient.patch(`/users/${encodeURIComponent(id)}/force-logout`);
}

export async function resetPassword(id: string): Promise<{ message: string }> {
  const response = await apiClient.patch<{ status?: string; message?: string }>(
    `/users/${encodeURIComponent(id)}/reset-password`
  );
  return { message: response.data?.message ?? 'Temporary password sent to user email.' };
}

export async function updateUserRole(id: string, role: string): Promise<Phase2ApiUser> {
  const response = await apiClient.patch(`/users/${encodeURIComponent(id)}/role`, { role });
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

export async function assignRFID(id: string, rfidTag: string): Promise<Phase2ApiUser> {
  const response = await apiClient.patch(`/users/${encodeURIComponent(id)}/assign-rfid`, { rfidTag });
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

export async function graduateUser(id: string): Promise<Phase2ApiUser> {
  const response = await apiClient.patch(`/users/${encodeURIComponent(id)}/graduate`);
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}
