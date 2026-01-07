import {useMemo} from 'react';
import {useGetReservation} from '../../../../utils/hooks/Reservation/useGetReservation';
import {DayEntryDto} from '../../../../services/models/response/ReservationResService';
import {ReservationQuery} from '../../../../services/models/requestQueries';
import {TimeSlot} from '../utils/types';
import {formatDate} from '../utils/helpers';
import {VISIBLE_DAYS_COUNT} from '../utils/constants';

interface UseReservationDataParams {
  tagId?: number;
  patternId?: number;
  gender?: string;
  saleUnit?: number;
  startTime?: string;
  endTime?: string;
  start?: string;
  end?: string;
  days?: number[] | string;
}

export const useReservationData = (params: UseReservationDataParams) => {
  const query = useMemo(() => {
    const baseQuery: Partial<ReservationQuery> = {};

    if (params.tagId !== undefined) baseQuery.tagId = params.tagId;
    if (params.patternId !== undefined) baseQuery.patternId = params.patternId;
    if (params.gender !== undefined)
      baseQuery.gender = params.gender as 'Female' | 'Male' | 'Both';
    if (params.saleUnit !== undefined) baseQuery.saleUnit = params.saleUnit;
    if (params.startTime !== undefined) baseQuery.startTime = params.startTime;
    if (params.endTime !== undefined) baseQuery.endTime = params.endTime;
    if (params.start !== undefined) baseQuery.start = params.start;
    if (params.end !== undefined) baseQuery.end = params.end;
    if (params.days !== undefined) {
      baseQuery.days = Array.isArray(params.days)
        ? params.days.join(',')
        : params.days;
    }

    return baseQuery as ReservationQuery;
  }, [params]);

  const {
    data: reservationData,
    isLoading,
    error,
    refetch,
  } = useGetReservation(query, true);

  // Parse slots data
  const timeSlots = useMemo((): TimeSlot[] => {
    if (!reservationData) {
      return [];
    }

    let slots = reservationData.slots;

    // If slots doesn't exist, maybe the data itself is slots
    if (
      !slots &&
      typeof reservationData === 'object' &&
      !Array.isArray(reservationData)
    ) {
      const keys = Object.keys(reservationData);
      if (keys.length > 0 && keys.some(key => key.includes('_'))) {
        slots = reservationData as any;
      }
    }

    if (!slots) {
      return [];
    }

    if (typeof slots !== 'object' || slots === null || Array.isArray(slots)) {
      return [];
    }

    const entries = Object.entries(slots);
    if (entries.length === 0) {
      return [];
    }

    return entries.map(([timeSlot, days]) => ({
      timeSlot,
      days: Array.isArray(days) ? (days as DayEntryDto[]) : [],
    }));
  }, [reservationData]);

  // Get date range for header
  const dateRange = useMemo(() => {
    if (!reservationData) {
      return '';
    }

    let slots = reservationData.slots;

    if (
      !slots &&
      typeof reservationData === 'object' &&
      !Array.isArray(reservationData)
    ) {
      const keys = Object.keys(reservationData);
      if (keys.length > 0 && keys.some(key => key.includes('_'))) {
        slots = reservationData as any;
      }
    }

    if (!slots || Object.keys(slots).length === 0) {
      return '';
    }

    const firstSlot = Object.values(slots)[0];
    if (firstSlot && Array.isArray(firstSlot) && firstSlot.length > 0) {
      const dates = firstSlot.map((d: DayEntryDto) => d.date);
      const sortedDates = [...dates].sort();
      const minDate = sortedDates[0];
      const maxDate = sortedDates[sortedDates.length - 1];
      return `از ${formatDate(minDate)} تا ${formatDate(maxDate)}`;
    }
    return '';
  }, [reservationData]);

  // Get max days count across all slots (for pagination)
  const maxDaysInSlot = useMemo(() => {
    return Math.max(...timeSlots.map(slot => slot.days.length), 0);
  }, [timeSlots]);

  // Calculate total pages based on max days in any slot
  const totalPagesForSlots = useMemo(() => {
    return Math.ceil(maxDaysInSlot / VISIBLE_DAYS_COUNT);
  }, [maxDaysInSlot]);

  return {
    reservationData,
    timeSlots,
    dateRange,
    maxDaysInSlot,
    totalPagesForSlots,
    isLoading,
    error,
    refetch,
  };
};
