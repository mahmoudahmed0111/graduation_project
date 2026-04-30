import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ClipboardList, MessageSquare, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/store/toastStore';
import { useAssessment, useAssessments } from '@/hooks/queries/usePhase4Assessments';
import {
  useAssessmentSubmissions,
  useGradeSubmission,
  useSubmission,
} from '@/hooks/queries/usePhase4Submissions';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { getApiErrorMessage } from '@/lib/http/client';
import type { GradeAnswerInput } from '@/services/submissions.service';
import type { IPhase4Question, Phase4QuestionType } from '@/types';

const OBJECTIVE_TYPES: Phase4QuestionType[] = ['MCQ-Single', 'MCQ-Multiple', 'TrueFalse'];
const isObjective = (t: Phase4QuestionType) => OBJECTIVE_TYPES.includes(t);

function studentLabel(s: ReturnType<typeof useSubmission>['data']): string {
  if (!s) return '';
  const st = s.student_id;
  if (st && typeof st === 'object') return st.name;
  return String(st);
}

export function GradeSubmissions() {
  const params = useParams<{ offeringId?: string; assessmentId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error: showError } = useToastStore();
  const { offerings, isLoading: offeringsLoading } = useMyTeachingOfferings();

  const [offeringId, setOfferingId] = useState<string>(
    params.offeringId ?? searchParams.get('offeringId') ?? ''
  );
  const [assessmentId, setAssessmentId] = useState<string>(
    params.assessmentId ?? searchParams.get('assessmentId') ?? ''
  );
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('');

  const assessmentsList = useAssessments(offeringId || undefined);
  const submissionsList = useAssessmentSubmissions(assessmentId || undefined, { status: 'submitted' });
  const assessment = useAssessment(offeringId, assessmentId);
  const submissionDetail = useSubmission(selectedSubmissionId || undefined);
  const grade = useGradeSubmission(selectedSubmissionId);

  const [draft, setDraft] = useState<Record<string, { score?: number; feedback?: string }>>({});

  useEffect(() => {
    const s = submissionDetail.data;
    if (!s) {
      setDraft({});
      return;
    }
    const next: Record<string, { score?: number; feedback?: string }> = {};
    for (const a of s.answers ?? []) next[a.questionId] = { score: a.score, feedback: a.feedback };
    setDraft(next);
  }, [submissionDetail.data]);

  const questionsById = useMemo(() => {
    const map = new Map<string, IPhase4Question>();
    for (const q of assessment.data?.questions ?? []) {
      if (q._id) map.set(q._id, q);
    }
    return map;
  }, [assessment.data]);

  const handleSave = async () => {
    if (!selectedSubmissionId || !submissionDetail.data) return;
    const payload: GradeAnswerInput[] = [];
    for (const a of submissionDetail.data.answers ?? []) {
      const q = questionsById.get(a.questionId);
      const d = draft[a.questionId];
      if (!q || !d) continue;
      if (isObjective(q.questionType)) continue;
      if (d.score == null || Number.isNaN(Number(d.score))) continue;
      payload.push({ questionId: a.questionId, score: Number(d.score), feedback: d.feedback });
    }
    if (payload.length === 0) {
      showError('No grades to save.');
      return;
    }
    try {
      await grade.mutateAsync(payload);
      success('Grades saved.');
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to save grades.'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grade Submissions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manually grade subjective answers</p>
      </div>

      {(!params.offeringId || !params.assessmentId) && (
        <Card>
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Course Offering</label>
              <select
                value={offeringId}
                onChange={(e) => {
                  setOfferingId(e.target.value);
                  setAssessmentId('');
                  setSelectedSubmissionId('');
                  setSearchParams({ offeringId: e.target.value });
                }}
                disabled={offeringsLoading}
                className="field"
              >
                <option value="">{offeringsLoading ? 'Loading…' : 'Select…'}</option>
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Assessment</label>
              <select
                value={assessmentId}
                onChange={(e) => {
                  setAssessmentId(e.target.value);
                  setSelectedSubmissionId('');
                  setSearchParams({ offeringId, assessmentId: e.target.value });
                }}
                disabled={!offeringId || assessmentsList.isLoading}
                className="field"
              >
                <option value="">{assessmentsList.isLoading ? 'Loading…' : 'Select…'}</option>
                {(assessmentsList.data?.items ?? []).map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {!assessmentId ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">Pick an assessment to view submissions.</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Submissions awaiting grade</h3>
            {submissionsList.isLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Loading…</CardContent>
              </Card>
            ) : (submissionsList.data?.items.length ?? 0) === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <ClipboardList className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  No pending submissions.
                </CardContent>
              </Card>
            ) : (
              (submissionsList.data?.items ?? []).map((s) => {
                const studentName = typeof s.student_id === 'object' ? s.student_id.name : 'Student';
                return (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSubmissionId(s._id)}
                    className={`w-full text-left rounded-lg border p-3 transition ${
                      selectedSubmissionId === s._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-medium">{studentName}</div>
                    {s.submittedAt && (
                      <div className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleString()}</div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!selectedSubmissionId ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">Pick a submission to grade.</CardContent>
              </Card>
            ) : submissionDetail.isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
              </div>
            ) : !submissionDetail.data ? null : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{studentLabel(submissionDetail.data)}</span>
                      {submissionDetail.data.status === 'graded' && (
                        <span className="flex items-center gap-1 text-sm font-normal text-green-700">
                          <CheckCircle2 className="h-4 w-4" /> Graded
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                </Card>

                {(submissionDetail.data.answers ?? []).map((a, idx) => {
                  const q = questionsById.get(a.questionId);
                  if (!q) return null;
                  const d = draft[a.questionId] ?? {};
                  const objective = isObjective(q.questionType);
                  return (
                    <Card key={a.questionId ?? idx}>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs uppercase text-gray-500">{q.questionType}</span>
                            <p className="font-medium mt-1">
                              Q{idx + 1}. {q.questionText}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="text-sm bg-gray-50 rounded p-3">
                          {a.answerText ??
                            a.fileUrl ??
                            (a.selectedOptionIds?.length ? a.selectedOptionIds.join(', ') : a.selectedOptionId ?? '—')}
                        </div>

                        {objective ? (
                          <p className="text-sm text-gray-500 italic">Auto-graded · score: {a.score ?? 0}</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              label="Score"
                              type="number"
                              min={0}
                              max={q.points}
                              value={d.score ?? ''}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [a.questionId]: { ...prev[a.questionId], score: Number(e.target.value) },
                                }))
                              }
                            />
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                <MessageSquare className="h-4 w-4 inline mr-1" /> Feedback
                              </label>
                              <textarea
                                rows={2}
                                value={d.feedback ?? ''}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    [a.questionId]: { ...prev[a.questionId], feedback: e.target.value },
                                  }))
                                }
                                className="field"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                <Button onClick={handleSave} isLoading={grade.isPending} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Save Grades
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
