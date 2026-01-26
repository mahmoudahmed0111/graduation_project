import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { 
  Search, 
  Users, 
  BookOpen, 
  Mail, 
  GraduationCap,
  Eye,
  Download,
  Filter,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';
import { IEnrollment, ICourseOffering } from '@/types';

interface RosterStudent {
  id: string;
  studentId: string;
  name: string;
  email: string;
  year: number;
  semester: number;
  courseOffering: ICourseOffering;
  enrollment: IEnrollment;
  attendance?: number;
  grade?: number;
  status: string;
}

export function TeacherRoster() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<RosterStudent[]>([]);
  const [courses, setCourses] = useState<ICourseOffering[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch doctor's courses
        const coursesData = await api.getCourseOfferings({});
        const doctorCourses = coursesData.filter(course => 
          course.doctors.some(doc => doc.id === user?.id)
        );
        setCourses(doctorCourses);

        // Mock roster data - in real app, fetch from API
        const mockRosterStudents: RosterStudent[] = [
          {
            id: '1',
            studentId: '2021001',
            name: 'Ahmed Mohamed',
            email: 'ahmed.mohamed@university.edu',
            year: 3,
            semester: 1,
            courseOffering: doctorCourses[0] || coursesData[0],
            enrollment: {
              id: 'enroll-1',
              student_id: '1',
              courseOffering: doctorCourses[0] || coursesData[0],
              semester: 'Fall 2025',
              status: 'enrolled',
              enrolledAt: '2024-09-01',
              finalAttendancePercentage: 92,
              grades: {
                attendance: 9,
                midterm: 18,
                assignments: 17,
                project: 9,
                finalExam: 36,
                finalTotal: 89,
                finalLetter: 'B+',
              },
            },
            attendance: 92,
            grade: 89,
            status: 'enrolled',
          },
          {
            id: '2',
            studentId: '2021002',
            name: 'Fatima Ali',
            email: 'fatima.ali@university.edu',
            year: 3,
            semester: 1,
            courseOffering: doctorCourses[0] || coursesData[0],
            enrollment: {
              id: 'enroll-2',
              student_id: '2',
              courseOffering: doctorCourses[0] || coursesData[0],
              semester: 'Fall 2025',
              status: 'enrolled',
              enrolledAt: '2024-09-01',
              finalAttendancePercentage: 98,
              grades: {
                attendance: 10,
                midterm: 20,
                assignments: 20,
                project: 10,
                finalExam: 38,
                finalTotal: 98,
                finalLetter: 'A+',
              },
            },
            attendance: 98,
            grade: 98,
            status: 'enrolled',
          },
          {
            id: '3',
            studentId: '2021003',
            name: 'Mohamed Hassan',
            email: 'mohamed.hassan@university.edu',
            year: 3,
            semester: 1,
            courseOffering: doctorCourses[0] || coursesData[0],
            enrollment: {
              id: 'enroll-3',
              student_id: '3',
              courseOffering: doctorCourses[0] || coursesData[0],
              semester: 'Fall 2025',
              status: 'enrolled',
              enrolledAt: '2024-09-01',
              finalAttendancePercentage: 75,
              grades: {
                attendance: 7,
                midterm: 15,
                assignments: 15,
                project: 8,
                finalExam: 32,
                finalTotal: 77,
                finalLetter: 'C+',
              },
            },
            attendance: 75,
            grade: 77,
            status: 'enrolled',
          },
          {
            id: '4',
            studentId: '2021004',
            name: 'Sara Ibrahim',
            email: 'sara.ibrahim@university.edu',
            year: 3,
            semester: 1,
            courseOffering: doctorCourses[1] || coursesData[1] || doctorCourses[0] || coursesData[0],
            enrollment: {
              id: 'enroll-4',
              student_id: '4',
              courseOffering: doctorCourses[1] || coursesData[1] || doctorCourses[0] || coursesData[0],
              semester: 'Fall 2025',
              status: 'enrolled',
              enrolledAt: '2024-09-01',
              finalAttendancePercentage: 88,
              grades: {
                attendance: 8,
                midterm: 17,
                assignments: 18,
                project: 9,
                finalExam: 35,
                finalTotal: 87,
                finalLetter: 'B+',
              },
            },
            attendance: 88,
            grade: 87,
            status: 'enrolled',
          },
          {
            id: '5',
            studentId: '2021005',
            name: 'Omar Khaled',
            email: 'omar.khaled@university.edu',
            year: 3,
            semester: 1,
            courseOffering: doctorCourses[0] || coursesData[0],
            enrollment: {
              id: 'enroll-5',
              student_id: '5',
              courseOffering: doctorCourses[0] || coursesData[0],
              semester: 'Fall 2025',
              status: 'enrolled',
              enrolledAt: '2024-09-01',
              finalAttendancePercentage: 65,
              grades: {
                attendance: 6,
                midterm: 12,
                assignments: 12,
                project: 6,
                finalExam: 28,
                finalTotal: 64,
                finalLetter: 'D',
              },
            },
            attendance: 65,
            grade: 64,
            status: 'enrolled',
          },
        ];
        setStudents(mockRosterStudents);
      } catch (error) {
        logger.error('Failed to fetch roster data', {
          context: 'TeacherRoster',
          error,
        });
        showError('Failed to load roster');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, showError]);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.includes(searchQuery) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = !selectedCourse || 
      student.courseOffering.id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Get unique courses for filter
  const uniqueCourses = Array.from(
    new Map(students.map(s => [s.courseOffering.id, s.courseOffering])).values()
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 font-semibold';
    if (grade >= 80) return 'text-blue-600 font-semibold';
    if (grade >= 70) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return 'text-green-600';
    if (attendance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {i18n.language === 'ar' ? 'جاري تحميل قائمة الطلاب...' : 'Loading roster...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === 'ar' ? 'قائمة الطلاب' : 'Student Roster'}
          </h1>
          <p className="text-gray-600 mt-1">
            {i18n.language === 'ar'
              ? 'عرض وإدارة الطلاب المسجلين في مقرراتك'
              : 'View and manage students in your courses'}
          </p>
        </div>
        <Button variant="secondary" className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm">
          <Download className="h-4 w-4" />
          {i18n.language === 'ar' ? 'تصدير القائمة' : 'Export Roster'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'إجمالي الطلاب' : 'Total Students'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'المقررات النشطة' : 'Active Courses'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueCourses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'متوسط الحضور' : 'Avg. Attendance'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length)
                    : 0}%
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {i18n.language === 'ar' ? 'متوسط التقدير' : 'Avg. Grade'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + (s.grade || 0), 0) / students.length)
                    : 0}%
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={
                    i18n.language === 'ar'
                      ? 'ابحث بالاسم أو الرقم الجامعي أو البريد الإلكتروني...'
                      : 'Search by name, ID, or email...'
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select2
                value={selectedCourse}
                onChange={(value) => {
                  setSelectedCourse(value);
                  setCurrentPage(1);
                }}
                options={[
                  {
                    value: '',
                    label: i18n.language === 'ar' ? 'كل المقررات' : 'All Courses',
                  },
                  ...uniqueCourses.map((course) => ({
                    value: course.id,
                    label: `${course.course.code} - ${course.course.title}`,
                  })),
                ]}
                placeholder={
                  i18n.language === 'ar'
                    ? 'تصفية حسب المقرر...'
                    : 'Filter by course...'
                }
                className="w-full md:w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'الرقم الجامعي' : 'Student ID'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'الاسم' : 'Name'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'المقرر' : 'Course'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'العام والفصل' : 'Year & Semester'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'نسبة الحضور' : 'Attendance'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'الدرجة' : 'Grade'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'الحالة' : 'Status'}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {i18n.language === 'ar' ? 'إجراءات' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="!px-0 !py-16">
                      <div className="flex flex-col items-center justify-center w-full min-h-[200px]">
                        <Users className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {i18n.language === 'ar' ? 'لم يتم العثور على طلاب' : 'No students found'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {i18n.language === 'ar'
                            ? 'جرّب تعديل البحث أو عوامل التصفية'
                            : 'Try adjusting your search or filters'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-600" />
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{student.courseOffering.course.code}</p>
                            <p className="text-xs text-gray-500">{student.courseOffering.course.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {i18n.language === 'ar'
                            ? `العام ${student.year} - الفصل ${student.semester}`
                            : `Year ${student.year} - Sem ${student.semester}`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getAttendanceColor(student.attendance || 0)}`}>
                          {student.attendance || 0}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {student.grade !== undefined ? (
                          <span className={getGradeColor(student.grade)}>
                            {student.grade}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          student.status === 'enrolled' ? 'bg-green-100 text-green-700' :
                          student.status === 'passed' ? 'bg-blue-100 text-blue-700' :
                          student.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {i18n.language === 'ar'
                            ? (student.status === 'enrolled'
                                ? 'مسجّل'
                                : student.status === 'passed'
                                  ? 'ناجح'
                                  : student.status === 'failed'
                                    ? 'راسب'
                                    : student.status)
                            : student.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link to={`/dashboard/students/${student.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title={i18n.language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
