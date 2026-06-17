/**
 * Phase 5 — Fingerprint Attendance & IoT Integration (frontend contracts).
 * Mirrors `phase5_api_doc.md`. Only the frontend-facing shapes are modelled;
 * the IoT device endpoints (fingerprint-mark, heartbeat, register) are called
 * by ESP32 hardware via `x-device-secret`, not by this app.
 */

/** A reference field that the backend may return as an id string or a
 *  populated sub-document (e.g. `location_id`, `student_id`, `initiatedBy_id`). */
export type PopulatedRef =
  | string
  | {
      _id: string;
      name?: string;
      email?: string;
      building?: string;
      roomNumber?: string;
      [key: string]: unknown;
    };

export type TemplateLoadStatus = 'loaded' | 'qr_fallback';
export type SessionStatus = 'active' | 'ended';
export type AttendanceSource = 'fingerprint' | 'qr' | 'manual_override';

export interface AttendanceSession {
  _id: string;
  courseOffering_id: PopulatedRef;
  location_id: PopulatedRef | null;
  initiatedBy_id: PopulatedRef;
  college_id: string;
  deviceId?: string;
  sessionNonce?: string;
  templateBatchId?: string;
  status: SessionStatus;
  templateLoadStatus: TemplateLoadStatus;
  templatesLoadedCount: number;
  qrFallbackEnabled: boolean;
  qrFallbackToken: string | null;
  qrTokenExpiresAt: string | null;
  previousQrFallbackToken?: string | null;
  previousQrTokenExpiresAt?: string | null;
  originalLocation_id?: string | null;
  hallSwitchReason?: string | null;
  expiresAt: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Normalized result of `POST /attendance/sessions`, which can succeed (201),
 *  be idempotent (200 + alreadyActive), or conflict (409 + conflictingSession). */
export interface CreateSessionResult {
  outcome: 'created' | 'alreadyActive' | 'conflict';
  session?: AttendanceSession;
  studentsWithoutFingerprint?: number;
  templateLoadStatus?: TemplateLoadStatus;
  qrFallbackEnabled?: boolean;
  conflictingSession?: AttendanceSession;
}

export interface CreateSessionBody {
  courseOffering_id: string;
  location_id?: string;
  forceHallSwitch?: boolean;
  hallSwitchReason?: string;
  durationMinutes?: number;
}

export interface AttendanceRecord {
  _id: string;
  session_id: string;
  student_id: PopulatedRef;
  source: AttendanceSource;
  deviceId?: string;
  confidence?: number;
  overrideReason?: string;
  overrideBy?: PopulatedRef;
  scannedAt?: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AbsentStudent {
  _id: string;
  name?: string;
  email?: string;
}

export interface SessionReport {
  session: Partial<AttendanceSession> & { startTime?: string; endedAt?: string };
  present: AttendanceRecord[];
  absent: AbsentStudent[];
  summary: { total: number; present: number; absent: number; attendanceRate: number };
}

export interface MyAttendance {
  records: AttendanceRecord[];
  summary: { attended: number; total: number; percentage: number; attendanceGrade: number };
}

export interface QrTokenResponse {
  qrToken: string;
  expiresIn: number;
  graceSeconds?: number;
}

export interface EnableQrResult {
  session: AttendanceSession;
  qrToken: string;
  expiresIn: number;
}

/** Result of a QR or manual mark — backend returns success or idempotent dup. */
export interface MarkResult {
  success?: boolean;
  alreadyMarked?: boolean;
  record?: AttendanceRecord;
}

export interface FingerprintTemplate {
  _id: string;
  student_id: PopulatedRef;
  quality?: number;
  enrolledViaDevice?: string;
  enrolledBy?: PopulatedRef;
  college_id?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollModeResult {
  message: string;
  deviceId: string;
  expiresIn: number;
}

export interface CheckFingerprintResult {
  enrolled: boolean;
  template?: FingerprintTemplate | null;
}

/** The JSON payload encoded into the doctor's QR code and read by the student
 *  scanner. We control both ends, so the shape is ours to define. */
export interface QrPayload {
  sessionId: string;
  qrToken: string;
}

/** Encode the QR shown on the instructor screen (JSON, scanned by students). */
export function buildQrPayload(sessionId: string, qrToken: string): string {
  return JSON.stringify({ sessionId, qrToken });
}

/** Parse a scanned/pasted attendance code. Accepts our JSON payload, a
 *  `sessionId|qrToken` string, or a URL carrying both as query params. */
export function parseQrPayload(text: string): QrPayload | null {
  const t = (text ?? '').trim();
  if (!t) return null;
  try {
    if (t.startsWith('{')) {
      const o = JSON.parse(t) as Record<string, unknown>;
      if (o.sessionId && o.qrToken) return { sessionId: String(o.sessionId), qrToken: String(o.qrToken) };
    }
  } catch {
    /* not JSON — fall through */
  }
  if (t.includes('|')) {
    const [sessionId, qrToken] = t.split('|');
    if (sessionId && qrToken) return { sessionId: sessionId.trim(), qrToken: qrToken.trim() };
  }
  try {
    const url = new URL(t);
    const sessionId = url.searchParams.get('sessionId');
    const qrToken = url.searchParams.get('qrToken');
    if (sessionId && qrToken) return { sessionId, qrToken };
  } catch {
    /* not a URL */
  }
  return null;
}

/** Helper: read an id from a possibly-populated ref. */
export function refId(ref: PopulatedRef | null | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref._id;
}

/** Helper: read a display name from a possibly-populated ref. */
export function refName(ref: PopulatedRef | null | undefined): string | undefined {
  if (!ref || typeof ref === 'string') return undefined;
  return ref.name;
}
