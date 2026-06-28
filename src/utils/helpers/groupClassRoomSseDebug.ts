import type {GroupClassRoomSSEEvent} from './groupClassRoomHelpers';
import {
  getGroupClassRoomPreReservedCount,
  isGroupClassRoomEventReleased,
  isGroupClassRoomSSEEvent,
  normalizeGroupClassRoomResponse,
} from './groupClassRoomHelpers';
import type {SharedSSEEvent} from '../hooks/sharedSocketManager';
import {GROUP_CLASS_ROOM_KEY} from '../../constants/groupClassRoom';

type DebugEntry = {
  at: string;
  stage: string;
  message: string;
  payload?: unknown;
};

const MAX_ENTRIES = 80;
const entries: DebugEntry[] = [];

const syncWindowDebug = () => {
  if (typeof window === 'undefined') {
    return;
  }

  (window as Window & {__gcrSseDebug?: unknown}).__gcrSseDebug = {
    entries,
    socketConnected: (window as Window & {__gcrSocketConnected?: boolean})
      .__gcrSocketConnected,
    print: () => console.table(entries),
    clear: () => {
      entries.length = 0;
      syncWindowDebug();
    },
  };
};

const pushEntry = (stage: string, message: string, payload?: unknown) => {
  const entry: DebugEntry = {
    at: new Date().toISOString(),
    stage,
    message,
    payload,
  };

  entries.unshift(entry);
  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }

  syncWindowDebug();
  console.log(`[GCR-SSE] ${stage}: ${message}`, payload ?? '');
};

export const logGroupClassRoomSseDebug = (
  stage: string,
  message: string,
  payload?: unknown,
) => {
  if (!__DEV__) {
    return;
  }

  pushEntry(stage, message, payload);
};

export const logGroupClassRoomRawSocketEvent = (
  eventName: string,
  data: SharedSSEEvent,
) => {
  if (!__DEV__) {
    return;
  }

  const isGcrEvent =
    data.key === GROUP_CLASS_ROOM_KEY || data.groupClassRoom != null;
  const looksLikeRelease =
    data.status === 'released' ||
    data.status === 'cancelled' ||
    data.isLocked === false ||
    data.isLocked === 'false';

  if (looksLikeRelease && !isGcrEvent) {
    pushEntry(
      'RAW-RELEASE-UNKNOWN',
      `socket "${eventName}" release-like but NOT GCR-shaped`,
      data,
    );
    return;
  }

  if (!isGcrEvent) {
    return;
  }

  const gcrEvent = data as GroupClassRoomSSEEvent;
  const isRelease = isGroupClassRoomSSEEvent(gcrEvent)
    ? isGroupClassRoomEventReleased(gcrEvent)
    : false;

  pushEntry(
    isRelease ? 'RAW-RELEASE' : 'RAW',
    `socket "${eventName}"${isRelease ? ' [RELEASE]' : ''}`,
    {
      status: data.status,
      isLocked: data.isLocked,
      user: data.user,
      groupClassRoom: data.groupClassRoom,
      contractor: data.contractor,
      organizationSku: data.organizationSku,
      organizationKey: data.organizationKey,
      key: data.key,
      preReservedCount: data.preReservedCount,
      fullEvent: data,
    },
  );
};

export const logGroupClassRoomHandlerDecision = (
  decision: 'accepted' | 'ignored',
  reason: string,
  event?: GroupClassRoomSSEEvent,
) => {
  if (!__DEV__) {
    return;
  }

  pushEntry(
    decision === 'accepted' ? 'ACCEPT' : 'IGNORE',
    reason,
    event,
  );
};

export const setGroupClassRoomSocketConnectedDebug = (connected: boolean) => {
  if (typeof window !== 'undefined') {
    (window as Window & {__gcrSocketConnected?: boolean}).__gcrSocketConnected =
      connected;
  }

  logGroupClassRoomSseDebug(
    'SOCKET',
    connected ? 'connected' : 'disconnected',
  );
};

export const logGroupClassRoomReleaseFlow = (
  message: string,
  payload?: unknown,
) => {
  logGroupClassRoomSseDebug('RELEASE', message, payload);
};

export const logGroupClassRoomEventTrace = (
  message: string,
  payload?: unknown,
) => {
  logGroupClassRoomSseDebug('TRACE', message, payload);
};

export const logGroupClassRoomRefetchSnapshot = (
  message: string,
  queryData: unknown,
  groupClassRoomId?: number,
) => {
  const rooms = normalizeGroupClassRoomResponse(queryData);
  const matchedRoom = groupClassRoomId
    ? rooms.find(room => room.id === groupClassRoomId)
    : undefined;

  logGroupClassRoomSseDebug('REFETCH-DATA', message, {
    groupClassRoomId,
    roomCount: rooms.length,
    matchedRoomId: matchedRoom?.id,
    matchedPreReservedCount: matchedRoom
      ? getGroupClassRoomPreReservedCount(matchedRoom)
      : undefined,
    rooms: groupClassRoomId
      ? undefined
      : rooms.map(room => ({
          id: room.id,
          preReservedCount: getGroupClassRoomPreReservedCount(room),
        })),
  });
};
