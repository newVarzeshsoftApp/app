import React, {useMemo, useCallback} from 'react';
import {View} from 'react-native';
import BottomSheet, {BottomSheetMethods} from '../BottomSheet/BottomSheet';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {Warning2} from 'iconsax-react-native';
import moment from 'jalali-moment';
import {formatNumber} from '../../utils/helpers/helpers';
import {
  formatPenaltyLabel,
  ReservationPenaltyDto,
} from './utils/penaltyHelpers';

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

  // Separate penalties by unit
  const dayPenalties = penalties.filter(p => p.unit === 'DAY');
  const hourPenalties = penalties.filter(p => p.unit === 'HOUR');
  const weekPenalties = penalties.filter(p => p.unit === 'WEEK');
  const monthPenalties = penalties.filter(p => p.unit === 'MONTH');

  // Convert all penalties to hours for comparison
  const convertToHours = (penalty: ReservationPenaltyDto): number => {
    switch (penalty.unit) {
      case 'HOUR':
        return penalty.quantity;
      case 'DAY':
        return penalty.quantity * 24;
      case 'WEEK':
        return penalty.quantity * 168; // 7 days * 24 hours
      case 'MONTH':
        return penalty.quantity * 730; // ~30.4 days * 24 hours
      default:
        return penalty.hourAmount || 0;
    }
  };

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
  const applicableDayPenalties = dayPenalties.filter(
    p => daysRemaining <= p.quantity,
  );
  if (applicableDayPenalties.length > 0) {
    return applicableDayPenalties.reduce((prev, current) =>
      prev.quantity < current.quantity ? prev : current,
    );
  }

  // Check WEEK penalties
  const weeksRemaining = daysRemaining / 7;
  const applicableWeekPenalties = weekPenalties.filter(
    p => weeksRemaining <= p.quantity,
  );
  if (applicableWeekPenalties.length > 0) {
    return applicableWeekPenalties.reduce((prev, current) =>
      prev.quantity < current.quantity ? prev : current,
    );
  }

  // Check MONTH penalties
  const monthsRemaining = daysRemaining / 30;
  const applicableMonthPenalties = monthPenalties.filter(
    p => monthsRemaining <= p.quantity,
  );
  if (applicableMonthPenalties.length > 0) {
    return applicableMonthPenalties.reduce((prev, current) =>
      prev.quantity < current.quantity ? prev : current,
    );
  }

  // If no penalty applies (reservation is too far in the future),
  // return the one with the largest hourAmount (furthest deadline)
  const allPenalties = [
    ...dayPenalties,
    ...hourPenalties,
    ...weekPenalties,
    ...monthPenalties,
  ];
  if (allPenalties.length > 0) {
    return allPenalties.reduce((prev, current) =>
      convertToHours(prev) > convertToHours(current) ? prev : current,
    );
  }

  return null;
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
    // Only send penaltyAmount if penalty exists and amount > 0
    const penaltyAmount =
      penaltyCalculation?.penaltyAmount && penaltyCalculation.penaltyAmount > 0
        ? penaltyCalculation.penaltyAmount
        : undefined;
    onConfirm(penaltyAmount);
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
          <View className="gap-1 BaseServiceCard">
            <View className="flex-row items-center gap-2  border-b border-neutral-100 dark:border-neutral-dark-400/50 pb-2">
              <View className="w-[44px] h-[44px] bg-warning-100 dark:bg-warning-dark-100 rounded-full justify-center items-center">
                <Warning2 size={24} color="#E8842F" variant="Bold" />
              </View>
              <BaseText type="body3" color="warning">
                جریمه لغو رزرو شما
              </BaseText>
            </View>
            <View className="gap-3">
              {/* Time Label */}
              <View className="flex-row items-center justify-between py-3 border-b border-neutral-0 dark:border-neutral-dark-400/50">
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
