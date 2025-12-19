import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Image, View} from 'react-native';
import {DrawerStackParamList} from '../../utils/types/NavigationTypes';
import {ScrollView} from 'react-native-gesture-handler';
import {useTranslation} from 'react-i18next';
import {CloseCircle, TickCircle} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import {formatNumber} from '../../utils/helpers/helpers';
import BaseButton from '../../components/Button/BaseButton';
import {useMutation} from '@tanstack/react-query';
import {PaymentService} from '../../services/PaymentService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import moment from 'jalali-moment';
import {useCartContext} from '../../utils/CartContext';
import {PaymentVerifyRes} from '../../services/models/response/PaymentResService';
import {useAuth} from '../../utils/hooks/useAuth';
import {navigate} from '../../navigation/navigationRef';
import {ProductType} from '../../constants/options';
import {ReservationData} from '../../utils/helpers/CartStorage';
type PaymentScreenProps = NativeStackScreenProps<
  DrawerStackParamList,
  'Paymentresult'
>;
const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});
  const [PaymentData, setPaymentData] = useState<PaymentVerifyRes | null>(null);
  const {profile: ProfileData} = useAuth();

  const [isSuccses, SetisSuccses] = useState(route.params?.Status === 'OK');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const {totalItems, items, emptyCart} = useCartContext();

  const normalizedItems = useMemo(() => {
    return items.flatMap(item =>
      Array.from({length: item.quantity}, () => ({
        ...item,
        quantity: 1,
      })),
    );
  }, [items]);

  const WalletCharge = useMutation({
    mutationFn: PaymentService.paymentVerify,
    onSuccess(data, variables, context) {
      setPaymentData(data);
      setIsInitialLoading(false);
    },
    onError: error => {
      handleMutationError(error);
      setIsInitialLoading(false);
    },
  });
  const CartPayment = useMutation({
    mutationFn: PaymentService.paymentVerifySubmitOrder,
    onSuccess(data, variables, context) {
      isSuccses && emptyCart();
      setPaymentData(data);
      setIsInitialLoading(false);
    },
    onError: error => {
      handleMutationError(error);
      setIsInitialLoading(false);
    },
  });
  const CreatePayment = useMutation({
    mutationFn: PaymentService.CreatePayment,
    onSuccess(data, variables, context) {
      if (data?.url) {
        navigate('Root', {
          screen: 'WebViewParamsList',
          params: {url: data.url},
        });
      }
    },
    onError: handleMutationError,
  });
  const Items = useMemo(() => {
    return normalizedItems.map(item => {
      // Check if this is a reservation item
      if (item.isReserve && item.reservationData) {
        const reservationData: ReservationData = item.reservationData;
        const amount = item.SelectedPriceList
          ? item.SelectedPriceList.price
          : item.product.price;

        const discount = item.SelectedPriceList
          ? item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0
          : item?.product?.discount ?? 0;

        return {
          user: ProfileData?.id || 0,
          product: item.product.id,
          price: amount,
          discount: (amount * discount) / 100,
          tax: item?.product?.tax || undefined,
          reservedDate: reservationData.reservedDate,
          reservedStartTime: reservationData.reservedStartTime,
          reservedEndTime: reservationData.reservedEndTime,
          description: reservationData.description || null,
          secondaryServices: reservationData.secondaryServices || undefined,
        };
      }

      // Regular cart item (non-reservation)
      const amount = item.SelectedPriceList
        ? item.SelectedPriceList.price
        : item.product.price;

      const discount =
        item.product.type === ProductType.Package
          ? item.product.subProducts?.reduce(
              (sum, subProduct) => sum + (subProduct.discount || 0),
              0,
            ) || 0
          : item.SelectedPriceList
          ? item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0
          : item?.product?.discount ?? 0;

      return {
        quantity: 1,
        product: item.product.id,
        tax: item?.product?.tax,
        user: ProfileData?.id,
        manualPrice: false,
        type: item.product.type === ProductType.Package ? 4 : item.product.type,
        contractor: item?.SelectedContractor?.contractorId ?? null,
        contractorId: item?.SelectedContractor?.contractorId ?? null,
        start: moment().format('YYYY-MM-DD'),
        end: moment()
          .add(
            item.SelectedPriceList?.duration ?? item.product.duration,
            'days',
          )
          .format('YYYY-MM-DD'),
        isOnline: true,
        amount: amount,
        discount:
          item.product.type === ProductType.Package
            ? discount
            : (amount * discount) / 100,
        priceId: item.SelectedPriceList?.id ?? null,
        price: amount,
        duration: item.SelectedPriceList
          ? item.SelectedPriceList.duration
          : item.product.duration,
      };
    });
  }, [normalizedItems, ProfileData?.id]);
  useEffect(() => {
    const {Authority, isDeposite, code, refId} = route.params || {};

    if (Authority || refId) {
      const timer = setTimeout(() => {
        if (isDeposite === 'true') {
          WalletCharge.mutate({
            authority: Authority,
            code,
            refId: refId,
          });
        } else if (Items.length > 0 && ProfileData) {
          CartPayment.mutate({
            authority: Authority,
            code,
            refId: refId,
            isonlineShop: true,
            orders: [
              {
                items: Items,
                user: ProfileData.id,
                location: '',
                submitAt: moment().format('YYYY-MM-DD HH:mm'),
              },
            ],
          });
        }
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setIsInitialLoading(false);
    }
  }, [route.params?.Authority, route.params?.isDeposite, Items, ProfileData]);
  const CreateNewPayment = () => {
    if (PaymentData) {
      CreatePayment.mutate({
        amount: PaymentData?.payment.amount || 0,
        description: 'پرداخت',
        gateway: PaymentData?.payment?.gateway?.id,
        isDeposit: route.params?.isDeposite ? true : false,
      });
    }
  };
  return (
    <>
      <View className="flex-1">
        <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
          <View className="items-centex justify-between Container pb-6 flex-1">
            <View></View>
            <View className="min-h-[400px] pb-11 CardBase w-full relative pt-11 ">
              <>
                {/* Status View */}
                <View
                  className={`absolute -top-[20px] web:-top-[20px]  z-20 left-1/2 transform web:-translate-x-1/2 w-[44px] h-[44px] ${
                    isSuccses
                      ? 'bg-success-100/70 dark:bg-success-dark-100/70'
                      : 'bg-error-100/80 dark:bg-error-dark-100/80'
                  } items-center justify-center rounded-full shadow `}>
                  {isSuccses ? (
                    <TickCircle size="24" color="#37C976" variant="Bold" />
                  ) : (
                    <CloseCircle size="24" color="#FD504F" variant="Bold" />
                  )}
                </View>
                <View className="w-full h-full absolute top-0 left-0 rounded-3xl">
                  <View className="relative overflow-hidden w-full h-full flex-1">
                    <View
                      className={`absolute -top-[70px] web:-top-[70px]  z-20 left-1/2 transform web:-translate-x-1/2 w-full h-[200px] items-center justify-center rounded-full `}>
                      <Image
                        source={
                          isSuccses
                            ? require('../../assets/images/shade/shape/SucsessPaymantShape.png')
                            : require('../../assets/images/shade/shape/RedPaymentShape.png')
                        }
                        style={{width: '100%', height: '100%'}}
                      />
                    </View>
                    <View className="absolute -bottom-[150px] web:-bottom-[130px] opacity-50 rotate-180   z-20 left-1/2 transform web:-translate-x-1/2 w-full h-[200px] items-center justify-center rounded-full ">
                      <Image
                        source={
                          isSuccses
                            ? require('../../assets/images/shade/shape/SucsessPaymantShape.png')
                            : require('../../assets/images/shade/shape/RedPaymentShape.png')
                        }
                        style={{width: '100%', height: '100%'}}
                      />
                    </View>
                  </View>
                </View>
              </>
              {!PaymentData ? (
                isInitialLoading ||
                WalletCharge.isPending ||
                CartPayment.isPending ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#bcdd64" />
                    {isInitialLoading && (
                      <BaseText type="body2" color="muted" className="mt-4">
                        در حال آماده‌سازی...
                      </BaseText>
                    )}
                  </View>
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <BaseText type="title2" color="muted">
                      {t('ProblemWithPayment')}
                    </BaseText>
                  </View>
                )
              ) : null}
              {/* Content */}
              {PaymentData && (
                <View className="gap-7">
                  <View className="gap-2 justify-center items-center">
                    <View className="flex-row gap-1 items-center justify-center ">
                      <BaseText type="title2" color="base">
                        {formatNumber(PaymentData?.payment?.amount ?? 0)}
                      </BaseText>
                      <BaseText type="title4" color="secondary">
                        ﷼
                      </BaseText>
                    </View>
                    <BaseText
                      type="title4"
                      color={isSuccses ? 'success' : 'error'}>
                      {isSuccses ? t(`paymentSuccses`) : t('paymnetFaild')}
                    </BaseText>
                  </View>
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Status')}: {''}
                      </BaseText>
                      <BaseText
                        type="body3"
                        color={isSuccses ? 'success' : 'error'}>
                        {t(isSuccses ? 'Succses' : 'faild')}
                      </BaseText>
                    </View>
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('DateAndTime')}: {''}
                      </BaseText>
                      <BaseText type="body3" color="base">
                        {moment(PaymentData?.payment?.createdAt).format(
                          'jYYYY/jMM/jDD HH:mm',
                        )}
                      </BaseText>
                    </View>
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Payment ID')}: {''}
                      </BaseText>
                      <BaseText type="body3" color="base">
                        {PaymentData?.payment?.id?.toString()}
                      </BaseText>
                    </View>

                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Transaction number')}: {''}
                      </BaseText>
                      <BaseButton
                        disabled={!isSuccses}
                        onPress={() =>
                          navigate('Root', {
                            screen: 'HistoryNavigator',
                            params: {
                              screen: 'DepositDetail',
                              params: {
                                id: PaymentData?.payment?.transaction?.id ?? 0,
                              },
                            },
                          })
                        }
                        size="Small"
                        type="Outline"
                        color="Supportive5-Blue"
                        text={(
                          PaymentData?.payment?.transaction?.id ?? 0
                        ).toString()}
                        LinkButton
                        rounded
                      />
                    </View>
                    {PaymentData?.orders?.map((item, index) => {
                      return (
                        <View
                          key={index}
                          className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('orderNumber')}: {''}
                          </BaseText>
                          <BaseButton
                            disabled={!isSuccses}
                            onPress={() =>
                              navigate('Root', {
                                screen: 'HistoryNavigator',
                                params: {
                                  screen: 'orderDetail',
                                  params: {
                                    id: Number(item ?? 0),
                                  },
                                },
                              })
                            }
                            size="Small"
                            type="Outline"
                            color="Supportive5-Blue"
                            text={item ?? ''}
                            LinkButton
                            rounded
                          />
                        </View>
                      );
                    })}
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Amount')}: {''}
                      </BaseText>
                      <View className="flex-row gap-1">
                        <BaseText type="body3" color="base">
                          {formatNumber(PaymentData?.payment.amount)}
                        </BaseText>
                        <BaseText type="body3" color="base">
                          ﷼
                        </BaseText>
                      </View>
                    </View>
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Payment gateway')}: {''}
                      </BaseText>
                      <BaseText type="body3" color="base">
                        {PaymentData?.payment?.gateway?.title}
                      </BaseText>
                    </View>
                    <View className="flex-row items-center justify-between ">
                      <BaseText type="body3" color="secondary">
                        {t('Tracking number')}: {''}
                      </BaseText>
                      <View>
                        <BaseText type="body3" color="base">
                          {PaymentData.payment.refId}{' '}
                          {PaymentData.payment.code &&
                            `(${PaymentData.payment.code})`}
                        </BaseText>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
            <View className="gap-2">
              {!isSuccses && (
                <BaseButton
                  onPress={CreateNewPayment}
                  disabled={!PaymentData}
                  isLoading={CreatePayment.isPending}
                  type={'Fill'}
                  color="Black"
                  size="Large"
                  text={t('Retry')}
                  rounded
                />
              )}
              <BaseButton
                onPress={() => {
                  route.params?.isDeposite === 'true'
                    ? navigate('Root', {
                        screen: 'HomeNavigator',
                        params: {
                          screen: 'wallet',
                        },
                      })
                    : navigate('Root', {
                        screen: 'HomeNavigator',
                      });
                }}
                type={isSuccses ? 'Fill' : 'Outline'}
                color="Black"
                size="Large"
                text={
                  route.params?.isDeposite === 'true'
                    ? t('BackToWallet')
                    : t('BackToHome')
                }
                rounded
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default PaymentScreen;
