import {useState, useCallback} from 'react';
import {Alert} from 'react-native';
import {usePreReserve} from '../../../../utils/hooks/Reservation/usePreReserve';
import {PreReserveQuery} from '../../../../services/models/requestQueries';
import {ServiceEntryDto, DayEntryDto} from '../../../../services/models/response/ReservationResService';
import {PreReserveBottomSheetRef} from '../../../../components/Reservation/PreReserveBottomSheet';
import {SelectedItemData} from '../utils/types';

interface UsePreReserveHandlersProps {
  gender?: string;
  refetch: () => void;
  preReserveBottomSheetRef: React.RefObject<PreReserveBottomSheetRef>;
}

export const usePreReserveHandlers = ({
  gender,
  refetch,
  preReserveBottomSheetRef,
}: UsePreReserveHandlersProps) => {
  const preReserveMutation = usePreReserve();
  const [selectedItemData, setSelectedItemData] = useState<SelectedItemData | null>(null);

  const handleServiceItemClick = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
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
          setSelectedItemData({item, dayData, timeSlot});

          setTimeout(() => {
            if (preReserveBottomSheetRef.current) {
              preReserveBottomSheetRef.current.open({
                item,
                date: dayData.date,
                fromTime,
                toTime,
                dayName: dayData.name,
              });
            }
          }, 0);

          refetch();
        },
        onError: error => {
          Alert.alert('خطا', error.message || 'خطا در ارسال درخواست');
        },
      });
    },
    [gender, preReserveMutation, refetch, preReserveBottomSheetRef],
  );

  const handleDeleteReservation = useCallback(() => {
    if (!selectedItemData) return;

    const {item, dayData, timeSlot} = selectedItemData;
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
      onSuccess: () => {
        preReserveBottomSheetRef.current?.close();
        setSelectedItemData(null);
        refetch();
      },
      onError: error => {
        Alert.alert('خطا', error.message || 'خطا در لغو رزرو');
      },
    });
  }, [selectedItemData, gender, preReserveMutation, refetch, preReserveBottomSheetRef]);

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

