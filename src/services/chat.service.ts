/**
 * Phase 7 — Conversational AI Chatbot & RAG service (`phase7_api_doc.md`).
 *
 * Thin wrappers over `apiClient` for the CRUD/usage endpoints, plus a bespoke
 * `fetch()` + `ReadableStream` SSE engine for the Step-2 streaming endpoint
 * (EventSource cannot send the `Authorization` header the backend requires).
 */
import { apiClient, API_BASE_URL } from '@/lib/http/client';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import { getAccessToken } from '@/store/authStore';
import type {
  ChatStreamEvent,
  ConversationDetail,
  IChatUsage,
  IConversation,
  PostMessageResult,
  RagUploadResult,
  ToolInvocation,
} from '@/types/phase7-chat';

/** Upload guardrails mirrored from the backend (PDF/TXT, 10MB). */
export const RAG_ACCEPTED_MIME = ['application/pdf', 'text/plain'] as const;
export const RAG_ACCEPTED_EXT = ['.pdf', '.txt'] as const;
export const RAG_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export interface ConversationListParams {
  page?: number;
  limit?: number;
}

export interface ConversationMessagesParams {
  page?: number;
  limit?: number;
}

export async function createConversation(): Promise<IConversation> {
  const response = await apiClient.post('/chat/conversations', {});
  return normalizeSingleResponse<IConversation>(response, 'conversation');
}

export async function listConversations(
  params?: ConversationListParams
): Promise<Phase1ListResult<IConversation>> {
  const response = await apiClient.get('/chat/conversations', { params });
  return normalizeListResponse<IConversation>(response, 'conversations');
}

/**
 * Conversation metadata + a page of messages. Messages are returned
 * chronologically ascending (oldest-first); page 1 is the start of the thread.
 */
export async function getConversation(
  conversationId: string,
  params?: ConversationMessagesParams
): Promise<ConversationDetail> {
  const response = await apiClient.get(
    `/chat/conversations/${encodeURIComponent(conversationId)}`,
    { params }
  );
  const bag = (response.data?.data ?? {}) as Partial<ConversationDetail>;
  return {
    conversation: bag.conversation as ConversationDetail['conversation'],
    messages: Array.isArray(bag.messages) ? bag.messages : [],
    pagination:
      bag.pagination ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? 50,
        totalPages: 1,
        totalResults: Array.isArray(bag.messages) ? bag.messages.length : 0,
      },
  };
}

export async function renameConversation(
  conversationId: string,
  title: string
): Promise<IConversation> {
  const response = await apiClient.patch(
    `/chat/conversations/${encodeURIComponent(conversationId)}`,
    { title }
  );
  return normalizeSingleResponse<IConversation>(response, 'conversation');
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await apiClient.delete(`/chat/conversations/${encodeURIComponent(conversationId)}`);
}

/** Step 1: persist the user message as `pending`. Does NOT run the agent. */
export async function postMessage(
  conversationId: string,
  content: string
): Promise<PostMessageResult> {
  const response = await apiClient.post(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    { content }
  );
  const bag = (response.data?.data ?? {}) as Partial<PostMessageResult>;
  return {
    messageId: bag.messageId ?? '',
    conversationId: bag.conversationId ?? conversationId,
  };
}

/** Client-side validation mirroring backend magic-byte/size guards. */
export function validateRagFile(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const extOk = RAG_ACCEPTED_EXT.some((ext) => lowerName.endsWith(ext));
  const mimeOk = (RAG_ACCEPTED_MIME as readonly string[]).includes(file.type) || file.type === '';
  if (!extOk || !mimeOk) return 'unsupportedType';
  if (file.size > RAG_MAX_BYTES) return 'tooLarge';
  return null;
}

export async function uploadRagFile(
  conversationId: string,
  file: File
): Promise<RagUploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  const response = await apiClient.post(
    `/chat/conversations/${encodeURIComponent(conversationId)}/upload`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  const bag = (response.data?.data ?? {}) as Partial<RagUploadResult>;
  return {
    chunksCreated: bag.chunksCreated ?? 0,
    fileName: bag.fileName ?? file.name,
    fileUrl: bag.fileUrl ?? '',
  };
}

export async function getUsage(): Promise<IChatUsage> {
  const response = await apiClient.get('/chat/usage');
  return (response.data?.data ?? {}) as IChatUsage;
}

/** Error thrown by `streamConversation` for non-OK HTTP responses (e.g. 400/409). */
export class ChatStreamError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatStreamError';
    this.status = status;
  }
}

export interface StreamHandlers {
  onToken: (token: string) => void;
  onToolCall: (tool: { toolCall: string; label: string }) => void;
  onDone: (payload: { messageId: string; toolsInvoked?: ToolInvocation[] }) => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

/**
 * Step 2: open the SSE stream and dispatch parsed events to handlers.
 *
 * Uses `fetch()` + `ReadableStream` + `TextDecoder` (never EventSource) so the
 * JWT travels in the `Authorization` header. The parser buffers partial chunks,
 * splits complete events on the SSE `\n\n` delimiter, and reads only `data:`
 * lines — tolerating multiple events per chunk and events split across reads.
 *
 * Resolves when the stream ends (after `done`/`error` or natural close).
 * Throws `ChatStreamError` for non-OK responses (400 no-pending, 409 conflict).
 */
export async function streamConversation(
  conversationId: string,
  handlers: StreamHandlers
): Promise<void> {
  const token = getAccessToken();
  const url = `${API_BASE_URL}/chat/conversations/${encodeURIComponent(conversationId)}/stream`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: handlers.signal,
  });

  if (!response.ok) {
    let message = `Stream failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message && typeof body.message === 'string') message = body.message;
    } catch {
      /* non-JSON error body — keep default */
    }
    throw new ChatStreamError(message, response.status);
  }

  if (!response.body) {
    throw new ChatStreamError('Stream produced no body', 0);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (rawEvent: string) => {
    // An SSE event is one or more lines; collect the `data:` payloads.
    const dataLines: string[] = [];
    for (const line of rawEvent.split('\n')) {
      const trimmed = line.replace(/\r$/, '');
      if (trimmed.startsWith('data:')) {
        dataLines.push(trimmed.slice(5).trimStart());
      }
    }
    if (dataLines.length === 0) return;
    const payload = dataLines.join('\n');
    if (!payload) return;

    let event: ChatStreamEvent;
    try {
      event = JSON.parse(payload) as ChatStreamEvent;
    } catch {
      return; // ignore unparseable keep-alive/comment frames
    }

    if ('token' in event) {
      handlers.onToken(event.token);
    } else if ('toolCall' in event) {
      handlers.onToolCall({ toolCall: event.toolCall, label: event.label });
    } else if ('done' in event) {
      handlers.onDone({ messageId: event.messageId, toolsInvoked: event.toolsInvoked });
    } else if ('error' in event) {
      handlers.onError(event.error);
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIndex: number;
    // Process every complete event (delimited by a blank line) in the buffer.
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);
      if (rawEvent.trim()) dispatch(rawEvent);
    }
  }

  // Flush any trailing event that arrived without a final delimiter.
  const tail = (buffer + decoder.decode()).trim();
  if (tail) dispatch(tail);
}
