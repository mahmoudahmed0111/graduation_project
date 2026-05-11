import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  Clock,
  Bell,
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Building2,
  Target,
  Zap,
  Star,
  ArrowUpRight,
  Activity,
  Trophy,
  BookMarked,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartCard } from '@/components/charts';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { IStudent } from '@/types';

// ============ STATIC DATA ============

const STATS = {
  gpa: 3.78,
  gpaDelta: '+0.12',
  creditsEarned: 87,
  creditsRequired: 120,
  creditsDelta: '+15',
  currentCredits: 18,
  attendance: 94.2,
  attendanceDelta: '+2.1',
  rank: 12,
  rankTotal: 240,
  streak: 18,
  completedAssignments: 47,
  pendingAssignments: 4,
};

const MY_COURSES = [
  { code: 'CS301', title: 'Operating Systems', doctor: 'Dr. Ahmed Hassan', credits: 3, attendance: 96, grade: 'A-', gradePct: 91, color: 'from-blue-500 to-blue-600', progress: 72 },
  { code: 'CS320', title: 'Computer Networks', doctor: 'Dr. Sara Mohamed', credits: 3, attendance: 92, grade: 'B+', gradePct: 87, color: 'from-purple-500 to-purple-600', progress: 65 },
  { code: 'MATH201', title: 'Linear Algebra', doctor: 'Dr. Omar Khaled', credits: 4, attendance: 98, grade: 'A', gradePct: 94, color: 'from-emerald-500 to-emerald-600', progress: 80 },
  { code: 'CS350', title: 'Software Architecture', doctor: 'Dr. Layla Ibrahim', credits: 3, attendance: 89, grade: 'B+', gradePct: 86, color: 'from-orange-500 to-orange-600', progress: 58 },
  { code: 'ENG210', title: 'Technical Writing', doctor: 'Prof. John Smith', credits: 2, attendance: 95, grade: 'A', gradePct: 93, color: 'from-pink-500 to-pink-600', progress: 78 },
  { code: 'CS380', title: 'AI Foundations', doctor: 'Dr. Mona Adel', credits: 3, attendance: 94, grade: 'A-', gradePct: 90, color: 'from-cyan-500 to-cyan-600', progress: 70 },
];

const UPCOMING_ASSESSMENTS = [
  { id: 'a1', title: 'OS Midterm Exam', course: 'CS301', daysLeft: 2, points: 100, type: 'Exam', submitted: false },
  { id: 'a2', title: 'Networks Lab Report', course: 'CS320', daysLeft: 4, points: 30, type: 'Lab', submitted: false },
  { id: 'a3', title: 'Linear Algebra HW 5', course: 'MATH201', daysLeft: 6, points: 25, type: 'Homework', submitted: false },
  { id: 'a4', title: 'Architecture Diagrams', course: 'CS350', daysLeft: 8, points: 50, type: 'Project', submitted: false },
  { id: 'a5', title: 'Essay - Tech Ethics', course: 'ENG210', daysLeft: 10, points: 40, type: 'Essay', submitted: false },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Final exam schedule released', author: 'Registrar', time: '1h ago', priority: 'high' },
  { id: 2, title: 'Library extended hours during finals', author: 'Library', time: '5h ago', priority: 'medium' },
  { id: 3, title: 'Career fair next Wednesday', author: 'Career Center', time: '1d ago', priority: 'medium' },
  { id: 4, title: 'Student discount on Adobe CC', author: 'IT Services', time: '2d ago', priority: 'low' },
];

const TODAY_SCHEDULE = [
  { time: '09:00', end: '10:30', course: 'CS301', room: 'Room 204', type: 'Lecture', status: 'done' },
  { time: '11:00', end: '12:30', course: 'MATH201', room: 'Room 110', type: 'Lecture', status: 'now' },
  { time: '14:00', end: '15:30', course: 'CS320', room: 'Lab B-3', type: 'Lab', status: 'upcoming' },
  { time: '16:00', end: '17:00', course: 'ENG210', room: 'Room 405', type: 'Lecture', status: 'upcoming' },
];

const GPA_TREND = [
  { semester: 'F22', gpa: 3.42 },
  { semester: 'S23', gpa: 3.55 },
  { semester: 'F23', gpa: 3.61 },
  { semester: 'S24', gpa: 3.68 },
  { semester: 'F24', gpa: 3.72 },
  { semester: 'S25', gpa: 3.78 },
];

const ATTENDANCE_BY_COURSE = MY_COURSES.map((c) => ({ course: c.code, attendance: c.attendance }));

const GRADE_DISTRIBUTION = [
  { name: 'A / A-', value: 14 },
  { name: 'B+ / B', value: 9 },
  { name: 'B-', value: 3 },
  { name: 'C+', value: 1 },
];

const CREDITS_BY_YEAR = [
  { year: 'Year 1', completed: 30, total: 30 },
  { year: 'Year 2', completed: 30, total: 30 },
  { year: 'Year 3', completed: 27, total: 30 },
  { year: 'Year 4', completed: 0, total: 30 },
];

const STUDY_HOURS = [
  { week: 'W1', hours: 18 },
  { week: 'W2', hours: 22 },
  { week: 'W3', hours: 25 },
  { week: 'W4', hours: 28 },
  { week: 'W5', hours: 24 },
  { week: 'W6', hours: 30 },
  { week: 'W7', hours: 32 },
  { week: 'W8', hours: 35 },
];

const ACHIEVEMENTS = [
  { icon: Trophy, label: 'Dean\'s List', sub: 'Fall 2024', color: 'from-amber-400 to-amber-600' },
  { icon: Flame, label: '18-Day Streak', sub: 'Active learner', color: 'from-orange-400 to-red-500' },
  { icon: Star, label: 'Top 5%', sub: 'In Math 201', color: 'from-purple-400 to-purple-600' },
  { icon: BookMarked, label: '20+ Books', sub: 'Library reader', color: 'from-emerald-400 to-emerald-600' },
];

// ============ COMPONENT ============

export function StudentDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const student = user as IStudent;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const gpaProgress = (STATS.gpa / 4.0) * 100;
  const creditsProgress = (STATS.creditsEarned / STATS.creditsRequired) * 100;

  const statCards = [
    {
      label: t('student.studentDashboard.cumulativeGpa'),
      value: STATS.gpa.toFixed(2),
      delta: STATS.gpaDelta,
      trend: 'up',
      icon: Award,
      gradient: 'from-amber-400 to-amber-600',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      hint: t('student.studentDashboard.outOf400'),
    },
    {
      label: t('student.studentDashboard.creditsEarned'),
      value: STATS.creditsEarned,
      delta: STATS.creditsDelta,
      trend: 'up',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hint: t('student.studentDashboard.ofRequired', { required: STATS.creditsRequired }),
    },
    {
      label: t('student.studentDashboard.attendanceLabel'),
      value: `${STATS.attendance}%`,
      delta: STATS.attendanceDelta,
      trend: 'up',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hint: t('student.studentDashboard.thisSemester'),
    },
    {
      label: t('student.studentDashboard.classRank'),
      value: `#${STATS.rank}`,
      delta: '+3',
      trend: 'up',
      icon: Trophy,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hint: t('student.studentDashboard.ofStudents', { total: STATS.rankTotal }),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-primary-200 text-sm mb-1">{t('student.studentDashboard.welcomeBack')}</p>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">{student?.name || t('student.studentDashboard.studentFallback')}</h1>
            <div className="flex flex-wrap items-center gap-4 text-primary-100 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{student?.department?.college?.name || t('student.studentDashboard.facultyFallback')}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>{student?.department?.name || t('student.studentDashboard.departmentFallback')}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t('student.studentDashboard.yearSemester', { year: student?.year || 3, semester: student?.semester || 2 })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-300/30">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                <span className="text-xs font-semibold">{t('student.studentDashboard.dayStreak', { count: STATS.streak })}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-300/30">
                <Star className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-xs font-semibold">{t('student.studentDashboard.deansList')}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5" />
              <div className="text-3xl font-bold font-mono tracking-tight">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
            </div>
            <div className="text-xs text-primary-200">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
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

      {/* Progress + Achievements row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary-600" />
              {t('student.studentDashboard.academicProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('student.studentDashboard.gpaProgress')}</span>
                  <span className="text-sm font-bold text-gray-900">{STATS.gpa.toFixed(2)} / 4.00</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                    style={{ width: `${gpaProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('student.studentDashboard.percentOfPerfect', { pct: gpaProgress.toFixed(0) })}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('student.studentDashboard.creditsToGraduation')}</span>
                  <span className="text-sm font-bold text-gray-900">{STATS.creditsEarned} / {STATS.creditsRequired}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    style={{ width: `${creditsProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('student.studentDashboard.creditsRemaining', { count: STATS.creditsRequired - STATS.creditsEarned })}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('student.studentDashboard.assignments')}</span>
                  <span className="text-sm font-bold text-gray-900">{t('student.studentDashboard.doneCount', { count: STATS.completedAssignments })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                      style={{ width: `${(STATS.completedAssignments / (STATS.completedAssignments + STATS.pendingAssignments)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-orange-600 font-semibold">{t('student.studentDashboard.pendingCount', { count: STATS.pendingAssignments })}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{t('student.studentDashboard.currentLoad')}</span>
                  <span className="text-sm font-bold text-gray-900">{t('student.studentDashboard.creditsCount', { count: STATS.currentCredits })}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-gray-600">{t('student.studentDashboard.activeCoursesThisSemester', { count: MY_COURSES.length })}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary-600" />
              {t('student.studentDashboard.achievements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className="rounded-xl border border-gray-100 p-3 text-center hover:shadow-md transition-all">
                    <div className={`mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${a.color} text-white shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{a.label}</p>
                    <p className="text-[10px] text-gray-500">{a.sub}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule + announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              {t('student.studentDashboard.todaysSchedule')}
            </CardTitle>
            <span className="text-xs text-gray-500">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TODAY_SCHEDULE.map((s, i) => {
                const isNow = s.status === 'now';
                const isDone = s.status === 'done';
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                      isNow
                        ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200'
                        : isDone
                        ? 'border-gray-100 bg-gray-50 opacity-70'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`flex flex-col items-center justify-center min-w-[60px] py-1 rounded-lg ${isNow ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
                      <span className="text-[10px] uppercase tracking-wide">{s.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-gray-900">{s.course}</h4>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.type}</span>
                        {isNow && <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">{t('student.studentDashboard.liveNow')}</span>}
                      </div>
                      <p className="text-xs text-gray-500">{s.time} - {s.end} • {s.room}</p>
                    </div>
                    {isDone && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-600" />
              {t('student.studentDashboard.announcements')}
            </CardTitle>
            <Link to="/dashboard/announcements">
              <Button variant="secondary" size="sm">{t('student.studentDashboard.all')}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ANNOUNCEMENTS.map((a) => {
                const priorityStyles =
                  a.priority === 'high'
                    ? 'border-l-red-500 bg-red-50/50'
                    : a.priority === 'medium'
                    ? 'border-l-amber-500 bg-amber-50/50'
                    : 'border-l-gray-300 bg-gray-50/50';
                return (
                  <div
                    key={a.id}
                    className={`border-l-4 ${priorityStyles} pl-3 py-2 pr-2 rounded-r-lg`}
                  >
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{a.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{a.author}</span>
                      <span>{a.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPA trend full row */}
      <ChartCard title={t('student.studentDashboard.gpaTrendTitle')} description={t('student.studentDashboard.gpaTrendDesc')}>
        <LineChart
          data={GPA_TREND}
          dataKey="semester"
          lines={[{ dataKey: 'gpa', name: t('student.studentDashboard.gpa'), stroke: '#0055cc' }]}
          height={280}
        />
      </ChartCard>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('student.studentDashboard.attendanceByCourseTitle')} description={t('student.studentDashboard.attendanceByCourseDesc')}>
          <BarChart
            data={ATTENDANCE_BY_COURSE}
            dataKey="course"
            bars={[{ dataKey: 'attendance', name: t('student.studentDashboard.attendancePct'), fill: '#10b981' }]}
            height={280}
          />
        </ChartCard>

        <ChartCard title={t('student.studentDashboard.gradeDistributionTitle')} description={t('student.studentDashboard.gradeDistributionDesc')}>
          <PieChart data={GRADE_DISTRIBUTION} height={280} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('student.studentDashboard.creditsByYearTitle')} description={t('student.studentDashboard.creditsByYearDesc')}>
          <BarChart
            data={CREDITS_BY_YEAR}
            dataKey="year"
            bars={[
              { dataKey: 'completed', name: t('student.studentDashboard.completed'), fill: '#0055cc' },
              { dataKey: 'total', name: t('student.studentDashboard.required'), fill: '#e5e7eb' },
            ]}
            height={260}
          />
        </ChartCard>

        <ChartCard title={t('student.studentDashboard.weeklyStudyHoursTitle')} description={t('student.studentDashboard.weeklyStudyHoursDesc')}>
          <AreaChart
            data={STUDY_HOURS}
            dataKey="week"
            areas={[{ dataKey: 'hours', name: t('student.studentDashboard.hours'), fill: '#8b5cf6' }]}
            height={260}
          />
        </ChartCard>
      </div>

      {/* My Courses + Upcoming Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              {t('student.studentDashboard.myCourses')}
            </CardTitle>
            <Link to="/dashboard/courses/my-courses">
              <Button variant="secondary" size="sm">{t('student.studentDashboard.viewAll')}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MY_COURSES.map((c) => (
                <div
                  key={c.code}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${c.color} text-white text-xs font-bold shadow-sm`}>
                        {c.code.replace(/[^0-9]/g, '').slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{c.code}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">
                            {t('student.studentDashboard.hrsCount', { count: c.credits })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{c.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.doctor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">{c.grade}</div>
                      <div className="text-xs text-gray-500">{c.gradePct}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> {t('student.studentDashboard.pctAttendance', { pct: c.attendance })}
                    </span>
                    <span className="font-medium text-gray-700">{t('student.studentDashboard.pctComplete', { pct: c.progress })}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${c.color}`}
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              {t('student.studentDashboard.upcomingAssessments')}
            </CardTitle>
            <Link to="/dashboard/assessments">
              <Button variant="secondary" size="sm">{t('student.studentDashboard.viewAll')}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {UPCOMING_ASSESSMENTS.map((a) => {
                const isUrgent = a.daysLeft <= 3;
                return (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isUrgent ? 'border-red-200 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{a.title}</h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                            {a.course}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {a.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t('student.studentDashboard.daysLeft', { count: a.daysLeft })}
                          </span>
                          <span>{t('student.studentDashboard.ptsCount', { count: a.points })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUrgent && <AlertCircle className="h-5 w-5 text-red-500" />}
                        <Button size="sm" variant={isUrgent ? 'primary' : 'secondary'}>
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {t('student.studentDashboard.submit')}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick activity / motivation footer */}
      <Card className="rounded-2xl border border-gray-100 bg-gradient-to-br from-primary-50 via-white to-amber-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('student.studentDashboard.streakMessage', { count: STATS.streak })}</p>
                <p className="text-sm text-gray-600">{t('student.studentDashboard.topPercentMessage', { pct: Math.round((STATS.rank / STATS.rankTotal) * 100) })}</p>
              </div>
            </div>
            <Link to="/dashboard/courses/my-courses">
              <Button>
                {t('student.studentDashboard.continueLearning')}
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
