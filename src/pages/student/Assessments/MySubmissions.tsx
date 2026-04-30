import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/toastStore';
import { api } from '@/lib/api';
import { listAssessments } from '@/services/assessments.service';
import { assessmentsListQueryKey } from '@/hooks/queries/usePhase4Assessments';
import type { IEnrollment, IPhase4Assessment } from '@/types';

interface OfferingMeta {
  id: string;
  code: string;
  title: string;
}

export function MySubmissions() {
  const { error: showError } = useToastStore();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setEnrollmentsLoading(true);
        const rows = await api.getMyCourses({ semester: 'current' });
        if (!cancelled) setEnrollments(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) showError('Failed to load courses.');
      } finally {
        if (!cancelled) setEnrollmentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showError]);

  const offerings = useMemo<OfferingMeta[]>(
    () =>
      enrollments
        .map((e) => {
          const co = e.courseOffering;
          if (!co?.id) return null;
          return { id: co.id, code: co.course?.code ?? '', title: co.course?.title ?? '' };
        })
        .filter((x): x is OfferingMeta => Boolean(x)),
    [enrollments]
  );

  const queries = useQueries({
    queries: offerings.map((o) => ({
      queryKey: assessmentsListQueryKey(o.id),
      queryFn: () => listAssessments(o.id),
      enabled: Boolean(o.id),
    })),
  });

  const submissions = useMemo(() => {
    const rows: Array<{ offering: OfferingMeta; assessment: IPhase4Assessment }> = [];
    queries.forEach((q, idx) => {
      const offering = offerings[idx];
      if (!offering) return;
      for (const a of q.data?.items ?? []) {
        if (a.mySubmission) rows.push({ offering, assessment: a });
      }
    });
    return rows;
  }, [queries, offerings]);

  const allLoading = enrollmentsLoading || queries.some((q) => q.isLoading);

  if (allLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">All your assessment attempts</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map(({ offering, assessment }) => {
            const my = assessment.mySubmission!;
            return (
              <Card key={my._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{assessment.title}</span>
                    {my.status === 'graded' ? (
                      <span className="flex items-center gap-1 text-sm text-green-700 font-normal">
                        <CheckCircle2 className="h-4 w-4" />
                        Graded
                      </span>
                    ) : my.status === 'submitted' ? (
                      <span className="flex items-center gap-1 text-sm text-blue-700 font-normal">
                        <Clock className="h-4 w-4" />
                        Awaiting grade
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 font-normal">In progress</span>
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    {offering.code} — {offering.title}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {my.totalScore != null && (
                    <div className="text-2xl font-bold text-primary-600">
                      {my.totalScore}
                      <span className="text-base text-gray-500"> / {assessment.totalPoints}</span>
                    </div>
                  )}
                  {my.submittedAt && (
                    <p className="text-sm text-gray-500">Submitted {new Date(my.submittedAt).toLocaleString()}</p>
                  )}
                  <Link to={`/dashboard/submissions/${my._id}`}>
                    <Button variant="outline" className="w-full">
                      View details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
