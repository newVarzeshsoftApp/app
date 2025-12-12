import React, {useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import moment from 'jalali-moment';
import {Calendar, Clock, CloseCircle, ArrowDown2} from 'iconsax-react-native';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import BottomSheet, {
  BottomSheetMethods,
} from '../../components/BottomSheet/BottomSheet';
import JalaliDatePicker, {
  DateSelectorState,
} from '../../components/Picker/DatePicker/DatePicker';
import WheelPicker from '../../components/Picker/WheelPicker';
import {useTheme} from '../../utils/ThemeContext';
import {useGetReservationTags} from '../../utils/hooks/Reservation/useGetReservationTags';
import {useGetReservationPatterns} from '../../utils/hooks/Reservation/useGetReservationPatterns';
import {ReservationTag} from '../../services/models/response/ReservationResService';
import {useNavigation} from '@react-navigation/native';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

// روزهای هفته - دوشنبه = 1 (میلادی)
const WEEK_DAYS = [
  {id: 6, label: 'ش', fullName: 'شنبه'},
  {id: 0, label: 'ی', fullName: 'یکشنبه'},
  {id: 1, label: 'د', fullName: 'دوشنبه'},
  {id: 2, label: 'س', fullName: 'سه‌شنبه'},
  {id: 3, label: 'چ', fullName: 'چهارشنبه'},
  {id: 4, label: 'پ', fullName: 'پنجشنبه'},
  {id: 5, label: 'ج', fullName: 'جمعه'},
];

// Helper function to parse time string (e.g., "09:00" or "23:00")
const parseTime = (timeStr: string): number => {
  const [hours] = timeStr.split(':');
  return parseInt(hours, 10);
};

// Helper function to generate hours array from start to end
const generateHours = (startTime: string, endTime: string) => {
  const start = parseTime(startTime);
  let end = parseTime(endTime);

  // Handle case where endTime is "00:00" (midnight) - it means 24:00
  if (end === 0 && endTime === '00:00') {
    end = 24;
  }

  const hours = [];
  let currentHour = start;

  while (currentHour <= end) {
    hours.push({
      value: currentHour.toString(),
      label: `${currentHour.toString().padStart(2, '0')}:00`,
    });
    currentHour++;
  }

  return hours;
};

// Helper function to format duration
const formatDuration = (duration: string, unit: 'MINUTE' | 'HOUR'): string => {
  const num = parseInt(duration, 10);
  if (unit === 'MINUTE') {
    return `${num.toLocaleString('fa-IR')} دقیقه`;
  } else {
    return `${num.toLocaleString('fa-IR')} ساعته`;
  }
};

// گزینه‌های جنسیت
const GENDER_OPTIONS = [
  {value: 'Female', label: 'خانم'},
  {value: 'Male', label: 'آقا'},
  {value: 'Both', label: 'هر دو'},
];

interface FilterState {
  fromDate: DateSelectorState | null;
  toDate: DateSelectorState | null;
  duration: {value: string; label: string; tag?: ReservationTag} | null;
  selectedDays: number[];
  fromHour: string;
  toHour: string;
  service: {value: string; label: string; pattern?: any} | null;
  gender: {value: string; label: string} | null;
}

type ReserveScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'reserve'
>;

const ReserveScreen: React.FC = () => {
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation<ReserveScreenNavigationProp>();

  // Fetch reservation tags
  const {data: tagsData, isLoading: tagsLoading} = useGetReservationTags();

  // Fetch reservation patterns
  const {data: patternsData, isLoading: patternsLoading} =
    useGetReservationPatterns();

  // Bottom sheet refs
  const fromDateSheetRef = useRef<BottomSheetMethods>(null);
  const toDateSheetRef = useRef<BottomSheetMethods>(null);
  const durationSheetRef = useRef<BottomSheetMethods>(null);
  const fromHourSheetRef = useRef<BottomSheetMethods>(null);
  const toHourSheetRef = useRef<BottomSheetMethods>(null);
  const serviceSheetRef = useRef<BottomSheetMethods>(null);
  const genderSheetRef = useRef<BottomSheetMethods>(null);

  // تاریخ امروز و سه روز بعد
  const today = moment();
  const threeDaysLater = moment().add(3, 'days');

  // مقادیر دیفالت
  const defaultFromDate: DateSelectorState = {
    jalaliDate: today.format('jYYYY/jM/jD'),
    gregorianDate: today.format('YYYY-MM-DD'),
  };
  const defaultToDate: DateSelectorState = {
    jalaliDate: threeDaysLater.format('jYYYY/jM/jD'),
    gregorianDate: threeDaysLater.format('YYYY-MM-DD'),
  };

  // Convert tags to duration options
  const durationOptions = useMemo(() => {
    if (!tagsData?.content) return [];
    return tagsData.content.map(tag => ({
      value: tag.id.toString(),
      label: formatDuration(tag.duration, tag.unit),
      tag: tag,
    }));
  }, [tagsData]);

  // Convert patterns to service options
  const serviceOptions = useMemo(() => {
    if (!patternsData?.content) return [];
    return patternsData.content.map(pattern => ({
      value: pattern.id.toString(),
      label: pattern.name,
      pattern: pattern,
    }));
  }, [patternsData]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    fromDate: defaultFromDate,
    toDate: defaultToDate,
    duration: null,
    selectedDays: [6], // شنبه دیفالت
    fromHour: '10',
    toHour: '11',
    service: null,
    gender: GENDER_OPTIONS[2], // هر دو دیفالت
  });

  // Generate hours from all tags
  const fromHours = useMemo(() => {
    if (!tagsData?.content || tagsData.content.length === 0) return [];

    // Extract all unique startTimes from all tags
    const startTimes = tagsData.content
      .map(tag => tag.startTime)
      .filter((time, index, self) => self.indexOf(time) === index) // unique
      .map(time => parseTime(time))
      .sort((a, b) => a - b) // sort from low to high
      .map(hour => ({
        value: hour.toString(),
        label: `${hour.toString().padStart(2, '0')}:00`,
      }));

    return startTimes;
  }, [tagsData]);

  const toHours = useMemo(() => {
    if (!tagsData?.content || tagsData.content.length === 0) return [];

    // Extract all unique endTimes from all tags
    const endTimes = tagsData.content
      .map(tag => tag.endTime)
      .filter((time, index, self) => self.indexOf(time) === index) // unique
      .map(time => {
        // Handle "00:00" as 24
        if (time === '00:00') return 24;
        return parseTime(time);
      })
      .sort((a, b) => a - b) // sort from low to high
      .map(hour => ({
        value: hour === 24 ? '24' : hour.toString(),
        label: hour === 24 ? '00:00' : `${hour.toString().padStart(2, '0')}:00`,
      }));

    return endTimes;
  }, [tagsData]);

  // Set default duration, service and hours when data is loaded
  React.useEffect(() => {
    if (durationOptions.length > 0 && !filters.duration) {
      // Set first duration option as default
      // Set first available startTime and endTime as default
      const defaultFromHour = fromHours.length > 0 ? fromHours[0].value : '10';
      const defaultToHour = toHours.length > 0 ? toHours[0].value : '11';

      setFilters(prev => ({
        ...prev,
        duration: durationOptions[0],
        fromHour: defaultFromHour,
        toHour: defaultToHour,
      }));
    }

    if (serviceOptions.length > 0 && !filters.service) {
      setFilters(prev => ({
        ...prev,
        service: serviceOptions[0],
      }));
    }
  }, [
    durationOptions.length,
    fromHours.length,
    toHours.length,
    serviceOptions.length,
  ]);

  // Temp states for pickers
  const [tempFromDate, setTempFromDate] = useState<DateSelectorState | null>(
    null,
  );
  const [tempToDate, setTempToDate] = useState<DateSelectorState | null>(null);
  const [tempDuration, setTempDuration] = useState<string>('1');
  const [tempFromHour, setTempFromHour] = useState<string>('10');
  const [tempToHour, setTempToHour] = useState<string>('11');
  const [tempService, setTempService] = useState<string>('1');
  const [tempGender, setTempGender] = useState<string>('Both');

  const iconColor = useMemo(() => (isDark ? '#55575C' : '#AAABAD'), [isDark]);

  // تعداد نتایج فیک
  const resultCount = 10;

  // Toggle day selection
  const toggleDay = useCallback((dayId: number) => {
    setFilters(prev => {
      const isSelected = prev.selectedDays.includes(dayId);
      return {
        ...prev,
        selectedDays: isSelected
          ? prev.selectedDays.filter(d => d !== dayId)
          : [...prev.selectedDays, dayId],
      };
    });
  }, []);

  // Clear filter handlers - reset to default values
  const clearFromDate = useCallback(() => {
    setFilters(prev => ({...prev, fromDate: defaultFromDate}));
  }, []);

  const clearToDate = useCallback(() => {
    setFilters(prev => ({...prev, toDate: defaultToDate}));
  }, []);

  const clearDuration = useCallback(() => {
    if (durationOptions.length > 0) {
      setFilters(prev => ({...prev, duration: durationOptions[0]}));
    }
  }, [durationOptions]);

  const clearDays = useCallback(() => {
    setFilters(prev => ({...prev, selectedDays: [6]})); // شنبه دیفالت
  }, []);

  const clearTimeRange = useCallback(() => {
    const defaultFromHour = fromHours.length > 0 ? fromHours[0].value : '10';
    const defaultToHour = toHours.length > 0 ? toHours[0].value : '11';
    setFilters(prev => ({
      ...prev,
      fromHour: defaultFromHour,
      toHour: defaultToHour,
    }));
  }, [fromHours, toHours]);

  const clearService = useCallback(() => {
    if (serviceOptions.length > 0) {
      setFilters(prev => ({...prev, service: serviceOptions[0]}));
    }
  }, [serviceOptions]);

  const clearGender = useCallback(() => {
    setFilters(prev => ({...prev, gender: GENDER_OPTIONS[2]})); // هر دو دیفالت
  }, []);

  // Active filters for chips
  const activeFilters = useMemo(() => {
    const chips: {key: string; label: string; onClear: () => void}[] = [];

    if (filters.selectedDays.length > 0) {
      const dayNames = filters.selectedDays
        .map(d => WEEK_DAYS.find(w => w.id === d)?.fullName)
        .filter(Boolean)
        .join('، ');
      chips.push({key: 'days', label: dayNames, onClear: clearDays});
    }

    if (filters.duration) {
      chips.push({
        key: 'duration',
        label: filters.duration.label,
        onClear: clearDuration,
      });
    }

    if (filters.service) {
      chips.push({
        key: 'service',
        label: filters.service.label,
        onClear: clearService,
      });
    }

    if (filters.gender) {
      chips.push({
        key: 'gender',
        label: filters.gender.label,
        onClear: clearGender,
      });
    }

    if (filters.fromHour && filters.toHour) {
      chips.push({
        key: 'time',
        label: `از ${filters.fromHour.padStart(
          2,
          '0',
        )}:00 تا ${filters.toHour.padStart(2, '0')}:00`,
        onClear: clearTimeRange,
      });
    }

    return chips;
  }, [
    filters,
    clearDays,
    clearDuration,
    clearService,
    clearGender,
    clearTimeRange,
  ]);

  // محدودیت‌های تاریخ
  // از تاریخ: حداقل امروز
  const fromDateMinDate = useMemo(() => moment().format('YYYY-MM-DD'), []);

  // تا تاریخ: حداقل = از تاریخ انتخابی، حداکثر = از تاریخ + 14 روز
  const toDateMinDate = useMemo(
    () => filters.fromDate?.gregorianDate || moment().format('YYYY-MM-DD'),
    [filters.fromDate],
  );
  const toDateMaxDate = useMemo(() => {
    const fromDate = filters.fromDate?.gregorianDate
      ? moment(filters.fromDate.gregorianDate, 'YYYY-MM-DD')
      : moment();
    return fromDate.add(14, 'days').format('YYYY-MM-DD');
  }, [filters.fromDate]);

  // Save handlers
  const saveFromDate = () => {
    if (tempFromDate) {
      setFilters(prev => {
        const newFromDate = tempFromDate;
        let newToDate = prev.toDate;

        // اگه تا تاریخ قبل از از تاریخ جدید باشه، آپدیتش کن
        if (newToDate?.gregorianDate && newFromDate?.gregorianDate) {
          const fromMoment = moment(newFromDate.gregorianDate, 'YYYY-MM-DD');
          const toMoment = moment(newToDate.gregorianDate, 'YYYY-MM-DD');

          if (toMoment.isBefore(fromMoment)) {
            // تا تاریخ رو برابر با از تاریخ + 3 روز بذار
            const newTo = fromMoment.clone().add(3, 'days');
            newToDate = {
              jalaliDate: newTo.format('jYYYY/jM/jD'),
              gregorianDate: newTo.format('YYYY-MM-DD'),
            };
          } else if (toMoment.diff(fromMoment, 'days') > 14) {
            // اگه بیشتر از 14 روز فاصله داشت، محدودش کن
            const newTo = fromMoment.clone().add(14, 'days');
            newToDate = {
              jalaliDate: newTo.format('jYYYY/jM/jD'),
              gregorianDate: newTo.format('YYYY-MM-DD'),
            };
          }
        }

        return {...prev, fromDate: newFromDate, toDate: newToDate};
      });
    }
    fromDateSheetRef.current?.close();
  };

  const saveToDate = () => {
    if (tempToDate) {
      setFilters(prev => ({...prev, toDate: tempToDate}));
    }
    toDateSheetRef.current?.close();
  };

  const saveDuration = () => {
    const selected = durationOptions.find(d => d.value === tempDuration);
    if (selected) {
      setFilters(prev => ({...prev, duration: selected}));
    }
    durationSheetRef.current?.close();
  };

  const saveFromHour = () => {
    setFilters(prev => ({...prev, fromHour: tempFromHour}));
    fromHourSheetRef.current?.close();
  };

  const saveToHour = () => {
    setFilters(prev => ({...prev, toHour: tempToHour}));
    toHourSheetRef.current?.close();
  };

  const saveService = () => {
    const selected = serviceOptions.find(s => s.value === tempService);
    if (selected) {
      setFilters(prev => ({...prev, service: selected}));
    }
    serviceSheetRef.current?.close();
  };

  const saveGender = () => {
    const selected = GENDER_OPTIONS.find(g => g.value === tempGender);
    if (selected) {
      setFilters(prev => ({...prev, gender: selected}));
    }
    genderSheetRef.current?.close();
  };

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 relative">
      {/* Background shapes */}
      <View className="absolute -top-[25%] web:rotate-[10deg] web:-left-[30%] android:-right-[80%] ios:-right-[80%] opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%] web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>

      {/* Header */}
      <NavigationHeader title="رزرواسیون" CenterText MainBack />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        <View className="Container gap-6 pt-4">
          {/* Filter Card */}
          <View className="p-5 rounded-3xl gap-6 BaseServiceCard">
            {/* تاریخ */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                تاریخ
              </BaseText>
              <View className="flex-row gap-2">
                {/* از تاریخ */}
                <TouchableOpacity
                  onPress={() => {
                    setTempFromDate(filters.fromDate);
                    fromDateSheetRef.current?.expand();
                  }}
                  className="flex-1 h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                  <BaseText
                    type="subtitle2"
                    color={filters.fromDate ? 'base' : 'muted'}>
                    {filters.fromDate?.jalaliDate || 'از تاریخ'}
                  </BaseText>
                  <Calendar size={20} variant="Bold" color={iconColor} />
                </TouchableOpacity>

                {/* تا تاریخ */}
                <TouchableOpacity
                  onPress={() => {
                    setTempToDate(filters.toDate);
                    toDateSheetRef.current?.expand();
                  }}
                  className="flex-1 h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                  <BaseText
                    type="subtitle2"
                    color={filters.toDate ? 'base' : 'muted'}>
                    {filters.toDate?.jalaliDate || 'تا تاریخ'}
                  </BaseText>
                  <Calendar size={20} variant="Bold" color={iconColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* مدت رزرو */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                مدت رزرو
              </BaseText>
              <TouchableOpacity
                onPress={() => {
                  if (durationOptions.length > 0) {
                    setTempDuration(
                      filters.duration?.value || durationOptions[0].value,
                    );
                    durationSheetRef.current?.expand();
                  }
                }}
                disabled={tagsLoading || durationOptions.length === 0}
                className="h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                <BaseText
                  type="subtitle2"
                  color={filters.duration ? 'base' : 'muted'}>
                  {tagsLoading
                    ? 'در حال بارگذاری...'
                    : filters.duration?.label || 'انتخاب مدت'}
                </BaseText>
                <ArrowDown2 size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            {/* روزهای هفته */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                روزهای هفته
              </BaseText>
              <View className="flex-row justify-between">
                {WEEK_DAYS.map(day => {
                  const isSelected = filters.selectedDays.includes(day.id);
                  return (
                    <TouchableOpacity
                      key={day.id}
                      onPress={() => toggleDay(day.id)}
                      className={`w-[40px] h-[40px] rounded-[4px] border items-center justify-center ${
                        isSelected
                          ? 'bg-primary-700 border-primary-300  dark:bg-primary-dark-700'
                          : 'bg-primary-100 border-primary-300 dark:bg-primary-dark-100'
                      }`}>
                      <BaseText
                        type="title3"
                        className="!font-light"
                        color={isSelected ? 'button' : 'secondary'}>
                        {day.label}
                      </BaseText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* محدوده رزرو */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                محدوده رزرو
              </BaseText>
              <View className="flex-row gap-2">
                {/* از ساعت */}
                <TouchableOpacity
                  onPress={() => {
                    if (fromHours.length > 0) {
                      setTempFromHour(filters.fromHour || fromHours[0].value);
                      fromHourSheetRef.current?.expand();
                    }
                  }}
                  disabled={fromHours.length === 0}
                  className="flex-1 h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                  <BaseText type="subtitle2" color="base">
                    از{' '}
                    {filters.fromHour
                      ? filters.fromHour.padStart(2, '0')
                      : fromHours[0]?.value.padStart(2, '0') || '00'}
                    :00
                  </BaseText>
                  <Clock size={20} variant="Bold" color={iconColor} />
                </TouchableOpacity>

                {/* تا ساعت */}
                <TouchableOpacity
                  onPress={() => {
                    if (toHours.length > 0) {
                      setTempToHour(filters.toHour || toHours[0].value);
                      toHourSheetRef.current?.expand();
                    }
                  }}
                  disabled={toHours.length === 0}
                  className="flex-1 h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                  <BaseText type="subtitle2" color="base">
                    تا{' '}
                    {filters.toHour
                      ? filters.toHour === '24'
                        ? '00'
                        : filters.toHour.padStart(2, '0')
                      : toHours[0]?.value === '24'
                      ? '00'
                      : toHours[0]?.value.padStart(2, '0') || '00'}
                    :00
                  </BaseText>
                  <Clock size={20} variant="Bold" color={iconColor} />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-1">
                <BaseText type="subtitle3" color="muted">
                  رزرو شما در این محدوده فیلتر خواهد شد.
                </BaseText>
              </View>
            </View>

            {/* خدمت */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                خدمت
              </BaseText>
              <TouchableOpacity
                onPress={() => {
                  if (serviceOptions.length > 0) {
                    setTempService(
                      filters.service?.value || serviceOptions[0].value,
                    );
                    serviceSheetRef.current?.expand();
                  }
                }}
                disabled={patternsLoading || serviceOptions.length === 0}
                className="h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                <BaseText
                  type="subtitle2"
                  color={filters.service ? 'base' : 'muted'}>
                  {patternsLoading
                    ? 'در حال بارگذاری...'
                    : filters.service?.label || 'انتخاب خدمت'}
                </BaseText>
                <ArrowDown2 size={20} color={iconColor} />
              </TouchableOpacity>
            </View>

            {/* جنسیت */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                جنسیت
              </BaseText>
              <TouchableOpacity
                onPress={() => {
                  setTempGender(
                    filters.gender?.value || GENDER_OPTIONS[2].value,
                  );
                  genderSheetRef.current?.expand();
                }}
                className="h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200">
                <BaseText
                  type="subtitle2"
                  color={filters.gender ? 'base' : 'muted'}>
                  {filters.gender?.label || 'انتخاب جنسیت'}
                </BaseText>
                <ArrowDown2 size={20} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Filters Chips */}
          {activeFilters.length > 0 && (
            <View className="p-4 rounded-2xl bg-supportive2-100 dark:bg-supportive2-dark-100">
              <View className="flex-row flex-wrap gap-2">
                {activeFilters.map(chip => (
                  <View
                    key={chip.key}
                    className="flex-row items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-neutral-dark-300 border border-neutral-200 dark:border-neutral-dark-400">
                    <BaseText
                      type="caption"
                      color="base"
                      className="max-w-[250px] truncate">
                      {chip.label}
                    </BaseText>
                    <TouchableOpacity onPress={chip.onClear}>
                      <CloseCircle size={18} variant="Bold" color={iconColor} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: 8,
        }}>
        <SafeAreaView edges={['bottom']}>
          <BaseButton
            text={`نمایش موارد`}
            type="Fill"
            color="Black"
            size="Large"
            rounded
            disabled={!filters.duration || !filters.service}
            onPress={() => {
              if (!filters.duration?.tag || !filters.service?.pattern) return;

              // Convert days array to comma-separated string
              const daysStr = filters.selectedDays.join(',');

              // Format dates
              const startDate = filters.fromDate?.gregorianDate
                ? moment(filters.fromDate.gregorianDate, 'YYYY-MM-DD').format(
                    'YYYY/MM/DD',
                  )
                : moment().format('YYYY/MM/DD');
              const endDate = filters.toDate?.gregorianDate
                ? moment(filters.toDate.gregorianDate, 'YYYY-MM-DD').format(
                    'YYYY/MM/DD',
                  )
                : moment().add(3, 'days').format('YYYY/MM/DD');

              // Format time
              const startTime = `${filters.fromHour.padStart(2, '0')}:00`;
              const endTime =
                filters.toHour === '24'
                  ? '00:00'
                  : `${filters.toHour.padStart(2, '0')}:00`;

              // Navigate to detail screen
              navigation.navigate('reserveDetail', {
                tagId: filters.duration.tag.id,
                patternId: filters.service.pattern.id,
                gender: filters.gender?.value as 'Female' | 'Male' | 'Both',
                startTime,
                endTime,
                start: startDate,
                end: endDate,
                days: daysStr,
              });
            }}
          />
        </SafeAreaView>
      </View>

      {/* Bottom Sheets */}
      {/* از تاریخ */}
      <BottomSheet
        ref={fromDateSheetRef}
        Title="از تاریخ"
        snapPoints={[55]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveFromDate}>
        <JalaliDatePicker
          onChange={setTempFromDate}
          initialValue={filters.fromDate}
          minDate={fromDateMinDate}
        />
      </BottomSheet>

      {/* تا تاریخ */}
      <BottomSheet
        ref={toDateSheetRef}
        Title="تا تاریخ"
        snapPoints={[55]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveToDate}>
        <JalaliDatePicker
          onChange={setTempToDate}
          initialValue={filters.toDate}
          minDate={toDateMinDate}
          maxDate={toDateMaxDate}
        />
      </BottomSheet>

      {/* مدت رزرو */}
      <BottomSheet
        ref={durationSheetRef}
        Title="مدت رزرو"
        snapPoints={[50]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveDuration}>
        {durationOptions.length > 0 ? (
          <WheelPicker
            values={durationOptions}
            defaultValue={tempDuration}
            onChange={item => setTempDuration(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              در حال بارگذاری...
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* از ساعت */}
      <BottomSheet
        ref={fromHourSheetRef}
        Title="از ساعت"
        snapPoints={[50]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveFromHour}>
        {fromHours.length > 0 ? (
          <WheelPicker
            values={fromHours}
            defaultValue={tempFromHour}
            onChange={item => setTempFromHour(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              در حال بارگذاری...
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* تا ساعت */}
      <BottomSheet
        ref={toHourSheetRef}
        Title="تا ساعت"
        snapPoints={[50]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveToHour}>
        {toHours.length > 0 ? (
          <WheelPicker
            values={toHours}
            defaultValue={tempToHour}
            onChange={item => setTempToHour(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              در حال بارگذاری...
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* خدمت */}
      <BottomSheet
        ref={serviceSheetRef}
        Title="انتخاب خدمت"
        snapPoints={[50]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveService}>
        {serviceOptions.length > 0 ? (
          <WheelPicker
            values={serviceOptions}
            defaultValue={tempService}
            onChange={item => setTempService(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              {patternsLoading ? 'در حال بارگذاری...' : 'خدمتی یافت نشد'}
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* جنسیت */}
      <BottomSheet
        ref={genderSheetRef}
        Title="انتخاب جنسیت"
        snapPoints={[50]}
        buttonText="تایید"
        disablePan
        onButtonPress={saveGender}>
        <WheelPicker
          values={GENDER_OPTIONS}
          defaultValue={tempGender}
          onChange={item => setTempGender(item.value)}
          position="SINGLE"
        />
      </BottomSheet>
    </View>
  );
};

export default ReserveScreen;
