import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as locationsService from '@/services/locations.service';
import type { GetLocationsParams } from '@/services/locations.service';

/** Phase 1 Module 4 — `/api/v1/locations` list + mutations. */
const key = ['phase1', 'locations'] as const;

export function useLocations(params?: GetLocationsParams) {
  return useQuery({
    queryKey: [...key, params ?? {}],
    queryFn: () => locationsService.getLocations(params),
  });
}

export function useLocation(id: string | undefined) {
  return useQuery({
    queryKey: [...key, 'detail', id],
    queryFn: () => locationsService.getLocation(id!),
    enabled: Boolean(id),
  });
}

export function useInvalidateLocations() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: key });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: locationsService.createLocation,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof locationsService.updateLocation>[1] }) =>
      locationsService.updateLocation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateLocationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'maintenance' }) =>
      locationsService.updateLocationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
