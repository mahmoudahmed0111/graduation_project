import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useUser } from '@/hooks/queries/useUsers';
import { detailPathForPhase2Role } from '@/lib/userListPaths';

/** Old `/dashboard/users/directory?role=…` bookmarks → role-specific lists. */
export function LegacyUsersDirectoryRedirect() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  if (role === 'doctor') return <Navigate to="/dashboard/users/doctors" replace />;
  if (role === 'ta') return <Navigate to="/dashboard/users/tas" replace />;
  if (role === 'universityAdmin') return <Navigate to="/dashboard/users/admins" replace />;
  if (role === 'collegeAdmin') {
    return <Navigate to="/dashboard/users/admins?adminRole=collegeAdmin" replace />;
  }
  if (role === 'student') return <Navigate to="/dashboard/users/students" replace />;
  return <Navigate to="/dashboard/users/students" replace />;
}

/** Old `/dashboard/users/directory/:id` → canonical URL by loaded user role. */
export function UserFromLegacyDirectoryRedirect() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useUser(id);

  if (!id) return <Navigate to="/dashboard/users/students" replace />;
  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-gray-500">Opening profile…</div>
    );
  }
  if (isError || !data) return <Navigate to="/dashboard/users/students" replace />;
  return <Navigate to={detailPathForPhase2Role(String(data.role), id)} replace />;
}

export function RedirectToUsersStudents() {
  return <Navigate to="/dashboard/users/students" replace />;
}

export function RedirectToUsersStudentsCreate() {
  return <Navigate to="/dashboard/users/students/create" replace />;
}

export function RedirectToUsersStudentProfile() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/dashboard/users/students" replace />;
  return <Navigate to={`/dashboard/users/students/${encodeURIComponent(id)}`} replace />;
}

/** Legacy `…/:id/edit` mock pages → Phase 2 detail (edit is on the same screen). */
export function RedirectUserEditToDetail() {
  const { pathname } = useLocation();
  const to = pathname.replace(/\/edit\/?$/, '');
  return <Navigate to={to} replace />;
}
