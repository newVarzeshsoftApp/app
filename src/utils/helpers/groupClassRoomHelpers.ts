import {ReservationStatus} from '../../models/enums';
import {
  GroupClassRoom,
  GroupClassRoomSchedule,
} from '../../services/models/response/GroupClassRoomResService';
import {User} from '../../services/models/response/UseResrService';
import {Contractors} from '../../services/models/response/ProductResService';
import {GetAllOrganizationResponse} from '../../services/models/response/OrganizationResServise';
import {ColorRingConfig, DayType, TimeRanges} from '../../constants/options';
import {
  GROUP_CLASS_ROOM_DAY_DISPLAY_ORDER,
  GROUP_CLASS_ROOM_KEY,
} from '../../constants/groupClassRoom';
import {
  GroupClassRoomDetailParams,
  GroupClassRoomListParams,
} from '../types/NavigationTypes';
import {
  GroupClassRoomPreReserveQuery,
  GroupClassRoomQuery,
} from '../../services/models/requestQueries';

const EVEN_DAY_IDS = [6, 1, 3];
const ODD_DAY_IDS = [0, 2, 4];

const DAY_LABELS: Record<number, string> = {
  0: 'یکشنبه',
  1: 'دوشنبه',
  2: 'سه‌شنبه',
  3: 'چهارشنبه',
  4: 'پنجشنبه',
  5: 'جمعه',
  6: 'شنبه',
};

const isSubsetOf = (days: number[], allowed: number[]) =>
  days.length > 0 && days.every(day => allowed.includes(day));

export const getGroupClassRoomConfig = (item: GroupClassRoom) =>
  item.config ?? item.configs?.[0];

export type GroupClassRoomActionType = 'join' | 'waitingList' | 'unavailable';

export type GroupClassRoomActionState = {
  type: GroupClassRoomActionType;
  canPress: boolean;
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

  const sortedDays = [...days].sort((a, b) => a - b);

  if (isSubsetOf(sortedDays, EVEN_DAY_IDS)) {
    return 'روزهای زوج';
  }

  if (isSubsetOf(sortedDays, ODD_DAY_IDS)) {
    return 'روزهای فرد';
  }

  return sortedDays.map(day => DAY_LABELS[day] ?? `روز ${day}`).join('، ');
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

export const getGroupClassRoomCapacity = (item: GroupClassRoom) => {
  const config = getGroupClassRoomConfig(item);

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
): GroupClassRoomActionState => {
  const config = getGroupClassRoomConfig(item);
  const capacity = getGroupClassRoomCapacity(item);
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
  contractor: {value: string};
  organizationUnit: {value: string};
  service: {value: string};
}): GroupClassRoomListParams => {
  const params: GroupClassRoomListParams = {
    organizationUnit: filters.organizationUnit.value,
    service: filters.service.value,
    contractor: filters.contractor.value,
  };

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

  if (!filters.contractor?.data || filters.contractor.value === 'all') {
    errors.contractor = 'لطفاً مربی را انتخاب کنید';
  }

  return errors;
};

export const groupClassRoomListParamsToQuery = (
  params: GroupClassRoomListParams,
): GroupClassRoomQuery => ({
  dayType: params.dayType,
  timeRange: params.timeRange,
  contractor: params.contractor,
  organizationUnit: params.organizationUnit,
  service:
    params.service && params.service !== 'all' ? params.service : undefined,
});

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
      label: DAY_LABELS[day] ?? `روز ${day}`,
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
  items.find(
    item =>
      item.id === groupClassRoomId &&
      getGroupClassRoomConfig(item)?.contractorId === contractorId,
  );

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

export const buildGroupClassRoomPreReservePayload = ({
  userId,
  groupClassRoomId,
  contractorId,
  organization,
  status = ReservationStatus.Reserved,
}: {
  userId: number;
  groupClassRoomId: number;
  contractorId: number;
  organization?: GetAllOrganizationResponse | null;
  status?: ReservationStatus;
}): GroupClassRoomPreReserveQuery => ({
  user: userId,
  groupClassRoom: groupClassRoomId,
  contractor: contractorId,
  status,
  key: GROUP_CLASS_ROOM_KEY,
  organizationKey: organization?.key,
  organizationSku: organization?.sku,
});
