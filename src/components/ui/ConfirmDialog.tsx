import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  // Default to the shared i18n labels so the buttons follow the active language
  // (previously hardcoded English "Confirm"/"Cancel").
  const confirmLabel = confirmText ?? t('common.confirm');
  const cancelLabel = cancelText ?? t('common.cancel');
  const variantStyles = {
    danger: {
      Icon: Trash2,
      icon: 'text-red-600 dark:text-red-300',
      iconBg: 'bg-red-100 dark:bg-red-500/15',
      halo: 'bg-red-500/15',
      button: '!bg-red-600 hover:!bg-red-700 !text-white',
    },
    warning: {
      Icon: AlertTriangle,
      icon: 'text-amber-600 dark:text-amber-300',
      iconBg: 'bg-amber-100 dark:bg-amber-500/15',
      halo: 'bg-amber-500/15',
      button: '!bg-amber-500 hover:!bg-amber-600 !text-amber-950',
    },
    info: {
      Icon: Info,
      icon: 'text-primary-600 dark:text-primary-300',
      iconBg: 'bg-primary-100 dark:bg-primary-500/15',
      halo: 'bg-primary-500/15',
      button: '',
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className={styles.button}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center px-2 py-2 text-center">
        <div className="relative mb-4">
          <span className={cn('absolute inset-0 -m-2 rounded-full blur-lg', styles.halo)} />
          <span
            className={cn(
              'relative grid h-14 w-14 place-items-center rounded-2xl',
              styles.iconBg
            )}
          >
            <Icon className={cn('h-7 w-7', styles.icon)} />
          </span>
        </div>
        <h3 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="mt-1.5 max-w-sm text-sm text-gray-500 dark:text-slate-400">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
      </div>
    </Modal>
  );
}
