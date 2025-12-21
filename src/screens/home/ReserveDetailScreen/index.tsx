import React, {useRef, useCallback, useState} from 'react';
import {
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
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
import {useCartContext} from '../../../utils/CartContext';
import {Product} from '../../../services/models/response/ProductResService';
import {
  ServiceEntryDto,
  DayEntryDto,
} from '../../../services/models/response/ReservationResService';
import moment from 'jalali-moment';
import {ReservationSecondaryService} from '../../../utils/helpers/CartStorage';

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

  // State for pre-reserved items list
  interface PreReservedItem {
    item: ServiceEntryDto;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
    dayData: DayEntryDto;
    subProducts: any[];
    modifiedQuantities: Record<number, number>;
  }
  const [preReservedItems, setPreReservedItems] = useState<PreReservedItem[]>(
    [],
  );

  // Custom Hooks
  const {profile, SKU} = useAuth();
  const {addToCart} = useCartContext();
  const {timeSlots, isLoading, error, totalPagesForSlots} =
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
    reservations,
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
        status?:
          | 'reserved'
          | 'pre-reserved'
          | 'cancelled'
          | 'locked'
          | 'released';
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
          specificDate: event.specificDate,
          fromTime: event.fromTime,
          toTime: event.toTime,
          user: event.user,
          status: event.status,
          isLocked: event.isLocked,
          isMyAction,
          currentUserId: profile?.id,
          day: event.day,
          fullEvent: event,
        });

        // Handle locked/unlocked status
        // When locked = someone is reserving this slot
        // Priority: Check status first, then isLocked
        // IMPORTANT: Check for cancellation/release/unlock FIRST before checking for locked
        if (event.status === 'cancelled' || event.status === 'released') {
          // Process cancellation/release for ALL users (including current user)
          // This ensures that when user cancels, the state is updated even if it came from API
          console.log(`❌ ${event.status} event - removing reservation`, {
            product: event.product,
            date: eventDate,
            fromTime: event.fromTime,
            toTime: event.toTime,
            user: event.user,
            currentUserId: profile?.id,
            isMyAction,
            status: event.status,
          });
          removeReservation(
            event.product,
            eventDate,
            event.fromTime,
            event.toTime,
          );
        } else if (
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
            } catch (err) {
              console.error(
                '❌ [User B] Error calling updateReservation:',
                err,
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
          // Process for all users except current user
          // If it's from current user, state was already removed in handleDeleteReservation
          if (!isMyAction) {
            console.log(
              '🔓 [User B] Unlock event - removing reservation (from another user or system)',
              {
                product: event.product,
                date: eventDate,
                fromTime: event.fromTime,
                toTime: event.toTime,
                user: event.user,
                currentUserId: profile?.id,
                isMyAction,
              },
            );
            removeReservation(
              event.product,
              eventDate,
              event.fromTime,
              event.toTime,
            );
          } else {
            console.log(
              '⏭️ [User A] Ignoring unlock event from current user (already removed)',
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

  // Add item to pre-reserved list
  const addToPreReservedList = useCallback(
    (data: {
      item: ServiceEntryDto;
      date: string;
      fromTime: string;
      toTime: string;
      dayName: string;
      dayData: DayEntryDto;
      subProducts: any[];
      modifiedQuantities: Record<number, number>;
    }) => {
      const reservationKey = `${data.item.id}-${data.date}-${data.fromTime}-${data.toTime}`;

      // Check if already exists
      const exists = preReservedItems.some(
        item =>
          `${item.item.id}-${item.date}-${item.fromTime}-${item.toTime}` ===
          reservationKey,
      );

      if (!exists) {
        setPreReservedItems(prev => [...prev, data]);
        console.log('✅ Added to pre-reserved list:', data.item.title);
      }
    },
    [preReservedItems],
  );

  // Remove item from pre-reserved list
  const removeFromPreReservedList = useCallback(
    (itemId: number, date: string, fromTime: string, toTime: string) => {
      setPreReservedItems(prev =>
        prev.filter(
          item =>
            !(
              item.item.id === itemId &&
              item.date === date &&
              item.fromTime === fromTime &&
              item.toTime === toTime
            ),
        ),
      );
    },
    [],
  );

  const {
    handleServiceItemClick,
    handleDeleteReservation,
    handleAddNewReservation: handleAddNewReservationFromHook,
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
    onPreReserveSuccess: addToPreReservedList, // Callback when pre-reserve succeeds
    reservations, // Pass reservations to handler
  });

  // Wrapper for handleDeleteReservation to also remove from pre-reserved list
  const handleDeleteReservationWrapper = useCallback(
    (data: {
      item: ServiceEntryDto;
      date: string;
      fromTime: string;
      toTime: string;
      dayName: string;
      dayData: DayEntryDto;
    }) => {
      // Remove from pre-reserved list first
      removeFromPreReservedList(
        data.item.id,
        data.date,
        data.fromTime,
        data.toTime,
      );
      // Then call original handler to delete from backend and update state
      handleDeleteReservation(data);
    },
    [removeFromPreReservedList, handleDeleteReservation],
  );

  // Convert ServiceEntryDto to Product (minimal conversion)
  const convertServiceEntryToProduct = (
    serviceEntry: ServiceEntryDto,
  ): Product => {
    return {
      id: serviceEntry.id,
      title: serviceEntry.title,
      sku: serviceEntry.sku,
      price: serviceEntry.reservePrice || serviceEntry.price,
      discount: serviceEntry.discount,
      status: serviceEntry.status,
      isLocker: serviceEntry.isLocker,
      unlimited: serviceEntry.unlimited,
      checkInsurance: serviceEntry.checkInsurance,
      related: serviceEntry.related,
      tax: serviceEntry.tax,
      capacity: serviceEntry.capacity,
      reserveCapacity: serviceEntry.reserveCapacity,
      reservable: serviceEntry.reservable,
      duration: serviceEntry.duration,
      archivedPenaltyAmount: serviceEntry.archivedPenaltyAmount,
      convertToIncomeAfterDays: serviceEntry.convertToIncomeAfterDays,
      hasContractor: serviceEntry.hasContractor,
      requiredContractor: serviceEntry.requiredContractor,
      isOnline: false,
      isKiosk: null,
      contractors: serviceEntry.contractors || [],
      hasPartner: serviceEntry.hasPartner,
      partners: serviceEntry.partners || null,
      alarms: serviceEntry.alarms || [],
      mustSentToTax: serviceEntry.mustSentToTax,
      includeSms: serviceEntry.includeSms,
      type: serviceEntry.type,
      image: serviceEntry.image
        ? {
            name: serviceEntry.image.name,
            width: serviceEntry.image.width,
            height: serviceEntry.image.height,
            size: serviceEntry.image.size,
          }
        : null,
      transferableToWallet: serviceEntry.transferableToWallet,
      needLocker: serviceEntry.needLocker,
      description: serviceEntry.description,
      taxSystemDescription: serviceEntry.taxSystemDescription,
      uniqueTaxCode: serviceEntry.uniqueTaxCode,
      benefitContractorFromPenalty: serviceEntry.benefitContractorFromPenalty,
      actionAfterUnfairUsageTime: serviceEntry.actionAfterUnfairUsageTime,
      manualPrice: serviceEntry.manualPrice,
      archivedType: serviceEntry.archivedType,
      metadata: serviceEntry.metadata ? [serviceEntry.metadata] : [],
      archivedContractorIncomeType: serviceEntry.archivedContractorIncomeType,
      reservationPenalty: serviceEntry.reservationPenalty || [],
      allowComment: serviceEntry.allowComment,
      withGuest: serviceEntry.withGuest,
      fairUseTime: serviceEntry.fairUseTime,
      fairUseLimitTime: serviceEntry.fairUseLimitTime,
      fairUseAmountFormula: serviceEntry.fairUseAmountFormula,
      unfairUseAmount: serviceEntry.unfairUseAmount,
      hasPriceList: serviceEntry.hasPriceList,
      hasSchedules: serviceEntry.hasSchedules,
      hasSubProduct: serviceEntry.hasSubProduct,
      subProducts: serviceEntry.subProducts || [],
      isInsuranceService: serviceEntry.isInsuranceService,
      isSubscriptionService: serviceEntry.isSubscriptionService,
      isGift: serviceEntry.isGift,
      isCashBack: serviceEntry.isCashBack,
      receptionAutoPrint: serviceEntry.receptionAutoPrint,
      isGiftGenerator: serviceEntry.isGiftGenerator,
      transferAmount: serviceEntry.transferAmount,
      defaultSmsTemplate: serviceEntry.defaultSmsTemplate,
      unit: serviceEntry.unit || null,
      category: serviceEntry.category || {id: 0, title: '', slug: ''},
      priceList: serviceEntry.priceList || [],
      defaultPrinter: serviceEntry.defaultPrinter,
      tagProducts: serviceEntry.tagProducts || [],
      reportTag: serviceEntry.reportTag || null,
      reservationPattern: serviceEntry.reservationPattern,
      tagProductParent: serviceEntry.tagProductParent || null,
      lockerLocation: serviceEntry.lockerLocation,
      categoryId: serviceEntry.categoryId,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
  };

  // Helper function to add a single reservation to cart
  const addSingleReservationToCart = useCallback(
    async (data: PreReservedItem) => {
      const {item, date, fromTime, toTime, subProducts, modifiedQuantities} =
        data;

      // Convert date from Jalali format (YYYY/MM/DD) to Gregorian (YYYY-MM-DD)
      const [year, month, day] = date.split('/');
      const gregorianDate = moment(
        `${year}-${month}-${day}`,
        'jYYYY-jMM-jDD',
      ).format('YYYY-MM-DD');

      // Build secondaryServices from subProducts with modified quantities
      const secondaryServices: ReservationSecondaryService[] = [];
      if (subProducts && subProducts.length > 0) {
        subProducts.forEach(subProduct => {
          const quantity = modifiedQuantities[subProduct.id] || 0;
          if (quantity > 0 && subProduct.product) {
            // Calculate end date based on duration (default to 1 day if not available)
            const duration = subProduct.product.duration || 1;
            const startDate = gregorianDate;
            const endDate = moment(startDate)
              .add(duration, 'days')
              .format('YYYY-MM-DD');

            secondaryServices.push({
              user: profile?.id || 0,
              product: subProduct.product.id,
              start: startDate,
              end: endDate,
              discount: subProduct.discount || 0,
              type: subProduct.product.type || 1,
              tax: subProduct.tax || 0,
              price: subProduct.product.price || subProduct.amount || 0,
              quantity: quantity,
              subProductId: subProduct.id,
            });
          }
        });
      }

      // Convert ServiceEntryDto to Product
      const product = convertServiceEntryToProduct(item);

      // Add to cart with reservation data
      await addToCart({
        product,
        quantity: 1,
        isReserve: true,
        reservationData: {
          reservedDate: `${gregorianDate} 00:00`,
          reservedStartTime: fromTime,
          reservedEndTime: toTime,
          secondaryServices:
            secondaryServices.length > 0 ? secondaryServices : undefined,
          description: null,
        },
      });
    },
    [addToCart, profile?.id],
  );

  // Handle add reservation to cart (single item - when clicking "تکمیل رزرو پرداخت" on current item)
  const handleAddReservationToCart = useCallback(
    async (data: {
      item: ServiceEntryDto;
      date: string;
      fromTime: string;
      toTime: string;
      subProducts: any[];
      modifiedQuantities: Record<number, number>;
    }) => {
      try {
        // Get current data from bottom sheet to get dayName and dayData
        const currentData =
          preReserveBottomSheetRef.current?.getCurrentData?.();

        // Add current item to pre-reserved list first
        const currentItemData: PreReservedItem = {
          item: data.item,
          date: data.date,
          fromTime: data.fromTime,
          toTime: data.toTime,
          dayName: currentData?.dayName || '',
          dayData: currentData?.dayData || ({} as DayEntryDto),
          subProducts: data.subProducts,
          modifiedQuantities: data.modifiedQuantities,
        };

        // Check if current item already exists in list
        const reservationKey = `${data.item.id}-${data.date}-${data.fromTime}-${data.toTime}`;
        const exists = preReservedItems.some(
          item =>
            `${item.item.id}-${item.date}-${item.fromTime}-${item.toTime}` ===
            reservationKey,
        );

        // Add to list if not exists
        if (!exists) {
          addToPreReservedList(currentItemData);
        }

        // Add all pre-reserved items (including current one) to cart
        const allItems = exists
          ? preReservedItems
          : [...preReservedItems, currentItemData];
        for (const item of allItems) {
          await addSingleReservationToCart(item);
        }

        // Clear all pre-reserved items and reservation state
        setPreReservedItems([]);
        preReserveBottomSheetRef.current?.clearCurrentReservationState();
        preReserveBottomSheetRef.current?.close();
        navigationRef.navigate('Root', {
          screen: 'HomeNavigator',
          params: {screen: 'cart'},
        });
      } catch (error) {
        console.error('Error adding reservation to cart:', error);
      }
    },
    [addToPreReservedList, preReservedItems, addSingleReservationToCart],
  );

  // Handle add new reservation (when clicking "اضافه کردن رزرو جدید")
  const handleAddNewReservation = useCallback(() => {
    // Get current reservation data from bottom sheet
    const currentData = preReserveBottomSheetRef.current?.getCurrentData?.();
    if (currentData && currentData.item && currentData.dayData) {
      addToPreReservedList({
        item: currentData.item,
        date: currentData.date,
        fromTime: currentData.fromTime,
        toTime: currentData.toTime,
        dayName: currentData.dayName,
        dayData: currentData.dayData,
        subProducts: currentData.subProducts || [],
        modifiedQuantities: currentData.modifiedQuantities || {},
      });
    }
    // Close bottom sheet to allow selecting new reservation
    preReserveBottomSheetRef.current?.close();
  }, [addToPreReservedList]);

  // Handle complete payment (when clicking "تکمیل رزرو پرداخت")
  const handleCompletePayment = useCallback(async () => {
    try {
      // Add all pre-reserved items to cart
      for (const item of preReservedItems) {
        await addSingleReservationToCart(item);
      }

      // Clear all pre-reserved items and reservation state
      setPreReservedItems([]);
      preReserveBottomSheetRef.current?.clearCurrentReservationState();
      preReserveBottomSheetRef.current?.close();
      navigationRef.navigate('Root', {
        screen: 'HomeNavigator',
        params: {screen: 'cart'},
      });
    } catch (error) {
      console.error('Error adding reservations to cart:', error);
    }
  }, [preReservedItems, addSingleReservationToCart]);

  return (
    <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 relative">
      {/* Background shapes */}
      <View className="absolute -top-[25%] web:rotate-[10deg] web:-left-[30%] android:-right-[80%] ios:-right-[80%] opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../../assets/images/shade/shape/ShadeBlue.png')}
          style={styles.fullSize}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%] web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../../assets/images/shade/shape/ShadeBlue.png')}
          style={styles.fullSize}
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
          <View className="absolute -z-[1] " style={styles.headerTitleWrapper}>
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
          contentContainerStyle={styles.scrollContent}>
          <View className=" pt-4 ">
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
        onAddToCart={handleAddReservationToCart}
        onDeleteReservation={handleDeleteReservationWrapper}
        isDeleting={isPending}
      />
    </View>
  );
};

export default ReserveDetailScreen;

const styles = StyleSheet.create({
  fullSize: {width: '100%', height: '100%'},
  headerTitleWrapper: {left: 0, right: 0, alignItems: 'center'},
  scrollContent: {paddingBottom: 40},
});
