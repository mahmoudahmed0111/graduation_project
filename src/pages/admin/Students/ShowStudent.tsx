import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Clock,
  Phone,
} from 'lucide-react';
import { IStudent, IEnrollment } from '@/types';
import { api, getApiErrorMessage } from '@/lib/api';
import { logger } from '@/lib/logger';
import { getStatusBadge } from '@/utils/status';
import { getGPAColor } from '@/constants/ui';
import { mapUserRecordToStudent } from '@/lib/mapUserRecord';
import { useToastStore } from '@/store/toastStore';

export function ShowStudent() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { error: showError } = useToastStore();
  const [student, setStudent] = useState<IStudent | null>(null);
  const [enrollments, setEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setNotFound(false);
        const raw = await api.getUser(id);
        if (String(raw.role ?? '') !== 'student') {
          showError(t('admin.studentsShow.notStudent'));
          setNotFound(true);
          setStudent(null);
          return;
        }
        setStudent(mapUserRecordToStudent(raw));

        const enrollmentsData = await api.getEnrollments({ student_id: id }).catch(() => [] as IEnrollment[]);
        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
      } catch (err) {
        logger.error('Failed to fetch student data', {
          context: 'ShowStudent',
          error: err,
        });
        showError(getApiErrorMessage(err, t('admin.studentsShow.loadFail')));
        setNotFound(true);
        setStudent(null);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchStudentData();
  }, [id, showError, t]);

  const renderStatusBadge = (status?: string) => {
    const badge = getStatusBadge(status);
    return (
      <span className={`rounded-full px-3 py-1 text-sm font-medium ${badge.className}`}>{badge.label}</span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
          <p className="mt-4 text-gray-600">{t('admin.studentsShow.loading')}</p>
        </div>
      </div>
    );
  }

  if (!student || notFound) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">{t('admin.studentsShow.notFound')}</p>
        <Link to="/dashboard/students">
          <Button variant="primary">{t('admin.studentsShow.backToStudents')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/students">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          </div>
        </div>
        <Link to={`/dashboard/students/${student.id}/edit`}>
          <Button variant="primary" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t('admin.studentsShow.editStudent')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                {t('admin.studentsShow.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {t('admin.studentsShow.email')}
                  </div>
                  <p className="font-medium text-gray-900">{student.email}</p>
                </div>
                <div className="space-y-1">
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    {t('admin.studentsShow.nationalId')}
                  </div>
                  <p className="font-medium text-gray-900">{student.nationalId ?? '—'}</p>
                </div>
                {student.phoneNumber ? (
                  <div className="space-y-1">
                    <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {t('admin.studentsShow.phone')}
                    </div>
                    <p className="font-medium text-gray-900">{student.phoneNumber}</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                {t('admin.studentsShow.academicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    {t('admin.studentsShow.department')}
                  </div>
                  <p className="font-medium text-gray-900">{student.department?.name || t('admin.studentsShow.notAvailable')}</p>
                  <p className="text-sm text-gray-500">{student.department?.college?.name || ''}</p>
                </div>
                <div className="space-y-1">
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {t('admin.studentsShow.levelSemester')}
                  </div>
                  <p className="font-medium text-gray-900">
                    {t('admin.studentsShow.levelSemesterValue', { level: student.year, semester: student.semester })}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    {t('admin.studentsShow.creditsEarned')}
                  </div>
                  <p className="font-medium text-gray-900">{t('admin.studentsShow.creditsValue', { count: student.creditsEarned ?? 0 })}</p>
                </div>
                <div className="space-y-1">
                  <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                    <Award className="h-4 w-4" />
                    {t('admin.studentsShow.gpa')}
                  </div>
                  <p className={`text-xl font-bold ${getGPAColor(student.gpa ?? 0)}`}>
                    {(student.gpa ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="mb-1 text-sm text-gray-600">{t('admin.studentsShow.status')}</div>
                  {renderStatusBadge(student.academicStatus)}
                </div>
              </div>
            </CardContent>
          </Card>

          {enrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  {t('admin.studentsShow.courseEnrollments')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrollments.map((enrollment) => {
                    const course = enrollment.courseOffering?.course;
                    return (
                      <div
                        key={enrollment.id}
                        className="rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{course?.code || t('admin.studentsShow.notAvailable')}</h4>
                              {course && 'creditHours' in course && typeof course.creditHours === 'number' ? (
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-700">
                                  {t('admin.studentsShow.hoursShort', { count: course.creditHours })}
                                </span>
                              ) : null}
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  enrollment.status === 'enrolled'
                                    ? 'bg-green-100 text-green-700'
                                    : enrollment.status === 'passed'
                                      ? 'bg-blue-100 text-blue-700'
                                      : enrollment.status === 'failed'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {enrollment.status}
                              </span>
                            </div>
                            <p className="mb-2 text-sm text-gray-700">{course?.title || t('admin.studentsShow.course')}</p>
                            {enrollment.grades?.finalLetter ? (
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="text-gray-600">
                                  {t('admin.studentsShow.grade')}:{' '}
                                  <span className="font-medium text-primary-600">{enrollment.grades.finalLetter}</span>
                                </span>
                                {enrollment.grades.finalTotal !== undefined ? (
                                  <span className="text-gray-600">
                                    {t('admin.studentsShow.score')}:{' '}
                                    <span className="font-medium">{enrollment.grades.finalTotal.toFixed(1)}%</span>
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('admin.studentsShow.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('admin.studentsShow.coursesEnrollments')}</span>
                <span className="font-semibold text-gray-900">{enrollments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('admin.studentsShow.creditsEarned')}</span>
                <span className="font-semibold text-gray-900">{student.creditsEarned ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('admin.studentsShow.gpa')}</span>
                <span className={`font-semibold ${getGPAColor(student.gpa ?? 0)}`}>
                  {(student.gpa ?? 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('admin.studentsShow.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/dashboard/students/${student.id}/edit`}>
                <Button variant="secondary" className="w-full justify-start">
                  <Edit className="mr-2 h-4 w-4" />
                  {t('admin.studentsShow.editStudentShort')}
                </Button>
              </Link>
              <Button variant="secondary" className="w-full justify-start" type="button" disabled>
                <FileText className="mr-2 h-4 w-4" />
                {t('admin.studentsShow.viewTranscript')}
              </Button>
              <Button variant="secondary" className="w-full justify-start" type="button" disabled>
                <Clock className="mr-2 h-4 w-4" />
                {t('admin.studentsShow.viewAttendance')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
