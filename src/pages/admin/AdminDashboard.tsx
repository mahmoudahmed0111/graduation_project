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
  Lock,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Server,
  Shield,
  Activity,
  Database,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react';
import { IUser } from '@/types';
import { useToastStore } from '@/store/toastStore';
import { PieChart } from '@/components/charts/PieChart';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { ChartCard } from '@/components/charts';
import { AdminPageShell } from '@/components/admin';

// ============ STATIC DATA ============

const STATS = {
  totalStudents: 12480,
  studentsDelta: '+342',
  totalDoctors: 486,
  doctorsDelta: '+12',
  totalColleges: 14,
  collegesDelta: '0',
  totalDepartments: 68,
  departmentsDelta: '+2',
  activeUsers: 4821,
  systemUptime: 99.98,
  storageUsed: 67,
  cpuUsage: 42,
};

const STUDENTS_BY_COLLEGE = [
  { name: 'Engineering', value: 3240 },
  { name: 'Computer Science', value: 2890 },
  { name: 'Business', value: 2150 },
  { name: 'Medicine', value: 1480 },
  { name: 'Arts', value: 1240 },
  { name: 'Science', value: 980 },
  { name: 'Law', value: 500 },
];

const ENROLLMENT_TREND = [
  { year: '2020', students: 8200 },
  { year: '2021', students: 9150 },
  { year: '2022', students: 10300 },
  { year: '2023', students: 11240 },
  { year: '2024', students: 11850 },
  { year: '2025', students: 12480 },
];

const USER_GROWTH = [
  { month: 'Nov', students: 11800, doctors: 462 },
  { month: 'Dec', students: 11950, doctors: 468 },
  { month: 'Jan', students: 12100, doctors: 472 },
  { month: 'Feb', students: 12230, doctors: 478 },
  { month: 'Mar', students: 12350, doctors: 482 },
  { month: 'Apr', students: 12480, doctors: 486 },
];

const SYSTEM_LOAD = [
  { hour: '00:00', cpu: 22, memory: 48 },
  { hour: '04:00', cpu: 18, memory: 45 },
  { hour: '08:00', cpu: 38, memory: 62 },
  { hour: '12:00', cpu: 65, memory: 78 },
  { hour: '16:00', cpu: 72, memory: 82 },
  { hour: '20:00', cpu: 45, memory: 68 },
];

const ROLE_DISTRIBUTION = [
  { name: 'Students', value: 12480 },
  { name: 'Doctors', value: 486 },
  { name: 'TAs', value: 124 },
  { name: 'Admins', value: 18 },
];

const TOP_COLLEGES = [
  { name: 'College of Engineering', students: 3240, departments: 8, avgGpa: 3.42, color: 'from-blue-500 to-blue-600' },
  { name: 'College of Computer Science', students: 2890, departments: 6, avgGpa: 3.55, color: 'from-purple-500 to-purple-600' },
  { name: 'College of Business', students: 2150, departments: 5, avgGpa: 3.28, color: 'from-emerald-500 to-emerald-600' },
  { name: 'College of Medicine', students: 1480, departments: 12, avgGpa: 3.71, color: 'from-red-500 to-red-600' },
  { name: 'College of Arts', students: 1240, departments: 9, avgGpa: 3.35, color: 'from-pink-500 to-pink-600' },
];

const RECENT_ACTIVITY = [
  { icon: UserCheck, color: 'text-emerald-600 bg-emerald-50', text: '24 new student accounts created', time: '12m ago' },
  { icon: BookOpen, color: 'text-blue-600 bg-blue-50', text: 'New course added: AI Ethics (CS495)', time: '1h ago' },
  { icon: Shield, color: 'text-amber-600 bg-amber-50', text: 'Security audit completed - no issues', time: '3h ago' },
  { icon: Database, color: 'text-purple-600 bg-purple-50', text: 'Daily backup completed successfully', time: '5h ago' },
  { icon: AlertTriangle, color: 'text-red-600 bg-red-50', text: '3 failed login attempts blocked', time: '6h ago' },
  { icon: Settings, color: 'text-gray-600 bg-gray-100', text: 'Semester settings updated by admin', time: '1d ago' },
];

const SYSTEM_HEALTH = [
  { label: 'API Server', status: 'operational', icon: Server, value: '99.98%' },
  { label: 'Database', status: 'operational', icon: Database, value: '12ms' },
  { label: 'Storage', status: 'warning', icon: HardDrive, value: '67% used' },
  { label: 'Network', status: 'operational', icon: Wifi, value: '1.2 Gbps' },
];

// ============ COMPONENT ============

export function AdminDashboard() {
  const { user } = useAuthStore();
  const admin = user as IUser;
  const { success, error: showError } = useToastStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [currentSemester, setCurrentSemester] = useState<'fall' | 'spring'>('fall');
  const [systemConfigModalOpen, setSystemConfigModalOpen] = useState(false);
  const [restoreNationalId, setRestoreNationalId] = useState('');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRestoreUser = async () => {
    if (!restoreNationalId.trim()) {
      showError('Enter a National ID');
      return;
    }
    setRestoring(true);
    await new Promise((r) => setTimeout(r, 800));
    success(`User with National ID ${restoreNationalId.trim()} restored`);
    setRestoreNationalId('');
    setRestoring(false);
  };

  const statCards = [
    {
      label: 'Total Students',
      value: STATS.totalStudents.toLocaleString(),
      delta: STATS.studentsDelta,
      trend: 'up',
      icon: GraduationCap,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hint: 'Active enrollments',
    },
    {
      label: 'Total Faculty',
      value: STATS.totalDoctors,
      delta: STATS.doctorsDelta,
      trend: 'up',
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hint: 'Doctors and TAs',
    },
    {
      label: 'Colleges',
      value: STATS.totalColleges,
      delta: STATS.collegesDelta,
      trend: 'up',
      icon: Building2,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hint: 'Across the university',
    },
    {
      label: 'Departments',
      value: STATS.totalDepartments,
      delta: STATS.departmentsDelta,
      trend: 'up',
      icon: BookOpen,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hint: 'Across all colleges',
    },
  ];

  const kpiCards = [
    { label: 'Active Users', value: STATS.activeUsers.toLocaleString(), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'System Uptime', value: `${STATS.systemUptime}%`, icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Storage Used', value: `${STATS.storageUsed}%`, icon: HardDrive, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'CPU Load', value: `${STATS.cpuUsage}%`, icon: Cpu, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <AdminPageShell title="Operations Room" subtitle="Overview and control">
      <div className="animate-fade-in-up space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 p-6 lg:p-8 text-white shadow-xl">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-accent-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[11px] font-semibold tracking-wider uppercase text-accent-300 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
                Live • All Systems Operational
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-1.5 tracking-tight">Operations Room</h1>
              <p className="text-primary-200 text-sm lg:text-base">Welcome back, {admin?.name || 'Administrator'}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-primary-100 text-sm">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-accent-400" />
                  <span>{admin?.role === 'universityAdmin' ? 'University Administrator' : 'College Administrator'}</span>
                </div>
                <span className="text-primary-500">•</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-accent-400" />
                  <span>{academicYear} — {currentSemester === 'fall' ? 'Fall' : 'Spring'}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 mb-0.5">
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

        {/* Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendColor}`}>
                      <TrendIcon className="h-3 w-3" />
                      {stat.delta}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.hint}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                <div className={`p-2.5 rounded-lg ${k.bg}`}>
                  <Icon className={`h-5 w-5 ${k.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{k.label}</p>
                  <p className="text-lg font-bold text-gray-900">{k.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health Status */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {SYSTEM_HEALTH.map((s) => {
                const Icon = s.icon;
                const isOk = s.status === 'operational';
                return (
                  <div
                    key={s.label}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isOk ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                        <span className={`h-1.5 w-1.5 rounded-full ${isOk ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                      </div>
                      <p className="text-xs text-gray-600">{s.value}</p>
                    </div>
                    {isOk ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts row 1 */}
        <ChartCard title="Enrollment Trend" description="Total student enrollment over the past 6 years">
          <AreaChart
            data={ENROLLMENT_TREND}
            dataKey="year"
            areas={[{ dataKey: 'students', name: 'Students', fill: '#0055cc' }]}
            height={280}
          />
        </ChartCard>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Students by College" description="Distribution across colleges">
            <PieChart data={STUDENTS_BY_COLLEGE} height={300} />
          </ChartCard>

          <ChartCard title="User Growth (6 months)" description="Students and faculty over time">
            <LineChart
              data={USER_GROWTH}
              dataKey="month"
              lines={[
                { dataKey: 'students', name: 'Students', stroke: '#0055cc' },
                { dataKey: 'doctors', name: 'Doctors', stroke: '#ffd700' },
              ]}
              height={300}
            />
          </ChartCard>
        </div>

        {/* Charts row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="System Load (24h)" description="CPU and memory usage">
            <AreaChart
              data={SYSTEM_LOAD}
              dataKey="hour"
              areas={[
                { dataKey: 'cpu', name: 'CPU %', fill: '#8b5cf6' },
                { dataKey: 'memory', name: 'Memory %', fill: '#10b981' },
              ]}
              height={260}
            />
          </ChartCard>

          <ChartCard title="User Roles" description="Breakdown by role">
            <BarChart
              data={ROLE_DISTRIBUTION}
              dataKey="name"
              bars={[{ dataKey: 'value', name: 'Users', fill: '#0055cc' }]}
              height={260}
            />
          </ChartCard>
        </div>

        {/* Top Colleges + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-2xl border border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary-600" />
                Top Colleges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TOP_COLLEGES.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${c.color} text-white shadow-sm`}>
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{c.name}</h4>
                          <p className="text-xs text-gray-500">{c.departments} departments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{c.students.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">students</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Avg GPA</span>
                      <span className="font-semibold text-primary-600">{c.avgGpa.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                        style={{ width: `${(c.avgGpa / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className={`p-2 rounded-lg h-fit ${a.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{a.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions: System Config + Quick Restore */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary-600" />
                System Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Registration status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${registrationOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {registrationOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Academic year</span>
                <span className="font-semibold text-gray-900">{academicYear}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-600">Current semester</span>
                <span className="font-semibold text-gray-900">{currentSemester === 'spring' ? 'Spring' : 'Fall'}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-600">Tuition fee status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Collecting
                </span>
              </div>
              <Button onClick={() => setSystemConfigModalOpen(true)} className="w-full mt-2">
                <Settings className="h-4 w-4 mr-2" />
                Quick Action
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 border-amber-200 bg-amber-50/30 shadow-sm">
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
                  {restoring ? 'Restoring...' : 'Restore'}
                </Button>
              </div>
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-white border border-amber-100 text-xs text-gray-600">
                <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p>Soft-deleted users can be restored within 30 days. After that, account data is permanently purged.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal */}
        <Modal
          isOpen={systemConfigModalOpen}
          onClose={() => setSystemConfigModalOpen(false)}
          title="Quick Action – System Config"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration status</label>
              <div className="flex gap-2">
                <Button variant={registrationOpen ? 'primary' : 'secondary'} size="sm" onClick={() => setRegistrationOpen(true)}>
                  Open
                </Button>
                <Button variant={!registrationOpen ? 'primary' : 'secondary'} size="sm" onClick={() => setRegistrationOpen(false)}>
                  Closed
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic year</label>
              <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="e.g. 2025-2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current semester</label>
              <div className="flex gap-2">
                <Button variant={currentSemester === 'fall' ? 'primary' : 'secondary'} size="sm" onClick={() => setCurrentSemester('fall')}>
                  Fall
                </Button>
                <Button variant={currentSemester === 'spring' ? 'primary' : 'secondary'} size="sm" onClick={() => setCurrentSemester('spring')}>
                  Spring
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="secondary" onClick={() => setSystemConfigModalOpen(false)}>Cancel</Button>
              <Button onClick={() => { setSystemConfigModalOpen(false); success('System config updated'); }}>Save</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminPageShell>
  );
}
