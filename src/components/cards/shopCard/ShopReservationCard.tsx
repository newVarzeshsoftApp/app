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

  const handleConfirmCancel = useCallback(
    (amount: number | undefined) => {
      if (!orderId) return;
      // Only include amount if it's defined and > 0
      const mutationPayload: {id: number; amount?: number} = {id: orderId};
      if (amount !== undefined && amount > 0) {
        mutationPayload.amount = amount;
      }
      cancelReservationMutation.mutate(
        mutationPayload as any, // Type assertion needed because CancelReservationDto has optional amount
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
    },
    [cancelReservationMutation, closeCancelConfirm, orderId, queryClient],
  );

  // Reserved date value (raw, for penalty calculation)
  const reservedDateRaw = (data as any)?.reservedDate;

  // Format reserved date from reservedDate field (format: "2025-12-22 00:00")
  const reservedDate = useMemo(() => {
    if (reservedDateRaw) {
      return (
        moment(reservedDateRaw, 'YYYY-MM-DD HH:mm')
          // @ts-ignore
          .local('fa')
          .format('jYYYY/jMM/jDD')
      );
    }
    return null;
  }, [reservedDateRaw]);

  // Total amount for penalty calculation
  const totalAmount = useMemo(() => {
    return data?.saleOrder?.totalAmount ?? data?.amount ?? 0;
  }, [data?.saleOrder?.totalAmount, data?.amount]);

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

    // Calculate endDate: add 7 days to current end date (or startDate if endDate doesn't exist)
    const endDate = data?.end
      ? moment(data.end).add(7, 'days').format('YYYY/MM/DD')
      : startDate
      ? moment(startDate, 'YYYY/MM/DD').add(7, 'days').format('YYYY/MM/DD')
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

  // Format subProducts text from saleOrder.subProductOrders
  const subProductsText = useMemo(() => {
    // Type assertion: subProductOrders exists in runtime but not in SaleOrder type
    const saleOrder = data?.saleOrder as any;
    const subProductOrders = saleOrder?.subProductOrders || [];

    if (!subProductOrders || subProductOrders.length === 0) return null;

    // Extract meta from each subProductOrder and join them
    const items = subProductOrders
      .map((order: any) => order?.meta)
      .filter((meta: string | undefined) => meta && meta.trim() !== ''); // Filter out empty metas

    if (items.length === 0) return null;

    return items.join('، ');
  }, [data?.saleOrder]);

  return (
    <>
      <CancelReservationConfirmSheet
        bottomSheetRef={cancelBottomSheetRef}
        reservationPenalty={reservationPenaltyRaw}
        reservedDate={reservedDateRaw}
        reservedStartTime={reservedStartTime}
        totalAmount={totalAmount}
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
              <View className="flex-row justify-start items-center gap-2">
                <AddSquare
                  size={20}
                  color={isDark ? '#FFFFFF' : '#AAABAD'}
                  variant="Bold"
                />
                <BaseText
                  type="body3"
                  color="secondary"
                  className="max-w-[250px] line-clamp-1">
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
