import React from 'react';
import {View} from 'react-native';
import BaseText from '../../BaseText';
import {formatCartRemainingTime} from '../../../utils/helpers/cartExpiry';

export type CartExpiryNoticeMode = 'reservation' | 'groupClass' | 'default';

type CartExpiryNoticeProps = {
  mode: CartExpiryNoticeMode;
  /** Remaining time in minutes */
  remainingMinutes: number | null;
};

const CartExpiryNotice: React.FC<CartExpiryNoticeProps> = ({
  mode,
  remainingMinutes,
}) => {
  if (remainingMinutes === null) {
    return null;
  }

  const isExpired = remainingMinutes <= 0;
  const formatted = formatCartRemainingTime(remainingMinutes);

  let title: string;
  let subtitle: string | null = null;

  if (mode === 'groupClass') {
    title = isExpired
      ? 'زمان تکمیل خرید منقضی شده است'
      : `زمان باقیمانده تا حذف از سبد خرید: ${formatted}`;
    subtitle = isExpired
      ? null
      : 'در صورت عدم تکمیل خرید در این زمان، آیتم به صورت خودکار از سبد حذف می‌شود';
  } else if (mode === 'reservation') {
    title = isExpired
      ? 'زمان رزرو منقضی شده است'
      : `زمان باقیمانده برای تکمیل رزرو: ${formatted}`;
    subtitle = isExpired
      ? null
      : 'در صورت عدم تکمیل رزرو در این زمان، رزرو به صورت خودکار حذف می‌شود';
  } else {
    title = isExpired
      ? 'مهلت نگهداری این آیتم در سبد به پایان رسیده است'
      : `این آیتم تا ۲۴ ساعت در سبد خرید می‌ماند (${formatted} باقی‌مانده)`;
    subtitle = isExpired
      ? null
      : 'در صورت عدم تکمیل خرید در این بازه، به‌صورت خودکار از سبد حذف می‌شود';
  }

  return (
    <View className="flex-row items-center gap-2 p-3 BaseServiceCard mt-2">
      <View className="flex-1 gap-1">
        <BaseText type="caption">{title}</BaseText>
        {subtitle ? (
          <BaseText type="caption" color="secondary">
            {subtitle}
          </BaseText>
        ) : null}
      </View>
    </View>
  );
};

export default CartExpiryNotice;
