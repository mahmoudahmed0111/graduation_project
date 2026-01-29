import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { ISubmission, IAssessment, IEnrollment } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { 
  ClipboardList, 
  FileText,
  User,
  BookOpen,
  Search,
  Eye,
  Save
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { logger } from '@/lib/logger';
import { formatDate } from '@/utils/formatters';

export function GradeSubmissions() {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const [submissions, setSubmissions] = useState<ISubmission[]>([]);
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [_myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ISubmission | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [totalScore, setTotalScore] = useState(0);
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, assessmentsData] = await Promise.all([
          api.getMyCourses({ semester: 'current' }).catch(() => []),
          api.getMyAssessments().catch(() => [])
        ]);
        
        setMyCourses(Array.isArray(coursesData) ? coursesData : []);
        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
        
        // Fetch submissions for all assessments
        const submissionPromises = assessmentsData.map(assessment => 
          api.getMySubmissions({ assessment: assessment.id }).catch(() => [])
        );
        const allSubmissions = (await Promise.all(submissionPromises)).flat();
        setSubmissions(allSubmissions);
      } catch (error) {
        logger.error('Failed to fetch submissions', {
          context: 'GradeSubmissions',
          error,
        });
        showError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fetch once on mount

  // Filter submissions
  const filteredSubmissions = submissions.filter(submission => {
    const matchesAssessment = selectedAssessment === 'all' || 
      submission.assessment.id === selectedAssessment;
    const matchesStatus = selectedStatus === 'all' || 
      submission.status === selectedStatus;
    const matchesSearch = 
      submission.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAssessment && matchesStatus && matchesSearch;
  });

  const openGradingModal = (submission: ISubmission) => {
    setSelectedSubmission(submission);
    setTotalScore(submission.totalScore || 0);
    
    // Initialize scores from existing answers
    const initialScores: Record<string, number> = {};
    submission.answers.forEach((_answer, index) => {
      initialScores[`answer-${index}`] = 0;
    });
    setScores(initialScores);
    
    setGradingModalOpen(true);
  };

  const handleScoreChange = (answerIndex: number, score: number) => {
    const key = `answer-${answerIndex}`;
    setScores(prev => ({ ...prev, [key]: score }));
    
    // Calculate total
    const newScores = { ...scores, [key]: score };
    const total = Object.values(newScores).reduce((sum, s) => sum + s, 0);
    setTotalScore(total);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    try {
      setGradingLoading(true);
      
      // In real app, call API to grade submission
      // await api.gradeSubmission(selectedSubmission.id, {
      //   totalScore,
      //   questionScores: scores,
      // });
      
      // Update local state
      setSubmissions(submissions.map(s => 
        s.id === selectedSubmission.id 
          ? { ...s, status: 'graded', totalScore, gradedBy: { id: user?.id || '', name: user?.name || '' } }
          : s
      ));
      
      success(
        i18n.language === 'ar'
          ? 'تم تقييم التقديم بنجاح'
          : 'Submission graded successfully'
      );
      setGradingModalOpen(false);
      setSelectedSubmission(null);
    } catch (error) {
      logger.error('Failed to grade submission', {
        context: 'GradeSubmissions',
        error,
      });
      showError('Failed to grade submission');
    } finally {
      setGradingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_progress: { label: i18n.language === 'ar' ? 'قيد التنفيذ' : 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      submitted: { label: i18n.language === 'ar' ? 'تم التقديم' : 'Submitted', color: 'bg-blue-100 text-blue-800' },
      graded: { label: i18n.language === 'ar' ? 'تم التقييم' : 'Graded', color: 'bg-green-100 text-green-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">
          {i18n.language === 'ar' ? 'تقييم التقديمات' : 'Grade Submissions'}
        </h1>
        <p className="text-gray-600 mt-1">
          {i18n.language === 'ar'
            ? 'عرض وتقييم تقديمات الطلاب'
            : 'View and grade student submissions'}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={i18n.language === 'ar' ? 'ابحث برقم الطالب...' : 'Search by student ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{i18n.language === 'ar' ? 'كل التقييمات' : 'All Assessments'}</option>
              {assessments.map(assessment => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} - {assessment.courseOffering.course.code}
                </option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{i18n.language === 'ar' ? 'كل الحالات' : 'All Status'}</option>
              <option value="submitted">{i18n.language === 'ar' ? 'تم التقديم' : 'Submitted'}</option>
              <option value="graded">{i18n.language === 'ar' ? 'تم التقييم' : 'Graded'}</option>
              <option value="in_progress">{i18n.language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {i18n.language === 'ar' ? 'لا توجد تقديمات' : 'No submissions found'}
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
                    <TableHead>{i18n.language === 'ar' ? 'التقييم' : 'Assessment'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'المقرر' : 'Course'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'تاريخ التقديم' : 'Submitted'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الدرجة' : 'Score'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{i18n.language === 'ar' ? 'إجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{submission.student_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>{submission.assessment.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{submission.assessment.courseOffering.course.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.submittedAt ? (
                          <span className="text-sm text-gray-600">
                            {formatDate(submission.submittedAt)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          submission.totalScore >= (submission.assessment.totalPoints * 0.8)
                            ? 'text-green-600'
                            : submission.totalScore >= (submission.assessment.totalPoints * 0.6)
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {submission.totalScore} / {submission.assessment.totalPoints}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openGradingModal(submission)}
                          disabled={submission.status === 'in_progress'}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {submission.status === 'graded' 
                            ? (i18n.language === 'ar' ? 'عرض' : 'View')
                            : (i18n.language === 'ar' ? 'تقييم' : 'Grade')
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={gradingModalOpen}
          onClose={() => {
            setGradingModalOpen(false);
            setSelectedSubmission(null);
          }}
          title={i18n.language === 'ar' ? 'تقييم التقديم' : 'Grade Submission'}
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>{i18n.language === 'ar' ? 'التقييم:' : 'Assessment:'}</strong> {selectedSubmission.assessment.title}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>{i18n.language === 'ar' ? 'الطالب:' : 'Student:'}</strong> {selectedSubmission.student_id}
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedSubmission.answers.map((answer, index) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium">
                        {i18n.language === 'ar' ? 'إجابة' : 'Answer'} {index + 1}
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={selectedSubmission.assessment.totalPoints}
                          value={scores[`answer-${index}`] || 0}
                          onChange={(e) => handleScoreChange(index, Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">points</span>
                      </div>
                    </div>
                    {answer.answerText && (
                      <p className="text-sm text-gray-700 mb-2">{answer.answerText}</p>
                    )}
                    {answer.selectedOptionId && (
                      <p className="text-sm text-gray-700 mb-2">
                        {i18n.language === 'ar' ? 'الخيار المحدد:' : 'Selected Option:'} {answer.selectedOptionId}
                      </p>
                    )}
                    {answer.fileUrl && (
                      <a
                        href={answer.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {i18n.language === 'ar' ? 'عرض الملف' : 'View File'}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">
                  {i18n.language === 'ar' ? 'إجمالي الدرجة:' : 'Total Score:'}
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {totalScore} / {selectedSubmission.assessment.totalPoints}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setGradingModalOpen(false);
                    setSelectedSubmission(null);
                  }}
                  className="flex-1"
                >
                  {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleGradeSubmission}
                  isLoading={gradingLoading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {i18n.language === 'ar' ? 'حفظ التقييم' : 'Save Grade'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

