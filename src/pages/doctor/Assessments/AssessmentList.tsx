import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, Edit, FileQuestion, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAssessments, useArchiveAssessment } from '@/hooks/queries/usePhase4Assessments';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IPhase4Assessment } from '@/types';

export function AssessmentList() {
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
      success('Assessment archived.');
      setConfirmTarget(null);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to archive assessment.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quizzes, exams, and assignments</p>
        </div>
        {isDoctor && (
          <Link to={`/dashboard/course-offerings/${offeringId}/assessments/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Assessment
            </Button>
          </Link>
        )}
      </div>

      {list.isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : (list.data?.items.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assessments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(list.data?.items ?? []).map((a) => (
            <Card key={a._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{a.title}</span>
                  <span className="text-sm font-normal text-gray-500">{a.totalPoints} pts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {a.description && <p className="text-sm text-gray-600">{a.description}</p>}
                <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Due: </span>
                    {new Date(a.dueDate).toLocaleString()}
                  </div>
                  <div>
                    <span className="text-gray-500">Time limit: </span>
                    {a.timeLimitMinutes ? `${a.timeLimitMinutes} min` : 'Untimed'}
                  </div>
                  <div>
                    <span className="text-gray-500">Status: </span>
                    {a.settings?.acceptingResponses === false ? (
                      <span className="text-red-600 font-medium">Closed</span>
                    ) : (
                      <span className="text-green-600 font-medium">Accepting</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/assessments/${a._id}`)}
                  >
                    View
                  </Button>
                  {isDoctor && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/assessments/${a._id}/edit`)}
                      >
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmTarget(a)}>
                        <Archive className="h-3 w-3 mr-1" /> Archive
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/assessments/${a._id}/submissions`)}
                  >
                    <Users className="h-3 w-3 mr-1" /> Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleArchive}
        title="Archive assessment"
        message={`Archive "${confirmTarget?.title}"? Students will no longer see it. Blocked if any submissions exist.`}
        confirmText="Archive"
        variant="warning"
        isLoading={archive.isPending}
      />
    </div>
  );
}
