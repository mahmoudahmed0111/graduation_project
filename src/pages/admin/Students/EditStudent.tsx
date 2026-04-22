import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { ArrowLeft, User, GraduationCap, Save, X, Trash2 } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import type { IStudent } from '@/types';
import { logger } from '@/lib/logger';
import { api, getApiErrorMessage } from '@/lib/api';
import { mapUserRecordToStudent } from '@/lib/mapUserRecord';

const studentEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().max(30).optional(),
  department: z.string().min(1, 'Department is required'),
});

type StudentEditForm = z.infer<typeof studentEditSchema>;

export function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success, error: showError } = useToastStore();
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<IStudent | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [departmentOptions, setDepartmentOptions] = useState<Array<{ value: string; label: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StudentEditForm>({
    resolver: zodResolver(studentEditSchema),
  });

  const watchDepartment = watch('department');

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        setLoadingStudent(true);
        const raw = await api.getUser(id);
        if (String(raw.role ?? '') !== 'student') {
          showError('This account is not a student.');
          setStudent(null);
          return;
        }
        const mapped = mapUserRecordToStudent(raw);
        setStudent(mapped);

        setValue('name', mapped.name);
        setValue('email', mapped.email);
        setValue('phoneNumber', mapped.phoneNumber ?? '');
        setValue('department', mapped.department?.id ?? '');

        const collegeId = mapped.department?.college?.id;
        const deptList = await api.getDepartments({
          ...(collegeId ? { college_id: collegeId } : {}),
          isArchived: 'false',
          limit: 500,
        });
        setDepartmentOptions(
          deptList.map((d) => {
            const r = d as Record<string, unknown>;
            return {
              value: String(r._id ?? r.id ?? ''),
              label: String(r.name ?? ''),
            };
          })
        );
      } catch (err) {
        logger.error('Failed to fetch student', {
          context: 'EditStudent',
          error: err,
        });
        showError(getApiErrorMessage(err, 'Failed to load student'));
        setStudent(null);
      } finally {
        setLoadingStudent(false);
      }
    };

    void fetchStudent();
  }, [id, setValue, showError]);

  const onSubmit = async (data: StudentEditForm) => {
    if (!id) return;
    try {
      setLoading(true);
      await api.patchUser(id, {
        name: data.name.trim(),
        email: data.email.trim(),
        phoneNumber: data.phoneNumber?.trim() || undefined,
        department_id: data.department,
      });
      success('Student updated successfully');
      navigate(`/dashboard/students/${id}`);
    } catch (err: unknown) {
      logger.error('Failed to update student', {
        context: 'EditStudent',
        error: err,
      });
      showError(getApiErrorMessage(err, 'Failed to update student'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Deactivate this student account? They will no longer be able to sign in.')) {
      return;
    }

    try {
      setLoading(true);
      await api.deactivateUser(id);
      success('Student deactivated');
      navigate('/dashboard/students');
    } catch (err: unknown) {
      logger.error('Failed to deactivate student', {
        context: 'EditStudent',
        error: err,
      });
      showError(getApiErrorMessage(err, 'Failed to deactivate student'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingStudent) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-600">Student not found</p>
        <Link to="/dashboard/students">
          <Button variant="primary">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/dashboard/students/${id}`}>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Student</h1>
          <p className="mt-1 text-gray-600">
            You can update name, email, phone, and department.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4 text-primary-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Full Name"
                  placeholder="Student name"
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
                <Input label="National ID" value={student.nationalId ?? '—'} disabled readOnly />
                <Input
                  label="Phone"
                  placeholder="Optional"
                  error={errors.phoneNumber?.message}
                  {...register('phoneNumber')}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">National ID cannot be changed via this form.</p>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <GraduationCap className="h-4 w-4 text-primary-600" />
                Academic (read-only) + department
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                Level, GPA, and credits are managed by the registrar system. You can change department when allowed by
                policy.
              </p>
              <div className="mb-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="text-gray-500">Level / semester: </span>
                  <span className="font-medium">
                    {student.year} / {student.semester}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">GPA: </span>
                  <span className="font-medium">{(student.gpa ?? 0).toFixed(2)}</span>
                </p>
                <p>
                  <span className="text-gray-500">Credits: </span>
                  <span className="font-medium">{student.creditsEarned ?? 0}</span>
                </p>
                <p>
                  <span className="text-gray-500">Status: </span>
                  <span className="font-medium">{student.academicStatus ?? '—'}</span>
                </p>
              </div>
              <Select2
                label="Department"
                value={watchDepartment || ''}
                onChange={(value) => setValue('department', value)}
                options={[{ value: '', label: 'Select department' }, ...departmentOptions]}
                error={errors.department?.message}
                placeholder="Select department"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            Save changes
          </Button>
          <Link to={`/dashboard/students/${id}`}>
            <Button type="button" variant="secondary" disabled={loading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => void handleDelete()}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deactivate student
          </Button>
        </div>
      </form>
    </div>
  );
}
