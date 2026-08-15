type GroupClassRoomLiveLock = {
  preReservedCount?: number;
  preReserveWaitingCount?: number;
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
  preReserveWaitingCount,
  waiting = false,
  isRelease,
}: {
  groupClassRoomId: number;
  contractorId: number;
  userId?: number;
  preReservedCount?: number;
  preReserveWaitingCount?: number;
  waiting?: boolean;
  isRelease: boolean;
}): void => {
  const current = getGroupClassRoomLiveLock(groupClassRoomId, contractorId);
  // Waiting-list actions track preReserveWaitingCount; regular actions track
  // preReservedCount ("pre_reserve_lock" flow).
  const countKey: 'preReservedCount' | 'preReserveWaitingCount' = waiting
    ? 'preReserveWaitingCount'
    : 'preReservedCount';
  const eventCount = waiting ? preReserveWaitingCount : preReservedCount;

  if (isRelease) {
    const resolvedCount =
      eventCount != null
        ? eventCount
        : Math.max(0, (current?.[countKey] ?? 0) - 1);

    const nextLock: GroupClassRoomLiveLock = {
      ...current,
      [countKey]: resolvedCount,
      preReservedUserId: undefined,
    };

    // Drop the in-memory lock entirely once no optimistic counts remain.
    if (
      (nextLock.preReservedCount ?? 0) <= 0 &&
      (nextLock.preReserveWaitingCount ?? 0) <= 0
    ) {
      clearGroupClassRoomLiveLock(groupClassRoomId, contractorId);
      return;
    }

    setGroupClassRoomLiveLock(groupClassRoomId, contractorId, nextLock);
    return;
  }

  const nextCount =
    eventCount != null ? eventCount : (current?.[countKey] ?? 0) + 1;

  setGroupClassRoomLiveLock(groupClassRoomId, contractorId, {
    ...current,
    [countKey]: nextCount,
    preReservedUserId: userId ?? current?.preReservedUserId,
  });
};
