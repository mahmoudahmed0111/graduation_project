import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, Edit, FileQuestion, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { useAssessments, useArchiveAssessment } from '@/hooks/queries/usePhase4Assessments';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IPhase4Assessment } from '@/types';

export function AssessmentList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offeringId } = useParams<{ offeringId: string }>();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const list = useAssessments(offeringId);
  const archive = useArchiveAssessment(offeringId ?? '');
  const [confirmTarget, setConfirmTarget] = useState<IPhase4Assessment | null>(null);

  const isDoctor = user?.role === 'doctor' || user?.role === 'teacher';

  const handleArchive = async () => {
    if (!confirmTarget) return;
    try {
      await archive.mutateAsync(confirmTarget._id);
      success(t('doctor.assessmentList.archived'));
      setConfirmTarget(null);
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.assessmentList.failedArchive')));
    }
  };

  return (
    <AdminPageShell
      title={t('doctor.assessmentList.title')}
      subtitle={t('doctor.assessmentList.subtitle')}
      actions={
        isDoctor ? (
          <Link to={`/dashboard/course-offerings/${offeringId}/assessments/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> {t('doctor.assessmentList.newAssessment')}
            </Button>
          </Link>
        ) : undefined
      }
    >
      <Card bare>
        <CardContent className="space-y-6">
      {list.isLoading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <Spinner size="lg" label={t('common.loading')} />
        </div>
      ) : (list.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title={t('doctor.assessmentList.noAssessments')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(list.data?.items ?? []).map((a) => (
            <Card key={a._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{a.title}</span>
                  <span className="text-sm font-normal text-gray-500 dark:text-slate-400">{t('doctor.assessmentList.points', { pts: a.totalPoints })}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {a.description && <p className="text-sm text-gray-600 dark:text-slate-400">{a.description}</p>}
                <div className="text-sm text-gray-600 dark:text-slate-400 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 dark:text-slate-500">{t('doctor.assessmentList.due')} </span>
                    {new Date(a.dueDate).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-500">{t('doctor.assessmentList.timeLimit')} </span>
                    {a.timeLimitMinutes ? t('doctor.assessmentList.minutes', { min: a.timeLimitMinutes }) : t('doctor.assessmentList.untimed')}
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-500">{t('doctor.assessmentList.status')} </span>
                    {a.settings?.acceptingResponses === false ? (
                      <span className="text-red-600 dark:text-red-400 font-medium">{t('doctor.assessmentList.closed')}</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 font-medium">{t('doctor.assessmentList.accepting')}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-dark-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/assessments/${a._id}`)}
                  >
                    {t('doctor.assessmentList.view')}
                  </Button>
                  {isDoctor && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/assessments/${a._id}/edit`)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> {t('doctor.assessmentList.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmTarget(a)}>
                        <Archive className="h-3 w-3 mr-1" /> {t('doctor.assessmentList.archive')}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/assessments/${a._id}/submissions`)}
                  >
                    <Users className="h-3 w-3 mr-1" /> {t('doctor.assessmentList.submissions')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleArchive}
        title={t('doctor.assessmentList.confirmTitle')}
        message={t('doctor.assessmentList.confirmMessage', { title: confirmTarget?.title })}
        confirmText={t('doctor.assessmentList.archive')}
        variant="warning"
        isLoading={archive.isPending}
      />
    </AdminPageShell>
  );
}
