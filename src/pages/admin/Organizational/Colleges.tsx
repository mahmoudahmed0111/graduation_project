import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Building2, Search, Plus, User, School, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ICollege } from '@/types';
import { useColleges } from '@/hooks/queries';
import { AdminPageShell, AdminDataTableShell } from '@/components/admin';

function mapCollege(college: Record<string, unknown>): ICollege {
  const dean = college.dean_id as Record<string, unknown> | undefined;

  return {
    id: String(college._id ?? college.id ?? ''),
    name: String(college.name ?? ''),
    code: String(college.code ?? '').toUpperCase(),
    slug: typeof college.slug === 'string' ? college.slug : undefined,
    description: typeof college.description === 'string' ? college.description : undefined,
    studentCount: typeof college.studentCount === 'number' ? college.studentCount : undefined,
    deptCount: typeof college.deptCount === 'number' ? college.deptCount : undefined,
    establishedYear: typeof college.establishedYear === 'number' ? college.establishedYear : undefined,
    dean: dean
      ? {
          id: String(dean._id ?? dean.id ?? ''),
          name: String(dean.name ?? ''),
        }
      : undefined,
    departments: [],
    isArchived: Boolean(college.isArchived),
  };
}

export function Colleges() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError, error, refetch } = useColleges({ isArchived: 'all' });

  const colleges = useMemo(
    () => (data?.items ?? []).map((c) => mapCollege(c as Record<string, unknown>)),
    [data]
  );

  const filteredColleges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return colleges;
    return colleges.filter(
      (college) =>
        college.name.toLowerCase().includes(q) ||
        college.code.toLowerCase().includes(q) ||
        (college.slug?.toLowerCase().includes(q) ?? false)
    );
  }, [colleges, searchTerm]);

  if (isLoading) {
    return (
      <AdminPageShell title="Colleges" subtitle="Loading…">
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
      <AdminPageShell title="Colleges" subtitle="Could not load data">
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
    <AdminPageShell
      title="Colleges"
      subtitle={`${colleges.length} colleges${searchTerm.trim() ? ` · ${filteredColleges.length} match search` : ''} — GET /api/v1/colleges`}
      breadcrumbs={[{ label: 'University Structure' }, { label: 'Colleges' }]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search name, code, slug…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Link to="/dashboard/organizational/colleges/create">
            <Button className="inline-flex items-center gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Add College
            </Button>
          </Link>
        </div>
      }
    >
      {filteredColleges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              {colleges.length === 0 ? 'No colleges found' : 'No colleges match your search'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              All colleges
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-800 dark:text-gray-200">{filteredColleges.length}</span>
              {searchTerm.trim() ? ' matching search' : ''}
            </p>
          </CardHeader>
          <CardContent>
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Dean</TableHead>
                    <TableHead className="text-end tabular-nums">Depts</TableHead>
                    <TableHead className="text-end tabular-nums">Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell className="font-medium">{college.code}</TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">{college.name}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {college.slug ?? '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 shrink-0 text-gray-400" />
                          <span>{college.dean?.name ?? '—'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end tabular-nums">
                        <span className="inline-flex items-center justify-end gap-1">
                          <School className="h-3.5 w-3.5 text-gray-400" />
                          {college.deptCount ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{college.studentCount ?? 0}</TableCell>
                      <TableCell>
                        {college.isArchived ? (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            Archived
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/dashboard/organizational/colleges/${college.id}`}>
                            <Button variant="secondary" size="sm">
                              View
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
                  ))}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          </CardContent>
        </Card>
      )}
    </AdminPageShell>
  );
}
