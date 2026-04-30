import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/store/toastStore';
import { useCreateAssessment } from '@/hooks/queries/usePhase4Assessments';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IPhase4Question, IPhase4QuestionOption, Phase4QuestionType } from '@/types';

const QUESTION_TYPES: Phase4QuestionType[] = [
  'MCQ-Single',
  'MCQ-Multiple',
  'TrueFalse',
  'Short-Answer',
  'Paragraph',
  'FileUpload',
];

const OBJECTIVE_TYPES: Phase4QuestionType[] = ['MCQ-Single', 'MCQ-Multiple', 'TrueFalse'];

interface DraftQuestion {
  questionText: string;
  questionType: Phase4QuestionType;
  points: number;
  isRequired: boolean;
  options: IPhase4QuestionOption[];
  modelAnswer?: string;
}

function blankQuestion(): DraftQuestion {
  return {
    questionText: '',
    questionType: 'MCQ-Single',
    points: 1,
    isRequired: true,
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  };
}

function isObjective(type: Phase4QuestionType): boolean {
  return OBJECTIVE_TYPES.includes(type);
}

export function CreateAssessment() {
  const navigate = useNavigate();
  const params = useParams<{ offeringId?: string }>();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToastStore();
  const { offerings, isLoading: offeringsLoading } = useMyTeachingOfferings();

  const initialOfferingId = params.offeringId ?? searchParams.get('offeringId') ?? '';
  const [offeringId, setOfferingId] = useState(initialOfferingId);

  const create = useCreateAssessment(offeringId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>('');
  const [doctorDeclaredTotal, setDoctorDeclaredTotal] = useState<string>('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);

  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showGradesImmediately, setShowGradesImmediately] = useState(false);
  const [acceptingResponses, setAcceptingResponses] = useState(true);
  const [allowEditAfterSubmit, setAllowEditAfterSubmit] = useState(false);
  const [limitToOneResponse, setLimitToOneResponse] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState('Your response has been recorded.');

  const calculatedTotal = useMemo(
    () => questions.reduce((acc, q) => acc + (Number.isFinite(q.points) ? q.points : 0), 0),
    [questions]
  );
  const declaredTotalNumber = doctorDeclaredTotal === '' ? null : Number(doctorDeclaredTotal);
  const totalMismatch =
    declaredTotalNumber != null && declaredTotalNumber !== calculatedTotal;

  const updateQuestion = (idx: number, patch: Partial<DraftQuestion>) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const onTypeChange = (idx: number, newType: Phase4QuestionType) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== idx) return q;
        if (newType === 'TrueFalse') {
          return {
            ...q,
            questionType: newType,
            options: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false },
            ],
          };
        }
        if (isObjective(newType)) {
          return {
            ...q,
            questionType: newType,
            options:
              q.options.length >= 2
                ? q.options
                : [
                    { text: '', isCorrect: true },
                    { text: '', isCorrect: false },
                  ],
          };
        }
        return { ...q, questionType: newType, options: [] };
      })
    );
  };

  const addOption = (qi: number) => {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: [...q.options, { text: '', isCorrect: false }] } : q)));
  };
  const removeOption = (qi: number, oi: number) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q))
    );
  };

  function validate(): string | null {
    if (!offeringId) return 'Course offering is required.';
    if (!title.trim()) return 'Title is required.';
    if (!dueDate) return 'Due date is required.';
    if (questions.length === 0) return 'At least one question is required.';
    if (totalMismatch) return `Total points mismatch: declared ${declaredTotalNumber}, calculated ${calculatedTotal}.`;
    for (const [idx, q] of questions.entries()) {
      if (!q.questionText.trim()) return `Question ${idx + 1}: text is required.`;
      if (q.points <= 0) return `Question ${idx + 1}: points must be > 0.`;
      if (isObjective(q.questionType)) {
        if (q.options.length === 0) return `Question ${idx + 1}: objective questions must have options.`;
        if (!q.options.some((o) => o.isCorrect)) return `Question ${idx + 1}: at least one option must be correct.`;
        if (q.options.some((o) => !o.text.trim())) return `Question ${idx + 1}: option text cannot be empty.`;
      } else {
        if (q.options.length > 0) return `Question ${idx + 1}: subjective questions cannot have options.`;
      }
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showError(err);
      return;
    }
    const payload: Parameters<typeof create.mutateAsync>[0] = {
      title,
      description: description || undefined,
      dueDate: new Date(dueDate).toISOString(),
      timeLimitMinutes: timeLimitMinutes === '' ? null : Number(timeLimitMinutes),
      doctorDeclaredTotal: declaredTotalNumber ?? undefined,
      questions: questions.map<IPhase4Question>((q) => ({
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points,
        isRequired: q.isRequired,
        ...(isObjective(q.questionType) ? { options: q.options } : {}),
        ...(q.modelAnswer ? { modelAnswer: q.modelAnswer } : {}),
      })),
      settings: {
        shuffleQuestions,
        showGradesImmediately,
        acceptingResponses,
        allowEditAfterSubmit,
        limitToOneResponse,
        confirmationMessage,
      },
    };
    try {
      const created = await create.mutateAsync(payload);
      success('Assessment created.');
      navigate(`/dashboard/course-offerings/${offeringId}/assessments/${created._id}`);
    } catch (e2) {
      showError(getApiErrorMessage(e2, 'Failed to create assessment.'));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Assessment</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Build a quiz, exam, or assignment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!params.offeringId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Course Offering *</label>
                <select
                  value={offeringId}
                  onChange={(e) => setOfferingId(e.target.value)}
                  disabled={offeringsLoading}
                  className="field"
                >
                  <option value="">{offeringsLoading ? 'Loading…' : 'Select a course…'}</option>
                  {offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz 1 — Arrays" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="field"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Due date *"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              <Input
                label="Time limit (minutes)"
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                placeholder="Leave empty = untimed"
              />
              <Input
                label="Declared total (optional)"
                type="number"
                min={0}
                value={doctorDeclaredTotal}
                onChange={(e) => setDoctorDeclaredTotal(e.target.value)}
                placeholder={`Calc: ${calculatedTotal}`}
                error={totalMismatch ? `Mismatch — calc is ${calculatedTotal}` : undefined}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Questions ({questions.length}) — total {calculatedTotal} pts</CardTitle>
              <Button type="button" variant="outline" onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}>
                <Plus className="h-4 w-4 mr-2" /> Add question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold text-gray-700">Q{idx + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      label="Question *"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(idx, { questionText: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Points *"
                    type="number"
                    min={1}
                    value={q.points}
                    onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Type</label>
                    <select
                      value={q.questionType}
                      onChange={(e) => onTypeChange(idx, e.target.value as Phase4QuestionType)}
                      className="field"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 mt-7">
                    <input
                      type="checkbox"
                      checked={q.isRequired}
                      onChange={(e) => updateQuestion(idx, { isRequired: e.target.checked })}
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>

                {isObjective(q.questionType) ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Options</span>
                      {q.questionType !== 'TrueFalse' && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => addOption(idx)}>
                          <Plus className="h-3 w-3 mr-1" /> Add option
                        </Button>
                      )}
                    </div>
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type={q.questionType === 'MCQ-Multiple' ? 'checkbox' : 'radio'}
                          name={`q${idx}-correct`}
                          checked={Boolean(o.isCorrect)}
                          onChange={(e) => {
                            if (q.questionType === 'MCQ-Multiple') {
                              updateQuestion(idx, {
                                options: q.options.map((opt, j) =>
                                  j === oi ? { ...opt, isCorrect: e.target.checked } : opt
                                ),
                              });
                            } else {
                              updateQuestion(idx, {
                                options: q.options.map((opt, j) => ({ ...opt, isCorrect: j === oi })),
                              });
                            }
                          }}
                        />
                        <Input
                          value={o.text}
                          onChange={(e) =>
                            updateQuestion(idx, {
                              options: q.options.map((opt, j) =>
                                j === oi ? { ...opt, text: e.target.value } : opt
                              ),
                            })
                          }
                          placeholder={`Option ${oi + 1}`}
                          className="flex-1"
                        />
                        {q.questionType !== 'TrueFalse' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(idx, oi)}
                            disabled={q.options.length <= 2}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Model answer (staff-only, optional)
                    </label>
                    <textarea
                      rows={2}
                      value={q.modelAnswer ?? ''}
                      onChange={(e) => updateQuestion(idx, { modelAnswer: e.target.value })}
                      className="field"
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
              <span className="text-sm">Shuffle questions per student</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGradesImmediately}
                onChange={(e) => setShowGradesImmediately(e.target.checked)}
              />
              <span className="text-sm">Show grades immediately after grading</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={acceptingResponses}
                onChange={(e) => setAcceptingResponses(e.target.checked)}
              />
              <span className="text-sm">Accepting responses</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowEditAfterSubmit}
                onChange={(e) => setAllowEditAfterSubmit(e.target.checked)}
              />
              <span className="text-sm">Allow edit after submit</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={limitToOneResponse}
                onChange={(e) => setLimitToOneResponse(e.target.checked)}
              />
              <span className="text-sm">Limit to one response per student</span>
            </label>
            <Input
              label="Confirmation message"
              value={confirmationMessage}
              onChange={(e) => setConfirmationMessage(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={create.isPending} disabled={!offeringId} className="flex-1">
            <Save className="h-4 w-4 mr-2" /> Create Assessment
          </Button>
        </div>
      </form>
    </div>
  );
}
