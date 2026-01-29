import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  GraduationCap, 
  Award, 
  BookOpen,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

interface SemesterData {
  semester: string;
  enrollments: IEnrollment[];
  gpa: number;
  credits: number;
  points: number;
}

export function Enrollments() {
  const { t } = useTranslation();
  useAuthStore();
  const { error: showError } = useToastStore();
  const [transcript, setTranscript] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupedBySemester, setGroupedBySemester] = useState<SemesterData[]>([]);
  const [cgpa, setCgpa] = useState(0);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        const data = await api.getMyTranscript();
        const transcriptArray = Array.isArray(data) ? data : [];
        setTranscript(transcriptArray);
        
        // Group by semester and calculate GPA
        const grouped = groupBySemester(transcriptArray);
        setGroupedBySemester(grouped);
        
        // Calculate CGPA
        const calculatedCGPA = calculateCGPA(grouped);
        setCgpa(calculatedCGPA);
      } catch (error) {
        logger.error('Failed to fetch transcript', {
          context: 'Enrollments',
          error,
        });
        showError('Failed to load transcript');
        setTranscript([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- groupBySemester, showError stable

  // Group enrollments by semester
  const groupBySemester = (enrollments: IEnrollment[]): SemesterData[] => {
    const semesterMap = new Map<string, IEnrollment[]>();
    
    enrollments.forEach(enrollment => {
      const sem = enrollment.semester || 'Unknown';
      if (!semesterMap.has(sem)) {
        semesterMap.set(sem, []);
      }
      semesterMap.get(sem)!.push(enrollment);
    });

    const semesterData: SemesterData[] = [];
    
    semesterMap.forEach((enrollments, semester) => {
      let totalPoints = 0;
      let totalCredits = 0;
      
      enrollments.forEach(enrollment => {
        const credits = enrollment.courseOffering?.course?.creditHours || 0;
        const gradeLetter = enrollment.grades?.finalLetter;
        
        if (gradeLetter && enrollment.status === 'passed') {
          const gradePoints = getGradePoints(gradeLetter);
          totalPoints += gradePoints * credits;
          totalCredits += credits;
        }
      });
      
      const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      
      semesterData.push({
        semester,
        enrollments,
        gpa,
        credits: totalCredits,
        points: totalPoints,
      });
    });

    // Sort by semester (most recent first)
    return semesterData.sort((a, b) => {
      // Extract year and season for proper sorting
      const aYear = extractYear(a.semester);
      const bYear = extractYear(b.semester);
      if (aYear !== bYear) return bYear - aYear;
      
      // Fall comes before Spring in same year
      const aSeason = a.semester.includes('Fall') ? 1 : 0;
      const bSeason = b.semester.includes('Fall') ? 1 : 0;
      return bSeason - aSeason;
    });
  };

  const extractYear = (semester: string): number => {
    const match = semester.match(/\d{4}/);
    return match ? parseInt(match[0]) : 0;
  };

  const getGradePoints = (grade: string): number => {
    const gradePoints: Record<string, number> = {
      'A+': 4.0,
      'A': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0,
    };
    return gradePoints[grade] || 0;
  };

  const calculateCGPA = (semesterData: SemesterData[]): number => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    semesterData.forEach(sem => {
      totalPoints += sem.points;
      totalCredits += sem.credits;
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-gray-600';
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Passed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Failed
          </span>
        );
      case 'enrolled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            In Progress
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Withdrawn
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalCredits = groupedBySemester.reduce((sum, sem) => sum + sem.credits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.enrollments')}</h1>
        <p className="text-gray-600 mt-1">View your complete academic transcript</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cumulative GPA</p>
                <p className="text-3xl font-bold text-gray-900">{cgpa.toFixed(2)}</p>
              </div>
              <Award className="h-10 w-10 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Credits</p>
                <p className="text-3xl font-bold text-gray-900">{totalCredits}</p>
              </div>
              <GraduationCap className="h-10 w-10 text-primary-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Semesters Completed</p>
                <p className="text-3xl font-bold text-gray-900">{groupedBySemester.length}</p>
              </div>
              <Calendar className="h-10 w-10 text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transcript by Semester */}
      {transcript.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transcript data available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedBySemester.map((semesterData) => (
            <Card key={semesterData.semester}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{semesterData.semester}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {semesterData.enrollments.length} course(s) • {semesterData.credits} credit hours
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Semester GPA</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {semesterData.gpa.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course Code</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course Title</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Credits</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Grade</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Points</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesterData.enrollments.map((enrollment) => {
                        const course = enrollment.courseOffering?.course;
                        const gradeLetter = enrollment.grades?.finalLetter;
                        const gradePoints = gradeLetter ? getGradePoints(gradeLetter) : 0;
                        const credits = course?.creditHours || 0;
                        const points = gradePoints * credits;
                        
                        return (
                          <tr key={enrollment.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">{course?.code}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700">{course?.title}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-gray-700">{credits}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {gradeLetter ? (
                                <span className={`font-bold ${getGradeColor(gradeLetter)}`}>
                                  {gradeLetter}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-gray-700">
                                {gradeLetter ? points.toFixed(1) : '—'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {getStatusBadge(enrollment.status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td colSpan={2} className="py-3 px-4 text-right">
                          Semester Total:
                        </td>
                        <td className="py-3 px-4 text-center">
                          {semesterData.credits}
                        </td>
                        <td className="py-3 px-4 text-center">
                          GPA: {semesterData.gpa.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {semesterData.points.toFixed(1)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CGPA Summary */}
      {groupedBySemester.length > 0 && (
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-900">Cumulative Grade Point Average (CGPA)</p>
                  <p className="text-xs text-primary-700 mt-1">
                    Based on {totalCredits} credit hours across {groupedBySemester.length} semester(s)
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary-600">{cgpa.toFixed(2)}</p>
                <p className="text-sm text-primary-700 mt-1">out of 4.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

