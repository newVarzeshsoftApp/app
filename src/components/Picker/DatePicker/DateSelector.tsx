import {Calendar, CloseCircle} from 'iconsax-react-native';
import React, {useState, useCallback, useRef, useMemo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useTheme} from '../../../utils/ThemeContext';
import BaseText from '../../BaseText';
import JalaliDatePicker, {DateSelectorState} from './DatePicker';
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';

export interface DateSelectorType {
  startDate?: DateSelectorState | null;
  endDate?: DateSelectorState | null;
}

interface DateSelectorProps {
  mode: 'single' | 'range';
  onDateChange?: (date: DateSelectorType) => void;
}

const formatJalaliDate = (date: string | null): string => {
  return date ? date.replace(/-/g, '/') : '';
};

const DateSelector: React.FC<DateSelectorProps> = ({mode, onDateChange}) => {
  const {theme} = useTheme();
  const bottomSheetRef = useRef<BottomSheetMethods | null>(null);

  const [dateState, setDateState] = useState<{
    isFromDate: boolean | null;
    fromDate: DateSelectorState | null;
    toDate: DateSelectorState | null;
    savedFromDate: DateSelectorState | null;
    savedToDate: DateSelectorState | null;
  }>({
    isFromDate: null,
    fromDate: null,
    toDate: null,
    savedFromDate: null,
    savedToDate: null,
  });
  const handleDateChange = useCallback(
    (date: DateSelectorState) => {
      setDateState(prev => {
        if (prev.isFromDate === null) {
          return {
            ...prev,
            fromDate: date,
            toDate: date,
          };
        } else {
          return {
            ...prev,
            [prev.isFromDate ? 'fromDate' : 'toDate']: date,
          };
        }
      });
    },
    [dateState.isFromDate],
  );

  const handleSaveChanges = useCallback(() => {
    setDateState(prev => {
      const updatedState = {
        ...prev,
        [prev.isFromDate ? 'savedFromDate' : 'savedToDate']: prev.isFromDate
          ? prev.fromDate
          : prev.toDate,
      };

      onDateChange?.({
        startDate: updatedState.savedFromDate,
        endDate: updatedState.savedToDate,
      });

      return updatedState;
    });

    bottomSheetRef.current?.close();
  }, [onDateChange]);

  const handleOpenDatePicker = useCallback((isFromDate: boolean) => {
    setDateState(prev => ({...prev, isFromDate}));
    bottomSheetRef.current?.expand();
  }, []);

  const handleClearDate = useCallback((isFromDate: boolean) => {
    setDateState(prev => {
      const updatedState = {
        ...prev,
        [isFromDate ? 'savedFromDate' : 'savedToDate']: null,
      };

      onDateChange?.({
        startDate: updatedState.savedFromDate,
        endDate: updatedState.savedToDate,
      });

      return updatedState;
    });
  }, []);

  const iconColor = useMemo(
    () => (theme === 'light' ? '#AAABAD' : '#55575C'),
    [theme],
  );

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[45]}
        Title="انتخاب تاریخ"
        buttonText="تایید"
        disablePan={true}
        onButtonPress={handleSaveChanges}>
        <JalaliDatePicker
          onChange={handleDateChange}
          initialValue={
            dateState.isFromDate
              ? dateState.savedFromDate
              : dateState.savedToDate
          }
        />
      </BottomSheet>

      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <TouchableOpacity
          onPress={() => handleOpenDatePicker(true)}
          className="flex-1 CardBase h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-300 rounded-full">
          <BaseText
            type="subtitle2"
            color={dateState.savedFromDate ? 'base' : 'muted'}>
            {dateState.savedFromDate
              ? `از ${formatJalaliDate(
                  dateState?.savedFromDate?.jalaliDate ?? '',
                )}`
              : mode === 'range'
              ? 'از تاریخ'
              : 'انتخاب تاریخ'}
          </BaseText>
          {dateState.savedFromDate ? (
            <TouchableOpacity onPress={() => handleClearDate(true)}>
              <CloseCircle size={24} variant="Bold" color={iconColor} />
            </TouchableOpacity>
          ) : (
            <Calendar size={24} variant="Bold" color={iconColor} />
          )}
        </TouchableOpacity>

        {/* End Date Picker (if range mode) */}
        {mode === 'range' && (
          <TouchableOpacity
            onPress={() => handleOpenDatePicker(false)}
            className="flex-1 h-12 CardBase py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-300 rounded-full">
            <BaseText
              type="subtitle2"
              color={dateState.savedToDate ? 'base' : 'muted'}>
              {dateState.savedToDate
                ? `تا ${formatJalaliDate(
                    dateState?.savedToDate?.jalaliDate ?? '',
                  )}`
                : 'تا تاریخ'}
            </BaseText>
            {dateState.savedToDate ? (
              <TouchableOpacity onPress={() => handleClearDate(false)}>
                <CloseCircle size={24} variant="Bold" color={iconColor} />
              </TouchableOpacity>
            ) : (
              <Calendar size={24} variant="Bold" color={iconColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default React.memo(DateSelector);
