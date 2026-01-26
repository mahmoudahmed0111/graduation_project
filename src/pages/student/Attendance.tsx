import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IAttendanceReport, IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  Clock, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function Attendance() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError } = useToastStore();
  const [attendanceReports, setAttendanceReports] = useState<IAttendanceReport[]>([]);
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, attendanceData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getMyAttendanceReport().catch(() => [])
        ]);
        
        const coursesArray = Array.isArray(coursesData) ? coursesData : [];
        const attendanceArray = Array.isArray(attendanceData) ? attendanceData : [];
        
        setMyCourses(coursesArray);
        setAttendanceReports(attendanceArray);
      } catch (error) {
        logger.error('Failed to fetch attendance data', {
          context: 'Attendance',
          error,
        });
        showError('Failed to load attendance data');
        setAttendanceReports([]);
        setMyCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter reports
  const filteredReports = selectedCourse === 'all'
    ? attendanceReports
    : attendanceReports.filter(report => report.courseOffering.id === selectedCourse);

  // Calculate overall statistics
  const overallStats = attendanceReports.reduce((acc, report) => {
    acc.totalSessions += report.totalSessions;
    acc.attendedSessions += report.attendedSessions;
    return acc;
  }, { totalSessions: 0, attendedSessions: 0 });

  const overallPercentage = overallStats.totalSessions > 0
    ? (overallStats.attendedSessions / overallStats.totalSessions) * 100
    : 0;

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          Excellent
        </span>
      );
    } else if (percentage >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle2 className="h-3 w-3" />
          Good
        </span>
      );
    } else if (percentage >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertCircle className="h-3 w-3" />
          Warning
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
          Low
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.attendance')}</h1>
        <p className="text-gray-600 mt-1">Track your attendance across all courses</p>
      </div>

      {/* Overall Statistics */}
      {attendanceReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overall Attendance</p>
                  <p className={`text-3xl font-bold ${getAttendanceColor(overallPercentage)}`}>
                    {overallPercentage.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{overallStats.totalSessions}</p>
                </div>
                <Calendar className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Attended Sessions</p>
                  <p className="text-3xl font-bold text-gray-900">{overallStats.attendedSessions}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      {attendanceReports.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Courses</option>
              {myCourses.map(course => (
                <option key={course.courseOffering?.id} value={course.courseOffering?.id}>
                  {course.courseOffering?.course?.code} - {course.courseOffering?.course?.title}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Attendance Reports */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No attendance data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const percentage = report.attendancePercentage;
            const missedSessions = report.totalSessions - report.attendedSessions;
            
            return (
              <Card key={report.courseOffering.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {report.courseOffering.course.code}
                        </span>
                        {getAttendanceBadge(percentage)}
                      </div>
                      <CardTitle className="text-lg mb-1">{report.courseOffering.course.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Attendance Percentage */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
                      <span className={`text-3xl font-bold ${getAttendanceColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          percentage >= 90 ? 'bg-green-600' :
                          percentage >= 75 ? 'bg-blue-600' :
                          percentage >= 60 ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Attended</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{report.attendedSessions}</p>
                      <p className="text-xs text-blue-600">sessions</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-700 font-medium">Missed</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{missedSessions}</p>
                      <p className="text-xs text-red-600">sessions</p>
                    </div>
                  </div>

                  {/* Total Sessions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Total Sessions</span>
                    <span className="text-sm font-semibold text-gray-900">{report.totalSessions}</span>
                  </div>

                  {/* Warning for Low Attendance */}
                  {percentage < 75 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-yellow-800">Attendance Warning</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Your attendance is below 75%. Please ensure regular attendance to avoid academic penalties.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {filteredReports.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredReports.length} of {attendanceReports.length} course(s)
        </div>
      )}
    </div>
  );
}

