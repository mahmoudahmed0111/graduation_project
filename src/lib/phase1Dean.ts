/**
 * Map populated `dean_id` / user-like objects from Phase 1 college payloads.
 * Backends may use `name`, `fullName`, `firstName`+`lastName`, or `email` only.
 */
export function displayNameFromUserLike(d: Record<string, unknown>): string {
  const s = (k: string) => {
    const v = d[k];
    return typeof v === 'string' ? v.trim() : '';
  };
  return (
    s('name') ||
    s('fullName') ||
    s('full_name') ||
    s('displayName') ||
    [s('firstName'), s('lastName')].filter(Boolean).join(' ') ||
    s('username') ||
    s('email') ||
    ''
  );
}

export function mapDeanIdPopulate(rawDean: unknown): {
  id: string;
  name: string;
  email?: string;
  role?: string;
} | null {
  if (rawDean == null || typeof rawDean !== 'object' || Array.isArray(rawDean)) return null;
  const d = rawDean as Record<string, unknown>;
  const id = String(d._id ?? d.id ?? '').trim();
  const displayName = displayNameFromUserLike(d);
  const name = displayName || '—';
  const email = typeof d.email === 'string' && d.email.trim() ? d.email.trim() : undefined;
  const role = typeof d.role === 'string' && d.role.trim() ? d.role.trim() : undefined;
  if (!id && !displayName && !email) return null;
  return { id, name, ...(email ? { email } : {}), ...(role ? { role } : {}) };
}
