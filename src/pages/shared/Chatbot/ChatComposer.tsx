import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Loader2, Lock, FileText, X, Database } from 'lucide-react';
import { Button } from '@/components/ui';
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
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
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
      <div className="border-t border-gray-200 p-4 dark:border-dark-border">
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600 dark:bg-dark-surface-2 dark:text-slate-300">
          <Lock className="h-4 w-4" />
          {t('shared.chatbot.sealedNotice')}
        </div>
      </div>
    );
  }

  const overLimit = value.length > MAX_LEN;

  return (
    <div className="border-t border-gray-200 p-3 sm:p-4 dark:border-dark-border">
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

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,text/plain,.pdf,.txt"
          onChange={handleFile}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy || uploading}
          className="px-2.5"
          title={t('shared.chatbot.attachRag')}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          ) : (
            <Paperclip className="h-5 w-5 text-gray-500" />
          )}
        </Button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
          placeholder={t('shared.chatbot.inputPlaceholder')}
          className={cn(
            'thin-scrollbar max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 dark:bg-dark-surface',
            overLimit
              ? 'border-red-300 focus:ring-red-200 dark:border-red-500/50'
              : 'border-gray-300 focus:border-primary-400 focus:ring-primary-100 dark:border-dark-border'
          )}
        />

        <Button
          variant="primary"
          onClick={onSend}
          disabled={!value.trim() || busy || overLimit}
          className="h-11 px-4"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
        <span>{t('shared.chatbot.composerHint')}</span>
        <span className={cn(overLimit && 'font-semibold text-red-500')}>
          {value.length}/{MAX_LEN}
        </span>
      </div>
    </div>
  );
}
