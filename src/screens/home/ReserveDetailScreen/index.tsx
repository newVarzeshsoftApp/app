import React, {useRef, useCallback, useEffect} from 'react';
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
        date?: string;
        specificDate?: string;
        fromTime: string;
        toTime: string;
        user?: number;
        status?: 'reserved' | 'pre-reserved' | 'cancelled' | 'locked';
        isLocked?: string | boolean;
        day?: string;
      }) => {
        console.log('🔔 onEvent callback triggered with event:', {
          product: event.product,
          date: event.date,
          specificDate: event.specificDate,
          fromTime: event.fromTime,
          toTime: event.toTime,
          user: event.user,
          status: event.status,
          isLocked: event.isLocked,
          day: event.day,
        });

        // Get date from event (prefer specificDate, fallback to date)
        const eventDate = event.specificDate || event.date;
        if (!eventDate) {
          console.warn('⚠️ SSE event missing date, skipping:', event);
          return;
        }

        // Find dayName from timeSlots or use event.day
        let dayName = event.day || '';
        if (!dayName) {
          for (const slot of timeSlots) {
            const day = slot.days.find(d => d.date === eventDate);
            if (day) {
              dayName = day.name;
              break;
            }
          }
        }

        // Fallback: if dayName is still empty, use a default or skip update
        // This should not happen in normal flow, but we handle it gracefully
        if (!dayName) {
          console.warn(
            '⚠️ SSE event missing dayName, trying to infer from date:',
            {
              eventDate,
              event,
            },
          );
          // Try to extract day name from date or use a default
          // For now, we'll still process the event but log a warning
        }

        // Check if this event is from current user
        // Only check if user is defined in event and matches current user
        // If user is undefined, it's not from current user (server event)
        const isMyAction =
          event.user !== undefined && event.user === profile?.id;

        console.log('📨 SSE Event received:', {
          product: event.product,
          date: eventDate,
          fromTime: event.fromTime,
          toTime: event.toTime,
          user: event.user,
          status: event.status,
          isLocked: event.isLocked,
          isMyAction,
          currentUserId: profile?.id,
        });

        // Handle locked/unlocked status
        // When locked = someone is reserving this slot
        // Priority: Check status first, then isLocked
        if (
          event.status === 'locked' ||
          event.isLocked === true ||
          event.isLocked === 'true'
        ) {
          // When locked, mark as pre-reserved
          // If it's from current user, state was already updated in handleServiceItemClick (pre-reserved-by-me)
          // Only update if it's from another user to show pre-reserved-by-others
          // IMPORTANT: Process for all users except current user (even if user is undefined in event)
          if (!isMyAction) {
            // Use dayName if available, otherwise use empty string (updateReservation will handle it)
            const finalDayName = dayName || event.day || '';

            console.log(
              '🔵 [User B] Processing locked event - About to update reservation',
              {
                product: event.product,
                date: eventDate,
                fromTime: event.fromTime,
                toTime: event.toTime,
                user: event.user,
                currentUserId: profile?.id,
                dayName: finalDayName,
                isMyAction,
                eventStatus: event.status,
                eventIsLocked: event.isLocked,
              },
            );

            try {
              updateReservation(
                event.product,
                eventDate,
                event.fromTime,
                event.toTime,
                finalDayName,
                'pre-reserved-by-others',
                event.user,
              );
              console.log('✅ [User B] Successfully called updateReservation', {
                product: event.product,
                date: eventDate,
                fromTime: event.fromTime,
                toTime: event.toTime,
              });
            } catch (error) {
              console.error(
                '❌ [User B] Error calling updateReservation:',
                error,
              );
            }
          } else {
            console.log(
              '⏭️ [User A] Ignoring locked event from current user (already set to pre-reserved-by-me)',
              {
                product: event.product,
                date: eventDate,
                user: event.user,
                currentUserId: profile?.id,
                isMyAction,
              },
            );
          }
        } else if (event.isLocked === false || event.isLocked === 'false') {
          // When unlocked, remove reservation (make it available again)
          // Only process if it's from another user (user field is defined and not current user)
          // If user is undefined, ignore it (might be a system event that shouldn't affect current user)
          // If it's from current user, state was already removed in handleDeleteReservation
          if (event.user !== undefined && !isMyAction) {
            console.log(
              '🔓 [User B] Unlock event - removing reservation (from another user)',
            );
            removeReservation(
              event.product,
              eventDate,
              event.fromTime,
              event.toTime,
            );
          } else if (isMyAction) {
            console.log(
              '⏭️ [User A] Ignoring unlock event from current user (already removed)',
            );
          } else {
            console.log(
              '⏭️ Ignoring unlock event without user field (system event)',
            );
          }
        }
        // Handle SSE events with status
        else if (event.status === 'reserved') {
          // Always update reserved status (even for current user, as it's a final state)
          console.log('✅ Updating reservation to reserved');
          updateReservation(
            event.product,
            eventDate,
            event.fromTime,
            event.toTime,
            dayName,
            'reserved',
            event.user,
          );
        } else if (event.status === 'pre-reserved') {
          // When status is pre-reserved, mark as pre-reserved
          // If it's from current user, state was already updated in handleServiceItemClick (pre-reserved-by-me)
          // Only update if it's from another user to show pre-reserved-by-others
          // IMPORTANT: Process for all users except current user (even if user is undefined in event)
          if (!isMyAction) {
            // Use dayName if available, otherwise use empty string (updateReservation will handle it)
            const finalDayName = dayName || event.day || '';

            console.log(
              '✅ [User B] Updating reservation to pre-reserved-by-others',
              {
                product: event.product,
                date: eventDate,
                fromTime: event.fromTime,
                toTime: event.toTime,
                user: event.user,
                currentUserId: profile?.id,
                dayName: finalDayName,
                isMyAction,
              },
            );

            updateReservation(
              event.product,
              eventDate,
              event.fromTime,
              event.toTime,
              finalDayName,
              'pre-reserved-by-others',
              event.user,
            );
          } else {
            console.log(
              '⏭️ [User A] Ignoring pre-reserved event from current user (already set to pre-reserved-by-me)',
              {
                product: event.product,
                date: eventDate,
                user: event.user,
                currentUserId: profile?.id,
                isMyAction,
              },
            );
          }
        } else if (event.status === 'cancelled') {
          // Process cancellation only if it's from another user (user field is defined and not current user)
          // If user is undefined, ignore it (might be a system event that shouldn't affect current user)
          // If it's from current user, state was already removed in handleDeleteReservation
          // This ensures real-time updates when someone else cancels
          if (event.user !== undefined && !isMyAction) {
            console.log(
              '❌ [User B] Cancelled event - removing reservation (from another user)',
            );
            removeReservation(
              event.product,
              eventDate,
              event.fromTime,
              event.toTime,
            );
          } else if (isMyAction) {
            console.log(
              '⏭️ [User A] Ignoring cancelled event from current user (already removed)',
            );
          } else {
            console.log(
              '⏭️ Ignoring cancelled event without user field (system event)',
            );
          }
        } else {
          // Event doesn't match any known status - log it for debugging
          console.warn('⚠️ Event received but no matching handler:', {
            product: event.product,
            date: eventDate,
            fromTime: event.fromTime,
            toTime: event.toTime,
            user: event.user,
            status: event.status,
            isLocked: event.isLocked,
            isMyAction,
            currentUserId: profile?.id,
            fullEvent: event,
          });
        }

        // Don't refetch - use only SSE events and local state for updates
        // This prevents heavy refetch calls and keeps UI responsive
        // State is updated immediately from SSE events, no need to refetch
        // Initial data is loaded once, all updates come from SSE events
      },
      [timeSlots, updateReservation, removeReservation, profile?.id],
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
    // refetch removed - using only SSE events for updates
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
