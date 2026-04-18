import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Mail,
  Lock,
  Save,
  Moon,
  Sun,
  Languages,
  User,
  AlertCircle,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { authApi, getApiErrorMessage } from '@/lib/api';
import { useTheme } from '@/providers/ThemeProvider';
import { useSettings } from '@/hooks/queries/useSettings';
import { cn } from '@/lib/utils';

const UI_PREFS_KEY = 'smart-uni-ui-prefs';

type TabId = 'institution' | 'account' | 'general' | 'notifications' | 'security';

type UiPrefs = {
  timezone: string;
  dateFormat: string;
};

function loadUiPrefs(): UiPrefs {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { timezone: 'Africa/Cairo', dateFormat: 'DD/MM/YYYY' };
    const p = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      timezone: typeof p.timezone === 'string' ? p.timezone : 'Africa/Cairo',
      dateFormat: typeof p.dateFormat === 'string' ? p.dateFormat : 'DD/MM/YYYY',
    };
  } catch {
    return { timezone: 'Africa/Cairo', dateFormat: 'DD/MM/YYYY' };
  }
}

export function Settings() {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { success, error: showError } = useToastStore();
  const [activeTab, setActiveTab] = useState<TabId>('institution');
  const [loadingPrefs, setLoadingPrefs] = useState(false);

  const settingsQuery = useSettings();
  const profileQuery = useQuery({
    queryKey: ['auth', 'profile', 'settings-page'],
    queryFn: () => authApi.getProfile(),
  });

  const [generalSettings, setGeneralSettings] = useState({
    language: i18n.language,
    timezone: 'Africa/Cairo',
    dateFormat: 'DD/MM/YYYY',
  });

  useEffect(() => {
    const p = loadUiPrefs();
    setGeneralSettings((g) => ({
      ...g,
      language: i18n.language,
      timezone: p.timezone,
      dateFormat: p.dateFormat,
    }));
  }, [i18n.language]);

  const setGeneralFields = (next: typeof generalSettings) => {
    setGeneralSettings(next);
  };

  const tabs: { id: TabId; label: string; icon: typeof SettingsIcon }[] = [
    { id: 'institution', label: 'Institution', icon: Database },
    { id: 'account', label: 'Account', icon: User },
    { id: 'general', label: 'Appearance', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const institution = settingsQuery.data;
  const isUa = user?.role === 'universityAdmin';

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Institution data from the API, account summary, and local display preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                        isActive
                          ? 'bg-primary-50 font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/80'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          {activeTab === 'institution' && (
            <div className="space-y-6">
              {settingsQuery.isLoading && (
                <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">Loading institution settings…</div>
                </div>
              )}
              {settingsQuery.isError && (
                <Card>
                  <CardContent className="p-6 text-sm text-red-600 dark:text-red-400">
                    {getApiErrorMessage(settingsQuery.error, 'Could not load GET /api/v1/settings')}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-3"
                      onClick={() => void settingsQuery.refetch()}
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              )}
              {institution && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        Academic calendar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Academic year
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{institution.currentAcademicYear}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Semester
                        </p>
                        <p className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                          {institution.currentSemester}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Enrollment
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {institution.isEnrollmentOpen ? 'Open for enrollment' : 'Enrollment closed'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        Default credit limits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Good standing</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {institution.defaultCreditLimit.good_standing} cr
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Probation</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {institution.defaultCreditLimit.probation} cr
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Honors</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {institution.defaultCreditLimit.honors} cr
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        Grade points (GPA mapping)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-4">
                        {Object.entries(institution.gradePoints).map(([g, pts]) => (
                          <div
                            key={g}
                            className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700"
                          >
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{g}</span>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{pts}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {isUa ? (
                    <div className="flex flex-wrap gap-3">
                      <Link to="/dashboard/system-settings" className="btn-primary">
                        Edit system settings
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only a university administrator can change these values (PATCH /api/v1/settings).
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileQuery.isLoading && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Loading profile…</p>
                )}
                {profileQuery.isError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {getApiErrorMessage(profileQuery.error, 'Could not load profile')}
                  </p>
                )}
                {profileQuery.data && (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Name: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{profileQuery.data.name}</span>
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Email: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{profileQuery.data.email}</span>
                    </p>
                    <p>
                      <span className="text-gray-500 dark:text-gray-400">Role: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{profileQuery.data.role}</span>
                    </p>
                  </div>
                )}
                <Link
                  to="/dashboard/profile"
                  className="btn-secondary inline-flex px-3 py-1.5 text-xs"
                >
                  Open profile
                </Link>
              </CardContent>
            </Card>
          )}

          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Appearance &amp; locale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Languages className="h-4 w-4" />
                      Language
                    </label>
                    <Select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralFields({ ...generalSettings, language: e.target.value })}
                      options={[{ value: 'en', label: 'English' }]}
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Palette className="h-4 w-4" />
                      Theme
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all',
                          theme === 'light'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-600'
                        )}
                      >
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all',
                          theme === 'dark'
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-600'
                        )}
                      >
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Theme is stored in this browser (not sent to Phase 1 settings API).
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Globe className="h-4 w-4" />
                      Timezone
                    </label>
                    <Select
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralFields({ ...generalSettings, timezone: e.target.value })}
                      options={[
                        { value: 'Africa/Cairo', label: 'Africa/Cairo (GMT+2)' },
                        { value: 'UTC', label: 'UTC (GMT+0)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date format
                    </label>
                    <Select
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralFields({ ...generalSettings, dateFormat: e.target.value })}
                      options={[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                      ]}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="primary"
                    isLoading={loadingPrefs}
                    disabled={loadingPrefs}
                    onClick={() => {
                      setLoadingPrefs(true);
                      try {
                        i18n.changeLanguage(generalSettings.language);
                        localStorage.setItem(
                          UI_PREFS_KEY,
                          JSON.stringify({
                            timezone: generalSettings.timezone,
                            dateFormat: generalSettings.dateFormat,
                          })
                        );
                        success('Preferences saved (language, timezone, and date format on this device)');
                      } catch {
                        showError('Failed to save preferences');
                      } finally {
                        setLoadingPrefs(false);
                      }
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save display preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-medium">Not available in Phase 1</p>
                    <p className="mt-1 text-amber-800 dark:text-amber-200/90">
                      The backend documented in Phase 1 does not expose per-user notification preferences. Email and
                      in-app channels may be added in a later phase.
                    </p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 opacity-60">
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email notifications</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Placeholder UI</p>
                      </div>
                    </div>
                    <input type="checkbox" disabled className="h-4 w-4 rounded border-gray-300" aria-disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-medium">Session and password policies</p>
                    <p className="mt-1 text-amber-800 dark:text-amber-200/90">
                      Phase 1 does not document configurable session timeout or password expiry in{' '}
                      <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">/settings</code>. Use your
                      profile and auth flows for password changes when the backend supports them.
                    </p>
                  </div>
                </div>
                <Link
                  to="/dashboard/profile"
                  className="btn-secondary inline-flex px-3 py-1.5 text-xs"
                >
                  Account &amp; password
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
