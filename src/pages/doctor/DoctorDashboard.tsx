import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  FileText,
  Clock,
  AlertCircle,
  Calendar,
  Bell,
  ClipboardList,
  Building2,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  Award,
  CheckCircle2,
  Activity,
  Target,
  Star,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChartCard } from '@/components/charts';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { IUser } from '@/types';

// ============ STATIC DATA ============

const STATS = {
  totalCourses: 6,
  coursesDelta: '+1',
  totalStudents: 184,
  studentsDelta: '+12',
  pendingAssessments: 23,
  assessmentsDelta: '-4',
  upcomingClasses: 9,
  classesDelta: '+2',
  avgAttendance: 92,
  avgGrade: 84.5,
  submissionRate: 96,
  rating: 4.7,
};

const MY_COURSES = [
  { code: 'CS101', title: 'Introduction to Programming', students: 45, creditHours: 3, semester: 'Fall 2026', progress: 68, color: 'from-blue-500 to-blue-600' },
  { code: 'CS201', title: 'Data Structures & Algorithms', students: 38, creditHours: 4, semester: 'Fall 2026', progress: 72, color: 'from-purple-500 to-purple-600' },
  { code: 'CS305', title: 'Database Systems', students: 32, creditHours: 3, semester: 'Fall 2026', progress: 55, color: 'from-emerald-500 to-emerald-600' },
  { code: 'CS410', title: 'Machine Learning', students: 28, creditHours: 3, semester: 'Fall 2026', progress: 48, color: 'from-orange-500 to-orange-600' },
  { code: 'CS450', title: 'Software Engineering', students: 25, creditHours: 3, semester: 'Fall 2026', progress: 80, color: 'from-pink-500 to-pink-600' },
  { code: 'CS499', title: 'Senior Capstone', students: 16, creditHours: 4, semester: 'Fall 2026', progress: 35, color: 'from-cyan-500 to-cyan-600' },
];

const UPCOMING_ASSESSMENTS = [
  { id: 'a1', title: 'Midterm Exam', course: 'CS201', daysLeft: 2, points: 100, type: 'Exam', submissions: 0, total: 38 },
  { id: 'a2', title: 'Project Proposal', course: 'CS499', daysLeft: 4, points: 50, type: 'Project', submissions: 8, total: 16 },
  { id: 'a3', title: 'Lab Assignment 5', course: 'CS101', daysLeft: 5, points: 25, type: 'Lab', submissions: 22, total: 45 },
  { id: 'a4', title: 'Quiz - SQL Joins', course: 'CS305', daysLeft: 7, points: 20, type: 'Quiz', submissions: 0, total: 32 },
  { id: 'a5', title: 'ML Homework 3', course: 'CS410', daysLeft: 9, points: 40, type: 'Homework', submissions: 5, total: 28 },
];

const ANNOUNCEMENTS = [
  { id: 1, title: 'Faculty meeting rescheduled to Monday 10 AM', author: 'Dean Office', time: '2h ago', priority: 'high' },
  { id: 2, title: 'New grading system rollout next semester', author: 'Academic Affairs', time: '1d ago', priority: 'medium' },
  { id: 3, title: 'Research grant applications due May 15', author: 'Research Dept', time: '2d ago', priority: 'medium' },
  { id: 4, title: 'Library closed for maintenance this weekend', author: 'Library', time: '3d ago', priority: 'low' },
];

const TODAY_SCHEDULE = [
  { time: '09:00 - 10:30', course: 'CS101', room: 'Room 204', type: 'Lecture', status: 'done' },
  { time: '11:00 - 12:30', course: 'CS201', room: 'Lab B-12', type: 'Lab', status: 'now' },
  { time: '14:00 - 15:30', course: 'CS305', room: 'Room 301', type: 'Lecture', status: 'upcoming' },
  { time: '16:00 - 17:00', course: 'Office Hours', room: 'Office 412', type: 'Meeting', status: 'upcoming' },
];

const STUDENT_PERFORMANCE = [
  { week: 'W1', avg: 78, attendance: 95 },
  { week: 'W2', avg: 80, attendance: 93 },
  { week: 'W3', avg: 82, attendance: 91 },
  { week: 'W4', avg: 79, attendance: 89 },
  { week: 'W5', avg: 83, attendance: 92 },
  { week: 'W6', avg: 85, attendance: 94 },
  { week: 'W7', avg: 84, attendance: 92 },
  { week: 'W8', avg: 87, attendance: 95 },
];

const ENROLLMENT_BY_COURSE = MY_COURSES.map(c => ({ course: c.code, students: c.students }));

const ASSESSMENT_DISTRIBUTION = [
  { name: 'Quizzes', value: 28 },
  { name: 'Assignments', value: 35 },
  { name: 'Projects', value: 12 },
  { name: 'Exams', value: 8 },
  { name: 'Labs', value: 17 },
];

const GRADE_DISTRIBUTION = [
  { grade: 'A', count: 42 },
  { grade: 'B', count: 68 },
  { grade: 'C', count: 51 },
  { grade: 'D', count: 18 },
  { grade: 'F', count: 5 },
];

const SUBMISSIONS_TREND = [
  { month: 'Jan', onTime: 92, late: 8 },
  { month: 'Feb', onTime: 88, late: 12 },
  { month: 'Mar', onTime: 94, late: 6 },
  { month: 'Apr', onTime: 96, late: 4 },
];

const RECENT_ACTIVITY = [
  { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', text: 'Graded 12 submissions for CS201 Quiz 3', time: '15m ago' },
  { icon: MessageSquare, color: 'text-blue-600 bg-blue-50', text: 'New question posted in CS101 forum', time: '1h ago' },
  { icon: FileText, color: 'text-purple-600 bg-purple-50', text: 'Published new material: ML Lecture 7', time: '3h ago' },
  { icon: Users, color: 'text-orange-600 bg-orange-50', text: '3 new enrollments in CS499', time: '5h ago' },
  { icon: Award, color: 'text-amber-600 bg-amber-50', text: 'Received teaching excellence nomination', time: '1d ago' },
];

// ============ COMPONENT ============

export function DoctorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const doctor = user as IUser;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statCards = [
    {
      label: t('doctor.doctorDashboard.statMyCourses'),
      value: STATS.totalCourses,
      delta: STATS.coursesDelta,
      trend: 'up',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hint: t('doctor.doctorDashboard.statMyCoursesHint'),
    },
    {
      label: t('doctor.doctorDashboard.statTotalStudents'),
      value: STATS.totalStudents,
      delta: STATS.studentsDelta,
      trend: 'up',
      icon: Users,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      hint: t('doctor.doctorDashboard.statTotalStudentsHint'),
    },
    {
      label: t('doctor.doctorDashboard.statPendingReviews'),
      value: STATS.pendingAssessments,
      delta: STATS.assessmentsDelta,
      trend: 'down',
      icon: ClipboardList,
      gradient: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      hint: t('doctor.doctorDashboard.statPendingReviewsHint'),
    },
    {
      label: t('doctor.doctorDashboard.statUpcomingClasses'),
      value: STATS.upcomingClasses,
      delta: STATS.classesDelta,
      trend: 'up',
      icon: Calendar,
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      hint: t('doctor.doctorDashboard.statUpcomingClassesHint'),
    },
  ];

  const kpiCards = [
    { label: t('doctor.doctorDashboard.kpiAvgAttendance'), value: `${STATS.avgAttendance}%`, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('doctor.doctorDashboard.kpiAvgGrade'), value: STATS.avgGrade, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('doctor.doctorDashboard.kpiSubmissionRate'), value: `${STATS.submissionRate}%`, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('doctor.doctorDashboard.kpiRating'), value: `${STATS.rating} / 5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-6 lg:p-8 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-primary-200 text-sm mb-1">{t('doctor.doctorDashboard.welcomeBack')}</p>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">{t('doctor.doctorDashboard.drName', { name: doctor?.name || t('doctor.doctorDashboard.professor') })}</h1>
            <div className="flex flex-wrap items-center gap-4 text-primary-100 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{t('doctor.doctorDashboard.facultyCS')}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>{t('doctor.doctorDashboard.seniorLecturer')}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t('doctor.doctorDashboard.fallSemester2026')}</span>
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

      {/* Secondary KPI Strip */}
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

      {/* Today's Schedule + Quick Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              {t('doctor.doctorDashboard.todaysSchedule')}
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
                      <span className="text-[10px] uppercase tracking-wide">{s.time.split(' - ')[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-gray-900">{s.course}</h4>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{s.type}</span>
                        {isNow && <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">{t('doctor.doctorDashboard.liveNow')}</span>}
                      </div>
                      <p className="text-xs text-gray-500">{s.time} • {s.room}</p>
                    </div>
                    {isDone && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              {t('doctor.doctorDashboard.recentActivity')}
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

      {/* Charts Row 1: Student Performance Trend (full) */}
      <ChartCard title={t('doctor.doctorDashboard.classPerformanceTrend')} description={t('doctor.doctorDashboard.classPerformanceDesc')}>
        <LineChart
          data={STUDENT_PERFORMANCE}
          dataKey="week"
          lines={[
            { dataKey: 'avg', name: t('doctor.doctorDashboard.avgGradeLine'), stroke: '#0055cc' },
            { dataKey: 'attendance', name: t('doctor.doctorDashboard.attendancePctLine'), stroke: '#10b981' },
          ]}
          height={280}
        />
      </ChartCard>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('doctor.doctorDashboard.enrollmentByCourse')} description={t('doctor.doctorDashboard.enrollmentByCourseDesc')}>
          <BarChart
            data={ENROLLMENT_BY_COURSE}
            dataKey="course"
            bars={[{ dataKey: 'students', name: t('doctor.doctorDashboard.studentsLabel'), fill: '#0055cc' }]}
            height={280}
          />
        </ChartCard>

        <ChartCard title={t('doctor.doctorDashboard.assessmentDistribution')} description={t('doctor.doctorDashboard.assessmentDistributionDesc')}>
          <PieChart data={ASSESSMENT_DISTRIBUTION} height={280} />
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('doctor.doctorDashboard.gradeDistribution')} description={t('doctor.doctorDashboard.gradeDistributionDesc')}>
          <BarChart
            data={GRADE_DISTRIBUTION}
            dataKey="grade"
            bars={[{ dataKey: 'count', name: t('doctor.doctorDashboard.studentsLabel'), fill: '#8b5cf6' }]}
            height={260}
          />
        </ChartCard>

        <ChartCard title={t('doctor.doctorDashboard.submissionsTrend')} description={t('doctor.doctorDashboard.submissionsTrendDesc')}>
          <AreaChart
            data={SUBMISSIONS_TREND}
            dataKey="month"
            areas={[
              { dataKey: 'onTime', name: t('doctor.doctorDashboard.onTime'), fill: '#10b981' },
              { dataKey: 'late', name: t('doctor.doctorDashboard.late'), fill: '#ef4444' },
            ]}
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
              {t('doctor.doctorDashboard.myCourses')}
            </CardTitle>
            <Link to="/dashboard/courses/my-courses">
              <Button variant="secondary" size="sm">{t('doctor.doctorDashboard.viewAll')}</Button>
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
                            {t('doctor.doctorDashboard.creditHours', { hours: c.creditHours })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{c.title}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {t('doctor.doctorDashboard.studentsCount', { count: c.students })}
                    </span>
                    <span className="font-medium text-gray-700">{t('doctor.doctorDashboard.percentComplete', { pct: c.progress })}</span>
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
              {t('doctor.doctorDashboard.upcomingAssessments')}
            </CardTitle>
            <Link to="/dashboard/assessments">
              <Button variant="secondary" size="sm">{t('doctor.doctorDashboard.viewAll')}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {UPCOMING_ASSESSMENTS.map((a) => {
                const isUrgent = a.daysLeft <= 3;
                const submissionPct = a.total > 0 ? Math.round((a.submissions / a.total) * 100) : 0;
                return (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isUrgent ? 'border-red-200 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
                            {a.daysLeft === 1 ? t('doctor.doctorDashboard.dayLeft', { count: a.daysLeft }) : t('doctor.doctorDashboard.daysLeft', { count: a.daysLeft })}
                          </span>
                          <span>{t('doctor.doctorDashboard.points', { pts: a.points })}</span>
                        </div>
                      </div>
                      {isUrgent && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{t('doctor.doctorDashboard.submissionsLabel')}</span>
                      <span className="font-medium text-gray-800">{a.submissions} / {a.total}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-primary-500'}`}
                        style={{ width: `${submissionPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader className="flex items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            {t('doctor.doctorDashboard.announcements')}
          </CardTitle>
          <Link to="/dashboard/announcements">
            <Button variant="secondary" size="sm">{t('doctor.doctorDashboard.viewAll')}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  className={`border-l-4 ${priorityStyles} pl-3 py-2.5 pr-3 rounded-r-lg hover:shadow-sm transition-all`}
                >
                  <h4 className="font-medium text-sm text-gray-900 mb-1">{a.title}</h4>
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
  );
}
