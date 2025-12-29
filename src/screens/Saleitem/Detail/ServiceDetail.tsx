import React, {useCallback, useLayoutEffect, useMemo, useRef} from 'react';
import {ActivityIndicator, Dimensions, Image, View} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {Content} from '../../../services/models/response/UseResrService';
import BaseText from '../../../components/BaseText';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';
import {useTranslation} from 'react-i18next';
import moment from 'jalali-moment';
import BaseButton from '../../../components/Button/BaseButton';
import {AddSquare, Calendar2, Clock, RepeatCircle} from 'iconsax-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../../utils/ThemeContext';
import {useGetUserSessionByID} from '../../../utils/hooks/User/useGetUserSessionByID';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SaleItemStackParamList} from '../../../utils/types/NavigationTypes';
import NavigationHeader from '../../../components/header/NavigationHeader';
import BottomSheet, {
  BottomSheetMethods,
} from '../../../components/BottomSheet/BottomSheet';
import Badge from '../../../components/Badge/Badge';
import ContractorInfo from '../../../components/ContractorInfo/ContractorInfo';
import {useCart} from '../../../utils/hooks/Carthook';
import {navigate} from '../../../navigation/navigationRef';
import {useBase64ImageFromMedia} from '../../../utils/hooks/useBase64Image';
import {useGetReservationTags} from '../../../utils/hooks/Reservation/useGetReservationTags';
import {useCancelReservation} from '../../../utils/hooks/Reservation/useCancelReservation';
import {useQueryClient} from '@tanstack/react-query';
import momentJalali from 'jalali-moment';
import CancelReservationConfirmSheet from '../../../components/Reservation/CancelReservationConfirmSheet';
type ServiceDetailNavigationProp = NativeStackNavigationProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
type ServiceDetailRouteProp = RouteProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
interface ServiceDetailProps {
  data: Content;
  navigation: ServiceDetailNavigationProp;
  route: ServiceDetailRouteProp;
}
const ServiceDetail: React.FC<ServiceDetailProps> = ({
  data,
  navigation,
  route,
}) => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const bottomsheetRef = useRef<BottomSheetMethods>(null);
  const cancelSheetRef = useRef<BottomSheetMethods>(null);
  const {height} = Dimensions.get('screen');
  const {t} = useTranslation('translation', {keyPrefix: 'Detail'});
  const {addToCart} = useCart();
  const queryClient = useQueryClient();
  const cancelReservationMutation = useCancelReservation();
  const {data: tagsData, isLoading: tagsLoading} = useGetReservationTags();
  const imageName = data?.product?.image?.name;
  const {data: base64Image, isLoading: imageLoading} = useBase64ImageFromMedia(
    imageName,
    'Media',
  );
  const {data: UserSession, isLoading: UserSessionisLoading} =
    useGetUserSessionByID(data.id);
  // Use shared value instead of scroll offset
  const scrollY = useSharedValue(0);
  const IMageHight = 285;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          scrollY={scrollY}
          range={[0, IMageHight / 1.5]}
          navigation={navigation}
          title={route.params?.title}
        />
      ),
    });
  }, [navigation, scrollY, IMageHight, t]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const {theme} = useTheme();
  const BaseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
  const BaseHighlight =
    theme === 'dark' ? 'rgba(42, 45, 51, 1)' : 'rgba(255,255,255,1)';

  const isFromReservation = route.params?.fromReservation === true;
  const isExpired = momentJalali().isAfter(momentJalali.utc(data?.end));
  const isActiveReservation = isFromReservation && !isExpired && !!data?.usable;

  // Reserved date value (raw, for penalty calculation)
  const reservedDateRaw = (data as any)?.reservedDate;

  const reservedDate = useMemo(() => {
    if (reservedDateRaw) {
      return (
        momentJalali(reservedDateRaw, 'YYYY-MM-DD HH:mm')
          // @ts-ignore
          .local('fa')
          .format('jYYYY/jMM/jDD')
      );
    }
    return null;
  }, [reservedDateRaw]);

  const reservedStartTime = data?.reservedStartTime || '';
  const reservedEndTime = data?.reservedEndTime || '';

  // Total amount for penalty calculation
  const totalAmount = useMemo(() => {
    return data?.saleOrder?.totalAmount ?? data?.amount ?? 0;
  }, [data?.saleOrder?.totalAmount, data?.amount]);

  const duration = useMemo(() => {
    if (reservedStartTime && reservedEndTime) {
      const start = momentJalali(reservedStartTime, 'HH:mm');
      const end = momentJalali(reservedEndTime, 'HH:mm');
      const diffHours = end.diff(start, 'hours', true);
      if (diffHours > 0) {
        return Math.round(diffHours * 10) / 10;
      }
    }
    return null;
  }, [reservedEndTime, reservedStartTime]);

  const subProductsText = useMemo(() => {
    const subProducts = data?.product?.subProducts || [];
    if (!subProducts || subProducts.length === 0) return null;
    const items = subProducts.map(sub => {
      const quantity = sub.quantity || 1;
      const title = sub.product?.title || '';
      return `${quantity} ${title}`;
    });
    return items.join('، ');
  }, [data?.product?.subProducts]);

  const orderId =
    data?.saleOrderId ?? (data?.saleOrder?.id ? data.saleOrder.id : undefined);

  const reservationPenaltyRaw =
    (data as unknown as {reservationPenalty?: unknown})?.reservationPenalty ??
    (data?.product as unknown as {reservationPenalty?: unknown})
      ?.reservationPenalty;

  const derivedTagId = useMemo(() => {
    if (!tagsData?.content || tagsData.content.length === 0) return undefined;
    if (!data?.reservedStartTime || !data?.reservedEndTime) return undefined;

    const start = momentJalali(data.reservedStartTime, 'HH:mm');
    const end = momentJalali(data.reservedEndTime, 'HH:mm');
    const diffMinutes = end.diff(start, 'minutes');
    if (!Number.isFinite(diffMinutes) || diffMinutes <= 0) return undefined;

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
  }, [data?.reservedEndTime, data?.reservedStartTime, tagsData?.content]);

  const handleExtendReservation = useCallback(() => {
    if (!derivedTagId) return;

    const startDate = data?.start
      ? momentJalali(data.start).format('YYYY/MM/DD')
      : momentJalali().format('YYYY/MM/DD');
    const endDate = data?.end
      ? momentJalali(data.end).format('YYYY/MM/DD')
      : undefined;

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
            startTime: data?.reservedStartTime || undefined,
            endTime: data?.reservedEndTime || undefined,
          },
        },
      },
    } as any);
  }, [
    data?.end,
    data?.reservedEndTime,
    data?.reservedStartTime,
    data?.start,
    derivedTagId,
  ]);

  const handleOpenCancel = useCallback(() => {
    cancelSheetRef.current?.expand();
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
          cancelSheetRef.current?.close();
          queryClient.invalidateQueries({queryKey: ['UserSaleItem']});
        },
      },
    );
    },
    [cancelReservationMutation, orderId, queryClient],
  );

  const ImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-IMageHight, 0, IMageHight],
            [-IMageHight / 2, 0, IMageHight * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-IMageHight, 0, IMageHight],
            [2, 1, 1],
          ),
        },
      ],
    };
  });
  return (
    <>
      <BottomSheet
        ref={bottomsheetRef}
        scrollView
        snapPoints={[60]}
        Title={t('description')}>
        <BaseText type="body2">
          {data.description ? data.description : t('No description')}
        </BaseText>
      </BottomSheet>

      {/* Cancel confirm (same UI as ShopReservationCard) */}
      <CancelReservationConfirmSheet
        bottomSheetRef={cancelSheetRef}
        reservationPenalty={reservationPenaltyRaw}
        reservedDate={reservedDateRaw}
        reservedStartTime={reservedStartTime}
        totalAmount={totalAmount}
        isLoading={cancelReservationMutation.isPending}
        confirmDisabled={!orderId}
        onCancel={() => cancelSheetRef.current?.close()}
        onConfirm={handleConfirmCancel}
      />
      <View style={{flex: 1}}>
        <Animated.ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={{flex: 1}}>
          <View className="flex-1">
            <Animated.Image
              style={[{width: '100%', height: IMageHight}, ImageAnimatedStyle]}
              source={{
                uri: base64Image,
              }}
            />

            <View className="flex-1">
              <LinearGradient
                colors={[BaseHighlight, BaseHighlight, BaseColor]}
                locations={[0, 0, 0.3, 0.5]}
                className=""
                style={{
                  flex: 1,
                  borderTopEndRadius: 24,
                  borderTopStartRadius: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View className="flex-1 p-[2px] w-full  relative z-10 overflow-hidden">
                  <View className="flex-1 w-full Container py-4  dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4">
                    {/* Info Card */}
                    <View className="p-5 rounded-3xl gap-5 bg-white/40 dark:bg-neutral-dark-300/40 shadow-custom  border border-white dark:border-neutral-dark-300">
                      <View className="flex-row gap-2 items-center ">
                        {(data.usable ?? false) && (
                          <View className="w-2 h-2 rounded-full bg-success-500"></View>
                        )}
                        <BaseText type="title3" color="base">
                          {data.product?.title}
                        </BaseText>
                      </View>
                      <View className="gap-2">
                        {data.contractor && (
                          <ContractorInfo
                            gender={data.contractor.gender}
                            firstName={data.contractor.firstName}
                            imageName={data.contractor.profile?.name}
                            lastName={data.contractor.lastName}
                          />
                        )}
                        {!isFromReservation && (
                          <>
                            <View className="flex-row items-center justify-between">
                              <BaseText type="body3" color="secondary">
                                {t('AllCredit')}: {data.credit} {t('Metting')}
                              </BaseText>
                              <BaseText type="body3" color="secondaryPurple">
                                {(data?.credit ?? 0) - (data?.usedCredit ?? 0)}
                                {''}
                                {''} {t('MettingRemaining')}
                              </BaseText>
                            </View>
                            <View className="flex-row items-center justify-between ">
                              <BaseText type="body3" color="secondary">
                                {t('start')} {''} : {''}
                                {moment(data.start).format('jYYYY/jMM/jDD')}
                              </BaseText>
                              <BaseText type="body3" color="secondary">
                                {t('end')} {''} : {''}
                                {moment(data.end).format('jYYYY/jMM/jDD')}
                              </BaseText>
                            </View>
                          </>
                        )}

                        {/* Reservation details (only when coming from reservations section) */}
                        {isFromReservation && (
                          <View className="gap-3 pt-1">
                            <View className="flex-row justify-between items-center">
                              {reservedDate && (
                                <View className="flex-row items-center gap-2">
                                  <Calendar2
                                    size={20}
                                    color={
                                      theme === 'dark' ? '#FFFFFF' : '#AAABAD'
                                    }
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

                            <View className="flex-row justify-between items-center">
                              {reservedStartTime && (
                                <View className="flex-row items-center gap-2">
                                  <Clock
                                    size={20}
                                    color={
                                      theme === 'dark' ? '#FFFFFF' : '#AAABAD'
                                    }
                                    variant="Bold"
                                  />
                                  <BaseText type="body3" color="secondary">
                                    شروع: {reservedStartTime}
                                  </BaseText>
                                </View>
                              )}
                              {reservedEndTime && (
                                <View className="flex-row items-center gap-2">
                                  <BaseText type="body3" color="secondary">
                                    پایان: {reservedEndTime}
                                  </BaseText>
                                </View>
                              )}
                            </View>

                            {subProductsText && (
                              <View className="flex-row justify-end items-center gap-2">
                                <AddSquare
                                  size={20}
                                  color={
                                    theme === 'dark' ? '#FFFFFF' : '#AAABAD'
                                  }
                                  variant="Bold"
                                />
                                <BaseText type="body3" color="secondary">
                                  {subProductsText}
                                </BaseText>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                      <View className="flex-row gap-2">
                        {data.isOnline && (
                          <BaseButton
                            color="Black"
                            onPress={() => {
                              addToCart({
                                product: data.product!,
                                SelectedContractor: data.contractor,
                                SelectedPriceList: data?.product?.priceList[0],
                              });

                              navigate('Root', {
                                screen: 'HomeNavigator',
                                params: {screen: 'cart'},
                              });
                            }}
                            LeftIcon={RepeatCircle}
                            LeftIconVariant="Bold"
                            type="Fill"
                            text={t('Renewal')}
                            rounded
                            Extraclass="!flex-1"
                          />
                        )}
                        <BaseButton
                          color="Black"
                          type="Outline"
                          text={t('description')}
                          rounded
                          onPress={() => bottomsheetRef.current?.expand()}
                          Extraclass="!flex-1"
                        />
                      </View>

                      {/* Reservation actions (only when coming from reservations section + active) */}
                      {isActiveReservation && (
                        <View className="gap-2 mt-2">
                          <BaseButton
                            color="Black"
                            type="Fill"
                            text="تمدید رزرو"
                            rounded
                            LeftIcon={RepeatCircle}
                            LeftIconVariant="Bold"
                            onPress={handleExtendReservation}
                            disabled={tagsLoading || !derivedTagId}
                            isLoading={tagsLoading}
                          />
                          <BaseButton
                            type="Outline"
                            color="Error"
                            redbutton
                            rounded
                            text="لغو رزرو"
                            onPress={handleOpenCancel}
                            disabled={!orderId}
                          />
                        </View>
                      )}
                    </View>
                    {/* Info Card */}
                    {/* History */}
                    <View className="gap-3">
                      <View>
                        <BaseText type="title4" color="secondary">
                          {t('usedHistory')}
                        </BaseText>
                      </View>
                      {UserSessionisLoading ? (
                        <View className="flex-1 py-10">
                          <ActivityIndicator size="large" color="#bcdd64" />
                        </View>
                      ) : UserSession && UserSession?.length > 0 ? (
                        UserSession.map((item, index) => {
                          return (
                            <View
                              key={index}
                              className="p-5 rounded-3xl  gap-5 bg-white/40 dark:bg-neutral-dark-300/40 shadow-custom  border border-white dark:border-neutral-dark-300">
                              {!data.contractor && item.contractor && (
                                <View className="justify-between items-center flex-row">
                                  <BaseText type="body3" color="secondary">
                                    {t('contractor')}:
                                  </BaseText>
                                  <ContractorInfo
                                    gender={item.contractor.gender}
                                    firstName={item.contractor.firstName}
                                    imageName={item.contractor.profile?.name}
                                    lastName={item.contractor.lastName}
                                  />
                                </View>
                              )}
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('MettingCredit')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item.quantity}
                                </BaseText>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('lockers')}:
                                </BaseText>
                                <View className="flex-row gap-1">
                                  {item.lockers?.map((item, index) => {
                                    return (
                                      <Badge
                                        value={item}
                                        defaultMode
                                        textColor="base"
                                        key={index}></Badge>
                                    );
                                  })}
                                </View>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('entry')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {moment(item.start).format('HH:mm')}
                                </BaseText>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('exit')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item.end && moment(item.end).isValid()
                                    ? moment(item.end).format('HH:mm')
                                    : '-'}
                                </BaseText>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('date')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item.submitAt &&
                                  moment(item.submitAt).isValid()
                                    ? moment(item.submitAt).format(
                                        'jYYYY/jMM/jDD',
                                      )
                                    : '-'}
                                </BaseText>
                              </View>
                            </View>
                          );
                        })
                      ) : (
                        <View className="flex-1 py-10 justify-center items-center">
                          <BaseText type="title4" color="secondary">
                            {t('NoHistory')}
                          </BaseText>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </>
  );
};

export default ServiceDetail;
