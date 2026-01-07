import React, {useRef, useCallback, useEffect, useMemo} from 'react';
import {View, Image, ActivityIndicator, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import axios from 'axios';
import {HomeStackParamList} from '../../../utils/types/NavigationTypes';
import BaseText from '../../../components/BaseText';
import BaseButton from '../../../components/Button/BaseButton';
import {ArrowRight2, InfoCircle} from 'iconsax-react-native';
import {useTheme} from '../../../utils/ThemeContext';
import {
  navigationRef,
  resetNavigationHistory,
} from '../../../navigation/navigationRef';
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
import {
  ServiceEntryDto,
  DayEntryDto,
} from '../../../services/models/response/ReservationResService';
import moment from 'jalali-moment';
import {CartItem} from '../../../utils/helpers/CartStorage';

// Utils
import {BottomSheetMethods} from '../../../components/BottomSheet/BottomSheet';
import {useReservationStore} from '../../../store/reservationStore';
import {getCart} from '../../../utils/helpers/CartStorage';
import {ReservationQuery} from '../../../services/models/requestQueries';

type ReserveDetailRouteProp = RouteProp<HomeStackParamList, 'reserveDetail'>;

const ReserveDetailScreen: React.FC = () => {
  const route = useRoute<ReserveDetailRouteProp>();
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const params = route.params;

  // Refs
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const helpBottomSheetRef = useRef<BottomSheetMethods>(null);
  const preReserveBottomSheetRef = useRef<PreReserveBottomSheetRef>(null);

  // Custom Hooks
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const {profile, SKU} = useAuth();
  const {
    addToCart,
    items: cartItems,
    refreshCart,
    removeFromCart,
    updateReservationItemData,
  } = useCartContext();
  const {timeSlots, isLoading, error, totalPagesForSlots, refetch} =
    useReservationData(params);
  const {
    loadReservations,
    syncWithCart,
    syncWithPreReserve,
    reservations: storeReservations,
  } = useReservationStore();

  const {
    currentPage,
    slideAnim,
    opacityAnim,
    getVisibleDaysForSlot,
    navigatePage,
    canGoNext,
    canGoPrev,
  } = usePageNavigation({totalPages: totalPagesForSlots});

  // Track scroll state for gesture coordination
  const scrollY = useSharedValue(0);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event?.contentOffset?.y || 0;
    },
  });

  // Swipe gesture for page navigation
  // این gesture فقط در بالای صفحه (در header area) فعال می‌شود
  // و فقط زمانی کار می‌کند که حرکت افقی بیشتر از عمودی باشد
  const swipeGesture = Gesture.Pan()
    .minDistance(30)
    .activeOffsetX([-50, 50]) // فقط حرکت افقی قابل توجه
    .failOffsetY([-5, 5]) // اگر حرکت عمودی بیشتر از 5 پیکسل باشد، fail می‌شود
    .onEnd(event => {
      const swipeThreshold = 80;
      const velocityThreshold = 400;

      // فقط در بالای صفحه کار می‌کند
      const isAtTop = scrollY.value <= 50;
      const verticalMovement = Math.abs(event.translationY);
      const horizontalMovement = Math.abs(event.translationX);

      // اگر حرکت عمودی بیشتر از افقی باشد یا در بالای صفحه نباشیم، کار نکن
      if (!isAtTop || verticalMovement > horizontalMovement * 0.4) {
        return;
      }

      // Swipe right = go to next page
      if (
        event.translationX > swipeThreshold ||
        event.velocityX > velocityThreshold
      ) {
        if (canGoNext) {
          runOnJS(navigatePage)('next');
        }
      }
      // Swipe left = go to previous page
      else if (
        event.translationX < -swipeThreshold ||
        event.velocityX < -velocityThreshold
      ) {
        if (canGoPrev) {
          runOnJS(navigatePage)('prev');
        }
      }
    });

  // Reservation state management
  const {
    reservations,
    getItemState,
    updateReservation,
    removeReservation,
    isPreReservedByMe,
  } = useReservationState({timeSlots});

  // 🆕 فیلتر کردن آیتم‌های رزروی از سبد خرید به عنوان منبع اصلی داده
  const reservationCartItems = useMemo(() => {
    return cartItems.filter(item => item.isReserve && item.reservationData);
  }, [cartItems]);

  // Track if initial sync has been done
  const initialSyncDoneRef = useRef(false);

  // Build query object for canceling (same as in useReservationData)
  const reservationQuery = useMemo((): ReservationQuery | null => {
    if (!params.tagId || !params.start) return null;

    const baseQuery: Partial<ReservationQuery> = {
      tagId: params.tagId,
      start: params.start,
    };

    if (params.patternId !== undefined) baseQuery.patternId = params.patternId;
    if (params.gender !== undefined)
      baseQuery.gender = params.gender as 'Female' | 'Male' | 'Both';
    if (params.saleUnit !== undefined) baseQuery.saleUnit = params.saleUnit;
    if (params.startTime !== undefined) baseQuery.startTime = params.startTime;
    if (params.endTime !== undefined) baseQuery.endTime = params.endTime;
    if (params.end !== undefined) baseQuery.end = params.end;
    if (params.days !== undefined) {
      baseQuery.days = Array.isArray(params.days)
        ? params.days.join(',')
        : params.days;
    }

    return baseQuery as ReservationQuery;
  }, [params]);

  // Handle back button press - cancel query before navigating back
  const handleBackPress = useCallback(() => {
    // Cancel all Reservation queries (React Query will only cancel pending requests)
    queryClient.cancelQueries({
      queryKey: ['Reservation'],
      exact: false, // Match all queries that start with 'Reservation'
    });

    // Navigate back
    navigationRef.goBack();
  }, [queryClient]);

  // Cancel query when navigating back (beforeRemove) - fallback for other navigation methods
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Cancel all Reservation queries
      queryClient.cancelQueries({
        queryKey: ['Reservation'],
        exact: false,
      });
    });

    return unsubscribe;
  }, [navigation, queryClient]);

  // Cancel query on unmount as well (cleanup)
  useEffect(() => {
    return () => {
      // Cancel all Reservation queries on unmount
      queryClient.cancelQueries({
        queryKey: ['Reservation'],
        exact: false,
      });
    };
  }, [queryClient]);

  // Sync ReservationStore with Cart ONLY on mount (not on every cart change)
  useEffect(() => {
    // Only run once when data is ready
    if (initialSyncDoneRef.current || isLoading || timeSlots.length === 0) {
      return;
    }

    const syncReservations = async () => {
      try {
        initialSyncDoneRef.current = true;

        // 1. Load reservations from store
        await loadReservations();

        // 2. Sync with cart items - سبد خرید منبع اصلی حقیقت است
        if (cartItems.length > 0) {
          await syncWithCart(cartItems);
        }

        // 3. Extract pre-reserved items from timeSlots (API data) that are not in cart
        const preReservedFromAPI: any[] = [];
        if (profile?.id) {
          const currentCartItems = cartItems.filter(
            item => item.isReserve && item.reservationData,
          );

          timeSlots.forEach(slot => {
            slot.days.forEach(day => {
              day.items.forEach(item => {
                if (
                  item.preReservedUserId === profile.id &&
                  item.preReservedUserId !== undefined
                ) {
                  const [fromTime, toTime] = slot.timeSlot.split('_');

                  // چک کن که آیا در سبد خرید هست یا نه
                  const isInCart = currentCartItems.some(cartItem => {
                    const resData = cartItem.reservationData!;
                    const cartDate = resData.reservedDate.split(' ')[0];
                    return (
                      cartItem.product?.id === item.id &&
                      cartDate === day.date.replace(/\//g, '-') &&
                      resData.reservedStartTime === fromTime &&
                      resData.reservedEndTime === toTime
                    );
                  });

                  if (!isInCart) {
                    preReservedFromAPI.push({
                      item: item,
                      date: day.date,
                      fromTime: fromTime,
                      toTime: toTime,
                      dayName: day.name,
                      subProducts: item.subProducts || [],
                      modifiedQuantities: {},
                    });
                  }
                }
              });
            });
          });
        }

        // 4. Sync with API pre-reserved items (که در سبد خرید نیستند)
        if (preReservedFromAPI.length > 0) {
          await syncWithPreReserve(preReservedFromAPI);
        }
      } catch (error) {
        console.error(
          '❌ [ReserveDetailScreen] Error syncing reservations:',
          error,
        );
      }
    };

    syncReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    timeSlots.length,
    profile?.id,
    // NOTE: We intentionally exclude cartItems from dependencies
    // to prevent re-syncing when cart changes. syncWithCart should only
    // run once on mount to initialize ReservationStore from cart.
    // Individual cart item updates are handled by CartServiceCard listeners.
  ]);

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

          // Remove from cart if it exists
          (async () => {
            try {
              // Convert date from Jalali to Gregorian if needed
              let gregorianDate = eventDate;
              if (eventDate.includes('/')) {
                const [year, month, day] = eventDate.split('/');
                gregorianDate = moment(
                  `${year}-${month}-${day}`,
                  'jYYYY-jMM-jDD',
                ).format('YYYY-MM-DD');
              }

              // Find reservation in ReservationStore
              const {findReservationByKey} = useReservationStore.getState();
              const key = `${event.product}-${gregorianDate}-${event.fromTime}-${event.toTime}`;
              const reservation = findReservationByKey(key);

              // If reservation has cartId, remove from cart
              if (reservation?.cartId) {
                console.log(
                  `🛒 [SSE ${event.status}] Removing reservation from cart:`,
                  {
                    cartId: reservation.cartId,
                    productId: event.product,
                    date: gregorianDate,
                    fromTime: event.fromTime,
                    toTime: event.toTime,
                  },
                );
                await removeFromCart(reservation.cartId);
              } else {
                // Also try to find by checking cart items directly
                const cartItems = await getCart();
                const cartReservation = cartItems.find(
                  (cartItem: CartItem) =>
                    cartItem.isReserve &&
                    cartItem.reservationData &&
                    cartItem.product?.id === event.product &&
                    cartItem.reservationData.reservedDate.split(' ')[0] ===
                      gregorianDate &&
                    cartItem.reservationData.reservedStartTime ===
                      event.fromTime &&
                    cartItem.reservationData.reservedEndTime === event.toTime,
                );
                if (cartReservation?.CartId) {
                  console.log(
                    `🛒 [SSE ${event.status}] Found reservation in cart, removing:`,
                    {
                      cartId: cartReservation.CartId,
                      productId: event.product,
                    },
                  );
                  await removeFromCart(cartReservation.CartId);
                }
              }
            } catch (error) {
              console.error(
                `⚠️ [SSE ${event.status}] Error removing from cart:`,
                error,
              );
              // Continue with removeReservation even if cart removal fails
            }
          })();

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
      [
        timeSlots,
        updateReservation,
        removeReservation,
        profile?.id,
        removeFromCart,
      ],
    ),
    enabled: !!profile && !!SKU,
  });

  // 🆕 Callback for when pre-reserve is successful - add to cart immediately
  const handlePreReserveSuccess = useCallback(
    async (data: {
      item: ServiceEntryDto;
      date: string;
      fromTime: string;
      toTime: string;
      dayName: string;
      dayData: DayEntryDto;
      subProducts: any[];
      modifiedQuantities: Record<number, number>;
    }) => {
      try {
        // تبدیل تاریخ به گریگوری
        let gregorianDate = data.date;
        if (data.date.includes('/')) {
          const [year, month, day] = data.date.split('/');
          if (parseInt(year, 10) < 2000) {
            gregorianDate = moment(
              `${year}-${month}-${day}`,
              'jYYYY-jMM-jDD',
            ).format('YYYY-MM-DD');
          } else {
            gregorianDate = `${year}-${month}-${day}`;
          }
        }

        // ساخت CartItem برای سبد خرید
        // ServiceEntryDto تقریباً همه فیلدهای Product رو داره
        // حفظ reservePrice برای استفاده در سبد خرید
        const cartItem = {
          product: {
            ...data.item,
            reservePrice: data.item.reservePrice, // حفظ reservePrice
          } as any, // Cast به any چون ServiceEntryDto ≈ Product
          quantity: 1,
          isReserve: true,
          reservationData: {
            reservedDate: gregorianDate,
            reservedStartTime: data.fromTime,
            reservedEndTime: data.toTime,
            secondaryServices: [], // شروع با خدمات اضافی خالی
          },
        };

        // اضافه به سبد خرید
        await addToCart(cartItem);

        // پیدا کردن cartId از سبد خرید (آخرین آیتم اضافه شده)
        const currentCart = await getCart();
        const addedItem = currentCart.find(
          (ci: CartItem) =>
            ci.isReserve &&
            ci.reservationData &&
            ci.product?.id === data.item.id &&
            ci.reservationData.reservedDate === gregorianDate &&
            ci.reservationData.reservedStartTime === data.fromTime &&
            ci.reservationData.reservedEndTime === data.toTime,
        );

        // اضافه به ReservationStore با cartId
        const {addReservation} = useReservationStore.getState();
        await addReservation({
          productId: data.item.id,
          productTitle: data.item.title,
          date: gregorianDate,
          fromTime: data.fromTime,
          toTime: data.toTime,
          dayName: data.dayName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          cartId: addedItem?.CartId,
          subProducts: data.subProducts,
          modifiedQuantities: data.modifiedQuantities,
        });
      } catch (error) {
        console.error('❌ Error adding to cart after pre-reserve:', error);
      }
    },
    [addToCart],
  );

  const {
    handleServiceItemClick,
    handleDeleteReservation,
    handleAddNewReservation: handleAddNewReservationFromHook,
    getLoadingItems,
    isPending,
  } = usePreReserveHandlers({
    gender: params.gender,
    preReserveBottomSheetRef,
    isPreReservedByMe,
    getItemState,
    updateReservation,
    removeReservation,
    reservations,
    onPreReserveSuccess: handlePreReserveSuccess,
  });

  // Wrapper for handleDeleteReservation to also remove from cart
  const handleDeleteReservationWrapper = useCallback(
    async (data: {
      item: ServiceEntryDto;
      date: string;
      fromTime: string;
      toTime: string;
      dayName: string;
      dayData: DayEntryDto;
    }) => {
      // 🆕 اول از سبد خرید حذف کن
      try {
        // تبدیل تاریخ به گریگوری
        let gregorianDate = data.date;
        if (data.date.includes('/')) {
          const [year, month, day] = data.date.split('/');
          if (parseInt(year, 10) < 2000) {
            gregorianDate = moment(
              `${year}-${month}-${day}`,
              'jYYYY-jMM-jDD',
            ).format('YYYY-MM-DD');
          } else {
            gregorianDate = `${year}-${month}-${day}`;
          }
        }

        // پیدا کردن آیتم در سبد خرید
        const cartItem = reservationCartItems.find(item => {
          const resData = item.reservationData!;
          const cartDate = resData.reservedDate.split(' ')[0];
          return (
            item.product?.id === data.item.id &&
            cartDate === gregorianDate &&
            resData.reservedStartTime === data.fromTime &&
            resData.reservedEndTime === data.toTime
          );
        });

        if (cartItem?.CartId) {
          console.log(
            '🛒 [handleDeleteReservationWrapper] Removing from cart:',
            cartItem.CartId,
          );
          await removeFromCart(cartItem.CartId);
        }
      } catch (error) {
        console.error(
          '⚠️ [handleDeleteReservationWrapper] Error removing from cart:',
          error,
        );
      }

      // سپس از بکند حذف کن
      handleDeleteReservation(data);
    },
    [reservationCartItems, removeFromCart, handleDeleteReservation],
  );

  // 🆕 ساده شده: فقط به صفحه سبد خرید برود - آیتم‌ها از قبل در سبد هستند
  const handleGoToCart = useCallback(() => {
    preReserveBottomSheetRef.current?.close();

    // Reset navigation history to ensure when user returns to reserve tab,
    // they go to reserve screen (initial route) not reserveDetail
    resetNavigationHistory();
    navigationRef.resetRoot({
      index: 0,
      routes: [
        {
          name: 'Root',
          params: {screen: 'HomeNavigator', params: {screen: 'cart'}},
        },
      ],
    });
  }, []);

  // 🆕 ساده شده: فقط باتم‌شیت بسته شود تا کاربر رزرو جدید انتخاب کند
  const handleAddNewReservation = useCallback(() => {
    preReserveBottomSheetRef.current?.close();
  }, []);

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
            onPress={handleBackPress}
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
        <View className="flex-1 items-center justify-center px-5 gap-4">
          {/* Check if error is 500 */}
          {(() => {
            // Check if it's an axios error with status 500
            const isAxiosError = axios.isAxiosError(error);
            const is500Error =
              (isAxiosError && error.response?.status === 500) ||
              (error as any)?.response?.status === 500 ||
              (error as any)?.status === 500;

            return is500Error ? (
              <>
                <BaseText type="title4" color="secondary">
                  خطا در دریافت اطلاعات
                </BaseText>
                <BaseText
                  type="body3"
                  color="secondary"
                  className="text-center">
                  مشکلی در سرور رخ داده است. لطفاً دوباره تلاش کنید.
                </BaseText>
                <BaseButton
                  text="تلاش مجدد"
                  type="Fill"
                  color="Black"
                  rounded
                  size="Large"
                  Extraclass="mt-4"
                  onPress={() => {
                    refetch();
                  }}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <>
                <BaseText type="title4" color="secondary">
                  خطا در دریافت اطلاعات
                </BaseText>
                <BaseText type="body3" color="secondary" className="mt-2">
                  {error.message || 'خطای نامشخص'}
                </BaseText>
              </>
            );
          })()}
        </View>
      ) : timeSlots.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <BaseText type="title4" color="secondary">
            موردی یافت نشد
          </BaseText>
        </View>
      ) : (
        <View className="flex-1">
          {/* Swipe gesture area - فقط در بالای صفحه */}
          <GestureDetector gesture={swipeGesture}>
            <View
              className="absolute top-0 left-0 right-0 z-10"
              style={{height: 100, pointerEvents: 'box-none'}}
            />
          </GestureDetector>

          {/* ScrollView - بدون gesture detector */}
          <Animated.ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            scrollEnabled={true}>
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
          </Animated.ScrollView>
        </View>
      )}

      {/* Help Bottom Sheet */}
      <HelpBottomSheet bottomSheetRef={helpBottomSheetRef} />

      {/* Pre-Reserve Bottom Sheet */}
      <PreReserveBottomSheet
        ref={preReserveBottomSheetRef}
        onAddNewReservation={handleAddNewReservation}
        onCompletePayment={handleGoToCart}
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
