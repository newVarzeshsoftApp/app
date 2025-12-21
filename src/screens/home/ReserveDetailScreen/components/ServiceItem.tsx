import React from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import BaseText from '../../../../components/BaseText';
import {
  ServiceEntryDto,
  DayEntryDto,
} from '../../../../services/models/response/ReservationResService';
import {formatNumber} from '../../../../utils/helpers/helpers';
import {getServiceColor} from '../utils/helpers';
import {useTheme} from '../../../../utils/ThemeContext';

interface ServiceItemProps {
  item: ServiceEntryDto;
  index: number;
  dayData: DayEntryDto;
  timeSlot: string;
  onPress: (
    item: ServiceEntryDto,
    dayData: DayEntryDto,
    timeSlot: string,
  ) => void;
  isLoading?: boolean;
  getItemState?: (
    item: ServiceEntryDto,
    dayData: DayEntryDto,
    timeSlot: string,
  ) => {
    isPreReserved: boolean;
    selfReserved: boolean;
    isReserve: boolean;
  };
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  item,
  index,
  dayData,
  timeSlot,
  onPress,
  isLoading = false,
  getItemState,
}) => {
  const {theme} = useTheme();
  const isDarkMode = theme === 'dark';
  const colors = getServiceColor(item, index);
  const displayPrice =
    item.reservePrice > 0 ? item.reservePrice : item.price || 0;

  // استفاده از state اگر موجود باشد، در غیر این صورت از item اصلی
  const itemState = getItemState
    ? getItemState(item, dayData, timeSlot)
    : {
        isPreReserved: item.isPreReserved,
        selfReserved: item.selfReserved,
        isReserve: item.isReserve,
      };

  // تعیین حالت‌های مختلف رزرو
  const isReserved = itemState.isReserve; // رزرو شده توسط دیگران (غیرقابل استفاده)
  const isPreReservedByOthers =
    itemState.isPreReserved && !itemState.selfReserved; // در حال رزرو دیگران
  const isPreReservedByMe = itemState.isPreReserved && itemState.selfReserved; // در حال رزرو توسط من
  const isAvailable = !isReserved && !itemState.isPreReserved; // قابل رزرو

  // استایل‌ها بر اساس حالت
  let borderColor: string;
  let borderStyle: 'solid' | 'dashed';
  let backgroundColor: string;
  let textColor: string;
  let isDisabled = false;

  if (isReserved) {
    // حالت 1: رزرو شده (غیرقابل استفاده)
    borderColor = isDarkMode ? '#2a2d33' : '#E0E0E0';
    borderStyle = 'solid';
    backgroundColor = isDarkMode ? '#232529' : '#F5F5F5';
    textColor = isDarkMode ? '#55575c' : '#9E9E9E';
    isDisabled = true;
  } else if (isPreReservedByOthers) {
    // حالت 2: در حال رزرو دیگران
    borderColor = colors.border;
    borderStyle = 'dashed';
    backgroundColor = isDarkMode ? '#2a2d33' : '#FFFFFF';
    textColor = colors.border;
    isDisabled = true;
  } else if (isPreReservedByMe) {
    // حالت 3: در حال رزرو توسط من
    borderColor = colors.border;
    borderStyle = 'solid';
    backgroundColor = colors.bg;
    textColor = colors.text;
    isDisabled = false;
  } else {
    // حالت 4: قابل رزرو
    borderColor = colors.border;
    borderStyle = 'solid';
    backgroundColor = isDarkMode ? '#2a2d33' : '#FFFFFF';
    textColor = isDarkMode ? '#FFFFFF' : '#16181b';
    isDisabled = false;
  }

  return (
    <TouchableOpacity
      key={item.id}
      disabled={isDisabled || isLoading}
      onPress={() => onPress(item, dayData, timeSlot)}
      className="rounded-lg border p-2 items-center justify-center gap-1"
      style={{
        borderColor,
        borderStyle,
        backgroundColor,
        borderWidth: 1,
        minHeight: 60,
        opacity: isLoading ? 0.5 : 1,
      }}>
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.border} />
      ) : (
        <>
          <BaseText
            type="subtitle3"
            style={{color: textColor}}
            className="text-center">
            {item.title}
          </BaseText>
          {displayPrice > 0 && (
            <BaseText
              type="badge"
              style={{color: textColor}}
              className="mt-1 text-center">
              قیمت {formatNumber(displayPrice)}
            </BaseText>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default ServiceItem;
