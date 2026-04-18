/** Helpers for Phase 3 API shapes (`_id`, populated refs). */

export function p3Id(obj: unknown): string {
  if (!obj || typeof obj !== 'object') return '';
  const r = obj as Record<string, unknown>;
  return String(r._id ?? r.id ?? '');
}

export function p3RefName(ref: unknown): string {
  if (ref == null) return '—';
  if (typeof ref === 'object' && ref !== null && 'name' in ref) {
    return String((ref as { name?: string }).name ?? '—');
  }
  return typeof ref === 'string' ? ref : '—';
}

export function p3CourseCode(course: unknown): string {
  if (course && typeof course === 'object' && 'code' in course) {
    return String((course as { code?: string }).code ?? '');
  }
  return '';
}

export function p3CourseTitle(course: unknown): string {
  if (course && typeof course === 'object' && 'title' in course) {
    return String((course as { title?: string }).title ?? '');
  }
  return '';
}

export function formatPrerequisites(cat: Record<string, unknown>): string {
  const raw = cat.prerequisites_ids;
  if (!Array.isArray(raw) || raw.length === 0) return '—';
  return raw
    .map((p) => {
      if (p && typeof p === 'object' && 'code' in p) return String((p as { code?: string }).code ?? '');
      if (typeof p === 'string') return p.slice(-6);
      return '?';
    })
    .filter(Boolean)
    .join(', ');
}
