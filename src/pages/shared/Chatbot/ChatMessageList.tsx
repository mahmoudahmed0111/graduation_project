import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronUp,
  Wrench,
  Sparkles,
  Bot,
  Copy,
  Check,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { MessageContent } from '@/components/chat/MessageContent';
import type { ChatMessageStatus, ToolInvocation } from '@/types/phase7-chat';
import type { StreamError } from './useChatStream';

export interface ChatViewMessage {
  key: string;
  role: 'user' | 'assistant';
  content: string;
  status: ChatMessageStatus;
  createdAt?: string;
  toolsInvoked?: ToolInvocation[];
  /** True for the live, in-progress assistant bubble. */
  streaming?: boolean;
  /** Tool-call chips to show while streaming. */
  activeTools?: ToolInvocation[];
}

interface ChatMessageListProps {
  messages: ChatViewMessage[];
  canLoadOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  streamError: StreamError | null;
  onRetry: () => void;
  onDismissError: () => void;
  showLongRunning: boolean;
  onCancel: () => void;
  isStreaming: boolean;
  emptySlot?: React.ReactNode;
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Copy-to-clipboard affordance shown on completed assistant turns (ChatGPT-style). */
function CopyButton({ text }: { text: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? t('shared.chatbot.copied') : t('shared.chatbot.copy')}
      aria-label={copied ? t('shared.chatbot.copied') : t('shared.chatbot.copy')}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-surface-2 dark:hover:text-slate-200"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

/** Brand avatar for assistant turns. */
function AssistantAvatar() {
  return (
    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-sm dark:from-primary-500 dark:to-accent-500">
      <Bot className="h-4 w-4" />
    </span>
  );
}

export function ChatMessageList({
  messages,
  canLoadOlder,
  loadingOlder,
  onLoadOlder,
  streamError,
  onRetry,
  onDismissError,
  showLongRunning,
  onCancel,
  isStreaming,
  emptySlot,
}: ChatMessageListProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to newest content as messages or the streaming buffer grow.
  const scrollKey =
    messages.length +
    ':' +
    (messages[messages.length - 1]?.content.length ?? 0) +
    ':' +
    (streamError ? 'e' : '') +
    (showLongRunning ? 'l' : '');
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scrollKey]);

  const hasContent = messages.length > 0;

  if (!hasContent && !isStreaming) {
    return <div className="flex-1 overflow-y-auto thin-scrollbar">{emptySlot}</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto thin-scrollbar">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {canLoadOlder && (
          <div className="mb-6 flex justify-center">
            <Button variant="ghost" size="sm" onClick={onLoadOlder} isLoading={loadingOlder} className="gap-1.5">
              <ChevronUp className="h-4 w-4" />
              {t('shared.chatbot.loadOlder')}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            const isFailed = message.status === 'failed';

            if (isUser) {
              return (
                <div key={message.key} className="flex justify-end">
                  <div className="flex max-w-[85%] flex-col items-end gap-1">
                    <div
                      className={cn(
                        'rounded-3xl rounded-ee-md px-4 py-2.5 text-sm leading-relaxed',
                        isFailed
                          ? 'border border-red-200 bg-red-50 text-gray-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-slate-100'
                          : 'bg-gray-100 text-gray-900 dark:bg-dark-surface-2 dark:text-slate-100'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 px-1 text-[11px] text-gray-400 dark:text-slate-500">
                      {message.status === 'pending' && !message.streaming && (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {t('shared.chatbot.sending')}
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          {t('shared.chatbot.messageFailed')}
                        </span>
                      )}
                      {message.createdAt && <span>{formatTime(message.createdAt)}</span>}
                    </div>
                  </div>
                </div>
              );
            }

            // Assistant turn — avatar + full-width content, no bubble (ChatGPT style).
            const tools = message.activeTools ?? message.toolsInvoked ?? [];
            return (
              <div key={message.key} className="flex gap-3 sm:gap-4">
                <AssistantAvatar />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('shared.chatbot.assistantName')}
                    </span>
                    {message.createdAt && (
                      <span className="text-[11px] text-gray-400 dark:text-slate-500">
                        {formatTime(message.createdAt)}
                      </span>
                    )}
                  </div>

                  {tools.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {tools.map((tool, i) => (
                        <Badge key={`${tool.toolName}-${i}`} tone="brand" size="sm" variant="subtle">
                          <Wrench className="h-3 w-3" />
                          {tool.label || tool.toolName}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-gray-800 dark:text-slate-100">
                    {message.content ? (
                      <div className="flex flex-col">
                        <MessageContent content={message.content} />
                        {message.streaming && (
                          <span className="ms-0.5 mt-0.5 inline-block h-4 w-1.5 animate-pulse rounded-full bg-primary-400 align-middle" />
                        )}
                      </div>
                    ) : message.streaming ? (
                      <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('shared.chatbot.thinking')}
                      </span>
                    ) : null}
                  </div>

                  {/* Hover actions on settled assistant turns */}
                  {!message.streaming && message.content && (
                    <div className="mt-1.5">
                      <CopyButton text={message.content} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Long-running hint */}
          {showLongRunning && isStreaming && (
            <div className="flex items-center justify-center gap-3 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <Sparkles className="h-4 w-4" />
              {t('shared.chatbot.stillWorking')}
              <button
                type="button"
                onClick={onCancel}
                className="font-semibold underline underline-offset-2"
              >
                {t('shared.chatbot.cancel')}
              </button>
            </div>
          )}

          {/* Stream error banner with recovery action */}
          {streamError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-700 dark:text-red-300">
                  {streamError.kind === 'conflict'
                    ? t('shared.chatbot.errorConflict')
                    : streamError.kind === 'noPending'
                      ? t('shared.chatbot.errorNoPending')
                      : t('shared.chatbot.errorGeneric')}
                </p>
                <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-300/70">
                  {streamError.message}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {streamError.kind !== 'noPending' && (
                    <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      {t('shared.chatbot.retry')}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={onDismissError} className="gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    {t('shared.chatbot.dismiss')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
