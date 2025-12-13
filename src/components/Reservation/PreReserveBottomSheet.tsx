import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import {
  Calendar,
  Clock,
  Trash,
  Warning2,
  ArrowDown2,
  ArrowUp2,
} from 'iconsax-react-native';
import moment from 'jalali-moment';
import BottomSheet, {BottomSheetMethods} from '../BottomSheet/BottomSheet';
import BaseText from '../BaseText';
import BaseButton from '../Button/BaseButton';
import {ServiceEntryDto} from '../../services/models/response/ReservationResService';
import {formatNumber} from '../../utils/helpers/helpers';
import {useTheme} from '../../utils/ThemeContext';
import {routes} from '../../routes/routes';

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
  onDeleteReservation?: () => void;
}

export interface PreReserveBottomSheetRef {
  open: (data: {
    item: ServiceEntryDto;
    date: string;
    fromTime: string;
    toTime: string;
    dayName: string;
  }) => void;
  close: () => void;
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
>(({onAddNewReservation, onCompletePayment, onDeleteReservation}, ref) => {
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const {theme} = useTheme();
  const isDark = theme === 'dark';

  // State for the data
  const [item, setItem] = useState<ServiceEntryDto | null>(null);
  const [date, setDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [dayName, setDayName] = useState('');

  // State for subProducts (stored from item)
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);

  // State for modified quantities (key: subProduct.id, value: new quantity)
  // If not in this map, use the original quantity from subProduct
  const [modifiedQuantities, setModifiedQuantities] = useState<
    Record<number, number>
  >({});

  // State for penalty accordion
  const [penaltyExpanded, setPenaltyExpanded] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    open: data => {
      setItem(data.item);
      setDate(data.date);
      setFromTime(data.fromTime);
      setToTime(data.toTime);
      setDayName(data.dayName);
      // Store subProducts from item
      setSubProducts((data.item.subProducts as SubProduct[]) || []);
      // Reset modified quantities when opening with new item
      setModifiedQuantities({});
      bottomSheetRef.current?.expand();
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
  }));

  // Update quantity for subProduct
  const updateQuantity = (id: number, delta: number) => {
    setModifiedQuantities(prev => {
      // Find the subProduct to get its original quantity
      const findSubProduct = (
        products: SubProduct[],
      ): SubProduct | undefined => {
        for (const product of products) {
          if (product.id === id) return product;
          if (product.subProducts) {
            const found = findSubProduct(product.subProducts);
            if (found) return found;
          }
        }
        return undefined;
      };

      const subProduct = findSubProduct(subProducts);
      const originalQuantity = subProduct?.quantity || 0;
      const currentQuantity = prev[id] ?? originalQuantity;
      const newQuantity = Math.max(0, currentQuantity + delta);

      // If new quantity equals original, remove from modified
      if (newQuantity === originalQuantity) {
        const {[id]: _, ...rest} = prev;
        return rest;
      }

      return {...prev, [id]: newQuantity};
    });
  };

  // Get quantity for a subProduct (uses modified or original)
  const getQuantity = (id: number, originalQuantity: number): number => {
    return modifiedQuantities[id] ?? originalQuantity;
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
                    subProduct.subProducts && subProduct.subProducts.length > 0;

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
                          <View className="flex-row items-end justify-end gap-2">
                            <TouchableOpacity
                              onPress={() => updateQuantity(subProduct.id, -1)}
                              disabled={quantity === 0}
                              className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center"
                              style={{opacity: quantity === 0 ? 0.3 : 1}}>
                              <BaseText type="body2" color="base">
                                -
                              </BaseText>
                            </TouchableOpacity>
                            <BaseText
                              type="body2"
                              color="base"
                              className="w-6 text-center">
                              {quantity}
                            </BaseText>
                            <TouchableOpacity
                              onPress={() => updateQuantity(subProduct.id, 1)}
                              className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                              <BaseText type="body2" color="base">
                                +
                              </BaseText>
                            </TouchableOpacity>
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
                                    <TouchableOpacity
                                      onPress={() =>
                                        updateQuantity(nested.id, -1)
                                      }
                                      disabled={nestedQuantity === 0}
                                      className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center"
                                      style={{
                                        opacity: nestedQuantity === 0 ? 0.3 : 1,
                                      }}>
                                      <BaseText type="body2" color="base">
                                        -
                                      </BaseText>
                                    </TouchableOpacity>
                                    <BaseText
                                      type="body2"
                                      color="base"
                                      className="w-6 text-center">
                                      {nestedQuantity}
                                    </BaseText>
                                    <TouchableOpacity
                                      onPress={() =>
                                        updateQuantity(nested.id, 1)
                                      }
                                      className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                                      <BaseText type="body2" color="base">
                                        +
                                      </BaseText>
                                    </TouchableOpacity>
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
                            formatPenaltyItems(item.reservationPenalty).length -
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
            <View className="flex-row gap-3">
              {/* Complete Payment */}
              <BaseButton
                text="تکمیل رزرو پرداخت"
                type="Fill"
                color="Black"
                rounded
                size="Large"
                Extraclass="flex-1"
                onPress={onCompletePayment}
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
              onPress={onDeleteReservation}
            />
          </View>
        </View>
      </View>
    </BottomSheet>
  );
});

export default PreReserveBottomSheet;
