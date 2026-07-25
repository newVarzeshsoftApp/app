import {QueryClient} from '@tanstack/react-query';
import {ReservationStatus} from '../../models/enums';
import {
  GroupClassRoom,
  GroupClassRoomConfig,
  GroupClassRoomSchedule,
} from '../../services/models/response/GroupClassRoomResService';
import {User} from '../../services/models/response/UseResrService';
import {Contractors} from '../../services/models/response/ProductResService';
import {GetAllOrganizationResponse} from '../../services/models/response/OrganizationResServise';
import {ColorRingConfig, DayType, TimeRanges} from '../../constants/options';
import {
  GROUP_CLASS_ROOM_DAY_DISPLAY_ORDER,
  GROUP_CLASS_ROOM_DAY_LABELS,
  GROUP_CLASS_ROOM_EVEN_DAY_IDS,
  GROUP_CLASS_ROOM_KEY,
  GROUP_CLASS_ROOM_ODD_DAY_IDS,
} from '../../constants/groupClassRoom';
import {
  GroupClassRoomDetailParams,
  GroupClassRoomListParams,
} from '../types/NavigationTypes';
import {
  GroupClassRoomPreReserveQuery,
  GroupClassRoomQuery,
} from '../../services/models/requestQueries';
import {
  CartItem,
  getCart,
  GroupClassRoomCartData,
  GroupClassRoomCartScheduleRow,
  RegisteredGroupClassScheduleItem,
} from './CartStorage';
import {
  logGroupClassRoomEventTrace,
  logGroupClassRoomHandlerDecision,
  logGroupClassRoomReleaseFlow,
  logGroupClassRoomSseDebug,
} from './groupClassRoomSseDebug';
import {
  applyGroupClassRoomLiveLockFromEvent,
  getGroupClassRoomLiveLock,
} from './groupClassRoomLiveLocks';

const isSubsetOf = (days: number[], allowed: number[]) =>
  days.length > 0 && days.every(day => allowed.includes(day));

const sortGroupClassRoomDays = (days: number[]) =>
  [...days].sort(
    (a, b) =>
      GROUP_CLASS_ROOM_DAY_DISPLAY_ORDER.indexOf(a) -
      GROUP_CLASS_ROOM_DAY_DISPLAY_ORDER.indexOf(b),
  );

export const getGroupClassRoomDayLabel = (day: number) =>
  GROUP_CLASS_ROOM_DAY_LABELS[day] ?? `روز ${day}`;

const getGroupClassRoomConfigs = (
  item: GroupClassRoom,
): GroupClassRoomConfig[] => {
  if (item.configs?.length) {
    return item.configs;
  }

  if (item.config) {
    return [item.config];
  }

  return [];
};

export const getGroupClassRoomConfig = (
  item: GroupClassRoom,
  filterContractorId?: number,
): GroupClassRoomConfig | undefined => {
  const configs = getGroupClassRoomConfigs(item);

  if (filterContractorId == null) {
    return item.config ?? configs[0];
  }

  const directMatch = configs.find(
    config => config.contractorId === filterContractorId,
  );
  if (directMatch) {
    return directMatch;
  }

  const userMatch = configs.find(config =>
    item.contractors?.some(
      contractor =>
        contractor.id === filterContractorId &&
        (config.contractorId === contractor.id || configs.length === 1),
    ),
  );
  if (userMatch) {
    return userMatch;
  }

  return item.config ?? configs[0];
};

export type GroupClassRoomActionType =
  | 'join'
  | 'waitingList'
  | 'unavailable'
  | 'preReservedByMe';

export type GroupClassRoomActionState = {
  type: GroupClassRoomActionType;
  canPress: boolean;
};

export type GroupClassRoomPreReserveCountMode = 'purchase' | 'waitingList';

export type GroupClassRoomPreReserveDisplay = {
  isPreReservedByMe: boolean;
  othersPreReservedCount: number;
  totalPreReservedCount: number;
  countMode: GroupClassRoomPreReserveCountMode;
};

export const formatScheduleTime = (schedule?: GroupClassRoomSchedule) => {
  if (!schedule) return '';

  const from = schedule.from?.slice(0, 5) ?? '';
  const to = schedule.to?.slice(0, 5) ?? '';

  if (!from || !to) return '';
  return `${from} - ${to}`;
};

export const formatScheduleDaysLabel = (days?: number[]) => {
  if (!days?.length) return '';

  const sortedDays = sortGroupClassRoomDays(days);

  if (isSubsetOf(sortedDays, GROUP_CLASS_ROOM_EVEN_DAY_IDS)) {
    return 'روزهای زوج';
  }

  if (isSubsetOf(sortedDays, GROUP_CLASS_ROOM_ODD_DAY_IDS)) {
    return 'روزهای فرد';
  }

  return sortedDays.map(day => getGroupClassRoomDayLabel(day)).join('، ');
};

export const getPrimarySchedule = (item: GroupClassRoom) => item.schedules?.[0];

export const getGroupClassRoomPreReservedCount = (
  item: GroupClassRoom,
  filterContractorId?: number,
) => {
  const config =
    filterContractorId != null
      ? getGroupClassRoomConfig(item, filterContractorId)
      : item.config ?? getGroupClassRoomConfigs(item)[0];

  const rowContractorId = item.config?.contractorId ?? config?.contractorId;
  const isRowScopedToContractor =
    filterContractorId == null || rowContractorId === filterContractorId;

  let baseCount = 0;

  if (typeof config?.preReservedCount === 'number') {
    baseCount = config.preReservedCount;
  } else if (
    isRowScopedToContractor &&
    typeof item.preReservedCount === 'number'
  ) {
    baseCount = item.preReservedCount;
  } else if (filterContractorId != null) {
    baseCount = 0;
  } else {
    baseCount =
      item.schedules?.reduce(
        (total, schedule) => total + (schedule.preReservedCount ?? 0),
        0,
      ) ?? 0;
  }

  if (filterContractorId == null) {
    return baseCount;
  }

  const liveLock = getGroupClassRoomLiveLock(item.id, filterContractorId);
  if (liveLock?.preReservedCount != null) {
    return Math.max(baseCount, liveLock.preReservedCount);
  }

  return baseCount;
};

// Reads the waiting-list pre-reserve count from an API config/item, tolerating
// the documented snake_case (pre_reserve_waiting_count) alongside camelCase.
const readGroupClassRoomWaitingCount = (
  source?: GroupClassRoomConfig | GroupClassRoom,
): number | undefined => {
  if (!source) {
    return undefined;
  }

  if (typeof source.preReserveWaitingCount === 'number') {
    return source.preReserveWaitingCount;
  }

  const rawCount = (source as Record<string, unknown>)
    .pre_reserve_waiting_count;
  return typeof rawCount === 'number' ? rawCount : undefined;
};

export const getGroupClassRoomPreReserveWaitingCount = (
  item: GroupClassRoom,
  filterContractorId?: number,
): number => {
  const config =
    filterContractorId != null
      ? getGroupClassRoomConfig(item, filterContractorId)
      : item.config ?? getGroupClassRoomConfigs(item)[0];

  const rowContractorId = item.config?.contractorId ?? config?.contractorId;
  const isRowScopedToContractor =
    filterContractorId == null || rowContractorId === filterContractorId;

  let baseCount = 0;

  // The API may return the count as camelCase (preReserveWaitingCount) or the
  // documented snake_case (pre_reserve_waiting_count); accept either.
  const configWaitingCount = readGroupClassRoomWaitingCount(config);
  const itemWaitingCount = readGroupClassRoomWaitingCount(item);

  if (configWaitingCount != null) {
    baseCount = configWaitingCount;
  } else if (isRowScopedToContractor && itemWaitingCount != null) {
    baseCount = itemWaitingCount;
  }

  if (filterContractorId == null) {
    return baseCount;
  }

  const liveLock = getGroupClassRoomLiveLock(item.id, filterContractorId);
  if (liveLock?.preReserveWaitingCount != null) {
    return Math.max(baseCount, liveLock.preReserveWaitingCount);
  }

  return baseCount;
};

export const findGroupClassRoomInCart = (
  cartItems: CartItem[],
  groupClassRoomId: number,
  contractorId?: number,
): CartItem | undefined =>
  cartItems.find(item => {
    if (!item.isGroupClassRoom || !item.groupClassRoomData) {
      return false;
    }

    if (item.groupClassRoomData.groupClassRoomId !== groupClassRoomId) {
      return false;
    }

    if (contractorId == null) {
      return false;
    }

    return item.groupClassRoomData.contractorId === contractorId;
  });

export const getGroupClassRoomPreReservedUserId = (
  item: GroupClassRoom,
  filterContractorId?: number,
): number | undefined => {
  const config = getGroupClassRoomConfig(item, filterContractorId);

  if (typeof config?.preReservedUserId === 'number') {
    return config.preReservedUserId;
  }

  if (
    filterContractorId == null &&
    typeof item.preReservedUserId === 'number'
  ) {
    return item.preReservedUserId;
  }

  return undefined;
};

export const isGroupClassRoomPreReservedByMe = ({
  item,
  userId,
  contractorId,
  cartItems = [],
}: {
  item: GroupClassRoom;
  userId?: number;
  contractorId?: number;
  cartItems?: CartItem[];
}): boolean => {
  if (!userId) {
    return false;
  }

  // Cart is the source of truth for "in my cart" UI. Do not fall back to
  // preReservedUserId — stale API/cache after release would keep showing it.
  return !!findGroupClassRoomInCart(cartItems, item.id, contractorId);
};

export const getGroupClassRoomCapacity = (
  item: GroupClassRoom,
  filterContractorId?: number,
) => {
  const config = getGroupClassRoomConfig(item, filterContractorId);

  if (config) {
    return {
      filled: config.filled ?? 0,
      max: config.contractorMax ?? 0,
    };
  }

  return {
    filled: item.filled ?? 0,
    max: item.quantity ?? 0,
  };
};

export const getGroupClassRoomActionState = (
  item: GroupClassRoom,
  filterContractorId?: number,
  options?: {isPreReservedByMe?: boolean},
): GroupClassRoomActionState => {
  if (options?.isPreReservedByMe) {
    return {type: 'preReservedByMe', canPress: true};
  }

  const config = getGroupClassRoomConfig(item, filterContractorId);
  const capacity = getGroupClassRoomCapacity(item, filterContractorId);
  const isEnabled = item.enabled !== false;

  if (!isEnabled) {
    return {type: 'unavailable', canPress: false};
  }

  const isFull = capacity.max > 0 && capacity.filled >= capacity.max;
  const waitingListCount = config?.waitingListCount ?? 0;
  const waitingListMax = config?.contractorWaitingListMax ?? 0;
  const preReserveWaitingCount = getGroupClassRoomPreReserveWaitingCount(
    item,
    filterContractorId,
  );
  const hasWaitingListSpace =
    waitingListMax > 0 &&
    waitingListCount + preReserveWaitingCount < waitingListMax;

  if (!isFull) {
    return {type: 'join', canPress: true};
  }

  return {
    type: 'waitingList',
    canPress: hasWaitingListSpace,
  };
};

export const getGroupClassRoomPreReserveDisplay = (
  item: GroupClassRoom,
  options?: {
    userId?: number;
    contractorId?: number;
    cartItems?: CartItem[];
  },
): GroupClassRoomPreReserveDisplay => {
  const isPreReservedByMe = isGroupClassRoomPreReservedByMe({
    item,
    userId: options?.userId,
    contractorId: options?.contractorId,
    cartItems: options?.cartItems,
  });
  const actionState = getGroupClassRoomActionState(item, options?.contractorId, {
    isPreReservedByMe,
  });
  const countMode: GroupClassRoomPreReserveCountMode =
    actionState.type === 'waitingList' ? 'waitingList' : 'purchase';
  const totalPreReservedCount =
    countMode === 'waitingList'
      ? getGroupClassRoomPreReserveWaitingCount(item, options?.contractorId)
      : getGroupClassRoomPreReservedCount(item, options?.contractorId);

  return {
    isPreReservedByMe,
    totalPreReservedCount,
    countMode,
    othersPreReservedCount: Math.max(
      0,
      totalPreReservedCount - (isPreReservedByMe ? 1 : 0),
    ),
  };
};

export const getGroupClassRoomPreReserveOthersLabel = (
  count: number,
  countMode: GroupClassRoomPreReserveCountMode,
): string =>
  countMode === 'waitingList'
    ? `${count} نفر برای رزرو اقدام کرده‌اند`
    : `${count} نفر در حال خرید`;

export const getCapacityColors = (filled: number, max: number) => {
  const remaining = Math.max(max - filled, 0);

  if (max > 0 && remaining === 0) return ColorRingConfig.red;
  if (remaining <= Math.max(max * 0.3, 1)) return ColorRingConfig.orange;
  return ColorRingConfig.green;
};

export const normalizeGroupClassRoomResponse = (
  data: unknown,
): GroupClassRoom[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (
    typeof data === 'object' &&
    data !== null &&
    'content' in data &&
    Array.isArray((data as {content: unknown}).content)
  ) {
    return (data as {content: GroupClassRoom[]}).content;
  }

  return [];
};

export const expandGroupClassRoomListItems = (
  items: GroupClassRoom[],
): GroupClassRoom[] => {
  const expanded: GroupClassRoom[] = [];

  items.forEach(item => {
    const configs = getGroupClassRoomConfigs(item);

    if (configs.length <= 1) {
      expanded.push(item);
      return;
    }

    configs.forEach(config => {
      expanded.push({
        ...item,
        config,
        configs: [config],
      });
    });
  });

  return expanded;
};

export const buildGroupClassRoomListParams = (filters: {
  dayType: DayType;
  timeRange: TimeRanges;
  contractor?: {value: string} | null;
  organizationUnit: {value: string};
  service: {value: string};
}): GroupClassRoomListParams => {
  const params: GroupClassRoomListParams = {
    organizationUnit: filters.organizationUnit.value,
    service: filters.service.value,
  };

  if (filters.contractor?.value && filters.contractor.value !== 'all') {
    params.contractor = filters.contractor.value;
  }

  if (filters.dayType !== DayType.ALL) {
    params.dayType = filters.dayType;
  }

  if (filters.timeRange !== TimeRanges.ALL) {
    params.timeRange = filters.timeRange;
  }

  return params;
};

export type GroupClassRoomFilterErrors = {
  organizationUnit?: string;
  service?: string;
  contractor?: string;
};

export const validateGroupClassRoomFilters = (filters: {
  organizationUnit?: {value: string} | null;
  service?: {value: string} | null;
  contractor?: {value: string; data?: User} | null;
}): GroupClassRoomFilterErrors => {
  const errors: GroupClassRoomFilterErrors = {};

  if (!filters.organizationUnit?.value) {
    errors.organizationUnit = 'لطفاً شعبه را انتخاب کنید';
  }

  if (!filters.service?.value) {
    errors.service = 'لطفاً خدمت را انتخاب کنید';
  }

  return errors;
};

export const groupClassRoomListParamsToQuery = (
  params: GroupClassRoomListParams,
): GroupClassRoomQuery => ({
  dayType: params.dayType,
  timeRange: params.timeRange,
  contractor:
    params.contractor && params.contractor !== 'all'
      ? params.contractor
      : undefined,
  organizationUnit: params.organizationUnit,
  service:
    params.service && params.service !== 'all' ? params.service : undefined,
});

export const resolveGroupClassRoomDetailContractorId = (
  item: GroupClassRoom,
  filterContractorId?: number,
): number | undefined => {
  if (filterContractorId != null) {
    return filterContractorId;
  }

  const configContractorId = getGroupClassRoomConfig(item)?.contractorId;
  if (configContractorId != null) {
    return configContractorId;
  }

  return item.contractors?.[0]?.id;
};

export const resolveGroupClassRoomContractor = (
  item: GroupClassRoom,
  selectedContractor?: User,
): User | undefined => {
  if (selectedContractor) {
    const matchedContractor = item.contractors?.find(
      contractor => contractor.id === selectedContractor.id,
    );
    if (matchedContractor) return matchedContractor;
  }

  const configContractorId = getGroupClassRoomConfig(item)?.contractorId;
  if (configContractorId) {
    const configContractor = item.contractors?.find(
      contractor => contractor.id === configContractorId,
    );
    if (configContractor) return configContractor;
  }

  return item.contractors?.[0];
};

export type GroupClassRoomContractorProfile = {
  fullName: string;
  imageName?: string;
  gender?: number;
  firstName?: string;
};

export const getGroupClassRoomContractorProfile = (
  item: GroupClassRoom,
  selectedContractor?: User,
): GroupClassRoomContractorProfile | undefined => {
  const config = getGroupClassRoomConfig(item);

  const contractorForImage = (() => {
    if (selectedContractor) {
      const matchedContractor = item.contractors?.find(
        contractor => contractor.id === selectedContractor.id,
      );
      if (matchedContractor) return matchedContractor;
    }

    if (config?.contractorId) {
      return item.contractors?.find(
        contractor => contractor.id === config.contractorId,
      );
    }

    return item.contractors?.[0];
  })();

  if (config?.contractorFullName) {
    return {
      fullName: config.contractorFullName,
      imageName: contractorForImage?.profile?.name,
      gender: contractorForImage?.gender,
      firstName: contractorForImage?.firstName,
    };
  }

  if (!contractorForImage) return undefined;

  return {
    fullName: [contractorForImage.firstName, contractorForImage.lastName]
      .filter(Boolean)
      .join(' '),
    imageName: contractorForImage.profile?.name,
    gender: contractorForImage.gender,
    firstName: contractorForImage.firstName,
  };
};

export type GroupClassRoomDayOption = {
  day: number;
  label: string;
  from: string;
  to: string;
};

export const getGroupClassRoomDayOptions = (
  item: GroupClassRoom,
): GroupClassRoomDayOption[] => {
  const dayMap = new Map<number, {from: string; to: string}>();

  item.schedules?.forEach(schedule => {
    schedule.days?.forEach(day => {
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          from: schedule.from?.slice(0, 5) ?? '',
          to: schedule.to?.slice(0, 5) ?? '',
        });
      }
    });
  });

  return GROUP_CLASS_ROOM_DAY_DISPLAY_ORDER.filter(day => dayMap.has(day)).map(
    day => ({
      day,
      label: getGroupClassRoomDayLabel(day),
      from: dayMap.get(day)!.from,
      to: dayMap.get(day)!.to,
    }),
  );
};

export const findGroupClassRoomItem = (
  items: GroupClassRoom[],
  groupClassRoomId: number,
  contractorId: number,
) =>
  items.find(item => {
    if (item.id !== groupClassRoomId) {
      return false;
    }

    const config = getGroupClassRoomConfig(item, contractorId);
    return (
      config?.contractorId === contractorId ||
      (item.contractors?.some(contractor => contractor.id === contractorId) ??
        false)
    );
  });

export const groupClassRoomDetailParamsToQuery = (
  params: GroupClassRoomDetailParams,
): GroupClassRoomQuery => groupClassRoomListParamsToQuery(params);

export const resolveGroupClassRoomProductContractor = (
  item: GroupClassRoom,
  contractorId: number,
): Contractors | undefined => {
  const productContractor = item.service?.contractors?.find(
    entry => entry.contractorId === contractorId,
  );

  if (productContractor) {
    const matchedUser = item.contractors?.find(
      contractor => contractor.id === contractorId,
    );

    return {
      ...productContractor,
      contractor: matchedUser ?? productContractor.contractor,
    };
  }

  const matchedUser = item.contractors?.find(
    contractor => contractor.id === contractorId,
  );

  if (!matchedUser) return undefined;

  return {
    contractorId: matchedUser.id,
    contractor: matchedUser,
  };
};

const normalizeScheduleTime = (time?: string): string => {
  if (!time) {
    return '00:00:00';
  }

  if (time.length === 5) {
    return `${time}:00`;
  }

  return time;
};

export const buildRegisteredGroupClassSchedule = (
  classRoom: GroupClassRoom,
  selectedDays?: number[],
): RegisteredGroupClassScheduleItem[] =>
  (classRoom.schedules ?? [])
    .map(schedule => {
      const days = selectedDays?.length
        ? (schedule.days ?? []).filter(day => selectedDays.includes(day))
        : schedule.days ?? [];

      if (!days.length || schedule.id == null) {
        return null;
      }

      return {
        groupClassRoom: classRoom.id,
        id: schedule.id,
        days,
        from: normalizeScheduleTime(schedule.from),
        to: normalizeScheduleTime(schedule.to),
        groupClassRoomScheduleId: schedule.id,
      };
    })
    .filter(
      (entry): entry is RegisteredGroupClassScheduleItem => entry != null,
    );

export const buildGroupClassRoomCartScheduleRows = (
  classRoom: GroupClassRoom,
  selectedDays?: number[],
): GroupClassRoomCartScheduleRow[] => {
  if (selectedDays?.length) {
    return getGroupClassRoomDayOptions(classRoom)
      .filter(option => selectedDays.includes(option.day))
      .map(option => ({
        daysLabel: option.label,
        timeLabel: `${option.from} – ${option.to}`,
      }));
  }

  return (classRoom.schedules ?? [])
    .map(schedule => ({
      daysLabel: formatScheduleDaysLabel(schedule.days),
      timeLabel: formatScheduleTime(schedule).replace(' - ', ' – '),
    }))
    .filter(row => row.daysLabel && row.timeLabel);
};

export const buildGroupClassRoomCartData = (
  classRoom: GroupClassRoom,
  options: {
    contractorId: number;
    selectedContractor?: Contractors | null;
    selectedDays?: number[];
    waitingForGroupClass?: boolean;
  },
): GroupClassRoomCartData => {
  const resolvedContractor =
    options.selectedContractor ??
    resolveGroupClassRoomProductContractor(classRoom, options.contractorId);

  const contractorUser = resolvedContractor?.contractor;
  const contractorName =
    [contractorUser?.firstName, contractorUser?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || classRoom.config?.contractorFullName;

  const scheduleRows = buildGroupClassRoomCartScheduleRows(
    classRoom,
    options.selectedDays,
  );
  const registeredGroupClassSchedule = buildRegisteredGroupClassSchedule(
    classRoom,
    options.selectedDays,
  );

  return {
    groupClassRoomId: classRoom.id,
    contractorId: options.contractorId,
    waitingForGroupClass: options.waitingForGroupClass,
    selectedDays: options.selectedDays,
    contractorName: contractorName || undefined,
    contractorImageName: contractorUser?.profile?.name,
    contractorGender: contractorUser?.gender,
    scheduleRows,
    scheduleDaysLabel:
      scheduleRows.map(row => row.daysLabel).join(' | ') || undefined,
    scheduleTimeLabel:
      scheduleRows.map(row => row.timeLabel).join('، ') || undefined,
    registeredGroupClassSchedule,
  };
};

export const resolveGroupClassRoomPreReserveStatus = (
  _waitingForGroupClass: boolean,
): ReservationStatus => ReservationStatus.Locked;

export type GroupClassRoomSSEEvent = {
  key?: string;
  groupClassRoom?: number;
  contractor?: number;
  user?: number;
  organizationKey?: string;
  organizationSku?: string;
  preReservedCount?: number;
  preReserveWaitingCount?: number;
  filled?: number;
  waitingListCount?: number;
  status?: string;
  isLocked?: string | boolean;
  // True when the action targets the waiting list (backend "is_waiting").
  waiting?: boolean;
};

export const isGroupClassRoomSSEEvent = (
  event: GroupClassRoomSSEEvent,
): boolean =>
  event.key === GROUP_CLASS_ROOM_KEY || event.groupClassRoom != null;

// The backend may emit the waiting flag as camelCase (waiting) or the
// documented snake_case (is_waiting). Normalize both forms here so incoming
// events reliably drive the waiting-list state.
export const isGroupClassRoomWaitingEvent = (
  event: GroupClassRoomSSEEvent,
): boolean => {
  const raw = event as Record<string, unknown>;
  return (
    event.waiting === true ||
    raw.isWaiting === true ||
    raw.is_waiting === true
  );
};

// Reads the waiting-list pre-reserve count from an event, tolerating the
// documented snake_case (pre_reserve_waiting_count) alongside camelCase.
export const getGroupClassRoomEventWaitingCount = (
  event: GroupClassRoomSSEEvent,
): number | undefined => {
  if (typeof event.preReserveWaitingCount === 'number') {
    return event.preReserveWaitingCount;
  }

  const rawCount = (event as Record<string, unknown>)
    .pre_reserve_waiting_count;
  return typeof rawCount === 'number' ? rawCount : undefined;
};

export const isGroupClassRoomEventLocked = (status?: string): boolean =>
  status === ReservationStatus.Locked ||
  status === ReservationStatus.Reserved ||
  status === 'pre-reserved';

export const isGroupClassRoomEventLockSignal = (
  event?: Pick<GroupClassRoomSSEEvent, 'status' | 'isLocked'>,
): boolean => {
  if (!event || isGroupClassRoomEventReleased(event)) {
    return false;
  }

  return (
    isGroupClassRoomEventLocked(event.status) ||
    event.isLocked === true ||
    event.isLocked === 'true'
  );
};

export const isGroupClassRoomEventReleased = (
  event?: Pick<GroupClassRoomSSEEvent, 'status' | 'isLocked'>,
): boolean => {
  if (!event) {
    return false;
  }

  if (
    event.status === ReservationStatus.Released ||
    event.status === ReservationStatus.Cancelled
  ) {
    return true;
  }

  // POST body uses isLocked:false for both lock and release (reserve API convention).
  // When status is locked/reserved, isLocked:false still means a lock — not a release.
  if (event.status && isGroupClassRoomEventLocked(event.status)) {
    return false;
  }

  return event.isLocked === false || event.isLocked === 'false';
};

const groupClassRoomMatchesEventContractor = (
  item: GroupClassRoom,
  contractorId?: number,
): boolean => {
  if (contractorId == null) {
    return false;
  }

  const configs = getGroupClassRoomConfigs(item);
  if (configs.some(config => config.contractorId === contractorId)) {
    return true;
  }

  return item.config?.contractorId === contractorId;
};

type ApplyGroupClassRoomEventOptions = {
  skipAutoAdjust?: boolean;
};

const configMatchesGroupClassRoomEvent = (
  config: GroupClassRoomConfig,
  event: GroupClassRoomSSEEvent,
): boolean => {
  if (event.contractor != null) {
    return config.contractorId === event.contractor;
  }

  if (
    isGroupClassRoomEventReleased(event) &&
    event.user != null &&
    config.preReservedUserId === event.user
  ) {
    return true;
  }

  return false;
};

const patchGroupClassRoomConfigFromEvent = (
  config: GroupClassRoomConfig,
  event: GroupClassRoomSSEEvent,
  options?: ApplyGroupClassRoomEventOptions,
): GroupClassRoomConfig => {
  if (!configMatchesGroupClassRoomEvent(config, event)) {
    return config;
  }

  // Waiting-list actions must adjust preReserveWaitingCount, while regular
  // pre-reserve actions adjust preReservedCount ("pre_reserve_lock" flow).
  const isWaiting = isGroupClassRoomWaitingEvent(event);
  const countKey: 'preReservedCount' | 'preReserveWaitingCount' = isWaiting
    ? 'preReserveWaitingCount'
    : 'preReservedCount';
  const eventCount = isWaiting
    ? getGroupClassRoomEventWaitingCount(event)
    : event.preReservedCount;

  const nextConfig: GroupClassRoomConfig = {
    ...config,
    ...(event.filled != null ? {filled: event.filled} : {}),
    ...(event.waitingListCount != null
      ? {waitingListCount: event.waitingListCount}
      : {}),
    ...(eventCount != null ? {[countKey]: eventCount} : {}),
  };

  if (isGroupClassRoomEventReleased(event)) {
    const currentCount = config[countKey] ?? 0;
    return {
      ...nextConfig,
      preReservedUserId: undefined,
      [countKey]:
        eventCount != null ? eventCount : Math.max(0, currentCount - 1),
    };
  }

  if (
    event.user != null &&
    isGroupClassRoomEventLockSignal(event) &&
    config.preReservedUserId === event.user &&
    eventCount == null
  ) {
    return {
      ...nextConfig,
      preReservedUserId: event.user,
    };
  }

  if (
    eventCount == null &&
    !options?.skipAutoAdjust &&
    isGroupClassRoomEventLockSignal(event)
  ) {
    nextConfig[countKey] = (config[countKey] ?? 0) + 1;
  }

  if (event.user != null && isGroupClassRoomEventLockSignal(event)) {
    return {
      ...nextConfig,
      preReservedUserId: event.user,
    };
  }

  return nextConfig;
};

const patchGroupClassRoomFromEvent = (
  item: GroupClassRoom,
  event: GroupClassRoomSSEEvent,
  options?: ApplyGroupClassRoomEventOptions,
): GroupClassRoom => {
  if (item.id !== event.groupClassRoom) {
    return item;
  }

  // Waiting-list actions adjust item-level preReserveWaitingCount instead of
  // preReservedCount, mirroring the config-level patch logic.
  const isWaiting = isGroupClassRoomWaitingEvent(event);
  const countKey: 'preReservedCount' | 'preReserveWaitingCount' = isWaiting
    ? 'preReserveWaitingCount'
    : 'preReservedCount';
  const eventCount = isWaiting
    ? getGroupClassRoomEventWaitingCount(event)
    : event.preReservedCount;

  if (event.contractor == null) {
    if (!isGroupClassRoomEventReleased(event) || event.user == null) {
      return item;
    }

    const configs = getGroupClassRoomConfigs(item);
    const patchedConfigs = configs.map(config =>
      config.preReservedUserId === event.user
        ? patchGroupClassRoomConfigFromEvent(config, event, options)
        : config,
    );
    const patchedConfig = item.config
      ? item.config.preReservedUserId === event.user
        ? patchGroupClassRoomConfigFromEvent(item.config, event, options)
        : item.config
      : patchedConfigs.find(
          config => config.preReservedUserId === event.user,
        ) ?? patchedConfigs[0];

    return {
      ...item,
      ...(patchedConfigs.length > 0 ? {configs: patchedConfigs} : {}),
      ...(patchedConfig ? {config: patchedConfig} : {}),
      preReservedUserId: undefined,
      [countKey]: Math.max(0, (item[countKey] ?? 0) - 1),
    };
  }

  if (!groupClassRoomMatchesEventContractor(item, event.contractor)) {
    return item;
  }

  const configs = getGroupClassRoomConfigs(item);
  const patchedConfigs = configs.map(config =>
    patchGroupClassRoomConfigFromEvent(config, event, options),
  );
  const patchedConfig = item.config
    ? patchGroupClassRoomConfigFromEvent(item.config, event, options)
    : patchedConfigs[0];

  const shouldPatchItemLevelCounts =
    item.config?.contractorId === event.contractor;

  const patchedItem: GroupClassRoom = {
    ...item,
    ...(patchedConfigs.length > 0 ? {configs: patchedConfigs} : {}),
    ...(patchedConfig ? {config: patchedConfig} : {}),
    ...(shouldPatchItemLevelCounts && eventCount != null
      ? {[countKey]: eventCount}
      : {}),
    ...(shouldPatchItemLevelCounts &&
    event.filled != null &&
    !item.config &&
    configs.length === 0
      ? {filled: event.filled}
      : {}),
  };

  if (isGroupClassRoomEventReleased(event) && shouldPatchItemLevelCounts) {
    return {
      ...patchedItem,
      preReservedUserId: undefined,
      [countKey]:
        eventCount != null ? eventCount : Math.max(0, (item[countKey] ?? 0) - 1),
    };
  }

  return patchedItem;
};

export const applyGroupClassRoomEventToQueryCache = (
  queryClient: QueryClient,
  event: GroupClassRoomSSEEvent,
  options?: ApplyGroupClassRoomEventOptions,
): boolean => {
  if (!event.groupClassRoom) {
    return false;
  }

  const snapshots = queryClient.getQueriesData<unknown>({
    queryKey: ['GroupClassRooms'],
  });

  if (snapshots.length === 0) {
    return false;
  }

  let didPatch = false;

  snapshots.forEach(([queryKey, data]) => {
    if (!data) {
      return;
    }

    const rooms = normalizeGroupClassRoomResponse(data);
    const nextRooms = rooms.map(room =>
      patchGroupClassRoomFromEvent(room, event, options),
    );
    const hasChanges = nextRooms.some(
      (room, index) => JSON.stringify(room) !== JSON.stringify(rooms[index]),
    );

    if (!hasChanges) {
      return;
    }

    didPatch = true;

    if (Array.isArray(data)) {
      queryClient.setQueryData(queryKey, nextRooms);
      return;
    }

    if (
      typeof data === 'object' &&
      data !== null &&
      'content' in data &&
      Array.isArray((data as {content: unknown}).content)
    ) {
      queryClient.setQueryData(queryKey, {
        ...data,
        content: nextRooms,
      });
    }
  });

  return didPatch;
};

export const shouldSkipOwnGroupClassRoomLockEvent = (
  event: GroupClassRoomSSEEvent,
  isMyAction: boolean,
): boolean => isMyAction && isGroupClassRoomEventLockSignal(event);

export const buildGroupClassRoomOptimisticPreReserveEvent = (
  classRoom: GroupClassRoom,
  contractorId: number,
  userId: number,
  waitingForGroupClass: boolean,
  organization?: GetAllOrganizationResponse | null,
): GroupClassRoomSSEEvent => ({
  key: GROUP_CLASS_ROOM_KEY,
  groupClassRoom: classRoom.id,
  contractor: contractorId,
  user: userId,
  status: resolveGroupClassRoomPreReserveStatus(waitingForGroupClass),
  isLocked: true,
  waiting: waitingForGroupClass,
  organizationKey: organization?.key,
  organizationSku: organization?.sku,
  ...(waitingForGroupClass
    ? {
        preReserveWaitingCount:
          getGroupClassRoomPreReserveWaitingCount(classRoom, contractorId) + 1,
      }
    : {
        preReservedCount:
          getGroupClassRoomPreReservedCount(classRoom, contractorId) + 1,
      }),
});

export const groupClassRoomPreReservePayloadToSSEEvent = (
  payload: GroupClassRoomPreReserveQuery,
  options?: {preReservedCount?: number; preReserveWaitingCount?: number},
): GroupClassRoomSSEEvent => ({
  key: payload.key,
  groupClassRoom: payload.groupClassRoom,
  contractor: payload.contractor,
  user: payload.user,
  status: payload.status,
  isLocked: payload.isLocked,
  waiting: payload.isWaiting,
  organizationKey: payload.organizationKey,
  organizationSku: payload.organizationSku,
  ...(options?.preReservedCount != null
    ? {preReservedCount: options.preReservedCount}
    : {}),
  ...(options?.preReserveWaitingCount != null
    ? {preReserveWaitingCount: options.preReserveWaitingCount}
    : {}),
});

export const buildGroupClassRoomLockBroadcastEvent = (
  payload: GroupClassRoomPreReserveQuery,
  counts: {preReservedCount?: number; preReserveWaitingCount?: number},
): GroupClassRoomSSEEvent => ({
  ...groupClassRoomPreReservePayloadToSSEEvent(payload, counts),
  key: payload.key ?? GROUP_CLASS_ROOM_KEY,
});

export const buildGroupClassRoomReleaseEvent = ({
  groupClassRoomId,
  contractorId,
  userId,
  organization,
  preReservedCount,
  preReserveWaitingCount,
  waitingForGroupClass = false,
}: {
  groupClassRoomId: number;
  contractorId: number;
  userId: number;
  organization?: GetAllOrganizationResponse | null;
  preReservedCount?: number;
  preReserveWaitingCount?: number;
  waitingForGroupClass?: boolean;
}): GroupClassRoomSSEEvent => ({
  key: GROUP_CLASS_ROOM_KEY,
  groupClassRoom: groupClassRoomId,
  contractor: contractorId,
  user: userId,
  organizationKey: organization?.key,
  organizationSku: organization?.sku,
  status: ReservationStatus.Released,
  isLocked: undefined,
  waiting: waitingForGroupClass,
  ...(preReservedCount != null ? {preReservedCount} : {}),
  ...(preReserveWaitingCount != null ? {preReserveWaitingCount} : {}),
});

let groupClassRoomRefetchTimer: ReturnType<typeof setTimeout> | null = null;

export const scheduleGroupClassRoomRefetch = (
  queryClient: QueryClient,
  options?: {
    includeInactive?: boolean;
    debugGroupClassRoomId?: number;
    delayMs?: number;
  },
): void => {
  if (groupClassRoomRefetchTimer) {
    clearTimeout(groupClassRoomRefetchTimer);
  }

  const delayMs = options?.delayMs ?? 400;

  groupClassRoomRefetchTimer = setTimeout(() => {
    groupClassRoomRefetchTimer = null;
    void refetchGroupClassRoomQueries(queryClient, options);
  }, delayMs);
};

export const refetchGroupClassRoomsAfterEvent = (
  queryClient: QueryClient,
  options?: {
    includeInactive?: boolean;
    debugGroupClassRoomId?: number;
  },
): void => {
  void refetchGroupClassRoomQueries(queryClient, options);
  scheduleGroupClassRoomRefetch(queryClient, {
    ...options,
    delayMs: 1200,
  });
};

export const groupClassRoomEventMatchesOrganization = (
  event: GroupClassRoomSSEEvent,
  organization?: GetAllOrganizationResponse | null,
): boolean => {
  if (
    organization?.sku &&
    event.organizationSku &&
    event.organizationSku !== organization.sku
  ) {
    return false;
  }

  if (
    organization?.key &&
    event.organizationKey &&
    event.organizationKey !== organization.key
  ) {
    return false;
  }

  return true;
};

export const findGroupClassRoomCartItemByEvent = (
  items: CartItem[],
  event: GroupClassRoomSSEEvent,
): CartItem | undefined =>
  items.find(item => {
    if (!item.isGroupClassRoom || !item.groupClassRoomData) {
      return false;
    }

    if (item.groupClassRoomData.groupClassRoomId !== event.groupClassRoom) {
      return false;
    }

    if (event.contractor == null) {
      return false;
    }

    return item.groupClassRoomData.contractorId === event.contractor;
  });

type ProcessGroupClassRoomRemoteEventOptions = {
  queryClient: QueryClient;
  profileId?: number;
  organization?: GetAllOrganizationResponse | null;
  removeFromCart?: (
    cartId: string,
    options?: {skipGroupClassRoomRelease?: boolean},
  ) => Promise<void>;
};

export const processGroupClassRoomRemoteEvent = async (
  event: GroupClassRoomSSEEvent,
  {
    queryClient,
    profileId,
    organization,
    removeFromCart,
  }: ProcessGroupClassRoomRemoteEventOptions,
): Promise<void> => {
  if (!isGroupClassRoomSSEEvent(event)) {
    return;
  }

  const isMyAction = event.user !== undefined && event.user === profileId;
  const isReleaseEvent = isGroupClassRoomEventReleased(event);

  logGroupClassRoomEventTrace('GCR event received', {
    event,
    viewerUserId: profileId,
    organizationSku: organization?.sku,
    organizationKey: organization?.key,
    isMyAction,
    isReleaseEvent,
  });

  if (!groupClassRoomEventMatchesOrganization(event, organization)) {
    logGroupClassRoomHandlerDecision('ignored', 'organization mismatch', event);
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

  const isLockEvent = isGroupClassRoomEventLockSignal(event);
  const didPatch = applyGroupClassRoomEventToQueryCache(queryClient, event, {
    skipAutoAdjust: false,
  });

  logGroupClassRoomHandlerDecision(
    didPatch ? 'accepted' : 'ignored',
    didPatch
      ? `${isReleaseEvent ? 'release' : 'lock'} cache patched`
      : `${isReleaseEvent ? 'release' : 'lock'} cache unchanged`,
    event,
  );

  // List API does not return updated preReservedCount immediately after lock.
  // Refetching here overwrites optimistic/SSE cache and hides "in purchase" for other users.
  if (isReleaseEvent) {
    refetchGroupClassRoomsAfterEvent(queryClient, {
      includeInactive: true,
      debugGroupClassRoomId: event.groupClassRoom,
    });

    logGroupClassRoomHandlerDecision(
      'accepted',
      'release event; refetch scheduled',
      event,
    );
  } else if (isLockEvent) {
    logGroupClassRoomHandlerDecision(
      'accepted',
      'lock event; cache-only update (no refetch)',
      event,
    );
  }

  if (event.contractor != null) {
    applyGroupClassRoomLiveLockFromEvent({
      groupClassRoomId: event.groupClassRoom,
      contractorId: event.contractor,
      userId: event.user,
      preReservedCount: event.preReservedCount,
      preReserveWaitingCount: getGroupClassRoomEventWaitingCount(event),
      waiting: isGroupClassRoomWaitingEvent(event),
      isRelease: isReleaseEvent,
    });
  }

  if (!isReleaseEvent || !removeFromCart) {
    return;
  }

  // Actor removes cart locally in Carthook; server echo must not double-remove.
  if (isMyAction) {
    return;
  }

  logGroupClassRoomReleaseFlow('SSE release event processed on viewer', {
    groupClassRoomId: event.groupClassRoom,
    contractor: event.contractor,
    eventUser: event.user,
    viewerUserId: profileId,
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
};

export const refetchGroupClassRoomQueries = async (
  queryClient: QueryClient,
  options?: {includeInactive?: boolean; debugGroupClassRoomId?: number},
): Promise<void> => {
  await queryClient.refetchQueries({
    queryKey: ['GroupClassRooms'],
    type: options?.includeInactive ? 'all' : 'active',
  });

  if (__DEV__) {
    const snapshots = queryClient.getQueriesData({
      queryKey: ['GroupClassRooms'],
    });
    const queryData = snapshots[0]?.[1];
    const rooms = normalizeGroupClassRoomResponse(queryData);
    const groupClassRoomId = options?.debugGroupClassRoomId;
    const matchedRoom = groupClassRoomId
      ? rooms.find(room => room.id === groupClassRoomId)
      : undefined;

    logGroupClassRoomSseDebug('REFETCH-DATA', 'refetch', {
      groupClassRoomId,
      roomCount: rooms.length,
      matchedRoomId: matchedRoom?.id,
      matchedPreReservedCount: matchedRoom
        ? getGroupClassRoomPreReservedCount(matchedRoom)
        : undefined,
      matchedPreReserveWaitingCount: matchedRoom
        ? getGroupClassRoomPreReserveWaitingCount(matchedRoom)
        : undefined,
      rooms: groupClassRoomId
        ? undefined
        : rooms.map(room => ({
            id: room.id,
            preReservedCount: getGroupClassRoomPreReservedCount(room),
          })),
    });
  }
};

export const buildGroupClassRoomPreReservePayload = ({
  userId,
  groupClassRoomId,
  contractorId,
  organization,
  waitingForGroupClass = false,
  status,
  isLocked,
}: {
  userId: number;
  groupClassRoomId: number;
  contractorId: number;
  organization?: GetAllOrganizationResponse | null;
  waitingForGroupClass?: boolean;
  status?: ReservationStatus;
  isLocked?: boolean;
}): GroupClassRoomPreReserveQuery => {
  const resolvedStatus =
    status ?? resolveGroupClassRoomPreReserveStatus(waitingForGroupClass);

  return {
    user: userId,
    groupClassRoom: groupClassRoomId,
    contractor: contractorId,
    status: resolvedStatus,
    // API contract uses isWaiting (blue waiting-list button).
    isWaiting: waitingForGroupClass,
    key: GROUP_CLASS_ROOM_KEY,
    organizationKey: organization?.key,
    organizationSku: organization?.sku,
    isLocked: isLocked ?? false,
  };
};

export const buildGroupClassRoomReleasePayload = ({
  userId,
  groupClassRoomId,
  contractorId,
  organization,
  waitingForGroupClass = false,
}: {
  userId: number;
  groupClassRoomId: number;
  contractorId: number;
  organization?: GetAllOrganizationResponse | null;
  waitingForGroupClass?: boolean;
}): GroupClassRoomPreReserveQuery =>
  buildGroupClassRoomPreReservePayload({
    userId,
    groupClassRoomId,
    contractorId,
    organization,
    waitingForGroupClass,
    status: ReservationStatus.Released,
    isLocked: false,
  });
