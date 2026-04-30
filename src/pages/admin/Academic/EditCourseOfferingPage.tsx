import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { useToastStore } from '@/store/toastStore';
import {
  useCourseOffering,
  useUpdateCourseOffering,
} from '@/hooks/queries/usePhase3CourseOfferings';
import { useUsers } from '@/hooks/queries/useUsers';
import { useLocations } from '@/hooks/queries/useLocations';
import { getApiErrorMessage } from '@/lib/http/client';
import type { GradingPolicy, ScheduleSlot } from '@/services/courseOfferings.service';
import { p3CourseCode, p3CourseTitle, p3Id } from '@/lib/phase3Ui';
import {
  DEFAULT_GRADING_POLICY,
  OFFERING_FORM_DAYS,
  OFFERING_SESSION_TYPES,
  sumGradingPolicy,
} from './courseOfferingFormConstants';

function readIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((x) =>
      typeof x === 'string'
        ? x
        : x && typeof x === 'object' && '_id' in x
        ? String((x as { _id: string })._id)
        : ''
    )
    .filter(Boolean);
}

export function EditCourseOfferingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToastStore();

  const { data: offering, isLoading, isError } = useCourseOffering(id);
  const updateMut = useUpdateCourseOffering();

  const { data: doctors } = useUsers({ role: 'doctor', limit: 100, isArchived: 'false' });
  const { data: tas } = useUsers({ role: 'ta', limit: 100, isArchived: 'false' });
  const { data: locs } = useLocations({ limit: 300, isArchived: 'false' });

  const doctorOptions = useMemo(
    () =>
      (doctors?.items ?? []).map((u) => {
        const r = u as unknown as Record<string, unknown>;
        return { value: p3Id(r), label: String(r.name ?? r.email ?? '') };
      }),
    [doctors?.items]
  );
  const taOptions = useMemo(
    () =>
      (tas?.items ?? []).map((u) => {
        const r = u as unknown as Record<string, unknown>;
        return { value: p3Id(r), label: String(r.name ?? r.email ?? '') };
      }),
    [tas?.items]
  );
  const locationOptions = useMemo(
    () =>
      (locs?.items ?? []).map((l) => {
        const r = l as Record<string, unknown>;
        return { value: p3Id(r), label: String(r.name ?? '') };
      }),
    [locs?.items]
  );

  const [maxSeats, setMaxSeats] = useState('50');
  const [totalDegree, setTotalDegree] = useState('100');
  const [policy, setPolicy] = useState<GradingPolicy>({ ...DEFAULT_GRADING_POLICY });
  const [doctorIds, setDoctorIds] = useState<string[]>([]);
  const [taIds, setTaIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([
    { day: 'Sunday', startTime: '09:00', endTime: '11:00', location: '', sessionType: 'lecture' },
  ]);

  useEffect(() => {
    if (!offering) return;
    const o = offering as Record<string, unknown>;
    setMaxSeats(String(o.maxSeats ?? 50));
    setTotalDegree(String(o.totalDegree ?? 100));
    const gp = o.gradingPolicy as GradingPolicy | undefined;
    setPolicy(gp ? { ...gp } : { ...DEFAULT_GRADING_POLICY });
    setDoctorIds(readIdList(o.doctors_ids ?? o.doctors));
    setTaIds(readIdList(o.tas_ids ?? o.tas));
    const sch = o.schedule as ScheduleSlot[] | undefined;
    if (Array.isArray(sch) && sch.length) {
      setSchedule(
        sch.map((s) => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          location:
            typeof s.location === 'object' && s.location && '_id' in (s.location as object)
              ? String((s.location as { _id: string })._id)
              : String(s.location ?? ''),
          sessionType: s.sessionType,
        }))
      );
    }
  }, [offering]);

  const toggleMulti = (idVal: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(idVal) ? list.filter((x) => x !== idVal) : [...list, idVal]);
  };

  const updateSlot = (i: number, patch: Partial<ScheduleSlot>) => {
    setSchedule((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addSlot = () => {
    setSchedule((prev) => [
      ...prev,
      {
        day: 'Sunday',
        startTime: '09:00',
        endTime: '11:00',
        location: locationOptions[0]?.value ?? '',
        sessionType: 'lecture',
      },
    ]);
  };

  const removeSlot = (i: number) => {
    setSchedule((prev) => prev.filter((_, idx) => idx !== i));
  };

  const tdNum = Number(totalDegree);
  const policyOk = Number.isFinite(tdNum) && sumGradingPolicy(policy) === tdNum;

  const handleSave = async () => {
    if (!id) return;
    const ms = Number(maxSeats);
    if (!Number.isFinite(ms) || !Number.isFinite(tdNum)) {
      showError('Max seats and total degree must be numbers.');
      return;
    }
    if (!policyOk) {
      showError('Grading components must sum to total degree.');
      return;
    }
    const slots = schedule.filter((s) => s.location && s.startTime && s.endTime);
    try {
      await updateMut.mutateAsync({
        id,
        data: {
          maxSeats: ms,
          totalDegree: tdNum,
          gradingPolicy: policy,
          doctors_ids: doctorIds,
          tas_ids: taIds,
          schedule: slots,
        },
      });
      success('Course offering updated.');
      navigate('/dashboard/academic/offerings');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to update offering.'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (isError || !offering) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-red-600">Course offering not found.</CardContent>
      </Card>
    );
  }

  const o = offering as Record<string, unknown>;
  const code = p3CourseCode(o);
  const title = p3CourseTitle(o);

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/academic/offerings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit course offering</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {code} — {title}{' '}
            {o.semester ? <span>· {String(o.semester)}{o.academicYear ? ` ${String(o.academicYear)}` : ''}</span> : null}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Course and term are fixed. Adjust staff, schedule, seats, or grading.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Max seats" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} />
            <Input label="Total degree" value={totalDegree} onChange={(e) => setTotalDegree(e.target.value)} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Grading policy</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {(['attendance', 'midterm', 'assignments', 'project', 'finalExam'] as const).map((k) => (
                <Input
                  key={k}
                  label={k}
                  type="number"
                  value={String(policy[k])}
                  onChange={(e) => setPolicy((p) => ({ ...p, [k]: Number(e.target.value) || 0 }))}
                />
              ))}
            </div>
            {!policyOk && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Grading components must sum to total degree ({sumGradingPolicy(policy)} vs {totalDegree}).
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Doctors (replace full set when saving)
              </p>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-gray-200 p-2 dark:border-dark-border">
                {doctorOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={doctorIds.includes(opt.value)}
                      onChange={() => toggleMulti(opt.value, doctorIds, setDoctorIds)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">TAs</p>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-gray-200 p-2 dark:border-dark-border">
                {taOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={taIds.includes(opt.value)}
                      onChange={() => toggleMulti(opt.value, taIds, setTaIds)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</p>
              <Button type="button" size="sm" variant="secondary" onClick={addSlot}>
                Add slot
              </Button>
            </div>
            {schedule.map((slot, i) => (
              <div
                key={i}
                className="mb-3 grid gap-2 rounded-lg border border-gray-200 p-3 dark:border-dark-border sm:grid-cols-2 lg:grid-cols-3"
              >
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
                  label="Location"
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
                <div className="flex items-end">
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeSlot(i)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 dark:border-dark-border">
            <Link to="/dashboard/academic/offerings">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="button" variant="primary" onClick={handleSave} disabled={updateMut.isPending || !policyOk}>
              <Save className="mr-2 h-4 w-4" />
              {updateMut.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
