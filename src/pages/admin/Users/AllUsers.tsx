import { Navigate, useLocation } from 'react-router-dom';

function roleQueryFromPath(pathname: string): string {
  if (pathname.includes('/users/doctors')) return 'doctor';
  if (pathname.includes('/users/tas')) return 'ta';
  if (pathname.includes('/users/admins')) return 'universityAdmin';
  return '';
}

/**
 * Legacy role-specific URLs redirect to the unified user directory with a role preset.
 */
export function AllUsers() {
  const { pathname } = useLocation();
  const role = roleQueryFromPath(pathname);
  const qs = role ? `?role=${encodeURIComponent(role)}` : '';
  return <Navigate to={`/dashboard/users/directory${qs}`} replace />;
}
