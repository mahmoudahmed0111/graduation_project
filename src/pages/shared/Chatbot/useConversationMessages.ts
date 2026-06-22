import { useCallback, useEffect, useRef, useState } from 'react';
import * as chatService from '@/services/chat.service';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IChatMessage, IConversation } from '@/types/phase7-chat';

const PAGE_LIMIT = 50;

/** Merge two message arrays, dedupe by `_id`, sort chronologically ascending. */
function mergeSorted(a: IChatMessage[], b: IChatMessage[]): IChatMessage[] {
  const map = new Map<string, IChatMessage>();
  for (const m of [...a, ...b]) map.set(m._id, m);
  return Array.from(map.values()).sort(
    (x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime()
  );
}

/**
 * Loads a conversation's messages honoring the backend's oldest-first paging
 * (page 1 = oldest, highest page = newest). We anchor on the newest page so the
 * latest turn sits at the bottom, and "load older" walks pages downward toward
 * page 1, prepending and de-duplicating as it goes.
 */
export function useConversationMessages(conversationId: string | undefined) {
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [lowestPage, setLowestPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const reqRef = useRef(0);

  const reloadNewest = useCallback(async () => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setLowestPage(1);
      return;
    }
    const token = ++reqRef.current;
    setLoading(true);
    setError(null);
    try {
      const first = await chatService.getConversation(conversationId, {
        page: 1,
        limit: PAGE_LIMIT,
      });
      const total = first.pagination.totalPages || 1;
      let page = first;
      if (total > 1) {
        page = await chatService.getConversation(conversationId, {
          page: total,
          limit: PAGE_LIMIT,
        });
      }
      if (token !== reqRef.current) return; // stale (conversation switched)
      setConversation(page.conversation ?? first.conversation ?? null);
      setMessages(mergeSorted([], page.messages));
      setLowestPage(total);
    } catch (err) {
      if (token !== reqRef.current) return;
      setError(getApiErrorMessage(err));
      setConversation(null);
      setMessages([]);
    } finally {
      if (token === reqRef.current) setLoading(false);
    }
  }, [conversationId]);

  const loadOlder = useCallback(async () => {
    if (!conversationId || lowestPage <= 1 || loadingOlder) return;
    const target = lowestPage - 1;
    setLoadingOlder(true);
    try {
      const data = await chatService.getConversation(conversationId, {
        page: target,
        limit: PAGE_LIMIT,
      });
      setMessages((prev) => mergeSorted(data.messages, prev));
      setLowestPage(target);
    } catch {
      /* surfaced elsewhere; keep current view */
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, lowestPage, loadingOlder]);

  useEffect(() => {
    void reloadNewest();
  }, [reloadNewest]);

  return {
    conversation,
    messages,
    loading,
    loadingOlder,
    canLoadOlder: lowestPage > 1,
    error,
    reloadNewest,
    loadOlder,
  };
}
