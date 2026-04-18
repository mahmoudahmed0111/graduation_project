import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { AdminPageShell } from '@/components/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useCreateUser } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { ArrowLeft } from 'lucide-react';

const phoneRe = /^01[0125]\d{8}$/;

const baseSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  nationalID: z.string().length(14).regex(/^\d+$/, '14 digits only'),
  phoneNumber: z.string().regex(phoneRe, 'Egyptian mobile: 01[0125] + 8 digits'),
  role: z.enum(['student', 'ta', 'doctor', 'collegeAdmin', 'universityAdmin']),
  college_id: z.string().optional(),
  department_id: z.string().optional(),
});

type FormData = z.infer<typeof baseSchema>;

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'ta', label: 'Teaching assistant' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'collegeAdmin', label: 'College admin' },
  { value: 'universityAdmin', label: 'University admin' },
];

export function CreateUserPage() {
  const navigate = useNavigate();
  const { user: auth } = useAuthStore();
  const isUA = auth?.role === 'universityAdmin';
  const { success, error: toastError } = useToastStore();
  const createUser = useCreateUser();

  const schema = useMemo(
    () =>
      baseSchema.superRefine((data, ctx) => {
        if (isUA && !data.college_id) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'College is required', path: ['college_id'] });
        }
      }),
    [isUA]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'student',
      college_id: '',
      department_id: '',
    },
  });

  const collegeId = watch('college_id');
  const effectiveCollegeId = isUA ? collegeId : auth?.collegeId ?? '';
  const { data: collegesData } = useColleges(
    { limit: 100, isArchived: 'false' },
    { enabled: isUA }
  );
  const { data: departmentsData } = useDepartments(
    { college_id: effectiveCollegeId || undefined, limit: 100, isArchived: 'false' },
    { enabled: Boolean(effectiveCollegeId) }
  );

  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return items.map((c) => {
      const rec = c as Record<string, unknown>;
      return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
    });
  }, [collegesData?.items]);

  const departmentOptions = useMemo(() => {
    const items = departmentsData?.items ?? [];
    return [
      { value: '', label: 'None' },
      ...items.map((d) => {
        const rec = d as Record<string, unknown>;
        return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
      }),
    ];
  }, [departmentsData?.items]);

  const onSubmit = async (data: FormData) => {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('email', data.email);
    fd.append('nationalID', data.nationalID);
    fd.append('phoneNumber', data.phoneNumber);
    fd.append('role', data.role);
    if (data.department_id) fd.append('department_id', data.department_id);
    if (isUA && data.college_id) fd.append('college_id', data.college_id);

    const photoEl = document.getElementById('create-user-photo') as HTMLInputElement | null;
    if (photoEl?.files?.[0]) fd.append('photo', photoEl.files[0]);

    try {
      await createUser.mutateAsync(fd);
      success('User created. Credentials are emailed to the user.');
      navigate('/dashboard/users/directory');
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  return (
    <AdminPageShell
      title="Create user"
      subtitle="Single user via Phase 2 POST /users (multipart). Password is generated server-side."
      breadcrumbs={[{ label: 'User Management' }, { label: 'Users' }, { label: 'Create' }]}
      actions={
        <Link to="/dashboard/users/directory">
          <Button type="button" variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit((d) => void onSubmit(d))}
        className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-dark-border dark:bg-dark-surface"
      >
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="National ID (14 digits)" {...register('nationalID')} error={errors.nationalID?.message} />
        <Input label="Phone" placeholder="01xxxxxxxxx" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
        <Select2
          label="Role"
          options={ROLE_OPTIONS}
          value={watch('role')}
          onChange={(v) => setValue('role', v as FormData['role'])}
          error={errors.role?.message}
          searchable={false}
        />
        {isUA && (
          <Select2
            label="College"
            options={collegeOptions}
            value={collegeId ?? ''}
            onChange={(v) => {
              setValue('college_id', v);
              setValue('department_id', '');
            }}
            error={errors.college_id?.message}
          />
        )}
        <Select2
          label="Department (optional)"
          options={departmentOptions}
          value={watch('department_id') ?? ''}
          onChange={(v) => setValue('department_id', v)}
          error={errors.department_id?.message}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Photo (optional)</label>
          <input
            id="create-user-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/bmp"
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" disabled={createUser.isPending}>
            {createUser.isPending ? 'Creating…' : 'Create user'}
          </Button>
          <Link to="/dashboard/users/directory">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </AdminPageShell>
  );
}
