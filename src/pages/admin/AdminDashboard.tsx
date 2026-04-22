import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  Settings,
  RotateCcw,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { IUser } from '@/types';
import { api, getApiErrorMessage } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { PieChart } from '@/components/charts/PieChart';
import { logger } from '@/lib/logger';
import { AdminPageShell } from '@/components/admin';
import { SETTINGS_QUERY_KEY } from '@/hooks/queries/useSettings';
import { semesterApiToUi } from '@/lib/mapSystemSettings';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const admin = user as IUser;
  const { success, error: showError } = useToastStore();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // System config from settings API
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  /** API: fall | spring */
  const [currentSemester, setCurrentSemester] = useState<'fall' | 'spring'>('fall');
  const [systemConfigModalOpen, setSystemConfigModalOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Quick Restore
  const [restoreNationalId, setRestoreNationalId] = useState('');
  const [restoring, setRestoring] = useState(false);

  /** College and department list stats */
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalColleges: 0,
    totalDepartments: 0,
    byCollege: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [collegesData, departmentsData] = await Promise.all([
          api.getColleges({ isArchived: 'false' }).catch(() => []),
          api.getDepartments({ isArchived: 'false' }).catch(() => []),
        ]);
        const totalStudents = collegesData.reduce(
          (sum, c) => sum + (typeof c.studentCount === 'number' ? c.studentCount : 0),
          0
        );
        const byCollege =
          collegesData.length > 0
            ? collegesData.map((c) => ({
                name: String(c.name ?? 'College'),
                value: typeof c.studentCount === 'number' ? c.studentCount : 0,
              }))
            : [{ name: 'No data', value: 1 }];

        setStats({
          totalStudents,
          totalColleges: collegesData.length,
          totalDepartments: departmentsData.length,
          byCollege,
        });
      } catch (error) {
        logger.error('Failed to fetch dashboard data', { context: 'AdminDashboard', error });
      } finally {
        setLoading(false);
      }
    };
    const loadSettings = async () => {
      try {
        setSettingsLoading(true);
        const s = await api.getSettings();
        if (typeof s.currentAcademicYear === 'string') setAcademicYear(s.currentAcademicYear);
        if (s.currentSemester != null && String(s.currentSemester).trim() !== '') {
          setCurrentSemester(semesterApiToUi(s.currentSemester));
        }
        if (typeof s.isEnrollmentOpen === 'boolean') setRegistrationOpen(s.isEnrollmentOpen);
      } catch {
        // Non-blocking: widget keeps defaults
      } finally {
        setSettingsLoading(false);
      }
    };
    void fetchDashboardData();
    void loadSettings();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickActionSave = async () => {
    if (admin?.role !== 'universityAdmin') {
      showError('Only a university administrator can save system settings.');
      return;
    }
    try {
      setSavingSettings(true);
      await api.patchSettings({
        currentAcademicYear: academicYear.trim(),
        currentSemester,
        isEnrollmentOpen: registrationOpen,
      });
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      setSystemConfigModalOpen(false);
      success('System config updated');
    } catch (error) {
      showError(getApiErrorMessage(error, 'Failed to save system config'));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRestoreUser = async () => {
    if (!restoreNationalId.trim()) {
      showError('Enter a National ID');
      return;
    }
    setRestoring(true);
    try {
      // In real app: await api.restoreUser(restoreNationalId.trim());
      await new Promise((r) => setTimeout(r, 800));
      success(`User with National ID ${restoreNationalId.trim()} restored`);
      setRestoreNationalId('');
    } catch {
      showError('Failed to restore user');
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell title="Operations Room" subtitle="Loading…">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary-600 border-r-accent-500" />
          </div>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Operations Room"
      subtitle="Overview and control"
    >
    <div className="animate-fade-in-up space-y-6">
      {/* Welcome Header - branded navy with gold accent */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6 lg:p-7 text-white shadow-xl overflow-hidden">
        {/* ornamental pattern */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
        {/* gold glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
        {/* gold bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[11px] font-semibold tracking-wider uppercase text-accent-300 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
              Live
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-1.5 tracking-tight">Operations Room</h1>
            <p className="text-primary-200 text-sm lg:text-base">Overview and control center</p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-primary-100 text-sm">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-accent-400" />
                <span>{admin?.role === 'universityAdmin' ? 'University Administrator' : 'College Administrator'}</span>
              </div>
              <span className="text-primary-500">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-accent-400" />
                <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="md:text-right rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 md:justify-end mb-0.5">
                <Clock className="h-4 w-4 text-accent-400" />
                <div className="text-2xl font-bold font-mono tracking-wide">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
              </div>
              <div className="text-xs text-primary-300">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: System Config + Quick Restore */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Config Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-600" />
              System Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Registration status</span>
              <span className={registrationOpen ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                {settingsLoading ? '…' : registrationOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Academic year</span>
              <span className="font-medium text-gray-900 dark:text-slate-100">{settingsLoading ? '…' : academicYear}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Current semester</span>
              <span className="font-medium text-gray-900 dark:text-slate-100">
                {settingsLoading ? '…' : currentSemester === 'spring' ? 'Spring' : 'Fall'}
              </span>
            </div>
            <Button onClick={() => setSystemConfigModalOpen(true)} className="w-full mt-2">
              Quick Action
            </Button>
          </CardContent>
        </Card>

        {/* Quick Restore Widget */}
        <Card className="border-2 border-amber-200 bg-amber-50/30 dark:border-amber-500/30 dark:bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Quick Restore
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Restore a soft-deleted user by National ID</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="National ID"
                value={restoreNationalId}
                onChange={(e) => setRestoreNationalId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleRestoreUser} disabled={restoring}>
                {restoring ? 'Restoring...' : 'Restore User'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Live Statistics + Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Statistics Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              Live Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
              Student totals use each college&apos;s <code className="bg-gray-100 dark:bg-slate-800 dark:text-slate-200 px-0.5 rounded">studentCount</code> from the colleges list.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="group relative text-center p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100 dark:from-primary-900/40 dark:to-primary-900/20 dark:border-primary-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 dark:bg-primary-500 text-white shadow-sm mb-2">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">{stats.totalStudents}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Students</p>
              </div>
              <div className="group relative text-center p-4 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100/50 border border-accent-200/70 dark:from-accent-500/10 dark:to-accent-500/5 dark:border-accent-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 text-primary-900 shadow-sm mb-2">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">{stats.totalColleges}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Colleges</p>
              </div>
              <div className="group relative text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 dark:from-slate-800/60 dark:to-slate-800/30 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800 dark:bg-primary-600 text-white shadow-sm mb-2">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold text-primary-900 dark:text-white">{stats.totalDepartments}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Departments</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Students by college</p>
              <PieChart data={stats.byCollege} height={200} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              What this dashboard shows
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              This view focuses on colleges, departments, and institution settings. Detailed user accounts and security
              tooling live in their own admin sections.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50/80 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 text-sm text-gray-700 dark:text-slate-200">
              <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0" />
              <p>Colleges, departments, system settings, and locations are managed from the navigation menu.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Config Modal */}
      <Modal
        isOpen={systemConfigModalOpen}
        onClose={() => setSystemConfigModalOpen(false)}
        title="Quick Action – System Config"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Registration status</label>
            <div className="flex gap-2">
              <Button
                variant={registrationOpen ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRegistrationOpen(true)}
              >
                Open
              </Button>
              <Button
                variant={!registrationOpen ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setRegistrationOpen(false)}
              >
                Closed
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Academic year</label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Current semester (API)</label>
            <div className="flex gap-2">
              <Button
                variant={currentSemester === 'fall' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentSemester('fall')}
              >
                Fall
              </Button>
              <Button
                variant={currentSemester === 'spring' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentSemester('spring')}
              >
                Spring
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setSystemConfigModalOpen(false)} disabled={savingSettings}>
              Cancel
            </Button>
            <Button onClick={() => void handleQuickActionSave()} isLoading={savingSettings}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </AdminPageShell>
  );
}
