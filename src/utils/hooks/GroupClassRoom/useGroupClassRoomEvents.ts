import {useCallback} from 'react';
import {GROUP_CLASS_ROOM_KEY} from '../../../constants/groupClassRoom';
import {useSSEConnection} from '../../../screens/home/ReserveDetailScreen/hooks/useSSEConnection';
import {GroupClassRoomSSEEvent} from '../../helpers/groupClassRoomHelpers';
import {useAuth} from '../useAuth';

type UseGroupClassRoomEventsOptions = {
  enabled?: boolean;
  onUpdate: (event: GroupClassRoomSSEEvent) => void;
  groupClassRoomId?: number;
};

export const useGroupClassRoomEvents = ({
  enabled = true,
  onUpdate,
  groupClassRoomId,
}: UseGroupClassRoomEventsOptions) => {
  const {SKU} = useAuth();
  const organizationSku = SKU?.sku;

  const handleEvent = useCallback(
    (event: GroupClassRoomSSEEvent) => {
      const isGroupClassRoomEvent =
        event.key === GROUP_CLASS_ROOM_KEY || event.groupClassRoom != null;

      if (!isGroupClassRoomEvent) return;

      if (
        groupClassRoomId != null &&
        event.groupClassRoom != null &&
        event.groupClassRoom !== groupClassRoomId
      ) {
        return;
      }

      onUpdate(event);
    },
    [groupClassRoomId, onUpdate],
  );

  useSSEConnection({
    enabled: enabled && !!organizationSku,
    organizationSku,
    onEvent: handleEvent,
  });
};
