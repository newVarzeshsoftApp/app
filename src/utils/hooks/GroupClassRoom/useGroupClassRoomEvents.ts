import {useCallback, useEffect} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useSSEConnection} from '../../../screens/home/ReserveDetailScreen/hooks/useSSEConnection';
import {GROUP_CLASS_ROOM_KEY} from '../../../constants/groupClassRoom';
import {useCartContext} from '../../CartContext';
import {getCart} from '../../helpers/CartStorage';
import {
  GroupClassRoomSSEEvent,
  findGroupClassRoomCartItemByEvent,
  groupClassRoomEventMatchesOrganization,
  isGroupClassRoomEventLocked,
  isGroupClassRoomEventReleased,
  isGroupClassRoomSSEEvent,
  refetchGroupClassRoomQueries,
  shouldSkipOwnGroupClassRoomLockEvent,
} from '../../helpers/groupClassRoomHelpers';
import {useAuth} from '../useAuth';
import {
  logGroupClassRoomHandlerDecision,
  logGroupClassRoomEventTrace,
  logGroupClassRoomReleaseFlow,
  logGroupClassRoomSseDebug,
} from '../../helpers/groupClassRoomSseDebug';

type UseGroupClassRoomEventsOptions = {
  enabled?: boolean;
};

const shouldRefetchGroupClassRoomEvent = (
  event: GroupClassRoomSSEEvent,
  isMyAction: boolean,
): boolean => {
  if (isGroupClassRoomEventReleased(event)) {
    return true;
  }

  if (shouldSkipOwnGroupClassRoomLockEvent(event, isMyAction)) {
    return false;
  }

  if (isGroupClassRoomEventLocked(event.status)) {
    return true;
  }

  if (
    event.preReservedCount != null ||
    event.filled != null ||
    event.waitingListCount != null
  ) {
    return true;
  }

  return event.key === GROUP_CLASS_ROOM_KEY;
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
      const shouldRefetch = shouldRefetchGroupClassRoomEvent(event, isMyAction);

      logGroupClassRoomEventTrace('GCR event received', {
        event,
        viewerUserId: profile?.id,
        organizationSku: organization?.sku,
        organizationKey: organization?.key,
        isMyAction,
        isReleaseEvent,
        isLockedStatus: isGroupClassRoomEventLocked(event.status),
        skipOwnLock: shouldSkipOwnGroupClassRoomLockEvent(event, isMyAction),
        shouldRefetch,
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

      if (!shouldRefetch) {
        logGroupClassRoomHandlerDecision(
          'ignored',
          shouldSkipOwnGroupClassRoomLockEvent(event, isMyAction)
            ? 'own locked event (already updated locally)'
            : 'event did not match refetch rules',
          event,
        );
        return;
      }

      logGroupClassRoomHandlerDecision(
        'accepted',
        isReleaseEvent ? 'refetching list (release)' : 'refetching list',
        event,
      );
      await refetchGroupClassRoomQueries(queryClient, {
        includeInactive: isReleaseEvent,
        debugGroupClassRoomId: event.groupClassRoom,
      });
      logGroupClassRoomSseDebug('REFETCH', 'group class room queries refetched', {
        groupClassRoomId: event.groupClassRoom,
        isReleaseEvent,
        isMyAction,
      });

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
