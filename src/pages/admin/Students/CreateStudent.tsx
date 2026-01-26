import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  CreditCard, 
  GraduationCap,
  Building2,
  Calendar,
  Save,
  X
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  nationalId: z.string().length(14, 'National ID must be exactly 14 digits'),
  year: z.string().min(1, 'Year is required'),
  semester: z.string().min(1, 'Semester is required'),
  department: z.string().min(1, 'Department is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type StudentFormData = z.infer<typeof studentSchema>;

export function CreateStudent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await api.createStudent(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      logger.info('Student created successfully', { context: 'CreateStudent', data });
      success('Student created successfully');
      navigate('/dashboard/students');
    } catch (err: any) {
      logger.error('Failed to create student', {
        context: 'CreateStudent',
        error: err,
      });
      showError(err.response?.data?.message || 'Failed to create student');
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Student</h1>
          <p className="text-gray-600 mt-1">Add a new student to the system</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="National ID"
                    placeholder="12345678901234"
                    error={errors.nationalId?.message}
                    {...register('nationalId')}
                  />
                </div>
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
                  <Select
                    label="Year"
                    options={[
                      { value: '', label: 'Select Year' },
                      { value: '1', label: 'Year 1' },
                      { value: '2', label: 'Year 2' },
                      { value: '3', label: 'Year 3' },
                      { value: '4', label: 'Year 4' },
                    ]}
                    error={errors.year?.message}
                    {...register('year')}
                  />
                  <Select
                    label="Semester"
                    options={[
                      { value: '', label: 'Select Semester' },
                      { value: '1', label: 'Semester 1' },
                      { value: '2', label: 'Semester 2' },
                    ]}
                    error={errors.semester?.message}
                    {...register('semester')}
                  />
                </div>
                <Select
                  label="Department"
                  options={[
                    { value: '', label: 'Select Department' },
                    ...departments,
                  ]}
                  error={errors.department?.message}
                  {...register('department')}
                />
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Password must be at least 8 characters long
                </p>
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
                  Create Student
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• All fields are required</p>
                  <p>• National ID must be 14 digits</p>
                  <p>• Email must be a valid university email</p>
                  <p>• Password must be at least 8 characters</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

