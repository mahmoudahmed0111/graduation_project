import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Award, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { getMyGradesForCourse, getStudentGradebook } from '@/services/gradebook.service';
import { myGradesForCourseQueryKey, studentGradebookQueryKey } from '@/hooks/queries/usePhase4Gradebook';
import { useQuery } from '@tanstack/react-query';
import type { IEnrollment, IPhase4GradebookEntry } from '@/types';

interface OfferingMeta {
  id: string;
  code: string;
  title: string;
}

export function MyGrades() {
  const { user } = useAuthStore();
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

  const myGradeQueries = useQueries({
    queries: offerings.map((o) => ({
      queryKey: myGradesForCourseQueryKey(o.id),
      queryFn: () => getMyGradesForCourse(o.id),
      enabled: Boolean(o.id),
      retry: false,
    })),
  });

  const summaryQuery = useQuery({
    queryKey: studentGradebookQueryKey(user?.id ?? ''),
    queryFn: () => getStudentGradebook(user!.id),
    enabled: Boolean(user?.id),
    retry: false,
  });

  const allLoading = enrollmentsLoading || myGradeQueries.some((q) => q.isLoading);

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Grades</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Per-course breakdown and overall standing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <GraduationCap className="h-4 w-4" /> Cumulative GPA
            </div>
            <div className="text-3xl font-bold mt-2 text-primary-600">
              {summaryQuery.data?.items?.[0] && typeof summaryQuery.data.items[0].student_id === 'object'
                ? (summaryQuery.data.items[0].student_id.gpa?.toFixed(2) ?? '—')
                : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Award className="h-4 w-4" /> Earned credits
            </div>
            <div className="text-3xl font-bold mt-2">
              {summaryQuery.data?.items?.[0] && typeof summaryQuery.data.items[0].student_id === 'object'
                ? summaryQuery.data.items[0].student_id.earnedCredits ?? '—'
                : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm">Standing</div>
            <div className="text-lg font-medium mt-2 capitalize">
              {summaryQuery.data?.items?.[0] && typeof summaryQuery.data.items[0].student_id === 'object'
                ? summaryQuery.data.items[0].student_id.academicStatus ?? '—'
                : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myGradeQueries.map((q, idx) => {
          const offering = offerings[idx];
          if (!offering) return null;
          if (q.isError || !q.data) {
            return (
              <Card key={offering.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {offering.code} — {offering.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">No grade data yet.</CardContent>
              </Card>
            );
          }
          const e = q.data as IPhase4GradebookEntry;
          const g = e.grades;
          const showFinal = g.finalLetter || g.finalTotal != null;
          return (
            <Card key={offering.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>
                    {offering.code} — {offering.title}
                  </span>
                  {showFinal && <span className="text-2xl font-bold text-primary-600">{g.finalLetter ?? '—'}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Attendance</div>
                    <div className="font-medium">{g.attendance ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Midterm</div>
                    <div className="font-medium">{g.midterm ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Assignments</div>
                    <div className="font-medium">{g.assignments ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Project</div>
                    <div className="font-medium">{g.project ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Final exam</div>
                    <div className="font-medium">{g.finalExam ?? 0}</div>
                  </div>
                  {showFinal && (
                    <div>
                      <div className="text-gray-500">Total</div>
                      <div className="font-medium">{g.finalTotal ?? '—'}</div>
                    </div>
                  )}
                </div>
                {!showFinal && (
                  <p className="text-xs text-gray-500 mt-3">Final results not yet published.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
