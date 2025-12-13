import React, {useState, useMemo, useCallback, useRef} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import {ArrowLeft2, ArrowRight2, InfoCircle} from 'iconsax-react-native';
import {useGetReservation} from '../../utils/hooks/Reservation/useGetReservation';
import {
  DayEntryDto,
  ServiceEntryDto,
} from '../../services/models/response/ReservationResService';
import {useTheme} from '../../utils/ThemeContext';
import {formatNumber} from '../../utils/helpers/helpers';
import BottomSheet, {
  BottomSheetMethods,
} from '../../components/BottomSheet/BottomSheet';
import {navigationRef} from '../../navigation/navigationRef';
import {usePreReserve} from '../../utils/hooks/Reservation/usePreReserve';
import {PreReserveQuery} from '../../services/models/requestQueries';
import PreReserveBottomSheet, {
  PreReserveBottomSheetRef,
} from '../../components/Reservation/PreReserveBottomSheet';

const VISIBLE_DAYS_COUNT = 3; // تعداد روزهایی که همزمان نشون میده
const TIME_COLUMN_WIDTH = 45; // عرض ستون ساعت

type ReserveDetailRouteProp = RouteProp<HomeStackParamList, 'reserveDetail'>;

// روزهای هفته - دوشنبه = 1 (میلادی)
const WEEK_DAYS_MAP: Record<string, {label: string; id: number}> = {
  day1: {label: 'دوشنبه', id: 1},
  day2: {label: 'سه‌شنبه', id: 2},
  day3: {label: 'چهارشنبه', id: 3},
  day4: {label: 'پنج‌شنبه', id: 4},
  day5: {label: 'جمعه', id: 5},
  day6: {label: 'شنبه', id: 6},
  day7: {label: 'یکشنبه', id: 0},
};

// رنگ‌های رندوم برای سرویس‌ها
const RANDOM_COLORS = [
  {border: '#8B4513', bg: '#D2B48C', text: '#FFFFFF'}, // قهوه‌ای
  {border: '#5BC8FF', bg: '#B3E5FC', text: '#FFFFFF'}, // آبی روشن
  {border: '#9C27B0', bg: '#E1BEE7', text: '#FFFFFF'}, // بنفش
  {border: '#4CAF50', bg: '#C8E6C9', text: '#FFFFFF'}, // سبز
  {border: '#FF9800', bg: '#FFE0B2', text: '#FFFFFF'}, // نارنجی
];

// Helper function to get random color for service based on title hash
const getServiceColor = (
  service: ServiceEntryDto,
  index: number,
): {border: string; bg: string; text: string} => {
  if (service.metadata?.reserveColor && service.metadata?.textColor) {
    return {
      border: service.metadata.reserveColor,
      bg: service.metadata.reserveColor,
      text: service.metadata.textColor,
    };
  }
  // Use hash of title for consistent color per service
  let hash = 0;
  if (service.title) {
    for (let i = 0; i < service.title.length; i++) {
      hash = service.title.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  return RANDOM_COLORS[Math.abs(hash) % RANDOM_COLORS.length];
};

// Helper function to format time slot key
const formatTimeSlot = (timeSlot: string): string => {
  const [from, to] = timeSlot.split('_');
  return `ساعت ${from} تا ${to}`;
};

// Helper function to format date
const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('/');
  const monthNames = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];
  return `${day} ${monthNames[parseInt(month, 10) - 1]}`;
};

const ReserveDetailScreen: React.FC = () => {
  const route = useRoute<ReserveDetailRouteProp>();
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const params = route.params;

  // State for date navigation - which page of days we're on
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const helpBottomSheetRef = useRef<BottomSheetMethods>(null);
  const preReserveBottomSheetRef = useRef<PreReserveBottomSheetRef>(null);

  // Pre-reserve mutation
  const preReserveMutation = usePreReserve();

  // Refetch reservation data
  const {refetch} = useGetReservation(
    {
      tagId: params.tagId,
      patternId: params.patternId,
      gender: params.gender,
      saleUnit: params.saleUnit,
      startTime: params.startTime,
      endTime: params.endTime,
      start: params.start,
      end: params.end,
      days: params.days,
    },
    true,
  );

  // State for selected item data (for bottom sheet)
  const [selectedItemData, setSelectedItemData] = useState<{
    item: ServiceEntryDto;
    dayData: DayEntryDto;
    timeSlot: string;
  } | null>(null);

  // Handle service item click
  const handleServiceItemClick = useCallback(
    (item: ServiceEntryDto, dayData: DayEntryDto, timeSlot: string) => {
      const [fromTime, toTime] = timeSlot.split('_');

      const query: PreReserveQuery = {
        product: item.id,
        day: dayData.name,
        fromTime: fromTime,
        toTime: toTime,
        gender: params.gender || 'Both',
        specificDate: dayData.date,
        isLocked: false,
      };

      console.log('PreReserve Query:', JSON.stringify(query, null, 2));

      preReserveMutation.mutate(query, {
        onSuccess: response => {
          console.log(
            'PreReserve Response:',
            JSON.stringify(response, null, 2),
          );

          // Store selected item data
          setSelectedItemData({item, dayData, timeSlot});

          // Open bottom sheet with item data
          preReserveBottomSheetRef.current?.open({
            item,
            date: dayData.date,
            fromTime,
            toTime,
            dayName: dayData.name,
          });

          // Refetch to update UI
          refetch();
        },
        onError: error => {
          console.error('PreReserve Error:', error);
          Alert.alert('خطا', error.message || 'خطا در ارسال درخواست');
        },
      });
    },
    [params.gender, preReserveMutation, refetch],
  );

  // Handle delete reservation (toggle pre-reserve)
  const handleDeleteReservation = useCallback(() => {
    if (!selectedItemData) return;

    const {item, dayData, timeSlot} = selectedItemData;
    const [fromTime, toTime] = timeSlot.split('_');

    const query: PreReserveQuery = {
      product: item.id,
      day: dayData.name,
      fromTime: fromTime,
      toTime: toTime,
      gender: params.gender || 'Both',
      specificDate: dayData.date,
      isLocked: false,
    };

    preReserveMutation.mutate(query, {
      onSuccess: () => {
        preReserveBottomSheetRef.current?.close();
        setSelectedItemData(null);
        refetch();
      },
      onError: error => {
        Alert.alert('خطا', error.message || 'خطا در لغو رزرو');
      },
    });
  }, [selectedItemData, params.gender, preReserveMutation, refetch]);

  // Handle add new reservation
  const handleAddNewReservation = useCallback(() => {
    preReserveBottomSheetRef.current?.close();
    // User can continue selecting more items
  }, []);

  // Handle complete payment
  const handleCompletePayment = useCallback(() => {
    // Navigate to cart
    navigationRef.navigate('Root', {
      screen: 'HomeNavigator',
      params: {screen: 'cart'},
    });
  }, []);

  // Build query for API
  const query = useMemo(
    () => ({
      tagId: params.tagId,
      patternId: params.patternId,
      gender: params.gender,
      saleUnit: params.saleUnit,
      startTime: params.startTime,
      endTime: params.endTime,
      start: params.start,
      end: params.end,
      days: params.days,
    }),
    [params],
  );

  const {
    data: reservationData,
    isLoading,
    error,
  } = useGetReservation(query, true);

  // Parse slots data
  const timeSlots = useMemo(() => {
    if (!reservationData) {
      return [];
    }

    // Check if reservationData itself is the slots object (direct response)
    let slots = reservationData.slots;

    // If slots doesn't exist, maybe the data itself is slots
    if (
      !slots &&
      typeof reservationData === 'object' &&
      !Array.isArray(reservationData)
    ) {
      // Check if reservationData has time slot keys directly
      const keys = Object.keys(reservationData);
      if (keys.length > 0 && keys.some(key => key.includes('_'))) {
        slots = reservationData as any;
      }
    }

    if (!slots) {
      return [];
    }

    // Check if slots is an object and has entries
    if (typeof slots !== 'object' || slots === null || Array.isArray(slots)) {
      return [];
    }

    const entries = Object.entries(slots);
    if (entries.length === 0) {
      return [];
    }

    return entries.map(([timeSlot, days]) => ({
      timeSlot,
      days: Array.isArray(days) ? (days as DayEntryDto[]) : [],
    }));
  }, [reservationData]);

  // Get date range for header
  const dateRange = useMemo(() => {
    if (!reservationData) {
      return '';
    }

    let slots = reservationData.slots;

    // If slots doesn't exist, maybe the data itself is slots
    if (
      !slots &&
      typeof reservationData === 'object' &&
      !Array.isArray(reservationData)
    ) {
      const keys = Object.keys(reservationData);
      if (keys.length > 0 && keys.some(key => key.includes('_'))) {
        slots = reservationData as any;
      }
    }

    if (!slots || Object.keys(slots).length === 0) {
      return '';
    }

    const firstSlot = Object.values(slots)[0];
    if (firstSlot && Array.isArray(firstSlot) && firstSlot.length > 0) {
      const dates = firstSlot.map((d: DayEntryDto) => d.date);
      const sortedDates = [...dates].sort();
      const minDate = sortedDates[0];
      const maxDate = sortedDates[sortedDates.length - 1];
      return `از ${formatDate(minDate)} تا ${formatDate(maxDate)}`;
    }
    return '';
  }, [reservationData]);

  // Get max days count across all slots (for pagination)
  const maxDaysInSlot = useMemo(() => {
    return Math.max(...timeSlots.map(slot => slot.days.length), 0);
  }, [timeSlots]);

  // Calculate total pages based on max days in any slot
  const totalPagesForSlots = useMemo(() => {
    return Math.ceil(maxDaysInSlot / VISIBLE_DAYS_COUNT);
  }, [maxDaysInSlot]);

  // Navigate between pages of days
  const navigatePage = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      } else if (direction === 'next' && currentPage < totalPagesForSlots - 1) {
        setCurrentPage(prev => prev + 1);
      }
    },
    [currentPage, totalPagesForSlots],
  );

  // Check if navigation is possible (use max days in any slot)
  const canGoNext = currentPage < totalPagesForSlots - 1;
  const canGoPrev = currentPage > 0;

  // Render service item card
  const renderServiceItem = useCallback(
    (
      item: ServiceEntryDto,
      index: number,
      dayData: DayEntryDto,
      timeSlot: string,
    ) => {
      const colors = getServiceColor(item, index);
      const isDisabled = item.isReserve;
      const isPreReserved = item.isPreReserved;
      const isMyReservation = item.isPreReserved && item.selfReserved;
      const displayPrice =
        item.reservePrice > 0 ? item.reservePrice : item.price || 0;
      // Check if this specific item is loading (match product, date, and time)
      const [slotFromTime, slotToTime] = timeSlot.split('_');
      const isLoading =
        preReserveMutation.isPending &&
        preReserveMutation.variables?.product === item.id &&
        preReserveMutation.variables?.specificDate === dayData.date &&
        preReserveMutation.variables?.fromTime === slotFromTime &&
        preReserveMutation.variables?.toTime === slotToTime;

      return (
        <TouchableOpacity
          key={item.id}
          disabled={isDisabled || isLoading}
          onPress={() => handleServiceItemClick(item, dayData, timeSlot)}
          className="rounded-lg border p-2 items-center justify-center gap-1"
          style={{
            borderColor: colors.border,
            borderStyle: isPreReserved && !isMyReservation ? 'dashed' : 'solid',
            backgroundColor: isMyReservation
              ? colors.bg
              : isPreReserved && !isMyReservation
              ? 'transparent'
              : isDisabled
              ? '#F5F5F5'
              : '#FFFFFF',
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
                style={{
                  color: isMyReservation
                    ? colors.text
                    : isDisabled
                    ? '#9E9E9E'
                    : !isPreReserved
                    ? '#000000'
                    : colors.border,
                }}
                className="text-center">
                {item.title}
              </BaseText>
              {displayPrice > 0 && (
                <BaseText
                  type="badge"
                  style={{
                    color: isMyReservation
                      ? colors.text
                      : isDisabled
                      ? '#9E9E9E'
                      : !isPreReserved
                      ? '#000000'
                      : colors.border,
                  }}
                  className="mt-1 text-center">
                  قیمت {formatNumber(displayPrice)}
                </BaseText>
              )}
            </>
          )}
        </TouchableOpacity>
      );
    },
    [
      handleServiceItemClick,
      preReserveMutation.isPending,
      preReserveMutation.variables?.product,
    ],
  );

  // Render items in a vertical list
  const renderItemsList = useCallback(
    (items: ServiceEntryDto[], dayData: DayEntryDto, timeSlot: string) => {
      if (items.length === 0) return null;
      return (
        <View style={{gap: 4}}>
          {items.map((item, index) => (
            <View key={item.id} style={{marginBottom: 4}}>
              {renderServiceItem(item, index, dayData, timeSlot)}
            </View>
          ))}
        </View>
      );
    },
    [renderServiceItem],
  );

  // Get visible days for a specific time slot
  const getVisibleDaysForSlot = useCallback(
    (slotDays: DayEntryDto[]) => {
      // Sort days by date
      const sortedDays = [...slotDays].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      // Get the visible page of days
      const startIndex = currentPage * VISIBLE_DAYS_COUNT;
      return sortedDays.slice(startIndex, startIndex + VISIBLE_DAYS_COUNT);
    },
    [currentPage],
  );

  // Render time slot row - each slot has its own days
  const renderTimeSlotRow = useCallback(
    (slot: {timeSlot: string; days: DayEntryDto[]}) => {
      const visibleDays = getVisibleDaysForSlot(slot.days);

      return (
        <View key={slot.timeSlot} className="mb-4">
          <View className="flex-row">
            {/* Time Label - Right Side (Fixed Width) */}
            <View
              style={{width: TIME_COLUMN_WIDTH}}
              className="items-center justify-center rounded-lg px-2 bg-secondary-600  py-3 ">
              <BaseText
                type="caption"
                color="button"
                className="text-center leading-tight">
                {formatTimeSlot(slot.timeSlot)}
              </BaseText>
            </View>

            {/* Days columns with headers - each slot shows its own days */}
            <View className="flex-row flex-1">
              {visibleDays.map(dayData => {
                const dayInfo = WEEK_DAYS_MAP[dayData.name];
                if (!dayInfo) return null;

                return (
                  <View
                    key={`${dayData.name}_${dayData.date}`}
                    className="flex-1 px-1"
                    style={{minWidth: 0}}>
                    {/* Day Header for this column */}
                    <View className="rounded-xl bg-neutral-300 dark:bg-neutral-dark-300 px-2 py-2 mb-2">
                      <BaseText
                        type="caption"
                        color="base"
                        className="text-center font-bold">
                        {dayInfo.label}
                      </BaseText>
                      <BaseText
                        type="subtitle3"
                        color="secondary"
                        className="text-center">
                        {formatDate(dayData.date)}
                      </BaseText>
                    </View>
                    {/* Items List */}
                    {renderItemsList(dayData.items, dayData, slot.timeSlot)}
                  </View>
                );
              })}
              {/* Fill empty slots if less than 3 days */}
              {visibleDays.length < VISIBLE_DAYS_COUNT &&
                Array.from({
                  length: VISIBLE_DAYS_COUNT - visibleDays.length,
                }).map((_, idx) => (
                  <View key={`empty_${idx}`} className="flex-1 px-1" />
                ))}
            </View>
          </View>
        </View>
      );
    },
    [getVisibleDaysForSlot, renderItemsList],
  );

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
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-5 pt-2 pb-2">
          {/* Back Button - Right Side */}
          <BaseButton
            onPress={() => {
              navigationRef.goBack();
            }}
            noText
            LeftIcon={ArrowRight2}
            type="Outline"
            color="Black"
            rounded
          />

          {/* Title - Center */}
          <View className="flex-1 items-center">
            <BaseText type="body2" color="base">
              خدمات
            </BaseText>
          </View>

          {/* Info Button - Left Side */}
          <BaseButton
            onPress={() => helpBottomSheetRef.current?.expand()}
            noText
            LeftIcon={InfoCircle}
            type="Outline"
            color="Black"
            rounded
          />
          {/* <TouchableOpacity
            onPress={() => helpBottomSheetRef.current?.expand()}
            className="w-10 h-10 items-center justify-center rounded-full border  border-neutral-300 dark:border-neutral-dark-400">
            <InfoCircle size={20} color={isDark ? '#AAABAD' : '#717181'} />
          </TouchableOpacity> */}
        </View>

        {/* Date Navigation */}
        <View className="flex-row items-center justify-between  gap-4 px-5 py-2 ">
          <TouchableOpacity
            onPress={() => navigatePage('next')}
            disabled={!canGoNext}
            style={{opacity: canGoNext ? 1 : 0.3}}
            className="p-2">
            <ArrowRight2 size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          {/* <View className="flex-row items-center gap-1">
            <BaseText type="body3" color="secondary">
              صفحه {currentPage + 1} از {totalPagesForSlots || 1}
            </BaseText>
          </View> */}
          <TouchableOpacity
            onPress={() => navigatePage('prev')}
            disabled={!canGoPrev}
            style={{opacity: canGoPrev ? 1 : 0.3}}
            className="p-2">
            <ArrowLeft2 size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-5">
          <BaseText type="title4" color="secondary">
            خطا در دریافت اطلاعات
          </BaseText>
          <BaseText type="body3" color="secondary" className="mt-2">
            {error.message}
          </BaseText>
        </View>
      ) : !reservationData || timeSlots.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <BaseText type="title4" color="secondary">
            موردی یافت نشد
          </BaseText>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 40}}>
          <View className="Container pt-4 px-3">
            {/* Time Slots Rows - each slot has its own day headers */}
            {timeSlots.map(renderTimeSlotRow)}
          </View>
        </ScrollView>
      )}

      {/* Help Bottom Sheet */}
      <BottomSheet ref={helpBottomSheetRef} snapPoints={[45]} Title="راهنما">
        <View className="gap-4 px-2">
          {/* Legend Item - Pre Reserved (Dashed) */}
          <View className="flex-row items-center gap-3">
            <View
              className="w-16 h-12 rounded-lg items-center justify-center"
              style={{
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '#5BC8FF',
                backgroundColor: 'transparent',
              }}>
              <BaseText type="caption" style={{color: '#5BC8FF'}}>
                نمونه
              </BaseText>
            </View>
            <View className="flex-1">
              <BaseText type="body3" color="base">
                در حال رزرو
              </BaseText>
              <BaseText type="caption" color="secondary">
                این خدمت توسط شخص دیگری در حال رزرو شدن است
              </BaseText>
            </View>
          </View>

          {/* Legend Item - Reserved by others (Disabled) */}
          <View className="flex-row items-center gap-3">
            <View
              className="w-16 h-12 rounded-lg items-center justify-center"
              style={{
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: '#E0E0E0',
                backgroundColor: '#F5F5F5',
              }}>
              <BaseText type="caption" style={{color: '#9E9E9E'}}>
                نمونه
              </BaseText>
            </View>
            <View className="flex-1">
              <BaseText type="body3" color="base">
                رزرو شده
              </BaseText>
              <BaseText type="caption" color="secondary">
                این خدمت قبلاً توسط شخص دیگری رزرو شده است
              </BaseText>
            </View>
          </View>

          {/* Legend Item - My Reservation (Filled) */}
          <View className="flex-row items-center gap-3">
            <View
              className="w-16 h-12 rounded-lg items-center justify-center"
              style={{
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF50',
              }}>
              <BaseText type="caption" style={{color: '#FFFFFF'}}>
                نمونه
              </BaseText>
            </View>
            <View className="flex-1">
              <BaseText type="body3" color="base">
                رزرو شده توسط من
              </BaseText>
              <BaseText type="caption" color="secondary">
                این خدمت توسط شما رزرو شده است
              </BaseText>
            </View>
          </View>

          {/* Legend Item - Available */}
          <View className="flex-row items-center gap-3">
            <View
              className="w-16 h-12 rounded-lg items-center justify-center"
              style={{
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: '#5BC8FF',
                backgroundColor: '#FFFFFF',
              }}>
              <BaseText type="caption" style={{color: '#000000'}}>
                نمونه
              </BaseText>
            </View>
            <View className="flex-1">
              <BaseText type="body3" color="base">
                قابل رزرو
              </BaseText>
              <BaseText type="caption" color="secondary">
                این خدمت آزاد است و می‌توانید رزرو کنید
              </BaseText>
            </View>
          </View>
        </View>
      </BottomSheet>

      {/* Pre-Reserve Bottom Sheet */}
      <PreReserveBottomSheet
        ref={preReserveBottomSheetRef}
        onAddNewReservation={handleAddNewReservation}
        onCompletePayment={handleCompletePayment}
        onDeleteReservation={handleDeleteReservation}
      />
    </View>
  );
};

export default ReserveDetailScreen;
