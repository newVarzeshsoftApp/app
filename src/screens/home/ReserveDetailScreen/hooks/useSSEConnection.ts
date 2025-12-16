import {useEffect, useRef, useCallback} from 'react';
import {Platform} from 'react-native';
import {useAuth} from '../../../../utils/hooks/useAuth';
import {getTokens} from '../../../../utils/helpers/tokenStorage';

interface SSEEvent {
  fromTime: string;
  toTime: string;
  date: string;
  product: number;
  user: number;
  gender: string | null;
  order: number;
  status: 'reserved' | 'pre-reserved' | 'cancelled';
  organizationKey: string;
  organizationSku: string;
}

interface UseSSEConnectionProps {
  onEvent: (event: SSEEvent) => void;
  enabled?: boolean;
}

export const useSSEConnection = ({
  onEvent,
  enabled = true,
}: UseSSEConnectionProps) => {
  const {profile, SKU} = useAuth();
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null,
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Memoize values to prevent unnecessary reconnections
  const onEventRef = useRef(onEvent);
  const enabledRef = useRef(enabled);
  const profileRef = useRef(profile);
  const SKURef = useRef(SKU);

  useEffect(() => {
    onEventRef.current = onEvent;
    enabledRef.current = enabled;
    profileRef.current = profile;
    SKURef.current = SKU;
  }, [onEvent, enabled, profile, SKU]);

  const connectSSE = useCallback(async () => {
    // Prevent multiple connections
    if (isConnectingRef.current) {
      return;
    }

    if (!enabledRef.current || !profileRef.current || !SKURef.current) {
      return;
    }

    // Only support SSE on web platform
    if (Platform.OS !== 'web') {
      console.warn('SSE is only supported on web platform');
      return;
    }

    isConnectingRef.current = true;

    // Cleanup previous connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        // Ignore cancel errors
      }
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const baseUrl = process.env.BASE_URL || '';
    const eventsUrl = `${baseUrl}/events`;

    try {
      const tokens = await getTokens();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const response = await fetch(eventsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens?.accessToken || ''}`,
          'CLIENT-REMOTE': 'true',
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body available');
      }

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      // Read stream recursively (non-blocking)
      const readChunk = async (): Promise<void> => {
        try {
          // Check if aborted before reading
          if (abortController.signal.aborted) {
            return;
          }

          const {done, value} = await reader.read();

          if (done) {
            console.log('SSE stream ended normally');
            isConnectingRef.current = false;
            // Stream ended - don't reconnect, connection was closed intentionally
            return;
          }

          // Check if aborted after reading
          if (abortController.signal.aborted) {
            return;
          }

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, {stream: true});

          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6);
                if (jsonStr) {
                  const data: SSEEvent = JSON.parse(jsonStr);
                  onEventRef.current(data);
                }
              } catch (error) {
                console.error('Error parsing SSE event:', error, trimmedLine);
              }
            }
          }

          // Continue reading next chunk (use setImmediate to prevent stack overflow)
          if (typeof setImmediate !== 'undefined') {
            setImmediate(() => {
              readChunk().catch(() => {
                // Error will be handled in catch block
              });
            });
          } else {
            // Fallback for browsers without setImmediate
            setTimeout(() => {
              readChunk().catch(() => {
                // Error will be handled in catch block
              });
            }, 0);
          }
        } catch (error: any) {
          // Don't reconnect if aborted
          if (error.name === 'AbortError' || abortController.signal.aborted) {
            console.log('SSE connection aborted');
            isConnectingRef.current = false;
            return;
          }

          console.error('Error reading SSE stream:', error);
          isConnectingRef.current = false;
          // Don't reconnect - connection was closed/errored
        }
      };

      // Start reading (non-blocking)
      readChunk();
    } catch (error: any) {
      // Don't reconnect if aborted
      if (error.name === 'AbortError') {
        console.log('SSE connection aborted');
        isConnectingRef.current = false;
        return;
      }

      console.error('Error creating SSE connection:', error);
      isConnectingRef.current = false;
      // Don't reconnect - connection failed
    }
  }, []); // Empty dependency array - use refs instead

  useEffect(() => {
    if (enabled && profile && SKU) {
      connectSSE();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      isConnectingRef.current = false;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      if (readerRef.current) {
        readerRef.current
          .cancel()
          .catch(() => {
            // Ignore cancel errors
          })
          .finally(() => {
            readerRef.current = null;
          });
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, profile?.id, SKU?.sku]); // Don't include connectSSE to prevent reconnections

  return {
    isConnected:
      isConnectingRef.current && !abortControllerRef.current?.signal.aborted,
  };
};
