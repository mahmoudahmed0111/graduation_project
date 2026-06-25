import { apiClient } from '@/lib/http/client';
import { normalizeSingleResponse } from '@/lib/http/normalize';
import { semesterUiToApi } from '@/lib/mapSystemSettings';
import type { ChatTokenBudgets } from '@/types';

/**
 * Phase 1 Module 3 — `phase1_api_docs.md`
 * Base: `GET /api/v1/settings` — singleton; all authenticated.
 */
export async function getSettings(): Promise<Record<string, unknown>> {
  const response = await apiClient.get('/settings');
  return normalizeSingleResponse<Record<string, unknown>>(response, 'settings');
}

/**
 * Phase 1 Module 3 — `PATCH /api/v1/settings` — UA only; body fields all optional.
 *
 * Phase 7 extends the same endpoint with AI Chat engine settings (history limit,
 * context/summarization limits, and per-role monthly token budgets). All fields
 * remain optional so existing partial-update callers stay backward compatible.
 */
export async function updateSettings(data: {
  currentAcademicYear?: string;
  currentSemester?: 'fall' | 'spring';
  isEnrollmentOpen?: boolean;
  // Postman Update Settings fields
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
  maxEnrollmentsPerStudent?: number;
  gradePoints?: Record<string, number>;
  defaultCreditLimit?: {
    good_standing?: number;
    probation?: number;
    honors?: number;
  };
  // Phase 7 — AI Chat settings
  chatHistoryLimit?: number;
  chatMaxContextTokens?: number;
  chatMaxSummarizationCycles?: number;
  chatTokenBudgets?: Partial<ChatTokenBudgets>;
}): Promise<Record<string, unknown>> {
  const { currentSemester, enrollmentStartDate, enrollmentEndDate, chatTokenBudgets, ...rest } = data;
  const body: Record<string, unknown> = { ...rest };
  if (currentSemester !== undefined) {
    body.currentSemester = semesterUiToApi(currentSemester);
  }
  // Omit empty date strings — the API rejects "" as an invalid ISO date.
  if (enrollmentStartDate) body.enrollmentStartDate = enrollmentStartDate;
  if (enrollmentEndDate) body.enrollmentEndDate = enrollmentEndDate;
  // The backend stores per-role chat budgets under `chatTokenLimitByRole`
  // (the UI/type name is `chatTokenBudgets`); sending the UI name is silently
  // dropped, so map it to the real schema field here.
  if (chatTokenBudgets !== undefined) body.chatTokenLimitByRole = chatTokenBudgets;
  const response = await apiClient.patch('/settings', body);
  return normalizeSingleResponse<Record<string, unknown>>(response, 'settings');
}
