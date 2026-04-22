import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Calendar, Plus, Users, Pencil, Archive, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useCourseCatalogs } from '@/hooks/queries/usePhase3CourseCatalog';
import {
  useCourseOfferings,
  useCourseOffering,
  useCourseOfferingRoster,
  useCreateCourseOffering,
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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => ({
  value: d,
  label: d,
}));

const SESSION_TYPES: { value: ScheduleSlot['sessionType']; label: string }[] = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
];

const DEFAULT_POLICY: GradingPolicy = {
  attendance: 10,
  midterm: 20,
  assignments: 10,
  project: 10,
  finalExam: 50,
};

function sumPolicy(p: GradingPolicy): number {
  return p.attendance + p.midterm + p.assignments + p.project + p.finalExam;
}

export function CourseOfferings() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'universityAdmin' || user?.role === 'collegeAdmin';
  const { success, error: showError } = useToastStore();

  const [page, setPage] = useState(1);
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [search, setSearch] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
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
  const createMut = useCreateCourseOffering();
  const updateMut = useUpdateCourseOffering();
  const archiveMut = useArchiveCourseOffering();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course offerings</h1>
        </div>
        {canManage && (
          <Button type="button" onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create offering
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <CardTitle className="w-full lg:w-auto">Offerings</CardTitle>
            <Input
              label="Semester"
              className="max-w-xs"
              placeholder="e.g. Second"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <Input
              label="Academic year"
              className="max-w-xs"
              placeholder="e.g. 2025-2026"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="absolute left-3 top-[38px] h-4 w-4 text-gray-400" />
              <Input
                label="Search"
                className="pl-10"
                placeholder="Course code/title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">Loading…</div>
          ) : isError ? (
            <div className="py-16 text-center text-red-600">Could not load offerings.</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              No offerings match filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Grading</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <div className="font-medium">{p3CourseCode(course)}</div>
                        <div className="text-sm text-gray-600">{p3CourseTitle(course)}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {String(row.semester ?? '')} / {String(row.academicYear ?? '')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {String(row.currentEnrolled ?? 0)} / {String(row.maxSeats ?? '')}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {gp ? (sumPolicy(gp) === td ? `OK (${td})` : `Mismatch ${sumPolicy(gp)}/${td}`) : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => setRosterId(id)}>
                            <Users className="h-4 w-4" />
                          </Button>
                          {canManage && (
                            <>
                              <Button type="button" variant="secondary" size="sm" onClick={() => setEditId(id)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="secondary" size="sm" onClick={() => setArchiveId(id)}>
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
          )}
          {!isLoading && items.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination currentPage={data?.currentPage ?? page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <OfferingFormModal
          mode="create"
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSave={async (body) => {
            try {
              await createMut.mutateAsync(
                body as Parameters<typeof courseOfferingsService.createCourseOffering>[0]
              );
              success('Offering created.');
              setCreateOpen(false);
              void refetch();
            } catch (e) {
              showError(getApiErrorMessage(e));
            }
          }}
          loading={createMut.isPending}
        />
      )}

      {editId && (
        <OfferingFormModal
          mode="edit"
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
    </div>
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

function OfferingFormModal({
  mode,
  open,
  onClose,
  offering,
  onSave,
  loading,
}: {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  offering?: Record<string, unknown> | null;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  loading: boolean;
}) {
  const { data: catalogs } = useCourseCatalogs({ limit: 200, isArchived: 'false' });
  const { data: doctors } = useUsers({ role: 'doctor', limit: 100, isArchived: 'false' });
  const { data: tas } = useUsers({ role: 'ta', limit: 100, isArchived: 'false' });
  const { data: locs } = useLocations({ limit: 300, isArchived: 'false' });

  const courseOptions = useMemo(() => {
    return (catalogs?.items ?? []).map((c) => {
      const r = c as Record<string, unknown>;
      return { value: p3Id(r), label: `${String(r.code ?? '')} — ${String(r.title ?? '')}` };
    });
  }, [catalogs?.items]);

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

  const [course_id, setCourse_id] = useState('');
  const [maxSeats, setMaxSeats] = useState('50');
  const [totalDegree, setTotalDegree] = useState('100');
  const [policy, setPolicy] = useState<GradingPolicy>({ ...DEFAULT_POLICY });
  const [doctorIds, setDoctorIds] = useState<string[]>([]);
  const [taIds, setTaIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([
    { day: 'Sunday', startTime: '09:00', endTime: '11:00', location: '', sessionType: 'lecture' },
  ]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setCourse_id(courseOptions[0]?.value ?? '');
      setMaxSeats('50');
      setTotalDegree('100');
      setPolicy({ ...DEFAULT_POLICY });
      setDoctorIds([]);
      setTaIds([]);
      setSchedule([{ day: 'Sunday', startTime: '09:00', endTime: '11:00', location: '', sessionType: 'lecture' }]);
      return;
    }
    if (mode === 'edit' && offering) {
      setMaxSeats(String(offering.maxSeats ?? 50));
      setTotalDegree(String(offering.totalDegree ?? 100));
      const gp = offering.gradingPolicy as GradingPolicy | undefined;
      setPolicy(gp ? { ...gp } : { ...DEFAULT_POLICY });
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
      }
    }
  }, [open, mode, offering, courseOptions]);

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
  const policyOk = Number.isFinite(tdNum) && sumPolicy(policy) === tdNum;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create course offering' : 'Edit course offering'}
      size="xl"
    >
      <div className="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
        {mode === 'create' && (
          <Select2 label="Catalog course" options={courseOptions} value={course_id} onChange={setCourse_id} />
        )}
        {mode === 'edit' && (
          <p className="text-sm text-gray-500">Course and term are fixed. Adjust staff, schedule, seats, or grading.</p>
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
        {!policyOk && <p className="text-sm text-amber-700">Grading components must sum to total degree ({sumPolicy(policy)} vs {totalDegree}).</p>}

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
              <Select2 label="Day" options={DAYS} value={slot.day} onChange={(v) => updateSlot(i, { day: v })} searchable={false} />
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
                options={SESSION_TYPES}
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
            disabled={loading || !policyOk}
            onClick={() => {
              const ms = Number(maxSeats);
              if (!Number.isFinite(ms) || !Number.isFinite(tdNum)) return;
              const slots = schedule.filter((s) => s.location && s.startTime && s.endTime);
              if (mode === 'create') {
                if (!course_id) return;
                void onSave({
                  course_id,
                  maxSeats: ms,
                  totalDegree: tdNum,
                  gradingPolicy: policy,
                  doctors_ids: doctorIds.length ? doctorIds : undefined,
                  tas_ids: taIds.length ? taIds : undefined,
                  schedule: slots.length ? slots : undefined,
                });
              } else {
                void onSave({
                  maxSeats: ms,
                  totalDegree: tdNum,
                  gradingPolicy: policy,
                  doctors_ids: doctorIds,
                  tas_ids: taIds,
                  schedule: slots,
                });
              }
            }}
          >
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
