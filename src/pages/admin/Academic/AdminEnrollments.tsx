import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useColleges } from '@/hooks/queries/useColleges';
import { useAdminEnrollments, useForceEnrollmentMutation, useWithdrawEnrollmentMutation } from '@/hooks/queries/usePhase3Enrollments';
import { getApiErrorMessage } from '@/lib/http/client';
import { p3Id, p3RefName } from '@/lib/phase3Ui';
import { UserPlus, LogOut } from 'lucide-react';

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

  const [forceOpen, setForceOpen] = useState(false);
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
  const forceMut = useForceEnrollmentMutation();
  const withdrawMut = useWithdrawEnrollmentMutation();

  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enrollments</h1>
        </div>
        <Button type="button" variant="primary" className="gap-2" onClick={() => setForceOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Force enroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <CardTitle className="w-full">Filters</CardTitle>
            {isUA && (
              <Select2 label="College" options={collegeOptions} value={collegeId} onChange={setCollegeId} className="max-w-xs" />
            )}
            <Select2
              label="Status"
              options={STATUS_OPTS}
              value={status}
              onChange={setStatus}
              searchable={false}
              className="max-w-xs"
            />
            <Input label="Semester" className="max-w-xs" value={semester} onChange={(e) => setSemester(e.target.value)} />
            <Input
              label="Academic year"
              className="max-w-xs"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            <Input
              label="Student ID"
              className="max-w-xs"
              value={student_id}
              onChange={(e) => setStudent_id(e.target.value)}
              placeholder="ObjectId"
            />
            <Input
              label="Offering ID"
              className="max-w-xs"
              value={course_id}
              onChange={(e) => setCourse_id(e.target.value)}
              placeholder="course offering _id"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : isError ? (
            <div className="py-16 text-center text-red-600">Could not load enrollments.</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No enrollments match.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Offering</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Snapshot</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-sm">{p3RefName(st)}</TableCell>
                      <TableCell className="font-mono text-xs">{p3Id(off as Record<string, unknown>)}</TableCell>
                      <TableCell className="text-sm">
                        {String(rec.semester ?? '')} / {String(rec.academicYear ?? '')}
                      </TableCell>
                      <TableCell>{String(rec.status ?? '')}</TableCell>
                      <TableCell className="text-sm">
                        {snap ? `${String(snap.courseCode ?? '')}` : '—'}
                        {force ? <span className="ml-2 text-amber-600">(forced)</span> : null}
                      </TableCell>
                      <TableCell className="text-right">
                        {rec.status === 'enrolled' && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setWithdrawTarget(id)}>
                            <LogOut className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {!isLoading && items.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <ForceEnrollModal
        open={forceOpen}
        onClose={() => setForceOpen(false)}
        onSubmit={async (payload) => {
          try {
            await forceMut.mutateAsync(payload);
            success('Enrollment recorded.');
            setForceOpen(false);
            void refetch();
          } catch (e) {
            showError(getApiErrorMessage(e));
          }
        }}
        loading={forceMut.isPending}
      />

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
    </div>
  );
}

function ForceEnrollModal({
  open,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (p: {
    student_id: string;
    courseOffering_id: string;
    overrideCapacity?: boolean;
    overrideCreditLimit?: boolean;
    reason?: string;
  }) => Promise<void>;
  loading: boolean;
}) {
  const [student_id, setStudent_id] = useState('');
  const [courseOffering_id, setCourseOffering_id] = useState('');
  const [reason, setReason] = useState('');
  const [overrideCapacity, setOverrideCapacity] = useState(false);
  const [overrideCreditLimit, setOverrideCreditLimit] = useState(false);

  return (
    <Modal isOpen={open} onClose={onClose} title="Force enroll (UA/CA)" size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Prerequisites are never bypassed. Overrides apply to capacity and/or credit limits only.
        </p>
        <Input label="Student ID" value={student_id} onChange={(e) => setStudent_id(e.target.value)} />
        <Input
          label="Course offering ID"
          value={courseOffering_id}
          onChange={(e) => setCourseOffering_id(e.target.value)}
        />
        <Input label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={overrideCapacity} onChange={(e) => setOverrideCapacity(e.target.checked)} />
          Override capacity (Gate 4)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={overrideCreditLimit}
            onChange={(e) => setOverrideCreditLimit(e.target.checked)}
          />
          Override credit limit (Gate 2)
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={loading || !student_id.trim() || !courseOffering_id.trim()}
            onClick={() =>
              void onSubmit({
                student_id: student_id.trim(),
                courseOffering_id: courseOffering_id.trim(),
                overrideCapacity: overrideCapacity || undefined,
                overrideCreditLimit: overrideCreditLimit || undefined,
                reason: reason.trim() || undefined,
              })
            }
          >
            {loading ? 'Submitting…' : 'Enroll'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
