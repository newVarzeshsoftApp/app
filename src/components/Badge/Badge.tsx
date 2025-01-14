import React from 'react';

import {IBadge} from '../../models/props';
import {View} from 'react-native';
import BaseText from '../BaseText';
import {FlashCircle, Gift} from 'iconsax-react-native';

function Badge({
  value,
  className,
  color,
  style,
  rounded,
  textColor = 'button',
  defaultMode,
  CreditMode,
  GiftMode,
}: IBadge) {
  return (
    <View
      className={`${
        defaultMode || CreditMode
          ? 'bg-neutral-100 dark:bg-neutral-dark-100'
          : `bg-${color}-500`
      }   rounded-full flex flex-row justify-center items-center gap-1 ${
        rounded ? 'w-7 h-7 ' : 'px-2 py-1'
      } ${className}`}
      style={style}>
      {CreditMode && <FlashCircle variant="Bold" color="#FED376" />}
      {GiftMode && <Gift variant="Bold" color="#A27EB7" />}
      <BaseText
        type="subtitle3"
        color={
          CreditMode ? 'supportive1' : GiftMode ? 'supportive2' : textColor
        }>
        {value}
      </BaseText>
    </View>
  );
}

export default Badge;
