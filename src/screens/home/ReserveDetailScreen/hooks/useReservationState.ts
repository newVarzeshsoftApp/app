import {useState, useCallback, useMemo} from 'react';
import {ServiceEntryDto, DayEntryDto} from '../../../../services/models/response/ReservationResService';

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

  // Update item state based on reservations
  const getItemState = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
      const [fromTime, toTime] = timeSlot.split('_');
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
        };
      }

      // Return original state if no reservation in our state
      return {
        isPreReserved: item.isPreReserved,
        selfReserved: item.selfReserved,
        isReserve: item.isReserve,
      };
    },
    [reservations],
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
      console.log('🔄 updateReservation called:', {
        productId,
        date,
        fromTime,
        toTime,
        dayName,
        status,
        userId,
      });
      
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
          console.log('✅ Updated existing reservation:', updated[existingIndex]);
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
          console.log('➕ Added new reservation:', newReservation);
          return [...prev, newReservation];
        }
      });
    },
    [],
  );

  // Remove reservation
  const removeReservation = useCallback(
    (productId: number, date: string, fromTime: string, toTime: string) => {
      setReservations(prev =>
        prev.filter(
          r =>
            !(
              r.productId === productId &&
              r.date === date &&
              r.fromTime === fromTime &&
              r.toTime === toTime
            ),
        ),
      );
    },
    [],
  );

  // Check if item is already pre-reserved by me
  const isPreReservedByMe = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
      const [fromTime, toTime] = timeSlot.split('_');
      const reservation = reservations.find(
        r =>
          r.productId === item.id &&
          r.date === dayData.date &&
          r.fromTime === fromTime &&
          r.toTime === toTime &&
          r.status === 'pre-reserved-by-me',
      );
      return !!reservation;
    },
    [reservations],
  );

  // Clear all reservations
  const clearReservations = useCallback(() => {
    setReservations([]);
  }, []);

  return {
    reservations,
    getItemState,
    updateReservation,
    removeReservation,
    isPreReservedByMe,
    clearReservations,
  };
};

