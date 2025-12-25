import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import {
  Calendar,
  Clock,
  Trash,
  Warning2,
  ArrowDown2,
  ArrowUp2,
  CloseCircle,
  Timer1,
} from 'iconsax-react-native';
import moment from 'jalali-moment';
import BottomSheet, {BottomSheetMethods} from '../BottomSheet/BottomSheet';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {
  ServiceEntryDto,
  DayEntryDto,
} from '../../services/models/response/ReservationResService';
import {formatNumber} from '../../utils/helpers/helpers';
import {useTheme} from '../../utils/ThemeContext';
import {routes} from '../../routes/routes';
import {useGetReservationExpiresTime} from '../../utils/hooks/Reservation/useGetReservationExpiresTime';
import {useCartContext} from '../../utils/CartContext';
import {useReservationStore} from '../../store/reservationStore';
import {
  getReservationKey,
  ReservationStoreItem,
} from '../../utils/helpers/ReservationStorage';
import {CartItem} from '../../utils/helpers/CartStorage';

// SubProduct interface from API
interface SubProduct {
  id: number;
  quantity: number;
  discount: number;
  amount: number;
  tax: number;
  price: number | null;
  product: {
    id: number;
    title: string;
    sku: string;
    price: number;
    discount: number;
    hasSubProduct: boolean;
    [key: string]: any;
  };
  subProducts?: SubProduct[]; // Nested subProducts
  [key: string]: any; // For other properties
}

// Penalty item from API
interface ReservationPenaltyDto {
  quantity: number;
  unit: 'DAY' | 'HOUR';
  percent: number;
  description: string;
  hourAmount: number;
}

// Formatted penalty item for display
interface PenaltyDisplayItem {
  timeLabel: string;
  percentage: number;
}

// Props for the bottom sheet
export interface PreReserveBottomSheetProps {
  onAddNewReservation?: () => void;
  onCompletePayment?: () => void;
  onDeleteReservation?: (data: {
    item: ServiceEntryDto;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
    dayData: DayEntryDto;
  }) => void;
  isDeleting?: boolean;
}

export interface PreReserveBottomSheetRef {
  open: (data: {
    item: ServiceEntryDto;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
    dayData: DayEntryDto;
  }) => void;
  close: () => void;
  clearCurrentReservationState: () => void;
  getCurrentData: () => {
    item: ServiceEntryDto | null;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
    dayData: DayEntryDto | null;
    subProducts: SubProduct[];
    modifiedQuantities: Record<number, number>;
  } | null;
}

// Format date to Persian (Jalali) calendar
const formatDateToPersian = (dateStr: string): string => {
  try {
    // Check if date is in format YYYY/MM/DD
    const [year, month, day] = dateStr.split('/');
    // Create moment from Gregorian date and convert to Jalali
    const jalaliDate = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD')
      .locale('fa')
      .format('jYYYY/jMM/jDD');
    return jalaliDate;
  } catch {
    return dateStr;
  }
};

// Format persian date with month name
const formatPersianDateWithMonthName = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split('/');
    const jalaliMoment = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD').locale(
      'fa',
    );
    return jalaliMoment.format('jD jMMMM jYYYY');
  } catch {
    return dateStr;
  }
};

// Helper function to format penalty data from API
const formatPenaltyItems = (
  penalties: ReservationPenaltyDto[],
): PenaltyDisplayItem[] => {
  if (!penalties || penalties.length === 0) return [];

  // Sort by hourAmount descending (furthest time first)
  const sorted = [...penalties].sort((a, b) => b.hourAmount - a.hourAmount);

  return sorted.map(penalty => {
    let timeLabel = '';
    if (penalty.unit === 'DAY') {
      if (penalty.quantity === 1) {
        timeLabel = '۱ روز قبل';
      } else if (penalty.quantity === 7) {
        timeLabel = '۱ هفته قبل';
      } else if (penalty.quantity === 30) {
        timeLabel = '۱ ماه قبل';
      } else {
        timeLabel = `${penalty.quantity} روز قبل`;
      }
    } else if (penalty.unit === 'HOUR') {
      if (penalty.quantity === 1) {
        timeLabel = 'تا ۱ ساعت مانده';
      } else {
        timeLabel = `تا ${penalty.quantity} ساعت مانده`;
      }
    }

    return {
      timeLabel,
      percentage: penalty.percent,
    };
  });
};

const PreReserveBottomSheet = forwardRef<
  PreReserveBottomSheetRef,
  PreReserveBottomSheetProps
>(
  (
    {
      onAddNewReservation,
      onCompletePayment,
      onDeleteReservation,
      isDeleting = false,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const {theme} = useTheme();
    const isDark = theme === 'dark';
    const {
      removeFromCart,
      updateReservationItemData,
      items: cartItems,
    } = useCartContext();

    // State for the data
    const [item, setItem] = useState<ServiceEntryDto | null>(null);
    const [date, setDate] = useState('');
    const [fromTime, setFromTime] = useState('');
    const [toTime, setToTime] = useState('');
    const [dayName, setDayName] = useState('');
    const [dayData, setDayData] = useState<DayEntryDto | null>(null);

    // State for subProducts (stored from item)
    const [subProducts, setSubProducts] = useState<SubProduct[]>([]);

    // State for modified quantities (key: reservationKey, value: Record<subProduct.id, quantity>)
    // reservationKey format: `${productId}-${date}-${fromTime}-${toTime}`
    const [modifiedQuantities, setModifiedQuantities] = useState<
      Record<string, Record<number, number>>
    >({});

    // State for penalty accordion
    const [penaltyExpanded, setPenaltyExpanded] = useState(false);

    // Get reservation expiration time
    const {data: expiresTimeData} = useGetReservationExpiresTime(!!item);

    // State for countdown timer
    const [remainingTime, setRemainingTime] = useState<number | null>(null);
    // Flag to prevent multiple auto-delete calls
    const hasAutoDeletedRef = useRef(false);
    // Flag to prevent syncing back the value we just set (avoid loop)
    const isUpdatingFromLocalRef = useRef(false);

    // Get reservation from ReservationStore to use createdAt (pre-reserve time)
    const reservationFromStore = useMemo(() => {
      if (!item || !date || !fromTime || !toTime) return null;

      try {
        // Convert date from Jalali to Gregorian if needed
        let gregorianDate = date;
        if (date.includes('/')) {
          const [year, month, day] = date.split('/');
          gregorianDate = moment(
            `${year}-${month}-${day}`,
            'jYYYY-jMM-jDD',
          ).format('YYYY-MM-DD');
        }

        const {findReservationByKey} = useReservationStore.getState();
        const key = `${item.id}-${gregorianDate}-${fromTime}-${toTime}`;
        return findReservationByKey(key);
      } catch (error) {
        console.error(
          '⚠️ [PreReserveBottomSheet] Error getting reservation from store:',
          error,
        );
        return null;
      }
    }, [item, date, fromTime, toTime]);

    // Calculate remaining time
    useEffect(() => {
      // Use createdAt from ReservationStore (pre-reserve time) if available
      const startTime = reservationFromStore?.createdAt;

      if (!startTime || !expiresTimeData?.ttlSecond) {
        setRemainingTime(null);
        hasAutoDeletedRef.current = false; // Reset flag when closed
        return;
      }

      // Reset flag when startTime or expiresTimeData changes
      hasAutoDeletedRef.current = false;

      const updateRemainingTime = () => {
        const now = new Date();
        const startedAt = new Date(startTime);
        const elapsedSeconds = (now.getTime() - startedAt.getTime()) / 1000;
        const expiresTimeSeconds = expiresTimeData.ttlSecond;
        const remainingSeconds = Math.max(
          0,
          expiresTimeSeconds - elapsedSeconds,
        );
        // Convert to minutes for display
        const remainingMinutes = remainingSeconds / 60;
        setRemainingTime(remainingMinutes);

        // If time expired, automatically remove from cart and close bottom sheet
        // No need to call API - server already knows it's expired
        if (
          remainingSeconds <= 0 &&
          item &&
          dayData &&
          !hasAutoDeletedRef.current
        ) {
          hasAutoDeletedRef.current = true; // Set flag to prevent multiple calls

          // Remove from cart (no API call needed - server knows it's expired)
          (async () => {
            try {
              // Convert date from Jalali to Gregorian if needed
              let gregorianDate = date;
              if (date.includes('/')) {
                const [year, month, day] = date.split('/');
                gregorianDate = moment(
                  `${year}-${month}-${day}`,
                  'jYYYY-jMM-jDD',
                ).format('YYYY-MM-DD');
              }

              // Find reservation in ReservationStore
              const {findReservationByKey, removeReservation: removeFromStore} =
                useReservationStore.getState();
              const key = `${item.id}-${gregorianDate}-${fromTime}-${toTime}`;
              const reservation = findReservationByKey(key);

              // If reservation has cartId, remove from cart
              if (reservation?.cartId) {
                await removeFromCart(reservation.cartId);
              }

              // Also remove from ReservationStore
              await removeFromStore(key);
            } catch (error) {
              console.error(
                '⚠️ [PreReserveBottomSheet] Error removing expired reservation:',
                error,
              );
            }
          })();

          // Close bottom sheet
          bottomSheetRef.current?.close();
        }
      };

      // Update immediately
      updateRemainingTime();

      // Update every second
      const interval = setInterval(updateRemainingTime, 1000);

      return () => clearInterval(interval);
    }, [
      reservationFromStore?.createdAt,
      expiresTimeData,
      item,
      dayData,
      date,
      fromTime,
      toTime,
      dayName,
      onDeleteReservation,
    ]);

    // Format remaining time for display
    const formatRemainingTime = (minutes: number): string => {
      if (minutes <= 0) return 'منقضی شده';
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      if (hours > 0) {
        return `${hours} ساعت و ${mins} دقیقه`;
      }
      return `${mins} دقیقه`;
    };

    // Generate unique key for current reservation
    const getReservationKey = (
      productId: number,
      date: string,
      fromTime: string,
      toTime: string,
    ): string => {
      return `${productId}-${date}-${fromTime}-${toTime}`;
    };

    // Get current reservation key
    const getCurrentReservationKey = (): string | null => {
      if (!item) return null;
      return getReservationKey(item.id, date, fromTime, toTime);
    };

    // 🆕 Listen to ReservationStore changes to sync with cart updates
    // This ensures that when user changes quantity in cart, bottom sheet updates too
    useEffect(() => {
      if (!item || !date || !fromTime || !toTime) return;

      // Convert date from Jalali to Gregorian if needed
      let gregorianDate = date;
      if (date.includes('/')) {
        const [year, month, day] = date.split('/');
        gregorianDate = moment(
          `${year}-${month}-${day}`,
          'jYYYY-jMM-jDD',
        ).format('YYYY-MM-DD');
      }
      const storeKey = `${item.id}-${gregorianDate}-${fromTime}-${toTime}`;

      // Track previous modifiedQuantities to detect changes
      let prevModifiedQuantities: Record<number, number> | undefined;

      // Subscribe to store changes
      const unsubscribe = useReservationStore.subscribe(
        (state: {reservations: ReservationStoreItem[]}) => {
          const reservation = state.reservations.find(
            (r: ReservationStoreItem) =>
              `${r.productId}-${r.date}-${r.fromTime}-${r.toTime}` === storeKey,
          );
          const currentModifiedQuantities = reservation?.modifiedQuantities;

          // Skip if we just updated from local (prevents loop)
          if (isUpdatingFromLocalRef.current) {
            setTimeout(() => {
              isUpdatingFromLocalRef.current = false;
            }, 100);
            prevModifiedQuantities = currentModifiedQuantities;
            return;
          }

          // Only update if actually changed
          if (
            currentModifiedQuantities &&
            JSON.stringify(currentModifiedQuantities) !==
              JSON.stringify(prevModifiedQuantities)
          ) {
            const localKey = getReservationKey(item.id, date, fromTime, toTime);
            setModifiedQuantities(prev => ({
              ...prev,
              [localKey]: currentModifiedQuantities,
            }));
          }

          prevModifiedQuantities = currentModifiedQuantities;
        },
      );

      return () => {
        unsubscribe();
      };
    }, [item, date, fromTime, toTime]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      open: async data => {
        setItem(data.item);
        setDate(data.date);
        setFromTime(data.fromTime);
        setToTime(data.toTime);
        setDayName(data.dayName);
        setDayData(data.dayData);
        // createdAt is already stored in ReservationStore when pre-reserve happens
        // Store subProducts from item
        setSubProducts((data.item.subProducts as SubProduct[]) || []);

        // Load modifiedQuantities from ReservationStore if exists
        try {
          const {
            findReservationByKey,
            getReservationKey: getStoreReservationKey,
          } =
            require('../../store/reservationStore').useReservationStore.getState();

          // Convert date from Jalali to Gregorian if needed (for store lookup)
          let gregorianDate = data.date;
          if (data.date.includes('/')) {
            const [year, month, day] = data.date.split('/');
            gregorianDate = moment(
              `${year}-${month}-${day}`,
              'jYYYY-jMM-jDD',
            ).format('YYYY-MM-DD');
          }

          // Use Gregorian date for store lookup (as stored in ReservationStore)
          const storeReservationKey = getStoreReservationKey({
            productId: data.item.id,
            date: gregorianDate,
            fromTime: data.fromTime,
            toTime: data.toTime,
          });

          const storeReservation = findReservationByKey(storeReservationKey);

          if (storeReservation && storeReservation.modifiedQuantities) {
            // Update modifiedQuantities state with data from store
            // Use original date format (Jalali) for local state key
            const localStateKey = getReservationKey(
              data.item.id,
              data.date,
              data.fromTime,
              data.toTime,
            );
            setModifiedQuantities(prev => ({
              ...prev,
              [localStateKey]: storeReservation.modifiedQuantities,
            }));
          }
        } catch (error) {
          console.error(
            '⚠️ [PreReserveBottomSheet] Error loading from ReservationStore:',
            error,
          );
        }

        // On first open (especially on web / slow devices), BottomSheet ref may not be ready yet.
        // Retry expand a few times to avoid "first click doesn't open" bug.
        const tryExpand = (attempt = 0) => {
          if (bottomSheetRef.current) {
            bottomSheetRef.current.expand();
            return;
          }
          if (attempt < 10) {
            setTimeout(() => tryExpand(attempt + 1), 50);
          }
        };

        requestAnimationFrame(() => {
          setTimeout(() => tryExpand(0), 0);
        });
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
      clearCurrentReservationState: () => {
        clearReservationState();
      },
      getCurrentData: () => {
        if (!item || !dayData) return null;
        const reservationKey = getCurrentReservationKey();
        const currentQuantities = reservationKey
          ? modifiedQuantities[reservationKey] || {}
          : {};
        return {
          item,
          date,
          fromTime,
          toTime,
          dayName,
          dayData,
          subProducts,
          modifiedQuantities: currentQuantities,
        };
      },
    }));

    // Update quantity for subProduct
    const updateQuantity = (id: number, delta: number) => {
      const reservationKey = getCurrentReservationKey();
      if (!reservationKey || !item) return;

      // Set flag to prevent sync loop
      isUpdatingFromLocalRef.current = true;

      // Get current quantities
      const currentReservationQuantities =
        modifiedQuantities[reservationKey] || {};
      const currentQuantity = currentReservationQuantities[id] ?? 0;
      const newQuantity = Math.max(0, currentQuantity + delta);

      // Create updated quantities
      let updatedQuantities = {...currentReservationQuantities};
      if (newQuantity === 0) {
        const {[id]: _, ...rest} = updatedQuantities;
        updatedQuantities = rest;
      } else {
        updatedQuantities[id] = newQuantity;
      }

      // Update local state
      setModifiedQuantities(prev => {
        if (Object.keys(updatedQuantities).length === 0) {
          const {[reservationKey]: _, ...rest} = prev;
          return rest;
        }
        return {...prev, [reservationKey]: updatedQuantities};
      });

      // Convert date to Gregorian for lookup
      let gregorianDate = date;
      if (date.includes('/')) {
        const [year, month, day] = date.split('/');
        gregorianDate = moment(
          `${year}-${month}-${day}`,
          'jYYYY-jMM-jDD',
        ).format('YYYY-MM-DD');
      }

      // Find the cart item for this reservation
      const cartItem = cartItems.find(ci => {
        if (!ci.isReserve || !ci.reservationData) return false;
        const resData = ci.reservationData;
        const cartDate = resData.reservedDate.split(' ')[0];
        return (
          ci.product?.id === item.id &&
          cartDate === gregorianDate &&
          resData.reservedStartTime === fromTime &&
          resData.reservedEndTime === toTime
        );
      });

      if (cartItem?.CartId && cartItem.reservationData) {
        // Build secondaryServices from updatedQuantities
        const secondaryServices: any[] = [];

        Object.entries(updatedQuantities).forEach(
          ([subProductId, quantity]) => {
            if (quantity > 0) {
              const subProduct = subProducts.find(
                sp => sp.id === Number(subProductId),
              );
              if (subProduct) {
                const startDate = gregorianDate;
                const duration = subProduct.product?.duration || 1;
                const endDate = moment(startDate)
                  .add(duration, 'days')
                  .format('YYYY-MM-DD');

                secondaryServices.push({
                  user: 0,
                  product: subProduct.product?.id || subProduct.id,
                  start: startDate,
                  end: endDate,
                  discount: subProduct.discount || 0,
                  type: subProduct.product?.type || 1,
                  tax: subProduct.tax || 0,
                  price: subProduct.product?.price || subProduct.amount || 0,
                  quantity: quantity,
                  subProductId: subProduct.id,
                });
              }
            }
          },
        );

        // Update cart directly
        updateReservationItemData({
          cartId: cartItem.CartId,
          reservationData: {
            ...cartItem.reservationData,
            secondaryServices,
          },
        });
      }

      // Also update ReservationStore for consistency
      (async () => {
        try {
          const {updateReservation} = useReservationStore.getState();

          const key = `${item.id}-${gregorianDate}-${fromTime}-${toTime}`;

          await updateReservation(key, {
            modifiedQuantities: updatedQuantities,
            updatedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error(
            '⚠️ [PreReserveBottomSheet] Error updating ReservationStore:',
            error,
          );
        }
      })();
    };

    // Get quantity for a subProduct (default is 0, not original quantity)
    const getQuantity = (id: number, originalQuantity: number): number => {
      const reservationKey = getCurrentReservationKey();
      if (!reservationKey) return 0;

      const reservationQuantities = modifiedQuantities[reservationKey];
      if (!reservationQuantities) return 0;

      return reservationQuantities[id] ?? 0; // Default to 0 instead of originalQuantity
    };

    // Clear state for current reservation
    const clearReservationState = () => {
      const reservationKey = getCurrentReservationKey();
      if (!reservationKey) return;

      setModifiedQuantities(prev => {
        const {[reservationKey]: _, ...rest} = prev;
        return rest;
      });
    };

    // Get price for a subProduct
    const getPrice = (subProduct: SubProduct): number => {
      // Use product.price if available, otherwise use amount
      return subProduct.product?.price || subProduct.amount || 0;
    };

    // Helper function to calculate total from subProducts (including nested)
    const calculateSubProductsTotal = (
      products: SubProduct[] | undefined,
    ): number => {
      if (!products || products.length === 0) return 0;

      return products.reduce((total, subProduct) => {
        const quantity = getQuantity(subProduct.id, subProduct.quantity);
        const price = getPrice(subProduct);
        const subProductTotal = price * quantity;
        // Recursively calculate nested subProducts
        const nestedTotal = calculateSubProductsTotal(subProduct.subProducts);
        return total + subProductTotal + nestedTotal;
      }, 0);
    };

    // Calculate totals
    const reservePrice = item?.reservePrice || item?.price || 0;
    const discount = item?.discount || 0;
    const gift = 0; // TODO: Get from API response
    const vat = item?.tax || 0;
    const additionalTotal = calculateSubProductsTotal(subProducts);
    const totalPrice = reservePrice - discount + gift + vat + additionalTotal;

    // Get duration from reservationPattern
    const getDuration = (): string => {
      const pattern = item?.reservationPattern;
      if (pattern?.reservationTag?.duration) {
        const duration = parseInt(pattern.reservationTag.duration, 10);
        const unit = pattern.reservationTag.unit;
        if (unit === 'MINUTE') {
          return duration >= 60
            ? `${Math.floor(duration / 60)} ساعت`
            : `${duration} دقیقه`;
        }
        return `${duration} ساعت`;
      }
      return '۱ ساعت';
    };

    // Get image URL
    const getImageUrl = (): string | null => {
      if (item?.image?.name) {
        return routes.baseUrl + routes.media.getMedia(item.image.name);
      }
      return null;
    };

    if (!item) return null;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[90, 95]}
        Title="جزئیات سفارش"
        scrollView>
        <View className="">
          <View className="gap-4 pb-2">
            {/* Service Info Card */}
            <View className="BaseServiceCard gap-3">
              <View className="bg-neutral-200 dark:bg-neutral-dark-200 rounded-3xl p-4 gap-2">
                {/* Title */}
                <BaseText type="body3" color="base">
                  {item.title}
                </BaseText>

                {/* Date and Duration Row */}
                <View className="flex-row justify-between ">
                  <View className="flex-row items-center gap-2">
                    <Calendar
                      variant="Bold"
                      size={20}
                      color={isDark ? '#AAABAD' : '#AAABAD'}
                    />
                    <BaseText type="body3" color="secondary" className="">
                      {formatDateToPersian(date)}
                    </BaseText>
                  </View>
                  <BaseText type="body3" color="secondary">
                    {getDuration()}
                  </BaseText>
                </View>

                {/* Time Row */}
                <View className="flex-row justify-between ">
                  <View className="flex-row items-center gap-2">
                    <Clock
                      variant="Bold"
                      size={20}
                      color={isDark ? '#AAABAD' : '#AAABAD'}
                    />
                    <BaseText type="body3" color="secondary">
                      شروع: {fromTime}
                    </BaseText>
                  </View>
                  <BaseText type="body3" color="secondary">
                    پایان: {toTime}
                  </BaseText>
                </View>
              </View>
              {/* Image */}
              {getImageUrl() && (
                <Image
                  source={{uri: getImageUrl()!}}
                  className="w-full rounded-3xl"
                  style={{aspectRatio: 13 / 5}}
                  resizeMode="cover"
                />
              )}
              {!getImageUrl() && (
                <View
                  className="w-full rounded-3xl bg-neutral-200 dark:bg-neutral-dark-200 items-center justify-center"
                  style={{aspectRatio: 13 / 5}}>
                  <BaseText type="caption" color="secondary">
                    بدون تصویر
                  </BaseText>
                </View>
              )}
            </View>

            {/* Additional Services Section - Only show if subProducts exist */}
            {subProducts && subProducts.length > 0 && (
              <View>
                <BaseText type="body1" color="base" className="mb-4">
                  خدمات اضافی
                </BaseText>

                <View className="BaseServiceCard gap-3">
                  {subProducts.map(subProduct => {
                    const quantity = getQuantity(
                      subProduct.id,
                      subProduct.quantity,
                    );
                    const price = getPrice(subProduct);
                    const hasNested =
                      subProduct.subProducts &&
                      subProduct.subProducts.length > 0;

                    return (
                      <View key={subProduct.id} className="gap-1">
                        <View className="flex-row items-center justify-between">
                          {/* Service Info */}
                          <View className="flex-1">
                            <BaseText type="subtitle2" color="secondary">
                              {subProduct.product?.title || 'بدون عنوان'}
                              {hasNested ? '?' : ':'}
                            </BaseText>
                          </View>
                          {/* Quantity Controls */}
                          <View className="gap-1">
                            <View className="flex-row items-center justify-center gap-2">
                              {/* Plus button - Left side */}
                              <BaseButton
                                type="Tonal"
                                color="Black"
                                text="+"
                                size="Medium"
                                onPress={() => updateQuantity(subProduct.id, 1)}
                                style={{width: 36}}
                              />
                              {/* Quantity display - Center */}
                              <BaseText
                                type="body2"
                                color="base"
                                className="w-6 text-center">
                                {quantity}
                              </BaseText>
                              <BaseButton
                                type="Tonal"
                                color="Black"
                                text="-"
                                disabled={quantity === 0}
                                size="Medium"
                                redbutton={quantity === 1}
                                noText={quantity === 1}
                                LeftIcon={quantity === 1 ? Trash : undefined}
                                onPress={() =>
                                  updateQuantity(subProduct.id, -1)
                                }
                                style={{width: 36}}
                              />
                            </View>
                          </View>
                        </View>
                        {price > 0 && (
                          <BaseText
                            type="badge"
                            color="secondary"
                            className="text-end">
                            قیمت هر واحد {formatNumber(price)} تومان میباشد.
                          </BaseText>
                        )}
                        {/* Render nested subProducts if exist */}
                        {hasNested && (
                          <View className="mr-4 mt-2 gap-2">
                            {subProduct.subProducts!.map(nested => {
                              const nestedQuantity = getQuantity(
                                nested.id,
                                nested.quantity,
                              );
                              const nestedPrice = getPrice(nested);
                              return (
                                <View key={nested.id} className="gap-1">
                                  <View className="flex-row items-center justify-between">
                                    <View className="flex-1">
                                      <BaseText type="badge" color="secondary">
                                        {nested.product?.title || 'بدون عنوان'}
                                        {nested.subProducts &&
                                        nested.subProducts.length > 0
                                          ? '?'
                                          : ':'}
                                      </BaseText>
                                    </View>
                                    <View className="flex-row items-end justify-end gap-2">
                                      {/* Plus button - Left side */}
                                      <TouchableOpacity
                                        onPress={() =>
                                          updateQuantity(nested.id, 1)
                                        }
                                        className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                                        <BaseText type="body2" color="base">
                                          +
                                        </BaseText>
                                      </TouchableOpacity>
                                      {/* Quantity display - Center */}
                                      {nestedQuantity === 0 ? (
                                        <CloseCircle
                                          size={20}
                                          variant="Bold"
                                          color="#FF3B30"
                                        />
                                      ) : (
                                        <BaseText
                                          type="body2"
                                          color="base"
                                          className="w-6 text-center">
                                          {nestedQuantity}
                                        </BaseText>
                                      )}
                                      {/* Minus/Trash button - Right side */}
                                      {nestedQuantity === 1 ? (
                                        // Show Trash icon when quantity is 1
                                        <TouchableOpacity
                                          onPress={() =>
                                            updateQuantity(nested.id, -1)
                                          }
                                          className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                                          <Trash
                                            size={16}
                                            variant="Bold"
                                            color="#FF3B30"
                                          />
                                        </TouchableOpacity>
                                      ) : (
                                        // Show minus button when quantity is not 1
                                        <TouchableOpacity
                                          onPress={() =>
                                            updateQuantity(nested.id, -1)
                                          }
                                          disabled={nestedQuantity === 0}
                                          className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center"
                                          style={{
                                            opacity:
                                              nestedQuantity === 0 ? 0.3 : 1,
                                          }}>
                                          <BaseText type="body2" color="base">
                                            -
                                          </BaseText>
                                        </TouchableOpacity>
                                      )}
                                    </View>
                                  </View>
                                  {nestedPrice > 0 && (
                                    <BaseText
                                      type="caption"
                                      color="secondary"
                                      className="text-end">
                                      قیمت هر واحد {formatNumber(nestedPrice)}{' '}
                                      تومان میباشد.
                                    </BaseText>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Total Section */}
            <View>
              <BaseText type="body1" color="base" className=" mb-4">
                جمع کل
              </BaseText>

              <View className="BaseServiceCard gap-4">
                {/* Reserve Price - Always show */}
                {reservePrice > 0 && (
                  <View className="flex-row justify-between">
                    <BaseText type="subtitle2" color="secondary">
                      قیمت رزرو
                    </BaseText>
                    <BaseText type="subtitle2" color="base">
                      {formatNumber(reservePrice)} ریال
                    </BaseText>
                  </View>
                )}

                {/* Discount - Only show if > 0 */}
                {discount > 0 && (
                  <View className="flex-row justify-between">
                    <BaseText type="subtitle2" color="secondary">
                      تخفیف
                    </BaseText>
                    <BaseText type="subtitle2" style={{color: '#E53935'}}>
                      {formatNumber(discount)} ریال
                    </BaseText>
                  </View>
                )}

                {/* Gift - Only show if > 0 */}
                {gift > 0 && (
                  <View className="flex-row justify-between">
                    <BaseText
                      type="subtitle2"
                      color="supportive2"
                      className="text-end">
                      هدیه خرید
                    </BaseText>
                    <BaseText
                      type="subtitle2"
                      color="supportive2"
                      className="text-end">
                      {formatNumber(gift)} ریال
                    </BaseText>
                  </View>
                )}

                {/* VAT - Only show if > 0 */}
                {vat > 0 && (
                  <View className="flex-row justify-between">
                    <BaseText type="subtitle2" style={{color: '#4CAF50'}}>
                      ارزش افزوده
                    </BaseText>
                    <BaseText type="subtitle2" style={{color: '#4CAF50'}}>
                      {formatNumber(vat)} ریال
                    </BaseText>
                  </View>
                )}

                {/* Divider - Only show if there are items above total */}
                {(reservePrice > 0 || discount > 0 || gift > 0 || vat > 0) && (
                  <View
                    className="border-t border-dashed my-2"
                    style={{borderColor: isDark ? '#3A3D42' : '#D4D5D6'}}
                  />
                )}

                {/* Total - Always show */}
                <View className="flex-row justify-between">
                  <BaseText type="subtitle2" color="secondary">
                    مبلغ کل
                  </BaseText>
                  <BaseText type="subtitle2" color="base">
                    {formatNumber(totalPrice)} ریال
                  </BaseText>
                </View>
              </View>
            </View>

            {/* Cancellation Penalty Accordion - Only show if there are penalties */}
            {item?.reservationPenalty && item.reservationPenalty.length > 0 && (
              <TouchableOpacity
                onPress={() => setPenaltyExpanded(!penaltyExpanded)}
                className="rounded-2xl overflow-hidden">
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 bg-warning-100 rounded-full">
                  <View className="flex-row items-center gap-2">
                    <Warning2 size={20} color="#E8842F" variant="Bold" />
                    <BaseText type="body3">جریمه لغو رزرو</BaseText>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {penaltyExpanded ? (
                      <ArrowUp2 size={20} color="#1B1D21" />
                    ) : (
                      <ArrowDown2 size={20} color="#1B1D21" />
                    )}
                  </View>
                </View>

                {/* Content */}
                {penaltyExpanded && (
                  <View className="BaseServiceCard gap-3 mt-4">
                    {formatPenaltyItems(item.reservationPenalty).map(
                      (penalty, index) => (
                        <View
                          key={index}
                          className="flex-row justify-between py-2 border-b"
                          style={{
                            borderColor: isDark ? '#3A3D42' : '#E8E8E8',
                            borderBottomWidth:
                              index ===
                              formatPenaltyItems(item.reservationPenalty)
                                .length -
                                1
                                ? 0
                                : 1,
                          }}>
                          <BaseText type="body3" color="base">
                            %{penalty.percentage}
                          </BaseText>
                          <BaseText type="body3" color="secondary">
                            {penalty.timeLabel}
                          </BaseText>
                        </View>
                      ),
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Action Buttons */}
            <View className="gap-3 mt-2">
              {/* Expiration Time Info - Above action buttons */}
              {expiresTimeData?.ttlSecond && remainingTime !== null && (
                <View className="flex-row items-center gap-2 p-3 BaseServiceCard">
                  <View className="flex-1 gap-2">
                    <BaseText type="subtitle2">
                      {remainingTime > 0
                        ? `زمان باقیمانده برای تکمیل رزرو: ${formatRemainingTime(
                            remainingTime,
                          )}`
                        : 'زمان رزرو منقضی شده است'}
                    </BaseText>
                    {remainingTime > 0 && (
                      <BaseText type="subtitle3" color="secondary">
                        در صورت عدم تکمیل رزرو در این زمان، رزرو به صورت خودکار
                        حذف می‌شود
                      </BaseText>
                    )}
                  </View>
                </View>
              )}

              <View className="flex-row gap-3">
                {/* Complete Payment */}
                <BaseButton
                  text="تکمیل رزرو پرداخت"
                  type="Fill"
                  color="Black"
                  rounded
                  size="Large"
                  Extraclass="flex-1"
                  onPress={() => {
                    // Item is already in cart (added on pre-reserve), just navigate to cart
                    if (onCompletePayment) {
                      onCompletePayment();
                    }
                  }}
                />
                {/* Add New Reservation */}
                <BaseButton
                  text="اضافه کردن رزرو جدید"
                  type="Tonal"
                  color="Black"
                  rounded
                  size="Large"
                  Extraclass="flex-1"
                  onPress={onAddNewReservation}
                />
              </View>

              {/* Delete Reservation */}
              <BaseButton
                text="حذف این رزرو و بازگشت"
                type="Outline"
                color="Error"
                rounded
                size="Large"
                redbutton
                isLoading={isDeleting}
                disabled={isDeleting}
                onPress={async () => {
                  if (item && dayData && onDeleteReservation && !isDeleting) {
                    // Check if this reservation is in cart and remove it
                    try {
                      // Convert date from Jalali to Gregorian if needed
                      let gregorianDate = date;
                      if (date.includes('/')) {
                        const [year, month, day] = date.split('/');
                        gregorianDate = moment(
                          `${year}-${month}-${day}`,
                          'jYYYY-jMM-jDD',
                        ).format('YYYY-MM-DD');
                      }

                      // Find reservation in ReservationStore
                      const {findReservationByKey, findReservationByCartId} =
                        useReservationStore.getState();
                      const key = `${item.id}-${gregorianDate}-${fromTime}-${toTime}`;
                      let reservation = findReservationByKey(key);

                      // Also try to find by checking all reservations in cart
                      if (!reservation) {
                        console.log(
                          '⚠️ [PreReserveBottomSheet] Reservation not found by key, checking cart items',
                          {
                            key,
                            productId: item.id,
                            gregorianDate,
                            fromTime,
                            toTime,
                          },
                        );
                        // Try to find by checking cart items directly
                        const {
                          getCart,
                        } = require('../../utils/helpers/CartStorage');
                        const cartItems = await getCart();
                        const cartReservation = cartItems.find(
                          (cartItem: CartItem) =>
                            cartItem.isReserve &&
                            cartItem.reservationData &&
                            cartItem.product?.id === item.id &&
                            cartItem.reservationData.reservedDate.split(
                              ' ',
                            )[0] === gregorianDate &&
                            cartItem.reservationData.reservedStartTime ===
                              fromTime &&
                            cartItem.reservationData.reservedEndTime === toTime,
                        );
                        if (cartReservation?.CartId) {
                          console.log(
                            '🛒 [PreReserveBottomSheet] Found reservation in cart, removing:',
                            {
                              cartId: cartReservation.CartId,
                              productId: item.id,
                            },
                          );
                          await removeFromCart(cartReservation.CartId);
                        }
                      } else if (reservation?.cartId) {
                        console.log(
                          '🛒 [PreReserveBottomSheet] Removing reservation from cart:',
                          {
                            cartId: reservation.cartId,
                            productId: item.id,
                            key,
                          },
                        );
                        await removeFromCart(reservation.cartId);
                      } else {
                        console.log(
                          '⚠️ [PreReserveBottomSheet] Reservation found but no cartId:',
                          {
                            reservation: reservation,
                            productId: item.id,
                            key,
                          },
                        );
                      }
                    } catch (error) {
                      console.error(
                        '⚠️ [PreReserveBottomSheet] Error removing from cart:',
                        error,
                      );
                      // Continue with delete reservation even if cart removal fails
                    }

                    // Delete reservation
                    onDeleteReservation({
                      item,
                      date,
                      fromTime,
                      toTime,
                      dayName,
                      dayData,
                    });
                  }
                }}
              />
            </View>
          </View>
        </View>
      </BottomSheet>
    );
  },
);

export default PreReserveBottomSheet;
