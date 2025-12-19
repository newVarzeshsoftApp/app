import React, {useMemo} from 'react';
import {View} from 'react-native';
import BottomSheet, {BottomSheetMethods} from '../BottomSheet/BottomSheet';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {Warning2} from 'iconsax-react-native';

type ReservationPenaltyUnit = 'DAY' | 'HOUR';
type ReservationPenaltyDto = {
  unit: ReservationPenaltyUnit;
  quantity: number;
  hourAmount: number;
  percent: number;
};

type PenaltyDisplayItem = {timeLabel: string; percentage: number};

const formatPenaltyItems = (
  penalties: ReservationPenaltyDto[],
): PenaltyDisplayItem[] => {
  if (!penalties || penalties.length === 0) return [];

  const sorted = [...penalties].sort((a, b) => b.hourAmount - a.hourAmount);

  return sorted.map(penalty => {
    let timeLabel = '';
    if (penalty.unit === 'DAY') {
      if (penalty.quantity === 1) timeLabel = '۱ روز قبل';
      else if (penalty.quantity === 7) timeLabel = '۱ هفته قبل';
      else if (penalty.quantity === 30) timeLabel = '۱ ماه قبل';
      else timeLabel = `${penalty.quantity} روز قبل`;
    } else if (penalty.unit === 'HOUR') {
      if (penalty.quantity === 1) timeLabel = 'تا ۱ ساعت مانده';
      else timeLabel = `تا ${penalty.quantity} ساعت مانده`;
    }

    return {timeLabel, percentage: penalty.percent};
  });
};

export type CancelReservationConfirmSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  reservationPenalty?: unknown;
};

const CancelReservationConfirmSheet: React.FC<
  CancelReservationConfirmSheetProps
> = ({
  bottomSheetRef,
  isLoading = false,
  confirmDisabled = false,
  onCancel,
  onConfirm,
  reservationPenalty,
}) => {
  const penalties = useMemo(() => {
    if (!Array.isArray(reservationPenalty)) return [];
    return reservationPenalty as ReservationPenaltyDto[];
  }, [reservationPenalty]);

  const penaltyItems = useMemo(() => formatPenaltyItems(penalties), [penalties]);

  return (
    <BottomSheet
      snapPoints={[35, 65]}
      ref={bottomSheetRef}
      Title="آیا از لغو این رزرو مطمئن هستید؟">
      <View className=" gap-4">
        {penaltyItems.length > 0 && (
          <View className="gap-3 BaseServiceCard">
            <View className="flex-row items-center gap-2  border-b border-neutral-100 dark:border-neutral-dark-400/50 pb-2">
              <View className="w-[44px] h-[44px] bg-warning-100 dark:bg-warning-dark-100 rounded-full justify-center items-center">
                <Warning2 size={24} color="#E8842F" variant="Bold" />
              </View>
              <BaseText type="body3" color="warning">
                جریمه لغو رزرو شما
              </BaseText>
            </View>
            <View className=" gap-2">
              {penaltyItems.map((p, idx) => (
                <View
                  key={`${p.timeLabel}-${idx}`}
                  className="flex-row items-center justify-between py-2 border-b border-neutral-0 dark:border-neutral-dark-400/50">
                  <BaseText type="body3" color="base">
                    %{p.percentage}
                  </BaseText>
                  <BaseText type="body3" color="secondary">
                    {p.timeLabel}
                  </BaseText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="flex-row items-center w-full gap-2">
          <View className="flex-1 ">
            <BaseButton
              type="Tonal"
              color="Black"
              size="Large"
              rounded
              text="انصراف"
              onPress={onCancel}
              disabled={isLoading}
            />
          </View>
          <View className="flex-1 max-w-[140px]">
            <BaseButton
              type="Outline"
              color="Error"
              redbutton
              size="Large"
              rounded
              text="تایید لغو"
              onPress={onConfirm}
              isLoading={isLoading}
              disabled={confirmDisabled}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

export default CancelReservationConfirmSheet;


