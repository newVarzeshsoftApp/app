import React from 'react';
import {View} from 'react-native';
import BaseText from '../../../../components/BaseText';
import {
  DayEntryDto,
  ServiceEntryDto,
} from '../../../../services/models/response/ReservationResService';
import {WEEK_DAYS_MAP} from '../utils/constants';
import {formatDate} from '../utils/helpers';
import ServiceItem from './ServiceItem';

interface DayColumnProps {
  dayData: DayEntryDto;
  timeSlot: string;
  onServicePress: (
    item: ServiceEntryDto,
    dayData: DayEntryDto,
    timeSlot: string,
  ) => void;
  isLoadingItems?: Array<{
    productId: number;
    date: string;
    fromTime: string;
    toTime: string;
  }>;
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

const DayColumn: React.FC<DayColumnProps> = ({
  dayData,
  timeSlot,
  onServicePress,
  isLoadingItems = [],
  getItemState,
}) => {
  const dayInfo = WEEK_DAYS_MAP[dayData.name];
  if (!dayInfo) return null;

  const [slotFromTime, slotToTime] = timeSlot.split('_');

  return (
    <View
      key={`${dayData.name}_${dayData.date}`}
      className="flex-1 px-1 "
      style={{minWidth: 0}}>
      {/* Day Header */}
      <View className="rounded-xl bg-neutral-300 dark:bg-neutral-dark-300 px-2 py-2 mb-2">
        <BaseText type="caption" color="base" className="text-center font-bold">
          {dayInfo.label}
        </BaseText>
        <BaseText type="subtitle3" color="secondary" className="text-center">
          {formatDate(dayData.date)}
        </BaseText>
      </View>

      {/* Services List */}
      {dayData.items.length > 0 && (
        <View style={{gap: 4}}>
          {dayData.items.map((item, index) => {
            const isLoading =
              isLoadingItems.some(
                loadingItem =>
                  loadingItem.productId === item.id &&
                  loadingItem.date === dayData.date &&
                  loadingItem.fromTime === slotFromTime &&
                  loadingItem.toTime === slotToTime,
              ) || false;

            return (
              <View key={item.id} style={{marginBottom: 4}}>
                <ServiceItem
                  item={item}
                  index={index}
                  dayData={dayData}
                  timeSlot={timeSlot}
                  onPress={onServicePress}
                  isLoading={isLoading}
                  getItemState={getItemState}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default DayColumn;
