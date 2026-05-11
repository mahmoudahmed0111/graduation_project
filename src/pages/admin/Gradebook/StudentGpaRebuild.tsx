import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { useToastStore } from '@/store/toastStore';
import { useRebuildStudentGpa } from '@/hooks/queries/usePhase4Gradebook';
import { useUsers } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import type { GpaRebuildResponse } from '@/services/gradebook.service';

export function StudentGpaRebuild() {
  const { t } = useTranslation();
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState<GpaRebuildResponse | null>(null);
  const { success, error: showError } = useToastStore();
  const rebuild = useRebuildStudentGpa();

  const { data: studentsData, isLoading: studentsLoading } = useUsers({
    role: 'student',
    limit: 200,
    isArchived: 'false',
  });

  const studentOptions = useMemo(() => {
    return (studentsData?.items ?? []).map((u) => {
      const r = u as unknown as Record<string, unknown>;
      const id = String(r._id ?? r.id ?? '');
      const name = String(r.name ?? '');
      const email = String(r.email ?? '');
      const nationalId = String(r.nationalId ?? '');
      const label = [name, email, nationalId].filter(Boolean).join(' · ') || id;
      return { value: id, label };
    });
  }, [studentsData?.items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    try {
      const res = await rebuild.mutateAsync(studentId.trim());
      setResult(res);
      success(t('admin.studentGpaRebuild.gpaRebuilt'));
    } catch (err) {
      showError(getApiErrorMessage(err, t('admin.studentGpaRebuild.rebuildFail')));
    }
  };

  return (
    <AdminPageShell
      titleStack={{ section: t('admin.studentGpaRebuild.section'), page: t('admin.studentGpaRebuild.page') }}
      subtitle={t('admin.studentGpaRebuild.subtitle')}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" /> {t('admin.studentGpaRebuild.rebuild')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select2
                label={t('admin.studentGpaRebuild.studentRequired')}
                value={studentId}
                onChange={setStudentId}
                placeholder={studentsLoading ? t('admin.studentGpaRebuild.loadingStudents') : t('admin.studentGpaRebuild.searchPlaceholder')}
                options={studentOptions}
              />
              <Button type="submit" isLoading={rebuild.isPending} disabled={!studentId.trim()}>
                {t('admin.studentGpaRebuild.rebuild')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t('admin.studentGpaRebuild.result')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('admin.studentGpaRebuild.gpa')}</div>
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {result.gpa.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('admin.studentGpaRebuild.earnedCredits')}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.earnedCredits}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('admin.studentGpaRebuild.level')}</div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{result.level}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400">{t('admin.studentGpaRebuild.status')}</div>
                  <div className="font-medium capitalize text-gray-900 dark:text-gray-100">{result.academicStatus}</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{result.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageShell>
  );
}
