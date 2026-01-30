import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  UserCheck,
  Building2,
  Calendar,
  Clock,
  Settings,
  RotateCcw,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { IUser, IEnrollment } from '@/types';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';
import { PieChart } from '@/components/charts/PieChart';
import { logger } from '@/lib/logger';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const admin = user as IUser;
  const { success, error: showError } = useToastStore();

  const [, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // System Config
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [currentTerm, setCurrentTerm] = useState<'First' | 'Second'>('First');
  const [systemConfigModalOpen, setSystemConfigModalOpen] = useState(false);

  // Quick Restore
  const [restoreNationalId, setRestoreNationalId] = useState('');
  const [restoring, setRestoring] = useState(false);

  // Live Statistics (mock: students, doctors, TAs + by college)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDoctors: 0,
    totalTAs: 0,
    byCollege: [] as { name: string; value: number }[],
  });

  // Security Alerts - locked-out accounts (mock count; in real app from API)
  const [lockedOutCount, setLockedOutCount] = useState(0);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [enrollmentsData] = await Promise.all([
          api.getEnrollments().catch(() => []),
          api.getCourses().catch(() => ({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })),
        ]);
        setEnrollments(enrollmentsData);
        const uniqueStudents = new Set(enrollmentsData.map((e: IEnrollment) => e.student_id)).size;
        setStats({
          totalStudents: uniqueStudents,
          totalDoctors: 12,
          totalTAs: 8,
          byCollege: [
            { name: 'Faculty of Engineering', value: Math.floor(uniqueStudents * 0.5) || 5 },
            { name: 'Faculty of Science', value: Math.floor(uniqueStudents * 0.3) || 3 },
            { name: 'Other', value: Math.floor(uniqueStudents * 0.2) || 2 },
          ],
        });
        setLockedOutCount(0);
      } catch (error) {
        logger.error('Failed to fetch dashboard data', { context: 'AdminDashboard', error });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickActionSave = () => {
    setSystemConfigModalOpen(false);
    success('System config updated');
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

  const handleUnlockAccounts = async () => {
    setUnlocking(true);
    try {
      // In real app: await api.unlockAllLockedAccounts();
      await new Promise((r) => setTimeout(r, 600));
      setLockedOutCount(0);
      success('Locked accounts have been unlocked');
    } catch {
      showError('Failed to unlock accounts');
    } finally {
      setUnlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
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
                {registrationOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Academic year</span>
              <span className="font-medium">{academicYear}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current term</span>
              <span className="font-medium">{currentTerm}</span>
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
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <GraduationCap className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                <p className="text-xs text-gray-600">Students</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <UserCheck className="h-6 w-6 mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
                <p className="text-xs text-gray-600">Doctors</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50">
                <Users className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalTAs}</p>
                <p className="text-xs text-gray-600">TAs</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Distribution by College</p>
              <PieChart data={stats.byCollege} height={200} />
            </div>
          </CardContent>
        </Card>

        {/* Security Alerts Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Security Alerts
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">Accounts locked due to failed login attempts</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100">
              <div className="flex items-center gap-3">
                <Lock className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{lockedOutCount}</p>
                  <p className="text-sm text-gray-600">Locked out accounts</p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleUnlockAccounts}
                disabled={lockedOutCount === 0 || unlocking}
                className="flex items-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                {unlocking ? 'Unlocking...' : 'Unlock'}
              </Button>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Current term</label>
            <div className="flex gap-2">
              <Button
                variant={currentTerm === 'First' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentTerm('First')}
              >
                First
              </Button>
              <Button
                variant={currentTerm === 'Second' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentTerm('Second')}
              >
                Second
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setSystemConfigModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickActionSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
