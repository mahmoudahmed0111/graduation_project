import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, Clock, Save, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStartAssessment } from '@/hooks/queries/usePhase4Assessments';
import { useSaveAnswers, useSubmitSubmission } from '@/hooks/queries/usePhase4Submissions';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IPhase4Answer, IPhase4Assessment, IPhase4Submission } from '@/types';

const AUTOSAVE_INTERVAL_MS = 10_000;

interface AnswerState {
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  answerText?: string;
  fileUrl?: string;
}

function answersToList(state: Record<string, AnswerState>): IPhase4Answer[] {
  return Object.entries(state).map(([questionId, val]) => ({
    questionId,
    ...val,
  }));
}

function seedAnswerStateFromSubmission(submission?: IPhase4Submission | null): Record<string, AnswerState> {
  const out: Record<string, AnswerState> = {};
  if (!submission?.answers) return out;
  for (const a of submission.answers) {
    out[a.questionId] = {
      selectedOptionId: a.selectedOptionId,
      selectedOptionIds: a.selectedOptionIds,
      answerText: a.answerText,
      fileUrl: a.fileUrl,
    };
  }
  return out;
}

export function TakeAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offeringId, id } = useParams<{ offeringId: string; id: string }>();
  const { success, error: showError, info } = useToastStore();

  const start = useStartAssessment(offeringId ?? '');
  const [assessment, setAssessment] = useState<IPhase4Assessment | null>(null);
  const [submission, setSubmission] = useState<IPhase4Submission | null>(null);
  const [deadline, setDeadline] = useState<string | undefined>(undefined);
  const [answerState, setAnswerState] = useState<Record<string, AnswerState>>({});
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const dirtyRef = useRef(false);

  const save = useSaveAnswers(submission?._id ?? '');
  const finalize = useSubmitSubmission(submission?._id ?? '');

  // Boot once.
  useEffect(() => {
    if (!offeringId || !id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await start.mutateAsync(id);
        if (cancelled) return;
        if (res.autoSubmitted) {
          info(t('student.takeAssessment.timeExpired'));
          if (res.submission?._id) navigate(`/dashboard/submissions/${res.submission._id}`);
          return;
        }
        setAssessment(res.assessment);
        setSubmission(res.submission);
        setDeadline(res.deadline);
        setAnswerState(seedAnswerStateFromSubmission(res.submission));
      } catch (err) {
        showError(getApiErrorMessage(err, t('student.takeAssessment.startFailed')));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId, id]);

  // Tick clock for the cosmetic countdown.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Autosave loop.
  useEffect(() => {
    if (!submission?._id) return;
    const timer = setInterval(() => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      save.mutate(
        { answers: answersToList(answerState) },
        {
          onSuccess: (res) => {
            if (res.autoSubmitted) {
              info(t('student.takeAssessment.timeExpired'));
              navigate(`/dashboard/submissions/${res.submission._id}`);
            }
          },
          onError: () => {
            dirtyRef.current = true; // retry next tick
          },
        }
      );
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [submission?._id, answerState, save, info, navigate]);

  const setAnswer = (questionId: string, patch: Partial<AnswerState>) => {
    setAnswerState((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...patch } }));
    dirtyRef.current = true;
  };

  const remainingMs = useMemo(() => {
    if (!deadline) return null;
    return new Date(deadline).getTime() - now;
  }, [deadline, now]);

  const remainingLabel = useMemo(() => {
    if (remainingMs == null) return null;
    const total = Math.max(0, Math.floor(remainingMs / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [remainingMs]);

  const handleSubmit = async () => {
    if (!submission?._id) return;
    setSubmitting(true);
    try {
      // Flush latest answers, then finalize.
      await save.mutateAsync({ answers: answersToList(answerState) });
      const res = await finalize.mutateAsync();
      if (res.autoSubmitted) {
        info('Time expired — your answers were submitted automatically.');
      } else {
        success(t('student.takeAssessment.submitted'));
      }
      navigate(`/dashboard/submissions/${res.submission._id}`);
    } catch (err) {
      showError(getApiErrorMessage(err, t('student.takeAssessment.submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  if (start.isPending && !assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!assessment || !submission) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-red-600">{t('student.takeAssessment.couldNotLoad')}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur p-4 -m-4 z-10 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{assessment.title}</h1>
          <p className="text-sm text-gray-500">{t('student.takeAssessment.ptsCount', { count: assessment.totalPoints })}</p>
        </div>
        {remainingLabel && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              (remainingMs ?? 0) < 60_000 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">{remainingLabel}</span>
          </div>
        )}
      </div>

      {assessment.questions?.map((q, idx) => {
        const a = answerState[q._id ?? ''] ?? {};
        return (
          <Card key={q._id ?? idx}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span>
                  Q{idx + 1}. {q.questionText}
                </span>
                <span className="text-sm font-normal text-gray-500">{t('student.takeAssessment.ptCount', { count: q.points })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {q.questionType === 'MCQ-Single' && q.options && (
                <div className="space-y-2">
                  {q.options.map((o) => (
                    <label key={o._id} className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        checked={a.selectedOptionId === o._id}
                        onChange={() => setAnswer(q._id!, { selectedOptionId: o._id, selectedOptionIds: undefined, answerText: undefined })}
                      />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.questionType === 'MCQ-Multiple' && q.options && (
                <div className="space-y-2">
                  {q.options.map((o) => {
                    const selected = (a.selectedOptionIds ?? []).includes(o._id ?? '');
                    return (
                      <label key={o._id} className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const set = new Set(a.selectedOptionIds ?? []);
                            if (e.target.checked) set.add(o._id ?? '');
                            else set.delete(o._id ?? '');
                            setAnswer(q._id!, { selectedOptionIds: Array.from(set), selectedOptionId: undefined, answerText: undefined });
                          }}
                        />
                        <span>{o.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {q.questionType === 'TrueFalse' && q.options && (
                <div className="space-y-2">
                  {q.options.map((o) => (
                    <label key={o._id} className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        checked={(a.answerText ?? '').toLowerCase() === o.text.toLowerCase()}
                        onChange={() => setAnswer(q._id!, { answerText: o.text, selectedOptionId: undefined, selectedOptionIds: undefined })}
                      />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </div>
              )}
              {q.questionType === 'Short-Answer' && (
                <input
                  type="text"
                  value={a.answerText ?? ''}
                  onChange={(e) => setAnswer(q._id!, { answerText: e.target.value })}
                  className="field"
                  placeholder={t('student.takeAssessment.yourAnswerPlaceholder')}
                />
              )}
              {q.questionType === 'Paragraph' && (
                <textarea
                  rows={5}
                  value={a.answerText ?? ''}
                  onChange={(e) => setAnswer(q._id!, { answerText: e.target.value })}
                  className="field"
                  placeholder={t('student.takeAssessment.yourAnswerPlaceholder')}
                />
              )}
              {q.questionType === 'FileUpload' && (
                <div className="p-3 border border-amber-300 bg-amber-50 rounded text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>
                    {t('student.takeAssessment.fileUploadNotice')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex gap-4 sticky bottom-0 bg-white/80 backdrop-blur p-4 -m-4 border-t border-gray-100">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => save.mutate({ answers: answersToList(answerState) }, { onSuccess: () => success(t('student.takeAssessment.saved')) })}
          isLoading={save.isPending}
        >
          <Save className="h-4 w-4 mr-2" /> {t('student.takeAssessment.saveDraft')}
        </Button>
        <Button type="button" className="flex-1" onClick={handleSubmit} isLoading={submitting}>
          <Send className="h-4 w-4 mr-2" /> {t('student.takeAssessment.submit')}
        </Button>
      </div>
    </div>
  );
}
