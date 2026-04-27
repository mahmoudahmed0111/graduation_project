import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useCourseCatalogs } from '@/hooks/queries/usePhase3CourseCatalog';
import { useCreateCourseOffering } from '@/hooks/queries/usePhase3CourseOfferings';
import { useUsers } from '@/hooks/queries/useUsers';
import { useLocations } from '@/hooks/queries/useLocations';
import { getApiErrorMessage } from '@/lib/http/client';
import type { GradingPolicy, ScheduleSlot } from '@/services/courseOfferings.service';
import { p3Id } from '@/lib/phase3Ui';
import {
  DEFAULT_GRADING_POLICY,
  OFFERING_FORM_DAYS,
  OFFERING_SESSION_TYPES,
  sumGradingPolicy,
} from './courseOfferingFormConstants';

export function CreateCourseOfferingPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const createMut = useCreateCourseOffering();

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
  const [policy, setPolicy] = useState<GradingPolicy>({ ...DEFAULT_GRADING_POLICY });
  const [doctorIds, setDoctorIds] = useState<string[]>([]);
  const [taIds, setTaIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([
    { day: 'Sunday', startTime: '09:00', endTime: '11:00', location: '', sessionType: 'lecture' },
  ]);

  useEffect(() => {
    if (!course_id && courseOptions[0]?.value) {
      setCourse_id(courseOptions[0].value);
    }
  }, [course_id, courseOptions]);

  const toggleMulti = (id: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
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

  const tdNum = Number(totalDegree);
  const policyOk = Number.isFinite(tdNum) && sumGradingPolicy(policy) === tdNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ms = Number(maxSeats);
    if (!Number.isFinite(ms) || !Number.isFinite(tdNum) || !course_id) {
      showError('Select a catalog course and enter valid seats / total degree.');
      return;
    }
    if (!policyOk) {
      showError('Grading components must sum to total degree.');
      return;
    }
    const slots = schedule.filter((s) => s.location && s.startTime && s.endTime);
    try {
      await createMut.mutateAsync({
        course_id,
        maxSeats: ms,
        totalDegree: tdNum,
        gradingPolicy: policy,
        doctors_ids: doctorIds.length ? doctorIds : undefined,
        tas_ids: taIds.length ? taIds : undefined,
        schedule: slots.length ? slots : undefined,
      });
      success('Offering created.');
      navigate('/dashboard/academic/offerings');
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/academic/offerings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create course offering</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Select2 label="Catalog course *" options={courseOptions} value={course_id} onChange={setCourse_id} />
              </div>
              <Input label="Max seats *" value={maxSeats} onChange={(e) => setMaxSeats(e.target.value)} />
              <Input label="Total degree *" value={totalDegree} onChange={(e) => setTotalDegree(e.target.value)} />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Grading policy (must sum to total degree)</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
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
                  Sum is {sumGradingPolicy(policy)} vs total {totalDegree}.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Doctors</p>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-dark-border">
                  {doctorOptions.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={doctorIds.includes(o.value)}
                        onChange={() => toggleMulti(o.value, doctorIds, setDoctorIds)}
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Teaching assistants</p>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-dark-border">
                  {taOptions.map((o) => (
                    <label key={o.value} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={taIds.includes(o.value)}
                        onChange={() => toggleMulti(o.value, taIds, setTaIds)}
                      />
                      {o.label}
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
                  className="mb-3 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 dark:border-dark-border md:grid-cols-2"
                >
                  <Select2
                    label="Day"
                    options={OFFERING_FORM_DAYS}
                    value={slot.day}
                    onChange={(v) => updateSlot(i, { day: v })}
                    searchable={false}
                  />
                  <Select2
                    label="Session"
                    options={OFFERING_SESSION_TYPES}
                    value={slot.sessionType}
                    onChange={(v) => updateSlot(i, { sessionType: v as ScheduleSlot['sessionType'] })}
                    searchable={false}
                  />
                  <Input label="Start" value={slot.startTime} onChange={(e) => updateSlot(i, { startTime: e.target.value })} />
                  <Input label="End" value={slot.endTime} onChange={(e) => updateSlot(i, { endTime: e.target.value })} />
                  <div className="md:col-span-2">
                    <Select2
                      label="Location"
                      options={locationOptions}
                      value={slot.location}
                      onChange={(v) => updateSlot(i, { location: v })}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" variant="primary" disabled={createMut.isPending || !policyOk} className="w-full sm:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {createMut.isPending ? 'Saving…' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
