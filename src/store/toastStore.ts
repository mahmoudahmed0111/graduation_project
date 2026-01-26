import { create } from 'zustand';
import { Toast, ToastType } from '@/components/ui/Toast';

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration };
    
    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  success: (message, duration) => {
    useToastStore.getState().addToast(message, 'success', duration);
  },

  error: (message, duration) => {
    useToastStore.getState().addToast(message, 'error', duration);
  },

  info: (message, duration) => {
    useToastStore.getState().addToast(message, 'info', duration);
  },

  warning: (message, duration) => {
    useToastStore.getState().addToast(message, 'warning', duration);
  },
}));

