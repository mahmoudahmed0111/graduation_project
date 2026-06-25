import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles: Record<ToastType, string> = {
  success:
    'bg-emerald-50/95 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-100',
  error:
    'bg-red-50/95 border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-800/60 dark:text-red-100',
  info:
    'bg-blue-50/95 border-blue-200 text-blue-900 dark:bg-blue-950/60 dark:border-blue-800/60 dark:text-blue-100',
  warning:
    'bg-amber-50/95 border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-100',
};

const iconStyles: Record<ToastType, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

export function ToastComponent({ toast, onClose }: ToastProps) {
  const { t } = useTranslation();
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-lg ring-1 ring-black/[0.02] backdrop-blur-sm animate-fade-in-up',
        toastStyles[toast.type]
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 shrink-0', iconStyles[toast.type])} />
      <p className="min-w-0 break-words text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="-me-1 shrink-0 rounded-md p-1 opacity-50 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
        aria-label={t('chrome.toast.close')}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

