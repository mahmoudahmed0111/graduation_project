import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as attendanceService from '@/services/attendance.service';
import type { SessionListParams, FingerprintListParams } from '@/services/attendance.service';
import type { CreateSessionBody } from '@/types/phase5';

const root = ['phase5', 'attendance'] as const;

export const sessionsQueryKey = (params: SessionListParams) => [...root, 'sessions', params] as const;
export const sessionReportQueryKey = (sessionId: string) => [...root, 'report', sessionId] as const;
export const qrTokenQueryKey = (sessionId: string) => [...root, 'qr-token', sessionId] as const;
export const myAttendanceQueryKey = (offeringId: string) => [...root, 'my', offeringId] as const;
export const fingerprintsQueryKey = (params?: FingerprintListParams) => [...root, 'fingerprints', params ?? {}] as const;
export const checkFingerprintQueryKey = (studentId: string) => [...root, 'fingerprints', 'student', studentId] as const;

// ─── Sessions ─────────────────────────────────────────────────────────────

export function useSessions(params: SessionListParams, enabled = true) {
  return useQuery({
    queryKey: sessionsQueryKey(params),
    queryFn: () => attendanceService.listSessions(params),
    enabled: enabled && Boolean(params.courseOffering_id),
    refetchInterval: params.active === 'true' ? 15_000 : false,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSessionBody) => attendanceService.createSession(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'sessions'] }),
  });
}

export function useEndSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => attendanceService.endSession(id, reason),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'sessions'] }),
  });
}

export function useEnableQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.enableQr(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'sessions'] }),
  });
}

/** Polls the rotating QR token. Disable when QR fallback isn't active. */
export function useQrToken(sessionId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: qrTokenQueryKey(sessionId ?? ''),
    queryFn: () => attendanceService.getQrToken(sessionId!),
    enabled: enabled && Boolean(sessionId),
    refetchInterval: 25_000, // TTL 30s − safety margin
    refetchIntervalInBackground: false,
  });
}

// ─── Reports & marking ──────────────────────────────────────────────────

export function useSessionReport(sessionId: string | undefined, live = false) {
  return useQuery({
    queryKey: sessionReportQueryKey(sessionId ?? ''),
    queryFn: () => attendanceService.getSessionReport(sessionId!),
    enabled: Boolean(sessionId),
    refetchInterval: live ? 10_000 : false,
  });
}

export function useMyAttendance(offeringId: string | undefined) {
  return useQuery({
    queryKey: myAttendanceQueryKey(offeringId ?? ''),
    queryFn: () => attendanceService.getMyAttendance(offeringId!),
    enabled: Boolean(offeringId),
    retry: false,
  });
}

export function useManualMark(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, reason }: { studentId: string; reason: string }) =>
      attendanceService.manualMark(sessionId, studentId, reason),
    onSuccess: () => void qc.invalidateQueries({ queryKey: sessionReportQueryKey(sessionId) }),
  });
}

export function useOverrideRecord(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      attendanceService.overrideRecord(recordId, reason),
    onSuccess: () => void qc.invalidateQueries({ queryKey: sessionReportQueryKey(sessionId) }),
  });
}

export function useQrMark() {
  return useMutation({
    mutationFn: ({ sessionId, qrToken }: { sessionId: string; qrToken: string }) =>
      attendanceService.qrMark(sessionId, qrToken),
  });
}

// ─── Fingerprint enrollment (CA) ─────────────────────────────────────────

export function useFingerprintTemplates(params?: FingerprintListParams) {
  return useQuery({
    queryKey: fingerprintsQueryKey(params),
    queryFn: () => attendanceService.listFingerprints(params),
  });
}

export function useCheckFingerprint(studentId: string | undefined) {
  return useQuery({
    queryKey: checkFingerprintQueryKey(studentId ?? ''),
    queryFn: () => attendanceService.checkFingerprint(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useEnrollMode() {
  return useMutation({
    mutationFn: ({ studentId, deviceId }: { studentId: string; deviceId?: string }) =>
      attendanceService.enrollMode(studentId, deviceId),
  });
}

export function useDeleteFingerprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attendanceService.deleteFingerprint(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'fingerprints'] }),
  });
}
