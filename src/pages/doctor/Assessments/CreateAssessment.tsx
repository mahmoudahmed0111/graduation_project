import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { IEnrollment } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Trash2,
  Save,
  FileText
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { DatePicker } from '@/components/ui/DatePicker';
import { logger } from '@/lib/logger';

const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  questionType: z.enum(['MCQ-Single', 'MCQ-Multiple', 'True-False', 'Essay', 'File-Upload']),
  points: z.number().min(1, 'Points must be at least 1'),
  options: z.array(z.object({
    text: z.string().min(1, 'Option text is required'),
    isCorrect: z.boolean(),
  })).optional(),
});

const assessmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  courseOffering: z.string().min(1, 'Course is required'),
  totalPoints: z.number().min(1, 'Total points must be at least 1'),
  dueDate: z.string().min(1, 'Due date is required'),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export function CreateAssessment() {
  const navigate = useNavigate();
  useAuthStore();
  const { success, error: showError } = useToastStore();
  const [myCourses, setMyCourses] = useState<IEnrollment[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      questions: [],
      totalPoints: 100,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const questions = watch('questions');
  watch('totalPoints');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await api.getMyCourses({ semester: 'current' }).catch(() => []);
        setMyCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        logger.error('Failed to fetch courses', {
          context: 'CreateAssessment',
          error,
        });
        showError('Failed to load courses');
      }
    };

    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fetchCourses, showError stable

  // Calculate total points from questions
  useEffect(() => {
    const calculatedTotal = questions.reduce((sum, q) => sum + (q.points || 0), 0);
    if (calculatedTotal > 0) {
      setValue('totalPoints', calculatedTotal);
    }
  }, [questions, setValue]);

  const addQuestion = (type: 'MCQ-Single' | 'MCQ-Multiple' | 'True-False' | 'Essay' | 'File-Upload') => {
    const baseQuestion = {
      questionText: '',
      questionType: type,
      points: 10,
    };

    if (type === 'MCQ-Single' || type === 'MCQ-Multiple') {
      append({
        ...baseQuestion,
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ],
      });
    } else if (type === 'True-False') {
      append({
        ...baseQuestion,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
      });
    } else {
      append(baseQuestion);
    }
  };

  const onSubmit = async (_data: AssessmentFormData) => {
    try {
      setLoading(true);
      
      // In real app, call API to create assessment
      // await api.createAssessment(data);
      
      success(
        'Assessment created successfully'
      );
      navigate('/dashboard/assessments/my-assessments');
    } catch (error) {
      logger.error('Failed to create assessment', {
        context: 'CreateAssessment',
        error,
      });
      showError('Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {'Create New Assessment'}
        </h1>
        <p className="text-gray-600 mt-1">
          {'Create a new test or assignment for your courses'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              {'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {'Course'} *
              </label>
              <select
                {...register('courseOffering')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">
                  {'Select a course...'}
                </option>
                {myCourses.map(course => (
                  <option key={course.courseOffering?.id} value={course.courseOffering?.id}>
                    {course.courseOffering?.course?.code} - {course.courseOffering?.course?.title}
                  </option>
                ))}
              </select>
              {errors.courseOffering && (
                <p className="mt-1 text-sm text-red-600">{errors.courseOffering.message}</p>
              )}
            </div>

            {/* Title */}
            <Input
              label={'Title'}
              {...register('title')}
              error={errors.title?.message}
              placeholder={'e.g., Midterm Exam - Chapters 1-5'}
            />

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {'Due Date'} *
              </label>
              <DatePicker
                selected={watch('dueDate') ? new Date(watch('dueDate')) : null}
                onChange={(date) => setValue('dueDate', date ? date.toISOString().split('T')[0] : '')}
                minDate={new Date()}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            {/* Total Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {'Total Points'}
              </label>
              <Input
                type="number"
                {...register('totalPoints', { valueAsNumber: true })}
                error={errors.totalPoints?.message}
                readOnly
                className="bg-gray-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                {'Automatically calculated from question points'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              {'Questions'} ({fields.length})
            </CardTitle>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  const type = e.target.value as any;
                  if (type) {
                    addQuestion(type);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{'Add Question...'}</option>
                <option value="MCQ-Single">{'Multiple Choice (Single)'}</option>
                <option value="MCQ-Multiple">{'Multiple Choice (Multiple)'}</option>
                <option value="True-False">{'True/False'}</option>
                <option value="Essay">{'Essay'}</option>
                <option value="File-Upload">{'File Upload'}</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{'No questions yet. Add a question to get started.'}</p>
              </div>
            ) : (
              fields.map((field, index) => {
                const question = questions[index];
                const questionType = question?.questionType || 'Essay';
                
                return (
                  <Card key={field.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {'Question'} {index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {'Question Type'}
                        </label>
                        <select
                          {...register(`questions.${index}.questionType`)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          disabled
                        >
                          <option value="MCQ-Single">{'Multiple Choice (Single)'}</option>
                          <option value="MCQ-Multiple">{'Multiple Choice (Multiple)'}</option>
                          <option value="True-False">{'True/False'}</option>
                          <option value="Essay">{'Essay'}</option>
                          <option value="File-Upload">{'File Upload'}</option>
                        </select>
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {'Question Text'} *
                        </label>
                        <textarea
                          {...register(`questions.${index}.questionText`)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder={'Enter question text...'}
                        />
                      </div>

                      {/* Options for MCQ and True/False */}
                      {(questionType === 'MCQ-Single' || questionType === 'MCQ-Multiple' || questionType === 'True-False') && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {'Options'} *
                          </label>
                          {question?.options?.map((_option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input
                                type={questionType === 'MCQ-Multiple' ? 'checkbox' : 'radio'}
                                {...register(`questions.${index}.options.${optIndex}.isCorrect`)}
                                className="h-4 w-4 text-primary-600"
                              />
                              <Input
                                {...register(`questions.${index}.options.${optIndex}.text`)}
                                placeholder={'Option text...'}
                                className="flex-1"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Points */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {'Points'} *
                        </label>
                        <Input
                          type="number"
                          {...register(`questions.${index}.points`, { valueAsNumber: true })}
                          min={1}
                          className="w-32"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard/assessments/my-assessments')}
            className="flex-1"
          >
            {'Cancel'}
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {'Save Assessment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

