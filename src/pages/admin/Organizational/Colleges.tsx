import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Building2, Search, Plus, User, School, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICollege } from '@/types';
import { useColleges } from '@/hooks/queries';
import { AdminPageShell, AdminDataTableShell } from '@/components/admin';
import { mapDeanIdPopulate } from '@/lib/phase1Dean';
import { formatDate } from '@/utils/formatters';

function mapCollege(college: Record<string, unknown>): ICollege {
  const rawDean = college.dean_id;

  let dean: ICollege['dean'];
  let deanRefId: string | undefined;

  const populated = mapDeanIdPopulate(rawDean);
  if (populated) {
    dean = {
      id: populated.id,
      name: populated.name,
      ...(populated.email ? { email: populated.email } : {}),
      ...(populated.role ? { role: populated.role } : {}),
    };
  } else if (typeof rawDean === 'string' && rawDean.trim()) {
    deanRefId = rawDean.trim();
  }

  return {
    id: String(college._id ?? college.id ?? ''),
    name: String(college.name ?? ''),
    code: String(college.code ?? '').toUpperCase(),
    slug: typeof college.slug === 'string' ? college.slug : undefined,
    description: typeof college.description === 'string' ? college.description : undefined,
    studentCount: typeof college.studentCount === 'number' ? college.studentCount : undefined,
    deptCount: typeof college.deptCount === 'number' ? college.deptCount : undefined,
    establishedYear: typeof college.establishedYear === 'number' ? college.establishedYear : undefined,
    archivedAt:
      college.archivedAt === null || college.archivedAt === undefined
        ? null
        : String(college.archivedAt),
    createdAt: typeof college.createdAt === 'string' ? college.createdAt : undefined,
    dean,
    deanRefId,
    departments: [],
    isArchived: Boolean(college.isArchived),
  };
}

/** GET /api/v1/colleges — Phase 1 list (`phase1_api_docs.md`); UA/CA + `isArchived` per docs. */
const COLLEGES_LIST_QUERY = {
  page: 1,
  limit: 100,
  sort: 'name',
  isArchived: 'all' as const,
};

export function Colleges() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError, error, refetch } = useColleges(COLLEGES_LIST_QUERY);

  const colleges = useMemo(
    () => (data?.items ?? []).map((c) => mapCollege(c as Record<string, unknown>)),
    [data]
  );

  const filteredColleges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return colleges;
    return colleges.filter((college) => {
      const deanIdStr = (college.dean?.id ?? college.deanRefId ?? '').toLowerCase();
      const deanName = (college.dean?.name ?? '').toLowerCase();
      const desc = (college.description ?? '').toLowerCase();
      const yearStr =
        college.establishedYear !== undefined ? String(college.establishedYear) : '';
      return (
        college.name.toLowerCase().includes(q) ||
        college.code.toLowerCase().includes(q) ||
        (college.slug?.toLowerCase().includes(q) ?? false) ||
        desc.includes(q) ||
        yearStr.includes(q) ||
        deanIdStr.includes(q) ||
        deanName.includes(q)
      );
    });
  }, [colleges, searchTerm]);

  if (isLoading) {
    return (
      <AdminPageShell
        titleStack={{ section: 'University Structure', page: 'Colleges' }}
        subtitle="Loading…"
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading colleges...</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell
        titleStack={{ section: 'University Structure', page: 'Colleges' }}
        subtitle="Could not load data"
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load colleges</p>
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
    <AdminPageShell titleStack={{ section: 'University Structure', page: 'Colleges' }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search name, code, description, year, dean…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Link to="/dashboard/organizational/colleges/create">
                <Button className="inline-flex items-center gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Add College
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredColleges.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                {colleges.length === 0 ? 'No colleges found' : 'No colleges match your search'}
              </p>
            </div>
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code / slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="whitespace-nowrap">Est.</TableHead>
                    <TableHead>Dean</TableHead>
                    <TableHead className="text-end tabular-nums">Depts</TableHead>
                    <TableHead className="text-end tabular-nums">Students</TableHead>
                    <TableHead className="hidden lg:table-cell whitespace-nowrap">Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => {
                    const deanId = college.dean?.id ?? college.deanRefId;
                    const deanName = college.dean?.name?.trim();
                    const showDeanName = Boolean(deanName && deanName !== '—');
                    return (
                    <TableRow key={college.id}>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{college.name}</TableCell>
                      <TableCell>
                        <div className="font-medium tabular-nums">{college.code}</div>
                        {college.slug ? (
                          <code
                            className="mt-0.5 block max-w-[12rem] truncate text-xs text-gray-500 dark:text-gray-400"
                            title={college.slug}
                          >
                            {college.slug}
                          </code>
                        ) : (
                          <span className="mt-0.5 block text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {college.description ? (
                          <span
                            className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
                            title={college.description}
                          >
                            {college.description}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-gray-700 dark:text-gray-300">
                        {college.establishedYear ?? '—'}
                      </TableCell>
                      <TableCell>
                        {showDeanName ? (
                          <div className="flex min-w-0 items-start gap-2">
                            <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <div className="min-w-0">
                              <div
                                className="font-medium text-gray-900 dark:text-gray-100 truncate"
                                title={deanName}
                              >
                                {deanName}
                              </div>
                              {college.dean?.email ? (
                                <div
                                  className="mt-0.5 truncate text-xs text-gray-600 dark:text-gray-400"
                                  title={college.dean.email}
                                >
                                  {college.dean.email}
                                </div>
                              ) : null}
                              {college.dean?.role ? (
                                <div className="text-xs capitalize text-gray-500 dark:text-gray-400">
                                  {college.dean.role}
                                </div>
                              ) : null}
                              {deanId ? (
                                <code
                                  className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400"
                                  title={deanId}
                                >
                                  {deanId}
                                </code>
                              ) : null}
                            </div>
                          </div>
                        ) : deanId ? (
                          <code className="text-xs text-gray-600 dark:text-gray-400" title={deanId}>
                            {deanId}
                          </code>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end tabular-nums text-gray-900 dark:text-gray-100">
                        <span className="inline-flex items-center justify-end gap-1">
                          <School className="h-3.5 w-3.5 text-gray-400" />
                          {college.deptCount !== undefined ? college.deptCount : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-end tabular-nums text-gray-900 dark:text-gray-100">
                        {college.studentCount !== undefined ? college.studentCount : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-600 dark:text-gray-400">
                        {college.createdAt ? (
                          <time dateTime={college.createdAt} title={college.createdAt}>
                            {formatDate(college.createdAt, 'short')}
                          </time>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        {college.isArchived ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              Archived
                            </span>
                            {college.archivedAt ? (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <time dateTime={college.archivedAt}>{formatDate(college.archivedAt, 'short')}</time>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/dashboard/organizational/colleges/${college.id}`}>
                            <Button variant="secondary" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/dashboard/organizational/colleges/${college.id}/edit`}>
                            <Button variant="secondary" size="sm" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
