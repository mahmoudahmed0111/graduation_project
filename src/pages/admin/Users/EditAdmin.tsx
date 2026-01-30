import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { ArrowLeft, User, Shield, Save, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  nationalId: z.string().optional(),
  adminType: z.enum(['universityAdmin', 'collegeAdmin'], { required_error: 'Admin type is required' }),
  collegeId: z.string().optional(),
}).refine((data) => {
  if (data.adminType === 'collegeAdmin') return !!data.collegeId;
  return true;
}, { message: 'College is required for College Admin', path: ['collegeId'] });

type AdminFormData = z.infer<typeof adminSchema>;

const mockAdmin: { id: string; name: string; email: string; nationalId: string; role: 'universityAdmin' | 'collegeAdmin'; universityId: string; collegeId: string } = {
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@university.edu',
  nationalId: '',
  role: 'universityAdmin',
  universityId: 'univ-1',
  collegeId: '',
};

export function EditAdmin() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        setFetching(true);
        await new Promise((r) => setTimeout(r, 300));
        setValue('name', mockAdmin.name);
        setValue('email', mockAdmin.email);
        setValue('nationalId', mockAdmin.nationalId || '');
        setValue('adminType', mockAdmin.role === 'collegeAdmin' ? 'collegeAdmin' : 'universityAdmin');
        setValue('collegeId', mockAdmin.collegeId || '');
      } catch (err) {
        logger.error('Failed to fetch admin', { context: 'EditAdmin', error: err });
        showError('Failed to load administrator');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchAdmin();
  }, [id, setValue, showError]);

  const onSubmit = async (data: AdminFormData) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info('Admin updated successfully', { context: 'EditAdmin', data });
      success('Administrator updated successfully');
      navigate('/dashboard/users/admins');
    } catch (err: unknown) {
      logger.error('Failed to update admin', { context: 'EditAdmin', error: err });
      showError('Failed to update administrator');
    } finally {
      setLoading(false);
    }
  };

  const collegeOptions = [
    { value: '', label: 'Select College' },
    ...colleges.map((c) => ({ value: c.id, label: c.name })),
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/users/admins">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Administrator</h1>
          <p className="text-gray-600 mt-1">Update admin information</p>
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
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" variant="primary" className="w-full" isLoading={loading} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Admin
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
