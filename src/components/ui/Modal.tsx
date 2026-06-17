import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from './IconButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Optional muted line under the title. */
  subtitle?: string;
  children: ReactNode;
  /** Sticky footer area — typically Cancel / Confirm buttons. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-primary-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-elevated ring-1 ring-gray-200 dark:bg-dark-surface dark:ring-dark-border',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-6 py-4 dark:border-dark-border">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
                  )}
                </div>
                <IconButton onClick={onClose} variant="ghost" size="sm" aria-label="Close">
                  <X className="h-5 w-5" />
                </IconButton>
              </header>
            )}

            <div className="flex-1 overflow-y-auto thin-scrollbar p-6">{children}</div>

            {footer && (
              <footer className="flex items-center justify-end gap-2.5 border-t border-gray-200 bg-gray-50/60 px-6 py-4 dark:border-dark-border dark:bg-dark-surface-2/40">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
