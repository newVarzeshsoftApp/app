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
import {CartItem, GroupClassRoomCartData, GroupClassRoomCartScheduleRow} from './CartStorage';
import {logGroupClassRoomRefetchSnapshot} from './groupClassRoomSseDebug';

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

export type GroupClassRoomPreReserveDisplay = {
  isPreReservedByMe: boolean;
  othersPreReservedCount: number;
  totalPreReservedCount: number;
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

export const getGroupClassRoomPreReservedCount = (item: GroupClassRoom) => {
  if (typeof item.preReservedCount === 'number') {
    return item.preReservedCount;
  }

  return (
    item.schedules?.reduce(
      (total, schedule) => total + (schedule.preReservedCount ?? 0),
      0,
    ) ?? 0
  );
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
      return true;
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

  if (typeof item.preReservedUserId === 'number') {
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

  if (findGroupClassRoomInCart(cartItems, item.id, contractorId)) {
    return true;
  }

  return getGroupClassRoomPreReservedUserId(item, contractorId) === userId;
};

export const getGroupClassRoomPreReserveDisplay = (
  item: GroupClassRoom,
  options?: {
    userId?: number;
    contractorId?: number;
    cartItems?: CartItem[];
  },
): GroupClassRoomPreReserveDisplay => {
  const totalPreReservedCount = getGroupClassRoomPreReservedCount(item);
  const isPreReservedByMe = isGroupClassRoomPreReservedByMe({
    item,
    userId: options?.userId,
    contractorId: options?.contractorId,
    cartItems: options?.cartItems,
  });

  return {
    isPreReservedByMe,
    totalPreReservedCount,
    othersPreReservedCount: Math.max(
      0,
      totalPreReservedCount - (isPreReservedByMe ? 1 : 0),
    ),
  };
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
  const hasWaitingListSpace =
    (config?.waitingListCount ?? 0) < (config?.contractorWaitingListMax ?? 0);

  if (!isFull) {
    return {type: 'join', canPress: true};
  }

  return {
    type: 'waitingList',
    canPress: hasWaitingListSpace,
  };
};

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

  return {
    groupClassRoomId: classRoom.id,
    contractorId: options.contractorId,
    waitingForGroupClass: options.waitingForGroupClass,
    selectedDays: options.selectedDays,
    contractorName: contractorName || undefined,
    contractorImageName: contractorUser?.profile?.name,
    contractorGender: contractorUser?.gender,
    scheduleRows,
    scheduleDaysLabel: scheduleRows.map(row => row.daysLabel).join(' | ') || undefined,
    scheduleTimeLabel: scheduleRows.map(row => row.timeLabel).join('، ') || undefined,
  };
};

export const resolveGroupClassRoomPreReserveStatus = (
  waitingForGroupClass: boolean,
): ReservationStatus =>
  waitingForGroupClass
    ? ReservationStatus.Reserved
    : ReservationStatus.Locked;

export type GroupClassRoomSSEEvent = {
  key?: string;
  groupClassRoom?: number;
  contractor?: number;
  user?: number;
  organizationKey?: string;
  organizationSku?: string;
  preReservedCount?: number;
  filled?: number;
  waitingListCount?: number;
  status?: string;
  isLocked?: string | boolean;
};

export const isGroupClassRoomSSEEvent = (
  event: GroupClassRoomSSEEvent,
): boolean =>
  event.key === GROUP_CLASS_ROOM_KEY || event.groupClassRoom != null;

export const isGroupClassRoomEventLocked = (
  status?: string,
): boolean =>
  status === ReservationStatus.Locked ||
  status === ReservationStatus.Reserved ||
  status === 'pre-reserved';

export const isGroupClassRoomEventReleased = (
  event?: Pick<GroupClassRoomSSEEvent, 'status' | 'isLocked'>,
): boolean => {
  if (!event) {
    return false;
  }

  if (
    event.status === ReservationStatus.Released ||
    event.status === 'cancelled'
  ) {
    return true;
  }

  return event.isLocked === false || event.isLocked === 'false';
};

export const shouldSkipOwnGroupClassRoomLockEvent = (
  event: GroupClassRoomSSEEvent,
  isMyAction: boolean,
): boolean => isMyAction && event.status === ReservationStatus.Locked;

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
      return true;
    }

    return item.groupClassRoomData.contractorId === event.contractor;
  });

const GROUP_CLASS_ROOM_REFETCH_RETRY_DELAYS_MS = [400, 1000, 2000];

export const refetchGroupClassRoomQueries = async (
  queryClient: QueryClient,
  options?: {includeInactive?: boolean; debugGroupClassRoomId?: number},
): Promise<void> => {
  const refetch = async (label: string, cancelRefetch = true) => {
    await queryClient.refetchQueries({
      queryKey: ['GroupClassRooms'],
      type: options?.includeInactive ? 'all' : 'active',
      cancelRefetch,
    });

    if (__DEV__) {
      const snapshots = queryClient.getQueriesData({
        queryKey: ['GroupClassRooms'],
      });

      logGroupClassRoomRefetchSnapshot(
        label,
        snapshots[0]?.[1],
        options?.debugGroupClassRoomId,
      );
    }
  };

  await refetch('immediate refetch', true);

  GROUP_CLASS_ROOM_REFETCH_RETRY_DELAYS_MS.forEach(delayMs => {
    setTimeout(() => {
      void refetch(`retry refetch +${delayMs}ms`, false);
    }, delayMs);
  });
};

export const buildGroupClassRoomPreReservePayload = ({
  userId,
  groupClassRoomId,
  contractorId,
  organization,
  waitingForGroupClass = false,
  status,
}: {
  userId: number;
  groupClassRoomId: number;
  contractorId: number;
  organization?: GetAllOrganizationResponse | null;
  waitingForGroupClass?: boolean;
  status?: ReservationStatus;
}): GroupClassRoomPreReserveQuery => ({
  user: userId,
  groupClassRoom: groupClassRoomId,
  contractor: contractorId,
  status: status ?? resolveGroupClassRoomPreReserveStatus(waitingForGroupClass),
  waitingForGroupClass,
  key: GROUP_CLASS_ROOM_KEY,
  organizationKey: organization?.key,
  organizationSku: organization?.sku,
});

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
  });
