import { useCallback, useRef, useState } from 'react';
import * as chatService from '@/services/chat.service';
import { ChatStreamError } from '@/services/chat.service';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IChatMessage, ToolInvocation } from '@/types/phase7-chat';

/** ~5s before the backend's 120s hard timeout, surface a "still working" hint. */
const LONG_RUNNING_MS = 115_000;

export type StreamErrorKind = 'conflict' | 'noPending' | 'timeout' | 'generic';

export interface StreamError {
  kind: StreamErrorKind;
  message: string;
}

interface OptimisticUser {
  id: string;
  content: string;
  status: 'pending' | 'failed';
  createdAt: string;
}

interface StreamedAssistant {
  content: string;
  messageId?: string;
}

export interface UseChatStreamOptions {
  /** Current active conversation id (undefined → auto-create on first send). */
  conversationId: string | undefined;
  /** Create a new conversation, switch to it, and return its id (ChatGPT-style). */
  onAutoCreate: () => Promise<string>;
  /** Invalidate conversation detail + usage caches after a successful turn. */
  onAfterDone: () => void;
  /** Refresh the conversation list (e.g. after auto-title on first message). */
  onAfterFirstMessage?: () => void;
}

/**
 * Owns the imperative Step1 (POST message) → Step2 (SSE stream) lifecycle plus
 * optimistic UI, tool-call labels, long-running detection, and error recovery.
 * React Query owns the persisted history; this hook only holds in-flight state.
 */
export function useChatStream(options: UseChatStreamOptions) {
  const { conversationId, onAutoCreate, onAfterDone, onAfterFirstMessage } = options;

  const [pendingUser, setPendingUser] = useState<OptimisticUser | null>(null);
  const [streamingAssistant, setStreamingAssistant] = useState<StreamedAssistant | null>(null);
  const [activeTools, setActiveTools] = useState<ToolInvocation[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [streamError, setStreamError] = useState<StreamError | null>(null);
  const [showLongRunning, setShowLongRunning] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const longRunTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The conversation id whose stream is currently in flight (for retry).
  const streamingConvId = useRef<string | undefined>(undefined);

  const clearTimers = useCallback(() => {
    if (longRunTimer.current) {
      clearTimeout(longRunTimer.current);
      longRunTimer.current = null;
    }
    setShowLongRunning(false);
  }, []);

  /** Open the SSE stream for a conversation and pump tokens into local state. */
  const runStream = useCallback(
    async (convId: string) => {
      streamingConvId.current = convId;
      setStreamError(null);
      setStreamingAssistant({ content: '' });
      setActiveTools([]);
      setIsBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      clearTimers();
      longRunTimer.current = setTimeout(() => setShowLongRunning(true), LONG_RUNNING_MS);

      try {
        await chatService.streamConversation(convId, {
          signal: controller.signal,
          onToken: (token) =>
            setStreamingAssistant((prev) => ({
              messageId: prev?.messageId,
              content: (prev?.content ?? '') + token,
            })),
          onToolCall: ({ toolCall, label }) =>
            setActiveTools((prev) => [
              ...prev,
              { toolName: toolCall, label, executedAt: new Date().toISOString() },
            ]),
          onDone: ({ messageId }) => {
            setStreamingAssistant((prev) => ({ content: prev?.content ?? '', messageId }));
            setPendingUser((prev) => (prev ? { ...prev, status: 'pending' } : prev));
            onAfterDone();
          },
          onError: (message) => {
            setStreamError({ kind: 'generic', message });
            setStreamingAssistant(null);
            setActiveTools([]);
          },
        });
      } catch (err) {
        if (controller.signal.aborted) {
          // User-initiated cancel or unmount — drop silently.
          setStreamingAssistant(null);
          setActiveTools([]);
        } else if (err instanceof ChatStreamError) {
          if (err.status === 409) {
            setStreamError({ kind: 'conflict', message: err.message });
          } else if (err.status === 400) {
            setStreamError({ kind: 'noPending', message: err.message });
          } else {
            setStreamError({ kind: 'generic', message: err.message });
          }
          setStreamingAssistant(null);
          setActiveTools([]);
        } else {
          setStreamError({ kind: 'generic', message: getApiErrorMessage(err) });
          setStreamingAssistant(null);
          setActiveTools([]);
        }
      } finally {
        setIsBusy(false);
        clearTimers();
        abortRef.current = null;
      }
    },
    [clearTimers, onAfterDone]
  );

  /** Full send: optimistic user bubble → Step 1 → Step 2. Auto-creates a thread. */
  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isBusy) return;

      setStreamError(null);
      setIsBusy(true);

      let convId = conversationId;
      const optimistic: OptimisticUser = {
        id: `optimistic-${Date.now()}`,
        content: trimmed,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setPendingUser(optimistic);

      try {
        if (!convId) {
          convId = await onAutoCreate();
        }
        const wasFirstMessage = true;
        await chatService.postMessage(convId, trimmed);
        if (wasFirstMessage) onAfterFirstMessage?.();
      } catch (err) {
        setPendingUser({ ...optimistic, status: 'failed' });
        setStreamError({ kind: 'generic', message: getApiErrorMessage(err) });
        setIsBusy(false);
        return;
      }

      await runStream(convId);
    },
    [conversationId, isBusy, onAutoCreate, onAfterFirstMessage, runStream]
  );

  /** Retry: reopen `/stream` (backend rolled the message back to `pending`). */
  const retryStream = useCallback(async () => {
    const convId = streamingConvId.current ?? conversationId;
    if (!convId || isBusy) return;
    setPendingUser((prev) => (prev ? { ...prev, status: 'pending' } : prev));
    await runStream(convId);
  }, [conversationId, isBusy, runStream]);

  /** Abort the in-flight stream (server rolls the message back to `pending`). */
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearTimers();
    setIsBusy(false);
  }, [clearTimers]);

  /** Drop optimistic state once the server history includes the finished pair. */
  const reconcile = useCallback(
    (serverMessages: IChatMessage[]) => {
      const doneId = streamingAssistant?.messageId;
      if (!doneId) return;
      if (serverMessages.some((m) => m._id === doneId)) {
        setStreamingAssistant(null);
        setPendingUser(null);
        setActiveTools([]);
      }
    },
    [streamingAssistant?.messageId]
  );

  /** Reset all in-flight state — call when switching conversations. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearTimers();
    setPendingUser(null);
    setStreamingAssistant(null);
    setActiveTools([]);
    setStreamError(null);
    setIsBusy(false);
  }, [clearTimers]);

  const dismissError = useCallback(() => setStreamError(null), []);

  return {
    pendingUser,
    streamingAssistant,
    activeTools,
    isBusy,
    streamError,
    showLongRunning,
    send,
    retryStream,
    cancel,
    reconcile,
    reset,
    dismissError,
  };
}
