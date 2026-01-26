import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function MyCourses() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToastStore();
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState<string>('current');
  const [dropDialogOpen, setDropDialogOpen] = useState(false);
  const [enrollmentToDrop, setEnrollmentToDrop] = useState<IEnrollment | null>(null);
  const [dropping, setDropping] = useState(false);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const data = await api.getMyCourses({ semester: selectedSemester });
        // Ensure data is always an array
        const enrollmentsArray = Array.isArray(data) ? data : [];
        setEnrollments(enrollmentsArray);
      } catch (error) {
        logger.error('Failed to fetch courses', {
          context: 'MyCourses',
          error,
        });
        showError('Failed to load your courses');
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [selectedSemester]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            Passed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      case 'enrolled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3" />
            Enrolled
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Withdrawn
          </span>
        );
      default:
        return null;
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-gray-600';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.myCourses')}</h1>
          <p className="text-gray-600 mt-1">View your enrolled courses and academic progress</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="current">Current Semester</option>
            <option value="all">All Semesters</option>
          </select>
          <Link to="/dashboard/courses/all">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credit Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments.reduce((sum, e) => 
                      sum + (e.courseOffering?.course?.creditHours || 0), 0
                    )}
                  </p>
                </div>
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrollments
                      .filter(e => e.grades?.finalLetter)
                      .length > 0
                      ? (enrollments
                          .filter(e => e.grades?.finalLetter)
                          .reduce((sum, e) => {
                            const grade = e.grades?.finalLetter || '';
                            const gradePoints: Record<string, number> = {
                              'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0,
                              'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                              'D+': 1.3, 'D': 1.0, 'F': 0.0
                            };
                            return sum + (gradePoints[grade] || 0);
                          }, 0) / enrollments.filter(e => e.grades?.finalLetter).length
                        ).toFixed(2)
                      : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Courses List */}
      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet</p>
            <Link to="/dashboard/courses/all">
              <Button variant="primary">
                Browse Available Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => {
            const offering = enrollment.courseOffering;
            const course = offering?.course;
            
            return (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {course?.code}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {course?.creditHours} Credits
                        </span>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      <CardTitle className="text-lg mb-1">{course?.title}</CardTitle>
                      <p className="text-sm text-gray-600">{course?.department.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Semester: {enrollment.semester}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Instructors */}
                  {offering?.doctors && offering.doctors.length > 0 && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Instructors</p>
                        <p className="text-sm text-gray-700">
                          {offering.doctors.map(d => d.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Schedule */}
                  {offering?.schedule && offering.schedule.length > 0 && (
                    <div className="space-y-1">
                      {offering.schedule.map((session, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{session.day}</span>
                          <Clock className="h-4 w-4 text-gray-400 ml-2" />
                          <span>{session.startTime}{session.endTime ? ` - ${session.endTime}` : ''}</span>
                          <MapPin className="h-4 w-4 text-gray-400 ml-2" />
                          <span>{session.location}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grades */}
                  {enrollment.grades && enrollment.grades.finalLetter && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Final Grade</span>
                        <span className={`text-lg font-bold ${getGradeColor(enrollment.grades.finalLetter)}`}>
                          {enrollment.grades.finalLetter} ({enrollment.grades.finalTotal?.toFixed(1) || 'N/A'}%)
                        </span>
                      </div>
                      {enrollment.finalAttendancePercentage !== undefined && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Attendance</span>
                          <span className="text-sm font-medium text-gray-700">
                            {enrollment.finalAttendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <Link to={`/dashboard/courses/${offering?.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {enrollment.status === 'enrolled' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEnrollmentToDrop(enrollment);
                          setDropDialogOpen(true);
                        }}
                      >
                        Drop
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Drop Course Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dropDialogOpen}
        onClose={() => {
          setDropDialogOpen(false);
          setEnrollmentToDrop(null);
        }}
        onConfirm={async () => {
          if (!enrollmentToDrop) return;
          
          try {
            setDropping(true);
            await api.dropCourse(enrollmentToDrop.id);
            showSuccess(`Successfully dropped ${enrollmentToDrop.courseOffering?.course?.code}`);
            setEnrollments(enrollments.filter(e => e.id !== enrollmentToDrop.id));
            setDropDialogOpen(false);
            setEnrollmentToDrop(null);
          } catch (error) {
            showError('Failed to drop course');
          } finally {
            setDropping(false);
          }
        }}
        title="Drop Course"
        message={
          enrollmentToDrop ? (
            <>
              <p className="mb-2">
                Are you sure you want to drop <strong>{enrollmentToDrop.courseOffering?.course?.code} - {enrollmentToDrop.courseOffering?.course?.title}</strong>?
              </p>
              <p className="text-xs text-gray-500">
                This action cannot be undone. You will need to re-enroll if you change your mind.
              </p>
            </>
          ) : (
            'Are you sure you want to drop this course?'
          )
        }
        confirmText="Yes, Drop Course"
        cancelText="Cancel"
        variant="danger"
        isLoading={dropping}
      />
    </div>
  );
}

