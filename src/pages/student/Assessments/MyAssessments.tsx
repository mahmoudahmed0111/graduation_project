import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Calendar, ClipboardList, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { FilterBar } from '@/components/ui/FilterBar';
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

export function MyAssessments() {
  const { t } = useTranslation();
  const { error: showError } = useToastStore();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    const q = searchTerm.trim().toLowerCase();
    return flattened.filter(({ offering, assessment }) => {
      if (selectedCourse !== 'all' && offering.id !== selectedCourse) return false;
      if (filterStatus === 'upcoming' && new Date(assessment.dueDate).getTime() < now) return false;
      if (filterStatus === 'past' && new Date(assessment.dueDate).getTime() >= now) return false;
      if (filterStatus === 'pending' && assessment.mySubmission?.status === 'graded') return false;
      if (
        q &&
        !(
          assessment.title.toLowerCase().includes(q) ||
          offering.code.toLowerCase().includes(q) ||
          offering.title.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [flattened, selectedCourse, filterStatus, searchTerm]);

  if (allLoading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  const activeFilterCount = (selectedCourse !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0);

  return (
    <AdminPageShell
      titleStack={{
        section: t('nav.assessments'),
        page: t('nav.myAssessments'),
      }}
      subtitle={t('student.myAssessments.subtitle')}
    >
      <Card bare>
        <CardContent className="space-y-6">
          <FilterBar
            search={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={t('common.search')}
            activeFilterCount={activeFilterCount}
            onClearFilters={() => {
              setSelectedCourse('all');
              setFilterStatus('all');
            }}
            filters={
              <>
                <Select2
                  label={t('student.myAssessments.allCourses')}
                  value={selectedCourse}
                  onChange={setSelectedCourse}
                  options={[
                    { value: 'all', label: t('student.myAssessments.allCourses') },
                    ...offerings.map((o) => ({ value: o.id, label: `${o.code} — ${o.title}` })),
                  ]}
                  placeholder={t('student.myAssessments.allCourses')}
                />
                <Select2
                  label={t('student.myAssessments.all')}
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value as typeof filterStatus)}
                  options={[
                    { value: 'all', label: t('student.myAssessments.all') },
                    { value: 'upcoming', label: t('student.myAssessments.upcoming') },
                    { value: 'past', label: t('student.myAssessments.pastDue') },
                    { value: 'pending', label: t('student.myAssessments.pendingResult') },
                  ]}
                  searchable={false}
                />
              </>
            }
          />

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('student.myAssessments.noAssessments')}
        />
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
                    <span className="text-sm font-normal text-gray-500 dark:text-slate-400">{t('student.myAssessments.ptsCount', { count: assessment.totalPoints })}</span>
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1 dark:text-slate-500">
                    {offering.code} — {offering.title}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{t('student.myAssessments.due', { date: new Date(assessment.dueDate).toLocaleString() })}</span>
                  </div>
                  {assessment.timeLimitMinutes && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
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
                        <span className="ml-2 text-gray-600 dark:text-slate-400">{my.totalScore}/{assessment.totalPoints}</span>
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
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}
