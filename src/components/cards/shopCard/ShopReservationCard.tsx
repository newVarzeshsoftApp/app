import React, {useMemo, useRef, useCallback} from 'react';
import {Image, View, Alert} from 'react-native';
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
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';
import {useCancelReservation} from '../../../utils/hooks/Reservation/useCancelReservation';
import {useQueryClient} from '@tanstack/react-query';
import {useGetReservationTags} from '../../../utils/hooks/Reservation/useGetReservationTags';
import {navigate} from '../../../navigation/navigationRef';
import StatusDot from '../../StatusDot';
import CancelReservationConfirmSheet from '../../Reservation/CancelReservationConfirmSheet';

type ShopReservationCardProps = {
  data: Content;
};

const ShopReservationCard: React.FC<ShopReservationCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Reservation'});
  const {theme} = useTheme();
  const isDark = theme === 'dark';
  const queryClient = useQueryClient();
  const cancelBottomSheetRef = useRef<BottomSheetMethods>(null);
  const cancelReservationMutation = useCancelReservation();
  const {data: tagsData, isLoading: tagsLoading} = useGetReservationTags();
  const {data: ImageSrc, isLoading} = useBase64ImageFromMedia(
    data?.product?.image?.name || data?.image?.name,
    'Media',
  );

  const orderId =
    data?.saleOrderId ?? (data?.saleOrder?.id ? data.saleOrder.id : undefined);

  const reservationPenaltyRaw =
    (data as unknown as {reservationPenalty?: unknown})?.reservationPenalty ??
    (data?.product as unknown as {reservationPenalty?: unknown})
      ?.reservationPenalty;

  const openCancelConfirm = useCallback(() => {
    if (!orderId) {
      Alert.alert('خطا', 'شناسه رزرو یافت نشد');
      return;
    }
    cancelBottomSheetRef.current?.expand();
  }, [orderId]);

  const closeCancelConfirm = useCallback(() => {
    cancelBottomSheetRef.current?.close();
  }, []);

  const handleConfirmCancel = useCallback(() => {
    if (!orderId) return;
    cancelReservationMutation.mutate(
      {id: orderId},
      {
        onSuccess: () => {
          closeCancelConfirm();
          queryClient.invalidateQueries({queryKey: ['UserSaleItem']});
        },
        onError: err => {
          Alert.alert('خطا', err.message || 'خطا در لغو رزرو');
        },
      },
    );
  }, [cancelReservationMutation, closeCancelConfirm, orderId, queryClient]);

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

  const derivedTagId = useMemo(() => {
    if (!tagsData?.content || tagsData.content.length === 0) return undefined;
    if (!reservedStartTime || !reservedEndTime) return undefined;

    const start = moment(reservedStartTime, 'HH:mm');
    const end = moment(reservedEndTime, 'HH:mm');
    const diffMinutes = end.diff(start, 'minutes');
    if (!Number.isFinite(diffMinutes) || diffMinutes <= 0) return undefined;

    // Prefer exact HOUR match (e.g. 60 -> duration "1" unit "HOUR")
    const hours = diffMinutes / 60;
    const minuteTag = tagsData.content.find(
      tag => tag.unit === 'MINUTE' && Number(tag.duration) === diffMinutes,
    );
    if (minuteTag) return minuteTag.id;

    if (Number.isInteger(hours)) {
      const hourTag = tagsData.content.find(
        tag => tag.unit === 'HOUR' && Number(tag.duration) === hours,
      );
      if (hourTag) return hourTag.id;
    }

    return undefined;
  }, [reservedEndTime, reservedStartTime, tagsData?.content]);
  const isExpired = moment().isAfter(moment.utc(data?.end));
  const Useable = !isExpired && data?.usable;

  const handleExtendReservation = useCallback(() => {
    if (!derivedTagId) {
      Alert.alert(
        'خطا',
        'برای تمدید رزرو، مدت رزرو/تگ رزرو پیدا نشد. لطفاً از بخش رزرواسیون (فیلترها) مجدداً انتخاب کنید.',
      );
      return;
    }

    // ReserveDetail expects dates like YYYY/MM/DD (same format used in ReserveScreen)
    const startDate = data?.start
      ? moment(data.start).format('YYYY/MM/DD')
      : (data as any)?.reservedDate
      ? moment((data as any).reservedDate, 'YYYY-MM-DD HH:mm').format(
          'YYYY/MM/DD',
        )
      : moment().format('YYYY/MM/DD');

    const endDate = data?.end
      ? moment(data.end).format('YYYY/MM/DD')
      : undefined;

    const startTime = reservedStartTime || undefined;
    const endTime = reservedEndTime || undefined;

    // `reserveDetail` lives inside `ReserveStackNavigator`, which itself is the `reserve` tab.
    // So from outside of that stack, we must navigate to:
    // Root -> HomeNavigator -> reserve (tab) -> reserveDetail (stack)
    // NOTE: NavigationTypes currently types `HomeStackParamList.reserve` as `undefined`,
    // but in runtime it's a nested stack (ReserveStackNavigator). So we cast here to
    // keep correct runtime navigation while we keep TS satisfied.
    navigate('Root', {
      screen: 'HomeNavigator',
      params: {
        screen: 'reserve',
        params: {
          screen: 'reserveDetail',
          params: {
            tagId: derivedTagId,
            start: startDate,
            end: endDate,
            startTime,
            endTime,
          },
        },
      },
    } as any);
  }, [data, derivedTagId, reservedEndTime, reservedStartTime]);

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
    <>
      <CancelReservationConfirmSheet
        bottomSheetRef={cancelBottomSheetRef}
        reservationPenalty={reservationPenaltyRaw}
        isLoading={cancelReservationMutation.isPending}
        confirmDisabled={!orderId}
        onCancel={closeCancelConfirm}
        onConfirm={handleConfirmCancel}
      />

      <View className="BaseServiceCard">
        {/* Content */}
        <View className=" gap-3">
          {/* Title */}
          <View className="flex-row items-center justify-between pb-3 border-b border-neutral-0 dark:border-neutral-dark-400/50 ">
            <View className="flex-1 items-start gap-2">
              <View className="w-full h-[185px] bg-neutral-0 dark:bg-neutral-dark-0 rounded-3xl overflow-hidden">
                <Image
                  style={{width: '100%', height: '100%'}}
                  source={{
                    uri: ImageSrc,
                  }}
                />
              </View>
              <View className="flex-row gap-2 items-center">
                <StatusDot isActive={!!Useable} />
                <BaseText type="title4">{data?.title}</BaseText>
              </View>
            </View>
          </View>

          {/* Reservation Details - Two Column Layout */}
          <View className="gap-3 pt-1 ">
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

            {/* Only show buttons if reservation is active and usable */}
            {Useable && (
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
                    onPress={handleExtendReservation}
                    disabled={tagsLoading || !derivedTagId}
                    isLoading={tagsLoading}
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
                    onPress={openCancelConfirm}
                    disabled={!orderId}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

export default ShopReservationCard;
