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
    if (isExpired) {
      title = 'مهلت خرید تمام شد — از سبد حذف می‌شود';
    } else {
      title = `مهلت تکمیل خرید: ${formatted}`;
      subtitle = 'بدون پرداخت، خودکار از سبد حذف می‌شود';
    }
  } else if (mode === 'reservation') {
    if (isExpired) {
      title = 'مهلت رزرو تمام شد — از سبد حذف می‌شود';
    } else {
      title = `مهلت تکمیل رزرو: ${formatted}`;
      subtitle = 'بدون پرداخت، خودکار از سبد حذف می‌شود';
    }
  } else if (isExpired) {
    title = 'مهلت نگهداری تمام شد — از سبد حذف می‌شود';
  } else {
    title = `نگهداری در سبد: ${formatted}`;
    subtitle = 'بدون پرداخت، خودکار از سبد حذف می‌شود';
  }

  return (
    <View className="mt-1.5 px-2.5 py-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 gap-1">
      <BaseText
        type="caption"
        color="base"
        className="!text-[14px] leading-4">
        {title}
      </BaseText>
      {subtitle ? (
        <BaseText
          type="caption"
          color="secondary"
          className="!text-[14px] leading-3.5">
          {subtitle}
        </BaseText>
      ) : null}
    </View>
  );
};

export default CartExpiryNotice;
