import {
  GroupClassRoom,
  GroupClassRoomSchedule,
} from '../../services/models/response/GroupClassRoomResService';
import {User} from '../../services/models/response/UseResrService';
import {ColorRingConfig, DayType, TimeRanges} from '../../constants/options';
import {GroupClassRoomListParams} from '../types/NavigationTypes';
import {GroupClassRoomQuery} from '../../services/models/requestQueries';

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

const arraysEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

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

  if (arraysEqual(sortedDays, EVEN_DAY_IDS)) {
    return 'روزهای زوج';
  }

  if (arraysEqual(sortedDays, ODD_DAY_IDS)) {
    return 'روزهای فرد';
  }

  return sortedDays.map(day => DAY_LABELS[day] ?? `روز ${day}`).join('، ');
};

export const getPrimarySchedule = (item: GroupClassRoom) =>
  item.schedules?.[0];

export const getTotalPreReservedCount = (item: GroupClassRoom) =>
  item.schedules?.reduce(
    (total, schedule) => total + (schedule.preReservedCount ?? 0),
    0,
  ) ?? 0;

export const getCapacityColors = (filled: number, quantity: number) => {
  const remaining = Math.max(quantity - filled, 0);

  if (remaining === 0) return ColorRingConfig.red;
  if (remaining <= Math.max(quantity * 0.3, 1)) return ColorRingConfig.orange;
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
  organizationUnit?: {value: string} | null;
  service?: {value: string} | null;
}): GroupClassRoomListParams => {
  const params: GroupClassRoomListParams = {};

  if (filters.dayType !== DayType.ALL) {
    params.dayType = filters.dayType;
  }

  if (filters.timeRange !== TimeRanges.ALL) {
    params.timeRange = filters.timeRange;
  }

  if (filters.contractor && filters.contractor.value !== 'all') {
    params.contractor = filters.contractor.value;
  }

  if (filters.organizationUnit) {
    params.organizationUnit = filters.organizationUnit.value;
  }

  if (filters.service && filters.service.value !== 'all') {
    params.service = filters.service.value;
  }

  return params;
};

export const groupClassRoomListParamsToQuery = (
  params: GroupClassRoomListParams,
): GroupClassRoomQuery => ({
  dayType: params.dayType,
  timeRange: params.timeRange,
  contractor: params.contractor,
  organizationUnit: params.organizationUnit,
  service: params.service,
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

  const configContractorId = item.configs?.[0]?.contractorId;
  if (configContractorId) {
    const configContractor = item.contractors?.find(
      contractor => contractor.id === configContractorId,
    );
    if (configContractor) return configContractor;
  }

  return item.contractors?.[0];
};
