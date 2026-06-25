import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ICourseOffering, IEnrollment, IStudent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { AdminDataTableShell } from '@/components/admin/AdminDataTableShell';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import {
  BookOpen,
  Clock,
  MapPin,
  Calendar,
  Search,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function EnrollCourse() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess, info: showInfo } = useToastStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offeringId = searchParams.get('offering');
  
  const [offerings, setOfferings] = useState<ICourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<ICourseOffering | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const student = user as IStudent;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [offeringsData, enrollmentsData] = await Promise.all([
          api.getCourseOfferings({ semester: 'current' }),
          api.getMyCourses({ semester: 'current' })
        ]);
        
        setOfferings(offeringsData);
        setMyEnrollments(enrollmentsData);

        // If offering ID is in URL, find and select it
        if (offeringId) {
          const offering = offeringsData.find(o => o.id === offeringId);
          if (offering) {
            setSelectedOffering(offering);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch course data', {
          context: 'EnrollCourse',
          error,
        });
        showError(t('student.enrollCourse.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [offeringId]);

  // Get unique departments for filter
  const departments = Array.from(
    new Set(offerings.map(o => o.course.department.name))
  );

  // Filter offerings (exclude already enrolled)
  const enrolledOfferingIds = new Set(myEnrollments.map(e => e.courseOffering?.id));
  const filteredOfferings = offerings.filter(offering => {
    // Exclude already enrolled courses
    if (enrolledOfferingIds.has(offering.id)) return false;
    
    const matchesSearch = 
      offering.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offering.course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || 
      offering.course.department.name === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Calculate current credit hours
  const currentCredits = myEnrollments.reduce((sum, e) => 
    sum + (e.courseOffering?.course?.creditHours || 0), 0
  );

  // Get credit limit based on academic status
  const getCreditLimit = () => {
    const status = student?.academicStatus || 'good_standing';
    const limits: Record<string, number> = {
      'good_standing': 18,
      'probation': 12,
      'honors': 21
    };
    return limits[status] || 18;
  };

  const creditLimit = getCreditLimit();

  // Show remaining credit hours as a small, auto-dismissing toast once data loads
  // (replaces the large inline banner that took too much space).
  const remainingToastShown = useRef(false);
  useEffect(() => {
    if (loading || remainingToastShown.current) return;
    remainingToastShown.current = true;
    showInfo(
      t('student.enrollCourse.remainingToast', {
        remaining: creditLimit - currentCredits,
        limit: creditLimit,
      })
    );
  }, [loading, currentCredits, creditLimit, showInfo, t]);

  const canEnroll = (offering: ICourseOffering) => {
    const newCredits = currentCredits + offering.course.creditHours;
    return newCredits <= creditLimit;
  };

  // Check prerequisites
  const checkPrerequisites = (offering: ICourseOffering): { met: boolean; missing: string[] } => {
    if (!offering.course.prerequisites || offering.course.prerequisites.length === 0) {
      return { met: true, missing: [] };
    }

    const passedCourseIds = new Set(
      myEnrollments
        .filter(e => e.status === 'passed')
        .map(e => e.courseOffering?.course?.id)
        .filter(Boolean)
    );

    const missing = offering.course.prerequisites
      .filter(prereq => !passedCourseIds.has(prereq.id))
      .map(prereq => `${prereq.code} - ${prereq.title}`);

    return {
      met: missing.length === 0,
      missing
    };
  };

  const handleEnroll = async (offering: ICourseOffering) => {
    // Check prerequisites
    const prereqCheck = checkPrerequisites(offering);
    if (!prereqCheck.met) {
      showError(t('student.enrollCourse.prereqNotMet', { list: prereqCheck.missing.join(', ') }));
      return;
    }

    // Check credit limit
    if (!canEnroll(offering)) {
      showError(t('student.enrollCourse.creditLimitExceeded', { current: currentCredits, limit: creditLimit }));
      return;
    }

    // Check if course is full
    // Note: This would need actual enrollment count from backend
    // For now, we'll just check maxSeats

    try {
      setEnrolling(true);
      await api.enrollInCourse({ courseOffering: offering.id });
      showSuccess(t('student.enrollCourse.enrollSuccess', { code: offering.course.code }));
      
      // Refresh enrollments
      const updatedEnrollments = await api.getMyCourses({ semester: 'current' });
      setMyEnrollments(updatedEnrollments);
      
      // Remove from available offerings
      setOfferings(offerings.filter(o => o.id !== offering.id));
      setSelectedOffering(null);
      
      // Navigate to my courses
      setTimeout(() => {
        navigate('/dashboard/courses/my-courses');
      }, 1500);
    } catch (error: any) {
      logger.error('Failed to enroll in course', {
        context: 'EnrollCourse',
        error,
      });
      showError(error.response?.data?.message || t('student.enrollCourse.enrollFailed'));
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Spinner size="lg" label={t('common.loading')} />
      </div>
    );
  }

  return (
    <AdminPageShell
      titleStack={{ section: t('nav.courses'), page: t('nav.enrollInCourse') }}
      subtitle={t('student.enrollCourse.subtitle')}
      actions={
        <Link to="/dashboard/courses/all">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('student.enrollCourse.back')}
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Courses List */}
        <div className="lg:col-span-2">
          <Card bare>
            <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={t('student.enrollCourse.searchCoursesPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-56">
              <Select2
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={[
                  { value: '', label: t('student.enrollCourse.allDepartments') },
                  ...departments.map((dept) => ({ value: dept, label: dept })),
                ]}
                placeholder={t('student.enrollCourse.allDepartments')}
              />
            </div>
          </div>

          {/* Courses List */}
          {filteredOfferings.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title={t('student.enrollCourse.noCoursesFound')}
            />
          ) : (
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('student.enrollCourse.colCode')}</TableHead>
                    <TableHead>{t('student.enrollCourse.colCourse')}</TableHead>
                    <TableHead className="text-center">{t('student.enrollCourse.colCredits')}</TableHead>
                    <TableHead>{t('student.enrollCourse.colInstructor')}</TableHead>
                    <TableHead>{t('student.enrollCourse.colStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfferings.map((offering) => {
                    const prereqCheck = checkPrerequisites(offering);
                    const canEnrollInThis = canEnroll(offering);

                    return (
                      <TableRow
                        key={offering.id}
                        onClick={() => setSelectedOffering(offering)}
                        className={selectedOffering?.id === offering.id ? 'bg-primary-50/60 dark:bg-primary-900/20' : undefined}
                      >
                        <TableCell>
                          <span className="rounded-lg bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                            {offering.course.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900 dark:text-white">{offering.course.title}</div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">{offering.course.department.name}</div>
                        </TableCell>
                        <TableCell className="text-center text-gray-700 dark:text-slate-300">
                          {offering.course.creditHours}
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-slate-300">
                          {offering.doctors.length > 0
                            ? offering.doctors.map((d) => d.name).join(', ')
                            : t('student.enrollCourse.none')}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {!canEnrollInThis && (
                              <span className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-300">
                                {t('student.enrollCourse.creditLimitBadge')}
                              </span>
                            )}
                            {!prereqCheck.met && (
                              <span className="rounded bg-orange-50 px-2 py-1 text-xs text-orange-600 dark:bg-orange-900/20 dark:text-orange-300">
                                {t('student.enrollCourse.prerequisitesBadge')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          )}
            </CardContent>
          </Card>
        </div>

        {/* Course Details Sidebar */}
        <div className="lg:col-span-1">
          {selectedOffering ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{selectedOffering.course.code}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOffering(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-gray-700 font-medium dark:text-slate-300">{selectedOffering.course.title}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">{t('student.enrollCourse.creditHours')}</span>
                    <span className="font-medium">{selectedOffering.course.creditHours}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">{t('student.enrollCourse.department')}</span>
                    <span className="font-medium">{selectedOffering.course.department.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">{t('student.enrollCourse.semester')}</span>
                    <span className="font-medium">{selectedOffering.semester}</span>
                  </div>
                </div>

                {/* Instructors */}
                {selectedOffering.doctors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">{t('student.enrollCourse.instructors')}</p>
                    <div className="space-y-1">
                      {selectedOffering.doctors.map((doctor, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                          <User className="h-4 w-4" />
                          <span>{doctor.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule */}
                {selectedOffering.schedule.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">{t('student.enrollCourse.schedule')}</p>
                    <div className="space-y-2">
                      {selectedOffering.schedule.map((session, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4 mt-0.5" />
                          <div className="flex-1">
                            <p className="capitalize font-medium">{session.day}</p>
                            <p className="text-xs">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {session.startTime}{session.endTime ? ` - ${session.endTime}` : ''}
                            </p>
                            <p className="text-xs">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {session.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prerequisites */}
                {selectedOffering.course.prerequisites && selectedOffering.course.prerequisites.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">{t('student.enrollCourse.prerequisites')}</p>
                    <div className="space-y-1">
                      {selectedOffering.course.prerequisites.map((prereq, idx) => {
                        const isMet = myEnrollments.some(
                          e => e.courseOffering?.course?.id === prereq.id && e.status === 'passed'
                        );
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {isMet ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={isMet ? 'text-gray-700 dark:text-slate-300' : 'text-gray-500 dark:text-slate-500'}>
                              {prereq.code} - {prereq.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Enrollment Validation */}
                <div className="pt-4 border-t border-gray-200 space-y-2 dark:border-dark-border">
                  {(() => {
                    const prereqCheck = checkPrerequisites(selectedOffering);
                    const canEnrollInThis = canEnroll(selectedOffering);

                    if (!prereqCheck.met) {
                      return (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800/40">
                          <p className="text-sm text-red-800 font-medium mb-1 dark:text-red-300">{t('student.enrollCourse.prereqsNotMetTitle')}</p>
                          <ul className="text-xs text-red-700 list-disc list-inside dark:text-red-400">
                            {prereqCheck.missing.map((missing, idx) => (
                              <li key={idx}>{missing}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }

                    if (!canEnrollInThis) {
                      return (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800/40">
                          <p className="text-sm text-orange-800 dark:text-orange-300">
                            {t('student.enrollCourse.creditLimitWouldExceed', { total: currentCredits + selectedOffering.course.creditHours, limit: creditLimit })}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800/40">
                        <p className="text-sm text-green-800 font-medium dark:text-green-300">
                          {t('student.enrollCourse.eligibleToEnroll')}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                {/* Enroll Button */}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleEnroll(selectedOffering)}
                  disabled={enrolling || !canEnroll(selectedOffering) || !checkPrerequisites(selectedOffering).met}
                  isLoading={enrolling}
                >
                  {enrolling ? t('student.enrollCourse.enrolling') : t('student.enrollCourse.enrollInCourse')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-slate-400">{t('student.enrollCourse.selectCourseHint')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminPageShell>
  );
}

