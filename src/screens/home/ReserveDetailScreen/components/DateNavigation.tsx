import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import BaseText from '../../../../components/BaseText';
import {ArrowLeft2, ArrowRight2} from 'iconsax-react-native';
import {formatDate} from '../utils/helpers';

interface DateNavigationProps {
  currentPage: number;
  totalPages: number;
  startDate?: string;
  endDate?: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isDark: boolean;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  currentPage,
  totalPages,
  startDate,
  endDate,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  isDark,
}) => {
  return (
    <View className="flex-row items-center justify-between gap-4 px-5 py-2">
      <TouchableOpacity
        onPress={onPrev}
        disabled={!canGoPrev}
        style={{opacity: canGoPrev ? 1 : 0.3}}
        className="p-2">
        <ArrowRight2 size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>

      <View className="flex-row items-center gap-1">
        <BaseText type="body3" color="secondary">
          {startDate && endDate
            ? `از ${formatDate(startDate)} تا ${formatDate(endDate)}`
            : `صفحه ${currentPage + 1} از ${totalPages || 1}`}
        </BaseText>
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canGoNext}
        style={{opacity: canGoNext ? 1 : 0.3}}
        className="p-2">
        <ArrowLeft2 size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
    </View>
  );
};

export default DateNavigation;
