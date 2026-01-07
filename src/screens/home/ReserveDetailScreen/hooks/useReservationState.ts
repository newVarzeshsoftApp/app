import {useState, useCallback, useMemo} from 'react';
import {
  ServiceEntryDto,
  DayEntryDto,
} from '../../../../services/models/response/ReservationResService';
import {useAuth} from '../../../../utils/hooks/useAuth';
import moment from 'jalali-moment';

interface ReservationState {
  productId: number;
  date: string;
  fromTime: string;
  toTime: string;
  dayName: string;
  status: 'pre-reserved-by-me' | 'pre-reserved-by-others' | 'reserved';
  userId?: number;
}

interface UseReservationStateProps {
  timeSlots: Array<{timeSlot: string; days: DayEntryDto[]}>;
}

export const useReservationState = ({timeSlots}: UseReservationStateProps) => {
  const [reservations, setReservations] = useState<ReservationState[]>([]);
  // Track cancelled items (items that were cancelled but preReservedUserId still exists in API)
  const [cancelledItems, setCancelledItems] = useState<Set<string>>(new Set());
  const {profile} = useAuth();

  // Check if date/time is in the past
  const isPastDateTime = useCallback(
    (date: string, fromTime: string): boolean => {
      try {
        // Parse date (format: YYYY/MM/DD - could be Gregorian or Jalali)
        // API returns dates in Gregorian format (e.g., "2025/12/22")
        const [year, month, day] = date.split('/').map(Number);

        // Get current moment
        const now = moment();

        // Parse item date - try Gregorian first (API format)
        // If year > 2000, it's likely Gregorian, otherwise might be Jalali
        let itemDate: moment.Moment;
        if (year > 2000) {
          // Gregorian date (API format)
          itemDate = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');
        } else {
          // Jalali date (fallback)
          itemDate = moment(`${year}-${month}-${day}`, 'jYYYY-jMM-jDD').locale(
            'fa',
          );
        }

        // Get today's date (start of day)
        const today = now.clone().startOf('day');
        const itemDateStart = itemDate.clone().startOf('day');

        // Compare dates
        const dateDiff = itemDateStart.diff(today, 'days');

        // If date is in the past, return true
        if (dateDiff < 0) {
          return true;
        }

        // If date is today, check time
        if (dateDiff === 0) {
          const [hour, minute] = fromTime.split(':').map(Number);

          // Create item datetime by combining item date with item time
          const itemDateTime = itemDate
            .clone()
            .hour(hour)
            .minute(minute || 0)
            .second(0)
            .millisecond(0);

          // If current time is after or equal to item time, it's past
          return now.isSameOrAfter(itemDateTime);
        }

        // Future date, not past
        return false;
      } catch (error) {
        console.error('Error checking past date/time:', error);
        return false;
      }
    },
    [],
  );

  // Update item state based on reservations
  const getItemState = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
      const [fromTime, toTime] = timeSlot.split('_');
      const itemKey = `${item.id}_${dayData.date}_${fromTime}_${toTime}`;

      // Check if date/time is in the past
      const isPast = isPastDateTime(dayData.date, fromTime);

      // Check if this item was cancelled
      const isCancelled = cancelledItems.has(itemKey);

      const reservation = reservations.find(
        r =>
          r.productId === item.id &&
          r.date === dayData.date &&
          r.fromTime === fromTime &&
          r.toTime === toTime,
      );

      if (reservation) {
        return {
          isPreReserved: true,
          selfReserved: reservation.status === 'pre-reserved-by-me',
          isReserve: reservation.status === 'reserved',
          isPast,
        };
      }

      // If item was cancelled, ignore preReservedUserId from API
      if (isCancelled) {
        return {
          isPreReserved: false,
          selfReserved: false,
          isReserve: item.isReserve,
          isPast,
        };
      }

      // Check if preReservedUserId matches current user
      // If preReservedUserId exists and equals current user ID, it means this item is pre-reserved by me
      const isPreReservedByMeFromData =
        item.preReservedUserId !== undefined &&
        item.preReservedUserId === profile?.id;

      // Return state based on item data and preReservedUserId
      return {
        isPreReserved: item.isPreReserved || isPreReservedByMeFromData,
        selfReserved: item.selfReserved || isPreReservedByMeFromData,
        isReserve: item.isReserve,
        isPast,
      };
    },
    [reservations, profile?.id, cancelledItems, isPastDateTime],
  );

  // Add or update reservation
  const updateReservation = useCallback(
    (
      productId: number,
      date: string,
      fromTime: string,
      toTime: string,
      dayName: string,
      status: ReservationState['status'],
      userId?: number,
    ) => {
      

      setReservations(prev => {
        const existingIndex = prev.findIndex(
          r =>
            r.productId === productId &&
            r.date === date &&
            r.fromTime === fromTime &&
            r.toTime === toTime,
        );

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev];
          updated[existingIndex] = {
            productId,
            date,
            fromTime,
            toTime,
            dayName,
            status,
            userId,
          };

          return updated;
        } else {
          // Add new
          const newReservation = {
            productId,
            date,
            fromTime,
            toTime,
            dayName,
            status,
            userId,
          };

          return [...prev, newReservation];
        }
      });
    },
    [],
  );

  // Remove reservation
  const removeReservation = useCallback(
    (productId: number, date: string, fromTime: string, toTime: string) => {
      

      // Add to cancelled items set to ignore preReservedUserId from API
      const itemKey = `${productId}_${date}_${fromTime}_${toTime}`;
      setCancelledItems(prev => new Set(prev).add(itemKey));

      setReservations(prev => {
        const filtered = prev.filter(
          r =>
            !(
              r.productId === productId &&
              r.date === date &&
              r.fromTime === fromTime &&
              r.toTime === toTime
            ),
        );
        
        return filtered;
      });
    },
    [],
  );

  // Check if item is already pre-reserved by me
  const isPreReservedByMe = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
      const [fromTime, toTime] = timeSlot.split('_');
      const itemKey = `${item.id}_${dayData.date}_${fromTime}_${toTime}`;

      // If item was cancelled, it's not pre-reserved by me
      if (cancelledItems.has(itemKey)) {
        return false;
      }

      const reservation = reservations.find(
        r =>
          r.productId === item.id &&
          r.date === dayData.date &&
          r.fromTime === fromTime &&
          r.toTime === toTime &&
          r.status === 'pre-reserved-by-me',
      );

      // Also check if preReservedUserId matches current user
      const isPreReservedByMeFromData =
        item.preReservedUserId !== undefined &&
        item.preReservedUserId === profile?.id;

      return !!reservation || isPreReservedByMeFromData;
    },
    [reservations, profile?.id, cancelledItems],
  );

  // Clear cancelled item (when API response updates and preReservedUserId is removed)
  const clearCancelledItem = useCallback(
    (productId: number, date: string, fromTime: string, toTime: string) => {
      const itemKey = `${productId}_${date}_${fromTime}_${toTime}`;
      setCancelledItems(prev => {
        const next = new Set(prev);
        next.delete(itemKey);
        return next;
      });
    },
    [],
  );

  // Clear all reservations
  const clearReservations = useCallback(() => {
    setReservations([]);
    setCancelledItems(new Set());
  }, []);

  return {
    reservations,
    getItemState,
    updateReservation,
    removeReservation,
    isPreReservedByMe,
    clearReservations: clearReservations,
    clearCancelledItem,
  };
};
