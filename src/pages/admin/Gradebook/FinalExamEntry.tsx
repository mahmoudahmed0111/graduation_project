import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToastStore } from '@/store/toastStore';
import { useCourseOffering } from '@/hooks/queries/usePhase3CourseOfferings';
import {
  useCourseGradebook,
  usePatchFinalExam,
  usePublishResults,
} from '@/hooks/queries/usePhase4Gradebook';
import { getApiErrorMessage } from '@/lib/http/client';
import type { FinalExamRow } from '@/services/gradebook.service';
import type { IPhase4GradebookEntry } from '@/types';

function studentLabel(e: IPhase4GradebookEntry): string {
  if (typeof e.student_id === 'object') return e.student_id.name;
  return String(e.student_id);
}
function studentId(e: IPhase4GradebookEntry): string {
  if (typeof e.student_id === 'object') return e.student_id._id;
  return String(e.student_id);
}

export function FinalExamEntry() {
  const { offeringId } = useParams<{ offeringId: string }>();
  const { success, error: showError, info } = useToastStore();
  const offering = useCourseOffering(offeringId);
  const gradebook = useCourseGradebook(offeringId);
  const patch = usePatchFinalExam(offeringId ?? '');
  const publish = usePublishResults(offeringId ?? '');

  const [drafts, setDrafts] = useState<Record<string, { value: string; dirty: boolean }>>({});
  const [confirmPublish, setConfirmPublish] = useState(false);

  const finalCap = useMemo(() => {
    const o = offering.data as Record<string, unknown> | undefined;
    const p = (o?.gradingPolicy as Record<string, number> | undefined) ?? {};
    return Number(p.finalExam ?? 50);
  }, [offering.data]);

  const semesterWorkLocked = Boolean((offering.data as Record<string, unknown> | undefined)?.semesterWorkLocked);
  const resultsPublished = Boolean((offering.data as Record<string, unknown> | undefined)?.resultsPublished);

  useEffect(() => {
    const items = gradebook.data?.items ?? [];
    const next: Record<string, { value: string; dirty: boolean }> = {};
    for (const e of items) {
      next[studentId(e)] = { value: e.grades.finalExam != null ? String(e.grades.finalExam) : '', dirty: false };
    }
    setDrafts(next);
  }, [gradebook.data]);

  const dirtyCount = Object.values(drafts).filter((d) => d.dirty).length;

  const handleSave = async () => {
    if (!offeringId) return;
    const payload: FinalExamRow[] = Object.entries(drafts)
      .filter(([, d]) => d.dirty && d.value !== '')
      .map(([sid, d]) => ({ studentId: sid, finalExam: Number(d.value) }));
    if (payload.length === 0) {
      info('Nothing to save.');
      return;
    }
    try {
      const res = await patch.mutateAsync(payload);
      success(`Updated ${res.updated} student(s).`);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to save final exam grades.'));
    }
  };

  const handlePublish = async () => {
    setConfirmPublish(false);
    if (!offeringId) return;
    try {
      const res = await publish.mutateAsync();
      success(`Published. ${res.passed} passed, ${res.failed} failed.`);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to publish results.'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Final Exam Entry</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Cap: {finalCap}. Requires semester work locked, blocked after publish.
        </p>
      </div>

      {!semesterWorkLocked && (
        <Card>
          <CardContent className="p-6 text-amber-700 bg-amber-50 border border-amber-200 rounded">
            Semester work must be locked before final exam grades can be entered.
          </CardContent>
        </Card>
      )}

      {gradebook.isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Students ({gradebook.data?.items.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-surface-2">
                  <tr className="text-left border-b border-gray-200 dark:border-dark-border">
                    <th className="py-2 pr-4 px-2 text-gray-700 dark:text-gray-300">Student</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">Attendance</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">Midterm</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">Assignments</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">Project</th>
                    <th className="py-2 pr-2 text-gray-700 dark:text-gray-300">Final Exam *</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface">
                  {(gradebook.data?.items ?? []).map((e) => {
                    const sid = studentId(e);
                    const d = drafts[sid] ?? { value: '', dirty: false };
                    return (
                      <tr
                        key={sid}
                        className="border-b border-gray-100 hover:bg-gray-50 dark:border-dark-border dark:hover:bg-dark-surface-2"
                      >
                        <td className="py-2 pr-4 px-2 font-medium text-gray-900 dark:text-gray-100">{studentLabel(e)}</td>
                        <td className="py-2 pr-2 text-gray-500 dark:text-gray-400">{e.grades.attendance ?? 0}</td>
                        <td className="py-2 pr-2 text-gray-500 dark:text-gray-400">{e.grades.midterm ?? 0}</td>
                        <td className="py-2 pr-2 text-gray-500 dark:text-gray-400">{e.grades.assignments ?? 0}</td>
                        <td className="py-2 pr-2 text-gray-500 dark:text-gray-400">{e.grades.project ?? 0}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            max={finalCap}
                            disabled={!semesterWorkLocked || resultsPublished}
                            value={d.value}
                            onChange={(ev) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [sid]: { value: ev.target.value, dirty: true },
                              }))
                            }
                            className="field-sm w-24"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={!semesterWorkLocked || resultsPublished || dirtyCount === 0} isLoading={patch.isPending}>
          <Save className="h-4 w-4 mr-2" /> Save final exam ({dirtyCount})
        </Button>
        <Button
          variant="primary"
          onClick={() => setConfirmPublish(true)}
          disabled={!semesterWorkLocked || resultsPublished}
          isLoading={publish.isPending}
        >
          <Send className="h-4 w-4 mr-2" /> Publish Results
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmPublish}
        onClose={() => setConfirmPublish(false)}
        onConfirm={handlePublish}
        title="Publish results"
        message="This computes finalTotal/letter, sets pass/fail, rebuilds GPA & credits. Cannot be reversed via API."
        confirmText="Publish"
        variant="danger"
      />
    </div>
  );
}
