import { useToastStore } from '@/store/toastStore';
import { ToastComponent } from './Toast';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-fit max-w-[calc(100vw-2rem)] flex-col items-end gap-2.5 sm:max-w-md">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}

