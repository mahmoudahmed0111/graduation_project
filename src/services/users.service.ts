import { apiClient } from '@/lib/http/client';
import { buildQuery, type UserListQueryParams } from '@/lib/http/buildQuery';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type {
  BulkActionsResult,
  BulkImportUsersResult,
  Phase2ApiUser,
  Phase2BulkAction,
} from '@/types/phase2-user';

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

export async function bulkImportUsers(file: File, college_id?: string): Promise<BulkImportUsersResult> {
  const fd = new FormData();
  fd.append('file', file);
  if (college_id) fd.append('college_id', college_id);
  const response = await apiClient.post('/users/bulk-import', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const bag = response.data?.data as
    | { created?: number; failed?: number; log?: { id?: string; _id?: string } }
    | undefined;
  const log = bag?.log;
  const logId = log && typeof log === 'object' ? String(log.id ?? log._id ?? '') : undefined;
  return {
    created: bag?.created ?? 0,
    failed: bag?.failed ?? 0,
    logId: logId || undefined,
  };
}

export async function updateUser(id: string, formData: FormData): Promise<Phase2ApiUser> {
  const response = await apiClient.patch(`/users/${encodeURIComponent(id)}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeSingleResponse<Phase2ApiUser>(response, 'user');
}

export async function bulkActions(body: {
  action: Phase2BulkAction;
  userIds: string[];
  payload?: { departmentId?: string };
}): Promise<BulkActionsResult> {
  const response = await apiClient.patch('/users/bulk-actions', body);
  const data = response.data?.data as BulkActionsResult;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid bulk-actions response');
  }
  return data;
}

export async function allocateUsers(body: {
  targetDepartmentId: string;
  studentIds: string[];
}): Promise<{ matchedCount: number; modifiedCount: number; message?: string }> {
  const response = await apiClient.patch('/users/allocate', body);
  const data = response.data?.data as { matchedCount?: number; modifiedCount?: number } | undefined;
  const message =
    response.data && typeof response.data === 'object' && 'message' in response.data
      ? String((response.data as { message?: string }).message ?? '')
      : '';
  return {
    matchedCount: data?.matchedCount ?? 0,
    modifiedCount: data?.modifiedCount ?? 0,
    message: message || undefined,
  };
}

export async function resendCredentials(logId: string): Promise<{
  message: string;
  sent?: number;
  failed?: number;
  total?: number;
}> {
  const response = await apiClient.patch('/users/resend-credentials', { logId });
  const root = response.data as { message?: string; data?: { sent?: number; failed?: number; total?: number } };
  return {
    message: root?.message ?? 'Credentials resent.',
    sent: root?.data?.sent,
    failed: root?.data?.failed,
    total: root?.data?.total,
  };
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
