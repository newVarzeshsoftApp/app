import React from 'react';
import {useAuth} from '../useAuth';
import {useGroupClassRoomEvents} from './useGroupClassRoomEvents';

/**
 * Keeps GCR SSE subscription alive for the whole authenticated session.
 * Must render inside CartProvider (remote events update cache only; cart is not cleared via SSE).
 */
export const GroupClassRoomEventsProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const {isLoggedIn, SKU} = useAuth();

  useGroupClassRoomEvents({
    enabled: isLoggedIn && !!SKU?.sku,
  });

  return <>{children}</>;
};
