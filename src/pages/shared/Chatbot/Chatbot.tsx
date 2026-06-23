import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Menu, Database, Lock, PanelLeftClose, FileText } from 'lucide-react';
import { Badge, IconButton } from '@/components/ui';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import * as chatService from '@/services/chat.service';
import {
  useChatUsage,
  useConversations,
  useCreateConversation,
  useDeleteConversation,
  useRenameConversation,
} from '@/hooks/queries';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatMessageList, type ChatViewMessage } from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { UsageMeter } from './UsageMeter';
import { useChatStream } from './useChatStream';
import { useConversationMessages } from './useConversationMessages';
import type { RagUploadResult } from '@/types/phase7-chat';

export function Chatbot() {
  const { t } = useTranslation();
  const { error: showError } = useToastStore();

  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Session-scoped record of documents uploaded per conversation. The backend
  // doesn't persist file names in history, so we surface them locally to make
  // it unmistakable which documents are attached to the active conversation.
  const [attachedDocs, setAttachedDocs] = useState<Record<string, string[]>>({});

  const conversationsQuery = useConversations();
  const usageQuery = useChatUsage();
  const createConv = useCreateConversation();
  const renameConv = useRenameConversation();
  const deleteConv = useDeleteConversation();

  const conversations = conversationsQuery.data?.items ?? [];

  const {
    conversation,
    messages,
    loading: messagesLoading,
    loadingOlder,
    canLoadOlder,
    reloadNewest,
    loadOlder,
  } = useConversationMessages(activeId);

  const stream = useChatStream({
    conversationId: activeId,
    onAutoCreate: async () => {
      const conv = await createConv.mutateAsync();
      setActiveId(conv._id);
      return conv._id;
    },
    onAfterDone: () => {
      void reloadNewest();
      void usageQuery.refetch();
    },
    onAfterFirstMessage: () => {
      void conversationsQuery.refetch();
    },
  });

  // Reset in-flight stream state whenever the active conversation changes.
  useEffect(() => {
    stream.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Hand optimistic state back to the stream hook once the server catches up.
  useEffect(() => {
    stream.reconcile(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    setInput('');
    setSidebarOpen(false);
  };

  const handleNew = async () => {
    try {
      const conv = await createConv.mutateAsync();
      setActiveId(conv._id);
      setInput('');
      setSidebarOpen(false);
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      await renameConv.mutateAsync({ id, title });
      if (id === activeId) void reloadNewest();
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConv.mutateAsync(id);
      if (id === activeId) {
        setActiveId(undefined);
      }
    } catch (err) {
      showError(getApiErrorMessage(err));
    }
  };

  const handleSend = () => {
    const content = input;
    setInput('');
    void stream.send(content);
  };

  const handleUpload = async (file: File): Promise<RagUploadResult | undefined> => {
    let id = activeId;
    setUploading(true);
    try {
      if (!id) {
        const conv = await createConv.mutateAsync();
        id = conv._id;
        setActiveId(id);
      }
      const result = await chatService.uploadRagFile(id, file);
      const convId = id;
      setAttachedDocs((prev) => {
        const existing = prev[convId] ?? [];
        if (existing.includes(result.fileName)) return prev;
        return { ...prev, [convId]: [...existing, result.fileName] };
      });
      void reloadNewest();
      void conversationsQuery.refetch();
      return result;
    } catch (err) {
      showError(getApiErrorMessage(err));
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  // Build the merged view: server history + optimistic user + streaming bubble.
  const viewMessages = useMemo<ChatViewMessage[]>(() => {
    const base: ChatViewMessage[] = messages.map((m) => ({
      key: m._id,
      role: m.role,
      content: m.content,
      status: m.status,
      createdAt: m.createdAt,
      toolsInvoked: m.toolsInvoked,
    }));

    if (stream.pendingUser) {
      base.push({
        key: stream.pendingUser.id,
        role: 'user',
        content: stream.pendingUser.content,
        status: stream.pendingUser.status,
        createdAt: stream.pendingUser.createdAt,
      });
    }

    if (stream.streamingAssistant) {
      base.push({
        key: 'streaming-assistant',
        role: 'assistant',
        content: stream.streamingAssistant.content,
        status: 'processing',
        streaming: true,
        activeTools: stream.activeTools.length ? stream.activeTools : undefined,
      });
    }

    return base;
  }, [messages, stream.pendingUser, stream.streamingAssistant, stream.activeTools]);

  const sealed = conversation?.isSealed ?? false;
  const hasRagContext = conversation?.hasRagContext ?? false;
  const currentDocs = activeId ? attachedDocs[activeId] ?? [] : [];

  const suggestions = [
    { label: t('shared.chatbot.checkGrades'), query: t('shared.chatbot.suggestGradeQuery') },
    { label: t('shared.chatbot.attendance'), query: t('shared.chatbot.suggestAttendanceQuery') },
    { label: t('shared.chatbot.schedule'), query: t('shared.chatbot.suggestScheduleQuery') },
    { label: t('shared.chatbot.gpa'), query: t('shared.chatbot.suggestGpaQuery') },
  ];

  const emptySlot = (
    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('shared.chatbot.greeting')}
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">
        {t('shared.chatbot.greetingHint')}
      </p>
      <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => void stream.send(s.query)}
            className="flex items-start gap-2.5 rounded-2xl border border-gray-200 p-3.5 text-start text-sm transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card dark:border-dark-border dark:hover:border-primary-500/40"
          >
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
            <span>
              <span className="block font-medium text-gray-900 dark:text-slate-100">{s.label}</span>
              <span className="block text-xs text-gray-500 dark:text-slate-400">{s.query}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-enter flex h-[calc(100vh-7rem)] min-h-[560px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card dark:border-dark-border dark:bg-dark-surface">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-72 flex-shrink-0 flex-col border-e border-gray-200 bg-gray-50/60 dark:border-dark-border dark:bg-dark-bg/40 lg:flex">
        <ConversationSidebar
          conversations={conversations}
          isLoading={conversationsQuery.isLoading}
          activeId={activeId}
          creating={createConv.isPending}
          onSelect={handleSelect}
          onNew={handleNew}
          onRename={handleRename}
          onDelete={handleDelete}
          deleting={deleteConv.isPending}
        />
      </aside>

      {/* Sidebar (mobile drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-backdrop-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-80 max-w-[85%] animate-enter bg-white shadow-elevated dark:bg-dark-surface">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-dark-border">
              <span className="text-sm font-semibold">{t('shared.chatbot.conversations')}</span>
              <IconButton aria-label={t('shared.chatbot.closeSidebar')} onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <ConversationSidebar
                conversations={conversations}
                isLoading={conversationsQuery.isLoading}
                activeId={activeId}
                creating={createConv.isPending}
                onSelect={handleSelect}
                onNew={handleNew}
                onRename={handleRename}
                onDelete={handleDelete}
                deleting={deleteConv.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Conversation pane */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Minimal top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-3 py-2.5 dark:border-dark-border sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <IconButton
              aria-label={t('shared.chatbot.toggleSidebar')}
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </IconButton>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900 dark:text-white">
                {conversation?.title ?? t('shared.chatbot.assistantName')}
              </p>
              <p className="hidden text-xs text-gray-500 dark:text-slate-400 sm:block">
                {t('shared.chatbot.alwaysHere')}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {hasRagContext && (
              <Badge tone="gold" size="sm">
                <Database className="h-3 w-3" />
                {t('shared.chatbot.knowledgeBaseAttached')}
              </Badge>
            )}
            {sealed && (
              <Badge tone="neutral" size="sm">
                <Lock className="h-3 w-3" />
                {t('shared.chatbot.sealed')}
              </Badge>
            )}
            <div className="hidden w-56 md:block">
              <UsageMeter usage={usageQuery.data} isLoading={usageQuery.isLoading} compact />
            </div>
          </div>
        </div>

        {/* Attached documents bar — makes RAG context tangible */}
        {(currentDocs.length > 0 || hasRagContext) && (
          <div className="flex flex-wrap items-center gap-2 border-b border-accent-200/60 bg-accent-50/60 px-4 py-2 dark:border-accent-500/20 dark:bg-accent-500/5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 dark:text-accent-300">
              <Database className="h-3.5 w-3.5" />
              {t('shared.chatbot.docsInConversation')}
            </span>
            {currentDocs.length > 0 ? (
              currentDocs.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] text-gray-700 ring-1 ring-accent-200 dark:bg-dark-surface dark:text-slate-200 dark:ring-accent-500/30"
                >
                  <FileText className="h-3 w-3 text-accent-600" />
                  {name}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {t('shared.chatbot.docsInConversationGeneric')}
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        {messagesLoading && messages.length === 0 ? (
          <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className={i % 2 === 0 ? 'flex justify-start' : 'flex justify-end'}>
                <div className="skeleton h-16 w-2/3 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <ChatMessageList
            messages={viewMessages}
            canLoadOlder={canLoadOlder}
            loadingOlder={loadingOlder}
            onLoadOlder={loadOlder}
            streamError={stream.streamError}
            onRetry={() => void stream.retryStream()}
            onDismissError={stream.dismissError}
            showLongRunning={stream.showLongRunning}
            onCancel={stream.cancel}
            isStreaming={stream.isBusy}
            emptySlot={emptySlot}
          />
        )}

        {/* Composer */}
        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={handleSend}
          busy={stream.isBusy}
          sealed={sealed}
          hasRagContext={hasRagContext}
          onUpload={handleUpload}
          uploading={uploading}
        />
      </section>
    </div>
  );
}
