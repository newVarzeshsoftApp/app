import React from 'react';

import {IBadge} from '../../models/props';
import {View} from 'react-native';
import BaseText from '../BaseText';

function Badge({value, className, color, style, rounded}: IBadge) {
  return (
    <View
      className={`bg-${color}-500  rounded-full  ${
        rounded
          ? 'w-7 h-7 flex flex-row justify-center items-center'
          : 'px-2 py-1'
      } ${className}`}
      style={style}>
      <BaseText type="caption" color="button">
        {value}
      </BaseText>
    </View>
  );
}

export default Badge;
