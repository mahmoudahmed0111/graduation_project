import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as settingsService from '@/services/settings.service';
import { mapSettingsFromApi } from '@/lib/mapSystemSettings';
import type { ISystemSettings } from '@/types';

export const SETTINGS_QUERY_KEY = ['phase1', 'settings'] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async (): Promise<ISystemSettings> => {
      const raw = await settingsService.getSettings();
      return mapSettingsFromApi(raw);
    },
  });
}

export type PatchSettingsPayload = Parameters<typeof settingsService.updateSettings>[0];

export function usePatchSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PatchSettingsPayload) => settingsService.updateSettings(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}
