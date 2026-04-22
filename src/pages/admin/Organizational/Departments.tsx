import { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import {
  School,
  Search,
  Plus,
  Edit,
  Archive,
  User,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IDepartment } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AdminPageShell, AdminDataTableShell } from '@/components/admin';
import { api, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useDepartments, useInvalidateDepartments } from '@/hooks/queries/useDepartments';
import { useColleges } from '@/hooks/queries/useColleges';
import { mapDeanIdPopulate } from '@/lib/phase1Dean';
import { formatDate } from '@/utils/formatters';

const ARCHIVE_FILTER_OPTS = [
  { value: 'all', label: 'Activation' },
  { value: 'false', label: 'Active' },
  { value: 'true', label: 'Archived' },
] as const;

function mapDepartment(department: Record<string, unknown>): IDepartment {
  const rawCollege = department.college_id;
  let college: IDepartment['college'];
  if (typeof rawCollege === 'string' && rawCollege.trim()) {
    college = {
      id: rawCollege.trim(),
      name: '—',
      code: '—',
    };
  } else if (rawCollege && typeof rawCollege === 'object') {
    const c = rawCollege as Record<string, unknown>;
    college = {
      id: String(c._id ?? c.id ?? ''),
      name: String(c.name ?? 'Unknown College'),
      code: String(c.code ?? '').toUpperCase(),
    };
  } else {
    college = { id: '', name: 'Unknown College', code: '' };
  }

  const rawHead = department.head_id;
  let head: IDepartment['head'];
  const headPopulated = mapDeanIdPopulate(rawHead);
  if (headPopulated) {
    head = {
      id: headPopulated.id,
      name: headPopulated.name,
      ...(headPopulated.email ? { email: headPopulated.email } : {}),
      ...(headPopulated.role ? { role: headPopulated.role } : {}),
    };
  } else if (typeof rawHead === 'string' && rawHead.trim()) {
    head = { id: rawHead.trim(), name: '—' };
  }

  return {
    id: String(department._id ?? department.id ?? ''),
    name: String(department.name ?? ''),
    code: String(department.code ?? '').toUpperCase(),
    description: typeof department.description === 'string' ? department.description : undefined,
    head,
    college,
    archivedAt:
      department.archivedAt === null || department.archivedAt === undefined
        ? null
        : String(department.archivedAt),
    createdAt: typeof department.createdAt === 'string' ? department.createdAt : undefined,
    isArchived: Boolean(department.isArchived),
  };
}

export function Departments() {
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const isUniversityAdmin = user?.role === 'universityAdmin';
  const invalidateDepartments = useInvalidateDepartments();
  const [collegeIdFilter, setCollegeIdFilter] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const listParams = useMemo(
    () => ({
      page: 1,
      limit: 500,
      sort: 'name',
      isArchived: archiveFilter,
      ...(isUniversityAdmin && collegeIdFilter.trim() ? { college_id: collegeIdFilter.trim() } : {}),
    }),
    [archiveFilter, collegeIdFilter, isUniversityAdmin]
  );

  const { data, isLoading, isError, error, refetch } = useDepartments(listParams);

  const { data: collegesData } = useColleges(
    { limit: 100, isArchived: 'false' },
    { enabled: isUniversityAdmin }
  );

  const collegeFilterOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return [
      { value: '', label: 'All colleges' },
      ...items.map((c) => {
        const r = c as Record<string, unknown>;
        return {
          value: String(r._id ?? r.id ?? ''),
          label: String(r.name ?? ''),
        };
      }),
    ];
  }, [collegesData?.items]);
  const [archiveDialog, setArchiveDialog] = useState<{ open: boolean; department: IDepartment | null }>({
    open: false,
    department: null,
  });
  const [restoreDialog, setRestoreDialog] = useState<{ open: boolean; department: IDepartment | null }>({
    open: false,
    department: null,
  });

  const allDepartments = useMemo(
    () => (data?.items ?? []).map((d) => mapDepartment(d as Record<string, unknown>)),
    [data?.items]
  );

  const handleArchive = async (department: IDepartment) => {
    try {
      await api.archiveDepartment(department.id);
      success(`Department "${department.name}" archived successfully`);
      invalidateDepartments();
      setArchiveDialog({ open: false, department: null });
    } catch (error) {
      showError(getApiErrorMessage(error, 'Failed to archive department'));
    }
  };

  const handleRestore = async (department: IDepartment) => {
    try {
      await api.restoreDepartment(department.id);
      success(`Department "${department.name}" restored`);
      invalidateDepartments();
      setRestoreDialog({ open: false, department: null });
    } catch (error) {
      showError(getApiErrorMessage(error, 'Failed to restore department'));
    }
  };

  const filteredDepartments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allDepartments;
    return allDepartments.filter((dept) => {
      const desc = (dept.description ?? '').toLowerCase();
      const collegeName = dept.college.name.toLowerCase();
      const headName = (dept.head?.name ?? '').toLowerCase();
      const headId = (dept.head?.id ?? '').toLowerCase();
      const headEmail = (dept.head?.email ?? '').toLowerCase();
      return (
        dept.name.toLowerCase().includes(q) ||
        dept.code.toLowerCase().includes(q) ||
        desc.includes(q) ||
        collegeName.includes(q) ||
        headName.includes(q) ||
        headId.includes(q) ||
        headEmail.includes(q)
      );
    });
  }, [allDepartments, searchTerm]);

  if (isLoading) {
    return (
      <AdminPageShell
        titleStack={{ section: 'University Structure', page: 'Departments' }}
        subtitle="Loading…"
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading departments...</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell
        titleStack={{ section: 'University Structure', page: 'Departments' }}
        subtitle="Could not load data"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Failed to load departments</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: 'University Structure', page: 'Departments' }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative w-full min-w-0 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name, code, description, college, head, email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isUniversityAdmin && (
                <Select2
                  value={collegeIdFilter}
                  onChange={setCollegeIdFilter}
                  options={collegeFilterOptions}
                  placeholder="College"
                  className="sm:w-56"
                />
              )}
              <Select2
                value={archiveFilter}
                onChange={(v) => setArchiveFilter(v as 'all' | 'true' | 'false')}
                options={[...ARCHIVE_FILTER_OPTS]}
                placeholder="Archive status"
                className="sm:w-56"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Link to="/dashboard/organizational/departments/create">
                <Button className="inline-flex items-center gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDepartments.length === 0 ? (
            <div className="py-12 text-center">
              <School className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {allDepartments.length === 0
                  ? 'No departments for the selected filters.'
                  : 'No departments match your search.'}
              </p>
            </div>
          ) : (
            <AdminDataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead className="hidden lg:table-cell whitespace-nowrap">Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.code}</TableCell>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="max-w-md text-sm text-gray-600 break-words dark:text-gray-400">
                      <span title={dept.description}>{dept.description ?? '—'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{dept.college.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dept.head ? (
                        <div className="flex min-w-0 items-start gap-2">
                          <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{dept.head.name}</div>
                            {dept.head.email ? (
                              <div
                                className="truncate text-xs text-gray-600 dark:text-gray-400"
                                title={dept.head.email}
                              >
                                {dept.head.email}
                              </div>
                            ) : null}
                            {dept.head.role ? (
                              <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                                {dept.head.role}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                      {dept.createdAt ? (
                        <time dateTime={dept.createdAt} title={dept.createdAt}>
                          {formatDate(dept.createdAt, 'short')}
                        </time>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {dept.isArchived ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            Archived
                          </span>
                          {dept.archivedAt ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <time dateTime={dept.archivedAt}>{formatDate(dept.archivedAt, 'short')}</time>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/dashboard/organizational/departments/${dept.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!dept.isArchived && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setArchiveDialog({ open: true, department: dept })}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        {dept.isArchived && isUniversityAdmin && (
                          <Button
                            variant="secondary"
                            size="sm"
                            title="Restore (UA only)"
                            onClick={() => setRestoreDialog({ open: true, department: dept })}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </AdminDataTableShell>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, department: null })}
        onConfirm={() => archiveDialog.department && handleArchive(archiveDialog.department)}
        title="Archive Department"
        message={`Are you sure you want to archive "${archiveDialog.department?.name}"?`}
        confirmText="Archive"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={restoreDialog.open}
        onClose={() => setRestoreDialog({ open: false, department: null })}
        onConfirm={() => restoreDialog.department && handleRestore(restoreDialog.department)}
        title="Restore Department"
        message={`Restore "${restoreDialog.department?.name}"? (University administrators only.)`}
        confirmText="Restore"
        variant="info"
      />
    </AdminPageShell>
  );
}

