import {Platform} from 'react-native';
import {getTokens} from '../helpers/tokenStorage';
import {
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

let socket: Socket | null = null;
let isConnecting = false;
let subscriberCount = 0;
const listeners = new Set<SSEListener>();
let organizationSkuFilter: string | undefined;

const resolveEventsSocketUrl = (): string | null => {
  const apiBaseUrl = process.env.BASE_URL?.replace(/\/$/, '');
  if (!apiBaseUrl) {
    return null;
  }

  // REST API uses /api, Socket.IO namespace /events is on gateway root (not /api/events)
  const gatewayOrigin = apiBaseUrl.replace(/\/api$/, '');
  return `${gatewayOrigin}/events`;
};

const dispatchEvent = (data: SharedSSEEvent) => {
  if (
    organizationSkuFilter &&
    data.organizationSku &&
    data.organizationSku !== organizationSkuFilter
  ) {
    logGroupClassRoomSseDebug('FILTER', 'organizationSku mismatch', {
      expected: organizationSkuFilter,
      received: data.organizationSku,
      event: data,
    });
    return;
  }

  listeners.forEach(listener => listener(data));
};

const disconnectSharedSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  isConnecting = false;
};

const ensureSharedSocketConnected = async () => {
  if (Platform.OS !== 'web') {
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
  });
  const isSecure = serverUrl.startsWith('https');

  isConnecting = true;

  try {
    const tokens = await getTokens();

    socket = io(serverUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      secure: isSecure,
      timeout: 10000,
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

    socket.on('connect', () => {
      isConnecting = false;
      setGroupClassRoomSocketConnectedDebug(true);
      logGroupClassRoomSseDebug('SOCKET', 'connected', {socketId: socket?.id});
    });

    socket.on('disconnect', reason => {
      isConnecting = false;
      setGroupClassRoomSocketConnectedDebug(false);
      logGroupClassRoomSseDebug('SOCKET', 'disconnected', {reason});
    });

    socket.on('connect_error', error => {
      isConnecting = false;
      setGroupClassRoomSocketConnectedDebug(false);
      logGroupClassRoomSseDebug('SOCKET', 'connect_error', {
        message: error.message,
        serverUrl,
      });
      disconnectSharedSocket();
    });

    socket.on('CLIENT_REMOTE', (data: SharedSSEEvent) => {
      logGroupClassRoomRawSocketEvent('CLIENT_REMOTE', data);
      dispatchEvent(data);
    });

    if (__DEV__) {
      socket.onAny((eventName, ...args) => {
        if (eventName === 'CLIENT_REMOTE') {
          return;
        }

        logGroupClassRoomRawSocketEvent(String(eventName), args[0] ?? {});
      });
    }
  } catch (error) {
    console.error('Error creating shared Socket.IO connection:', error);
    isConnecting = false;
  }
};

export const subscribeSharedSSE = (
  listener: SSEListener,
  organizationSku?: string,
): (() => void) => {
  if (organizationSku) {
    organizationSkuFilter = organizationSku;
  }

  listeners.add(listener);
  subscriberCount += 1;

  void ensureSharedSocketConnected();

  return () => {
    listeners.delete(listener);
    subscriberCount = Math.max(0, subscriberCount - 1);

    if (subscriberCount === 0) {
      disconnectSharedSocket();
      organizationSkuFilter = undefined;
    }
  };
};

export const isSharedSocketConnected = (): boolean =>
  socket?.connected ?? false;
