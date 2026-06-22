import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { CheckCircle2, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
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
  const { t } = useTranslation();
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
        if (!cancelled) showError(t('student.mySubmissions.loadCoursesFailed'));
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
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  return (
    <AdminPageShell
      titleStack={{ section: t('nav.assessments'), page: t('student.mySubmissions.title') }}
      subtitle={t('student.mySubmissions.subtitle')}
    >
      <Card bare>
        <CardContent className="space-y-6">
      {submissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('student.mySubmissions.noSubmissions')}
        />
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
                        {t('student.mySubmissions.graded')}
                      </span>
                    ) : my.status === 'submitted' ? (
                      <span className="flex items-center gap-1 text-sm text-blue-700 font-normal">
                        <Clock className="h-4 w-4" />
                        {t('student.mySubmissions.awaitingGrade')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500 font-normal">{t('student.mySubmissions.inProgress')}</span>
                    )}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1 dark:text-slate-500">
                    {offering.code} — {offering.title}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {my.totalScore != null && (
                    <div className="text-2xl font-bold text-primary-600">
                      {my.totalScore}
                      <span className="text-base text-gray-500 dark:text-slate-400"> / {assessment.totalPoints}</span>
                    </div>
                  )}
                  {my.submittedAt && (
                    <p className="text-sm text-gray-500 dark:text-slate-400">{t('student.mySubmissions.submittedAt', { date: new Date(my.submittedAt).toLocaleString() })}</p>
                  )}
                  <Link to={`/dashboard/submissions/${my._id}`}>
                    <Button variant="outline" className="w-full">
                      {t('student.mySubmissions.viewDetails')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
