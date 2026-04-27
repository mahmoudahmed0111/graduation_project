import type { EnrollmentStatus, ICourseCatalog, ICourseOffering, IEnrollment } from '@/types';

const STATUSES: EnrollmentStatus[] = ['enrolled', 'passed', 'failed', 'withdrawn'];

function refId(ref: unknown): string {
  if (ref == null) return '';
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object') {
    const o = ref as Record<string, unknown>;
    return String(o._id ?? o.id ?? '');
  }
  return '';
}

function asStatus(s: unknown): EnrollmentStatus {
  const v = String(s ?? '').toLowerCase();
  return (STATUSES.includes(v as EnrollmentStatus) ? v : 'enrolled') as EnrollmentStatus;
}

/**
 * Maps Phase 3 `Enrollment` documents (see `phase3_api_doc` Module 8) into the legacy `IEnrollment`
 * shape used by student UI (My Courses, transcript, enroll flow).
 */
export function mapPhase3EnrollmentToIEnrollment(raw: Record<string, unknown>): IEnrollment {
  const id = String(raw._id ?? raw.id ?? '');
  const offeringId = refId(raw.course_id);
  const catalogId = String(raw.catalogCourse_id ?? '');
  const snap =
    raw.snapshot && typeof raw.snapshot === 'object' ? (raw.snapshot as Record<string, unknown>) : {};
  const course: ICourseCatalog = {
    id: catalogId || offeringId || id,
    code: String(snap.courseCode ?? ''),
    title: String(snap.courseTitle ?? ''),
    creditHours: Number(snap.creditHours ?? 0) || 0,
    department: { id: '', name: '—' },
  };
  const gradesRaw = raw.grades;
  const grades =
    gradesRaw && typeof gradesRaw === 'object' ? (gradesRaw as IEnrollment['grades']) : undefined;

  const courseOffering: ICourseOffering = {
    id: offeringId || id,
    course,
    semester: String(raw.semester ?? ''),
    doctors: [],
    tas: [],
    schedule: [],
    maxSeats: 0,
    gradingPolicy: {},
  };

  return {
    id,
    student_id: refId(raw.student_id) || String(raw.student_id ?? ''),
    courseOffering,
    semester: String(raw.semester ?? courseOffering.semester ?? ''),
    status: asStatus(raw.status),
    finalAttendancePercentage:
      typeof raw.finalAttendancePercentage === 'number' ? raw.finalAttendancePercentage : undefined,
    grades,
    enrolledAt: String(raw.createdAt ?? raw.updatedAt ?? new Date().toISOString()),
  };
}
