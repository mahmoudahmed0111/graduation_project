import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as departmentsService from '@/services/departments.service';
import type { GetDepartmentsParams } from '@/services/departments.service';

const key = ['phase1', 'departments'] as const;

export function useDepartments(params?: GetDepartmentsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...key, params ?? {}],
    queryFn: () => departmentsService.getDepartments(params),
    enabled: options?.enabled !== false,
  });
}

export function useDepartment(id: string | undefined, query?: { isArchived?: 'true' }) {
  return useQuery({
    queryKey: [...key, 'detail', id, query],
    queryFn: () => departmentsService.getDepartment(id!, query),
    enabled: Boolean(id),
  });
}

export function useInvalidateDepartments() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: departmentsService.createDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof departmentsService.updateDepartment>[1] }) =>
      departmentsService.updateDepartment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
