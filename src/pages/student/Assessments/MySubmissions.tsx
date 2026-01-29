import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ISubmission, IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

export function MySubmissions() {
  const { t } = useTranslation();
  useAuthStore();
  const { error: showError } = useToastStore();
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, graded, pending

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, submissionsData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getMySubmissions().catch(() => [])
        ]);
        
        const coursesArray = Array.isArray(coursesData) ? coursesData : [];
        const submissionsArray = Array.isArray(submissionsData) ? submissionsData : [];
        
        setMyCourses(coursesArray);
        setSubmissions(submissionsArray);
      } catch (error) {
        logger.error('Failed to fetch submissions', {
          context: 'MySubmissions',
          error,
        });
        showError('Failed to load submissions');
        setSubmissions([]);
        setMyCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesCourse = selectedCourse === 'all' || 
      submission.assessment.courseOffering.id === selectedCourse;
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'graded' && submission.status === 'graded') ||
      (filterStatus === 'pending' && (submission.status === 'submitted' || submission.status === 'in_progress'));
    
    return matchesCourse && matchesStatus;
  });

  // Sort by submission date (most recent first)
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return dateB - dateA;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3" />
            Graded
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3" />
            Submitted
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3" />
            In Progress
          </span>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  const averageScore = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => sum + s.totalScore, 0) / gradedSubmissions.length
    : 0;
  const totalPoints = gradedSubmissions.reduce((sum, s) => sum + s.assessment.totalPoints, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.mySubmissions')}</h1>
        <p className="text-gray-600 mt-1">View your assignment submissions and grades</p>
      </div>

      {/* Statistics */}
      {gradedSubmissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Graded Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">{gradedSubmissions.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageScore.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
                </div>
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
              <option value="all">All Status</option>
              <option value="graded">Graded</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      {sortedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedSubmissions.map((submission) => {
            const percentage = submission.assessment.totalPoints > 0
              ? (submission.totalScore / submission.assessment.totalPoints) * 100
              : 0;
            
            return (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {submission.assessment.courseOffering.course.code}
                        </span>
                        {getStatusBadge(submission.status)}
                      </div>
                      <CardTitle className="text-lg mb-1">{submission.assessment.title}</CardTitle>
                      <p className="text-sm text-gray-600">{submission.assessment.courseOffering.course.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Score Display */}
                  {submission.status === 'graded' && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Your Score</p>
                          <p className={`text-3xl font-bold ${getScoreColor(submission.totalScore, submission.assessment.totalPoints)}`}>
                            {submission.totalScore.toFixed(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">out of {submission.assessment.totalPoints}</p>
                          <p className={`text-lg font-semibold ${getScoreColor(submission.totalScore, submission.assessment.totalPoints)}`}>
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      {submission.gradedBy && (
                        <p className="text-xs text-gray-500 mt-2">
                          Graded by {submission.gradedBy.name}
                          {submission.gradedAt && ` on ${new Date(submission.gradedAt).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    {submission.submittedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{submission.answers.length} answer(s) submitted</span>
                    </div>
                    {submission.status === 'in_progress' && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>Draft - Not yet submitted</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-gray-200">
                    <Link to={`/dashboard/submissions/${submission.id}`} className="block">
                      <Button variant="outline" className="w-full" size="sm">
                        {submission.status === 'graded' ? 'View Results' : 'Continue Submission'}
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
      {sortedSubmissions.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {sortedSubmissions.length} of {submissions.length} submissions
        </div>
      )}
    </div>
  );
}

