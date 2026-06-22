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
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {PaymentService} from '../../services/PaymentService';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import moment from 'jalali-moment';
import {useCartContext} from '../../utils/CartContext';
import {PaymentVerifyRes} from '../../services/models/response/PaymentResService';
import {useAuth} from '../../utils/hooks/useAuth';
import {navigate} from '../../navigation/navigationRef';
import {ProductType, TransactionSourceType} from '../../constants/options';
import {ReservationData} from '../../utils/helpers/CartStorage';
import {SaleOrderItem} from '../../services/models/request/OperationalReqService';
import {useGetPaymentResult} from '../../utils/hooks/Operational/useGetPaymentResult';
type PaymentScreenProps = NativeStackScreenProps<
  DrawerStackParamList,
  'Paymentresult'
>;
const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});
  const queryClient = useQueryClient();
  const [PaymentData, setPaymentData] = useState<PaymentVerifyRes | null>(null);
  const {profile: ProfileData} = useAuth();

  const [isSuccses, SetisSuccses] = useState(route.params?.Status === 'OK');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [orderIds, setOrderIds] = useState<string[]>([]);
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
      // Update wallet credit after successful payment

      queryClient.invalidateQueries({queryKey: ['UserCredit']});
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
      // Update wallet credit after successful payment
      queryClient.invalidateQueries({queryKey: ['UserCredit']});

      // Store orders in state
      if (data?.orders && data.orders.length > 0) {
        setOrderIds(data.orders);
      }
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
  // Build orders array with same DTO structure as CartScreen
  const orders = useMemo(() => {
    const submitAt = moment(new Date()).format('YYYY-MM-DD HH:mm');

    // Separate reservation items from regular items
    const reservationItems = normalizedItems.filter(
      item =>
        item.isReserve &&
        item.reservationData &&
        item.product &&
        item.product.type !== undefined,
    );
    const regularItems = normalizedItems.filter(
      item =>
        (!item.isReserve || !item.reservationData) &&
        item.product &&
        item.product.type !== undefined,
    );

    // Build reservation items DTO with isReserve: true
    const reservationItemsDTO = reservationItems.map(item => {
      const reservationData: ReservationData = item.reservationData!;
      // Use reservePrice if available, otherwise fallback to SelectedPriceList or price
      const amount = (item.product as any)?.reservePrice
        ? (item.product as any)?.reservePrice
        : item.SelectedPriceList
        ? item.SelectedPriceList.price
        : item.product.price;
      const discount = item.SelectedPriceList
        ? item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0
        : item?.product?.discount ?? 0;

      // Convert dates to Gregorian format if needed
      // Check if reservedDate is in Jalali format
      let reservedDateGregorian = reservationData.reservedDate.split(' ')[0]; // Get date part
      const reservedYear = parseInt(reservedDateGregorian.split('-')[0]);

      // If year is between 1300-1500, it's Jalali (normal Jalali years)
      // Normal Gregorian years are between 1900-2100
      if (reservedYear >= 1300 && reservedYear <= 1500) {
        try {
          // This is Jalali date, convert to Gregorian
          const [jYear, jMonth, jDay] = reservedDateGregorian.split('-');
          const converted = moment
            .from(`${jYear}-${jMonth}-${jDay}`, 'fa', 'jYYYY-jMM-jDD')
            .format('YYYY-MM-DD');

          // Validate conversion (check if year is reasonable for Gregorian)
          const convertedYear = parseInt(converted.split('-')[0]);
          if (convertedYear >= 1900 && convertedYear <= 2100) {
            reservedDateGregorian = converted;
          }
        } catch (error) {
          console.error('❌ [PaymentScreen] Error converting date:', error);
        }
      } else if (reservedYear > 2000) {
        // This is likely a corrupted date, try to fix it
        try {
          const [jYear, jMonth, jDay] = reservedDateGregorian.split('-');
          const yearNum = parseInt(jYear);

          // Approach 1: If year is around 2600-3300, it might be a double conversion
          if (yearNum > 2500) {
            const adjustedYear = yearNum - 1800;
            if (adjustedYear >= 1300 && adjustedYear <= 1500) {
              const converted = moment
                .from(
                  `${adjustedYear}-${jMonth}-${jDay}`,
                  'fa',
                  'jYYYY-jMM-jDD',
                )
                .format('YYYY-MM-DD');
              const convertedYear = parseInt(converted.split('-')[0]);
              if (convertedYear >= 1900 && convertedYear <= 2100) {
                reservedDateGregorian = converted;
              }
            }
          }
        } catch (error) {
          console.error(
            '❌ [PaymentScreen] Could not fix corrupted date:',
            error,
          );
        }
      }

      // Calculate end date (1 day after start date) in Gregorian
      const endDateGregorian = moment(reservedDateGregorian, 'YYYY-MM-DD')
        .add(1, 'day')
        .format('YYYY-MM-DD');

      // Build secondaryServices from subProducts (only those with quantity > 0)
      const secondaryServices: any[] = [];

      // Get all subProducts from product
      const allSubProducts = item.product.subProducts || [];

      // Create a map of existing secondaryServices by product ID for quick lookup
      const existingServicesMap = new Map<number, any>();
      reservationData.secondaryServices?.forEach(service => {
        existingServicesMap.set(service.product, service);
      });

      // Process all subProducts - only add those with quantity > 0
      allSubProducts.forEach(subProduct => {
        const existingService = existingServicesMap.get(
          subProduct.product?.id || 0,
        );
        const quantity = existingService?.quantity || 0; // Default to 0 if not found

        // Skip subProducts with quantity 0
        if (quantity === 0) {
          return;
        }

        // Calculate dates based on reservedDate
        const startDate = reservedDateGregorian;
        const duration = subProduct.product?.duration || 1;
        const endDate = moment(startDate, 'YYYY-MM-DD')
          .add(duration, 'days')
          .format('YYYY-MM-DD');

        const userId = ProfileData?.id;

        secondaryServices.push({
          user: userId || 0,
          product: subProduct.product?.id || 0,
          start: startDate, // Gregorian format (YYYY-MM-DD)
          end: endDate, // Gregorian format (YYYY-MM-DD)
          discount: subProduct.discount || 0,
          type: subProduct.product?.type || 1,
          tax: subProduct.tax || 0,
          price: subProduct.product?.price || subProduct.amount || 0,
          quantity: quantity,
        });
      });

      // Convert reservedDate to Gregorian if needed
      let reservedDateFormatted = reservationData.reservedDate;
      const reservedDateOnly = reservationData.reservedDate.split(' ')[0];
      const reservedYearOnly = parseInt(reservedDateOnly.split('-')[0]);
      if (
        (reservedYearOnly >= 1300 && reservedYearOnly <= 1500) ||
        reservedYearOnly > 2000
      ) {
        try {
          // This is Jalali date, convert to Gregorian
          const [jYear, jMonth, jDay] = reservedDateOnly.split('-');
          const timePart =
            reservationData.reservedDate.split(' ')[1] || '00:00';
          const gregorianDateOnly = moment
            .from(`${jYear}-${jMonth}-${jDay}`, 'fa', 'jYYYY-jMM-jDD')
            .format('YYYY-MM-DD');

          // Validate conversion
          const convertedYear = parseInt(gregorianDateOnly.split('-')[0]);
          if (convertedYear >= 1900 && convertedYear <= 2100) {
            reservedDateFormatted = `${gregorianDateOnly} ${timePart}`;
          }
        } catch (error) {
          console.error(
            '❌ [PaymentScreen] Error converting reservedDate:',
            error,
          );
        }
      }

      return {
        isReserve: true,
        user: ProfileData?.id || 0,
        product: item.product.id,
        price: amount || 0,
        discount: (amount * discount) / 100 || 0,
        tax: item?.product?.tax ?? 0,
        type: item.product.type ?? 1,
        reservedDate: reservedDateFormatted, // Gregorian format (YYYY-MM-DD HH:mm)
        reservedStartTime: reservationData.reservedStartTime,
        reservedEndTime: reservationData.reservedEndTime,
        start: reservedDateGregorian, // Gregorian format (YYYY-MM-DD)
        end: endDateGregorian, // Gregorian format (YYYY-MM-DD)
        description: reservationData.description || null,
        secondaryServices:
          secondaryServices.length > 0 ? secondaryServices : undefined,
      };
    });

    // Build regular items DTO
    const regularItemsDTO: SaleOrderItem[] = regularItems
      .filter(item => item.product && item.product.type !== undefined)
      .map(item => {
        const amount = item.SelectedPriceList
          ? item.SelectedPriceList?.price
          : item.product?.price;
        const discount =
          item.product?.type === ProductType.Package
            ? item.product.subProducts?.reduce(
                (sum, subProduct) => sum + (subProduct.discount || 0),
                0,
              ) || 0
            : item.SelectedPriceList
            ? item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0
            : item?.product?.discount ?? 0;
        // Convert dates to Gregorian format (YYYY-MM-DD)
        const startDateGregorian = moment().format('YYYY-MM-DD');
        const endDateGregorian = moment()
          .add(
            item.SelectedPriceList?.duration ?? item.product.duration,
            'days',
          )
          .format('YYYY-MM-DD');

        return {
          quantity: 1,
          product: item.product.id,
          tax: item?.product?.tax ?? 0,
          manualPrice: false,
          type:
            item.product?.type === ProductType.Package
              ? 4
              : item.product?.type ?? 1,
          contractor: item?.SelectedContractor?.contractorId ?? null,
          contractorId: item?.SelectedContractor?.contractorId ?? null,
          start: startDateGregorian, // Gregorian format (YYYY-MM-DD)
          end: endDateGregorian, // Gregorian format (YYYY-MM-DD)
          isOnline: true,
          user: ProfileData?.id,
          amount: amount,
          discount:
            item.product?.type === ProductType.Package
              ? discount
              : (amount * discount) / 100,
          priceId: item.SelectedPriceList?.id ?? null,
          price: amount,
          duration: item.SelectedPriceList
            ? item.SelectedPriceList.duration
            : item.product.duration,
        };
      });

    // Calculate reservation order total amount
    // Amount = price - discount + tax (tax is always 0 or a number, never null)
    // For secondaryServices, we need to consider quantity
    const reservationOrderAmount = reservationItemsDTO.reduce((sum, item) => {
      const itemTax = item.tax || 0;
      const itemTotal = item.price - item.discount + itemTax;
      // Add secondary services total (consider quantity for each service)
      const secondaryTotal =
        item.secondaryServices?.reduce((subSum, sub) => {
          const quantity = sub.quantity || 1;
          const serviceTotal =
            (sub.price - sub.discount + (sub.tax ?? 0)) * quantity;
          return subSum + serviceTotal;
        }, 0) || 0;
      return sum + itemTotal + secondaryTotal;
    }, 0);

    // Calculate regular order total amount
    // Amount = price - discount + tax (tax is always 0 or a number, never null)
    const regularOrderAmount = regularItemsDTO.reduce((sum, item) => {
      const itemTax = item.tax || 0;
      return sum + (item.amount || 0) - (item.discount || 0) + itemTax;
    }, 0);

    // Build orders array
    const ordersArray: any[] = [];

    // Add reservation order if there are reservation items
    if (reservationItemsDTO.length > 0) {
      ordersArray.push({
        submitAt,
        isReserve: true,
        user: ProfileData?.id,
        items: reservationItemsDTO,
        transactions: [
          {
            type: TransactionSourceType.ChargingService, // Gateway payment already done
            amount: reservationOrderAmount,
            submitAt: submitAt,
            fromGuest: false,
            usedByOther: false,
            user: ProfileData?.id,
          },
        ],
      });
    }

    // Add regular order if there are regular items
    if (regularItemsDTO.length > 0) {
      ordersArray.push({
        submitAt,
        user: ProfileData?.id,
        items: regularItemsDTO,
        transactions: [
          {
            amount: regularOrderAmount,
            user: ProfileData?.id,
            submitAt: submitAt,
            fromGuest: false,
            type: TransactionSourceType.ChargingService, // Gateway payment already done
          },
        ],
      });
    }

    return ordersArray;
  }, [normalizedItems, ProfileData?.id]);

  // Build idParam from orderIds for useGetPaymentResult
  const idParam = useMemo(() => {
    return orderIds.length > 0 ? orderIds.join(',') : '';
  }, [orderIds]);

  // Call useGetPaymentResult with idParam
  const {data: paymentResultData, isLoading: isPaymentResultLoading} =
    useGetPaymentResult(idParam);

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
        } else if (orders.length > 0 && ProfileData) {
          CartPayment.mutate({
            authority: Authority,
            code,
            refId: refId,
            isonlineShop: true,
            orders: orders,
          });
        }
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setIsInitialLoading(false);
    }
  }, [route.params?.Authority, route.params?.isDeposite, orders, ProfileData]);
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
                    {paymentResultData?.transactions &&
                      paymentResultData.transactions.length > 0 && (
                        <View className="flex-row items-start justify-between ">
                          <View>
                            <BaseText type="body3" color="secondary">
                              {t('Transaction number')}: {''}
                            </BaseText>
                          </View>
                          <View className="flex-row gap-2 flex-wrap justify-end flex-1">
                            {paymentResultData?.transactions?.map(
                              (transaction, index: number) => {
                                return (
                                  <BaseButton
                                    key={index}
                                    disabled={!isSuccses}
                                    onPress={() =>
                                      navigate('Root', {
                                        screen: 'HistoryNavigator',
                                        params: {
                                          screen: 'DepositDetail',
                                          params: {
                                            id: transaction,
                                          },
                                        },
                                      })
                                    }
                                    size="Small"
                                    type="Outline"
                                    color="Supportive5-Blue"
                                    text={transaction.toString()}
                                    LinkButton
                                    rounded
                                  />
                                );
                              },
                            )}
                          </View>
                        </View>
                      )}
                    <View className="flex-row items-start justify-between ">
                      <View>
                        <BaseText type="body3" color="secondary">
                          {t('orderNumber')}: {''}
                        </BaseText>
                      </View>
                      <View className="flex-row gap-2 flex-wrap justify-end flex-1">
                        {PaymentData?.orders.map((item, index) => {
                          return (
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
                          );
                        })}
                      </View>
                    </View>
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
