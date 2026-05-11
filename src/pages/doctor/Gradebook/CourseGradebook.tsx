import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Lock, Save, Send, Unlock } from 'lucide-react';
import { AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Select2 } from '@/components/ui/Select2';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { useCourseOffering } from '@/hooks/queries/usePhase3CourseOfferings';
import {
  useCourseGradebook,
  useLockSemesterWork,
  usePatchSemesterWork,
  useUnlockSemesterWork,
} from '@/hooks/queries/usePhase4Gradebook';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IPhase4GradebookEntry } from '@/types';
import type { SemesterWorkRow } from '@/services/gradebook.service';

interface DraftRow {
  studentId: string;
  attendance: string;
  midterm: string;
  project: string;
  dirty: boolean;
}

function studentLabel(e: IPhase4GradebookEntry): string {
  if (typeof e.student_id === 'object') return e.student_id.name;
  return String(e.student_id);
}

function studentId(e: IPhase4GradebookEntry): string {
  if (typeof e.student_id === 'object') return e.student_id._id;
  return String(e.student_id);
}

export function CourseGradebook() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ offeringId?: string }>();
  const { user } = useAuthStore();
  const { success, error: showError, info } = useToastStore();
  const { offerings, isLoading: offeringsLoading } = useMyTeachingOfferings();
  const [pickerOfferingId, setPickerOfferingId] = useState<string>('');
  const offeringId = params.offeringId ?? pickerOfferingId;

  const offering = useCourseOffering(offeringId || undefined);
  const isUA = user?.role === 'universityAdmin' || user?.role === 'admin' || user?.role === 'superAdmin';
  const gradebook = useCourseGradebook(offeringId && !isUA ? offeringId : undefined);
  const patch = usePatchSemesterWork(offeringId ?? '');
  const lock = useLockSemesterWork(offeringId ?? '');
  const unlock = useUnlockSemesterWork(offeringId ?? '');

  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [confirmLock, setConfirmLock] = useState(false);
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  const policy = useMemo(() => {
    const o = offering.data as Record<string, unknown> | undefined;
    const p = (o?.gradingPolicy as Record<string, number> | undefined) ?? {};
    return {
      attendance: Number(p.attendance ?? 10),
      midterm: Number(p.midterm ?? 20),
      assignments: Number(p.assignments ?? 10),
      project: Number(p.project ?? 10),
      finalExam: Number(p.finalExam ?? 50),
    };
  }, [offering.data]);

  const semesterWorkLocked =
    Boolean((offering.data as Record<string, unknown> | undefined)?.semesterWorkLocked) ||
    gradebook.data?.items.some((i) => Boolean(i.semesterWorkLocked)) === true;
  const resultsPublished =
    Boolean((offering.data as Record<string, unknown> | undefined)?.resultsPublished) ||
    gradebook.data?.items.some((i) => Boolean(i.resultsPublished)) === true;

  useEffect(() => {
    const items = gradebook.data?.items ?? [];
    const next: Record<string, DraftRow> = {};
    for (const e of items) {
      const sid = studentId(e);
      next[sid] = {
        studentId: sid,
        attendance: e.grades.attendance != null ? String(e.grades.attendance) : '',
        midterm: e.grades.midterm != null ? String(e.grades.midterm) : '',
        project: e.grades.project != null ? String(e.grades.project) : '',
        dirty: false,
      };
    }
    setDrafts(next);
  }, [gradebook.data]);

  const updateDraft = (sid: string, key: 'attendance' | 'midterm' | 'project', value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [sid]: { ...prev[sid], [key]: value, dirty: true },
    }));
  };

  const dirtyCount = useMemo(() => Object.values(drafts).filter((d) => d.dirty).length, [drafts]);

  const handleSave = async () => {
    if (!offeringId) return;
    if (semesterWorkLocked) {
      showError(t('doctor.courseGradebook.semesterLocked'));
      return;
    }
    const payload: SemesterWorkRow[] = Object.values(drafts)
      .filter((d) => d.dirty)
      .map((d) => {
        const row: SemesterWorkRow = { studentId: d.studentId };
        if (d.attendance !== '') row.attendance = Number(d.attendance);
        if (d.midterm !== '') row.midterm = Number(d.midterm);
        if (d.project !== '') row.project = Number(d.project);
        return row;
      });
    if (payload.length === 0) {
      info(t('doctor.courseGradebook.nothingToSave'));
      return;
    }
    try {
      const res = await patch.mutateAsync(payload);
      success(t('doctor.courseGradebook.updatedStudents', { count: res.updated }));
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.courseGradebook.failedSave')));
    }
  };

  const handleLock = async () => {
    setConfirmLock(false);
    if (!offeringId) return;
    try {
      const res = await lock.mutateAsync();
      success(t('doctor.courseGradebook.locked', { count: res.ghostSubmissionsProcessed }));
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.courseGradebook.failedLock')));
    }
  };

  const handleUnlock = async () => {
    setConfirmUnlock(false);
    if (!offeringId) return;
    try {
      const res = await unlock.mutateAsync();
      success(res.message);
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.courseGradebook.failedUnlock')));
    }
  };

  const canLock = user?.role === 'doctor' || user?.role === 'teacher' || user?.role === 'collegeAdmin' || user?.role === 'universityAdmin';
  const canUnlock = canLock && !resultsPublished;

  const stateBadge = resultsPublished
    ? { label: t('doctor.courseGradebook.statePublished'), variant: 'success' as const }
    : semesterWorkLocked
    ? { label: t('doctor.courseGradebook.stateLocked'), variant: 'neutral' as const }
    : { label: t('doctor.courseGradebook.stateEditable'), variant: 'neutral' as const };

  return (
    <AdminPageShell
      titleStack={{ section: t('doctor.courseGradebook.section'), page: t('doctor.courseGradebook.page') }}
      subtitle={t('doctor.courseGradebook.subtitle')}
      badge={stateBadge}
    >

      {!params.offeringId && (
        <Card>
          <CardContent className="p-4">
            <Select2
              label={t('doctor.courseGradebook.courseOfferingLabel')}
              value={pickerOfferingId}
              onChange={setPickerOfferingId}
              placeholder={offeringsLoading ? t('doctor.courseGradebook.loadingOfferings') : t('doctor.courseGradebook.searchOffering')}
              options={offerings.map((o) => ({
                value: o.id,
                label: o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id,
              }))}
            />
          </CardContent>
        </Card>
      )}

      {!offeringId ? null : isUA ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900 dark:text-white">
                  {t('doctor.courseGradebook.uaNotAvailable')}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('doctor.courseGradebook.uaExplanation')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : gradebook.isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('doctor.courseGradebook.studentsCaps', { count: gradebook.data?.items.length ?? 0, attendance: policy.attendance, midterm: policy.midterm, assignments: policy.assignments, project: policy.project, final: policy.finalExam })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-surface-2">
                  <tr className="text-left border-b border-gray-200 dark:border-dark-border">
                    <th className="py-2 pr-4 px-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colStudent')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colAttendance')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colMidterm')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colAssignments')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colProject')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colFinalExam')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colTotal')}</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">{t('doctor.courseGradebook.colLetter')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface">
                  {(gradebook.data?.items ?? []).map((e) => {
                    const sid = studentId(e);
                    const d = drafts[sid] ?? { attendance: '', midterm: '', project: '', studentId: sid, dirty: false };
                    const editable = !semesterWorkLocked;
                    return (
                      <tr
                        key={sid}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-surface-2"
                      >
                        <td className="py-2 pr-4 px-2 font-medium text-gray-900 dark:text-gray-100">{studentLabel(e)}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            max={policy.attendance}
                            disabled={!editable}
                            value={d.attendance}
                            onChange={(ev) => updateDraft(sid, 'attendance', ev.target.value)}
                            className="field-sm w-20"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            max={policy.midterm}
                            disabled={!editable}
                            value={d.midterm}
                            onChange={(ev) => updateDraft(sid, 'midterm', ev.target.value)}
                            className="field-sm w-20"
                          />
                        </td>
                        <td className="py-2 pr-2 text-gray-500 dark:text-gray-400">{e.grades.assignments ?? 0}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            max={policy.project}
                            disabled={!editable}
                            value={d.project}
                            onChange={(ev) => updateDraft(sid, 'project', ev.target.value)}
                            className="field-sm w-20"
                          />
                        </td>
                        <td className="py-2 pr-2 text-gray-500 dark:text-gray-400">{e.grades.finalExam ?? 0}</td>
                        <td className="py-2 pr-2 text-gray-900 dark:text-gray-100">{e.grades.finalTotal ?? '—'}</td>
                        <td className="py-2 pr-2 font-semibold text-gray-900 dark:text-gray-100">{e.grades.finalLetter ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {offeringId && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={semesterWorkLocked || dirtyCount === 0} isLoading={patch.isPending}>
            <Save className="h-4 w-4 mr-2" /> {t('doctor.courseGradebook.saveChanges', { count: dirtyCount })}
          </Button>
          {canLock && !semesterWorkLocked && (
            <Button variant="outline" onClick={() => setConfirmLock(true)}>
              <Lock className="h-4 w-4 mr-2" /> {t('doctor.courseGradebook.lockSemester')}
            </Button>
          )}
          {canUnlock && semesterWorkLocked && !resultsPublished && (
            <Button variant="ghost" onClick={() => setConfirmUnlock(true)}>
              <Unlock className="h-4 w-4 mr-2" /> {t('doctor.courseGradebook.unlockAudit')}
            </Button>
          )}
          {semesterWorkLocked && !resultsPublished && (user?.role === 'collegeAdmin' || user?.role === 'admin') && (
            <Button variant="primary" onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/final-exam`)}>
              <Send className="h-4 w-4 mr-2" /> {t('doctor.courseGradebook.finalExamEntry')}
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmLock}
        onClose={() => setConfirmLock(false)}
        onConfirm={handleLock}
        title={t('doctor.courseGradebook.confirmLockTitle')}
        message={
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <span>
                {t('doctor.courseGradebook.confirmLockWarning')}
              </span>
            </div>
            <p>{t('doctor.courseGradebook.continue')}</p>
          </div>
        }
        confirmText={t('doctor.courseGradebook.lock')}
        variant="warning"
        isLoading={lock.isPending}
      />
      <ConfirmDialog
        isOpen={confirmUnlock}
        onClose={() => setConfirmUnlock(false)}
        onConfirm={handleUnlock}
        title={t('doctor.courseGradebook.confirmUnlockTitle')}
        message={t('doctor.courseGradebook.confirmUnlockMessage')}
        confirmText={t('doctor.courseGradebook.unlock')}
        variant="warning"
        isLoading={unlock.isPending}
      />
    </AdminPageShell>
  );
}
