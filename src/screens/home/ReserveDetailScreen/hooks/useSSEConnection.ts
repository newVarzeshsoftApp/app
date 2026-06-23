import {useEffect, useRef} from 'react';
import {Platform} from 'react-native';
import {useAuth} from '../../../../utils/hooks/useAuth';
import {getTokens} from '../../../../utils/helpers/tokenStorage';
// @ts-ignore - socket.io-client default export
import io from 'socket.io-client';
import type {Socket} from 'socket.io-client';

import {GROUP_CLASS_ROOM_KEY} from '../../constants/groupClassRoom';

interface SSEEvent {
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
}

interface UseSSEConnectionProps {
  onEvent: (event: SSEEvent) => void;
  enabled?: boolean;
  organizationSku?: string;
}

export const useSSEConnection = ({
  onEvent,
  enabled = true,
  organizationSku,
}: UseSSEConnectionProps) => {
  const {profile, SKU} = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  const onEventRef = useRef(onEvent);
  const enabledRef = useRef(enabled);
  const profileRef = useRef(profile);
  const SKURef = useRef(SKU);
  const organizationSkuRef = useRef(organizationSku ?? SKU?.sku);

  useEffect(() => {
    onEventRef.current = onEvent;
    enabledRef.current = enabled;
    profileRef.current = profile;
    SKURef.current = SKU;
    organizationSkuRef.current = organizationSku ?? SKU?.sku;
  }, [onEvent, enabled, profile, SKU, organizationSku]);

  useEffect(() => {
    // Only support Socket.IO on web platform
    if (Platform.OS !== 'web') {
      console.warn('Socket.IO is only supported on web platform');
      return;
    }

    if (!enabled || !profile || !SKU) {
      return;
    }

    // Prevent multiple connections
    if (isConnectingRef.current || socketRef.current?.connected) {
      return;
    }

    const connectSocket = async () => {
      try {
        // Use direct server URL like backend example (without /api)
        // For Socket.IO, use http(s) here (NOT ws(s)). Engine.IO will upgrade to ws/wss automatically.
        const SERVER_URL = process.env.BASE_URL;
        const NAMESPACE = '/events'; // namespace تعریف‌شده در گیت‌وی Nest
        const SOCKET_PATH = '/socket.io'; // مسیر هندشیک پیش‌فرض Socket.IO

        if (!SERVER_URL) {
          console.error('SERVER_URL is not defined. Please set BASE_URL environment variable.');
          return;
        }

        const serverUrl = `${SERVER_URL}${NAMESPACE}`;
        const isSecure = SERVER_URL.startsWith('https');

        console.log(`Connecting to ${serverUrl}`);
        console.log(`Using path: ${SOCKET_PATH}`);

        isConnectingRef.current = true;

        // Get tokens for authentication
        const tokens = await getTokens();

        // Create socket connection - exactly like backend example
        const socket = io(serverUrl, {
          path: SOCKET_PATH, // مطابق WebSocketGateway: path پیش‌فرض '/socket.io'
          // Start with polling to get the Engine.IO SID, then upgrade to websocket when allowed.
          transports: ['polling', 'websocket'],
          secure: isSecure,
          timeout: 10000,
          // Add auth if token exists (similar to backend example but with token)
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
          // اگر گواهی self-signed است برای تست:
          // rejectUnauthorized: false,
        });

        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
          console.log('✅ Connected to WebSocket server!');
          console.log('Socket ID:', socket.id);
          console.log('🔍 Socket connection details:', {
            id: socket.id,
            connected: socket.connected,
            disconnected: socket.disconnected,
            transport: (socket as any).io?.engine?.transport?.name,
          });
          isConnectingRef.current = false;

          // Test ping
          socket.emit('ping', (response: any) => {
            console.log('Ping response:', response);
          });
        });

        socket.on('disconnect', (reason: string) => {
          console.log('❌ Disconnected from server. Reason:', reason);
          isConnectingRef.current = false;
        });

        socket.on('connect_error', (error: Error) => {
          console.error('❌ Connection error:', error.message);
          if ((error as any)?.description) {
            console.error('Description:', (error as any).description);
          }
          if ((error as any)?.context) {
            console.error('Context:', (error as any).context);
          }
          isConnectingRef.current = false;
        });

        // Listen for CLIENT_REMOTE events
        socket.on('CLIENT_REMOTE', (data: SSEEvent) => {
          const activeSku = organizationSkuRef.current;
          if (
            activeSku &&
            data.organizationSku &&
            data.organizationSku !== activeSku
          ) {
            return;
          }

          console.log('\n📨 Received CLIENT_REMOTE event:');
          console.log(JSON.stringify(data, null, 2));
          console.log('🔍 Calling onEventRef.current with data:', data);
          if (onEventRef.current) {
            onEventRef.current(data);
            console.log('✅ onEventRef.current called successfully');
          } else {
            console.error('❌ onEventRef.current is null or undefined!');
          }
        });

        // Listen for any other events (for debugging)
        // This will catch ALL events, including CLIENT_REMOTE
        socket.onAny((eventName: string, ...args: any[]) => {
          console.log(`\n🔵 [onAny] Received event "${eventName}":`, {
            eventName,
            args,
            socketId: socket.id,
            connected: socket.connected,
            timestamp: new Date().toISOString(),
          });

          // Log full event data for CLIENT_REMOTE
          if (eventName === 'CLIENT_REMOTE') {
            console.log(`\n🔵 [onAny] CLIENT_REMOTE event received:`, {
              eventName,
              data: args[0],
              fullArgs: args,
            });
          }
        });

        // Also listen to all possible event names that backend might use
        const possibleEventNames = [
          'CLIENT_REMOTE',
          'client_remote',
          'CLIENT-REMOTE',
          'reservation',
          'reservation_update',
          'lock',
          'unlock',
          'pre-reserve',
          'pre_reserve',
        ];

        possibleEventNames.forEach(eventName => {
          socket.on(eventName, (data: any) => {
            console.log(`\n🎯 Received event "${eventName}":`, {
              eventName,
              data,
              socketId: socket.id,
            });
          });
        });
      } catch (error) {
        console.error('Error creating Socket.IO connection:', error);
        isConnectingRef.current = false;
      }
    };

    connectSocket();

    // Cleanup on unmount or when dependencies change
    return () => {
      isConnectingRef.current = false;

      if (socketRef.current) {
        console.log('👋 Closing Socket.IO connection...');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, profile?.id, SKU?.sku]); // Don't include onEvent to prevent reconnections

  return {
    isConnected: socketRef.current?.connected || false,
  };
};
