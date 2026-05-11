import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
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
    watch,
    setValue,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const watchYear = watch('year');
  const watchSemester = watch('semester');
  const watchDepartment = watch('department');

  const onSubmit = async (data: StudentFormData) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // await api.createStudent(data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      logger.info('Student created successfully', { context: 'CreateStudent', data });
      success(t('admin.studentsCreate.createdToast'));
      navigate('/dashboard/students');
    } catch (err: unknown) {
      logger.error('Failed to create student', {
        context: 'CreateStudent',
        error: err,
      });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg || t('admin.studentsCreate.createFail'));
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
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.studentsCreate.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.studentsCreate.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" />
                {t('admin.studentsCreate.personalInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('admin.studentsCreate.fullName')}
                  placeholder={t('admin.studentsCreate.fullNamePlaceholder')}
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label={t('admin.studentsCreate.email')}
                  type="email"
                  placeholder="student@university.edu"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label={t('admin.studentsCreate.nationalId')}
                  placeholder="12345678901234"
                  error={errors.nationalId?.message}
                  {...register('nationalId')}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary-600" />
                {t('admin.studentsCreate.academicInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select2
                  label={t('admin.studentsCreate.year')}
                  value={watchYear || ''}
                  onChange={(value) => setValue('year', value)}
                  options={[
                    { value: '', label: t('admin.studentsCreate.selectYear') },
                    { value: '1', label: t('admin.studentsCreate.year1') },
                    { value: '2', label: t('admin.studentsCreate.year2') },
                    { value: '3', label: t('admin.studentsCreate.year3') },
                    { value: '4', label: t('admin.studentsCreate.year4') },
                  ]}
                  error={errors.year?.message}
                  placeholder={t('admin.studentsCreate.selectYear')}
                />
                <Select2
                  label={t('admin.studentsCreate.semester')}
                  value={watchSemester || ''}
                  onChange={(value) => setValue('semester', value)}
                  options={[
                    { value: '', label: t('admin.studentsCreate.selectSemester') },
                    { value: '1', label: t('admin.studentsCreate.semester1') },
                    { value: '2', label: t('admin.studentsCreate.semester2') },
                  ]}
                  error={errors.semester?.message}
                  placeholder={t('admin.studentsCreate.selectSemester')}
                />
                <Select2
                  label={t('admin.studentsCreate.department')}
                  value={watchDepartment || ''}
                  onChange={(value) => setValue('department', value)}
                  options={[
                    { value: '', label: t('admin.studentsCreate.selectDepartment') },
                    ...departments,
                  ]}
                  error={errors.department?.message}
                  placeholder={t('admin.studentsCreate.selectDepartment')}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-600" />
                {t('admin.studentsCreate.accountInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('admin.studentsCreate.password')}
                  type="password"
                  placeholder={t('admin.studentsCreate.passwordPlaceholder')}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label={t('admin.studentsCreate.confirmPassword')}
                  type="password"
                  placeholder={t('admin.studentsCreate.confirmPasswordPlaceholder')}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{t('admin.studentsCreate.passwordHint')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {t('admin.studentsCreate.createStudent')}
          </Button>
          <Link to="/dashboard/students">
            <Button type="button" variant="secondary" disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              {t('admin.studentsCreate.cancel')}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

