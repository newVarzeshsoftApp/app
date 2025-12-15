import React from 'react';
import {View, Animated} from 'react-native';
import BaseText from '../../../../components/BaseText';
import {DayEntryDto} from '../../../../services/models/response/ReservationResService';
import {TIME_COLUMN_WIDTH, VISIBLE_DAYS_COUNT} from '../utils/constants';
import {formatTimeSlot} from '../utils/helpers';
import DayColumn from './DayColumn';

interface TimeSlotRowProps {
  timeSlot: string;
  visibleDays: DayEntryDto[];
  slideAnim: Animated.Value;
  opacityAnim: Animated.Value;
  onServicePress: (
    item: any,
    dayData: DayEntryDto,
    timeSlot: string,
  ) => void;
  isLoadingItems?: Array<{
    productId: number;
    date: string;
    fromTime: string;
    toTime: string;
  }>;
}

const TimeSlotRow: React.FC<TimeSlotRowProps> = ({
  timeSlot,
  visibleDays,
  slideAnim,
  opacityAnim,
  onServicePress,
  isLoadingItems = [],
}) => {
  return (
    <View key={timeSlot} className="mb-4">
      <View className="flex-row" style={{flexDirection: 'row'}}>
        {/* Time Label - Fixed Width with Higher z-index */}
        <View
          style={{
            width: TIME_COLUMN_WIDTH,
            zIndex: 10,
            elevation: 10,
          }}
          className="items-center justify-center rounded-lg px-2 bg-secondary-600 py-3">
          <BaseText
            type="caption"
            color="button"
            className="text-center leading-tight">
            {formatTimeSlot(timeSlot)}
          </BaseText>
        </View>

        {/* Days columns with animation */}
        <Animated.View
          style={{
            flexDirection: 'row',
            flex: 1,
            transform: [{translateX: slideAnim}],
            opacity: opacityAnim,
            zIndex: 1,
            elevation: 1,
          }}>
          {visibleDays.map(dayData => (
            <DayColumn
              key={`${dayData.name}_${dayData.date}`}
              dayData={dayData}
              timeSlot={timeSlot}
              onServicePress={onServicePress}
              isLoadingItems={isLoadingItems}
            />
          ))}

          {/* Fill empty slots if less than 3 days */}
          {visibleDays.length < VISIBLE_DAYS_COUNT &&
            Array.from({
              length: VISIBLE_DAYS_COUNT - visibleDays.length,
            }).map((_, idx) => (
              <View key={`empty_${idx}`} className="flex-1 px-1" />
            ))}
        </Animated.View>
      </View>
    </View>
  );
};

export default TimeSlotRow;

