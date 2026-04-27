import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as usersService from '@/services/users.service';
import type { UserListQueryParams } from '@/services/users.service';
import type { Phase2BulkAction } from '@/types/phase2-user';
import type { UserRole } from '@/types';

const root = ['phase2', 'users'] as const;

export function usersListQueryKey(params: UserListQueryParams) {
  return [...root, 'list', params] as const;
}

/** Filters that define “same list” for placeholder reuse (exclude search + page). */
function usersListStableFingerprint(p: UserListQueryParams): string {
  return [
    p.limit ?? '',
    p.sort ?? '',
    p.isArchived ?? '',
    p.role ?? '',
    p.department_id ?? '',
    p.college_id ?? '',
    p.academicStatus ?? '',
    p.level ?? '',
    p.fields ?? '',
  ].join('\0');
}

function paramsFromUsersListQuery(previousQuery: unknown): UserListQueryParams | undefined {
  if (!previousQuery || typeof previousQuery !== 'object') return undefined;
  const key = (previousQuery as { queryKey?: readonly unknown[] }).queryKey;
  if (!key || key.length < 4 || key[2] !== 'list') return undefined;
  return key[3] as UserListQueryParams;
}

export function useUsers(params: UserListQueryParams) {
  return useQuery({
    queryKey: usersListQueryKey(params),
    queryFn: () => usersService.getUsers(params),
    placeholderData: (previousData, previousQuery) => {
      if (!previousData) return undefined;
      const prevParams = paramsFromUsersListQuery(previousQuery);
      if (!prevParams) return undefined;
      if (usersListStableFingerprint(prevParams) !== usersListStableFingerprint(params)) return undefined;
      return previousData;
    },
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [...root, 'detail', id],
    queryFn: () => usersService.getUser(id!),
    enabled: Boolean(id),
  });
}

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...root, 'me'],
    queryFn: () => usersService.getMe(),
    staleTime: 60_000,
    enabled: options?.enabled !== false,
  });
}

export function useLookupUser() {
  return useMutation({
    mutationFn: (nationalID: string) => usersService.lookupUser(nationalID),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fd: FormData) => usersService.createUser(fd),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: root });
    },
  });
}

export function useBulkImportUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, college_id }: { file: File; college_id?: string }) =>
      usersService.bulkImportUsers(file, college_id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: root });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      usersService.updateUser(id, formData),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', vars.id] });
    },
  });
}

export function useBulkActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { action: Phase2BulkAction; userIds: string[]; payload?: { departmentId?: string } }) =>
      usersService.bulkActions(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: root });
    },
  });
}

export function useAllocateUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersService.allocateUsers,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: root });
    },
  });
}

export function useResendCredentials() {
  return useMutation({
    mutationFn: usersService.resendCredentials,
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.deactivateUser(id),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', id] });
    },
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.restoreUser(id),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', id] });
    },
  });
}

export function useUnlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.unlockUser(id),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', id] });
    },
  });
}

export function useForceLogoutUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.forceLogoutUser(id),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', id] });
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.resetPassword(id),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', id] });
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole | string }) => usersService.updateUserRole(id, role),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', vars.id] });
    },
  });
}

export function useAssignRFID() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rfidTag }: { id: string; rfidTag: string }) => usersService.assignRFID(id, rfidTag),
    onSuccess: (_d, v) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', v.id] });
    },
  });
}

export function useGraduateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.graduateUser(id),
    onSuccess: (_d, id) => {
      void qc.invalidateQueries({ queryKey: root });
      void qc.invalidateQueries({ queryKey: [...root, 'detail', id] });
    },
  });
}
