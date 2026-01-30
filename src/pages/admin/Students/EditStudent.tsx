import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { 
  ArrowLeft, 
  User, 
  GraduationCap,
  Save,
  X,
  Trash2
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { IStudent } from '@/types';
import { logger } from '@/lib/logger';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  nationalId: z.string().length(14, 'National ID must be exactly 14 digits'),
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  department: z.string().min(1, 'Department is required'),
  academicStatus: z.string().min(1, 'Academic status is required'),
});

type StudentFormData = z.infer<typeof studentSchema>;

// Mock student data - in real app, fetch from API
const mockStudent: IStudent = {
  id: '1',
  name: 'Mahmoud Ahmed',
  email: 'mahmoud.ahmed@university.edu',
  role: 'student',
  universityId: 'university-1',
  nationalId: '12345678901234',
  year: 3,
  semester: 1,
  creditsEarned: 90,
  gpa: 3.75,
  department: {
    id: 'dept-1',
    name: 'Computer Science',
    code: 'CS',
    college: {
      id: 'college-1',
      name: 'Faculty of Engineering',
      code: 'ENG',
    },
  },
  academicStatus: 'good_standing',
} as IStudent;

export function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<IStudent | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const watchYear = watch('year');
  const watchSemester = watch('semester');
  const watchDepartment = watch('department');
  const watchAcademicStatus = watch('academicStatus');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoadingStudent(true);
        // In real app: const studentData = await api.getStudent(id)
        // For now, using mock data
        setStudent(mockStudent);
        
        // Set form values
        if (mockStudent) {
          setValue('name', mockStudent.name);
          setValue('email', mockStudent.email);
          setValue('nationalId', mockStudent.nationalId || '');
          setValue('year', mockStudent.year.toString());
          setValue('semester', mockStudent.semester.toString());
          setValue('department', mockStudent.department?.id || '');
          setValue('academicStatus', mockStudent.academicStatus || 'good_standing');
        }
      } catch (err) {
        logger.error('Failed to fetch student', {
          context: 'EditStudent',
          error: err,
        });
        showError('Failed to load student data');
      } finally {
        setLoadingStudent(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id, setValue, showError]);

  const onSubmit = async (data: StudentFormData) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await api.updateStudent(id, data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      logger.info('Student updated successfully', { context: 'EditStudent', id, data });
      success('Student updated successfully');
      navigate('/dashboard/students');
    } catch (err: unknown) {
      logger.error('Failed to update student', {
        context: 'EditStudent',
        error: err,
      });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await api.deleteStudent(id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      logger.info('Student deleted successfully', { context: 'EditStudent', id });
      success('Student deleted successfully');
      navigate('/dashboard/students');
    } catch (err: unknown) {
      logger.error('Failed to delete student', {
        context: 'EditStudent',
        error: err,
      });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  // Mock departments - in real app, fetch from API
  const departments = [
    { value: 'dept-1', label: 'Computer Science' },
    { value: 'dept-2', label: 'Mathematics' },
    { value: 'dept-3', label: 'Physics' },
    { value: 'dept-4', label: 'Chemistry' },
  ];

  if (loadingStudent) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Student not found</p>
        <Link to="/dashboard/students">
          <Button variant="primary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/students">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-gray-600 mt-1">Update student information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Enter student's full name"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="student@university.edu"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
                <Input
                  label="National ID"
                  placeholder="12345678901234"
                  error={errors.nationalId?.message}
                  disabled
                  {...register('nationalId')}
                />
                <p className="text-xs text-gray-500">National ID cannot be changed</p>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary-600" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select2
                    label="Year"
                    value={watchYear || ''}
                    onChange={(value) => setValue('year', value)}
                    options={[
                      { value: '', label: 'Select Year' },
                      { value: '1', label: 'Year 1' },
                      { value: '2', label: 'Year 2' },
                      { value: '3', label: 'Year 3' },
                      { value: '4', label: 'Year 4' },
                    ]}
                    error={errors.year?.message}
                    placeholder="Select Year"
                  />
                  <Select2
                    label="Semester"
                    value={watchSemester || ''}
                    onChange={(value) => setValue('semester', value)}
                    options={[
                      { value: '', label: 'Select Semester' },
                      { value: '1', label: 'Semester 1' },
                      { value: '2', label: 'Semester 2' },
                    ]}
                    error={errors.semester?.message}
                    placeholder="Select Semester"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select2
                    label="Department"
                    value={watchDepartment || ''}
                    onChange={(value) => setValue('department', value)}
                    options={[
                      { value: '', label: 'Select Department' },
                      ...departments,
                    ]}
                    error={errors.department?.message}
                    placeholder="Select Department"
                  />
                  <Select2
                    label="Academic Status"
                    value={watchAcademicStatus || ''}
                    onChange={(value) => setValue('academicStatus', value)}
                    options={[
                      { value: '', label: 'Select Status' },
                      { value: 'good_standing', label: 'Good Standing' },
                      { value: 'honors', label: 'Honors' },
                      { value: 'probation', label: 'Probation' },
                    ]}
                    error={errors.academicStatus?.message}
                    placeholder="Select Status"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Link to="/dashboard/students">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Student
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Student Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits Earned:</span>
                    <span className="font-medium">{student.creditsEarned || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GPA:</span>
                    <span className="font-medium">{(student.gpa || 0).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

