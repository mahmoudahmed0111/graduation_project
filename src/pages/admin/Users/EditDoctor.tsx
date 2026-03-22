import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { ArrowLeft, User, UserCheck, Save, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  nationalId: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const mockDoctor = {
  id: 'doc-1',
  name: 'Dr. Fatima Ali',
  email: 'fatima.ali@university.edu',
  nationalId: '12345678901234',
  role: 'doctor' as const,
  universityId: 'univ-1',
  departmentId: 'dept-1',
};

export function EditDoctor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DoctorFormData>({ resolver: zodResolver(doctorSchema) });

  const watchDepartment = watch('department');

  useEffect(() => {
    setDepartments([
      { id: 'dept-1', name: 'Computer Science' },
      { id: 'dept-2', name: 'Mathematics' },
      { id: 'dept-3', name: 'Physics' },
    ]);
  }, []);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setFetching(true);
        await new Promise((r) => setTimeout(r, 300));
        setValue('name', mockDoctor.name);
        setValue('email', mockDoctor.email);
        setValue('nationalId', mockDoctor.nationalId || '');
        setValue('department', mockDoctor.departmentId);
      } catch (err) {
        logger.error('Failed to fetch doctor', { context: 'EditDoctor', error: err });
        showError('Failed to load doctor');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchDoctor();
  }, [id, setValue, showError]);

  const onSubmit = async (data: DoctorFormData) => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info('Doctor updated successfully', { context: 'EditDoctor', data });
      success('Doctor updated successfully');
      navigate('/dashboard/users/doctors');
    } catch (err: unknown) {
      logger.error('Failed to update doctor', { context: 'EditDoctor', error: err });
      showError('Failed to update doctor');
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading doctor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/users/doctors">
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Doctor</h1>
          <p className="text-gray-600 mt-1">Update doctor information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Enter doctor's full name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="doctor@university.edu"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  label="National ID (optional)"
                  placeholder="12345678901234"
                  error={errors.nationalId?.message}
                  {...register('nationalId')}
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary-600" />
                Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select2
                  label="Department"
                  value={watchDepartment || ''}
                  onChange={(value) => setValue('department', value)}
                  options={departmentOptions}
                  error={errors.department?.message}
                  placeholder="Search and select department..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Update Doctor
          </Button>
          <Link to="/dashboard/users/doctors">
            <Button type="button" variant="secondary" disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
