import React, {useMemo} from 'react';
import {Image, View} from 'react-native';
import {Content} from '../../../services/models/response/UseResrService';
import BaseText from '../../BaseText';
import {useTranslation} from 'react-i18next';
import {useBase64ImageFromMedia} from '../../../utils/hooks/useBase64Image';
import moment from 'jalali-moment';
import {
  Calendar1,
  Clock,
  AddSquare,
  Calendar,
  Calendar2,
  RepeatCircle,
} from 'iconsax-react-native';
import {useTheme} from '../../../utils/ThemeContext';
import BaseButton from '../../Button/BaseButton';

type ShopReservationCardProps = {
  data: Content;
};

const ShopReservationCard: React.FC<ShopReservationCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Reservation'});
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const {data: ImageSrc, isLoading} = useBase64ImageFromMedia(
    data?.product?.image?.name || data?.image?.name,
    'Media',
  );

  // Format reserved date from reservedDate field (format: "2025-12-22 00:00")
  const reservedDate = useMemo(() => {
    const reservedDateValue = (data as any)?.reservedDate;
    if (reservedDateValue) {
      return (
        moment(reservedDateValue, 'YYYY-MM-DD HH:mm')
          // @ts-ignore
          .local('fa')
          .format('jYYYY/jMM/jDD')
      );
    }
    return null;
  }, [(data as any)?.reservedDate]);

  // Reserved times (already in HH:mm format)
  const reservedStartTime = data?.reservedStartTime || '';
  const reservedEndTime = data?.reservedEndTime || '';

  // Calculate duration in hours
  const duration = useMemo(() => {
    if (reservedStartTime && reservedEndTime) {
      const start = moment(reservedStartTime, 'HH:mm');
      const end = moment(reservedEndTime, 'HH:mm');
      const diffHours = end.diff(start, 'hours', true);
      if (diffHours > 0) {
        return Math.round(diffHours * 10) / 10; // Round to 1 decimal
      }
    }
    return null;
  }, [reservedStartTime, reservedEndTime]);

  // Format usage date range (start and end)
  const usageStartDate = data?.start
    ? moment(data.start)
        // @ts-ignore
        .local('fa')
        .format('jYYYY/jMM/jDD')
    : null;
  const usageEndDate = data?.end
    ? moment(data.end)
        // @ts-ignore
        .local('fa')
        .format('jYYYY/jMM/jDD')
    : null;

  // Get subProducts from product
  const subProducts = data?.product?.subProducts || [];

  // Format subProducts text
  const subProductsText = useMemo(() => {
    if (!subProducts || subProducts.length === 0) return null;

    const items = subProducts.map(sub => {
      const quantity = sub.quantity || 1;
      const title = sub.product?.title || '';
      return `${quantity} ${title}`;
    });

    return items.join('، ');
  }, [subProducts]);

  return (
    <View className="BaseServiceCard">
      {/* Content */}
      <View className=" gap-3">
        {/* Title */}
        <View className="flex-row items-center justify-between pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50 ">
          <View className="flex-row items-center gap-2">
            <View className="w-[44px] h-[44px] bg-supportive2-100 dark:bg-supportive2-dark-100 rounded-full justify-center items-center">
              <Calendar
                size={24}
                color={isDark ? '#b28bc9' : '#b28bc9'}
                variant="Bold"
              />
            </View>
            <BaseText type="title4" color="base">
              {data.title}
            </BaseText>
          </View>
        </View>

        {/* Reservation Details - Two Column Layout */}
        <View className="gap-3">
          {/* Row 1: Date (Right) */}
          <View className="flex-row justify-between items-center">
            {reservedDate && (
              <View className="flex-row  items-center gap-2">
                <Calendar2
                  size={20}
                  color={isDark ? '#FFFFFF' : '#AAABAD'}
                  variant="Bold"
                />
                <BaseText type="body3" color="secondary">
                  {reservedDate}
                </BaseText>
              </View>
            )}
            {duration && (
              <BaseText type="body3" color="secondary">
                {duration} ساعت
              </BaseText>
            )}
          </View>

          {/* Row 2: Start Time (Right) and Duration (Left) */}
          <View className="flex-row justify-between items-center">
            {/* Duration - Left */}

            {/* Start Time - Right */}
            {reservedStartTime && (
              <View className="flex-row items-center gap-2">
                <Clock
                  size={20}
                  color={isDark ? '#FFFFFF' : '#AAABAD'}
                  variant="Bold"
                />
                <BaseText type="body3" color="secondary">
                  شروع: {reservedStartTime}
                </BaseText>
              </View>
            )}
            {/* Row 3: End Time (Left) */}
            {reservedEndTime && (
              <View className="flex-row items-center gap-2">
                <BaseText type="body3" color="secondary">
                  پایان: {reservedEndTime}
                </BaseText>
              </View>
            )}
          </View>

          {/* Row 4: SubProducts (Right) */}
          {subProductsText && (
            <View className="flex-row justify-end items-center gap-2">
              <AddSquare
                size={20}
                color={isDark ? '#FFFFFF' : '#AAABAD'}
                variant="Bold"
              />
              <BaseText type="body3" color="secondary">
                {subProductsText}
              </BaseText>
            </View>
          )}

          <View className="flex-row items-center w-full gap-2 mt-2">
            <View className="flex-1">
              <BaseButton
                type="Fill"
                color="Black"
                size="Large"
                text="تمدید رزرو"
                rounded
                LeftIcon={RepeatCircle}
                LeftIconVariant="Bold"
              />
            </View>
            <View className="flex-1">
              <BaseButton
                type="Outline"
                color="Error"
                redbutton
                size="Large"
                rounded
                text="لغو رزرو"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShopReservationCard;
