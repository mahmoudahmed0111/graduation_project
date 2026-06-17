import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/http/client';
import { buildQuery } from '@/lib/http/buildQuery';
import { normalizeListResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type {
  AttendanceSession,
  CreateSessionBody,
  CreateSessionResult,
  EnableQrResult,
  QrTokenResponse,
  SessionReport,
  MyAttendance,
  MarkResult,
  AttendanceRecord,
  FingerprintTemplate,
  EnrollModeResult,
  CheckFingerprintResult,
} from '@/types/phase5';

const SESSIONS = '/attendance/sessions';
const ATT = '/attendance';
const FP = '/attendance/fingerprints';

// ─── Session Management (DR, TA, CA) ──────────────────────────────────────

export interface SessionListParams {
  courseOffering_id: string;
  active?: 'true' | 'false';
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listSessions(
  params: SessionListParams
): Promise<Phase1ListResult<AttendanceSession>> {
  const response = await apiClient.get(SESSIONS, { params: buildQuery(params as unknown as Record<string, unknown>) });
  return normalizeListResponse<AttendanceSession>(response, ['sessions']);
}

/** Create a session. Discriminates the 201 / 200-alreadyActive / 409-conflict
 *  responses into a single typed result so the UI can branch cleanly. */
export async function createSession(body: CreateSessionBody): Promise<CreateSessionResult> {
  try {
    const response = await apiClient.post(SESSIONS, body);
    const bag = (response.data as { data?: Record<string, unknown> }).data ?? {};
    return {
      outcome: bag.alreadyActive ? 'alreadyActive' : 'created',
      session: bag.session as AttendanceSession | undefined,
      studentsWithoutFingerprint: bag.studentsWithoutFingerprint as number | undefined,
      templateLoadStatus: bag.templateLoadStatus as CreateSessionResult['templateLoadStatus'],
      qrFallbackEnabled: bag.qrFallbackEnabled as boolean | undefined,
    };
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 409) {
      const bag = (err.response.data as { data?: Record<string, unknown>; conflictingSession?: unknown }) ?? {};
      const conflicting =
        (bag.data?.conflictingSession as AttendanceSession | undefined) ??
        (bag.conflictingSession as AttendanceSession | undefined);
      return { outcome: 'conflict', conflictingSession: conflicting };
    }
    throw err;
  }
}

export async function endSession(id: string, reason?: string): Promise<{ message: string; attendanceCount: number }> {
  const response = await apiClient.patch(`${SESSIONS}/${encodeURIComponent(id)}/end`, reason ? { reason } : {});
  const data = (response.data as { data?: { message?: string; attendanceCount?: number } }).data;
  return { message: data?.message ?? 'Session ended.', attendanceCount: data?.attendanceCount ?? 0 };
}

export async function enableQr(id: string): Promise<EnableQrResult> {
  const response = await apiClient.patch(`${SESSIONS}/${encodeURIComponent(id)}/enable-qr`);
  const data = (response.data as { data?: EnableQrResult }).data;
  return {
    session: data?.session as AttendanceSession,
    qrToken: data?.qrToken ?? '',
    expiresIn: data?.expiresIn ?? 30,
  };
}

export async function getQrToken(id: string): Promise<QrTokenResponse> {
  const response = await apiClient.get(`${SESSIONS}/${encodeURIComponent(id)}/qr-token`);
  const data = (response.data as { data?: QrTokenResponse }).data;
  return {
    qrToken: data?.qrToken ?? '',
    expiresIn: data?.expiresIn ?? 30,
    graceSeconds: data?.graceSeconds ?? 10,
  };
}

// ─── Attendance Marking ───────────────────────────────────────────────────

export async function qrMark(sessionId: string, qrToken: string): Promise<MarkResult> {
  const response = await apiClient.post(`${ATT}/qr-mark`, { sessionId, qrToken });
  return ((response.data as { data?: MarkResult }).data ?? {}) as MarkResult;
}

export async function getSessionReport(sessionId: string): Promise<SessionReport> {
  const response = await apiClient.get(`${SESSIONS}/${encodeURIComponent(sessionId)}/report`);
  const data = (response.data as { data?: SessionReport }).data;
  return {
    session: data?.session ?? {},
    present: data?.present ?? [],
    absent: data?.absent ?? [],
    summary: data?.summary ?? { total: 0, present: 0, absent: 0, attendanceRate: 0 },
  };
}

export async function getMyAttendance(courseOfferingId: string): Promise<MyAttendance> {
  const response = await apiClient.get(`${ATT}/my`, {
    params: { courseOffering_id: courseOfferingId },
  });
  const data = (response.data as { data?: MyAttendance }).data;
  return {
    records: data?.records ?? [],
    summary: data?.summary ?? { attended: 0, total: 0, percentage: 0, attendanceGrade: 0 },
  };
}

export async function overrideRecord(recordId: string, overrideReason: string): Promise<AttendanceRecord> {
  const response = await apiClient.patch(`${ATT}/records/${encodeURIComponent(recordId)}`, { overrideReason });
  return (response.data as { data?: { record?: AttendanceRecord } }).data?.record as AttendanceRecord;
}

export async function manualMark(
  sessionId: string,
  student_id: string,
  overrideReason: string
): Promise<AttendanceRecord> {
  const response = await apiClient.post(`${SESSIONS}/${encodeURIComponent(sessionId)}/manual-mark`, {
    student_id,
    overrideReason,
  });
  return (response.data as { data?: { record?: AttendanceRecord } }).data?.record as AttendanceRecord;
}

// ─── Fingerprint Enrollment (CA) ──────────────────────────────────────────

export async function enrollMode(studentId: string, deviceId?: string): Promise<EnrollModeResult> {
  const response = await apiClient.post(`${FP}/enroll-mode`, { studentId, ...(deviceId ? { deviceId } : {}) });
  const data = (response.data as { data?: EnrollModeResult }).data;
  return {
    message: data?.message ?? 'Enrollment mode activated.',
    deviceId: data?.deviceId ?? '',
    expiresIn: data?.expiresIn ?? 120,
  };
}

export interface FingerprintListParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export async function listFingerprints(
  params?: FingerprintListParams
): Promise<Phase1ListResult<FingerprintTemplate>> {
  const response = await apiClient.get(FP, { params: buildQuery(params as unknown as Record<string, unknown>) });
  return normalizeListResponse<FingerprintTemplate>(response, ['templates']);
}

export async function checkFingerprint(studentId: string): Promise<CheckFingerprintResult> {
  const response = await apiClient.get(`${FP}/student/${encodeURIComponent(studentId)}`);
  const data = (response.data as { data?: CheckFingerprintResult }).data;
  return { enrolled: Boolean(data?.enrolled), template: data?.template ?? null };
}

export async function deleteFingerprint(id: string): Promise<void> {
  await apiClient.delete(`${FP}/${encodeURIComponent(id)}`);
}
