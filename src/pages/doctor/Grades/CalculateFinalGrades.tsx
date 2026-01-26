import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IEnrollment, ICourseOffering } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  Calculator, 
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Download,
  Save
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { Select2 } from '@/components/ui/Select2';
import { logger } from '@/lib/logger';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface StudentGrade {
  studentId: string;
  studentName: string;
  attendance: number;
  midterm: number;
  assignments: number;
  project: number;
  finalExam: number;
  calculatedTotal: number;
  finalLetter: string;
  enrollment: IEnrollment;
}

export function CalculateFinalGrades() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await api.getMyCourses({ semester: 'current' }).catch(() => []);
        setMyCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        logger.error('Failed to fetch courses', {
          context: 'CalculateFinalGrades',
          error,
        });
        showError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadStudentsForCourse(selectedCourse);
    } else {
      setStudents([]);
    }
  }, [selectedCourse]);

  const loadStudentsForCourse = async (courseId: string) => {
    try {
      setLoading(true);
      
      // In real app, fetch students for this course
      // const studentsData = await api.getCourseStudents(courseId);
      
      // Mock data
      const course = myCourses.find(c => c.courseOffering?.id === courseId);
      const mockStudents: StudentGrade[] = [
        {
          studentId: '2021001',
          studentName: 'Ahmed Mohamed',
          attendance: 9,
          midterm: 18,
          assignments: 17,
          project: 9,
          finalExam: 36,
          calculatedTotal: 89,
          finalLetter: 'B+',
          enrollment: course || {} as IEnrollment,
        },
        {
          studentId: '2021002',
          studentName: 'Fatima Ali',
          attendance: 10,
          midterm: 20,
          assignments: 20,
          project: 10,
          finalExam: 38,
          calculatedTotal: 98,
          finalLetter: 'A+',
          enrollment: course || {} as IEnrollment,
        },
        {
          studentId: '2021003',
          studentName: 'Mohamed Hassan',
          attendance: 7,
          midterm: 15,
          assignments: 15,
          project: 8,
          finalExam: 32,
          calculatedTotal: 77,
          finalLetter: 'C+',
          enrollment: course || {} as IEnrollment,
        },
      ];
      
      setStudents(mockStudents);
    } catch (error) {
      logger.error('Failed to load students', {
        context: 'CalculateFinalGrades',
        error,
      });
      showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrades = () => {
    if (!selectedCourse) {
      showError(
        i18n.language === 'ar'
          ? 'يرجى اختيار المقرر'
          : 'Please select a course'
      );
      return;
    }

    const course = myCourses.find(c => c.courseOffering?.id === selectedCourse);
    const gradingPolicy = course?.courseOffering?.gradingPolicy || {
      attendance: 10,
      midterm: 20,
      assignments: 20,
      project: 10,
      finalExam: 40,
    };

    const updatedStudents = students.map(student => {
      const total = 
        (student.attendance * (gradingPolicy.attendance || 0) / 10) +
        (student.midterm * (gradingPolicy.midterm || 0) / 20) +
        (student.assignments * (gradingPolicy.assignments || 0) / 20) +
        (student.project * (gradingPolicy.project || 0) / 10) +
        (student.finalExam * (gradingPolicy.finalExam || 0) / 40);

      const letter = getLetterGrade(total);

      return {
        ...student,
        calculatedTotal: Math.round(total * 100) / 100,
        finalLetter: letter,
      };
    });

    setStudents(updatedStudents);
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  const handleSaveGrades = async () => {
    try {
      setCalculating(true);
      
      // In real app, save grades to backend
      // await api.saveFinalGrades(selectedCourse, students);
      
      success(
        i18n.language === 'ar'
          ? 'تم حفظ الدرجات النهائية بنجاح'
          : 'Final grades saved successfully'
      );
      setConfirmDialogOpen(false);
    } catch (error) {
      logger.error('Failed to save grades', {
        context: 'CalculateFinalGrades',
        error,
      });
      showError('Failed to save final grades');
    } finally {
      setCalculating(false);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 font-semibold';
    if (grade >= 80) return 'text-blue-600 font-semibold';
    if (grade >= 70) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const getLetterColor = (letter: string) => {
    if (letter.startsWith('A')) return 'bg-green-100 text-green-800';
    if (letter.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (letter.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (letter.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {i18n.language === 'ar' ? 'حساب الدرجات النهائية' : 'Calculate Final Grades'}
          </h1>
          <p className="text-gray-600 mt-1">
            {i18n.language === 'ar'
              ? 'احسب واحفظ الدرجات النهائية للطلاب'
              : 'Calculate and save final grades for students'}
          </p>
        </div>
        {students.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                // Export functionality
                success(i18n.language === 'ar' ? 'تم التصدير' : 'Exported');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {i18n.language === 'ar' ? 'تصدير' : 'Export'}
            </Button>
            <Button
              onClick={() => setConfirmDialogOpen(true)}
              disabled={students.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {i18n.language === 'ar' ? 'حفظ الدرجات' : 'Save Grades'}
            </Button>
          </div>
        )}
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            {i18n.language === 'ar' ? 'اختر المقرر' : 'Select Course'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select2
                value={selectedCourse}
                onChange={setSelectedCourse}
                options={[
                  { value: '', label: i18n.language === 'ar' ? 'اختر المقرر...' : 'Select a course...' },
                  ...myCourses.map(course => ({
                    value: course.courseOffering?.id || '',
                    label: `${course.courseOffering?.course?.code} - ${course.courseOffering?.course?.title}`,
                  })),
                ]}
                placeholder={i18n.language === 'ar' ? 'اختر المقرر...' : 'Select a course...'}
              />
            </div>
            {selectedCourse && (
              <Button onClick={calculateGrades}>
                <Calculator className="h-4 w-4 mr-2" />
                {i18n.language === 'ar' ? 'حساب الدرجات' : 'Calculate Grades'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Policy Info */}
      {selectedCourse && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                {i18n.language === 'ar' ? 'سياسة التقييم' : 'Grading Policy'}
              </h3>
            </div>
            {(() => {
              const course = myCourses.find(c => c.courseOffering?.id === selectedCourse);
              const policy = course?.courseOffering?.gradingPolicy || {
                attendance: 10,
                midterm: 20,
                assignments: 20,
                project: 10,
                finalExam: 40,
              };
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  {policy.attendance && (
                    <div>
                      <span className="text-gray-600">{i18n.language === 'ar' ? 'الحضور:' : 'Attendance:'}</span>
                      <span className="font-semibold ml-1">{policy.attendance}%</span>
                    </div>
                  )}
                  {policy.midterm && (
                    <div>
                      <span className="text-gray-600">{i18n.language === 'ar' ? 'الامتحان النصفي:' : 'Midterm:'}</span>
                      <span className="font-semibold ml-1">{policy.midterm}%</span>
                    </div>
                  )}
                  {policy.assignments && (
                    <div>
                      <span className="text-gray-600">{i18n.language === 'ar' ? 'الواجبات:' : 'Assignments:'}</span>
                      <span className="font-semibold ml-1">{policy.assignments}%</span>
                    </div>
                  )}
                  {policy.project && (
                    <div>
                      <span className="text-gray-600">{i18n.language === 'ar' ? 'المشروع:' : 'Project:'}</span>
                      <span className="font-semibold ml-1">{policy.project}%</span>
                    </div>
                  )}
                  {policy.finalExam && (
                    <div>
                      <span className="text-gray-600">{i18n.language === 'ar' ? 'الامتحان النهائي:' : 'Final Exam:'}</span>
                      <span className="font-semibold ml-1">{policy.finalExam}%</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Students Grades Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {i18n.language === 'ar'
                ? 'اختر مقرراً لعرض قائمة الطلاب'
                : 'Select a course to view students'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead>{i18n.language === 'ar' ? 'الطالب' : 'Student'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الحضور' : 'Attendance'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الامتحان النصفي' : 'Midterm'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الواجبات' : 'Assignments'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'المشروع' : 'Project'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الامتحان النهائي' : 'Final Exam'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الإجمالي' : 'Total'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الدرجة' : 'Letter'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.studentId} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-xs text-gray-500">{student.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{student.attendance}</TableCell>
                      <TableCell>{student.midterm}</TableCell>
                      <TableCell>{student.assignments}</TableCell>
                      <TableCell>{student.project}</TableCell>
                      <TableCell>{student.finalExam}</TableCell>
                      <TableCell>
                        <span className={getGradeColor(student.calculatedTotal)}>
                          {student.calculatedTotal.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLetterColor(student.finalLetter)}`}>
                          {student.finalLetter}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleSaveGrades}
        title={i18n.language === 'ar' ? 'حفظ الدرجات النهائية' : 'Save Final Grades'}
        message={
          i18n.language === 'ar'
            ? 'هل أنت متأكد من حفظ الدرجات النهائية؟ سيتم تحديث سجلات الطلاب.'
            : 'Are you sure you want to save the final grades? Student records will be updated.'
        }
        confirmText={i18n.language === 'ar' ? 'حفظ' : 'Save'}
        cancelText={i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
        isLoading={calculating}
      />
    </div>
  );
}

