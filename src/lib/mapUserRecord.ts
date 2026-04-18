import type { IStudent } from '@/types';

/** Map Phase 2 `GET /users/:id` `user` object to `IStudent` for admin UI. */
export function mapUserRecordToStudent(u: Record<string, unknown>): IStudent {
  const college = u.college_id;
  const dept = u.department_id;
  const collegeObj =
    college && typeof college === 'object' && college !== null
      ? (college as Record<string, unknown>)
      : undefined;
  const deptObj =
    dept && typeof dept === 'object' && dept !== null ? (dept as Record<string, unknown>) : undefined;

  const level =
    typeof u.level === 'number' ? u.level : typeof u.year === 'number' ? u.year : 1;

  const rawStatus = u.academicStatus;
  let academicStatus: IStudent['academicStatus'] = 'good_standing';
  if (rawStatus === 'probation' || rawStatus === 'honors' || rawStatus === 'graduated' || rawStatus === 'good_standing') {
    academicStatus = rawStatus;
  } else if (rawStatus === 'active') {
    academicStatus = 'good_standing';
  }

  return {
    id: String(u._id ?? u.id ?? ''),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    role: 'student',
    universityId: String(u.universityId ?? ''),
    nationalId: String(u.realNationalID ?? u.nationalID ?? u.nationalId ?? ''),
    year: level,
    level: typeof u.level === 'number' ? u.level : undefined,
    semester: typeof u.semester === 'number' ? u.semester : 1,
    creditsEarned: typeof u.earnedCredits === 'number' ? u.earnedCredits : 0,
    gpa: typeof u.gpa === 'number' ? u.gpa : 0,
    phoneNumber: typeof u.phoneNumber === 'string' ? u.phoneNumber : undefined,
    department: deptObj
      ? {
          id: String(deptObj._id ?? deptObj.id ?? ''),
          name: String(deptObj.name ?? ''),
          code: String(deptObj.code ?? ''),
          college: collegeObj
            ? {
                id: String(collegeObj._id ?? collegeObj.id ?? ''),
                name: String(collegeObj.name ?? ''),
                code: String(collegeObj.code ?? ''),
              }
            : undefined,
        }
      : undefined,
    academicStatus,
  };
}
