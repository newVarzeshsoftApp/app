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
  refetch: () => void;
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
}

export const usePreReserveHandlers = ({
  gender,
  refetch,
  preReserveBottomSheetRef,
  isPreReservedByMe,
  getItemState,
  updateReservation,
  removeReservation,
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

      // اگر قابل کلیک نیست، هیچ کاری نکن
      if (!isAvailable && !isMyReservation) {
        return;
      }

      // اگر قبلاً pre-reserved شده توسط من، فقط bottom sheet را باز کن
      if (isMyReservation) {
        const [fromTime, toTime] = timeSlot.split('_');
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

          // Update state to mark as pre-reserved by me (don't refetch, just update local state)
          updateReservation(
            item.id,
            dayData.date,
            fromTime,
            toTime,
            dayData.name,
            'pre-reserved-by-me',
            profile?.id,
          );

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
          removeReservation(item.id, dayData.date, fromTime, toTime);
          // Clear reservation state after successful deletion
          preReserveBottomSheetRef.current?.clearCurrentReservationState();
          preReserveBottomSheetRef.current?.close();
          setSelectedItemData(null);
          // Don't refetch - only update local state
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
