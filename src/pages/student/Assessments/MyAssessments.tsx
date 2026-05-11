import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Calendar, ClipboardList, Clock, FileText } from 'lucide-react';
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

export function MyAssessments() {
  const { t } = useTranslation();
  const { error: showError } = useToastStore();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'pending'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setEnrollmentsLoading(true);
        const rows = await api.getMyCourses({ semester: 'current' });
        if (!cancelled) setEnrollments(Array.isArray(rows) ? rows : []);
      } catch {
        if (!cancelled) showError(t('student.myAssessments.loadCoursesFailed'));
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

  const allLoading = enrollmentsLoading || queries.some((q) => q.isLoading);

  const flattened = useMemo(() => {
    const rows: Array<{ offering: OfferingMeta; assessment: IPhase4Assessment }> = [];
    queries.forEach((q, idx) => {
      const offering = offerings[idx];
      if (!offering) return;
      for (const a of q.data?.items ?? []) rows.push({ offering, assessment: a });
    });
    return rows;
  }, [queries, offerings]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return flattened.filter(({ offering, assessment }) => {
      if (selectedCourse !== 'all' && offering.id !== selectedCourse) return false;
      if (filterStatus === 'upcoming' && new Date(assessment.dueDate).getTime() < now) return false;
      if (filterStatus === 'past' && new Date(assessment.dueDate).getTime() >= now) return false;
      if (filterStatus === 'pending' && assessment.mySubmission?.status === 'graded') return false;
      return true;
    });
  }, [flattened, selectedCourse, filterStatus]);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.myAssessments') || t('student.myAssessments.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('student.myAssessments.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="field"
            >
              <option value="all">{t('student.myAssessments.allCourses')}</option>
              {offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.title}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="field"
            >
              <option value="all">{t('student.myAssessments.all')}</option>
              <option value="upcoming">{t('student.myAssessments.upcoming')}</option>
              <option value="past">{t('student.myAssessments.pastDue')}</option>
              <option value="pending">{t('student.myAssessments.pendingResult')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('student.myAssessments.noAssessments')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(({ offering, assessment }) => {
            const my = assessment.mySubmission;
            const isPast = new Date(assessment.dueDate).getTime() < Date.now();
            const action: { label: string; to: string } | null =
              my?.status === 'graded'
                ? { label: t('student.myAssessments.viewResult'), to: `/dashboard/submissions/${my._id}` }
                : my?.status === 'submitted'
                ? { label: t('student.myAssessments.viewSubmission'), to: `/dashboard/submissions/${my._id}` }
                : my?.status === 'in_progress'
                ? { label: t('student.myAssessments.resume'), to: `/dashboard/course-offerings/${offering.id}/assessments/${assessment._id}/take` }
                : !isPast && assessment.settings?.acceptingResponses !== false
                ? { label: t('student.myAssessments.start'), to: `/dashboard/course-offerings/${offering.id}/assessments/${assessment._id}/take` }
                : null;
            return (
              <Card key={assessment._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{assessment.title}</span>
                    <span className="text-sm font-normal text-gray-500">{t('student.myAssessments.ptsCount', { count: assessment.totalPoints })}</span>
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    {offering.code} — {offering.title}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{t('student.myAssessments.due', { date: new Date(assessment.dueDate).toLocaleString() })}</span>
                  </div>
                  {assessment.timeLimitMinutes && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{t('student.myAssessments.minLimit', { count: assessment.timeLimitMinutes })}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>
                      {t('student.myAssessments.status')}:{' '}
                      <span className="font-medium">
                        {my?.status === 'graded'
                          ? t('student.myAssessments.statusGraded')
                          : my?.status === 'submitted'
                          ? t('student.myAssessments.statusSubmitted')
                          : my?.status === 'in_progress'
                          ? t('student.myAssessments.statusInProgress')
                          : t('student.myAssessments.statusNotStarted')}
                      </span>
                      {my?.status === 'graded' && my.totalScore != null && (
                        <span className="ml-2 text-gray-600">{my.totalScore}/{assessment.totalPoints}</span>
                      )}
                    </span>
                  </div>

                  {action && (
                    <Link to={action.to}>
                      <Button className="w-full">{action.label}</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
