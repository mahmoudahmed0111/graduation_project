import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { useColleges } from '@/hooks/queries/useColleges';
import { useDepartments } from '@/hooks/queries/useDepartments';
import { useCreateUser } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { listPathForPhase2Role } from '@/lib/userListPaths';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

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

const ROLE_OPTIONS_ALL = [
  { value: 'student', labelKey: 'admin.createUserPage.roleStudent' },
  { value: 'ta', labelKey: 'admin.createUserPage.roleTa' },
  { value: 'doctor', labelKey: 'admin.createUserPage.roleDoctor' },
  { value: 'collegeAdmin', labelKey: 'admin.createUserPage.roleCollegeAdmin' },
  { value: 'universityAdmin', labelKey: 'admin.createUserPage.roleUniversityAdmin' },
] as const;

export type CreateUserPageProps = {
  /** Initial and submitted role when `lockRole` is true. */
  defaultRole?: FormData['role'];
  /** Hide role picker (segment-specific create pages). */
  lockRole?: boolean;
  /** Cancel / back target; defaults from current role selection. */
  cancelReturnPath?: string;
};

export function CreateUserPage(props?: CreateUserPageProps) {
  const { t } = useTranslation();
  const { defaultRole = 'student', lockRole = false, cancelReturnPath } = props ?? {};
  const navigate = useNavigate();
  const { user: auth } = useAuthStore();
  const isUA = auth?.role === 'universityAdmin';
  const { success, error: toastError } = useToastStore();
  const createUser = useCreateUser();

  const roleOptions = useMemo(
    () => (isUA ? [...ROLE_OPTIONS_ALL] : ROLE_OPTIONS_ALL.filter((o) => o.value !== 'universityAdmin')),
    [isUA]
  );

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
      role: defaultRole,
      college_id: '',
      department_id: '',
    },
  });

  const cancelTo = cancelReturnPath ?? listPathForPhase2Role(watch('role'));

  const collegeId = watch('college_id');
  const effectiveCollegeId = isUA ? collegeId : auth?.collegeId ?? '';
  const {
    data: collegesData,
    isLoading: collegesLoading,
    isError: collegesError,
    refetch: refetchColleges,
  } = useColleges({ limit: 100, isArchived: 'false' }, { enabled: isUA });
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
      { value: '', label: t('admin.createUserPage.none') },
      ...items.map((d) => {
        const rec = d as Record<string, unknown>;
        return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
      }),
    ];
  }, [departmentsData?.items, t]);

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
      const created = await createUser.mutateAsync(fd);
      success(t('admin.createUserPage.createdToast'));
      navigate(listPathForPhase2Role(String(created.role)));
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  if (isUA && collegesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500 dark:border-accent" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('admin.createUserPage.loadingColleges')}</p>
        </div>
      </div>
    );
  }

  if (isUA && collegesError && !collegesLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Link to={cancelTo}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('admin.createUserPage.back')}
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.createUserPage.title')}</h1>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
          <p className="font-medium text-red-800 dark:text-red-200">{t('admin.createUserPage.collegesLoadFail')}</p>
          <Button variant="secondary" className="mt-4" type="button" onClick={() => void refetchColleges()}>
            {t('admin.createUserPage.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to={cancelTo}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {t('admin.createUserPage.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('admin.createUserPage.title')}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <UserPlus className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
            {t('admin.createUserPage.details')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {t('admin.createUserPage.tempPasswordHint')}
          </p>
          <form onSubmit={handleSubmit((d) => void onSubmit(d))} className="space-y-4">
            {isUA && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createUserPage.collegeRequired')}</label>
                <Select2
                  value={collegeId ?? ''}
                  onChange={(v) => {
                    setValue('college_id', v);
                    setValue('department_id', '');
                  }}
                  options={collegeOptions.map((o) => ({ value: o.value, label: o.label }))}
                  error={errors.college_id?.message}
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createUserPage.fullNameRequired')}</label>
              <Input {...register('name')} error={errors.name?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createUserPage.emailRequired')}</label>
                <Input type="email" {...register('email')} error={errors.email?.message} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createUserPage.phoneRequired')}</label>
                <Input placeholder="01xxxxxxxxx" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.createUserPage.nationalIdRequired')}
              </label>
              <Input {...register('nationalID')} error={errors.nationalID?.message} />
            </div>
            {!lockRole && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createUserPage.roleRequired')}</label>
                <Select2
                  value={watch('role')}
                  onChange={(v) => setValue('role', v as FormData['role'])}
                  options={roleOptions.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
                  error={errors.role?.message}
                  searchable={false}
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('admin.createUserPage.departmentOptional')}
              </label>
              <Select2
                value={watch('department_id') ?? ''}
                onChange={(v) => setValue('department_id', v)}
                options={departmentOptions}
                error={errors.department_id?.message}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.createUserPage.photoOptional')}</label>
              <input
                id="create-user-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml,image/bmp"
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 dark:text-gray-400 dark:file:bg-primary-950/40 dark:file:text-primary-300"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={createUser.isPending || (isUA && collegeOptions.length === 0)}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {createUser.isPending ? t('admin.createUserPage.saving') : t('admin.createUserPage.create')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
