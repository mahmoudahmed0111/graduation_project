/**
 * Phase 7 — Conversational AI Chatbot React Query hooks (`phase7_api_doc.md`).
 *
 * Streaming is intentionally NOT modelled here — it is imperative and lives in
 * `useChatStream`. These hooks cover the cacheable CRUD + usage surface only.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as chatService from '@/services/chat.service';
import type {
  ConversationListParams,
  ConversationMessagesParams,
} from '@/services/chat.service';

/** Centralized query-key builders. All cache invalidation MUST use these. */
export const phase7ChatKeys = {
  all: ['phase7', 'chat'] as const,
  conversations: (params?: ConversationListParams) =>
    [...phase7ChatKeys.all, 'conversations', params ?? {}] as const,
  conversation: (id: string, params?: ConversationMessagesParams) =>
    [...phase7ChatKeys.all, 'conversation', id, params ?? {}] as const,
  usage: () => [...phase7ChatKeys.all, 'usage'] as const,
};

export function useConversations(params?: ConversationListParams) {
  return useQuery({
    queryKey: phase7ChatKeys.conversations(params),
    queryFn: () => chatService.listConversations(params),
  });
}

export function useConversation(
  conversationId: string | undefined,
  params?: ConversationMessagesParams
) {
  return useQuery({
    queryKey: phase7ChatKeys.conversation(conversationId ?? '', params),
    queryFn: () => chatService.getConversation(conversationId!, params),
    enabled: Boolean(conversationId),
  });
}

export function useChatUsage() {
  return useQuery({
    queryKey: phase7ChatKeys.usage(),
    queryFn: () => chatService.getUsage(),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => chatService.createConversation(),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...phase7ChatKeys.all, 'conversations'] }),
  });
}

export function useRenameConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      chatService.renameConversation(id, title),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: [...phase7ChatKeys.all, 'conversations'] });
      void qc.invalidateQueries({ queryKey: [...phase7ChatKeys.all, 'conversation', vars.id] });
    },
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: [...phase7ChatKeys.all, 'conversations'] }),
  });
}

export function useUploadRagFile(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => chatService.uploadRagFile(conversationId, file),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: [...phase7ChatKeys.all, 'conversation', conversationId],
      }),
  });
}
