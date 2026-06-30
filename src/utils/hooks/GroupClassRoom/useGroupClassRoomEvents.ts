import {useCallback, useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useSSEConnection} from '../../../screens/home/ReserveDetailScreen/hooks/useSSEConnection';
import {useCartContext} from '../../CartContext';
import {getCart} from '../../helpers/CartStorage';
import {
  GroupClassRoomSSEEvent,
  applyGroupClassRoomEventToQueryCache,
  findGroupClassRoomCartItemByEvent,
  groupClassRoomEventMatchesOrganization,
  isGroupClassRoomEventReleased,
  isGroupClassRoomSSEEvent,
  shouldSkipOwnGroupClassRoomLockEvent,
} from '../../helpers/groupClassRoomHelpers';
import {useAuth} from '../useAuth';
import {
  logGroupClassRoomHandlerDecision,
  logGroupClassRoomEventTrace,
  logGroupClassRoomReleaseFlow,
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

      const isMyAction =
        event.user !== undefined && event.user === profile?.id;
      const isReleaseEvent = isGroupClassRoomEventReleased(event);

      logGroupClassRoomEventTrace('GCR event received', {
        event,
        viewerUserId: profile?.id,
        organizationSku: organization?.sku,
        organizationKey: organization?.key,
        isMyAction,
        isReleaseEvent,
      });

      if (!groupClassRoomEventMatchesOrganization(event, organization)) {
        logGroupClassRoomHandlerDecision(
          'ignored',
          'organization mismatch',
          event,
        );
        return;
      }

      if (!event.groupClassRoom) {
        logGroupClassRoomHandlerDecision(
          'ignored',
          'missing groupClassRoom id',
          event,
        );
        return;
      }

      const skipAutoAdjust = shouldSkipOwnGroupClassRoomLockEvent(event, isMyAction);

      applyGroupClassRoomEventToQueryCache(queryClient, event, {
        skipAutoAdjust,
      });

      logGroupClassRoomHandlerDecision(
        'accepted',
        'cache patched from SSE (no refetch)',
        event,
      );

      if (!isReleaseEvent) {
        return;
      }

      logGroupClassRoomReleaseFlow('SSE release event processed on viewer', {
        groupClassRoomId: event.groupClassRoom,
        contractor: event.contractor,
        eventUser: event.user,
        viewerUserId: profile?.id,
        status: event.status,
        isLocked: event.isLocked,
      });

      try {
        const cartItems = await getCart();
        const cartItem = findGroupClassRoomCartItemByEvent(cartItems, event);

        logGroupClassRoomReleaseFlow('SSE release cart lookup', {
          groupClassRoomId: event.groupClassRoom,
          cartItemFound: !!cartItem?.CartId,
          cartId: cartItem?.CartId,
        });

        if (cartItem?.CartId) {
          await removeFromCart(cartItem.CartId, {
            skipGroupClassRoomRelease: true,
          });
        }
      } catch (error) {
        logGroupClassRoomReleaseFlow('SSE release cart cleanup FAILED', {
          groupClassRoomId: event.groupClassRoom,
          error:
            error instanceof Error
              ? {name: error.name, message: error.message}
              : error,
        });
        console.error(
          'Failed to remove group class room item from cart via SSE:',
          error,
        );
      }
    },
    [organization, profile?.id, queryClient, removeFromCart],
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
