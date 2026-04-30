import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as materialsService from '@/services/materials.service';
import type { MaterialCreateInput, MaterialListParams, MaterialUpdateInput } from '@/services/materials.service';

const root = ['phase4', 'materials'] as const;

export function materialsListQueryKey(offeringId: string, params: MaterialListParams = {}) {
  return [...root, 'list', offeringId, params] as const;
}

export function materialDetailQueryKey(offeringId: string, materialId: string) {
  return [...root, 'detail', offeringId, materialId] as const;
}

export function useMaterials(offeringId: string | undefined, params: MaterialListParams = {}) {
  return useQuery({
    queryKey: materialsListQueryKey(offeringId ?? '', params),
    queryFn: () => materialsService.listMaterials(offeringId!, params),
    enabled: Boolean(offeringId),
  });
}

export function useMaterial(offeringId: string | undefined, materialId: string | undefined) {
  return useQuery({
    queryKey: materialDetailQueryKey(offeringId ?? '', materialId ?? ''),
    queryFn: () => materialsService.getMaterial(offeringId!, materialId!),
    enabled: Boolean(offeringId && materialId),
  });
}

export function useCreateMaterial(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialCreateInput) => materialsService.createMaterial(offeringId, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'list', offeringId] }),
  });
}

export function useUpdateMaterial(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ materialId, input }: { materialId: string; input: MaterialUpdateInput }) =>
      materialsService.updateMaterial(offeringId, materialId, input),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: [...root, 'list', offeringId] });
      void qc.invalidateQueries({ queryKey: materialDetailQueryKey(offeringId, vars.materialId) });
    },
  });
}

export function useDeleteMaterial(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (materialId: string) => materialsService.deleteMaterial(offeringId, materialId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'list', offeringId] }),
  });
}
