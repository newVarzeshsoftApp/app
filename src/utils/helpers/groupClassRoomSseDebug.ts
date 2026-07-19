import type {GroupClassRoomSSEEvent} from './groupClassRoomHelpers';
import type {SharedSSEEvent} from '../hooks/sharedSocketManager';
import {ReservationStatus} from '../../models/enums';
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
    ((data.isLocked === false || data.isLocked === 'false') &&
      data.status !== 'locked' &&
      data.status !== 'reserved' &&
      data.status !== 'pre-reserved');

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

  const isLockedStatus =
    data.status === ReservationStatus.Locked ||
    data.status === ReservationStatus.Reserved ||
    data.status === 'pre-reserved';
  const isRelease =
    data.status === ReservationStatus.Released ||
    data.status === 'cancelled' ||
    (!isLockedStatus &&
      (data.isLocked === false || data.isLocked === 'false'));

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

  pushEntry(decision === 'accepted' ? 'ACCEPT' : 'IGNORE', reason, event);
};

export const setGroupClassRoomSocketConnectedDebug = (connected: boolean) => {
  if (typeof window !== 'undefined') {
    (window as Window & {__gcrSocketConnected?: boolean}).__gcrSocketConnected =
      connected;
  }

  logGroupClassRoomSseDebug('SOCKET', connected ? 'connected' : 'disconnected');
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

type GroupClassRoomFlowLogPayload = {
  viewerUserId?: number;
  eventUserId?: number;
  groupClassRoomId?: number;
  contractorId?: number;
  status?: string;
  isLocked?: string | boolean;
  preReservedCount?: number;
  organizationSku?: string;
  fullEvent?: unknown;
  [key: string]: unknown;
};

const isGroupClassRoomEventShape = (event?: {
  key?: string;
  groupClassRoom?: number;
}): boolean =>
  event?.key === GROUP_CLASS_ROOM_KEY || event?.groupClassRoom != null;

const summarizeGroupClassRoomEvent = (event?: {
  status?: string;
  isLocked?: string | boolean;
  user?: number;
  groupClassRoom?: number;
  contractor?: number;
  preReservedCount?: number;
  organizationSku?: string;
  organizationKey?: string;
  key?: string;
  waitingForGroupClass?: boolean;
}) => ({
  status: event?.status,
  isLocked: event?.isLocked,
  user: event?.user,
  groupClassRoom: event?.groupClassRoom,
  contractor: event?.contractor,
  preReservedCount: event?.preReservedCount,
  organizationSku: event?.organizationSku,
  organizationKey: event?.organizationKey,
  key: event?.key,
  waitingForGroupClass: event?.waitingForGroupClass,
});

/**
 * Clear console log whenever a GCR CLIENT_REMOTE event is about to be sent.
 */
export const logGroupClassRoomEventSending = (
  event: SharedSSEEvent | GroupClassRoomSSEEvent,
  meta?: {source?: string; socketConnected?: boolean},
) => {
  if (!__DEV__ || !isGroupClassRoomEventShape(event)) {
    return;
  }

  const payload = {
    source: meta?.source ?? 'broadcast',
    socketConnected: meta?.socketConnected,
    summary: summarizeGroupClassRoomEvent(event),
    fullEvent: event,
  };

  pushEntry('EVENT-SENDING', 'Group class room event is being sent', payload);

  console.log(
    '%c[GCR-EVENT] SENDING%c status=%s | room=%s | contractor=%s | user=%s',
    'color:#16a34a;font-weight:bold',
    'color:inherit',
    event.status ?? 'n/a',
    event.groupClassRoom ?? 'n/a',
    event.contractor ?? 'n/a',
    event.user ?? 'n/a',
    payload,
  );
};

/**
 * Clear console log whenever a GCR CLIENT_REMOTE event is received.
 */
export const logGroupClassRoomEventReceiving = (
  event: SharedSSEEvent | GroupClassRoomSSEEvent,
  meta?: {source?: string; viewerUserId?: number},
) => {
  if (!__DEV__ || !isGroupClassRoomEventShape(event)) {
    return;
  }

  const payload = {
    source: meta?.source ?? 'socket',
    viewerUserId: meta?.viewerUserId,
    isMyAction:
      meta?.viewerUserId != null &&
      event.user != null &&
      event.user === meta.viewerUserId,
    summary: summarizeGroupClassRoomEvent(event),
    fullEvent: event,
  };

  pushEntry('EVENT-RECEIVED', 'Group class room event was received', payload);

  console.log(
    '%c[GCR-EVENT] RECEIVED%c status=%s | room=%s | contractor=%s | user=%s | source=%s',
    'color:#2563eb;font-weight:bold',
    'color:inherit',
    event.status ?? 'n/a',
    event.groupClassRoom ?? 'n/a',
    event.contractor ?? 'n/a',
    event.user ?? 'n/a',
    meta?.source ?? 'socket',
    payload,
  );
};

const logGroupClassRoomFlow = (
  stage: 'PURCHASE-SENT' | 'PURCHASE-RECEIVED' | 'RELEASE-CALLED' | 'RELEASE-SENT' | 'RELEASE-RECEIVED',
  message: string,
  payload?: GroupClassRoomFlowLogPayload,
) => {
  if (!__DEV__) {
    return;
  }

  pushEntry(stage, message, payload);

  const viewer =
    payload?.viewerUserId != null ? `viewer=${payload.viewerUserId}` : '';
  const actor =
    payload?.eventUserId != null ? `actor=${payload.eventUserId}` : '';
  const room =
    payload?.groupClassRoomId != null
      ? `room=${payload.groupClassRoomId}`
      : '';
  const status = payload?.status != null ? `status=${payload.status}` : '';
  const context = [viewer, actor, room, status].filter(Boolean).join(' | ');

  console.log(
    `%c[GCR] ${stage}%c ${message}${context ? ` (${context})` : ''}`,
    'color:#0ea5e9;font-weight:bold',
    'color:inherit',
    payload ?? '',
  );
};

/** User A: purchase/lock event emitted via socket after add-to-cart */
export const logGroupClassRoomPurchaseSent = (
  payload: GroupClassRoomFlowLogPayload,
) => {
  logGroupClassRoomFlow(
    'PURCHASE-SENT',
    'Purchase/lock event SENT to other users',
    payload,
  );
};

/** User B: purchase/lock event received via socket */
export const logGroupClassRoomPurchaseReceived = (
  payload: GroupClassRoomFlowLogPayload,
) => {
  logGroupClassRoomFlow(
    'PURCHASE-RECEIVED',
    'Purchase/lock event RECEIVED from socket',
    payload,
  );
};

/** User A: release API called when removing GCR item from cart */
export const logGroupClassRoomReleaseCalled = (
  payload: GroupClassRoomFlowLogPayload,
) => {
  logGroupClassRoomFlow(
    'RELEASE-CALLED',
    'Release API CALLED (remove from cart)',
    payload,
  );
};

/** User A: release event emitted via socket after API success */
export const logGroupClassRoomReleaseSent = (
  payload: GroupClassRoomFlowLogPayload,
) => {
  logGroupClassRoomFlow(
    'RELEASE-SENT',
    'Release event SENT to other users',
    payload,
  );
};

/** User B: release event received via socket */
export const logGroupClassRoomReleaseReceived = (
  payload: GroupClassRoomFlowLogPayload,
) => {
  logGroupClassRoomFlow(
    'RELEASE-RECEIVED',
    'Release event RECEIVED from socket',
    payload,
  );
};
