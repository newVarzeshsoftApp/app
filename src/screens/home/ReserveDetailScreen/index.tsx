import React, {useRef, useCallback, useState, useEffect} from 'react';
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
import {
  ReservationSecondaryService,
  CartItem,
} from '../../../utils/helpers/CartStorage';

// Utils
import {BottomSheetMethods} from '../../../components/BottomSheet/BottomSheet';
import {showToast} from '../../../components/Toast/Toast';
import {useReservationStore} from '../../../store/reservationStore';
import {getCart} from '../../../utils/helpers/CartStorage';
import {getReservationStore} from '../../../utils/helpers/ReservationStorage';

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
  const {
    addToCart,
    items: cartItems,
    refreshCart,
    removeFromCart,
  } = useCartContext();
  const {timeSlots, isLoading, error, totalPagesForSlots} =
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

  // Reservation state management
  const {
    reservations,
    getItemState,
    updateReservation,
    removeReservation,
    isPreReservedByMe,
  } = useReservationState({timeSlots});

  // Use ref to store latest preReservedItems to avoid infinite loop
  const preReservedItemsRef = useRef(preReservedItems);
  useEffect(() => {
    preReservedItemsRef.current = preReservedItems;
  }, [preReservedItems]);

  // Sync ReservationStore with Cart and PreReserve on mount and when cart changes
  useEffect(() => {
    const syncReservations = async () => {
      try {
        // 1. Load reservations from store
        await loadReservations();

        // 2. Sync with cart items
        if (cartItems.length > 0) {
          await syncWithCart(cartItems);
          console.log(
            '✅ [ReserveDetailScreen] Synced ReservationStore with Cart',
          );
        }

        // 3. Extract pre-reserved items from timeSlots (API data)
        // Check timeSlots for items with preReservedUserId matching current user
        const preReservedFromAPI: any[] = [];
        if (timeSlots.length > 0 && profile?.id) {
          timeSlots.forEach(slot => {
            slot.days.forEach(day => {
              day.items.forEach(item => {
                if (
                  item.preReservedUserId === profile.id &&
                  item.preReservedUserId !== undefined
                ) {
                  // This item is pre-reserved by current user
                  const [fromTime, toTime] = slot.timeSlot.split('_');
                  preReservedFromAPI.push({
                    item: item,
                    date: day.date,
                    fromTime: fromTime,
                    toTime: toTime,
                    dayName: day.name,
                    subProducts: item.subProducts || [],
                    modifiedQuantities: {}, // Will be updated from store if exists
                  });
                }
              });
            });
          });
        }

        // 4. Sync with preReservedItems (local state) and API data
        // Use ref to get latest value without causing re-render loop
        const currentPreReservedItems = preReservedItemsRef.current;
        const allPreReservedItems = [
          ...currentPreReservedItems,
          ...preReservedFromAPI,
        ];
        if (allPreReservedItems.length > 0) {
          await syncWithPreReserve(allPreReservedItems);
          console.log(
            '✅ [ReserveDetailScreen] Synced ReservationStore with PreReservedItems and API',
          );
        }

        // 5. Load updated reservations from store and sync with preReservedItems
        const storeReservations = await getReservationStore();

        // Update preReservedItems from ReservationStore
        // This ensures that changes made in CartServiceCard or PreReserveBottomSheet
        // are reflected in preReservedItems
        if (
          storeReservations.length > 0 &&
          currentPreReservedItems.length > 0
        ) {
          const updatedPreReservedItems = currentPreReservedItems.map(item => {
            const reservationKey = `${item.item.id}-${item.date}-${item.fromTime}-${item.toTime}`;

            // Find matching reservation in store
            const storeReservation = storeReservations.find(r => {
              // Convert store date to match format
              let storeDate = r.date;
              if (!storeDate.includes('/')) {
                // Gregorian date, convert to Jalali for comparison
                const [year, month, day] = item.date.split('/');
                const gregorianDate = moment(
                  `${year}-${month}-${day}`,
                  'jYYYY-jMM-jDD',
                ).format('YYYY-MM-DD');
                storeDate = gregorianDate;
              }

              return (
                r.productId === item.item.id &&
                storeDate === item.date &&
                r.fromTime === item.fromTime &&
                r.toTime === item.toTime
              );
            });

            if (storeReservation) {
              // Update modifiedQuantities from store
              return {
                ...item,
                modifiedQuantities: storeReservation.modifiedQuantities || {},
              };
            }
            return item;
          });

          // Only update if there are actual changes
          const hasChanges = updatedPreReservedItems.some((updated, index) => {
            const original = currentPreReservedItems[index];
            return (
              JSON.stringify(updated.modifiedQuantities) !==
              JSON.stringify(original?.modifiedQuantities)
            );
          });

          if (hasChanges) {
            setPreReservedItems(updatedPreReservedItems);
            console.log(
              '✅ [ReserveDetailScreen] Updated preReservedItems from ReservationStore',
            );
          }
        }

        // 6. Cleanup: Remove reservations from store that are:
        // - Not in cart
        // - Not in preReservedItems (local)
        // - Not in API (timeSlots with preReservedUserId)
        // This is handled by syncWithPreReserve
      } catch (error) {
        console.error(
          '❌ [ReserveDetailScreen] Error syncing reservations:',
          error,
        );
      }
    };

    if (!isLoading && timeSlots.length > 0) {
      syncReservations();
    }
  }, [
    isLoading,
    cartItems,
    timeSlots,
    profile?.id,
    loadReservations,
    syncWithCart,
    syncWithPreReserve,
  ]); // Removed preReservedItems from dependencies to prevent infinite loop

  // Additional effect to sync preReservedItems when ReservationStore changes
  // This handles updates from CartServiceCard or PreReserveBottomSheet
  useEffect(() => {
    const syncFromStore = async () => {
      try {
        const storeReservations = await getReservationStore();
        const currentPreReservedItems = preReservedItemsRef.current;

        if (
          storeReservations.length === 0 ||
          currentPreReservedItems.length === 0
        ) {
          return;
        }

        // Update preReservedItems from ReservationStore
        const updatedPreReservedItems = currentPreReservedItems.map(item => {
          // Convert date from Jalali to Gregorian for comparison
          const [year, month, day] = item.date.split('/');
          const gregorianDate = moment(
            `${year}-${month}-${day}`,
            'jYYYY-jMM-jDD',
          ).format('YYYY-MM-DD');

          // Find matching reservation in store
          const storeReservation = storeReservations.find(
            r =>
              r.productId === item.item.id &&
              r.date === gregorianDate &&
              r.fromTime === item.fromTime &&
              r.toTime === item.toTime,
          );

          if (storeReservation) {
            // Update modifiedQuantities from store
            const currentQuantities = item.modifiedQuantities || {};
            const storeQuantities = storeReservation.modifiedQuantities || {};

            // Check if quantities have changed
            if (
              JSON.stringify(currentQuantities) !==
              JSON.stringify(storeQuantities)
            ) {
              return {
                ...item,
                modifiedQuantities: storeQuantities,
              };
            }
          }
          return item;
        });

        // Check if any item was updated
        const hasChanges = updatedPreReservedItems.some((updated, index) => {
          const original = currentPreReservedItems[index];
          return (
            JSON.stringify(updated.modifiedQuantities) !==
            JSON.stringify(original?.modifiedQuantities)
          );
        });

        if (hasChanges) {
          setPreReservedItems(updatedPreReservedItems);
          console.log(
            '✅ [ReserveDetailScreen] Synced preReservedItems from ReservationStore',
          );
        }
      } catch (error) {
        console.error(
          '❌ [ReserveDetailScreen] Error syncing preReservedItems from store:',
          error,
        );
      }
    };

    // Subscribe to ReservationStore changes
    const unsubscribe = useReservationStore.subscribe((state: any) => {
      // When reservations change, sync preReservedItems
      syncFromStore();
    });

    // Initial sync
    syncFromStore();

    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array - only run on mount/unmount

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
      [timeSlots, updateReservation, removeReservation, profile?.id],
    ),
    enabled: !!profile && !!SKU,
  });

  // Add item to pre-reserved list
  const addToPreReservedList = useCallback(
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
        console.log('📦 [addToPreReservedList] SubProducts State:', {
          subProducts: data.subProducts,
          subProductsLength: data.subProducts?.length || 0,
          subProductsDetails: data.subProducts?.map(sp => ({
            id: sp.id,
            productId: sp.product?.id,
            productTitle: sp.product?.title,
            amount: sp.amount,
          })),
        });
        console.log('🔢 [addToPreReservedList] Modified Quantities State:', {
          modifiedQuantities: data.modifiedQuantities,
          quantitiesDetails: Object.entries(data.modifiedQuantities || {}).map(
            ([id, qty]) => ({
              subProductId: id,
              quantity: qty,
            }),
          ),
        });

        // Sync with ReservationStore
        try {
          // Convert date from Jalali to Gregorian for storage
          const [year, month, day] = data.date.split('/');
          const gregorianDate = moment(
            `${year}-${month}-${day}`,
            'jYYYY-jMM-jDD',
          ).format('YYYY-MM-DD');

          const storeItem = {
            productId: data.item.id,
            productTitle: data.item.title,
            date: gregorianDate,
            fromTime: data.fromTime,
            toTime: data.toTime,
            dayName: data.dayName,
            cartId: undefined, // Not in cart yet
            subProducts: data.subProducts,
            modifiedQuantities: data.modifiedQuantities,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const {addReservation} = useReservationStore.getState();
          await addReservation(storeItem);
          console.log('✅ [addToPreReservedList] Synced with ReservationStore');
        } catch (error) {
          console.error(
            '⚠️ [addToPreReservedList] Error syncing with ReservationStore:',
            error,
          );
        }
      }
    },
    [preReservedItems],
  );

  // Remove item from pre-reserved list
  const removeFromPreReservedList = useCallback(
    async (itemId: number, date: string, fromTime: string, toTime: string) => {
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

      // Sync with ReservationStore
      try {
        // Convert date from Jalali to Gregorian for key matching
        const [year, month, day] = date.split('/');
        const gregorianDate = moment(
          `${year}-${month}-${day}`,
          'jYYYY-jMM-jDD',
        ).format('YYYY-MM-DD');

        const key = `${itemId}-${gregorianDate}-${fromTime}-${toTime}`;
        const {removeReservation} = useReservationStore.getState();
        await removeReservation(key);
        console.log(
          '✅ [removeFromPreReservedList] Synced with ReservationStore',
        );
      } catch (error) {
        console.error(
          '⚠️ [removeFromPreReservedList] Error syncing with ReservationStore:',
          error,
        );
      }
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

      console.log('🛒 [addSingleReservationToCart] Starting - Current State:', {
        itemId: item.id,
        itemTitle: item.title,
        date,
        fromTime,
        toTime,
        subProducts: subProducts,
        subProductsLength: subProducts?.length || 0,
        modifiedQuantities: modifiedQuantities,
        modifiedQuantitiesDetails: Object.entries(modifiedQuantities || {}).map(
          ([id, qty]) => ({
            subProductId: id,
            quantity: qty,
          }),
        ),
      });

      // Date is already in Gregorian format (YYYY-MM-DD)
      // No conversion needed - just ensure it's in the correct format
      let gregorianDate: string;

      if (date.includes('/')) {
        // Date is in format YYYY/MM/DD, convert to YYYY-MM-DD
        gregorianDate = date.replace(/\//g, '-');
      } else if (date.includes('-')) {
        // Date is already in format YYYY-MM-DD
        gregorianDate = date;
      } else {
        // Fallback: use as is
        gregorianDate = date;
      }

      console.log('📅 [addSingleReservationToCart] Date (no conversion):', {
        originalDate: date,
        gregorianDate,
      });

      // Build secondaryServices from subProducts with modified quantities
      const secondaryServices: ReservationSecondaryService[] = [];
      if (subProducts && subProducts.length > 0) {
        console.log(
          '📦 [addSingleReservationToCart] Processing subProducts:',
          subProducts.length,
        );
        subProducts.forEach(subProduct => {
          const quantity = modifiedQuantities[subProduct.id] || 0;
          console.log(
            `🔍 [addSingleReservationToCart] SubProduct ${subProduct.id}:`,
            {
              subProductId: subProduct.id,
              productId: subProduct.product?.id,
              productTitle: subProduct.product?.title,
              quantityFromState: quantity,
              hasProduct: !!subProduct.product,
              willAdd: quantity > 0 && !!subProduct.product,
            },
          );
          if (quantity > 0 && subProduct.product) {
            // Calculate end date based on duration (default to 1 day if not available)
            const duration = subProduct.product.duration || 1;
            const startDate = gregorianDate;
            const endDate = moment(startDate)
              .add(duration, 'days')
              .format('YYYY-MM-DD');

            const secondaryService = {
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
            };

            secondaryServices.push(secondaryService);
            console.log(
              `✅ [addSingleReservationToCart] Added secondaryService:`,
              secondaryService,
            );
          }
        });
      } else {
        console.log(
          '⚠️ [addSingleReservationToCart] No subProducts found or empty array',
        );
      }

      console.log(
        '📋 [addSingleReservationToCart] Final secondaryServices array:',
        {
          count: secondaryServices.length,
          services: secondaryServices,
        },
      );

      // Convert ServiceEntryDto to Product
      const product = convertServiceEntryToProduct(item);

      const cartData = {
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
      };

      console.log('🚀 [addSingleReservationToCart] Sending to addToCart:', {
        productId: product.id,
        productTitle: product.title,
        quantity: cartData.quantity,
        isReserve: cartData.isReserve,
        reservationData: {
          reservedDate: cartData.reservationData.reservedDate,
          reservedStartTime: cartData.reservationData.reservedStartTime,
          reservedEndTime: cartData.reservationData.reservedEndTime,
          secondaryServices: cartData.reservationData.secondaryServices,
          secondaryServicesCount:
            cartData.reservationData.secondaryServices?.length || 0,
        },
        fullCartData: cartData,
      });

      // Add to cart with reservation data
      try {
        await addToCart(cartData);
        console.log(
          '✅ [addSingleReservationToCart] Successfully added to cart',
        );
      } catch (error) {
        console.error(
          '❌ [addSingleReservationToCart] Error adding to cart:',
          error,
        );
        // Show error message to user
        if (error instanceof Error) {
          showToast({
            type: 'error',
            text1: 'خطا',
            text2: error.message,
          });
        } else {
          showToast({
            type: 'error',
            text1: 'خطا',
            text2: 'خطا در افزودن به سبد خرید',
          });
        }
        // Re-throw error to stop processing other items
        throw error;
      }
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
        console.log(
          '🎯 [handleAddReservationToCart] Called with data from bottom sheet:',
          {
            itemId: data.item.id,
            itemTitle: data.item.title,
            date: data.date,
            fromTime: data.fromTime,
            toTime: data.toTime,
            subProducts: data.subProducts,
            subProductsLength: data.subProducts?.length || 0,
            modifiedQuantities: data.modifiedQuantities,
            modifiedQuantitiesDetails: Object.entries(
              data.modifiedQuantities || {},
            ).map(([id, qty]) => ({
              subProductId: id,
              quantity: qty,
            })),
          },
        );

        // Get current data from bottom sheet to get dayName and dayData
        const currentData =
          preReserveBottomSheetRef.current?.getCurrentData?.();

        console.log(
          '📋 [handleAddReservationToCart] Current data from bottom sheet:',
          {
            dayName: currentData?.dayName,
            hasDayData: !!currentData?.dayData,
            currentDataSubProducts: currentData?.subProducts,
            currentDataModifiedQuantities: currentData?.modifiedQuantities,
          },
        );

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

        console.log(
          '📦 [handleAddReservationToCart] Created currentItemData:',
          {
            itemId: currentItemData.item.id,
            subProducts: currentItemData.subProducts,
            subProductsLength: currentItemData.subProducts?.length || 0,
            modifiedQuantities: currentItemData.modifiedQuantities,
          },
        );

        // Check if current item already exists in list
        const reservationKey = `${data.item.id}-${data.date}-${data.fromTime}-${data.toTime}`;
        const exists = preReservedItems.some(
          item =>
            `${item.item.id}-${item.date}-${item.fromTime}-${item.toTime}` ===
            reservationKey,
        );

        console.log(
          '🔍 [handleAddReservationToCart] Checking existing items:',
          {
            reservationKey,
            exists,
            preReservedItemsCount: preReservedItems.length,
            existingItems: preReservedItems.map(item => ({
              itemId: item.item.id,
              date: item.date,
              subProductsLength: item.subProducts?.length || 0,
              modifiedQuantities: item.modifiedQuantities,
            })),
          },
        );

        // Update or add to list
        let allItems: PreReservedItem[];
        if (exists) {
          // If item exists, update it with new data (especially modifiedQuantities)
          allItems = preReservedItems.map(item => {
            const itemKey = `${item.item.id}-${item.date}-${item.fromTime}-${item.toTime}`;
            if (itemKey === reservationKey) {
              // Update existing item with new data
              console.log(
                '🔄 [handleAddReservationToCart] Updating existing item with new data:',
                {
                  oldModifiedQuantities: item.modifiedQuantities,
                  newModifiedQuantities: currentItemData.modifiedQuantities,
                },
              );
              return currentItemData;
            }
            return item;
          });
          // Also update the state
          setPreReservedItems(allItems);
        } else {
          // If item doesn't exist, add it to list
          addToPreReservedList(currentItemData);
          allItems = [...preReservedItems, currentItemData];
        }

        console.log(
          '🛒 [handleAddReservationToCart] Adding all items to cart:',
          {
            totalItems: allItems.length,
            items: allItems.map(item => ({
              itemId: item.item.id,
              itemTitle: item.item.title,
              subProductsLength: item.subProducts?.length || 0,
              modifiedQuantities: item.modifiedQuantities,
            })),
          },
        );

        for (const item of allItems) {
          await addSingleReservationToCart(item);
        }

        // Refresh cart to ensure UI is updated (especially if items were updated instead of added)
        await refreshCart();

        // Clear all pre-reserved items and reservation state
        setPreReservedItems([]);
        preReserveBottomSheetRef.current?.clearCurrentReservationState();
        preReserveBottomSheetRef.current?.close();
        navigationRef.navigate('Root', {
          screen: 'HomeNavigator',
          params: {screen: 'cart'},
        });
      } catch (error) {
        console.error('❌ [handleAddReservationToCart] Error:', error);
      }
    },
    [addToPreReservedList, preReservedItems, addSingleReservationToCart],
  );

  // Handle add new reservation (when clicking "اضافه کردن رزرو جدید")
  const handleAddNewReservation = useCallback(() => {
    // Get current reservation data from bottom sheet
    const currentData = preReserveBottomSheetRef.current?.getCurrentData?.();
    console.log(
      '➕ [handleAddNewReservation] Current data from bottom sheet:',
      {
        hasItem: !!currentData?.item,
        hasDayData: !!currentData?.dayData,
        itemId: currentData?.item?.id,
        subProducts: currentData?.subProducts,
        subProductsLength: currentData?.subProducts?.length || 0,
        modifiedQuantities: currentData?.modifiedQuantities,
        modifiedQuantitiesDetails: Object.entries(
          currentData?.modifiedQuantities || {},
        ).map(([id, qty]) => ({
          subProductId: id,
          quantity: qty,
        })),
      },
    );
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
      console.log(
        '💳 [handleCompletePayment] Starting - All pre-reserved items:',
        {
          totalItems: preReservedItems.length,
          items: preReservedItems.map(item => ({
            itemId: item.item.id,
            itemTitle: item.item.title,
            date: item.date,
            subProducts: item.subProducts,
            subProductsLength: item.subProducts?.length || 0,
            modifiedQuantities: item.modifiedQuantities,
            modifiedQuantitiesDetails: Object.entries(
              item.modifiedQuantities || {},
            ).map(([id, qty]) => ({
              subProductId: id,
              quantity: qty,
            })),
          })),
        },
      );

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
      console.error('❌ [handleCompletePayment] Error:', error);
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
