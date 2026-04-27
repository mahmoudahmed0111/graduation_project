import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminDataTableShell, AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Calendar, Plus, Users, Pencil, Archive, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import {
  useCourseOfferings,
  useCourseOffering,
  useCourseOfferingRoster,
  useUpdateCourseOffering,
  useArchiveCourseOffering,
} from '@/hooks/queries/usePhase3CourseOfferings';
import { useUsers } from '@/hooks/queries/useUsers';
import { useLocations } from '@/hooks/queries/useLocations';
import { getApiErrorMessage } from '@/lib/http/client';
import * as courseOfferingsService from '@/services/courseOfferings.service';
import type { GradingPolicy, ScheduleSlot } from '@/services/courseOfferings.service';
import { p3CourseCode, p3CourseTitle, p3Id, p3RefName } from '@/lib/phase3Ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  DEFAULT_GRADING_POLICY,
  OFFERING_FORM_DAYS,
  OFFERING_SESSION_TYPES,
  sumGradingPolicy,
} from './courseOfferingFormConstants';

export function CourseOfferings() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'universityAdmin' || user?.role === 'collegeAdmin';
  const { success, error: showError } = useToastStore();

  const [page, setPage] = useState(1);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [search, setSearch] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [rosterId, setRosterId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      limit: 25,
      sort: '-createdAt',
      isArchived: 'false' as const,
      semester: semester.trim() || undefined,
      academicYear: academicYear.trim() || undefined,
      search: search.trim() || undefined,
    }),
    [page, semester, academicYear, search]
  );

  const { data, isLoading, isError, refetch } = useCourseOfferings(listParams);
  const items = data?.items ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const { data: offeringDetail } = useCourseOffering(editId ?? undefined);
  const updateMut = useUpdateCourseOffering();
  const archiveMut = useArchiveCourseOffering();

  if (isLoading) {
    return (
      <AdminPageShell titleStack={{ section: 'Academic', page: 'Course offerings' }} subtitle="Loading…">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading course offerings…</p>
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell titleStack={{ section: 'Academic', page: 'Course offerings' }} subtitle="Could not load data">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">Could not load course offerings</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">Check permissions or API URL.</p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell titleStack={{ section: 'Academic', page: 'Course offerings' }}>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full min-w-0 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search course code or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {canManage && (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Link to="/dashboard/academic/offerings/create">
                  <Button type="button" variant="primary" className="inline-flex items-center gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Create offering
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 dark:border-dark-border dark:bg-dark-bg/50 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Input
              label="Semester"
              placeholder="e.g. Second"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <Input label="Academic year" placeholder="e.g. 2025-2026" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No offerings match these filters.</p>
            </div>
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Grading</TableHead>
                    <TableHead className="text-end">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const id = p3Id(row);
                    const course = row.course_id;
                    const gp = row.gradingPolicy as GradingPolicy | undefined;
                    const td = Number(row.totalDegree ?? 0);
                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{p3CourseCode(course)}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{p3CourseTitle(course)}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {String(row.semester ?? '')} / {String(row.academicYear ?? '')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {String(row.currentEnrolled ?? 0)} / {String(row.maxSeats ?? '')}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                          {gp ? (sumGradingPolicy(gp) === td ? `OK (${td})` : `Mismatch ${sumGradingPolicy(gp)}/${td}`) : '—'}
                        </TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              title="Roster"
                              className="inline-flex items-center gap-1 rounded-xl"
                              onClick={() => setRosterId(id)}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            {canManage && (
                              <>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  title="Edit"
                                  className="inline-flex items-center gap-1 rounded-xl"
                                  onClick={() => setEditId(id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  title="Archive"
                                  className="inline-flex items-center gap-1 rounded-xl"
                                  onClick={() => setArchiveId(id)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
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
                Page {data?.currentPage ?? page} of {totalPages} · {data?.totalResults ?? items.length} offerings
              </p>
              <Pagination currentPage={data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      {editId && (
        <OfferingEditModal
          open={!!editId}
          offering={offeringDetail ?? null}
          onClose={() => setEditId(null)}
          onSave={async (body) => {
            try {
              await updateMut.mutateAsync({
                id: editId,
                data: body as Parameters<typeof courseOfferingsService.updateCourseOffering>[1],
              });
              success('Offering updated.');
              setEditId(null);
              void refetch();
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          }}
          loading={updateMut.isPending}
        />
      )}

      {rosterId && (
        <RosterModal offeringId={rosterId} onClose={() => setRosterId(null)} />
      )}

      <ConfirmDialog
        isOpen={!!archiveId}
        onClose={() => setArchiveId(null)}
        onConfirm={() => {
          if (!archiveId) return;
          void (async () => {
            try {
              const r = await archiveMut.mutateAsync(archiveId);
              success(r.message);
              setArchiveId(null);
              void refetch();
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          })();
        }}
        title="Archive offering"
        message="Archive this offering? Requires no active enrollments."
        confirmText="Archive"
        variant="danger"
      />
    </AdminPageShell>
  );
}

function RosterModal({ offeringId, onClose }: { offeringId: string; onClose: () => void }) {
  const { data, isLoading } = useCourseOfferingRoster(offeringId, { limit: 100 });
  const rows = data?.items ?? [];

  return (
    <Modal isOpen title="Roster" onClose={onClose} size="xl">
      {isLoading ? (
        <p className="text-gray-500">Loading roster…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => {
              const rec = e as Record<string, unknown>;
              const st = rec.student_id;
              const snap = rec.snapshot as Record<string, unknown> | undefined;
              return (
                <TableRow key={p3Id(rec)}>
                  <TableCell>{p3RefName(st)}</TableCell>
                  <TableCell>{String(rec.status ?? '')}</TableCell>
                  <TableCell>{snap ? String(snap.courseCode ?? '') : '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Modal>
  );
}

function OfferingEditModal({
  open,
  onClose,
  offering,
  onSave,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  offering?: Record<string, unknown> | null;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}) {
  const { data: doctors } = useUsers({ role: 'doctor', limit: 100, isArchived: 'false' });
  const { data: tas } = useUsers({ role: 'ta', limit: 100, isArchived: 'false' });
  const { data: locs } = useLocations({ limit: 300, isArchived: 'false' });

  const doctorOptions = useMemo(() => {
    return (doctors?.items ?? []).map((u) => {
      const r = u as unknown as Record<string, unknown>;
      return { value: p3Id(r), label: String(r.name ?? r.email ?? '') };
    });
  }, [doctors?.items]);

  const taOptions = useMemo(() => {
    return (tas?.items ?? []).map((u) => {
      const r = u as unknown as Record<string, unknown>;
      return { value: p3Id(r), label: String(r.name ?? r.email ?? '') };
    });
  }, [tas?.items]);

  const locationOptions = useMemo(() => {
    return (locs?.items ?? []).map((l) => {
      const r = l as Record<string, unknown>;
      return { value: p3Id(r), label: String(r.name ?? '') };
    });
  }, [locs?.items]);

  const [maxSeats, setMaxSeats] = useState('50');
  const [totalDegree, setTotalDegree] = useState('100');
  const [policy, setPolicy] = useState<GradingPolicy>({ ...DEFAULT_GRADING_POLICY });
  const [doctorIds, setDoctorIds] = useState<string[]>([]);
  const [taIds, setTaIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([
    { day: 'Sunday', startTime: '09:00', endTime: '11:00', location: '', sessionType: 'lecture' },
  ]);

  useEffect(() => {
    if (!open || !offering) return;
    setMaxSeats(String(offering.maxSeats ?? 50));
    setTotalDegree(String(offering.totalDegree ?? 100));
    const gp = offering.gradingPolicy as GradingPolicy | undefined;
    setPolicy(gp ? { ...gp } : { ...DEFAULT_GRADING_POLICY });
    const d = offering.doctors_ids;
    const t = offering.tas_ids;
    setDoctorIds(
      Array.isArray(d)
        ? d.map((x) => (typeof x === 'string' ? x : x && typeof x === 'object' && '_id' in x ? String((x as { _id: string })._id) : '')).filter(Boolean)
        : []
    );
    setTaIds(
      Array.isArray(t)
        ? t.map((x) => (typeof x === 'string' ? x : x && typeof x === 'object' && '_id' in x ? String((x as { _id: string })._id) : '')).filter(Boolean)
        : []
    );
    const sch = offering.schedule as ScheduleSlot[] | undefined;
    if (Array.isArray(sch) && sch.length) {
      setSchedule(
        sch.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          location: typeof s.location === 'object' && s.location && '_id' in (s.location as object)
            ? String((s.location as { _id: string })._id)
            : String(s.location ?? ''),
          sessionType: s.sessionType,
        }))
      );
    } else {
      setSchedule([{ day: 'Sunday', startTime: '09:00', endTime: '11:00', location: '', sessionType: 'lecture' }]);
    }
  }, [open, offering]);

  const toggleMulti = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const updateSlot = (i: number, patch: Partial<ScheduleSlot>) => {
    setSchedule((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addSlot = () => {
    setSchedule((prev) => [
      ...prev,
      { day: 'Sunday', startTime: '09:00', endTime: '11:00', location: locationOptions[0]?.value ?? '', sessionType: 'lecture' },
    ]);
  };

  const tdNum = Number(totalDegree);
  const policyOk = Number.isFinite(tdNum) && sumGradingPolicy(policy) === tdNum;

  return (
    <Modal isOpen={open} onClose={onClose} title="Edit course offering" size="xl">
      <div className="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
        {!offering ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading offering…</p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Course and term are fixed. Adjust staff, schedule, seats, or grading.
          </p>
        )}

        <Input label="Max seats" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} />
        <Input label="Total degree" value={totalDegree} onChange={(e) => setTotalDegree(e.target.value)} />

        <div className="grid gap-2 sm:grid-cols-5">
          {(['attendance', 'midterm', 'assignments', 'project', 'finalExam'] as const).map((k) => (
            <Input
              key={k}
              label={k}
              type="number"
              value={String(policy[k])}
              onChange={(e) =>
                setPolicy((p) => ({ ...p, [k]: Number(e.target.value) || 0 }))
              }
            />
          ))}
        </div>
        {!policyOk && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Grading components must sum to total degree ({sumGradingPolicy(policy)} vs {totalDegree}).
          </p>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Doctors (replace full set when saving)</p>
          <div className="max-h-28 space-y-1 overflow-y-auto rounded border p-2">
            {doctorOptions.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={doctorIds.includes(o.value)}
                  onChange={() => toggleMulti(o.value, doctorIds, setDoctorIds)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">TAs</p>
          <div className="max-h-28 space-y-1 overflow-y-auto rounded border p-2">
            {taOptions.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={taIds.includes(o.value)}
                  onChange={() => toggleMulti(o.value, taIds, setTaIds)}
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Schedule</p>
            <Button type="button" size="sm" variant="secondary" onClick={addSlot}>
              Add slot
            </Button>
          </div>
          {schedule.map((slot, i) => (
            <div key={i} className="mb-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-2 lg:grid-cols-3">
              <Select2
                label="Day"
                options={OFFERING_FORM_DAYS}
                value={slot.day}
                onChange={(v) => updateSlot(i, { day: v })}
                searchable={false}
              />
              <Input label="Start" value={slot.startTime} onChange={(e) => updateSlot(i, { startTime: e.target.value })} />
              <Input label="End" value={slot.endTime} onChange={(e) => updateSlot(i, { endTime: e.target.value })} />
              <Select2
                label="Location (id)"
                options={locationOptions}
                value={slot.location}
                onChange={(v) => updateSlot(i, { location: v })}
              />
              <Select2
                label="Session"
                options={OFFERING_SESSION_TYPES}
                value={slot.sessionType}
                onChange={(v) => updateSlot(i, { sessionType: v as ScheduleSlot['sessionType'] })}
                searchable={false}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={loading || !policyOk || !offering}
            onClick={() => {
              const ms = Number(maxSeats);
              if (!Number.isFinite(ms) || !Number.isFinite(tdNum) || !offering) return;
              const slots = schedule.filter((s) => s.location && s.startTime && s.endTime);
              void onSave({
                maxSeats: ms,
                totalDegree: tdNum,
                gradingPolicy: policy,
                doctors_ids: doctorIds,
                tas_ids: taIds,
                schedule: slots,
              });
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
