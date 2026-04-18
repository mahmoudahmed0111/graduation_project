import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as collegesService from '@/services/colleges.service';
import type { GetCollegesParams } from '@/services/colleges.service';

const key = ['phase1', 'colleges'] as const;

export function useColleges(params?: GetCollegesParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...key, params ?? {}],
    queryFn: () => collegesService.getColleges(params),
    enabled: options?.enabled !== false,
  });
}

export function useCollege(id: string | undefined, query?: { isArchived?: 'true' }) {
  return useQuery({
    queryKey: [...key, 'detail', id, query],
    queryFn: () => collegesService.getCollege(id!, query),
    enabled: Boolean(id),
  });
}

export function useCollegeDepartments(
  collegeId: string | undefined,
  params?: Parameters<typeof collegesService.getCollegeDepartments>[1]
) {
  return useQuery({
    queryKey: [...key, collegeId, 'departments', params ?? {}],
    queryFn: () => collegesService.getCollegeDepartments(collegeId!, params),
    enabled: Boolean(collegeId),
  });
}

export function useCollegeLocations(
  collegeId: string | undefined,
  params?: Parameters<typeof collegesService.getCollegeLocations>[1]
) {
  return useQuery({
    queryKey: [...key, collegeId, 'locations', params ?? {}],
    queryFn: () => collegesService.getCollegeLocations(collegeId!, params),
    enabled: Boolean(collegeId),
  });
}

export function useInvalidateColleges() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key });
}

export function useCreateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: collegesService.createCollege,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof collegesService.updateCollege>[1] }) =>
      collegesService.updateCollege(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
