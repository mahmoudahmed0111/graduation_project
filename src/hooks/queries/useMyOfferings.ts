import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourseOfferings } from '@/services/courseOfferings.service';
import { useAuthStore } from '@/store/authStore';

export interface MyOfferingSummary {
  id: string;
  semester?: string;
  academicYear?: string;
  courseCode?: string;
  courseTitle?: string;
  raw: Record<string, unknown>;
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function readId(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    return pickString(obj._id) ?? pickString(obj.id);
  }
  return undefined;
}

function listIds(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(readId).filter((s): s is string => typeof s === 'string');
}

function toSummary(offering: Record<string, unknown>): MyOfferingSummary {
  const id = pickString(offering._id) ?? pickString(offering.id) ?? '';
  const course = (offering.course_id ?? offering.course) as Record<string, unknown> | string | undefined;
  let courseCode: string | undefined;
  let courseTitle: string | undefined;
  if (course && typeof course === 'object') {
    courseCode = pickString((course as Record<string, unknown>).code);
    courseTitle = pickString((course as Record<string, unknown>).title);
  }
  return {
    id,
    semester: pickString(offering.semester),
    academicYear: pickString(offering.academicYear),
    courseCode,
    courseTitle,
    raw: offering,
  };
}

/**
 * Returns the offerings the current user is assigned to (DR/TA) or all
 * offerings in scope (CA/UA). Filters client-side by membership for staff
 * because the list endpoint doesn't expose a `doctor_id`/`ta_id` filter.
 */
export function useMyTeachingOfferings() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const query = useQuery({
    queryKey: ['phase4', 'my-offerings', role, user?.id],
    queryFn: () => getCourseOfferings({ limit: 200 }),
    enabled: Boolean(user?.id) && (role === 'doctor' || role === 'teacher' || role === 'ta' || role === 'collegeAdmin' || role === 'universityAdmin' || role === 'admin' || role === 'superAdmin'),
  });

  const offerings = useMemo<MyOfferingSummary[]>(() => {
    const items = query.data?.items ?? [];
    if (!user) return [];
    if (role === 'doctor' || role === 'teacher' || role === 'ta') {
      const me = user.id;
      return items
        .filter((raw) => {
          const o = raw as Record<string, unknown>;
          const docs = listIds(o.doctors_ids ?? o.doctors);
          const tas = listIds(o.tas_ids ?? o.tas);
          return docs.includes(me) || tas.includes(me);
        })
        .map((raw) => toSummary(raw as Record<string, unknown>));
    }
    return items.map((raw) => toSummary(raw as Record<string, unknown>));
  }, [query.data, role, user]);

  return { ...query, offerings };
}
