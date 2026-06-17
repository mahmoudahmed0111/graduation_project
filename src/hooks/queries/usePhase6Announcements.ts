import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as announcementsService from '@/services/announcements.service';
import type { AnnouncementListParams } from '@/services/announcements.service';
import type { CreateAnnouncementBody } from '@/types/phase6';

const root = ['phase6', 'announcements'] as const;

export const announcementsQueryKey = (params?: AnnouncementListParams) =>
  [...root, 'list', params ?? {}] as const;
export const announcementQueryKey = (id: string) => [...root, 'detail', id] as const;

export function useAnnouncements(params?: AnnouncementListParams) {
  return useQuery({
    queryKey: announcementsQueryKey(params),
    queryFn: () => announcementsService.listAnnouncements(params),
  });
}

export function useAnnouncement(id: string | undefined) {
  return useQuery({
    queryKey: announcementQueryKey(id ?? ''),
    queryFn: () => announcementsService.getAnnouncement(id!),
    enabled: Boolean(id),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAnnouncementBody) => announcementsService.createAnnouncement(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'list'] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsService.deleteAnnouncement(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...root, 'list'] }),
  });
}

/** Invalidate the announcements list — called by the realtime layer on a
 *  `new_announcement` socket event so the list refreshes live. */
export function useInvalidateAnnouncements() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: [...root, 'list'] });
}
