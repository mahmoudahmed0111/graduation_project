import { apiClient } from '@/lib/http/client';
import { normalizeSingleResponse } from '@/lib/http/normalize';

/** GET /settings */
export async function getSettings(): Promise<Record<string, unknown>> {
  const response = await apiClient.get('/settings');
  return normalizeSingleResponse<Record<string, unknown>>(response, 'settings');
}

/** PATCH /settings */
export async function updateSettings(data: {
  currentAcademicYear?: string;
  currentSemester?: 'fall' | 'spring';
  isEnrollmentOpen?: boolean;
  gradePoints?: Record<string, number>;
  defaultCreditLimit?: {
    good_standing?: number;
    probation?: number;
    honors?: number;
  };
}): Promise<Record<string, unknown>> {
  const response = await apiClient.patch('/settings', data);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'settings');
}
