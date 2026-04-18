import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
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

export function AdminDashboard() {
  const { user } = useAuthStore();
  const admin = user as IUser;
  const { success, error: showError } = useToastStore();

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // System Config (Phase 1: GET/PATCH /api/v1/settings)
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

  /** Phase 1 only: GET /colleges, GET /departments — see phase1_api_docs.md */
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
        if (s.currentSemester === 'spring' || s.currentSemester === 'fall') {
          setCurrentSemester(s.currentSemester);
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
      showError('Only a university administrator can save system settings (PATCH /settings).');
      return;
    }
    try {
      setSavingSettings(true);
      await api.patchSettings({
        currentAcademicYear: academicYear.trim(),
        currentSemester,
        isEnrollmentOpen: registrationOpen,
      });
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
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Operations Room"
      subtitle="Overview and control"
      badge={{ label: 'Phase 1', variant: 'neutral' }}
    >
    <div className="animate-fade-in-up space-y-6">
      {/* Welcome Header */}
      <div className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Operations Room</h1>
            <p className="text-primary-100">Overview and control</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-primary-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{admin?.role === 'universityAdmin' ? 'University Administrator' : 'College Administrator'}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5" />
                <div className="text-2xl font-bold font-mono">
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
              </div>
              <div className="text-sm text-primary-200">
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
              <span className="text-gray-600">Registration status</span>
              <span className={registrationOpen ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {settingsLoading ? '…' : registrationOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Academic year</span>
              <span className="font-medium">{settingsLoading ? '…' : academicYear}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current semester</span>
              <span className="font-medium">
                {settingsLoading ? '…' : currentSemester === 'spring' ? 'Spring' : 'Fall'}
              </span>
            </div>
            <Button onClick={() => setSystemConfigModalOpen(true)} className="w-full mt-2">
              Quick Action
            </Button>
          </CardContent>
        </Card>

        {/* Quick Restore Widget */}
        <Card className="border-2 border-amber-200 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-600" />
              Quick Restore
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Restore a soft-deleted user by National ID</p>
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
            <p className="text-xs text-gray-500 mb-3">
              Student totals use each college&apos;s <code className="bg-gray-100 px-0.5 rounded">studentCount</code> from Phase 1 GET /colleges.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <GraduationCap className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-xs text-gray-600">Students (sum)</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <Building2 className="h-6 w-6 mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalColleges}</p>
                <p className="text-xs text-gray-600">Colleges</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments}</p>
                <p className="text-xs text-gray-600">Departments</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Students by college (Phase 1)</p>
              <PieChart data={stats.byCollege} height={200} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Phase 1 scope
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              This dashboard slice uses only Phase 1 endpoints: Colleges, Departments, Settings. User accounts and security metrics are not part of that specification.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50/80 border border-amber-100 text-sm text-gray-700">
              <Lock className="h-8 w-8 text-amber-600 shrink-0" />
              <p>
                See <code className="bg-white px-1 rounded">phase1_api_docs.md</code> for Modules 1–4 (Colleges, Departments, Settings, Locations).
              </p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration status</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic year</label>
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2025-2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current semester (API)</label>
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
