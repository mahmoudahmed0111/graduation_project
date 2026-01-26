import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
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
  Building2
} from 'lucide-react';
import { IUser, IAnnouncement, IEnrollment, IAssessment } from '@/types';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { ChartCard } from '@/components/charts';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { logger } from '@/lib/logger';
import { formatDate } from '@/utils/formatters';

export function DoctorDashboard() {
  const { user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const doctor = user as IUser;
  
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock statistics - in real app, these would come from API
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssessments: 0,
    upcomingClasses: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [coursesData, announcementsData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getMyAnnouncements().catch(() => [])
        ]);

        setMyCourses(coursesData);
        setAnnouncements(announcementsData.slice(0, 2));

        // Fetch assessments for courses
        const assessmentPromises = coursesData.map(enrollment => {
          const courseOfferingId = enrollment.courseOffering?.id || enrollment.courseOffering;
          if (!courseOfferingId || typeof courseOfferingId !== 'string') return Promise.resolve([]);
          return api.getCourseAssessments({ courseOffering: courseOfferingId }).catch(() => []);
        });
        const allAssessments = (await Promise.all(assessmentPromises)).flat();
        setAssessments(allAssessments);

        // Calculate statistics
        const uniqueStudents = new Set(coursesData.map(e => e.student_id));
        const pendingAssessments = allAssessments.filter(a => new Date(a.dueDate) > new Date()).length;

        setStats({
          totalCourses: coursesData.length,
          totalStudents: uniqueStudents.size,
          pendingAssessments,
          upcomingClasses: 0, // Would come from schedule API
        });
      } catch (error) {
        logger.error('Failed to fetch dashboard data', {
          context: 'DoctorDashboard',
          error,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  const statCards = [
    {
      label: t('mock.doctor.myCourses'),
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
      description: i18n.language === 'ar' ? 'المقررات التي تدرّسها هذا الفصل' : 'Teaching this semester',
    },
    {
      label: t('mock.doctor.totalStudents'),
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: t('mock.doctor.enrolledStudents'),
    },
    {
      label: t('mock.doctor.pendingAssessments'),
      value: stats.pendingAssessments,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: t('mock.doctor.toBeGraded'),
    },
    {
      label: t('mock.doctor.upcomingClasses'),
      value: stats.upcomingClasses,
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: i18n.language === 'ar' ? 'خلال هذا الأسبوع' : 'This week',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 lg:p-7 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('mock.doctor.welcomeBack')}, {doctor?.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-primary-100">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{t('mock.doctor.facultyMember')}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString(
                    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                    { month: 'long', year: 'numeric' }
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5" />
                <div className="text-2xl font-bold font-mono">
                  {currentTime.toLocaleTimeString(
                    i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                    { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
                  )}
                </div>
              </div>
              <div className="text-sm text-primary-200">
                {currentTime.toLocaleDateString(
                  i18n.language === 'ar' ? 'ar-EG' : 'en-US',
                  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label} 
              className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* First Row: My Courses and Upcoming Assessments side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary-600" />
              {t('mock.doctor.myCourses')}
            </CardTitle>
            <Link to="/dashboard/courses/my-courses">
              <Button variant="secondary" size="sm" className="font-medium">
                {i18n.language === 'ar' ? 'عرض الكل' : 'View All'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {myCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('mock.doctor.noCoursesAssigned')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myCourses.map((enrollment) => {
                  const course = enrollment.courseOffering?.course;
                  const courseStudents = myCourses.filter(e => 
                    e.courseOffering?.id === enrollment.courseOffering?.id
                  ).length;
                  return (
                    <div
                      key={enrollment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">
                              {course?.code || (i18n.language === 'ar' ? 'غير متوفر' : 'N/A')}
                            </h4>
                            {course?.creditHours && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                                {course.creditHours}{' '}
                                {i18n.language === 'ar' ? 'ساعات' : 'hrs'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {course?.title || (i18n.language === 'ar' ? 'اسم المقرر' : 'Course Title')}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {courseStudents}{' '}
                              {i18n.language === 'ar' ? 'طالب' : 'students'}
                            </span>
                            {enrollment.courseOffering?.semester && (
                              <span>
                                {i18n.language === 'ar' ? 'الفصل الدراسي: ' : 'Semester: '}
                                {enrollment.courseOffering.semester}
                              </span>
                            )}
                          </div>
                        </div>
                        <Link to={`/dashboard/roster?course=${enrollment.courseOffering?.id}`}>
                          <Button variant="secondary" size="sm">
                            {i18n.language === 'ar' ? 'عرض قائمة الطلاب' : 'View Roster'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assessments */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                {i18n.language === 'ar' ? 'التقييمات القادمة' : 'Upcoming Assessments'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const upcomingAssessments = assessments
                  .filter(a => new Date(a.dueDate) > new Date())
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5);

                // إذا لم توجد بيانات حقيقية، استخدم بيانات وهمية لعرض التصميم
                const dataToRender =
                  upcomingAssessments.length > 0
                    ? upcomingAssessments
                    : [
                        {
                          id: 'mock-1',
                          title:
                            i18n.language === 'ar'
                              ? 'واجب 1 - مقدمة في البرمجة'
                              : 'Assignment 1 - Introduction to Programming',
                          courseOffering: {
                            course: {
                              code: 'CS101',
                              title:
                                i18n.language === 'ar'
                                  ? 'مقدمة في البرمجة'
                                  : 'Introduction to Programming',
                            },
                          },
                          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                          totalPoints: 20,
                        },
                        {
                          id: 'mock-2',
                          title:
                            i18n.language === 'ar'
                              ? 'اختبار قصير - هياكل البيانات'
                              : 'Quiz - Data Structures',
                          courseOffering: {
                            course: {
                              code: 'CS201',
                              title:
                                i18n.language === 'ar'
                                  ? 'هياكل البيانات'
                                  : 'Data Structures',
                            },
                          },
                          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                          totalPoints: 10,
                        },
                      ];

                return (
                  <div className="space-y-3">
                    {dataToRender.map((assessment: any) => {
                      const daysUntilDue = Math.ceil(
                        (new Date(assessment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = daysUntilDue <= 3;
                      return (
                        <div
                          key={assessment.id}
                          className={`border rounded-lg p-4 ${
                            isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{assessment.title}</h4>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                  {assessment.courseOffering.course.code}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {assessment.courseOffering.course.title}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {i18n.language === 'ar' ? 'تاريخ التسليم: ' : 'Due: '}{formatDate(assessment.dueDate)}
                                </span>
                                <span>
                                  {assessment.totalPoints}{' '}
                                  {i18n.language === 'ar' ? 'درجة' : 'points'}
                                </span>
                                {isUrgent && (
                                  <span className="text-red-600 font-medium">
                                    {i18n.language === 'ar'
                                      ? `${daysUntilDue} أيام متبقية`
                                      : `${daysUntilDue} days left`}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isUrgent && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
      </div>

      {/* Second Row: Announcements */}
      <div>
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardHeader className="flex items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-600" />
              {i18n.language === 'ar' ? 'الإعلانات' : 'Announcements'}
            </CardTitle>
            <Link to="/dashboard/announcements">
              <Button variant="secondary" size="sm" className="font-medium">
                {i18n.language === 'ar' ? 'عرض الكل' : 'View All'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {i18n.language === 'ar' ? 'لا توجد إعلانات' : 'No announcements'}
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border-l-4 border-primary-500 pl-3 py-2 hover:bg-gray-50 rounded-r transition-colors"
                  >
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {announcement.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{announcement.author.name}</span>
                      <span>{formatDate(announcement.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section (reduced to two main charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Enrollment by Course */}
        <ChartCard 
          title={i18n.language === 'ar' ? 'الطلاب المسجلون' : 'Student Enrollment'}
          description={
            i18n.language === 'ar'
              ? 'عدد الطلاب المسجلين في كل مقرر'
              : 'Number of students per course'
          }
        >
          {(() => {
            const enrollmentData = myCourses.reduce((acc, enrollment) => {
              const courseCode = enrollment.courseOffering?.course?.code || 'N/A';
              acc[courseCode] = (acc[courseCode] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const chartData = Object.entries(enrollmentData).map(([course, count]) => ({
              course,
              students: count,
            }));

            return chartData.length > 0 ? (
              <BarChart
                data={chartData}
                dataKey="course"
                bars={[
                  { dataKey: 'students', name: 'Students', fill: '#0055cc' },
                ]}
                xAxisLabel={t('mock.doctor.course')}
                yAxisLabel={t('mock.doctor.students')}
                height={250}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <p>{t('mock.doctor.noEnrollmentData')}</p>
              </div>
            );
          })()}
        </ChartCard>

        {/* Assessment Distribution */}
        <ChartCard 
          title={i18n.language === 'ar' ? 'نظرة عامة على التقييمات' : 'Assessments Overview'}
          description={
            i18n.language === 'ar'
              ? 'توزيع التقييمات حسب المقرر'
              : 'Distribution of assessments by course'
          }
        >
          {(() => {
            const assessmentData = assessments.reduce((acc, assessment) => {
              const courseCode = assessment.courseOffering.course.code;
              acc[courseCode] = (acc[courseCode] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const pieData = Object.entries(assessmentData).length > 0
              ? Object.entries(assessmentData).map(([name, value]) => ({ name, value }))
              : [
                  { name: 'CS101', value: 5 },
                  { name: 'CS201', value: 3 },
                  { name: 'MATH101', value: 4 },
                ];

            return <PieChart data={pieData} height={250} />;
          })()}
        </ChartCard>
      </div>
    </div>
  );
}

