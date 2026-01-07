type ReservationPenaltyUnit = 'DAY' | 'HOUR' | 'WEEK' | 'MONTH';

export interface ReservationPenaltyDto {
  unit: ReservationPenaltyUnit;
  quantity: number;
  hourAmount: number;
  percent: number;
  description?: string;
}

/**
 * Formats penalty label based on unit and quantity
 * @param penalty - Penalty object with unit and quantity
 * @returns Formatted label string (e.g., "تا ۱ روز مانده", "تا ۳ ساعت مانده")
 */
export const formatPenaltyLabel = (
  penalty: ReservationPenaltyDto,
): string => {
  if (penalty.unit === 'DAY') {
    if (penalty.quantity === 1) return 'تا ۱ روز مانده';
    else if (penalty.quantity === 7) return 'تا ۱ هفته مانده';
    else if (penalty.quantity === 30) return 'تا ۱ ماه مانده';
    else return `تا ${penalty.quantity} روز مانده`;
  } else if (penalty.unit === 'HOUR') {
    if (penalty.quantity === 1) return 'تا ۱ ساعت مانده';
    else return `تا ${penalty.quantity} ساعت مانده`;
  } else if (penalty.unit === 'WEEK') {
    if (penalty.quantity === 1) return 'تا ۱ هفته مانده';
    else return `تا ${penalty.quantity} هفته مانده`;
  } else if (penalty.unit === 'MONTH') {
    if (penalty.quantity === 1) return 'تا ۱ ماه مانده';
    else return `تا ${penalty.quantity} ماه مانده`;
  }
  return '';
};

