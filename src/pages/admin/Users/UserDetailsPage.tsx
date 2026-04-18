import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useParams } from 'react-router-dom';
import { AdminPageShell } from '@/components/admin';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select2 } from '@/components/ui/Select2';
import { useDepartments } from '@/hooks/queries/useDepartments';
import {
  useAssignRFID,
  useDeactivateUser,
  useForceLogoutUser,
  useGraduateUser,
  useResetPassword,
  useRestoreUser,
  useUnlockUser,
  useUpdateUser,
  useUpdateUserRole,
  useUser,
} from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { phase2CollegeId, phase2DepartmentId, phase2RefLabel, phase2UserIsActive } from '@/lib/phase2UserUi';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import type { UserRole } from '@/types';
import { ArrowLeft, KeyRound, LogOut, Shield, UserCog } from 'lucide-react';

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

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'ta', label: 'TA' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'collegeAdmin', label: 'College admin' },
  { value: 'universityAdmin', label: 'University admin' },
];

export function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user: auth } = useAuthStore();
  const { success, error: toastError } = useToastStore();

  const isUA = auth?.role === 'universityAdmin';
  const isCA = auth?.role === 'collegeAdmin';
  const { data: u, isLoading, isError, refetch } = useUser(id);

  const updateUser = useUpdateUser();
  const deactivate = useDeactivateUser();
  const restore = useRestoreUser();
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
      { value: '', label: 'None' },
      ...items.map((d) => {
        const rec = d as Record<string, unknown>;
        return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
      }),
    ];
  }, [departmentsData?.items]);

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

  const isSelf = auth?.id === id;
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
      success('Profile updated.');
      void refetch();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      success(`${label} succeeded.`);
      void refetch();
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-gray-500">Loading profile…</div>
    );
  }

  if (isError || !u) {
    return (
      <AdminPageShell
        title="User not available"
        subtitle="The account may not exist, or you may not have access (scoped 404)."
        breadcrumbs={[{ label: 'User Management' }, { label: 'Users' }]}
        actions={
          <Link to="/dashboard/users/directory">
            <Button type="button" variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to directory
            </Button>
          </Link>
        }
      />
    );
  }

  const national = u.realNationalID ?? u.nationalID ?? '—';

  return (
    <AdminPageShell
      title={u.name}
      subtitle={u.email}
      breadcrumbs={[{ label: 'User Management' }, { label: 'Users' }, { label: u.name }]}
      badge={{
        label: active ? 'Active' : 'Deactivated',
        variant: active ? 'success' : 'neutral',
      }}
      actions={
        <Link to="/dashboard/users/directory">
          <Button type="button" variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Directory
          </Button>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {u.photo ? (
              <img src={u.photo} alt="" className="h-32 w-32 rounded-2xl object-cover ring-1 ring-gray-200" />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gray-100 text-2xl font-semibold text-gray-400">
                {u.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs uppercase text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{u.role}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">College</p>
              <p className="font-medium text-gray-900">{phase2RefLabel(u.college_id)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Department</p>
              <p className="font-medium text-gray-900">{phase2RefLabel(u.department_id)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">National ID</p>
              <p className="font-mono text-gray-900">{national}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">RFID</p>
              <p className="font-mono text-gray-900">{u.rfidTag ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Academic</p>
              <p className="text-gray-900">
                {u.academicStatus ?? '—'}
                {u.level != null ? ` · Level ${u.level}` : ''}
                {u.gpa != null ? ` · GPA ${u.gpa}` : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit contact</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => void onSaveProfile(d))} className="space-y-4">
                <Input label="Name" {...register('name')} error={errors.name?.message} />
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
                <Input label="Phone" {...register('phoneNumber')} error={errors.phoneNumber?.message} />
                <Select2
                  label="Department"
                  options={departmentOptions}
                  value={watch('department_id') ?? ''}
                  onChange={(v) => setValue('department_id', v)}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">New photo (optional)</label>
                  <input
                    id="edit-user-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml,image/bmp"
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
                  />
                </div>
                <Button type="submit" variant="primary" disabled={updateUser.isPending}>
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Account control
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {!isSelf && (isUA || isCA) && active && (
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => id && void run('Deactivate', () => deactivate.mutateAsync(id))}
                  disabled={deactivate.isPending}
                >
                  Deactivate
                </Button>
              )}
              {isUA && !active && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => id && void run('Restore', () => restore.mutateAsync(id))}
                  disabled={restore.isPending}
                >
                  Restore user
                </Button>
              )}
              {(isUA || isCA) && !isSelf && (
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => id && void run('Reset password', () => resetPwd.mutateAsync(id))}
                  disabled={resetPwd.isPending}
                >
                  <KeyRound className="h-4 w-4" />
                  Reset password
                </Button>
              )}
              {isUA && !isSelf && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => id && void run('Unlock account', () => unlock.mutateAsync(id))}
                    disabled={unlock.isPending}
                  >
                    Unlock account
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() => id && void run('Force logout', () => forceLogout.mutateAsync(id))}
                    disabled={forceLogout.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    Force logout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {isUA && !isSelf && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserCog className="h-4 w-4" />
                  Role (university admin)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px] flex-1">
                  <Select2
                    label="New role"
                    options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
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
                    void run('Role update', () => updateRole.mutateAsync({ id, role: nextRole }))
                  }
                  disabled={updateRole.isPending || nextRole === u.role}
                >
                  Update role
                </Button>
              </CardContent>
            </Card>
          )}

          {isCA && u.role === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">College admin actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => setRfidOpen(true)}>
                  Assign RFID
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => id && void run('Graduate', () => graduate.mutateAsync(id))}
                  disabled={graduate.isPending || u.academicStatus === 'graduated'}
                >
                  Mark graduated
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={rfidOpen} onClose={() => setRfidOpen(false)} title="Assign RFID tag" size="sm">
        <Input label="RFID tag" value={rfidTag} onChange={(e) => setRfidTag(e.target.value)} placeholder="Unique tag" />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => setRfidOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (!id || !rfidTag.trim()) return;
              void (async () => {
                try {
                  await assignRfid.mutateAsync({ id, rfidTag: rfidTag.trim() });
                  success('RFID assigned.');
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
            Save
          </Button>
        </div>
      </Modal>
    </AdminPageShell>
  );
}
