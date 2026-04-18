import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as courseCatalogService from '@/services/courseCatalog.service';
import type { CourseCatalogListParams } from '@/services/courseCatalog.service';

const key = ['phase3', 'course-catalog'] as const;

export function courseCatalogListQueryKey(params: CourseCatalogListParams) {
  return [...key, 'list', params] as const;
}

export function useCourseCatalogs(params: CourseCatalogListParams) {
  return useQuery({
    queryKey: courseCatalogListQueryKey(params),
    queryFn: () => courseCatalogService.getCourseCatalogs(params),
  });
}

export function useCourseCatalog(id: string | undefined) {
  return useQuery({
    queryKey: [...key, 'detail', id],
    queryFn: () => courseCatalogService.getCourseCatalog(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseCatalogService.createCourseCatalog,
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof courseCatalogService.updateCourseCatalog>[1] }) =>
      courseCatalogService.updateCourseCatalog(id, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useArchiveCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseCatalogService.archiveCourseCatalog,
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}

export function useRestoreCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseCatalogService.restoreCourseCatalog,
    onSuccess: () => void qc.invalidateQueries({ queryKey: key }),
  });
}
