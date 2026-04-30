import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAssessment } from '@/hooks/queries/usePhase4Assessments';
import { useAuthStore } from '@/store/authStore';

export function AssessmentDetail() {
  const { offeringId, id } = useParams<{ offeringId: string; id: string }>();
  const { user } = useAuthStore();
  const detail = useAssessment(offeringId, id);

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
        <CardContent className="p-12 text-center text-red-600">Assessment not found.</CardContent>
      </Card>
    );
  }

  const a = detail.data;
  const isStudent = user?.role === 'student';
  const isStaff = user?.role === 'doctor' || user?.role === 'teacher' || user?.role === 'ta' || user?.role === 'collegeAdmin';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to={`/dashboard/course-offerings/${offeringId}/assessments`}
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to assessments
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{a.title}</span>
            <span className="text-sm font-normal text-gray-500">{a.totalPoints} pts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {a.description && <p className="text-gray-700 dark:text-gray-300">{a.description}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-500">Due</div>
                <div className="font-medium">{new Date(a.dueDate).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-500">Time limit</div>
                <div className="font-medium">{a.timeLimitMinutes ? `${a.timeLimitMinutes} min` : 'Untimed'}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-gray-500">Status</div>
                <div className="font-medium">
                  {a.settings?.acceptingResponses === false ? 'Closed' : 'Accepting responses'}
                </div>
              </div>
            </div>
          </div>

          {isStudent && (
            <div className="pt-4 border-t border-gray-100">
              {a.mySubmission?.status === 'graded' ? (
                <Link to={`/dashboard/submissions/${a.mySubmission._id}`}>
                  <Button>View result</Button>
                </Link>
              ) : a.mySubmission?.status === 'submitted' ? (
                <Link to={`/dashboard/submissions/${a.mySubmission._id}`}>
                  <Button variant="outline">View submission (awaiting grade)</Button>
                </Link>
              ) : (
                <Link to={`/dashboard/course-offerings/${offeringId}/assessments/${a._id}/take`}>
                  <Button>{a.mySubmission?.status === 'in_progress' ? 'Resume' : 'Start'}</Button>
                </Link>
              )}
            </div>
          )}

          {isStaff && Array.isArray(a.questions) && a.questions.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-semibold">Questions ({a.questions.length})</h3>
              {a.questions.map((q, idx) => (
                <div key={q._id ?? idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs uppercase text-gray-500">{q.questionType}</span>
                      <p className="font-medium mt-1">
                        Q{idx + 1}. {q.questionText}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{q.points} pt{q.points !== 1 ? 's' : ''}</span>
                  </div>
                  {q.options && q.options.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {q.options.map((o, oi) => (
                        <li key={o._id ?? oi} className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{o.text}</span>
                          {o.isCorrect && <span className="text-xs text-green-600 font-medium">(correct)</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
