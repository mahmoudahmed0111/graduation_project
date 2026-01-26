import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ICourseOffering, IEnrollment, IStudent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  Info,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function EnrollCourse() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { error: showError, success: showSuccess } = useToastStore();
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
        showError('Failed to load courses');
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
      showError(`Prerequisites not met: ${prereqCheck.missing.join(', ')}`);
      return;
    }

    // Check credit limit
    if (!canEnroll(offering)) {
      showError(`Credit limit exceeded. Current: ${currentCredits}/${creditLimit} hours`);
      return;
    }

    // Check if course is full
    // Note: This would need actual enrollment count from backend
    // For now, we'll just check maxSeats

    try {
      setEnrolling(true);
      await api.enrollInCourse({ courseOffering: offering.id });
      showSuccess(`Successfully enrolled in ${offering.course.code}`);
      
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
      showError(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
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
      <div className="flex items-center gap-4">
        <Link to="/dashboard/courses/all">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.enrollInCourse')}</h1>
          <p className="text-gray-600 mt-1">Enroll in courses for the current semester</p>
        </div>
      </div>

      {/* Credit Limit Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Credit Hour Limit</p>
                <p className="text-xs text-blue-700">
                  Current: {currentCredits} / {creditLimit} hours 
                  ({student?.academicStatus ? `Status: ${student.academicStatus.replace('_', ' ')}` : ''})
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-blue-900">
                {creditLimit - currentCredits} hours remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Courses List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Courses List */}
          {filteredOfferings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No available courses found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOfferings.map((offering) => {
                const prereqCheck = checkPrerequisites(offering);
                const canEnrollInThis = canEnroll(offering);
                
                return (
                  <Card 
                    key={offering.id} 
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedOffering?.id === offering.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedOffering(offering)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                              {offering.course.code}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {offering.course.creditHours} Credits
                            </span>
                            {!canEnrollInThis && (
                              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                Credit Limit
                              </span>
                            )}
                            {!prereqCheck.met && (
                              <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                Prerequisites
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-lg">{offering.course.title}</CardTitle>
                          <p className="text-sm text-gray-600">{offering.course.department.name}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {offering.doctors.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="h-4 w-4" />
                          <span>{offering.doctors.map(d => d.name).join(', ')}</span>
                        </div>
                      )}
                      {offering.schedule.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{offering.schedule[0]?.day} {offering.schedule[0]?.startTime}</span>
                          <MapPin className="h-4 w-4 ml-2" />
                          <span>{offering.schedule[0]?.location}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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
                <p className="text-gray-700 font-medium">{selectedOffering.course.title}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Credit Hours</span>
                    <span className="font-medium">{selectedOffering.course.creditHours}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Department</span>
                    <span className="font-medium">{selectedOffering.course.department.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Semester</span>
                    <span className="font-medium">{selectedOffering.semester}</span>
                  </div>
                </div>

                {/* Instructors */}
                {selectedOffering.doctors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Instructors</p>
                    <div className="space-y-1">
                      {selectedOffering.doctors.map((doctor, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
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
                    <p className="text-sm font-medium text-gray-700 mb-2">Schedule</p>
                    <div className="space-y-2">
                      {selectedOffering.schedule.map((session, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
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
                    <p className="text-sm font-medium text-gray-700 mb-2">Prerequisites</p>
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
                            <span className={isMet ? 'text-gray-700' : 'text-gray-500'}>
                              {prereq.code} - {prereq.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Enrollment Validation */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {(() => {
                    const prereqCheck = checkPrerequisites(selectedOffering);
                    const canEnrollInThis = canEnroll(selectedOffering);
                    
                    if (!prereqCheck.met) {
                      return (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-medium mb-1">Prerequisites Not Met</p>
                          <ul className="text-xs text-red-700 list-disc list-inside">
                            {prereqCheck.missing.map((missing, idx) => (
                              <li key={idx}>{missing}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    
                    if (!canEnrollInThis) {
                      return (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            Credit limit would be exceeded ({currentCredits + selectedOffering.course.creditHours} / {creditLimit})
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Eligible to enroll
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
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a course to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

