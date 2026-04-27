/** URL segments under `/dashboard/users/*` for Phase 2 user lists. */
export type UserListSegment = 'students' | 'doctors' | 'tas' | 'admins';

const PATH: Record<UserListSegment, string> = {
  students: '/dashboard/users/students',
  doctors: '/dashboard/users/doctors',
  tas: '/dashboard/users/tas',
  admins: '/dashboard/users/admins',
};

export function listPathForSegment(segment: UserListSegment): string {
  return PATH[segment];
}

/** `GET /users` single-role filter value for the segment (admins use subtype). */
export function apiRoleForSegment(
  segment: UserListSegment,
  adminSubtype: 'universityAdmin' | 'collegeAdmin'
): string {
  if (segment === 'students') return 'student';
  if (segment === 'doctors') return 'doctor';
  if (segment === 'tas') return 'ta';
  return adminSubtype;
}

export function segmentForPhase2Role(role: string): UserListSegment {
  if (role === 'student') return 'students';
  if (role === 'doctor') return 'doctors';
  if (role === 'ta') return 'tas';
  if (role === 'universityAdmin' || role === 'collegeAdmin') return 'admins';
  return 'students';
}

export function listPathForPhase2Role(role: string): string {
  return listPathForSegment(segmentForPhase2Role(role));
}

export function detailPathForPhase2Role(role: string, id: string): string {
  return `${listPathForPhase2Role(role)}/${encodeURIComponent(id)}`;
}

/** Breadcrumb label for the list that owns this role (detail / create back links). */
export function listPageLabelForRole(role: string): string {
  const s = segmentForPhase2Role(role);
  if (s === 'students') return 'Students';
  if (s === 'doctors') return 'Doctors';
  if (s === 'tas') return 'Teaching assistants';
  return 'Administrators';
}
