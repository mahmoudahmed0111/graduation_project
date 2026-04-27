import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

function invalidateCatalogDetail(qc: QueryClient, id: string) {
  void qc.invalidateQueries({ queryKey: [...key, 'detail', id] });
}

export function useUpdateCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof courseCatalogService.updateCourseCatalog>[1] }) =>
      courseCatalogService.updateCourseCatalog(id, data),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: key });
      invalidateCatalogDetail(qc, id);
    },
  });
}

export function useArchiveCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseCatalogService.archiveCourseCatalog,
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: key });
      invalidateCatalogDetail(qc, id);
    },
  });
}

export function useRestoreCourseCatalog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: courseCatalogService.restoreCourseCatalog,
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: key });
      invalidateCatalogDetail(qc, id);
    },
  });
}
