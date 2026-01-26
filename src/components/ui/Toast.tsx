import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
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

const toastStyles = {
  success: 'bg-blue-50 border-blue-200 text-blue-800',
  error: 'bg-blue-50 border-blue-300 text-blue-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-blue-50 border-blue-300 text-blue-800',
};

const iconStyles = {
  success: 'text-blue-600',
  error: 'text-blue-600',
  info: 'text-blue-600',
  warning: 'text-blue-600',
};

export function ToastComponent({ toast, onClose }: ToastProps) {
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
        'flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-sm w-full animate-fade-in-up',
        toastStyles[toast.type]
      )}
      role="alert"
    >
      <div className={cn(
        'flex-shrink-0 p-2 rounded-lg',
        toast.type === 'success' && 'bg-blue-100',
        toast.type === 'error' && 'bg-blue-100',
        toast.type === 'info' && 'bg-blue-100',
        toast.type === 'warning' && 'bg-blue-100'
      )}>
        <Icon className={cn('h-5 w-5', iconStyles[toast.type])} />
      </div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

