import {Platform} from 'react-native';
import {getTokens} from '../helpers/tokenStorage';
import {
  logGroupClassRoomEventReceiving,
  logGroupClassRoomEventSending,
  logGroupClassRoomRawSocketEvent,
  logGroupClassRoomSseDebug,
  setGroupClassRoomSocketConnectedDebug,
} from '../helpers/groupClassRoomSseDebug';
// @ts-ignore - socket.io-client default export
import io from 'socket.io-client';
import type {Socket} from 'socket.io-client';

export type SharedSSEEvent = {
  fromTime?: string;
  toTime?: string;
  date?: string;
  specificDate?: string;
  product?: number;
  user?: number;
  gender?: string | null;
  order?: number;
  status?: 'reserved' | 'pre-reserved' | 'cancelled' | 'locked' | 'released';
  isLocked?: string | boolean;
  day?: string;
  organizationKey?: string;
  organizationSku?: string;
  key?: string;
  groupClassRoom?: number;
  contractor?: number;
  price?: number;
  preReservedCount?: number;
  filled?: number;
  waitingListCount?: number;
};

type SSEListener = (event: SharedSSEEvent) => void;

type SSEListenerEntry = {
  listener: SSEListener;
  organizationSku?: string;
};

type CrossTabMessage = {
  sourceTabId: string;
  event: SharedSSEEvent;
};

const CLIENT_REMOTE_CHANNEL = 'gcr-client-remote';
const clientTabId = `gcr-tab-${Math.random().toString(36).slice(2, 11)}`;

let crossTabChannel: BroadcastChannel | null = null;
let socket: Socket | null = null;
let isConnecting = false;
let subscriberCount = 0;
let nextListenerId = 0;
const listenerEntries = new Map<number, SSEListenerEntry>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;

const dispatchEvent = (
  data: SharedSSEEvent,
  source: string = 'dispatch',
) => {
  logGroupClassRoomEventReceiving(data, {source});

  listenerEntries.forEach(({listener, organizationSku}) => {
    if (
      organizationSku &&
      data.organizationSku &&
      data.organizationSku !== organizationSku
    ) {
      logGroupClassRoomSseDebug('FILTER', 'organizationSku mismatch', {
        expected: organizationSku,
        received: data.organizationSku,
        event: data,
      });
      return;
    }

    listener(data);
  });
};

const ensureCrossTabChannel = () => {
  if (Platform.OS !== 'web' || typeof BroadcastChannel === 'undefined') {
    return;
  }

  if (crossTabChannel) {
    return;
  }

  crossTabChannel = new BroadcastChannel(CLIENT_REMOTE_CHANNEL);
  crossTabChannel.onmessage = (message: MessageEvent<CrossTabMessage>) => {
    const payload = message.data;
    if (!payload || payload.sourceTabId === clientTabId) {
      return;
    }

    logGroupClassRoomRawSocketEvent('BROADCAST_CHANNEL', payload.event);
    dispatchEvent(payload.event, 'broadcast-channel');
  };

  logGroupClassRoomSseDebug('CHANNEL', 'cross-tab listener ready', {
    tabId: clientTabId,
  });
};

const publishCrossTabEvent = (event: SharedSSEEvent) => {
  if (!crossTabChannel) {
    return;
  }

  const message: CrossTabMessage = {
    sourceTabId: clientTabId,
    event,
  };

  crossTabChannel.postMessage(message);
  logGroupClassRoomSseDebug('CHANNEL', 'cross-tab publish', {
    tabId: clientTabId,
    event,
  });
};

const resolveEventsSocketUrl = (): string | null => {
  const apiBaseUrl = process.env.BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) {
    return null;
  }

  // REST API uses /api, Socket.IO namespace /events is on gateway root (not /api/events)
  const gatewayOrigin = apiBaseUrl.replace(/\/api$/, '');
  return `${gatewayOrigin}/events`;
};

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const teardownSocket = () => {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  isConnecting = false;
};

const scheduleReconnect = (reason: string) => {
  if (subscriberCount === 0) {
    return;
  }

  if (reconnectTimer) {
    return;
  }

  const delay = Math.min(
    BASE_RECONNECT_DELAY_MS * 2 ** reconnectAttempts,
    MAX_RECONNECT_DELAY_MS,
  );

  logGroupClassRoomSseDebug('SOCKET', 'reconnect scheduled', {
    reason,
    delayMs: delay,
    attempt: reconnectAttempts + 1,
    subscriberCount,
  });

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    reconnectAttempts += 1;
    teardownSocket();
    void ensureSharedSocketConnected();
  }, delay);
};

const attachSocketHandlers = (serverUrl: string) => {
  if (!socket) {
    return;
  }

  socket.on('connect', () => {
    isConnecting = false;
    reconnectAttempts = 0;
    clearReconnectTimer();
    setGroupClassRoomSocketConnectedDebug(true);
    logGroupClassRoomSseDebug('SOCKET', 'connected', {socketId: socket?.id});
  });

  socket.on('disconnect', reason => {
    isConnecting = false;
    setGroupClassRoomSocketConnectedDebug(false);
    logGroupClassRoomSseDebug('SOCKET', 'disconnected', {reason});

    if (subscriberCount > 0) {
      scheduleReconnect(`disconnect:${reason}`);
    }
  });

  socket.on('connect_error', error => {
    isConnecting = false;
    setGroupClassRoomSocketConnectedDebug(false);
    logGroupClassRoomSseDebug('SOCKET', 'connect_error', {
      message: error.message,
      serverUrl,
    });

    if (subscriberCount > 0) {
      scheduleReconnect('connect_error');
    }
  });

  socket.on('CLIENT_REMOTE', (data: SharedSSEEvent) => {
    logGroupClassRoomRawSocketEvent('CLIENT_REMOTE', data);
    dispatchEvent(data, 'CLIENT_REMOTE');
    // Fan-out server events to other tabs in the same browser (e.g. user B tab).
    publishCrossTabEvent(data);
  });

  if (__DEV__) {
    socket.onAny((eventName, ...args) => {
      if (eventName === 'CLIENT_REMOTE') {
        return;
      }

      logGroupClassRoomRawSocketEvent(String(eventName), args[0] ?? {});
    });
  }
};

const ensureSharedSocketConnected = async () => {
  if (Platform.OS !== 'web') {
    return;
  }

  if (subscriberCount === 0) {
    return;
  }

  if (socket?.connected || isConnecting) {
    return;
  }

  const serverUrl = resolveEventsSocketUrl();
  if (!serverUrl) {
    console.error(
      'BASE_URL is not defined. Please set BASE_URL environment variable.',
    );
    return;
  }

  logGroupClassRoomSseDebug('SOCKET', 'connecting', {
    serverUrl,
    apiBaseUrl: process.env.BASE_URL,
    attempt: reconnectAttempts + 1,
  });
  const isSecure = serverUrl.startsWith('https');

  isConnecting = true;

  try {
    const tokens = await getTokens();

    if (subscriberCount === 0) {
      isConnecting = false;
      return;
    }

    socket = io(serverUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      secure: isSecure,
      timeout: 10_000,
      reconnection: false,
      ...(tokens?.accessToken && {
        auth: {
          token: tokens.accessToken,
        },
        extraHeaders: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'CLIENT-REMOTE': 'true',
        },
        query: {
          'CLIENT-REMOTE': 'true',
        },
      }),
    });

    attachSocketHandlers(serverUrl);
  } catch (error) {
    console.error('Error creating shared Socket.IO connection:', error);
    isConnecting = false;

    if (subscriberCount > 0) {
      scheduleReconnect('create_error');
    }
  }
};

export const broadcastClientRemoteEvent = (
  data: SharedSSEEvent,
  options?: {dispatchLocally?: boolean},
): void => {
  logGroupClassRoomRawSocketEvent('EMIT', data);
  logGroupClassRoomEventSending(data, {
    source: 'broadcastClientRemoteEvent',
    socketConnected: !!socket?.connected,
  });

  if (socket?.connected) {
    socket.emit('CLIENT_REMOTE', data);
    logGroupClassRoomSseDebug('EMIT', 'CLIENT_REMOTE emitted', data);
  } else {
    logGroupClassRoomSseDebug('EMIT', 'socket not connected', data);
  }

  publishCrossTabEvent(data);

  if (options?.dispatchLocally !== false) {
    dispatchEvent(data, 'local-dispatch');
  }
};

export const subscribeSharedSSE = (
  listener: SSEListener,
  organizationSku?: string,
): (() => void) => {
  const listenerId = nextListenerId;
  nextListenerId += 1;

  listenerEntries.set(listenerId, {listener, organizationSku});
  subscriberCount = listenerEntries.size;

  ensureCrossTabChannel();

  clearReconnectTimer();
  reconnectAttempts = 0;
  void ensureSharedSocketConnected();

  return () => {
    listenerEntries.delete(listenerId);
    subscriberCount = listenerEntries.size;

    if (subscriberCount === 0) {
      clearReconnectTimer();
      teardownSocket();
      reconnectAttempts = 0;
    }
  };
};

export const isSharedSocketConnected = (): boolean =>
  socket?.connected ?? false;

if (Platform.OS === 'web' && typeof BroadcastChannel !== 'undefined') {
  ensureCrossTabChannel();
}
