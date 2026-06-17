import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useInvalidateAnnouncements } from '@/hooks/queries/usePhase6Announcements';
import { connectSocket, disconnectSocket } from '@/lib/realtime/socket';

/**
 * Mounts the Phase 6 Socket.io connection for authenticated users and routes
 * `new_announcement` events into the notification store + a toast, and refreshes
 * the announcements list. Renders nothing. Connection failures are silent so the
 * REST experience is unaffected (progressive enhancement).
 */
export function RealtimeProvider() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const addFromAnnouncement = useNotificationStore((s) => s.addFromAnnouncement);
  const showInfo = useToastStore((s) => s.info);
  const invalidateAnnouncements = useInvalidateAnnouncements();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    connectSocket({
      onAnnouncement: (a) => {
        addFromAnnouncement(a);
        showInfo(`${t('phase6.toast.newAnnouncement')}: ${a.title}`);
        invalidateAnnouncements();
      },
      // Subscription / connection errors are intentionally silent for the user.
      onSubscriptionError: () => {},
      onConnectError: () => {},
    });

    return () => {
      disconnectSocket();
    };
    // Reconnect whenever the auth token changes (re-login / refresh).
  }, [isAuthenticated, accessToken, addFromAnnouncement, showInfo, invalidateAnnouncements, t]);

  return null;
}
