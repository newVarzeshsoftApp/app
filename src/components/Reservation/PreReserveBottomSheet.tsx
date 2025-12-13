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

// Props for additional service item
interface AdditionalService {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

// Penalty item
interface PenaltyItem {
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

// Default penalty items based on design
const DEFAULT_PENALTIES: PenaltyItem[] = [
  {timeLabel: 'تا ۱ ساعت مانده', percentage: 100},
  {timeLabel: 'تا ۳ ساعت مانده', percentage: 90},
  {timeLabel: 'تا ۸ ساعت مانده', percentage: 70},
  {timeLabel: '۱ روز قبل', percentage: 50},
  {timeLabel: '۴ روز قبل', percentage: 30},
  {timeLabel: '۱ هفته قبل', percentage: 20},
  {timeLabel: '۱ ماه قبل', percentage: 5},
];

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

  // State for additional services quantities
  const [additionalServices, setAdditionalServices] = useState<
    AdditionalService[]
  >([
    {id: 1, title: 'راکت تنیس', price: 500000, quantity: 2},
    {id: 2, title: 'توپ', price: 100000, quantity: 1},
    {id: 3, title: 'کفش تنیس', price: 2000000, quantity: 0},
  ]);

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
      bottomSheetRef.current?.expand();
    },
    close: () => {
      bottomSheetRef.current?.close();
    },
  }));

  // Update quantity for additional service
  const updateQuantity = (id: number, delta: number) => {
    setAdditionalServices(prev =>
      prev.map(service =>
        service.id === id
          ? {...service, quantity: Math.max(0, service.quantity + delta)}
          : service,
      ),
    );
  };

  // Calculate totals
  const reservePrice = item?.reservePrice || item?.price || 1000000;
  const discount = 200000;
  const gift = 15000000;
  const vat = 400000;
  const additionalTotal = additionalServices.reduce(
    (sum, s) => sum + s.price * s.quantity,
    0,
  );
  const totalPrice = reservePrice - discount + vat + additionalTotal;

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
      snapPoints={[85]}
      Title="جزئیات سفارش"
      scrollView>
      <View className="">
        <View className="gap-4 pb-6">
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

          {/* Additional Services Section */}
          <View>
            <BaseText type="body1" color="base" className="mb-4">
              خدمات اضافی
            </BaseText>

            <View className="BaseServiceCard gap-3">
              {additionalServices.map(service => (
                <View key={service.id} className="gap-1">
                  <View className="flex-row items-center justify-between ">
                    {/* Service Info */}
                    <View className="flex-1">
                      <BaseText type="subtitle2" color="secondary">
                        {service.title}:
                      </BaseText>
                    </View>
                    {/* Quantity Controls */}
                    <View className="gap-1">
                      <View className="flex-row items-end justify-end gap-2">
                        <TouchableOpacity
                          onPress={() => updateQuantity(service.id, -1)}
                          disabled={service.quantity === 0}
                          className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center"
                          style={{opacity: service.quantity === 0 ? 0.3 : 1}}>
                          <BaseText type="body2" color="base">
                            -
                          </BaseText>
                        </TouchableOpacity>
                        <BaseText
                          type="body2"
                          color="base"
                          className="w-6 text-center">
                          {service.quantity}
                        </BaseText>
                        <TouchableOpacity
                          onPress={() => updateQuantity(service.id, 1)}
                          className="w-8 h-8 rounded-xl bg-[#E4E4E8] items-center justify-center">
                          <BaseText type="body2" color="base">
                            +
                          </BaseText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <BaseText
                    type="badge"
                    color="secondary"
                    className="text-end ">
                    قیمت هر واحد {formatNumber(service.price)} تومان میباشد.
                  </BaseText>
                </View>
              ))}
            </View>
          </View>

          {/* Total Section */}
          <View>
            <BaseText type="body1" color="base" className=" mb-4">
              جمع کل
            </BaseText>

            <View className="BaseServiceCard gap-4">
              {/* Reserve Price */}
              <View className="flex-row justify-between">
                <BaseText type="subtitle2" color="secondary">
                  قیمت رزرو
                </BaseText>
                <BaseText type="subtitle2" color="base">
                  {formatNumber(reservePrice)} ریال
                </BaseText>
              </View>

              {/* Discount */}
              <View className="flex-row justify-between">
                <BaseText type="subtitle2" color="secondary">
                  تخفیف
                </BaseText>
                <BaseText type="subtitle2" style={{color: '#E53935'}}>
                  {formatNumber(discount)} ریال
                </BaseText>
              </View>

              {/* Gift */}
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

              {/* VAT */}
              <View className="flex-row justify-between">
                <BaseText type="subtitle2" style={{color: '#4CAF50'}}>
                  ارزش افزوده
                </BaseText>
                <BaseText type="subtitle2" style={{color: '#4CAF50'}}>
                  {formatNumber(vat)} ریال
                </BaseText>
              </View>

              {/* Divider */}
              <View
                className="border-t border-dashed my-2"
                style={{borderColor: isDark ? '#3A3D42' : '#D4D5D6'}}
              />

              {/* Total */}
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

          {/* Cancellation Penalty Accordion */}
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
                {DEFAULT_PENALTIES.map((penalty, index) => (
                  <View
                    key={index}
                    className="flex-row justify-between py-2 border-b"
                    style={{
                      borderColor: isDark ? '#3A3D42' : '#E8E8E8',
                      borderBottomWidth:
                        index === DEFAULT_PENALTIES.length - 1 ? 0 : 1,
                    }}>
                    <BaseText type="body3" color="base">
                      %{penalty.percentage}
                    </BaseText>
                    <BaseText type="body3" color="secondary">
                      {penalty.timeLabel}
                    </BaseText>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

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
