import React, {useMemo, useCallback} from 'react';
import {View} from 'react-native';
import BottomSheet, {BottomSheetMethods} from '../BottomSheet/BottomSheet';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {Warning2} from 'iconsax-react-native';
import moment from 'jalali-moment';
import {formatNumber} from '../../utils/helpers/helpers';

type ReservationPenaltyUnit = 'DAY' | 'HOUR';
type ReservationPenaltyDto = {
  unit: ReservationPenaltyUnit;
  quantity: number;
  hourAmount: number;
  percent: number;
  description?: string;
};

type PenaltyDisplayItem = {
  timeLabel: string;
  percentage: number;
  penaltyAmount: number;
  refundAmount: number;
  totalAmount: number;
};

export type CancelReservationConfirmSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: (amount: number | undefined) => void;
  reservationPenalty?: unknown;
  reservedDate?: string; // Format: "YYYY-MM-DD" or "YYYY-MM-DD HH:mm"
  reservedStartTime?: string; // Format: "HH:mm"
  totalAmount?: number; // Total amount of the reservation
};

// Find the appropriate penalty based on time remaining until reservation
const findApplicablePenalty = (
  penalties: ReservationPenaltyDto[],
  reservedDate: string,
  reservedStartTime?: string,
): ReservationPenaltyDto | null => {
  if (!penalties || penalties.length === 0) return null;
  if (!reservedDate) return null;

  // Parse reserved date and time
  // reservedDate can be in format "YYYY-MM-DD" or "YYYY-MM-DD HH:mm"
  // reservedStartTime is in format "HH:mm" (e.g., "09:00")
  let reservationDateTime: moment.Moment;

  // Check if reservedDate already includes time
  if (reservedDate.includes(' ')) {
    // reservedDate already has time: "2025-12-28 09:00"
    reservationDateTime = moment(reservedDate, 'YYYY-MM-DD HH:mm');
  } else if (reservedStartTime) {
    // Combine date and time: "2025-12-28" + "09:00" = "2025-12-28 09:00"
    const dateTimeStr = `${reservedDate} ${reservedStartTime}`;
    reservationDateTime = moment(dateTimeStr, 'YYYY-MM-DD HH:mm');
  } else {
    // Just date, assume start of day (00:00)
    reservationDateTime = moment(reservedDate, 'YYYY-MM-DD').startOf('day');
  }

  // Ensure the datetime is valid
  if (!reservationDateTime.isValid()) {
    console.warn(
      'Invalid reservation date/time:',
      reservedDate,
      reservedStartTime,
    );
    return null;
  }

  // Calculate time remaining until reservation
  const now = moment();
  const hoursRemaining = reservationDateTime.diff(now, 'hours', true);
  const daysRemaining = hoursRemaining / 24;

  // Separate DAY and HOUR penalties
  const dayPenalties = penalties.filter(p => p.unit === 'DAY');
  const hourPenalties = penalties.filter(p => p.unit === 'HOUR');

  // If we're within 24 hours, check HOUR penalties first
  if (hoursRemaining <= 24 && hourPenalties.length > 0) {
    // Find penalties that apply (quantity >= hoursRemaining)
    const applicableHourPenalties = hourPenalties.filter(
      p => hoursRemaining <= p.quantity,
    );
    if (applicableHourPenalties.length > 0) {
      // Get the one with the smallest quantity (most precise match)
      return applicableHourPenalties.reduce((prev, current) =>
        prev.quantity < current.quantity ? prev : current,
      );
    }
  }

  // Check DAY penalties
  // Find penalties that apply (quantity >= daysRemaining)
  const applicableDayPenalties = dayPenalties.filter(
    p => daysRemaining <= p.quantity,
  );
  if (applicableDayPenalties.length > 0) {
    // Get the one with the smallest quantity (most precise match)
    return applicableDayPenalties.reduce((prev, current) =>
      prev.quantity < current.quantity ? prev : current,
    );
  }

  // If no penalty applies (reservation is too far in the future),
  // return the one with the largest quantity (furthest deadline)
  const allPenalties = [...dayPenalties, ...hourPenalties];
  if (allPenalties.length > 0) {
    return allPenalties.reduce((prev, current) =>
      prev.quantity > current.quantity ? prev : current,
    );
  }

  return null;
};

const formatPenaltyLabel = (penalty: ReservationPenaltyDto): string => {
  if (penalty.unit === 'DAY') {
    if (penalty.quantity === 1) return '۱ روز قبل';
    else if (penalty.quantity === 7) return '۱ هفته قبل';
    else if (penalty.quantity === 30) return '۱ ماه قبل';
    else return `${penalty.quantity} روز قبل`;
  } else if (penalty.unit === 'HOUR') {
    if (penalty.quantity === 1) return 'تا ۱ ساعت مانده';
    else return `تا ${penalty.quantity} ساعت مانده`;
  }
  return '';
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
  reservedDate,
  reservedStartTime,
  totalAmount = 0,
}) => {
  const penalties = useMemo(() => {
    if (!Array.isArray(reservationPenalty)) return [];
    return reservationPenalty as ReservationPenaltyDto[];
  }, [reservationPenalty]);

  // Find the applicable penalty based on time remaining
  const applicablePenalty = useMemo(() => {
    if (!reservedDate || penalties.length === 0) return null;
    return findApplicablePenalty(penalties, reservedDate, reservedStartTime);
  }, [penalties, reservedDate, reservedStartTime]);

  // Calculate penalty and refund amounts
  const penaltyCalculation = useMemo((): PenaltyDisplayItem | null => {
    if (!applicablePenalty) return null;

    const penaltyAmount = Math.round(
      (totalAmount * applicablePenalty.percent) / 100,
    );
    const refundAmount = totalAmount - penaltyAmount;

    return {
      timeLabel: formatPenaltyLabel(applicablePenalty),
      percentage: applicablePenalty.percent,
      penaltyAmount,
      refundAmount,
      totalAmount,
    };
  }, [applicablePenalty, totalAmount]);

  const handleConfirm = useCallback(() => {
    // Only send amount if penalty exists and amount > 0
    const amount =
      penaltyCalculation?.penaltyAmount && penaltyCalculation.penaltyAmount > 0
        ? penaltyCalculation.penaltyAmount
        : undefined;
    onConfirm(amount);
  }, [onConfirm, penaltyCalculation]);

  return (
    <BottomSheet
      snapPoints={[65]}
      disablePan
      scrollView
      ref={bottomSheetRef}
      Title="آیا از لغو این رزرو مطمئن هستید؟">
      <View className=" gap-4">
        {penaltyCalculation && (
          <View className="gap-3 BaseServiceCard">
            <View className="flex-row items-center gap-2  border-b border-neutral-100 dark:border-neutral-dark-400/50 pb-2">
              <View className="w-[44px] h-[44px] bg-warning-100 dark:bg-warning-dark-100 rounded-full justify-center items-center">
                <Warning2 size={24} color="#E8842F" variant="Bold" />
              </View>
              <BaseText type="body3" color="warning">
                جریمه لغو رزرو شما
              </BaseText>
            </View>
            <View className=" gap-3">
              {/* Time Label */}
              <View className="flex-row items-center justify-between py-2 border-b border-neutral-0 dark:border-neutral-dark-400/50">
                <BaseText type="body3" color="secondary">
                  {penaltyCalculation.timeLabel}
                </BaseText>
                <BaseText type="body3" color="base">
                  %{penaltyCalculation.percentage}
                </BaseText>
              </View>

              {/* Penalty Amount */}
              <View className="flex-row items-center justify-between py-2">
                <BaseText type="body3" color="base">
                  مبلغ جریمه:
                </BaseText>
                <BaseText type="body3" color="error">
                  {formatNumber(penaltyCalculation.penaltyAmount)} ریال
                </BaseText>
              </View>

              {/* Refund Amount */}
              <View className="flex-row items-center justify-between py-2 border-t border-neutral-0 dark:border-neutral-dark-400/50 pt-3">
                <BaseText type="subtitle3" color="secondary">
                  باقی‌مانده به کیف پول شما واریز خواهد شد
                </BaseText>
                {/* <BaseText type="body3" color="supportive1">
                  {formatNumber(penaltyCalculation.refundAmount)} ریال
                </BaseText> */}
              </View>
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
              onPress={handleConfirm}
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
