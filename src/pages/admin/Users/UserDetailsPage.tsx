import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select2 } from '@/components/ui/Select2';
import { useDepartments } from '@/hooks/queries/useDepartments';
import {
  useAssignRFID,
  useBulkActions,
  useDeactivateUser,
  useForceLogoutUser,
  useGraduateUser,
  useResetPassword,
  useRestoreUser,
  useUnlockUser,
  useUpdateUser,
  useUpdateUserRole,
  useUser,
  useMe,
} from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { phase2CollegeId, phase2DepartmentId, phase2RefLabel, phase2UserIsActive } from '@/lib/phase2UserUi';
import { listPageLabelForRole, listPathForPhase2Role } from '@/lib/userListPaths';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import type { UserRole } from '@/types';
import { ArrowLeft, KeyRound, LogOut, Shield, User as UserIcon, UserCog } from 'lucide-react';

const phoneRe = /^01[0125]\d{8}$/;

const editSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .optional()
    .refine((v) => !v || v === '' || phoneRe.test(v), 'Egyptian mobile format'),
  department_id: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

const ROLE_OPTIONS: { value: UserRole; labelKey: string }[] = [
  { value: 'student', labelKey: 'admin.userDetailsPage.roleStudent' },
  { value: 'ta', labelKey: 'admin.userDetailsPage.roleTa' },
  { value: 'doctor', labelKey: 'admin.userDetailsPage.roleDoctor' },
  { value: 'collegeAdmin', labelKey: 'admin.userDetailsPage.roleCollegeAdmin' },
  { value: 'universityAdmin', labelKey: 'admin.userDetailsPage.roleUniversityAdmin' },
];

/** True when the URL `:id` is the signed-in user (handles `id` vs `_id` from auth / `GET /users/me`). */
function userIdsMatch(
  routeUserId: string | undefined,
  authUser: { id?: string } | null | undefined,
  meUser: { _id?: string } | null | undefined
): boolean {
  if (!routeUserId || !authUser) return false;
  const rid = String(routeUserId).trim();
  if (!rid) return false;
  const authId = String(authUser.id ?? '').trim();
  const authLegacyId = String((authUser as Record<string, unknown>)._id ?? '').trim();
  if (authId === rid || authLegacyId === rid) return true;
  if (meUser?._id && String(meUser._id).trim() === rid) return true;
  return false;
}

export function UserDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user: auth, isAuthenticated } = useAuthStore();
  const { success, error: toastError } = useToastStore();

  const isUA = auth?.role === 'universityAdmin';
  const isCA = auth?.role === 'collegeAdmin';
  const { data: me } = useMe({ enabled: Boolean(isAuthenticated && auth) });
  const { data: u, isLoading, isError, refetch } = useUser(id);

  const updateUser = useUpdateUser();
  const deactivate = useDeactivateUser();
  const restore = useRestoreUser();
  const bulkActions = useBulkActions();
  const unlock = useUnlockUser();
  const forceLogout = useForceLogoutUser();
  const resetPwd = useResetPassword();
  const updateRole = useUpdateUserRole();
  const assignRfid = useAssignRFID();
  const graduate = useGraduateUser();

  const [rfidOpen, setRfidOpen] = useState(false);
  const [rfidTag, setRfidTag] = useState('');
  const [nextRole, setNextRole] = useState<UserRole>('student');

  const collegeId = u ? phase2CollegeId(u) : '';
  const { data: departmentsData } = useDepartments(
    { college_id: collegeId || undefined, limit: 100, isArchived: 'false' },
    { enabled: Boolean(collegeId) }
  );

  const departmentOptions = useMemo(() => {
    const items = departmentsData?.items ?? [];
    return [
      { value: '', label: t('admin.userDetailsPage.none') },
      ...items.map((d) => {
        const rec = d as Record<string, unknown>;
        return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
      }),
    ];
  }, [departmentsData?.items, t]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (!u) return;
    reset({
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber ?? '',
      department_id: phase2DepartmentId(u) ?? '',
    });
    setNextRole((u.role as UserRole) ?? 'student');
  }, [u, reset]);

  const isSelf = userIdsMatch(id, auth, me ?? null);
  const active = u ? phase2UserIsActive(u) : false;

  const onSaveProfile = async (data: EditForm) => {
    if (!id) return;
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('email', data.email);
    if (data.phoneNumber) fd.append('phoneNumber', data.phoneNumber);
    if (data.department_id) fd.append('department_id', data.department_id);
    const el = document.getElementById('edit-user-photo') as HTMLInputElement | null;
    if (el?.files?.[0]) fd.append('photo', el.files[0]);
    try {
      await updateUser.mutateAsync({ id, formData: fd });
      success(t('admin.userDetailsPage.profileUpdated'));
      void refetch();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      success(t('admin.userDetailsPage.actionSucceeded', { label }));
      void refetch();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-500" />
      </div>
    );
  }

  if (isError || !u) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.notAvailable')}</p>
          <Link to="/dashboard/users/students">
            <Button variant="secondary" className="mt-4 inline-flex items-center gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.userDetailsPage.backToStudents')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const national = u.realNationalID ?? u.nationalID ?? '—';
  const listBack = listPathForPhase2Role(String(u.role));
  const listCrumbLabel = listPageLabelForRole(String(u.role));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm font-medium text-gray-600 dark:text-gray-400"
        >
          <span className="shrink-0">{t('admin.userDetailsPage.userManagement')}</span>
          <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
            /
          </span>
          <Link to={listBack} className="shrink-0 hover:text-primary-600 dark:hover:text-accent-400">
            {listCrumbLabel}
          </Link>
          <span className="shrink-0 text-gray-400 dark:text-gray-500" aria-hidden>
            /
          </span>
          <span
            className="min-w-0 truncate font-semibold text-gray-900 dark:text-gray-100"
            title={u.name}
          >
            {u.name}
          </span>
        </nav>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {active ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200">
              {t('admin.userDetailsPage.active')}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {t('admin.userDetailsPage.deactivated')}
            </span>
          )}
          <Link to={listBack}>
            <Button variant="secondary" className="inline-flex items-center gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.userDetailsPage.back')}
            </Button>
          </Link>
        </div>
      </div>

      <p className="-mt-2 text-sm text-gray-600 dark:text-gray-400">{u.email}</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
              <UserIcon className="h-4 w-4 shrink-0 text-gray-500" />
              {t('admin.userDetailsPage.profile')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {u.photo ? (
              <img src={u.photo} alt="" className="h-32 w-32 rounded-2xl object-cover ring-1 ring-gray-200 dark:ring-gray-700" />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-semibold text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                {u.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.role')}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{u.role}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.college')}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{phase2RefLabel(u.college_id)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.department')}</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{phase2RefLabel(u.department_id)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.nationalId')}</p>
              <p className="font-mono text-gray-900 dark:text-gray-100">{national}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.rfid')}</p>
              <p className="font-mono text-gray-900 dark:text-gray-100">{u.rfidTag ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 dark:text-gray-400">{t('admin.userDetailsPage.academic')}</p>
              <p className="text-gray-900 dark:text-gray-100">
                {u.academicStatus ?? '—'}
                {u.level != null ? ` · ${t('admin.userDetailsPage.levelLabel')} ${u.level}` : ''}
                {u.gpa != null ? ` · GPA ${u.gpa}` : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-900 dark:text-gray-100">{t('admin.userDetailsPage.editContact')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => void onSaveProfile(d))} className="space-y-4">
                <Input label={t('admin.userDetailsPage.name')} {...register('name')} error={errors.name?.message} />
                <Input label={t('admin.userDetailsPage.email')} type="email" {...register('email')} error={errors.email?.message} />
                <Input label={t('admin.userDetailsPage.phone')} {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                <Select2
                  label={t('admin.userDetailsPage.department')}
                  options={departmentOptions}
                  value={watch('department_id') ?? ''}
                  onChange={(v) => setValue('department_id', v)}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.userDetailsPage.newPhotoOptional')}</label>
                  <input
                    id="edit-user-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/bmp"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
                  />
                </div>
                <Button type="submit" variant="primary" disabled={updateUser.isPending}>
                  {t('admin.userDetailsPage.saveChanges')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
                <Shield className="h-4 w-4" />
                {t('admin.userDetailsPage.accountControl')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSelf ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.userDetailsPage.selfRestriction')}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(isUA || isCA) && active && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => id && void run(t('admin.userDetailsPage.deactivate'), () => deactivate.mutateAsync(id))}
                      disabled={deactivate.isPending}
                    >
                      {t('admin.userDetailsPage.deactivate')}
                    </Button>
                  )}
                  {!active && isUA && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => id && void run(t('admin.userDetailsPage.activateAccount'), () => restore.mutateAsync(id))}
                      disabled={restore.isPending}
                    >
                      {t('admin.userDetailsPage.activateAccount')}
                    </Button>
                  )}
                  {!active && isCA && (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() =>
                        id &&
                        void run(t('admin.userDetailsPage.activateAccount'), () =>
                          bulkActions.mutateAsync({ action: 'activate', userIds: [id] })
                        )
                      }
                      disabled={bulkActions.isPending}
                    >
                      {t('admin.userDetailsPage.activateAccount')}
                    </Button>
                  )}
                  {(isUA || isCA) && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => id && void run(t('admin.userDetailsPage.resetPassword'), () => resetPwd.mutateAsync(id))}
                      disabled={resetPwd.isPending}
                    >
                      <KeyRound className="h-4 w-4" />
                      {t('admin.userDetailsPage.resetPassword')}
                    </Button>
                  )}
                  {isUA && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => id && void run(t('admin.userDetailsPage.unlockAccount'), () => unlock.mutateAsync(id))}
                        disabled={unlock.isPending}
                      >
                        {t('admin.userDetailsPage.unlockAccount')}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => id && void run(t('admin.userDetailsPage.forceLogout'), () => forceLogout.mutateAsync(id))}
                        disabled={forceLogout.isPending}
                      >
                        <LogOut className="h-4 w-4" />
                        {t('admin.userDetailsPage.forceLogout')}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {isUA && !isSelf && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-gray-900 dark:text-gray-100">
                  <UserCog className="h-4 w-4" />
                  {t('admin.userDetailsPage.roleUaTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <Select2
                    label={t('admin.userDetailsPage.newRole')}
                    options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: t(r.labelKey) }))}
                    value={nextRole}
                    onChange={(v) => setNextRole(v as UserRole)}
                    searchable={false}
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() =>
                    id &&
                    void run(t('admin.userDetailsPage.roleUpdate'), () => updateRole.mutateAsync({ id, role: nextRole }))
                  }
                  disabled={updateRole.isPending || nextRole === u.role}
                >
                  {t('admin.userDetailsPage.updateRole')}
                </Button>
              </CardContent>
            </Card>
          )}

          {isCA && u.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-gray-900 dark:text-gray-100">{t('admin.userDetailsPage.caActions')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => setRfidOpen(true)}>
                  {t('admin.userDetailsPage.assignRfid')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => id && void run(t('admin.userDetailsPage.graduate'), () => graduate.mutateAsync(id))}
                  disabled={graduate.isPending || u.academicStatus === 'graduated'}
                >
                  {t('admin.userDetailsPage.markGraduated')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={rfidOpen} onClose={() => setRfidOpen(false)} title={t('admin.userDetailsPage.assignRfidTag')} size="sm">
        <Input label={t('admin.userDetailsPage.rfidTag')} value={rfidTag} onChange={(e) => setRfidTag(e.target.value)} placeholder={t('admin.userDetailsPage.uniqueTag')} />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setRfidOpen(false)}>
            {t('admin.userDetailsPage.cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (!id || !rfidTag.trim()) return;
              void (async () => {
                try {
                  await assignRfid.mutateAsync({ id, rfidTag: rfidTag.trim() });
                  success(t('admin.userDetailsPage.rfidAssigned'));
                  setRfidOpen(false);
                  setRfidTag('');
                  void refetch();
                } catch (e) {
                  toastError(getApiErrorMessage(e));
                }
              })();
            }}
            disabled={!rfidTag.trim() || assignRfid.isPending}
          >
            {t('admin.userDetailsPage.save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
