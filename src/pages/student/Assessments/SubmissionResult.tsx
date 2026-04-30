import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSubmission } from '@/hooks/queries/usePhase4Submissions';

function readAssessmentTitle(s: ReturnType<typeof useSubmission>['data']): string {
  if (!s) return 'Submission';
  const a = s.assessment_id;
  if (a && typeof a === 'object') return a.title;
  return 'Submission';
}

function readAssessmentTotalPoints(s: ReturnType<typeof useSubmission>['data']): number | undefined {
  if (!s) return undefined;
  const a = s.assessment_id;
  if (a && typeof a === 'object') return a.totalPoints;
  return undefined;
}

export function SubmissionResult() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const detail = useSubmission(submissionId);

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
        <CardContent className="p-12 text-center text-red-600">Submission not found.</CardContent>
      </Card>
    );
  }

  const s = detail.data;
  const title = readAssessmentTitle(s);
  const totalPoints = readAssessmentTotalPoints(s);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link to="/dashboard/assessments/submissions" className="inline-flex items-center gap-1 text-sm text-primary-600">
        <ArrowLeft className="h-4 w-4" /> Back to submissions
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{title}</span>
            <span className="text-sm font-normal text-gray-500">
              {s.status === 'graded' ? (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle2 className="h-4 w-4" /> Graded
                </span>
              ) : s.status === 'submitted' ? (
                <span className="flex items-center gap-1 text-blue-700">
                  <Clock className="h-4 w-4" /> Awaiting grade
                </span>
              ) : (
                <span>{s.status}</span>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {s.totalScore != null && (
            <div className="text-3xl font-bold text-primary-600">
              {s.totalScore}
              {totalPoints != null && <span className="text-base text-gray-500"> / {totalPoints}</span>}
            </div>
          )}

          {s.submittedAt && (
            <p className="text-sm text-gray-500">Submitted {new Date(s.submittedAt).toLocaleString()}</p>
          )}

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="font-semibold">Answers</h3>
            {s.answers.map((a, idx) => (
              <div key={a.questionId ?? idx} className="border border-gray-200 rounded p-3">
                <div className="text-xs uppercase text-gray-500">Q{idx + 1}</div>
                {a.answerText && <p className="mt-1">{a.answerText}</p>}
                {a.fileUrl && (
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    View file
                  </a>
                )}
                {(a.score != null || a.feedback) && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-sm space-y-1">
                    {a.score != null && <div className="font-medium">Score: {a.score}</div>}
                    {a.feedback && (
                      <div className="flex items-start gap-1 text-gray-600">
                        <MessageSquare className="h-3 w-3 mt-1" />
                        <span>{a.feedback}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
