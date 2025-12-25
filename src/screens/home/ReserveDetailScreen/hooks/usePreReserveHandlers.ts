import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {usePreReserve} from '../../../../utils/hooks/Reservation/usePreReserve';
import {PreReserveQuery} from '../../../../services/models/requestQueries';
import {
  ServiceEntryDto,
  DayEntryDto,
} from '../../../../services/models/response/ReservationResService';
import {PreReserveBottomSheetRef} from '../../../../components/Reservation/PreReserveBottomSheet';
import {SelectedItemData} from '../utils/types';
import {useAuth} from '../../../../utils/hooks/useAuth';

interface UsePreReserveHandlersProps {
  gender?: string;
  refetch?: () => void; // Optional - not used anymore, updates come from SSE events
  preReserveBottomSheetRef: React.RefObject<PreReserveBottomSheetRef>;
  isPreReservedByMe: (
    item: ServiceEntryDto,
    dayData: DayEntryDto,
    timeSlot: string,
  ) => boolean;
  getItemState: (
    item: ServiceEntryDto,
    dayData: DayEntryDto,
    timeSlot: string,
  ) => {
    isPreReserved: boolean;
    selfReserved: boolean;
    isReserve: boolean;
  };
  updateReservation: (
    productId: number,
    date: string,
    fromTime: string,
    toTime: string,
    dayName: string,
    status: 'pre-reserved-by-me' | 'pre-reserved-by-others' | 'reserved',
    userId?: number,
  ) => void;
  removeReservation: (
    productId: number,
    date: string,
    fromTime: string,
    toTime: string,
  ) => void;
  onPreReserveSuccess?: (data: {
    item: ServiceEntryDto;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
    dayData: DayEntryDto;
    subProducts: any[];
    modifiedQuantities: Record<number, number>;
  }) => void;
  reservations?: Array<{
    productId: number;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
    status: 'pre-reserved-by-me' | 'pre-reserved-by-others' | 'reserved';
    userId?: number;
  }>;
}

export const usePreReserveHandlers = ({
  gender,
  refetch,
  preReserveBottomSheetRef,
  isPreReservedByMe,
  getItemState,
  updateReservation,
  removeReservation,
  onPreReserveSuccess,
  reservations = [],
}: UsePreReserveHandlersProps) => {
  const preReserveMutation = usePreReserve();
  const {profile} = useAuth();
  const [selectedItemData, setSelectedItemData] =
    useState<SelectedItemData | null>(null);

  const handleServiceItemClick = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
      // بررسی اینکه آیا item قابل کلیک است یا نه
      // فقط قابل رزرو یا در حال رزرو توسط من قابل کلیک هستند
      const itemState = getItemState(item, dayData, timeSlot);
      const isMyReservation = isPreReservedByMe(item, dayData, timeSlot);
      const isAvailable = !itemState.isReserve && !itemState.isPreReserved;
      const isPast = itemState.isPast || false;

      // اگر تاریخ یا ساعت گذشته است، هیچ کاری نکن
      if (isPast) {
        return;
      }

      // اگر قابل کلیک نیست، هیچ کاری نکن
      if (!isAvailable && !isMyReservation) {
        return;
      }

      // اگر قبلاً pre-reserved شده توسط من، فقط bottom sheet را باز کن
      // این شامل مواردی است که از API با preReservedUserId می‌آیند
      if (isMyReservation) {
        const [fromTime, toTime] = timeSlot.split('_');
        
        // اگر preReservedUserId از API آمده و در state نیست، به state اضافه کن
        // این باعث می‌شود که حذف درست کار کند
        const hasPreReservedUserId =
          item.preReservedUserId !== undefined &&
          item.preReservedUserId === profile?.id;
        const reservationExists = reservations.find(
          r =>
            r.productId === item.id &&
            r.date === dayData.date &&
            r.fromTime === fromTime &&
            r.toTime === toTime,
        );
        
        // اگر preReservedUserId هست ولی در state نیست، اضافه کن
        // این باعث می‌شود که حذف درست کار کند
        if (hasPreReservedUserId && !reservationExists) {

          updateReservation(
            item.id,
            dayData.date,
            fromTime,
            toTime,
            dayData.name,
            'pre-reserved-by-me',
            profile?.id,
          );
        }
        
        // Set selectedItemData before opening bottom sheet
        setSelectedItemData({item, dayData, timeSlot});

        // Open bottom sheet with proper delay to ensure ref is ready
        const openBottomSheet = () => {
          if (preReserveBottomSheetRef.current) {
            preReserveBottomSheetRef.current.open({
              item,
              date: dayData.date,
              fromTime,
              toTime,
              dayName: dayData.name,
              dayData,
            });
          } else {
            // Retry if ref is not ready yet
            setTimeout(openBottomSheet, 50);
          }
        };

        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          setTimeout(openBottomSheet, 100);
        });
        return;
      }

      // در غیر این صورت (قابل رزرو)، pre-reserve را صدا بزن
      const [fromTime, toTime] = timeSlot.split('_');

      const query: PreReserveQuery = {
        product: item.id,
        day: dayData.name,
        fromTime: fromTime,
        toTime: toTime,
        gender: gender || 'Both',
        specificDate: dayData.date,
        isLocked: false,
      };

      preReserveMutation.mutate(query, {
        onSuccess: response => {
          // Set selectedItemData first
          setSelectedItemData({item, dayData, timeSlot});

          // Update state immediately before opening bottom sheet
          // This ensures state is set before any SSE events arrive
          updateReservation(
            item.id,
            dayData.date,
            fromTime,
            toTime,
            dayData.name,
            'pre-reserved-by-me',
            profile?.id,
          );

          // Call onPreReserveSuccess callback if provided
          // This will add the item to the pre-reserved list
          if (onPreReserveSuccess) {
            // Get subProducts from item
            const subProducts = (item.subProducts as any[]) || [];
            onPreReserveSuccess({
              item,
              date: dayData.date,
              fromTime,
              toTime,
              dayName: dayData.name,
              dayData,
              subProducts,
              modifiedQuantities: {}, // Initial quantities are 0
            });
          }

          // Open bottom sheet after state is updated.
          // IMPORTANT: On first interaction, the ref may not be ready yet (especially on web/slow devices),
          // so we retry a few times to avoid the "state changes but sheet doesn't open" bug.
          const openBottomSheet = (attempt = 0) => {
            const ref = preReserveBottomSheetRef.current;
            if (ref) {
              ref.open({
                item,
                date: dayData.date,
                fromTime,
                toTime,
                dayName: dayData.name,
                dayData,
              });
              return;
            }

            if (attempt < 10) {
              setTimeout(() => openBottomSheet(attempt + 1), 50);
            }
          };

          // Use requestAnimationFrame to ensure the component tree/refs have committed before opening.
          requestAnimationFrame(() => {
            setTimeout(() => openBottomSheet(0), 0);
          });

          // Don't refetch - only update local state
        },
        onError: error => {
          Alert.alert('خطا', error.message || 'خطا در ارسال درخواست');
        },
      });
    },
    [
      gender,
      preReserveMutation,
      preReserveBottomSheetRef,
      isPreReservedByMe,
      getItemState,
      updateReservation,
      profile?.id,
      onPreReserveSuccess,
      reservations,
    ],
  );

  const handleDeleteReservation = useCallback(
    (data: {
      item: ServiceEntryDto;
      date: string;
      fromTime: string;
      toTime: string;
      dayName: string;
      dayData: DayEntryDto;
    }) => {
      // Use data from bottom sheet
      const {item, dayData, fromTime, toTime} = data;

      const query: PreReserveQuery = {
        product: item.id,
        day: dayData.name,
        fromTime: fromTime,
        toTime: toTime,
        gender: gender || 'Both',
        specificDate: dayData.date,
        isLocked: false,
      };

      preReserveMutation.mutate(query, {
        onSuccess: () => {
          // Remove from state (don't refetch, just update local state)
          // IMPORTANT: Always remove from state, even if it came from API (preReservedUserId)
          // This ensures UI updates correctly
          removeReservation(item.id, dayData.date, fromTime, toTime);
          // Clear reservation state after successful deletion
          preReserveBottomSheetRef.current?.clearCurrentReservationState();
          preReserveBottomSheetRef.current?.close();
          setSelectedItemData(null);
          // Don't refetch - only update local state
          // SSE event will handle the update for other users
        },
        onError: error => {
          Alert.alert('خطا', error.message || 'خطا در لغو رزرو');
        },
      });
    },
    [gender, preReserveMutation, preReserveBottomSheetRef, removeReservation],
  );

  const handleAddNewReservation = useCallback(() => {
    preReserveBottomSheetRef.current?.close();
  }, [preReserveBottomSheetRef]);

  // Get loading items for specific service
  const getLoadingItems = useCallback(() => {
    if (!preReserveMutation.isPending || !preReserveMutation.variables) {
      return [];
    }

    const vars = preReserveMutation.variables;
    return [
      {
        productId: vars.product,
        date: vars.specificDate || '',
        fromTime: vars.fromTime || '',
        toTime: vars.toTime || '',
      },
    ];
  }, [preReserveMutation.isPending, preReserveMutation.variables]);

  return {
    handleServiceItemClick,
    handleDeleteReservation,
    handleAddNewReservation,
    getLoadingItems,
    isPending: preReserveMutation.isPending,
  };
};
