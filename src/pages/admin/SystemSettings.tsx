import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Database, Save, Calendar, GraduationCap, MessageSquare } from 'lucide-react';
import { CHAT_TOKEN_BUDGET_ROLES, type ChatTokenBudgets, type ISystemSettings } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { getApiErrorMessage } from '@/lib/api';
import { AdminPageShell } from '@/components/admin';
import { usePatchSettings, useSettings } from '@/hooks/queries/useSettings';
import { FALLBACK_SYSTEM_SETTINGS } from '@/lib/mapSystemSettings';

/** Frontend validation thresholds for the Phase 7 AI Chat settings. */
const CHAT_HISTORY_MIN = 1;
const CHAT_CONTEXT_TOKENS_MIN = 100;
const CHAT_SUMMARIZATION_MIN = 1;
const CHAT_BUDGET_MIN = 100;

/** i18n label key per budget role (keeps the grid declarative + accessible). */
const BUDGET_ROLE_LABELS: Record<keyof ChatTokenBudgets, string> = {
  student: 'admin.systemSettings.roleStudent',
  ta: 'admin.systemSettings.roleTa',
  doctor: 'admin.systemSettings.roleDoctor',
  collegeAdmin: 'admin.systemSettings.roleCollegeAdmin',
  universityAdmin: 'admin.systemSettings.roleUniversityAdmin',
};

export function SystemSettings() {
  const { t } = useTranslation();
  const { success, error: showError } = useToastStore();
  const { data, isLoading, isError, error, refetch } = useSettings();
  const patchSettings = usePatchSettings();
  const [settings, setSettings] = useState<ISystemSettings>(FALLBACK_SYSTEM_SETTINGS);

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  /**
   * Derived, per-field validation messages for the AI Chat section. Token budgets
   * accept `0` as the documented "unlimited" sentinel (phase7_api_doc.md); any
   * other value must clear the role floor.
   */
  const chatErrors = useMemo(() => {
    const errs: {
      chatHistoryLimit?: string;
      chatMaxContextTokens?: string;
      chatMaxSummarizationCycles?: string;
      budgets: Partial<Record<keyof ChatTokenBudgets, string>>;
    } = { budgets: {} };

    if (!Number.isFinite(settings.chatHistoryLimit) || settings.chatHistoryLimit < CHAT_HISTORY_MIN) {
      errs.chatHistoryLimit = t('admin.systemSettings.minValue', { min: CHAT_HISTORY_MIN });
    }
    if (!Number.isFinite(settings.chatMaxContextTokens) || settings.chatMaxContextTokens < CHAT_CONTEXT_TOKENS_MIN) {
      errs.chatMaxContextTokens = t('admin.systemSettings.minValue', { min: CHAT_CONTEXT_TOKENS_MIN });
    }
    if (
      !Number.isFinite(settings.chatMaxSummarizationCycles) ||
      settings.chatMaxSummarizationCycles < CHAT_SUMMARIZATION_MIN
    ) {
      errs.chatMaxSummarizationCycles = t('admin.systemSettings.minValue', { min: CHAT_SUMMARIZATION_MIN });
    }
    for (const role of CHAT_TOKEN_BUDGET_ROLES) {
      const v = settings.chatTokenBudgets[role];
      if (!Number.isFinite(v) || (v !== 0 && v < CHAT_BUDGET_MIN)) {
        errs.budgets[role] = t('admin.systemSettings.minOrUnlimited', { min: CHAT_BUDGET_MIN });
      }
    }
    return errs;
  }, [settings, t]);

  const hasChatErrors =
    Boolean(
      chatErrors.chatHistoryLimit ||
        chatErrors.chatMaxContextTokens ||
        chatErrors.chatMaxSummarizationCycles
    ) || Object.keys(chatErrors.budgets).length > 0;

  /** Patch a single token-budget role immutably. */
  const setBudget = (role: keyof ChatTokenBudgets, value: number) =>
    setSettings((prev) => ({
      ...prev,
      chatTokenBudgets: { ...prev.chatTokenBudgets, [role]: value },
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasChatErrors) {
      showError(t('admin.systemSettings.fixValidationErrors'));
      return;
    }
    try {
      await patchSettings.mutateAsync({
        currentAcademicYear: settings.currentAcademicYear,
        currentSemester: settings.currentSemester,
        isEnrollmentOpen: settings.isEnrollmentOpen,
        gradePoints: settings.gradePoints,
        defaultCreditLimit: settings.defaultCreditLimit,
        chatHistoryLimit: settings.chatHistoryLimit,
        chatMaxContextTokens: settings.chatMaxContextTokens,
        chatMaxSummarizationCycles: settings.chatMaxSummarizationCycles,
        chatTokenBudgets: settings.chatTokenBudgets,
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('admin.systemSettings.aiChatSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                  type="number"
                  label={t('admin.systemSettings.chatHistoryLimit')}
                  helperText={t('admin.systemSettings.chatHistoryLimitHint')}
                  error={chatErrors.chatHistoryLimit}
                  value={settings.chatHistoryLimit}
                  onChange={(e) =>
                    setSettings({ ...settings, chatHistoryLimit: parseInt(e.target.value, 10) || 0 })
                  }
                  min={CHAT_HISTORY_MIN}
                  step={1}
                />
                <Input
                  type="number"
                  label={t('admin.systemSettings.maxContextTokens')}
                  helperText={t('admin.systemSettings.maxContextTokensHint')}
                  error={chatErrors.chatMaxContextTokens}
                  value={settings.chatMaxContextTokens}
                  onChange={(e) =>
                    setSettings({ ...settings, chatMaxContextTokens: parseInt(e.target.value, 10) || 0 })
                  }
                  min={CHAT_CONTEXT_TOKENS_MIN}
                  step={100}
                />
                <Input
                  type="number"
                  label={t('admin.systemSettings.maxSummarizationCycles')}
                  helperText={t('admin.systemSettings.maxSummarizationCyclesHint')}
                  error={chatErrors.chatMaxSummarizationCycles}
                  value={settings.chatMaxSummarizationCycles}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chatMaxSummarizationCycles: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min={CHAT_SUMMARIZATION_MIN}
                  step={1}
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('admin.systemSettings.tokenBudgetPerRole')}
                </h3>
                <p className="mb-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {t('admin.systemSettings.tokenBudgetHint')}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {CHAT_TOKEN_BUDGET_ROLES.map((role) => (
                    <Input
                      key={role}
                      type="number"
                      label={t(BUDGET_ROLE_LABELS[role])}
                      error={chatErrors.budgets[role]}
                      value={settings.chatTokenBudgets[role]}
                      onChange={(e) => setBudget(role, parseInt(e.target.value, 10) || 0)}
                      min={0}
                      step={100}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button type="submit" isLoading={patchSettings.isPending} disabled={hasChatErrors}>
              <Save className="mr-2 h-4 w-4" />
              {t('admin.systemSettings.saveSettings')}
            </Button>
          </div>
        </div>
      </form>
    </AdminPageShell>
  );
}
