/**
 * Phase 7 — Conversational AI Chatbot & RAG Engine types (`phase7_api_doc.md`).
 */

export type ChatMessageRole = 'user' | 'assistant';

export type ChatMessageStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Pillar the agent routed the request through. */
export type ChatPillar = 'general' | 'tools' | 'rag' | string;

/** A single tool invocation recorded on an assistant message. */
export interface ToolInvocation {
  toolName: string;
  label: string;
  executedAt?: string;
}

export interface ChatTokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

/** A conversation thread owned by the current user. */
export interface IConversation {
  _id: string;
  user_id?: string;
  college_id?: string | null;
  title: string;
  contextSummary?: string | null;
  summarizationCycles?: number;
  isSealed: boolean;
  totalTokensUsed: number;
  messageCount: number;
  hasRagContext: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A persisted chat message document. */
export interface IChatMessage {
  _id: string;
  conversation_id: string;
  user_id?: string;
  role: ChatMessageRole;
  content: string;
  status: ChatMessageStatus;
  pillarUsed?: ChatPillar;
  toolsInvoked?: ToolInvocation[];
  tokensUsed?: ChatTokenUsage;
  createdAt: string;
}

/** Pagination block returned by `GET /chat/conversations/:id`. */
export interface ChatPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/** Full payload of `GET /chat/conversations/:id`. */
export interface ConversationDetail {
  conversation: IConversation;
  messages: IChatMessage[];
  pagination: ChatPagination;
}

/** `GET /chat/usage` payload. */
export interface IChatUsage {
  monthYear: string;
  tokensUsed: number;
  tokenLimit: number;
  isUnlimited: boolean;
  percentageUsed: number;
  remainingTokens: number;
}

/** `POST /chat/conversations/:id/upload` result. */
export interface RagUploadResult {
  chunksCreated: number;
  fileName: string;
  fileUrl: string;
}

/** `POST /chat/conversations/:id/messages` (Step 1) result. */
export interface PostMessageResult {
  messageId: string;
  conversationId: string;
}

/**
 * SSE event contract emitted by `GET /chat/conversations/:id/stream` (Step 2).
 * Each `data:` JSON block matches exactly one of these shapes.
 */
export type ChatStreamEvent =
  | { token: string }
  | { toolCall: string; label: string }
  | { done: true; messageId: string; toolsInvoked?: ToolInvocation[] }
  | { error: string };
