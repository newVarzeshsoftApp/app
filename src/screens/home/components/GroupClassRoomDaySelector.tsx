import React, {useMemo} from 'react';
import {View} from 'react-native';
import Checkbox from '../../../components/Checkbox/Checkbox';
import BaseText from '../../../components/BaseText';
import {GroupClassRoomDayOption} from '../../../utils/helpers/groupClassRoomHelpers';

type GroupClassRoomDaySelectorProps = {
  options: GroupClassRoomDayOption[];
  selectedDays: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
};

const GroupClassRoomDaySelector: React.FC<GroupClassRoomDaySelectorProps> = ({
  options,
  selectedDays,
  onChange,
  disabled = false,
}) => {
  const selectedSet = useMemo(() => new Set(selectedDays), [selectedDays]);

  const handleToggle = (day: number) => {
    if (disabled) return;

    if (selectedSet.has(day)) {
      onChange(selectedDays.filter(value => value !== day));
      return;
    }

    onChange([...selectedDays, day].sort((a, b) => a - b));
  };

  if (options.length === 0) return null;

  return (
    <View className="CardBase gap-3">
      {options.map(option => {
        const isChecked = selectedSet.has(option.day);

        return (
          <View
            key={option.day}
            className="flex-row items-center justify-between gap-3">
            <Checkbox
              checked={isChecked}
              readonly={disabled}
              onCheckedChange={() => handleToggle(option.day)}
              label={option.label}
            />
            <BaseText type="body3" color="secondary">
              {option.from} تا {option.to}
            </BaseText>
          </View>
        );
      })}
    </View>
  );
};

export default GroupClassRoomDaySelector;
