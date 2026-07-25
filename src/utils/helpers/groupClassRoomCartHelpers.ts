import {QueryClient} from '@tanstack/react-query';
import GroupClassRoomService from '../../services/GroupClassRoomService';
import {GetAllOrganizationResponse} from '../../services/models/response/OrganizationResServise';
import {GroupClassRoom} from '../../services/models/response/GroupClassRoomResService';
import {CartItem} from './CartStorage';
import {
  applyGroupClassRoomEventToQueryCache,
  buildGroupClassRoomOptimisticPreReserveEvent,
  buildGroupClassRoomReleaseEvent,
  buildGroupClassRoomReleasePayload,
  GroupClassRoomSSEEvent,
} from './groupClassRoomHelpers';
import {
  applyGroupClassRoomLiveLockFromEvent,
  getGroupClassRoomLiveLock,
  setGroupClassRoomLiveLock,
} from './groupClassRoomLiveLocks';
import {broadcastClientRemoteEvent} from '../hooks/sharedSocketManager';
import {
  logGroupClassRoomEventTrace,
  logGroupClassRoomReleaseCalled,
  logGroupClassRoomReleaseFlow,
  logGroupClassRoomReleaseSent,
} from './groupClassRoomSseDebug';

type ReleaseGroupClassRoomFromCartParams = {
  item: CartItem;
  userId: number;
  organization?: GetAllOrganizationResponse | null;
  queryClient?: QueryClient;
};

type LockGroupClassRoomAfterPreReserveParams = {
  classRoom: GroupClassRoom;
  contractorId: number;
  userId: number;
  waitingForGroupClass: boolean;
  organization?: GetAllOrganizationResponse | null;
  queryClient?: QueryClient;
};

export const lockGroupClassRoomAfterPreReserve = ({
  classRoom,
  contractorId,
  userId,
  waitingForGroupClass,
  organization,
  queryClient,
}: LockGroupClassRoomAfterPreReserveParams): GroupClassRoomSSEEvent => {
  const lockEvent = buildGroupClassRoomOptimisticPreReserveEvent(
    classRoom,
    contractorId,
    userId,
    waitingForGroupClass,
    organization,
  );

  logGroupClassRoomEventTrace('lock after preReserve', {
    groupClassRoomId: classRoom.id,
    contractorId,
    waitingForGroupClass,
    preReservedCount: lockEvent.preReservedCount,
    preReserveWaitingCount: lockEvent.preReserveWaitingCount,
  });

  if (queryClient) {
    applyGroupClassRoomEventToQueryCache(queryClient, lockEvent);
  }

  const currentLiveLock = getGroupClassRoomLiveLock(classRoom.id, contractorId);
  setGroupClassRoomLiveLock(classRoom.id, contractorId, {
    ...currentLiveLock,
    ...(waitingForGroupClass
      ? {preReserveWaitingCount: lockEvent.preReserveWaitingCount ?? 1}
      : {preReservedCount: lockEvent.preReservedCount ?? 1}),
    preReservedUserId: userId,
  });

  return lockEvent;
};

export const releaseGroupClassRoomFromCartItem = async ({
  item,
  userId,
  organization,
  queryClient,
}: ReleaseGroupClassRoomFromCartParams): Promise<void> => {
  if (!item.isGroupClassRoom || !item.groupClassRoomData) {
    return;
  }

  const {groupClassRoomId, contractorId, waitingForGroupClass} =
    item.groupClassRoomData;

  const payload = buildGroupClassRoomReleasePayload({
    userId,
    groupClassRoomId,
    contractorId,
    organization,
    waitingForGroupClass: waitingForGroupClass ?? false,
  });

  logGroupClassRoomReleaseCalled({
    viewerUserId: userId,
    eventUserId: userId,
    groupClassRoomId,
    contractorId,
    organizationSku: organization?.sku,
    cartId: item.CartId,
    payload,
  });

  logGroupClassRoomReleaseFlow('API release request', {
    cartId: item.CartId,
    payload,
  });

  try {
    const response = await GroupClassRoomService.PreReserve(payload);

    logGroupClassRoomReleaseFlow('API release success', {
      cartId: item.CartId,
      groupClassRoomId,
      contractorId,
      response,
    });
  } catch (error) {
    logGroupClassRoomReleaseFlow('API release FAILED', {
      cartId: item.CartId,
      payload,
      error:
        error instanceof Error
          ? {name: error.name, message: error.message}
          : error,
    });
    throw error;
  }

  const isWaiting = waitingForGroupClass ?? false;
  const releaseEvent = buildGroupClassRoomReleaseEvent({
    groupClassRoomId,
    contractorId,
    userId,
    organization,
    waitingForGroupClass: isWaiting,
    ...(isWaiting ? {preReserveWaitingCount: 0} : {preReservedCount: 0}),
  });

  if (queryClient) {
    // Optimistic clear only — immediate refetch overwrites with stale API data.
    applyGroupClassRoomEventToQueryCache(queryClient, releaseEvent);
  }

  applyGroupClassRoomLiveLockFromEvent({
    groupClassRoomId,
    contractorId,
    userId,
    preReservedCount: releaseEvent.preReservedCount,
    preReserveWaitingCount: releaseEvent.preReserveWaitingCount,
    waiting: isWaiting,
    isRelease: true,
  });

  // API POST already broadcasts CLIENT_REMOTE to all clients.
  broadcastClientRemoteEvent(releaseEvent, {dispatchLocally: false});

  logGroupClassRoomReleaseSent({
    viewerUserId: userId,
    eventUserId: userId,
    groupClassRoomId,
    contractorId,
    status: releaseEvent.status,
    isLocked: releaseEvent.isLocked,
    preReservedCount: releaseEvent.preReservedCount,
    organizationSku: organization?.sku,
    cartId: item.CartId,
    fullEvent: releaseEvent,
  });
};
