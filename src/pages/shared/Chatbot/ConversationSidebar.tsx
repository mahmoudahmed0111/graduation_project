import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  Database,
  Lock,
} from 'lucide-react';
import { Button, EmptyState, ConfirmDialog, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/utils/formatters';
import type { IConversation } from '@/types/phase7-chat';

interface ConversationSidebarProps {
  conversations: IConversation[];
  isLoading: boolean;
  activeId: string | undefined;
  creating: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  deleting: boolean;
}

export function ConversationSidebar({
  conversations,
  isLoading,
  activeId,
  creating,
  onSelect,
  onNew,
  onRename,
  onDelete,
  deleting,
}: ConversationSidebarProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEdit = (conv: IConversation) => {
    setEditingId(conv._id);
    setDraftTitle(conv.title);
  };

  const commitEdit = async () => {
    const title = draftTitle.trim();
    if (editingId && title) {
      await onRename(editingId, title.slice(0, 100));
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          variant="primary"
          onClick={onNew}
          isLoading={creating}
          className="w-full justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('shared.chatbot.newChat')}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar px-2 pb-3">
        {isLoading ? (
          <div className="space-y-2 px-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            variant="bare"
            icon={MessageSquare}
            title={t('shared.chatbot.noConversations')}
            description={t('shared.chatbot.noConversationsHint')}
            className="py-10"
          />
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => {
              const isActive = conv._id === activeId;
              const isEditing = editingId === conv._id;
              return (
                <li key={conv._id}>
                  <div
                    className={cn(
                      'group relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-dark-surface-2'
                    )}
                  >
                    {isEditing ? (
                      <div className="flex w-full items-center gap-1.5">
                        <input
                          autoFocus
                          value={draftTitle}
                          maxLength={100}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void commitEdit();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="min-w-0 flex-1 rounded-md border border-primary-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-200 dark:border-dark-border dark:bg-dark-surface"
                        />
                        <button
                          type="button"
                          onClick={() => void commitEdit()}
                          className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/15"
                          title={t('common.save')}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface"
                          title={t('common.cancel')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelect(conv._id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-start"
                        >
                          <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-70" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{conv.title}</span>
                            <span className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-slate-500">
                              {formatTimeAgo(conv.updatedAt)}
                              {conv.hasRagContext && (
                                <Database className="h-3 w-3 text-accent-500" />
                              )}
                              {conv.isSealed && <Lock className="h-3 w-3" />}
                            </span>
                          </span>
                        </button>
                        <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEdit(conv)}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-dark-surface"
                            title={t('shared.chatbot.rename')}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(conv._id)}
                            className="rounded-md p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/15"
                            title={t('shared.chatbot.delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="border-t border-gray-200 px-3 py-2 text-[11px] text-gray-400 dark:border-dark-border dark:text-slate-500">
          <Badge tone="neutral" size="sm">
            {t('shared.chatbot.conversationCount', { count: conversations.length })}
          </Badge>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId) await onDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        title={t('shared.chatbot.deleteTitle')}
        message={t('shared.chatbot.deleteConfirm')}
        confirmText={t('shared.chatbot.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
