import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IAssessment, IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ClipboardList, 
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function MyAssessments() {
  const { t } = useTranslation();
  useAuthStore();
  const { error: showError } = useToastStore();
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, upcoming, past

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, assessmentsData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getMyAssessments().catch(() => [])
        ]);
        
        const coursesArray = Array.isArray(coursesData) ? coursesData : [];
        const assessmentsArray = Array.isArray(assessmentsData) ? assessmentsData : [];
        
        setMyCourses(coursesArray);
        setAssessments(assessmentsArray);
      } catch (error) {
        logger.error('Failed to fetch assessments', {
          context: 'MyAssessments',
          error,
        });
        showError('Failed to load assessments');
        setAssessments([]);
        setMyCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    const matchesCourse = selectedCourse === 'all' || 
      assessment.courseOffering.id === selectedCourse;
    
    const now = new Date();
    const dueDate = new Date(assessment.dueDate);
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'upcoming' && dueDate > now) ||
      (filterStatus === 'past' && dueDate <= now);
    
    return matchesCourse && matchesStatus;
  });

  // Sort by due date (upcoming first)
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    const dateA = new Date(a.dueDate).getTime();
    const dateB = new Date(b.dueDate).getTime();
    return dateA - dateB;
  });

  const getStatusBadge = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (due < now) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
          Past Due
        </span>
      );
    } else if (daysUntilDue <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="h-3 w-3" />
          Due Soon
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <CheckCircle2 className="h-3 w-3" />
          Upcoming
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
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.myAssessments')}</h1>
        <p className="text-gray-600 mt-1">View and complete your assignments and quizzes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Assessments</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Due</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments List */}
      {sortedAssessments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assessments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedAssessments.map((assessment) => {
            const dueDate = new Date(assessment.dueDate);
            const isPastDue = dueDate < new Date();
            const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {assessment.courseOffering.course.code}
                        </span>
                        {getStatusBadge(assessment.dueDate)}
                      </div>
                      <CardTitle className="text-lg mb-1">{assessment.title}</CardTitle>
                      <p className="text-sm text-gray-600">{assessment.courseOffering.course.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{assessment.questions.length} question(s) • {assessment.totalPoints} points</span>
                    </div>
                    {daysUntilDue > 0 && daysUntilDue <= 7 && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span>{daysUntilDue} day(s) remaining</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-gray-200">
                    <Link to={`/dashboard/assessments/${assessment.id}`} className="block">
                      <Button 
                        variant={isPastDue ? "outline" : "primary"} 
                        className="w-full" 
                        size="sm"
                      >
                        {isPastDue ? 'View Details' : 'Start Assessment'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {sortedAssessments.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {sortedAssessments.length} of {assessments.length} assessments
        </div>
      )}
    </div>
  );
}

