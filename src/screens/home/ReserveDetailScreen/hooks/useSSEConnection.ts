import {useEffect, useRef} from 'react';
import {useAuth} from '../../../../utils/hooks/useAuth';
import {
  SharedSSEEvent,
  isSharedSocketConnected,
  subscribeSharedSSE,
} from '../../../../utils/hooks/sharedSocketManager';

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
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled || !profile || !SKU) {
      return;
    }

    return subscribeSharedSSE((event: SharedSSEEvent) => {
      onEventRef.current(event);
    }, organizationSku ?? SKU?.sku);
  }, [enabled, organizationSku, profile, SKU]);

  return {
    isConnected: isSharedSocketConnected(),
  };
};
