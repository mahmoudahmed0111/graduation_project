import { create } from 'zustand';
import type { LiveAnnouncement, LiveNotification } from '@/types/phase6';

const MAX_ITEMS = 50;

interface NotificationState {
  items: LiveNotification[];
  unreadCount: number;
  /** Push a live announcement received over the socket. */
  addFromAnnouncement: (a: LiveAnnouncement) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  addFromAnnouncement: (a) =>
    set((state) => {
      if (state.items.some((n) => n.id === a.id)) return state; // de-dupe
      const item: LiveNotification = {
        id: a.id,
        title: a.title,
        content: a.content,
        scopeLevel: a.scope?.level ?? 'Global',
        authorName: a.author?.name ?? '',
        authorRole: a.author?.role ?? '',
        createdAt: a.createdAt,
        read: false,
      };
      const items = [item, ...state.items].slice(0, MAX_ITEMS);
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),
  markRead: (id) =>
    set((state) => {
      const items = state.items.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),
  markAllRead: () =>
    set((state) => ({ items: state.items.map((n) => ({ ...n, read: true })), unreadCount: 0 })),
  remove: (id) =>
    set((state) => {
      const items = state.items.filter((n) => n.id !== id);
      return { items, unreadCount: items.filter((n) => !n.read).length };
    }),
  clear: () => set({ items: [], unreadCount: 0 }),
}));
