import React, {useRef, useMemo, useState, useEffect, useCallback} from 'react';
import {View, TouchableOpacity, Alert} from 'react-native';
import {
  CartItem,
  ReservationSecondaryService,
} from '../../../utils/helpers/CartStorage';
import {useTranslation} from 'react-i18next';
import {Trash, CloseCircle, Timer1} from 'iconsax-react-native';
import BaseButton from '../../Button/BaseButton';
import BaseText from '../../BaseText';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';
import ContractorInfo from '../../ContractorInfo/ContractorInfo';
import {useCartContext} from '../../../utils/CartContext';
import usePriceCalculations from '../../../utils/hooks/usePriceCalculations';
import ResponsiveImage from '../../ResponsiveImage';
import {UseGetProductByID} from '../../../utils/hooks/Product/UseGetProductByID';
import moment from 'jalali-moment';
import {usePreReserve} from '../../../utils/hooks/Reservation/usePreReserve';
import {PreReserveQuery} from '../../../services/models/requestQueries';
import {useReservationStore} from '../../../store/reservationStore';
import {
  convertCartItemToReservationStoreItem,
  getReservationKey,
  ReservationStoreItem,
} from '../../../utils/helpers/ReservationStorage';
import {useGetReservationExpiresTime} from '../../../utils/hooks/Reservation/useGetReservationExpiresTime';
import {useAuth} from '../../../utils/hooks/useAuth';
import {
  getCartItemExpiryStartIso,
  isTimedCartItem as checkIsTimedCartItem,
} from '../../../utils/helpers/cartExpiry';
import CartExpiryNotice from './CartExpiryNotice';
import {useDefaultCartItemRemainingTime} from '../../../utils/hooks/useDefaultCartItemRemainingTime';
type CartServiceCardProps = {
  data: CartItem;
};
const CartServiceCard: React.FC<CartServiceCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {profile} = useAuth();
  const {
    product,
    quantity,
    CartId,
    SelectedContractor,
    SelectedPriceList,
    isReserve,
    reservationData,
    isGroupClassRoom,
    groupClassRoomData,
  } = data;
  const isGroupClassRoomItem = Boolean(
    isGroupClassRoom || groupClassRoomData?.groupClassRoomId,
  );
  const {updateItemQuantity, removeFromCart, updateReservationItemData} =
    useCartContext();
  const RemoveItemRef = useRef<BottomSheetMethods>(null);
  const preReserveMutation = usePreReserve();
  // Flag to prevent sync loop when updating from local
  const isUpdatingFromLocalRef = useRef(false);

  const groupClassRoomContractor = useMemo(() => {
    if (!isGroupClassRoomItem || !groupClassRoomData) return null;

    if (SelectedContractor?.contractor) {
      return {
        firstName: SelectedContractor.contractor.firstName,
        lastName: SelectedContractor.contractor.lastName,
        imageName: SelectedContractor.contractor.profile?.name,
        gender: SelectedContractor.contractor.gender,
      };
    }

    if (groupClassRoomData.contractorName) {
      return {
        fullName: groupClassRoomData.contractorName,
        imageName: groupClassRoomData.contractorImageName,
        gender: groupClassRoomData.contractorGender,
      };
    }

    return null;
  }, [SelectedContractor, groupClassRoomData, isGroupClassRoomItem]);

  const groupClassRoomScheduleRows = useMemo(() => {
    if (!isGroupClassRoomItem || !groupClassRoomData) return [];

    if (groupClassRoomData.scheduleRows?.length) {
      return groupClassRoomData.scheduleRows;
    }

    if (groupClassRoomData.scheduleDaysLabel) {
      return [
        {
          daysLabel: groupClassRoomData.scheduleDaysLabel,
          timeLabel: groupClassRoomData.scheduleTimeLabel ?? '',
        },
      ];
    }

    return [];
  }, [groupClassRoomData, isGroupClassRoomItem]);

  // For reservation items, calculate price differently
  const isReservationItem = !!(isReserve && reservationData);
  // Shared helper — must match CartScreen auto-remove branching
  const isTimedItem = checkIsTimedCartItem(data);

  const {data: expiresTimeData} = useGetReservationExpiresTime(!!isTimedItem);

  // State for countdown timer (timed items only)
  const [timedRemainingMinutes, setTimedRemainingMinutes] = useState<
    number | null
  >(null);

  const defaultRemainingMinutes = useDefaultCartItemRemainingTime(
    data,
    !isTimedItem,
  );

  // Get reservation from ReservationStore to use createdAt (pre-reserve time) instead of addedToCartAt
  const reservationFromStore = useMemo(() => {
    if (!isReservationItem || !reservationData || !CartId) return null;

    try {
      const {findReservationByCartId, findReservationByKey} =
        useReservationStore.getState();

      // Try to find by cartId first
      let reservation = findReservationByCartId(CartId);

      // If not found by cartId, try to find by key
      if (!reservation && reservationData) {
        const reservedDate = reservationData.reservedDate.split(' ')[0];
        const key = getReservationKey({
          productId: product?.id || 0,
          date: reservedDate,
          fromTime: reservationData.reservedStartTime,
          toTime: reservationData.reservedEndTime,
        });
        reservation = findReservationByKey(key);
      }

      return reservation;
    } catch (error) {
      console.error(
        '⚠️ [CartServiceCard] Error getting reservation from store:',
        error,
      );
      return null;
    }
  }, [isReservationItem, reservationData, CartId, product?.id]);

  // Countdown UI only — CartScreen owns auto-remove so each item expires alone.
  useEffect(() => {
    if (!isTimedItem || !expiresTimeData?.ttlSecond) {
      setTimedRemainingMinutes(null);
      return;
    }

    const startTime = isGroupClassRoomItem
      ? getCartItemExpiryStartIso(data)
      : reservationFromStore?.createdAt || getCartItemExpiryStartIso(data);

    if (!startTime) {
      setTimedRemainingMinutes(null);
      return;
    }

    const updateRemainingTime = () => {
      const now = new Date();
      const startedAt = new Date(startTime);
      const elapsedSeconds = (now.getTime() - startedAt.getTime()) / 1000;
      const expiresTimeSeconds = expiresTimeData.ttlSecond;
      const remainingSeconds = Math.max(0, expiresTimeSeconds - elapsedSeconds);
      setTimedRemainingMinutes(remainingSeconds / 60);
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [
    isTimedItem,
    isGroupClassRoomItem,
    reservationFromStore?.createdAt,
    data.addedToCartAt,
    data.submitAt,
    expiresTimeData,
  ]);

  // REMOVED: No longer syncing from ReservationStore to Cart
  // Cart is the single source of truth
  // ReservationStore is only used for PreReserveBottomSheet sync
  // Each cart item is independent and identified by unique CartId

  // Calculate totals for reservation vs regular items
  const reservationTotals = useMemo(() => {
    if (!isReservationItem || !reservationData) {
      return {total: 0, tax: 0, subProductsTotal: 0};
    }

    // Use reservePrice if available, otherwise fallback to price
    const basePrice =
      (product as any)?.reservePrice || product?.price || 0;
    const discount = product?.discount || 0;
    const tax = product?.tax || 0;
    const subProductsTotal =
      reservationData.secondaryServices?.reduce(
        (sum, service) => sum + (service.price || 0) * (service.quantity || 1),
        0,
      ) || 0;

    const total = basePrice - discount + tax + subProductsTotal;

    return {
      total,
      tax,
      subProductsTotal,
      basePrice,
      discount,
    };
  }, [isReservationItem, reservationData, product]);

  const regularTotals = usePriceCalculations({
    data: product,
    SelectedPriceList,
  });

  // Use reservation totals if it's a reservation item, otherwise use regular totals
  const {Discount, PricePreSession, Tax, Total, purchaseProfit, shopGift} =
    isReservationItem
      ? {
          Discount: reservationTotals.discount,
          PricePreSession: reservationTotals.basePrice,
          Tax: reservationTotals.tax,
          Total: reservationTotals.total - reservationTotals.tax,
          purchaseProfit: 0,
          shopGift: 0,
        }
      : regularTotals;

  // Get duration from reservationPattern for reservation items
  const getReservationDuration = (): string => {
    if (!isReservationItem) return '';

    const pattern = product?.reservationPattern;
    if (pattern?.reservationTag?.duration && pattern?.reservationTag?.unit) {
      const duration = pattern.reservationTag.duration;
      const unit = pattern.reservationTag.unit;

      // نمایش دقیقاً همان unit که در reservationTag هست
      if (unit === 'MINUTE') {
        return `${duration} دقیقه`;
      } else if (unit === 'HOUR') {
        return `${duration} ساعت`;
      }
      // اگر unit دیگری بود، همان را نمایش بده
      return `${duration} ${unit}`;
    }
    return '۱ ساعت';
  };

  // Get sub-product details for reservation items
  // Show all sub-products from product.subProducts, even if they're not in secondaryServices (with quantity 0)
  const subProductDetails = useMemo(() => {
    if (!isReservationItem) {
      return [];
    }

    // If product has no subProducts, don't show anything
    if (!product?.subProducts || product.subProducts.length === 0) {
      return [];
    }

    const secondaryServices = reservationData?.secondaryServices || [];

    // Create a map of existing secondary services by subProductId (not productId)
    // This is important because we use subProductId as the key in modifiedQuantities
    const existingServicesMap = new Map<number, ReservationSecondaryService>();
    secondaryServices.forEach(service => {
      if (service.subProductId) {
        existingServicesMap.set(service.subProductId, service);
      }
    });

    // Build the list: include all sub-products from product.subProducts
    // If a sub-product exists in secondaryServices, use that data
    // Otherwise, create a default entry with quantity 0
    return product.subProducts
      .map(subProduct => {
        const productId = subProduct.productId || subProduct.product?.id;

        if (!productId) {
          return null;
        }

        // Use subProduct.id to find in map (not productId)
        const existingService = existingServicesMap.get(subProduct.id);

        if (existingService) {
          // Use existing service data
          return existingService;
        } else {
          // Create default service with quantity 0
          // We need to get dates from reservationData
          const reservedDate = reservationData?.reservedDate || '';
          let startDate = reservedDate.split(' ')[0] || '';

          // Convert to Gregorian if needed
          const startYear = parseInt(startDate.split('-')[0]);
          if ((startYear >= 1300 && startYear <= 1500) || startYear > 2000) {
            try {
              const [jYear, jMonth, jDay] = startDate.split('-');
              const converted = moment
                .from(`${jYear}-${jMonth}-${jDay}`, 'fa', 'jYYYY-jMM-jDD')
                .format('YYYY-MM-DD');
              const convertedYear = parseInt(converted.split('-')[0]);
              if (convertedYear >= 1900 && convertedYear <= 2100) {
                startDate = converted;
              }
            } catch (error) {
              console.error(
                '❌ [CartServiceCard] Error converting startDate in subProductDetails:',
                startDate,
                error,
              );
            }
          }

          const duration = subProduct.product?.duration || 1;
          const endDate = startDate
            ? moment(startDate, 'YYYY-MM-DD')
                .add(duration, 'days')
                .format('YYYY-MM-DD')
            : '';

          return {
            user: profile?.id || 0,
            product: productId,
            start: startDate,
            end: endDate,
            discount: subProduct.discount || 0,
            type: subProduct.product?.type || 1,
            tax: subProduct.tax || 0,
            price: subProduct.product?.price || subProduct.amount || 0,
            quantity: 0, // Default to 0 for sub-products not in secondaryServices
            subProductId: subProduct.id,
          } as ReservationSecondaryService;
        }
      })
      .filter(Boolean) as ReservationSecondaryService[];
  }, [isReservationItem, reservationData, product?.subProducts, profile?.id]);

  // Update sub-product quantity in reservation
  const updateSubProductQuantity = (subProductId: number, delta: number) => {
    if (!isReservationItem || !reservationData || !CartId || !subProductId)
      return;

    const currentServices = reservationData.secondaryServices || [];
    const serviceIndex = currentServices.findIndex(
      s => s.subProductId === subProductId,
    );

    let updatedServices: ReservationSecondaryService[];

    if (serviceIndex === -1) {
      // Service not found in secondaryServices, need to add it
      // Find the sub-product from product.subProducts to get its details
      const subProduct = product?.subProducts?.find(
        sp => sp.id === subProductId,
      );

      if (!subProduct) {
        // Sub-product not found in product.subProducts, can't add
        return;
      }

      // Create new service entry
      const reservedDate = reservationData.reservedDate || '';
      let startDate = reservedDate.split(' ')[0] || '';

      // Convert to Gregorian if needed (check if year > 2000 indicates Jalali)
      const startYear = parseInt(startDate.split('-')[0]);
      if ((startYear >= 1300 && startYear <= 1500) || startYear > 2000) {
        try {
          const [jYear, jMonth, jDay] = startDate.split('-');
          const converted = moment
            .from(`${jYear}-${jMonth}-${jDay}`, 'fa', 'jYYYY-jMM-jDD')
            .format('YYYY-MM-DD');
          const convertedYear = parseInt(converted.split('-')[0]);
          if (convertedYear >= 1900 && convertedYear <= 2100) {
            startDate = converted;
          }
        } catch (error) {
          console.error(
            '❌ [CartServiceCard] Error converting startDate:',
            startDate,
            error,
          );
        }
      }

      const duration = subProduct.product?.duration || 1;
      const endDate = startDate
        ? moment(startDate, 'YYYY-MM-DD')
            .add(duration, 'days')
            .format('YYYY-MM-DD')
        : '';

      const newQuantity = Math.max(0, 0 + delta); // Start from 0 if not in list

      if (newQuantity === 0) {
        // Don't add if quantity is 0
        return;
      }

      const productId = subProduct.productId || subProduct.product?.id || 0;
      const newService: ReservationSecondaryService = {
        user: profile?.id || 0,
        product: productId,
        start: startDate,
        end: endDate,
        discount: subProduct.discount || 0,
        type: subProduct.product?.type || 1,
        tax: subProduct.tax || 0,
        price: subProduct.product?.price || subProduct.amount || 0,
        quantity: newQuantity,
        subProductId: subProduct.id,
      };

      updatedServices = [...currentServices, newService];
    } else {
      // Service exists, update quantity
      const currentService = currentServices[serviceIndex];
      const currentQuantity = currentService.quantity || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);

      if (newQuantity === 0) {
        // Remove service if quantity becomes 0
        updatedServices = currentServices.filter(
          (_, index) => index !== serviceIndex,
        );
      } else {
        // Update quantity
        updatedServices = [...currentServices];
        updatedServices[serviceIndex] = {
          ...currentService,
          quantity: newQuantity,
        };
      }
    }

    // Set flag to prevent sync loop
    isUpdatingFromLocalRef.current = true;

    // Update cart
    // IMPORTANT: We use CartId to ensure we only update THIS specific cart item
    // Each cart item has a unique CartId, so changes to secondaryServices
    // will only affect this specific item, not other items with the same productId
    console.log('🔄 [CartServiceCard] Updating cart item secondaryServices:', {
      cartId: CartId,
      productId: product?.id,
      reservedDate: reservationData.reservedDate,
      reservedStartTime: reservationData.reservedStartTime,
      reservedEndTime: reservationData.reservedEndTime,
      updatedServicesCount: updatedServices.length,
      updatedServices: updatedServices.map(s => ({
        subProductId: s.subProductId,
        quantity: s.quantity,
        product: s.product,
      })),
    });

    updateReservationItemData({
      cartId: CartId, // Use unique CartId to target specific item
      reservationData: {
        ...reservationData,
        secondaryServices: updatedServices,
      },
    });

    // Also update ReservationStore for sync with PreReserveBottomSheet
    // Key format: productId-date-fromTime-toTime (unique for each reservation)
    const reservedDateClean = reservationData.reservedDate.split(' ')[0];
    const storeKey = getReservationKey({
      productId: product?.id || 0,
      date: reservedDateClean,
      fromTime: reservationData.reservedStartTime,
      toTime: reservationData.reservedEndTime,
    });

    // Build modifiedQuantities from updatedServices
    // Key: subProductId, Value: quantity
    // This ensures we update the correct subProduct for this specific reservation
    const modifiedQuantities: Record<number, number> = {};
    updatedServices.forEach(service => {
      const quantity = service.quantity ?? 0;
      if (service.subProductId && quantity > 0) {
        modifiedQuantities[service.subProductId] = quantity;
      }
    });

    console.log('🔄 [CartServiceCard] Updating ReservationStore:', {
      storeKey,
      modifiedQuantities,
      updatedServices: updatedServices.map(s => ({
        subProductId: s.subProductId,
        quantity: s.quantity,
        product: s.product,
      })),
    });

    // Update ReservationStore with the specific reservation key
    // This ensures we only update THIS reservation (product + date + time), not others
    (async () => {
      try {
        const {updateReservation} = useReservationStore.getState();
        await updateReservation(storeKey, {
          modifiedQuantities,
          updatedAt: new Date().toISOString(),
        });
        console.log(
          '✅ [CartServiceCard] ReservationStore updated successfully',
        );
      } catch (error) {
        console.error(
          '⚠️ [CartServiceCard] Error updating ReservationStore:',
          error,
        );
      }
    })();
  };
  return (
    <>
      <BottomSheet
        Title={t('Confirm removal')}
        ref={RemoveItemRef}
        snapPoints={[30]}
        buttonText="لغو"
        onButtonPress={() => RemoveItemRef.current?.close()}
        deleteButtonText="حذف"
        onDeleteButtonPress={() => {
          if (isReservationItem && reservationData && product) {
            // Cancel reservation first, then remove from cart
            // This should work exactly like ReserveDetailScreen's handleDeleteReservation
            const reservedDate = reservationData.reservedDate.split(' ')[0]; // "2025-12-23"

            // Try to get dayName from ReservationStore first (more accurate)
            let dayName = 'day1'; // Default fallback
            try {
              const storeItem = convertCartItemToReservationStoreItem(data);
              if (storeItem) {
                const key = getReservationKey(storeItem);
                const {findReservationByKey} = useReservationStore.getState();
                const storeReservation = findReservationByKey(key);

                if (storeReservation && storeReservation.dayName) {
                  dayName = storeReservation.dayName;
                } else {
                  // Fallback: Calculate day name from date
                  const dateMoment = moment(reservedDate, 'YYYY-MM-DD');
                  const dayOfWeek = dateMoment.day();
                  const dayMap: Record<number, string> = {
                    1: 'day1',
                    2: 'day2',
                    3: 'day3',
                    4: 'day4',
                    5: 'day5',
                    6: 'day6',
                    0: 'day7',
                  };
                  dayName = dayMap[dayOfWeek] || 'day1';
                }
              } else {
                // Fallback: Calculate day name from date
                const dateMoment = moment(reservedDate, 'YYYY-MM-DD');
                const dayOfWeek = dateMoment.day();
                const dayMap: Record<number, string> = {
                  1: 'day1',
                  2: 'day2',
                  3: 'day3',
                  4: 'day4',
                  5: 'day5',
                  6: 'day6',
                  0: 'day7',
                };
                dayName = dayMap[dayOfWeek] || 'day1';
              }
            } catch (error) {
              console.error(
                '⚠️ [CartServiceCard] Error getting dayName from store, using fallback:',
                error,
              );
              // Fallback: Calculate day name from date
              const dateMoment = moment(reservedDate, 'YYYY-MM-DD');
              const dayOfWeek = dateMoment.day();
              const dayMap: Record<number, string> = {
                1: 'day1',
                2: 'day2',
                3: 'day3',
                4: 'day4',
                5: 'day5',
                6: 'day6',
                0: 'day7',
              };
              dayName = dayMap[dayOfWeek] || 'day1';
            }

            // Convert date format from YYYY-MM-DD to YYYY/MM/DD (API format)
            const specificDate = reservedDate.replace(/-/g, '/');

            const query: PreReserveQuery = {
              product: product.id,
              day: dayName,
              fromTime: reservationData.reservedStartTime,
              toTime: reservationData.reservedEndTime,
              gender: 'Both', // Default gender, API might handle this
              specificDate: specificDate, // Gregorian format (YYYY/MM/DD) - same as dayData.date
              isLocked: false, // false means cancel/unlock (same as ReserveDetailScreen)
            };

            preReserveMutation.mutate(query, {
              onSuccess: () => {
                // Remove from cart after successful cancellation
                // removeFromCart will also sync with ReservationStore (in CartStorage.removeCart)
                if (CartId) {
                  removeFromCart(CartId);
                }
                RemoveItemRef.current?.close();
              },
              onError: error => {
                console.error(
                  '❌ [CartServiceCard] Error canceling reservation:',
                  error,
                );
                Alert.alert('خطا', error.message || 'خطا در لغو رزرو');
                // Still remove from cart even if cancellation fails
                // (user might want to remove it anyway)
                if (CartId) {
                  removeFromCart(CartId);
                }
                RemoveItemRef.current?.close();
              },
            });
          } else {
            // For non-reservation items, just remove from cart
            if (CartId) {
              removeFromCart(CartId);
            }
            RemoveItemRef.current?.close();
          }
        }}
      />
      <View className="CardBase gap-3">
        <View className="w-full aspect-[4/3] bg-neutral-0 dark:bg-neutral-dark-0 rounded-3xl relative overflow-hidden">
          {product?.image?.name && (
            <ResponsiveImage
              customSource={{default: product?.image?.name}}
              ImageType="Media"
              resizeMode="contain"
              style={{width: '100%', height: '100%'}}
            />
          )}
        </View>

        {isGroupClassRoomItem ? (
          <>
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle2" color="base">
                {product?.title}
              </BaseText>
              <BaseButton
                noText
                onPress={() => RemoveItemRef.current?.expand()}
                type="Outline"
                color="Black"
                LeftIcon={Trash}
                redbutton
              />
            </View>

            {groupClassRoomContractor ? (
              <View>
                <ContractorInfo
                  firstName={groupClassRoomContractor.firstName}
                  lastName={groupClassRoomContractor.lastName}
                  fullName={groupClassRoomContractor.fullName}
                  imageName={groupClassRoomContractor.imageName}
                  gender={groupClassRoomContractor.gender}
                />
              </View>
            ) : null}

            {groupClassRoomScheduleRows.length > 0 ? (
              <View className="gap-1">
                {groupClassRoomScheduleRows.map((row, index) => (
                  <View
                    key={`${row.daysLabel}-${row.timeLabel}-${index}`}
                    className="flex-row items-center justify-between">
                    <BaseText type="body3" color="secondary">
                      {row.daysLabel}
                    </BaseText>
                    <BaseText type="body3" color="secondary">
                      {row.timeLabel}
                    </BaseText>
                  </View>
                ))}
              </View>
            ) : null}

            {groupClassRoomData?.waitingForGroupClass ? (
              <View className="px-3 py-2 rounded-full border border-dashed border-warning-500 items-center justify-center">
                <BaseText type="subtitle3" color="warning">
                  لیست انتظار
                </BaseText>
              </View>
            ) : null}

            <View className="border-b border-neutral-0 dark:border-neutral-dark-400/50" />
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle2" color="base">
                {product?.title}
              </BaseText>
              <BaseButton
                noText
                onPress={() => RemoveItemRef.current?.expand()}
                type="Outline"
                color="Black"
                LeftIcon={Trash}
                redbutton
              />
            </View>
            {SelectedContractor && (
              <View>
                <ContractorInfo
                  firstName={SelectedContractor?.contractor?.firstName}
                  lastName={SelectedContractor?.contractor?.lastName}
                  imageName={SelectedContractor?.contractor?.profile?.name}
                  gender={SelectedContractor?.contractor?.gender}
                />
              </View>
            )}
            <View className="flex-row items-center justify-between gap-2 border-b border-neutral-0 dark:border-neutral-dark-400/50 pb-4">
              <View className="flex-row items-center gap-4 ">
                {isReservationItem ? (
                  <BaseText type="subtitle2" color="base">
                    ۱ عدد
                  </BaseText>
                ) : (
                  <>
                    <BaseButton
                      onPress={() =>
                        CartId &&
                        updateItemQuantity({
                          cartId: CartId,
                          quantity: quantity + 1,
                        })
                      }
                      type="Tonal"
                      color="Black"
                      text="+"
                    />
                    <BaseText type="subtitle2" color="base">
                      {quantity}
                    </BaseText>
                    <BaseButton
                      type="Tonal"
                      color="Black"
                      text="-"
                      onPress={() =>
                        CartId &&
                        updateItemQuantity({
                          cartId: CartId,
                          quantity: quantity === 1 ? quantity : quantity - 1,
                        })
                      }
                    />
                  </>
                )}
              </View>
              <BaseText type="subtitle2" color="base">
                {formatNumber(
                  isReservationItem
                    ? reservationTotals.total
                    : Total + (Tax || 0),
                )}{' '}
                ﷼
              </BaseText>
            </View>
          </>
        )}

        <View className="gap-4">
          <BaseText type="subtitle2" color="secondaryPurple">
            {t('order Detail')}
          </BaseText>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('Number of sessions')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {isReservationItem
                ? '۱ جلسه'
                : data?.product?.unlimited
                ? t('unlimited')
                : `${SelectedPriceList?.min || 1} جلسه`}
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('Duration')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {isReservationItem
                ? getReservationDuration()
                : ConvertDuration(SelectedPriceList?.duration ?? 1)}
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('SingleservicePrice')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {formatNumber(PricePreSession)} ﷼
            </BaseText>
          </View>
          {Tax > 0 && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('tax')} :
              </BaseText>
              <BaseText type="subtitle3" color="base">
                {formatNumber(Tax)} ﷼
              </BaseText>
            </View>
          )}
          {product?.isCashBack && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="supportive2">
                {t('shopGift')} :
              </BaseText>
              <BaseText type="subtitle3" color="supportive2">
                {formatNumber(shopGift)} ﷼
              </BaseText>
            </View>
          )}
          {purchaseProfit > 0 && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('Purchase profit')} :
              </BaseText>
              <BaseText type="subtitle3" color="success">
                {formatNumber(purchaseProfit ?? 0)} ﷼
              </BaseText>
            </View>
          )}

          {/* Reservation-specific details */}
          {isReservationItem && reservationData && (
            <>
              <View className="flex-row items-center justify-between">
                <BaseText type="subtitle3" color="secondary">
                  تاریخ رزرو:
                </BaseText>
                <BaseText type="subtitle3" color="base">
                  {(() => {
                    // reservedDate is in Gregorian format (e.g., "2025-12-23 00:00" or "2025/12/23")
                    // Convert to Jalali for display
                    let dateStr = reservationData.reservedDate.split(' ')[0]; // Get date part only

                    // Normalize date format: convert "2025/12/23" to "2025-12-23"
                    if (dateStr.includes('/')) {
                      dateStr = dateStr.replace(/\//g, '-');
                    }

                    try {
                      // Parse as Gregorian date and convert to Jalali for display
                      const gregorianMoment = moment(dateStr, 'YYYY-MM-DD');

                      if (!gregorianMoment.isValid()) {
                        console.error(
                          '❌ [CartServiceCard] Invalid date:',
                          dateStr,
                        );
                        return dateStr; // Return as-is if invalid
                      }

                      // Convert to Jalali
                      const jalaliMoment = gregorianMoment.locale('fa');
                      const formatted = jalaliMoment.format('jYYYY/jMM/jDD');

                      return formatted;
                    } catch (error) {
                      console.error(
                        '❌ [CartServiceCard] Date conversion error:',
                        error,
                      );
                      // Fallback: return original date
                      return dateStr;
                    }
                  })()}
                </BaseText>
              </View>
              <View className="flex-row items-center justify-between">
                <BaseText type="subtitle3" color="secondary">
                  زمان:
                </BaseText>
                <BaseText type="subtitle3" color="base">
                  {reservationData.reservedStartTime} -{' '}
                  {reservationData.reservedEndTime}
                </BaseText>
              </View>
            </>
          )}

          {/* Sub-products for reservation items */}
          {isReservationItem &&
            subProductDetails &&
            subProductDetails.length > 0 && (
              <View className="mt-2">
                <BaseText type="subtitle3" color="secondary" className="mb-2">
                  خدمات اضافی:
                </BaseText>
                <View className="gap-2">
                  {subProductDetails.map((service, index) => {
                    // Fetch product details for each sub-product
                    const SubProductCard = ({
                      service,
                    }: {
                      service: ReservationSecondaryService;
                    }) => {
                      const {data: subProductData} = UseGetProductByID(
                        service.product,
                      );

                      return (
                        <View
                          key={`${service.product}-${index}`}
                          className="BaseServiceCard p-3 gap-2">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <BaseText type="subtitle3" color="base">
                                {subProductData?.title ||
                                  `خدمت ${service.product}`}
                              </BaseText>
                              {service.price && service.price > 0 && (
                                <BaseText
                                  type="badge"
                                  color="secondary"
                                  className="text-start">
                                  قیمت هر واحد {formatNumber(service.price)}{' '}
                                  تومان میباشد.
                                </BaseText>
                              )}
                              {/* <BaseText type="caption" color="secondary">
                                {formatNumber(
                                  (service.price || 0) *
                                    (service.quantity || 0),
                                )}{' '}
                                ﷼
                              </BaseText> */}
                            </View>
                            <View className="flex-row items-center gap-2">
                              {/* <TouchableOpacity
                                onPress={() =>
                                  updateSubProductQuantity(service.subProductId || 0, -1)
                                }
                                disabled={(service.quantity || 0) === 0}
                                className={`w-8 h-8 rounded-xl items-center justify-center ${
                                  (service.quantity || 0) === 0
                                    ? 'bg-neutral-200 dark:bg-neutral-dark-300 opacity-50'
                                    : 'bg-[#E4E4E8]'
                                }`}>
                                <BaseText
                                  type="body2"
                                  color={
                                    (service.quantity || 0) === 0
                                      ? 'secondary'
                                      : 'base'
                                  }>
                                  -
                                </BaseText>
                              </TouchableOpacity> */}

                              <BaseButton
                                type="Outline"
                                color="Black"
                                disabled={(service.quantity || 0) === 0}
                                text="-"
                                redbutton={service.quantity === 1}
                                noText={service.quantity === 1}
                                size="Medium"
                                LeftIcon={
                                  service.quantity === 1 ? Trash : undefined
                                }
                                onPress={() =>
                                  updateSubProductQuantity(
                                    service.subProductId || 0,
                                    -1,
                                  )
                                }
                                style={{width: 36}}
                              />

                              <BaseText
                                type="body2"
                                color="base"
                                className="w-6 text-center">
                                {service.quantity || 0}
                              </BaseText>

                              <BaseButton
                                size="Medium"
                                onPress={() =>
                                  updateSubProductQuantity(
                                    service.subProductId || 0,
                                    1,
                                  )
                                }
                                type="Outline"
                                color="Black"
                                text="+"
                                style={{width: 36}}
                              />
                            </View>
                          </View>
                        </View>
                      );
                    };

                    return <SubProductCard key={index} service={service} />;
                  })}
                </View>
              </View>
            )}

          {/* Expiration Time Info */}
          {isTimedItem ? (
            <CartExpiryNotice
              mode={isGroupClassRoomItem ? 'groupClass' : 'reservation'}
              remainingMinutes={timedRemainingMinutes}
            />
          ) : (
            <CartExpiryNotice
              mode="default"
              remainingMinutes={defaultRemainingMinutes}
            />
          )}
        </View>
      </View>
    </>
  );
};

export default CartServiceCard;
