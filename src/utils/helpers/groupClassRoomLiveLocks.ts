type GroupClassRoomLiveLock = {
  preReservedCount: number;
  preReservedUserId?: number;
};

const liveLocks = new Map<string, GroupClassRoomLiveLock>();

export const groupClassRoomLiveLockKey = (
  groupClassRoomId: number,
  contractorId: number,
): string => `${groupClassRoomId}:${contractorId}`;

export const getGroupClassRoomLiveLock = (
  groupClassRoomId: number,
  contractorId?: number,
): GroupClassRoomLiveLock | undefined => {
  if (contractorId == null) {
    return undefined;
  }

  return liveLocks.get(groupClassRoomLiveLockKey(groupClassRoomId, contractorId));
};

export const setGroupClassRoomLiveLock = (
  groupClassRoomId: number,
  contractorId: number,
  lock: GroupClassRoomLiveLock,
): void => {
  liveLocks.set(groupClassRoomLiveLockKey(groupClassRoomId, contractorId), lock);
};

export const clearGroupClassRoomLiveLock = (
  groupClassRoomId: number,
  contractorId: number,
): void => {
  liveLocks.delete(groupClassRoomLiveLockKey(groupClassRoomId, contractorId));
};

export const applyGroupClassRoomLiveLockFromEvent = ({
  groupClassRoomId,
  contractorId,
  userId,
  preReservedCount,
  isRelease,
}: {
  groupClassRoomId: number;
  contractorId: number;
  userId?: number;
  preReservedCount?: number;
  isRelease: boolean;
}): void => {
  if (isRelease) {
    if (preReservedCount != null && preReservedCount > 0) {
      setGroupClassRoomLiveLock(groupClassRoomId, contractorId, {
        preReservedCount,
        preReservedUserId: undefined,
      });
      return;
    }

    clearGroupClassRoomLiveLock(groupClassRoomId, contractorId);
    return;
  }

  const current = getGroupClassRoomLiveLock(groupClassRoomId, contractorId);
  const nextCount =
    preReservedCount != null
      ? preReservedCount
      : (current?.preReservedCount ?? 0) + 1;

  setGroupClassRoomLiveLock(groupClassRoomId, contractorId, {
    preReservedCount: nextCount,
    preReservedUserId: userId ?? current?.preReservedUserId,
  });
};
