import type { Phase2ApiUser } from '@/types/phase2-user';

export function phase2RefLabel(ref: Phase2ApiUser['college_id'] | Phase2ApiUser['department_id']): string {
  if (ref == null || ref === '') return '—';
  if (typeof ref === 'object' && ref !== null) {
    const o = ref as { name?: string; title?: string };
    const s = o.name ?? o.title;
    if (s != null && String(s).trim()) return String(s).trim();
  }
  return typeof ref === 'string' ? ref : '—';
}

const OBJECT_ID_HEX = /^[a-f\d]{24}$/i;

/** Human-readable department for tables when `department_id` is an id or sparsely populated. */
export function phase2DepartmentDisplayName(
  u: Phase2ApiUser,
  idToLabel: Map<string, string>
): string {
  const ref = u.department_id;
  const fromRef = phase2RefLabel(ref);
  if (fromRef !== '—' && !OBJECT_ID_HEX.test(fromRef)) return fromRef;

  const id = phase2DepartmentId(u) ?? (typeof ref === 'string' ? ref.trim() : '');
  if (id && idToLabel.has(id)) return idToLabel.get(id)!;

  if (id && OBJECT_ID_HEX.test(id)) return '—';
  return fromRef;
}

export function phase2UserIsActive(u: Phase2ApiUser): boolean {
  return u.active !== false;
}

export function phase2UserId(u: Phase2ApiUser): string {
  return String(u._id);
}

export function phase2CollegeId(u: Phase2ApiUser): string | undefined {
  const c = u.college_id;
  if (!c) return undefined;
  if (typeof c === 'string') return c;
  if (typeof c === 'object' && '_id' in c) return String((c as { _id: unknown })._id);
  return undefined;
}

export function phase2DepartmentId(u: Phase2ApiUser): string | undefined {
  const d = u.department_id;
  if (!d) return undefined;
  if (typeof d === 'string') return d;
  if (typeof d === 'object' && '_id' in d) return String((d as { _id: unknown })._id);
  return undefined;
}
