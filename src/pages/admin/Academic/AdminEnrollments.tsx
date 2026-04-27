import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDataTableShell, AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useColleges } from '@/hooks/queries/useColleges';
import { useAdminEnrollments, useWithdrawEnrollmentMutation } from '@/hooks/queries/usePhase3Enrollments';
import { getApiErrorMessage } from '@/lib/http/client';
import { p3Id, p3RefName } from '@/lib/phase3Ui';
import { GraduationCap, LogOut, Search, UserPlus } from 'lucide-react';

const STATUS_OPTS = [
  { value: '', label: 'Any status' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
];

export function AdminEnrollments() {
  const { user } = useAuthStore();
  const isUA = user?.role === 'universityAdmin';
  const { success, error: showError } = useToastStore();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [student_id, setStudent_id] = useState('');
  const [course_id, setCourse_id] = useState('');
  const [collegeId, setCollegeId] = useState('');

  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);

  const { data: collegesData } = useColleges(
    { limit: 100, isArchived: 'false' },
    { enabled: isUA }
  );
  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return [
      { value: '', label: 'All colleges' },
      ...items.map((c) => {
        const r = c as Record<string, unknown>;
        return { value: String(r._id ?? r.id ?? ''), label: String(r.name ?? '') };
      }),
    ];
  }, [collegesData?.items]);

  const listParams = useMemo(
    () => ({
      page,
      limit: 25,
      sort: '-createdAt',
      status: status || undefined,
      semester: semester.trim() || undefined,
      academicYear: academicYear.trim() || undefined,
      student_id: student_id.trim() || undefined,
      course_id: course_id.trim() || undefined,
      college_id: isUA ? collegeId || undefined : undefined,
    }),
    [page, status, semester, academicYear, student_id, course_id, collegeId, isUA]
  );

  const { data, isLoading, isError, refetch } = useAdminEnrollments(listParams);
  const withdrawMut = useWithdrawEnrollmentMutation();

  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  if (isLoading) {
    return (
      <AdminPageShell titleStack={{ section: 'Academic', page: 'Enrollments' }} subtitle="Loading…">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading enrollments…</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell titleStack={{ section: 'Academic', page: 'Enrollments' }} subtitle="Could not load data">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load enrollments</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">Check permissions or API URL.</p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: 'Academic', page: 'Enrollments' }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Filter by student ID…"
                value={student_id}
                onChange={(e) => setStudent_id(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <Link to="/dashboard/academic/enrollments/force">
                <Button type="button" variant="primary" className="inline-flex items-center gap-2 rounded-xl">
                  <UserPlus className="h-4 w-4" />
                  Force enroll
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-dark-border dark:bg-dark-bg/50 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isUA && (
              <Select2 label="College" options={collegeOptions} value={collegeId} onChange={setCollegeId} />
            )}
            <Select2
              label="Status"
              options={STATUS_OPTS}
              value={status}
              onChange={setStatus}
              searchable={false}
            />
            <Input label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="e.g. Second" />
            <Input label="Academic year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2025-2026" />
            <Input
              label="Offering ID"
              value={course_id}
              onChange={(e) => setCourse_id(e.target.value)}
              placeholder="Course offering _id"
            />
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No enrollments match these filters.</p>
            </div>
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Offering</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Snapshot</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const rec = row as Record<string, unknown>;
                    const id = p3Id(rec);
                    const st = rec.student_id;
                    const off = rec.course_id;
                    const snap = rec.snapshot as Record<string, unknown> | undefined;
                    const force = rec.forceEnrolled;
                    return (
                      <TableRow key={id}>
                        <TableCell className="text-sm text-gray-900 dark:text-gray-100">{p3RefName(st)}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {p3Id(off as Record<string, unknown>)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {String(rec.semester ?? '')} / {String(rec.academicYear ?? '')}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            {String(rec.status ?? '')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {snap ? `${String(snap.courseCode ?? '')}` : '—'}
                          {force ? <span className="ml-2 text-amber-600 dark:text-amber-400">(forced)</span> : null}
                        </TableCell>
                        <TableCell className="text-end">
                          {rec.status === 'enrolled' && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              title="Withdraw"
                              className="inline-flex items-center gap-1 rounded-xl"
                              onClick={() => setWithdrawTarget(id)}
                            >
                              <LogOut className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          )}

          {items.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-4 dark:border-dark-border sm:flex-row sm:justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {data?.currentPage ?? page} of {totalPages} · {data?.totalResults ?? items.length} enrollments
              </p>
              <Pagination currentPage={data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={() => {
          if (!withdrawTarget) return;
          void (async () => {
            try {
              await withdrawMut.mutateAsync(withdrawTarget);
              success('Withdrawn.');
              setWithdrawTarget(null);
              void refetch();
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          })();
        }}
        title="Withdraw student"
        message="Set enrollment status to withdrawn and free a seat?"
        confirmText="Withdraw"
        variant="danger"
      />
    </AdminPageShell>
  );
}
