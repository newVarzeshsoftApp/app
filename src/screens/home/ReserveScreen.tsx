import React, {useState, useRef, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Alert,
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

// Helper function to generate time slots based on duration and unit
const generateTimeSlots = (
  startTime: string,
  endTime: string,
  duration: string,
  unit: 'MINUTE' | 'HOUR',
): Array<{value: string; label: string}> => {
  const start = parseTime(startTime);
  let end = parseTime(endTime);

  // Handle case where endTime is "00:00" (midnight) - it means 24:00
  if (end === 0 && endTime === '00:00') {
    end = 24;
  }

  const durationNum = parseInt(duration, 10);
  const durationInHours =
    unit === 'HOUR' ? durationNum : Math.ceil(durationNum / 60);

  const slots: Array<{value: string; label: string}> = [];
  let currentHour = start;

  while (currentHour < end) {
    const nextHour = currentHour + durationInHours;
    // If nextHour exceeds end, stop
    if (nextHour > end) {
      break;
    }

    const slotValue = currentHour.toString();
    const slotLabel =
      nextHour === 24
        ? `${currentHour.toString().padStart(2, '0')}:00 - 00:00`
        : `${currentHour.toString().padStart(2, '0')}:00 - ${nextHour
            .toString()
            .padStart(2, '0')}:00`;

    slots.push({
      value: slotValue,
      label: slotLabel,
    });

    currentHour = nextHour;
  }

  return slots;
};

// Helper function to generate from/to hours based on duration slots
const generateFromToHours = (
  startTime: string,
  endTime: string,
  duration: string,
  unit: 'MINUTE' | 'HOUR',
): {
  fromHours: Array<{value: string; label: string}>;
  toHours: Array<{value: string; label: string}>;
} => {
  const start = parseTime(startTime);
  let end = parseTime(endTime);

  // Handle case where endTime is "00:00" (midnight) - it means 24:00
  if (end === 0 && endTime === '00:00') {
    end = 24;
  }

  const durationNum = parseInt(duration, 10);
  const durationInHours =
    unit === 'HOUR' ? durationNum : Math.ceil(durationNum / 60);

  const fromHours: Array<{value: string; label: string}> = [];
  const toHours: Array<{value: string; label: string}> = [];
  let currentHour = start;

  // Generate all possible time slots
  // Example: start=7, end=24, duration=1 → slots: 7-8, 8-9, 9-10, ..., 23-24
  while (currentHour < end) {
    const nextHour = currentHour + durationInHours;

    // Check if nextHour is valid (should be <= end, or exactly 24)
    if (nextHour > end && nextHour !== 24) {
      break;
    }

    // Add to fromHours (e.g., 07:00, 08:00, 09:00, ...)
    fromHours.push({
      value: currentHour.toString(),
      label: `${currentHour.toString().padStart(2, '0')}:00`,
    });

    // Add to toHours (e.g., 08:00, 09:00, 10:00, ..., 00:00)
    toHours.push({
      value: nextHour === 24 ? '24' : nextHour.toString(),
      label:
        nextHour === 24
          ? '00:00'
          : `${nextHour.toString().padStart(2, '0')}:00`,
    });

    // Move to next slot start
    currentHour = nextHour;

    // Stop if we've reached or exceeded 24
    if (currentHour >= 24) {
      break;
    }
  }

  return {fromHours, toHours};
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

  // Convert patterns to service options - add "همه خدمات" option
  const serviceOptions = useMemo(() => {
    if (!patternsData?.content) return [];
    const allServicesOption = {
      value: 'all',
      label: 'همه خدمات',
      pattern: null,
    };
    const patternOptions = patternsData.content.map(pattern => ({
      value: pattern.id.toString(),
      label: pattern.name,
      pattern: pattern,
    }));
    return [allServicesOption, ...patternOptions];
  }, [patternsData]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    fromDate: defaultFromDate,
    toDate: defaultToDate,
    duration: null,
    selectedDays: [], // خالی به صورت دیفالت
    fromHour: '10',
    toHour: '11',
    service: null,
    gender: GENDER_OPTIONS[2], // هر دو دیفالت
  });

  // Generate hours from selected service pattern or all tags
  const fromHours = useMemo(() => {
    // If a specific service is selected, use its reservationTag with duration
    if (filters.service?.pattern?.reservationTag) {
      const tag = filters.service.pattern.reservationTag;
      const {fromHours: generatedFromHours} = generateFromToHours(
        tag.startTime,
        tag.endTime,
        tag.duration,
        tag.unit,
      );
      return generatedFromHours;
    }

    // If "all services" is selected AND duration is selected,
    // generate hours ONLY from the selected duration tag (not all tags merged).
    if (filters.service?.value === 'all' && filters.duration?.tag) {
      const tag = filters.duration.tag;
      const {fromHours: generatedFromHours} = generateFromToHours(
        tag.startTime,
        tag.endTime,
        tag.duration,
        tag.unit,
      );
      return generatedFromHours;
    }

    // Otherwise, merge hours from all tags (fallback)
    if (!tagsData?.content || tagsData.content.length === 0) return [];

    // Generate hours from each tag and merge them
    const allFromHours: Array<{value: string; label: string}> = [];
    const seenValues = new Set<string>();

    tagsData.content.forEach(tag => {
      const {fromHours: generatedFromHours} = generateFromToHours(
        tag.startTime,
        tag.endTime,
        tag.duration,
        tag.unit,
      );

      generatedFromHours.forEach(hour => {
        // Avoid duplicates
        if (!seenValues.has(hour.value)) {
          seenValues.add(hour.value);
          allFromHours.push(hour);
        }
      });
    });

    // Sort by hour value
    return allFromHours.sort((a, b) => {
      const aNum = parseInt(a.value, 10);
      const bNum = parseInt(b.value, 10);
      return aNum - bNum;
    });
  }, [tagsData, filters.service, filters.duration]);

  const toHours = useMemo(() => {
    // If a specific service is selected, use its reservationTag with duration
    if (filters.service?.pattern?.reservationTag) {
      const tag = filters.service.pattern.reservationTag;
      const {toHours: generatedToHours} = generateFromToHours(
        tag.startTime,
        tag.endTime,
        tag.duration,
        tag.unit,
      );
      return generatedToHours;
    }

    // If "all services" is selected AND duration is selected,
    // generate hours ONLY from the selected duration tag (not all tags merged).
    if (filters.service?.value === 'all' && filters.duration?.tag) {
      const tag = filters.duration.tag;
      const {toHours: generatedToHours} = generateFromToHours(
        tag.startTime,
        tag.endTime,
        tag.duration,
        tag.unit,
      );
      return generatedToHours;
    }

    // Otherwise, merge hours from all tags (fallback)
    if (!tagsData?.content || tagsData.content.length === 0) return [];

    // Generate hours from each tag and merge them
    const allToHours: Array<{value: string; label: string}> = [];
    const seenValues = new Set<string>();

    tagsData.content.forEach(tag => {
      const {toHours: generatedToHours} = generateFromToHours(
        tag.startTime,
        tag.endTime,
        tag.duration,
        tag.unit,
      );

      generatedToHours.forEach(hour => {
        // Avoid duplicates
        if (!seenValues.has(hour.value)) {
          seenValues.add(hour.value);
          allToHours.push(hour);
        }
      });
    });

    // Sort by hour value (handle 24 specially)
    return allToHours.sort((a, b) => {
      const aNum = a.value === '24' ? 24 : parseInt(a.value, 10);
      const bNum = b.value === '24' ? 24 : parseInt(b.value, 10);
      return aNum - bNum;
    });
  }, [tagsData, filters.service, filters.duration]);

  // Filter toHours based on selected fromHour to prevent invalid selections
  const toHoursFiltered = useMemo(() => {
    if (!filters.fromHour) return toHours;

    const fromHourNum = parseInt(filters.fromHour, 10);

    return toHours.filter(toHour => {
      const toHourNum = toHour.value === '24' ? 24 : parseInt(toHour.value, 10);
      // For same day: toHour must be greater than fromHour
      // For next day (24): always allow
      return toHourNum === 24 || toHourNum > fromHourNum;
    });
  }, [toHours, filters.fromHour]);

  // Set default service when data is loaded
  React.useEffect(() => {
    if (serviceOptions.length > 0 && !filters.service) {
      setFilters(prev => ({
        ...prev,
        service: serviceOptions[0], // "همه خدمات" is first
      }));
    }
  }, [serviceOptions.length]);

  // Auto-set duration and time range when service is selected
  React.useEffect(() => {
    if (filters.service?.pattern?.reservationTag) {
      const tag = filters.service.pattern.reservationTag;

      // Find matching duration option by tag id
      const matchingDuration = durationOptions.find(d => d.tag?.id === tag.id);

      if (matchingDuration) {
        // Generate time slots from tag
        const {fromHours: generatedFromHours, toHours: generatedToHours} =
          generateFromToHours(
            tag.startTime,
            tag.endTime,
            tag.duration,
            tag.unit,
          );

        // Set first fromHour and last toHour
        if (generatedFromHours.length > 0 && generatedToHours.length > 0) {
          setFilters(prev => ({
            ...prev,
            duration: matchingDuration, // Always set duration from tag
            fromHour: generatedFromHours[0].value,
            toHour: generatedToHours[generatedToHours.length - 1].value, // آخرین مقدار
          }));
        }
      }
    } else if (filters.service?.value === 'all') {
      // If "همه خدمات" selected, set default duration and hours from all tags
      if (durationOptions.length > 0) {
        const defaultFromHour =
          fromHours.length > 0 ? fromHours[0].value : '10';
        const defaultToHour =
          toHours.length > 0 ? toHours[toHours.length - 1].value : '11'; // آخرین مقدار

        setFilters(prev => ({
          ...prev,
          duration: prev.duration || durationOptions[0], // Keep current or set first
          fromHour: defaultFromHour,
          toHour: defaultToHour,
        }));
      }
    }
  }, [filters.service, durationOptions, fromHours, toHours]);

  // Auto-update time range when duration changes (for "all services" mode)
  const prevDurationRef = useRef<{
    value: string;
    label: string;
    tag?: ReservationTag;
  } | null>(null);
  React.useEffect(() => {
    // Only update when service is "all" and duration is selected and duration actually changed
    if (
      filters.service?.value === 'all' &&
      filters.duration?.tag &&
      prevDurationRef.current?.tag?.id !== filters.duration.tag.id
    ) {
      if (fromHours.length > 0 && toHours.length > 0) {
        const firstFromHour = fromHours[0].value;
        const lastToHour = toHours[toHours.length - 1].value; // آخرین مقدار

        setFilters(prev => ({
          ...prev,
          fromHour: firstFromHour,
          toHour: lastToHour,
        }));
      }
    }
    // Update ref
    prevDurationRef.current = filters.duration;
  }, [filters.duration, filters.service, fromHours, toHours]);

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

  // Animation values
  const filterCardOpacity = useRef(new Animated.Value(1)).current;
  const filterCardTranslateY = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;

  // Animate when filters change
  useEffect(() => {
    Animated.parallel([
      Animated.timing(filterCardOpacity, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(filterCardTranslateY, {
        toValue: -10,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonTranslateY, {
        toValue: -5,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(filterCardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(filterCardTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [
    filters.service,
    filters.duration,
    filters.fromHour,
    filters.toHour,
    filters.selectedDays,
  ]);

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
    setFilters(prev => ({...prev, selectedDays: []})); // خالی به صورت دیفالت
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

  // Active filters for chips (including all filters, but some are not removable)
  const activeFilters = useMemo(() => {
    const chips: {
      key: string;
      label: string;
      onClear: () => void;
      removable: boolean;
    }[] = [];

    // Duration - not removable
    if (filters.duration) {
      chips.push({
        key: 'duration',
        label: filters.duration.label,
        onClear: clearDuration,
        removable: false,
      });
    }

    // From Date - not removable
    if (filters.fromDate) {
      chips.push({
        key: 'fromDate',
        label: `از ${filters.fromDate.jalaliDate}`,
        onClear: clearFromDate,
        removable: false,
      });
    }

    // To Date - not removable
    if (filters.toDate) {
      chips.push({
        key: 'toDate',
        label: `تا ${filters.toDate.jalaliDate}`,
        onClear: clearToDate,
        removable: false,
      });
    }

    // Gender - not removable
    if (filters.gender) {
      chips.push({
        key: 'gender',
        label: filters.gender.label,
        onClear: clearGender,
        removable: false,
      });
    }

    // Days - removable
    if (filters.selectedDays.length > 0) {
      const dayNames = filters.selectedDays
        .map(d => WEEK_DAYS.find(w => w.id === d)?.fullName)
        .filter(Boolean)
        .join('، ');
      chips.push({
        key: 'days',
        label: dayNames,
        onClear: clearDays,
        removable: true,
      });
    }

    // Service - removable (only if not "all")
    if (filters.service && filters.service.value !== 'all') {
      chips.push({
        key: 'service',
        label: filters.service.label,
        onClear: clearService,
        removable: true,
      });
    }

    // Time Range - removable
    if (filters.fromHour && filters.toHour) {
      chips.push({
        key: 'time',
        label: `از ${filters.fromHour.padStart(2, '0')}:00 تا ${
          filters.toHour === '24' ? '00' : filters.toHour.padStart(2, '0')
        }:00`,
        onClear: clearTimeRange,
        removable: true,
      });
    }

    return chips;
  }, [
    filters,
    clearDays,
    clearDuration,
    clearFromDate,
    clearToDate,
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
    const fromHourNum = parseInt(tempFromHour, 10);
    const currentToHourNum =
      filters.toHour === '24' ? 24 : parseInt(filters.toHour || '0', 10);

    // Validate: fromHour should not be greater than or equal to toHour
    if (currentToHourNum !== 24 && fromHourNum >= currentToHourNum) {
      // Reset toHour if invalid
      setFilters(prev => ({
        ...prev,
        fromHour: tempFromHour,
        toHour: '', // Reset toHour to force user to select again
      }));
    } else {
      setFilters(prev => ({...prev, fromHour: tempFromHour}));
    }
    fromHourSheetRef.current?.close();
  };

  const saveToHour = () => {
    const fromHourNum = parseInt(filters.fromHour || '0', 10);
    const toHourNum = tempToHour === '24' ? 24 : parseInt(tempToHour, 10);

    // Validate: toHour should be greater than fromHour (unless it's 24)
    if (toHourNum !== 24 && toHourNum <= fromHourNum) {
      Alert.alert('خطا', 'ساعت "تا" باید بزرگتر از ساعت "از" باشد');
      return;
    }

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

            {/* مدت رزرو */}
            <View className="gap-3">
              <BaseText type="title4" color="base">
                مدت رزرو
              </BaseText>
              <TouchableOpacity
                onPress={() => {
                  if (
                    durationOptions.length > 0 &&
                    filters.service?.value === 'all'
                  ) {
                    setTempDuration(
                      filters.duration?.value || durationOptions[0].value,
                    );
                    durationSheetRef.current?.expand();
                  }
                }}
                disabled={
                  tagsLoading ||
                  durationOptions.length === 0 ||
                  filters.service?.value !== 'all'
                }
                className="h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200"
                style={{
                  opacity:
                    tagsLoading ||
                    durationOptions.length === 0 ||
                    filters.service?.value !== 'all'
                      ? 0.6
                      : 1,
                }}>
                <BaseText
                  type="subtitle2"
                  color={
                    filters.service?.value !== 'all' && filters.duration
                      ? 'muted'
                      : filters.duration
                      ? 'base'
                      : 'muted'
                  }>
                  {tagsLoading
                    ? 'در حال بارگذاری...'
                    : filters.duration?.label || 'انتخاب مدت'}
                </BaseText>
                <ArrowDown2
                  size={20}
                  color={
                    filters.service?.value === 'all' ? iconColor : '#CCCCCC'
                  }
                />
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
                    if (toHoursFiltered.length > 0) {
                      setTempToHour(
                        filters.toHour || toHoursFiltered[0]?.value || '',
                      );
                      toHourSheetRef.current?.expand();
                    }
                  }}
                  disabled={toHoursFiltered.length === 0 || !filters.fromHour}
                  className="flex-1 h-12 py-3 px-4 flex-row items-center justify-between border border-neutral-300 dark:border-neutral-dark-400 rounded-full bg-neutral-0 dark:bg-neutral-dark-200"
                  style={{
                    opacity:
                      toHoursFiltered.length === 0 || !filters.fromHour
                        ? 0.5
                        : 1,
                  }}>
                  <BaseText type="subtitle2" color="base">
                    تا{' '}
                    {filters.toHour
                      ? filters.toHour === '24'
                        ? '00'
                        : filters.toHour.padStart(2, '0')
                      : toHoursFiltered[0]?.value === '24'
                      ? '00'
                      : toHoursFiltered[0]?.value?.padStart(2, '0') || '00'}
                    :00
                  </BaseText>
                  <Clock size={20} variant="Bold" color={iconColor} />
                </TouchableOpacity>
              </View>
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
                    {chip.removable && (
                      <TouchableOpacity onPress={chip.onClear}>
                        <CloseCircle
                          size={18}
                          variant="Bold"
                          color={iconColor}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 24,
          paddingTop: 8,
          transform: [{translateY: buttonTranslateY}],
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
              if (!filters.duration?.tag || !filters.service) return;

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

              // Navigate params - don't send patternId if "all" is selected
              const navigateParams: any = {
                tagId: filters.duration.tag.id,
                gender: filters.gender?.value as 'Female' | 'Male' | 'Both',
                startTime,
                endTime,
                start: startDate,
                end: endDate,
                days: daysStr,
              };

              // Only add patternId if a specific service is selected
              if (filters.service.value !== 'all' && filters.service.pattern) {
                navigateParams.patternId = filters.service.pattern.id;
              }

              // Navigate to detail screen
              navigation.navigate('reserveDetail', navigateParams);
            }}
          />
        </SafeAreaView>
      </Animated.View>

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
        {toHoursFiltered.length > 0 ? (
          <WheelPicker
            values={toHoursFiltered}
            defaultValue={tempToHour}
            onChange={item => setTempToHour(item.value)}
            position="SINGLE"
          />
        ) : (
          <View className="py-10 items-center">
            <BaseText type="body2" color="muted">
              {filters.fromHour
                ? 'لطفاً ابتدا ساعت "از" را انتخاب کنید'
                : 'در حال بارگذاری...'}
            </BaseText>
          </View>
        )}
      </BottomSheet>

      {/* خدمت */}
      <BottomSheet
        ref={serviceSheetRef}
        Title="انتخاب خدمت"
        snapPoints={[60]}
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
