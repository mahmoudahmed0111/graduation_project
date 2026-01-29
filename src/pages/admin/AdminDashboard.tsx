import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Building2,
  Calendar,
  FileText,
  Bell,
  Clock
} from 'lucide-react';
import { IUser, IAnnouncement, ICourse, IEnrollment } from '@/types';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { ChartCard } from '@/components/charts';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LineChart } from '@/components/charts/LineChart';
import { logger } from '@/lib/logger';
import { formatDate } from '@/utils/formatters';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const { i18n } = useTranslation();
  const admin = user as IUser;
  
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock statistics - in real app, these would come from API
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeAnnouncements: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [coursesData, enrollmentsData, announcementsData] = await Promise.all([
          api.getCourses().catch(() => ({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 })),
          api.getEnrollments().catch(() => []),
          api.getMyAnnouncements().catch(() => [])
        ]);

        const coursesList = Array.isArray(coursesData) ? coursesData : coursesData.data || [];
        setCourses(coursesList);
        setEnrollments(enrollmentsData);
        setAnnouncements(announcementsData.slice(0, 5));

        // Calculate statistics
        setStats({
          totalStudents: new Set(enrollmentsData.map(e => e.student_id)).size,
          totalCourses: coursesList.length,
          totalEnrollments: enrollmentsData.length,
          activeAnnouncements: announcementsData.length,
        });
      } catch (error) {
        logger.error('Failed to fetch dashboard data', {
          context: 'AdminDashboard',
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
      label: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Enrollments',
      value: stats.totalEnrollments,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Announcements',
      value: stats.activeAnnouncements,
      icon: Bell,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {admin?.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-primary-100">
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
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Courses - Full Width */}
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            Recent Courses
          </CardTitle>
          <Link to="/dashboard/courses/all">
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No courses available</p>
                  <Link to="/dashboard/courses/create">
                    <Button className="mt-4">Create Course</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/80">
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Course Code
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Course Title
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Credits
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Instructor
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Enrollments
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.slice(0, 10).map((course) => {
                        const courseEnrollments = enrollments.filter(e => e.courseOffering?.course?.id === course.id);
                        return (
                          <TableRow key={course.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{course.code}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{course.title}</p>
                                {course.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{course.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700 font-medium">
                                {course.credits}
                              </span>
                            </TableCell>
                            <TableCell>
                              {course.teacherName ? (
                                <span className="text-sm text-gray-700">{course.teacherName}</span>
                              ) : (
                                <span className="text-sm text-gray-400">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-gray-700">
                                {courseEnrollments.length}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Link to={`/dashboard/courses/${course.id}`}>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
        </CardContent>
      </Card>

      {/* Announcements - Full Width */}
      <Card className="w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            Announcements
          </CardTitle>
          <Link to="/dashboard/announcements">
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No announcements</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Title
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Content
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Author
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Scope
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-md">
                          {announcement.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{announcement.author.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                          {announcement.scope.level}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(announcement.createdAt)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <ChartCard 
          title="Enrollment Trends" 
          description="Course enrollments over time"
        >
          {(() => {
            const enrollmentData = enrollments.reduce((acc, enrollment) => {
              const month = new Date(enrollment.enrolledAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              acc[month] = (acc[month] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const chartData = Object.entries(enrollmentData)
              .map(([month, count]) => ({ month, enrollments: count }))
              .sort((a, b) => a.month.localeCompare(b.month))
              .slice(-6);

            return chartData.length > 0 ? (
              <LineChart
                data={chartData}
                dataKey="month"
                lines={[
                  { dataKey: 'enrollments', name: 'Enrollments', stroke: '#0055cc' },
                ]}
                xAxisLabel="Month"
                yAxisLabel="Enrollments"
                height={250}
              />
            ) : (
              <div className="flex items-center justify-center h-[250px] text-gray-500">
                <p>No enrollment data available</p>
              </div>
            );
          })()}
        </ChartCard>

        {/* Course Distribution */}
        <ChartCard 
          title="Course Distribution" 
          description="Courses by department"
        >
          {(() => {
            const courseDistribution = courses.reduce((acc, _course) => {
              const dept = 'General'; // In real app, get from course.department
              acc[dept] = (acc[dept] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const pieData = Object.entries(courseDistribution).length > 0
              ? Object.entries(courseDistribution).map(([name, value]) => ({ name, value }))
              : [
                  { name: 'Computer Science', value: 12 },
                  { name: 'Mathematics', value: 8 },
                  { name: 'Engineering', value: 10 },
                ];

            return <PieChart data={pieData} height={250} />;
          })()}
        </ChartCard>

        {/* Enrollment Status */}
        <ChartCard 
          title="Enrollment Status" 
          description="Distribution of enrollment statuses"
        >
          {(() => {
            const statusCounts = enrollments.reduce((acc, enrollment) => {
              const status = enrollment.status;
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const barData = Object.entries(statusCounts).length > 0
              ? Object.entries(statusCounts).map(([status, count]) => ({
                  status: status.charAt(0).toUpperCase() + status.slice(1),
                  count,
                }))
              : [
                  { status: 'Enrolled', count: 150 },
                  { status: 'Passed', count: 200 },
                  { status: 'Failed', count: 20 },
                ];

            return (
              <BarChart
                data={barData}
                dataKey="status"
                bars={[
                  { dataKey: 'count', name: 'Count', fill: '#10b981' },
                ]}
                xAxisLabel="Status"
                yAxisLabel="Count"
                height={250}
              />
            );
          })()}
        </ChartCard>

        {/* Students by Year */}
        <ChartCard 
          title="Students Overview" 
          description="Active students statistics"
        >
          {(() => {
            // Mock data - in real app, fetch from API
            const studentData = [
              { category: 'Active', count: stats.totalStudents },
              { category: 'Enrolled', count: stats.totalEnrollments },
            ];

            return (
              <BarChart
                data={studentData}
                dataKey="category"
                bars={[
                  { dataKey: 'count', name: 'Count', fill: '#0055cc' },
                ]}
                xAxisLabel="Category"
                yAxisLabel="Count"
                height={250}
              />
            );
          })()}
        </ChartCard>
      </div>
    </div>
  );
}

