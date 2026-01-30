import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Save,
  X,
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  nationalId: z.string().optional(),
  adminType: z.enum(['universityAdmin', 'collegeAdmin'], { required_error: 'Admin type is required' }),
  collegeId: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.adminType === 'collegeAdmin') return !!data.collegeId;
  return true;
}, { message: 'College is required for College Admin', path: ['collegeId'] });

type AdminFormData = z.infer<typeof adminSchema>;

export function CreateAdmin() {
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: { adminType: 'universityAdmin' },
  });

  const watchAdminType = watch('adminType');
  const watchCollegeId = watch('collegeId');

  useEffect(() => {
    setColleges([
      { id: 'college-1', name: 'Faculty of Engineering' },
      { id: 'college-2', name: 'Faculty of Science' },
    ]);
  }, []);

  const onSubmit = async (data: AdminFormData) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info('Admin created successfully', { context: 'CreateAdmin', data });
      success('Administrator created successfully');
      navigate('/dashboard/users/admins');
    } catch (err: unknown) {
      logger.error('Failed to create admin', { context: 'CreateAdmin', error: err });
      showError('Failed to create administrator');
    } finally {
      setLoading(false);
    }
  };

  const collegeOptions = [
    { value: '', label: 'Select College' },
    ...colleges.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/users/admins">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Administrator</h1>
          <p className="text-gray-600 mt-1">Add a new admin to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                    placeholder="Enter admin's full name"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@university.edu"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
                <Input
                  label="National ID (optional)"
                  placeholder="12345678901234"
                  error={errors.nationalId?.message}
                  {...register('nationalId')}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                  Role & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Type</label>
                  <Select2
                    value={watchAdminType || ''}
                    onChange={(value) => {
                      setValue('adminType', value as 'universityAdmin' | 'collegeAdmin');
                      if (value !== 'collegeAdmin') setValue('collegeId', '');
                    }}
                    options={[
                      { value: 'universityAdmin', label: 'University Admin' },
                      { value: 'collegeAdmin', label: 'College Admin' },
                    ]}
                    error={errors.adminType?.message}
                    placeholder="Select admin type..."
                  />
                </div>
                {watchAdminType === 'collegeAdmin' && (
                  <Select2
                    label="College"
                    value={watchCollegeId || ''}
                    onChange={(value) => setValue('collegeId', value)}
                    options={collegeOptions}
                    error={errors.collegeId?.message}
                    placeholder="Search and select college..."
                  />
                )}
              </CardContent>
            </Card>

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
                <p className="text-sm text-gray-500">Password must be at least 8 characters long</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" variant="primary" className="w-full" isLoading={loading} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Admin
                </Button>
                <Link to="/dashboard/users/admins">
                  <Button type="button" variant="secondary" className="w-full" disabled={loading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
