import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/store/toastStore';
import { useAssessment, useUpdateAssessment } from '@/hooks/queries/usePhase4Assessments';
import { getApiErrorMessage } from '@/lib/http/client';

function toLocalInput(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offeringId, id } = useParams<{ offeringId: string; id: string }>();
  const detail = useAssessment(offeringId, id);
  const update = useUpdateAssessment(offeringId ?? '');
  const { success, error: showError } = useToastStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>('');
  const [acceptingResponses, setAcceptingResponses] = useState(true);
  const [showGradesImmediately, setShowGradesImmediately] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  useEffect(() => {
    const a = detail.data;
    if (!a) return;
    setTitle(a.title);
    setDescription(a.description ?? '');
    setDueDate(toLocalInput(a.dueDate));
    setTimeLimitMinutes(a.timeLimitMinutes != null ? String(a.timeLimitMinutes) : '');
    setAcceptingResponses(a.settings?.acceptingResponses !== false);
    setShowGradesImmediately(Boolean(a.settings?.showGradesImmediately));
    setShuffleQuestions(Boolean(a.settings?.shuffleQuestions));
  }, [detail.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await update.mutateAsync({
        assessmentId: id,
        input: {
          title,
          description: description || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          timeLimitMinutes: timeLimitMinutes === '' ? null : Number(timeLimitMinutes),
          settings: {
            acceptingResponses,
            showGradesImmediately,
            shuffleQuestions,
          },
        },
      });
      success(t('doctor.editAssessment.updated'));
      navigate(`/dashboard/course-offerings/${offeringId}/assessments/${id}`);
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.editAssessment.failedUpdate')));
    }
  };

  if (detail.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-red-600">{t('doctor.editAssessment.notFound')}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('doctor.editAssessment.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('doctor.editAssessment.note')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary-600" /> {t('doctor.editAssessment.assessmentDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('doctor.editAssessment.titleLabel')} value={title} onChange={(e) => setTitle(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.editAssessment.descriptionLabel')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="field"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t('doctor.editAssessment.dueDateLabel')} type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <Input
                label={t('doctor.editAssessment.timeLimitLabel')}
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                placeholder={t('doctor.editAssessment.untimedPlaceholder')}
              />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={acceptingResponses} onChange={(e) => setAcceptingResponses(e.target.checked)} />
              <span className="text-sm">{t('doctor.editAssessment.acceptingResponses')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showGradesImmediately}
                onChange={(e) => setShowGradesImmediately(e.target.checked)}
              />
              <span className="text-sm">{t('doctor.editAssessment.showGradesImmediately')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
              <span className="text-sm">{t('doctor.editAssessment.shuffleQuestions')}</span>
            </label>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
                {t('doctor.editAssessment.cancel')}
              </Button>
              <Button type="submit" isLoading={update.isPending} className="flex-1">
                <Save className="h-4 w-4 mr-2" /> {t('doctor.editAssessment.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
