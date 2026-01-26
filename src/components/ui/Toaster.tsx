import { useToastStore } from '@/store/toastStore';
import { ToastComponent } from './Toast';

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-md">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto animate-fade-in-up">
          <ToastComponent toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

