import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  CreditCard,
  GraduationCap,
  Building2,
  Calendar,
  BookOpen,
  Award,
  Edit,
  FileText,
  Clock
} from 'lucide-react';
import { IStudent, IEnrollment } from '@/types';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';
import { getStatusBadge } from '@/utils/status';
import { getGPAColor } from '@/constants/ui';

// Mock student data - in real app, fetch from API
const mockStudent: IStudent = {
  id: '1',
  name: 'Mahmoud Ahmed',
  email: 'mahmoud.ahmed@university.edu',
  role: 'student',
  universityId: 'university-1',
  nationalId: '12345678901234',
  year: 3,
  semester: 1,
  creditsEarned: 90,
  gpa: 3.75,
  department: {
    id: 'dept-1',
    name: 'Computer Science',
    code: 'CS',
    college: {
      id: 'college-1',
      name: 'Faculty of Engineering',
      code: 'ENG',
    },
  },
  academicStatus: 'good_standing',
} as IStudent;

export function ShowStudent() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<IStudent | null>(null);
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // In real app: const studentData = await api.getStudent(id)
        // For now, using mock data
        setStudent(mockStudent);
        
        // Fetch enrollments
        const enrollmentsData = await api.getEnrollments({ studentId: id }).catch(() => []);
        setEnrollments(enrollmentsData);
      } catch (err) {
        logger.error('Failed to fetch student data', {
          context: 'ShowStudent',
          error: err,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const renderStatusBadge = (status?: string) => {
    const badge = getStatusBadge(status);
    return (
      <span className={`px-3 py-1 text-sm rounded-full font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Student not found</p>
        <Link to="/dashboard/students">
          <Button variant="primary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/students">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-gray-600 mt-1">Student Details</p>
          </div>
        </div>
        <Link to={`/dashboard/students/${id}/edit`}>
          <Button variant="primary" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Student
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium text-gray-900">{student.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <CreditCard className="h-4 w-4" />
                    National ID
                  </div>
                  <p className="font-medium text-gray-900">{student.nationalId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Building2 className="h-4 w-4" />
                    Department
                  </div>
                  <p className="font-medium text-gray-900">{student.department?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{student.department?.college?.name || ''}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    Year & Semester
                  </div>
                  <p className="font-medium text-gray-900">
                    Year {student.year}, Semester {student.semester}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <BookOpen className="h-4 w-4" />
                    Credits Earned
                  </div>
                  <p className="font-medium text-gray-900">{student.creditsEarned || 0} credits</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Award className="h-4 w-4" />
                    GPA
                  </div>
                  <p className={`font-bold text-xl ${getGPAColor(student.gpa || 0)}`}>
                    {(student.gpa || 0).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    Status
                  </div>
                  {renderStatusBadge(student.academicStatus)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollments */}
          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Course Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrollments.map((enrollment) => {
                    const course = enrollment.courseOffering?.course;
                    return (
                      <div
                        key={enrollment.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{course?.code || 'N/A'}</h4>
                              {course?.creditHours && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                                  {course.creditHours} hrs
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                enrollment.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                                enrollment.status === 'passed' ? 'bg-blue-100 text-blue-700' :
                                enrollment.status === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {enrollment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{course?.title || 'Course Title'}</p>
                            {enrollment.grades?.finalLetter && (
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-600">Grade: <span className="font-medium text-primary-600">{enrollment.grades.finalLetter}</span></span>
                                {enrollment.grades.finalTotal !== undefined && (
                                  <span className="text-gray-600">Score: <span className="font-medium">{enrollment.grades.finalTotal.toFixed(1)}%</span></span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Courses</span>
                <span className="font-semibold text-gray-900">{enrollments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credits Earned</span>
                <span className="font-semibold text-gray-900">{student.creditsEarned || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GPA</span>
                <span className={`font-semibold ${getGPAColor(student.gpa || 0)}`}>
                  {(student.gpa || 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/dashboard/students/${id}/edit`}>
                <Button variant="secondary" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Student
                </Button>
              </Link>
              <Button variant="secondary" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Transcript
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                View Attendance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

