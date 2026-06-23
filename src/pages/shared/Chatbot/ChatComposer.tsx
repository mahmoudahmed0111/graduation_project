import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Paperclip, Loader2, Lock, FileText, X, Database } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { formatFileSize } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { validateRagFile, RAG_MAX_BYTES } from '@/services/chat.service';
import type { RagUploadResult } from '@/types/phase7-chat';

interface ChatComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  sealed: boolean;
  hasRagContext: boolean;
  onUpload: (file: File) => Promise<RagUploadResult | undefined>;
  uploading: boolean;
}

const MAX_LEN = 4000;

export function ChatComposer({
  value,
  onChange,
  onSend,
  busy,
  sealed,
  hasRagContext,
  onUpload,
  uploading,
}: ChatComposerProps) {
  const { t } = useTranslation();
  const { error: showError, success } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastUpload, setLastUpload] = useState<RagUploadResult | null>(null);

  // Auto-grow the textarea up to a cap.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    const problem = validateRagFile(file);
    if (problem === 'unsupportedType') {
      showError(t('shared.chatbot.uploadBadType'));
      return;
    }
    if (problem === 'tooLarge') {
      showError(t('shared.chatbot.uploadTooLarge', { max: formatFileSize(RAG_MAX_BYTES) }));
      return;
    }

    const result = await onUpload(file);
    if (result) {
      setLastUpload(result);
      success(t('shared.chatbot.uploadSuccess', { count: result.chunksCreated }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!busy && !sealed) onSend();
    }
  };

  if (sealed) {
    return (
      <div className="px-4 pb-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-dark-surface-2 dark:text-slate-300">
          <Lock className="h-4 w-4" />
          {t('shared.chatbot.sealedNotice')}
        </div>
      </div>
    );
  }

  const overLimit = value.length > MAX_LEN;
  const canSend = Boolean(value.trim()) && !busy && !overLimit;

  return (
    <div className="px-4 pb-3 sm:px-6 sm:pb-4">
      <div className="mx-auto w-full max-w-3xl">
        {/* RAG context / last upload indicator */}
        {(hasRagContext || lastUpload) && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {hasRagContext && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
                <Database className="h-3 w-3" />
                {t('shared.chatbot.knowledgeBaseAttached')}
              </span>
            )}
            {lastUpload && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600 dark:bg-dark-surface-2 dark:text-slate-300">
                <FileText className="h-3 w-3" />
                {lastUpload.fileName}
                <button
                  type="button"
                  onClick={() => setLastUpload(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Floating rounded input shell */}
        <div
          className={cn(
            'flex items-end gap-2 rounded-3xl border bg-white px-2.5 py-2 shadow-card transition-colors dark:bg-dark-surface',
            overLimit
              ? 'border-red-300 dark:border-red-500/50'
              : 'border-gray-200 focus-within:border-primary-400 dark:border-dark-border dark:focus-within:border-accent-400/60'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,text/plain,.pdf,.txt"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || uploading}
            title={t('shared.chatbot.attachRag')}
            aria-label={t('shared.chatbot.attachRag')}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-dark-surface-2"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            placeholder={t('shared.chatbot.inputPlaceholder')}
            aria-label={t('shared.chatbot.inputPlaceholder')}
            className="thin-scrollbar max-h-[200px] min-h-[36px] flex-1 resize-none border-0 bg-transparent py-1.5 text-sm leading-relaxed text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          <button
            type="button"
            onClick={onSend}
            disabled={!canSend}
            title={t('shared.chatbot.send')}
            aria-label={t('shared.chatbot.send')}
            className={cn(
              'grid h-9 w-9 flex-shrink-0 place-items-center rounded-full transition-colors',
              canSend
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 dark:bg-dark-surface-2 dark:text-slate-500'
            )}
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-gray-400 dark:text-slate-500">
          <span>{t('shared.chatbot.disclaimer')}</span>
          <span className={cn(overLimit && 'font-semibold text-red-500')}>
            {value.length}/{MAX_LEN}
          </span>
        </div>
      </div>
    </div>
  );
}
