import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminPageShell } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';

const enrollmentStatusData = [
  { name: 'Enrolled', value: 1240 },
  { name: 'Passed', value: 860 },
  { name: 'Withdrawn', value: 114 },
  { name: 'Failed', value: 89 },
];

const recentActivity = [
  { title: 'Course offering published', meta: 'CS402 · 2 minutes ago', tone: 'success' },
  { title: 'Enrollment window updated', meta: 'Spring 2026 · 8 minutes ago', tone: 'neutral' },
  { title: 'Capacity override requested', meta: 'ENG201 · 14 minutes ago', tone: 'warning' },
  { title: 'Grades batch submitted', meta: 'Fall 2025 · 21 minutes ago', tone: 'success' },
  { title: 'Staff assignment changed', meta: 'Department of CS · 35 minutes ago', tone: 'neutral' },
] as const;

const progressRows = [
  { label: 'Registration Completion', value: 78 },
  { label: 'Results Publication', value: 64 },
  { label: 'Attendance Sync', value: 91 },
];

const monthlyTrend = [
  { month: 'Jan', enrollments: 780, attendance: 89 },
  { month: 'Feb', enrollments: 850, attendance: 90 },
  { month: 'Mar', enrollments: 920, attendance: 88 },
  { month: 'Apr', enrollments: 980, attendance: 91 },
  { month: 'May', enrollments: 1040, attendance: 92 },
  { month: 'Jun', enrollments: 1135, attendance: 93 },
];

const departmentPerformance = [
  { department: 'CS', passed: 410, atRisk: 52 },
  { department: 'IS', passed: 290, atRisk: 43 },
  { department: 'AI', passed: 330, atRisk: 36 },
  { department: 'SE', passed: 270, atRisk: 41 },
];

export function StaticUiDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const kpis = useMemo(
    () => [
      { label: 'Active Students', value: '12,480', delta: '+8.4%', icon: Users },
      { label: 'Running Offerings', value: '318', delta: '+2.1%', icon: GraduationCap },
      { label: 'Avg Attendance', value: '92.1%', delta: '+1.4%', icon: TrendingUp },
      { label: 'Catalog Courses', value: '612', delta: '+3.0%', icon: BookOpen },
      { label: 'Open Incidents', value: '14', delta: '-12.0%', icon: AlertTriangle },
      { label: 'Completed Tasks', value: '86', delta: '+5.3%', icon: CheckCircle2 },
    ],
    []
  );

  return (
    <AdminPageShell title="UI Preview Dashboard" subtitle="Static demo data for layout and component testing.">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-6 text-white shadow-xl">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                <Activity className="h-3.5 w-3.5" />
                Static UI Mode
              </p>
              <h1 className="text-3xl font-bold tracking-tight">University Operations Snapshot</h1>
              <p className="mt-1 text-sm text-primary-100">
                Purely visual data for dashboard iteration, theme tuning, and responsive QA.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-accent-300">
                <Clock className="h-4 w-4" />
                Live Clock
              </div>
              <div className="font-mono text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="mt-1 text-xs text-primary-200">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
                  </div>
                  <kpi.icon className="h-8 w-8 text-primary-600 dark:text-accent-400" />
                </div>
                <p className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {kpi.delta} vs previous week
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Enrollment Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart data={enrollmentStatusData} innerRadius={36} outerRadius={98} height={320} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.title} className="rounded-xl border border-gray-100 p-3 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                    <span
                      className={[
                        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        item.tone === 'success'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : item.tone === 'warning'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                      ].join(' ')}
                    >
                      {item.tone}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.meta}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Enrollment and Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                data={monthlyTrend}
                dataKey="month"
                yAxisLabel="Enrollments"
                lines={[
                  { dataKey: 'enrollments', name: 'Enrollments' },
                  { dataKey: 'attendance', name: 'Attendance %' },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Department Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={departmentPerformance}
                dataKey="department"
                yAxisLabel="Students"
                bars={[
                  { dataKey: 'passed', name: 'Passed' },
                  { dataKey: 'atRisk', name: 'At Risk' },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600 dark:text-accent-400" />
                Pipeline Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {progressRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{row.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{row.value}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-primary-600 dark:bg-accent-500" style={{ width: `${row.value}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alerts and Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                <span>2 critical alerts pending review</span>
                <span className="font-semibold">P1</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <span>7 moderate issues awaiting assignment</span>
                <span className="font-semibold">P2</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                <span>23 tasks completed today</span>
                <span className="font-semibold">Done</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          This page is static and intentionally disconnected from backend APIs. Use it for visual QA only.
        </p>
      </div>
    </AdminPageShell>
  );
}
