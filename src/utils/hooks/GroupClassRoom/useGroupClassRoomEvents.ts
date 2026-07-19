import {useCallback, useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useSSEConnection} from '../../../screens/home/ReserveDetailScreen/hooks/useSSEConnection';
import {useCartContext} from '../../CartContext';
import {
  GroupClassRoomSSEEvent,
  isGroupClassRoomEventLockSignal,
  isGroupClassRoomEventReleased,
  isGroupClassRoomSSEEvent,
  processGroupClassRoomRemoteEvent,
} from '../../helpers/groupClassRoomHelpers';
import {useAuth} from '../useAuth';
import {
  logGroupClassRoomEventTrace,
  logGroupClassRoomPurchaseReceived,
  logGroupClassRoomReleaseReceived,
} from '../../helpers/groupClassRoomSseDebug';

type UseGroupClassRoomEventsOptions = {
  enabled?: boolean;
};

export const useGroupClassRoomEvents = ({
  enabled = true,
}: UseGroupClassRoomEventsOptions = {}) => {
  const queryClient = useQueryClient();
  const {profile, SKU: organization} = useAuth();
  const {removeFromCart} = useCartContext();
  const organizationSku = organization?.sku;

  const handleEvent = useCallback(
    async (event: GroupClassRoomSSEEvent) => {
      if (!isGroupClassRoomSSEEvent(event)) {
        return;
      }

      const isMyAction = event.user !== undefined && event.user === profile?.id;
      const isReleaseEvent = isGroupClassRoomEventReleased(event);
      const flowPayload = {
        viewerUserId: profile?.id,
        eventUserId: event.user,
        groupClassRoomId: event.groupClassRoom,
        contractorId: event.contractor,
        status: event.status,
        isLocked: event.isLocked,
        preReservedCount: event.preReservedCount,
        organizationSku: organization?.sku ?? event.organizationSku,
        isMyAction,
        fullEvent: event,
      };

      if (isReleaseEvent) {
        logGroupClassRoomReleaseReceived(flowPayload);
      } else if (isGroupClassRoomEventLockSignal(event)) {
        logGroupClassRoomPurchaseReceived(flowPayload);
      }

      try {
        await processGroupClassRoomRemoteEvent(event, {
          queryClient,
          profileId: profile?.id,
          organization,
          removeFromCart,
        });
      } catch (error) {
        logGroupClassRoomEventTrace('GCR event handler FAILED', {
          groupClassRoomId: event.groupClassRoom,
          viewerUserId: profile?.id,
          error:
            error instanceof Error
              ? {name: error.name, message: error.message}
              : error,
        });
      }
    },
    [
      organization,
      profile?.id,
      queryClient,
      removeFromCart,
    ],
  );

  useSSEConnection({
    enabled: enabled && !!organizationSku,
    organizationSku,
    onEvent: handleEvent,
  });

  useEffect(() => {
    logGroupClassRoomEventTrace('SSE hook active', {
      enabled: enabled && !!organizationSku,
      organizationSku,
      viewerUserId: profile?.id,
    });

    return () => {
      logGroupClassRoomEventTrace('SSE hook inactive', {
        organizationSku,
        viewerUserId: profile?.id,
      });
    };
  }, [enabled, organizationSku, profile?.id]);
};
