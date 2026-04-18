import { useCallback, useEffect, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AdminPageShell } from '@/components/admin';
import { AdminDataTableShell } from '@/components/admin/AdminDataTableShell';
import { IndeterminateCheckbox } from '@/components/admin/AdminIndexBulkBar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select2 } from '@/components/ui/Select2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { NationalIdLookupModal } from '@/components/users/NationalIdLookupModal';
import { UserBulkActionsPanel } from '@/components/users/UserBulkActionsPanel';
import { UsersTableSkeleton } from '@/components/users/UsersTableSkeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useUsers } from '@/hooks/queries/useUsers';
import { phase2RefLabel, phase2UserId, phase2UserIsActive } from '@/lib/phase2UserUi';
import { useAuthStore } from '@/store/authStore';
import type { Phase2ApiUser } from '@/types/phase2-user';
import { FileUp, Fingerprint, Plus, Search } from 'lucide-react';

const ROLE_FILTERS = [
  { value: '', label: 'All roles' },
  { value: 'student', label: 'Student' },
  { value: 'ta', label: 'Teaching assistant' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'collegeAdmin', label: 'College admin' },
  { value: 'universityAdmin', label: 'University admin' },
];

const STATUS_FILTERS = [
  { value: 'false', label: 'Active' },
  { value: 'true', label: 'Deactivated' },
  { value: 'all', label: 'All' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
  { value: 'email', label: 'Email A–Z' },
];

const ACADEMIC_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'active', label: 'Active' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'good_standing', label: 'Good standing' },
  { value: 'probation', label: 'Probation' },
];

export function UsersDirectory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuthStore();
  const isUA = authUser?.role === 'universityAdmin';
  const isCA = authUser?.role === 'collegeAdmin';

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [role, setRole] = useState(() => searchParams.get('role') ?? '');
  const [isArchived, setIsArchived] = useState<'true' | 'false' | 'all'>('false');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [academicStatus, setAcademicStatus] = useState('');
  const [levelStr, setLevelStr] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const collegeScope = isUA ? collegeId || undefined : authUser?.collegeId;

  const { data: collegesData } = useColleges(
    { limit: 100, isArchived: 'false' },
    { enabled: isUA }
  );
  const { data: departmentsData } = useDepartments(
    {
      college_id: collegeScope,
      limit: 100,
      isArchived: 'false',
    },
    { enabled: isUA ? true : Boolean(authUser?.collegeId) }
  );

  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return [
      { value: '', label: 'All colleges' },
      ...items.map((c) => {
        const rec = c as Record<string, unknown>;
        const id = String(rec._id ?? rec.id ?? '');
        const name = String(rec.name ?? id);
        return { value: id, label: name };
      }),
    ];
  }, [collegesData?.items]);

  const departmentOptions = useMemo(() => {
    const items = departmentsData?.items ?? [];
    return [
      { value: '', label: 'All departments' },
      ...items.map((d) => {
        const rec = d as Record<string, unknown>;
        const id = String(rec._id ?? rec.id ?? '');
        const name = String(rec.name ?? id);
        return { value: id, label: name };
      }),
    ];
  }, [departmentsData?.items]);

  const levelNum = levelStr.trim() === '' ? undefined : Number(levelStr);
  const levelValid = levelStr.trim() === '' || (Number.isFinite(levelNum) && levelNum! >= 1);

  const listParams = useMemo(
    () => ({
      page,
      limit: 25,
      sort,
      isArchived,
      role: role || undefined,
      department_id: departmentId || undefined,
      college_id: isUA ? collegeId || undefined : undefined,
      academicStatus: academicStatus || undefined,
      level: levelValid && levelNum !== undefined ? levelNum : undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [
      page,
      sort,
      isArchived,
      role,
      departmentId,
      collegeId,
      isUA,
      academicStatus,
      levelValid,
      levelNum,
      debouncedSearch,
    ]
  );

  useEffect(() => {
    setPage(1);
  }, [role, departmentId, collegeId, isArchived, academicStatus, debouncedSearch, levelStr]);

  useEffect(() => {
    setSelected(new Set());
  }, [page]);

  const query = useUsers(listParams);

  const items = query.data?.items ?? [];
  const totalPages = Math.max(1, query.data?.totalPages ?? 1);

  const selectedUsers = useMemo(() => {
    const map = new Map(items.map((u) => [phase2UserId(u), u]));
    return selected.size ? [...selected].map((id) => map.get(id)).filter(Boolean) as Phase2ApiUser[] : [];
  }, [items, selected]);

  const allOnPageSelected = items.length > 0 && items.every((u) => selected.has(phase2UserId(u)));
  const someOnPageSelected = items.some((u) => selected.has(phase2UserId(u)));

  const toggleAllPage = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        items.forEach((u) => next.delete(phase2UserId(u)));
      } else {
        items.forEach((u) => next.add(phase2UserId(u)));
      }
      return next;
    });
  }, [allOnPageSelected, items]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <AdminPageShell
      title="Users"
      subtitle="Directory, filters, and bulk actions (Phase 2 Users API)."
      breadcrumbs={[{ label: 'User Management' }, { label: 'Users' }]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={() => setLookupOpen(true)}>
            <Fingerprint className="h-4 w-4" />
            Lookup
          </Button>
          <Link to="/dashboard/users/directory/bulk-import">
            <Button type="button" variant="secondary" className="gap-2">
              <FileUp className="h-4 w-4" />
              Bulk import
            </Button>
          </Link>
          <Link to="/dashboard/users/directory/create">
            <Button type="button" variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              Create user
            </Button>
          </Link>
        </div>
      }
    >
      <NationalIdLookupModal isOpen={lookupOpen} onClose={() => setLookupOpen(false)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Select2 label="Role" options={ROLE_FILTERS} value={role} onChange={setRole} searchable={false} />
        <Select2
          label="Account status"
          options={STATUS_FILTERS}
          value={isArchived}
          onChange={(v) => setIsArchived(v as 'true' | 'false' | 'all')}
          searchable={false}
        />
        {isUA && (
          <Select2 label="College" options={collegeOptions} value={collegeId} onChange={setCollegeId} />
        )}
        <Select2
          label="Department"
          options={departmentOptions}
          value={departmentId}
          onChange={setDepartmentId}
        />
        <Select2 label="Sort" options={SORT_OPTIONS} value={sort} onChange={setSort} searchable={false} />
        <Select2
          label="Academic status"
          options={ACADEMIC_OPTIONS}
          value={academicStatus}
          onChange={setAcademicStatus}
        />
        <div className="col-span-full">
          <div className="flex flex-nowrap items-end gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search name or email (sent as search query if supported)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-40 shrink-0">
              <Input
                label="Level (optional)"
                type="number"
                min={1}
                value={levelStr}
                onChange={(e) => setLevelStr(e.target.value)}
                error={!levelValid ? 'Invalid level' : undefined}
              />
            </div>
          </div>
        </div>
      </div>

      <UserBulkActionsPanel
        selectedIds={[...selected]}
        selectedUsers={selectedUsers}
        departmentOptions={departmentOptions.filter((o) => o.value)}
        currentUserId={authUser?.id}
        isCollegeAdmin={isCA}
        onClear={() => setSelected(new Set())}
      />

      <AdminDataTableShell>
        {query.isLoading ? (
          <UsersTableSkeleton />
        ) : query.isError ? (
          <div className="p-8 text-center text-red-600">
            Could not load users. You may be outside your scope, or the server returned an error.
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="font-medium text-gray-700">No users match these filters</p>
            <p className="mt-1 text-sm">Try clearing search or widening status to &quot;All&quot;.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <IndeterminateCheckbox
                    checked={allOnPageSelected}
                    indeterminate={!allOnPageSelected && someOnPageSelected}
                    onChange={toggleAllPage}
                    aria-label="Select all on page"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => {
                const id = phase2UserId(u);
                const active = phase2UserIsActive(u);
                return (
                  <TableRow key={id}>
                    <TableCell>
                      <div
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                        onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
                        role="presentation"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600"
                          checked={selected.has(id)}
                          onChange={() => toggleOne(id)}
                          aria-label={`Select ${u.name}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{u.name}</TableCell>
                    <TableCell className="text-gray-600">{u.email}</TableCell>
                    <TableCell>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        {u.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{phase2RefLabel(u.department_id)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          active
                            ? 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800'
                            : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                        }
                      >
                        {active ? 'Active' : 'Deactivated'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/dashboard/users/directory/${id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </AdminDataTableShell>

      {!query.isLoading && items.length > 0 && (
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            Page {query.data?.currentPage ?? page} of {totalPages} · {query.data?.totalResults ?? items.length}{' '}
            users
          </p>
          <Pagination currentPage={query.data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </AdminPageShell>
  );
}
