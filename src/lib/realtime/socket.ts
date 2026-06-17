import { io, Socket } from 'socket.io-client';
import { API_ORIGIN } from '@/lib/http/client';
import { getAccessToken } from '@/store/authStore';
import { logger } from '@/lib/logger';
import type { LiveAnnouncement, SubscriptionError } from '@/types/phase6';

/**
 * Phase 6 — Socket.io client singleton.
 *
 * The handshake carries the **raw JWT** (no `Bearer` prefix) in `auth.token`,
 * exactly as the backend `socketProtect` middleware requires. The socket is a
 * progressive enhancement: if the connection fails (e.g. CORS from a non-allowed
 * origin) the REST API still works and the app degrades gracefully.
 */

let socket: Socket | null = null;
let currentToken: string | null = null;

export interface SocketHandlers {
  onAnnouncement: (a: LiveAnnouncement) => void;
  onSubscriptionError?: (e: SubscriptionError) => void;
  onConnect?: () => void;
  onConnectError?: (message: string) => void;
}

export function connectSocket(handlers: SocketHandlers): Socket | null {
  const token = getAccessToken();
  if (!token) return null;

  // Reuse an existing live socket for the same token.
  if (socket && socket.connected && currentToken === token) return socket;

  // Token changed (re-login) or stale socket — tear down and recreate.
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io(API_ORIGIN, {
    auth: { token }, // raw JWT — no "Bearer " prefix
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => handlers.onConnect?.());
  socket.on('new_announcement', (data: LiveAnnouncement) => handlers.onAnnouncement(data));
  socket.on('subscription_error', (err: SubscriptionError) => {
    logger.warn(`Socket subscription_error: ${err?.message ?? ''}`, { context: 'realtime' });
    handlers.onSubscriptionError?.(err);
  });
  socket.on('connect_error', (err: Error) => {
    // CORS / auth failures land here. Stay silent for the user — REST still works.
    logger.warn(`Socket connect_error: ${err?.message ?? ''}`, { context: 'realtime' });
    handlers.onConnectError?.(err?.message ?? 'connection failed');
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
}

export function getSocket(): Socket | null {
  return socket;
}
