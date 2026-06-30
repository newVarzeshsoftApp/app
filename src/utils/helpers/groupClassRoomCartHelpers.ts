import {QueryClient} from '@tanstack/react-query';
import {GROUP_CLASS_ROOM_KEY} from '../../constants/groupClassRoom';
import GroupClassRoomService from '../../services/GroupClassRoomService';
import {GetAllOrganizationResponse} from '../../services/models/response/OrganizationResServise';
import {CartItem} from './CartStorage';
import {
  applyGroupClassRoomEventToQueryCache,
  buildGroupClassRoomReleasePayload,
} from './groupClassRoomHelpers';
import {logGroupClassRoomReleaseFlow} from './groupClassRoomSseDebug';

type ReleaseGroupClassRoomFromCartParams = {
  item: CartItem;
  userId: number;
  organization?: GetAllOrganizationResponse | null;
  queryClient?: QueryClient;
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
      backendNote:
        'Other users need CLIENT_REMOTE with status released (or isLocked:false). If Tab B shows no RAW-RELEASE after this, backend is not broadcasting release.',
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

  if (queryClient) {
    applyGroupClassRoomEventToQueryCache(queryClient, {
      key: GROUP_CLASS_ROOM_KEY,
      groupClassRoom: groupClassRoomId,
      contractor: contractorId,
      status: 'released',
      isLocked: false,
    });
  }
};
