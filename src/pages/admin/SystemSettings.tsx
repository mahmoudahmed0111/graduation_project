import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Database, Save, Calendar, GraduationCap } from 'lucide-react';
import type { ISystemSettings } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { getApiErrorMessage } from '@/lib/api';
import { AdminPageShell } from '@/components/admin';
import { usePatchSettings, useSettings } from '@/hooks/queries/useSettings';
import { FALLBACK_SYSTEM_SETTINGS } from '@/lib/mapSystemSettings';

export function SystemSettings() {
  const { t } = useTranslation();
  const { success, error: showError } = useToastStore();
  const { data, isLoading, isError, error, refetch } = useSettings();
  const patchSettings = usePatchSettings();
  const [settings, setSettings] = useState<ISystemSettings>(FALLBACK_SYSTEM_SETTINGS);

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patchSettings.mutateAsync({
        currentAcademicYear: settings.currentAcademicYear,
        currentSemester: settings.currentSemester,
        isEnrollmentOpen: settings.isEnrollmentOpen,
        gradePoints: settings.gradePoints,
        defaultCreditLimit: settings.defaultCreditLimit,
      });
      success(t('admin.systemSettings.updateSuccess'));
    } catch (err) {
      logger.error('Failed to update settings', { context: 'SystemSettings', error: err });
      showError(getApiErrorMessage(err, t('admin.systemSettings.updateFail')));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.systemSettings.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <AdminPageShell
        title={t('admin.systemSettings.title')}
        subtitle={t('admin.systemSettings.subtitleShort')}
      >
        <Card>
          <CardContent className="p-6 text-sm text-red-600 dark:text-red-400">
            {getApiErrorMessage(error, t('admin.systemSettings.loadFail'))}
            <div className="mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => void refetch()}>
                {t('admin.systemSettings.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={t('admin.systemSettings.title')}
      subtitle={t('admin.systemSettings.subtitle')}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('admin.systemSettings.academicSettings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.systemSettings.currentAcademicYear')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={settings.currentAcademicYear}
                    onChange={(e) => setSettings({ ...settings, currentAcademicYear: e.target.value })}
                    placeholder={t('admin.systemSettings.yearPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.systemSettings.currentSemester')} <span className="text-red-500">*</span>
                  </label>
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">{t('admin.systemSettings.apiValuesHint')}</p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={settings.currentSemester === 'fall' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSettings({ ...settings, currentSemester: 'fall' })}
                    >
                      {t('admin.systemSettings.fall')}
                    </Button>
                    <Button
                      type="button"
                      variant={settings.currentSemester === 'spring' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setSettings({ ...settings, currentSemester: 'spring' })}
                    >
                      {t('admin.systemSettings.spring')}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enrollmentOpen"
                    checked={settings.isEnrollmentOpen}
                    onChange={(e) => setSettings({ ...settings, isEnrollmentOpen: e.target.checked })}
                    className="h-4 w-4 rounded text-primary-600"
                  />
                  <label htmlFor="enrollmentOpen" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.systemSettings.enrollmentOpen')}
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {t('admin.systemSettings.creditHourLimits')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.systemSettings.goodStandingLimit')}
                  </label>
                  <Input
                    type="number"
                    value={settings.defaultCreditLimit.good_standing}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultCreditLimit: {
                          ...settings.defaultCreditLimit,
                          good_standing: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    min={0}
                    max={30}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.systemSettings.probationLimit')}
                  </label>
                  <Input
                    type="number"
                    value={settings.defaultCreditLimit.probation}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultCreditLimit: {
                          ...settings.defaultCreditLimit,
                          probation: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    min={0}
                    max={30}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('admin.systemSettings.honorsLimit')}
                  </label>
                  <Input
                    type="number"
                    value={settings.defaultCreditLimit.honors}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultCreditLimit: {
                          ...settings.defaultCreditLimit,
                          honors: parseInt(e.target.value, 10) || 0,
                        },
                      })
                    }
                    min={0}
                    max={30}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t('admin.systemSettings.gradePointMapping')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {Object.entries(settings.gradePoints).map(([grade, points]) => (
                  <div key={grade}>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {grade}
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={points}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          gradePoints: {
                            ...settings.gradePoints,
                            [grade]: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      min={0}
                      max={4}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button type="submit" isLoading={patchSettings.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {t('admin.systemSettings.saveSettings')}
            </Button>
          </div>
        </div>
      </form>
    </AdminPageShell>
  );
}
