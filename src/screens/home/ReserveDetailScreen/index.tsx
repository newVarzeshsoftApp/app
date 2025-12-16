import React, {useRef, useCallback} from 'react';
import {View, Image, ScrollView, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute} from '@react-navigation/native';
import {HomeStackParamList} from '../../../utils/types/NavigationTypes';
import BaseText from '../../../components/BaseText';
import BaseButton from '../../../components/Button/BaseButton';
import {ArrowRight2, InfoCircle} from 'iconsax-react-native';
import {useTheme} from '../../../utils/ThemeContext';
import {navigationRef} from '../../../navigation/navigationRef';
import PreReserveBottomSheet, {
  PreReserveBottomSheetRef,
} from '../../../components/Reservation/PreReserveBottomSheet';

// Components
import TimeSlotRow from './components/TimeSlotRow';
import DateNavigation from './components/DateNavigation';
import HelpBottomSheet from './components/HelpBottomSheet';

// Hooks
import {useReservationData} from './hooks/useReservationData';
import {usePageNavigation} from './hooks/usePageNavigation';
import {usePreReserveHandlers} from './hooks/usePreReserveHandlers';
import {useReservationState} from './hooks/useReservationState';
import {useSSEConnection} from './hooks/useSSEConnection';
import {useAuth} from '../../../utils/hooks/useAuth';

// Utils
import {BottomSheetMethods} from '../../../components/BottomSheet/BottomSheet';

type ReserveDetailRouteProp = RouteProp<HomeStackParamList, 'reserveDetail'>;

const ReserveDetailScreen: React.FC = () => {
  const route = useRoute<ReserveDetailRouteProp>();
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const params = route.params;

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const helpBottomSheetRef = useRef<BottomSheetMethods>(null);
  const preReserveBottomSheetRef = useRef<PreReserveBottomSheetRef>(null);

  // Custom Hooks
  const {profile, SKU} = useAuth();
  const {timeSlots, isLoading, error, refetch, totalPagesForSlots} =
    useReservationData(params);

  const {
    currentPage,
    slideAnim,
    opacityAnim,
    getVisibleDaysForSlot,
    navigatePage,
    canGoNext,
    canGoPrev,
  } = usePageNavigation({totalPages: totalPagesForSlots});

  // Reservation state management
  const {
    getItemState,
    updateReservation,
    removeReservation,
    isPreReservedByMe,
  } = useReservationState({timeSlots});

  // SSE Connection for real-time updates
  useSSEConnection({
    onEvent: useCallback(
      (event: {
        product: number;
        date: string;
        fromTime: string;
        toTime: string;
        user: number;
        status: 'reserved' | 'pre-reserved' | 'cancelled';
      }) => {
        // Find dayName from timeSlots
        let dayName = '';
        for (const slot of timeSlots) {
          const day = slot.days.find(d => d.date === event.date);
          if (day) {
            dayName = day.name;
            break;
          }
        }

        // Handle SSE events
        if (event.status === 'reserved') {
          updateReservation(
            event.product,
            event.date,
            event.fromTime,
            event.toTime,
            dayName,
            'reserved',
            event.user,
          );
        } else if (event.status === 'pre-reserved') {
          // Check if it's for current user
          const isMyReservation = event.user === profile?.id;
          updateReservation(
            event.product,
            event.date,
            event.fromTime,
            event.toTime,
            dayName,
            isMyReservation ? 'pre-reserved-by-me' : 'pre-reserved-by-others',
            event.user,
          );
        } else if (event.status === 'cancelled') {
          removeReservation(
            event.product,
            event.date,
            event.fromTime,
            event.toTime,
          );
        }
        // Refetch to sync with server
        refetch();
      },
      [timeSlots, updateReservation, removeReservation, profile?.id, refetch],
    ),
    enabled: !!profile && !!SKU,
  });

  const {
    handleServiceItemClick,
    handleDeleteReservation,
    handleAddNewReservation,
    getLoadingItems,
    isPending,
  } = usePreReserveHandlers({
    gender: params.gender,
    refetch,
    preReserveBottomSheetRef,
    isPreReservedByMe,
    getItemState,
    updateReservation,
    removeReservation,
  });

  // Handle complete payment
  const handleCompletePayment = () => {
    // Clear reservation state after successful payment completion
    preReserveBottomSheetRef.current?.clearCurrentReservationState();
    navigationRef.navigate('Root', {
      screen: 'HomeNavigator',
      params: {screen: 'cart'},
    });
  };

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 relative">
      {/* Background shapes */}
      <View className="absolute -top-[25%] web:rotate-[10deg] web:-left-[30%] android:-right-[80%] ios:-right-[80%] opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%] web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>

      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2 relative">
          {/* Back Button */}
          <BaseButton
            onPress={() => navigationRef.goBack()}
            noText
            LeftIcon={ArrowRight2}
            type="Outline"
            color="Black"
            rounded
            className="z-10"
          />

          {/* Title */}
          <View
            className="absolute -z-[1] "
            style={{
              left: 0,
              right: 0,
              alignItems: 'center',
            }}>
            <BaseText type="body2" color="base">
              خدمات
            </BaseText>
          </View>

          {/* Info Button */}
          <BaseButton
            onPress={() => helpBottomSheetRef.current?.expand()}
            text="راهنما"
            RightIcon={InfoCircle}
            type="Outline"
            color="Black"
            className="z-10"
            rounded
          />
        </View>

        {/* Date Navigation */}
        <DateNavigation
          currentPage={currentPage}
          totalPages={totalPagesForSlots}
          startDate={params.start}
          endDate={params.end}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={() => navigatePage('prev')}
          onNext={() => navigatePage('next')}
          isDark={isDark}
        />
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
      ) : timeSlots.length === 0 ? (
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
            {timeSlots.map(slot => {
              const visibleDays = getVisibleDaysForSlot(slot.days);
              return (
                <TimeSlotRow
                  key={slot.timeSlot}
                  timeSlot={slot.timeSlot}
                  visibleDays={visibleDays}
                  slideAnim={slideAnim}
                  opacityAnim={opacityAnim}
                  onServicePress={handleServiceItemClick}
                  isLoadingItems={getLoadingItems()}
                  getItemState={getItemState}
                />
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Help Bottom Sheet */}
      <HelpBottomSheet bottomSheetRef={helpBottomSheetRef} />

      {/* Pre-Reserve Bottom Sheet */}
      <PreReserveBottomSheet
        ref={preReserveBottomSheetRef}
        onAddNewReservation={handleAddNewReservation}
        onCompletePayment={handleCompletePayment}
        onDeleteReservation={handleDeleteReservation}
        isDeleting={isPending}
      />
    </View>
  );
};

export default ReserveDetailScreen;
