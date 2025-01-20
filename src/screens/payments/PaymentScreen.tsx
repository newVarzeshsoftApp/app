import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';
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
import {
  PaymentVerifyRes,
  paymentVerifySubmitOrderRes,
} from '../../services/models/response/PaymentResService';
import moment from 'jalali-moment';
import {useCartContext} from '../../utils/CartContext';
import {SaleOrderItem} from '../../services/models/request/OperationalReqService';
import WalletPaymentDetail from './Components/WalletPaymentDetail';
import CartPaymentDetail from './Components/CartPaymentDetail';
type PaymentScreenProps = NativeStackScreenProps<
  DrawerStackParamList,
  'Paymentresult'
>;
const PaymentScreen: React.FC<PaymentScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'payment'});
  const [PaymentData, setPaymentData] = useState<PaymentVerifyRes | null>(null);
  const [CartPaymentData, setCartPaymentData] =
    useState<paymentVerifySubmitOrderRes | null>(null);
  const isSuccses = route.params?.Status === 'OK';
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
    },
    onError: handleMutationError,
  });
  const CartPayment = useMutation({
    mutationFn: PaymentService.paymentVerifySubmitOrder,
    onSuccess(data, variables, context) {
      emptyCart();
      setCartPaymentData(data);
    },
  });
  const CreatePayment = useMutation({
    mutationFn: PaymentService.CreatePayment,
    onSuccess(data, variables, context) {
      if (data?.url) {
        navigation.navigate('WebViewParamsList', {
          url: data.url, // Passing the URL as a parameter
        });
      }
    },
    onError: handleMutationError,
  });
  const Items = useMemo(() => {
    return normalizedItems.map(item => {
      const amount = item.SelectedPriceList
        ? item.SelectedPriceList.price
        : item.product.price;
      const discount = item.SelectedPriceList
        ? item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0
        : item?.product?.discount ?? 0;

      return {
        quantity: 1,
        product: item.product.id,
        tax: (amount * (item?.product?.tax ?? 0)) / 100,
        manualPrice: false,
        type: item.product.type,
        contractor: item?.SelectedContractor?.contractorId ?? null,
        contractorId: item?.SelectedContractor?.contractorId ?? null,
        start: moment().format('YYYY-MM-DD'),
        end: moment()
          .add(item.SelectedPriceList?.duration ?? item.product.duration)
          .format('YYYY-MM-DD'),
        isOnline: true,
        amount: amount,
        discount: (amount * discount) / 100,
        priceId: item.SelectedPriceList?.id ?? null,
        price: amount,
        duration: item.SelectedPriceList
          ? item.SelectedPriceList.duration
          : item.product.duration,
      };
    });
  }, [normalizedItems]);
  useEffect(() => {
    const {Authority, isDeposit, code, RefID} = route.params || {};
    if (Authority) {
      if (isDeposit) {
        WalletCharge.mutate({
          authority: Authority,
          code,
          refId: RefID,
        });
      } else if (Items.length > 0) {
        CartPayment.mutate({
          authority: Authority,
          code,
          refId: RefID,
          isonlineShop: true,
          orders: [
            {items: Items, submitAt: moment().format('YYYY-MM-DD HH:mm')},
          ],
        });
      }
    }
  }, [route.params?.Authority, route.params?.isDeposit, Items]);

  return (
    <>
      <View className="flex-1">
        <ScrollView contentContainerStyle={{flexGrow: 1}} style={{flex: 1}}>
          <View className="items-centex justify-between Container pb-6 flex-1">
            <View></View>
            <View className="h-[400px] CardBase w-full relative pt-11 ">
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
              {(CartPayment.isPending || CreatePayment.isPending) && (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#bcdd64" />
                </View>
              )}
              {/* Content */}
              {PaymentData && (
                <WalletPaymentDetail
                  PaymentData={PaymentData}
                  isSuccses={isSuccses}
                  navigation={navigation}
                />
              )}
              {CartPaymentData && (
                <CartPaymentDetail
                  PaymentData={CartPaymentData}
                  isSuccses={isSuccses}
                  navigation={navigation}
                />
              )}
            </View>
            <View className="gap-2">
              {/* {!isSuccses &&  (
                  <BaseButton
                    onPress={() => {
                      CreatePayment.mutate({
                        amount: PaymentData?.amount || 0,
                        description: 'پرداخت',
                        gateway: PaymentData.gateway.id,
                        isDeposit: true,
                      });
                    }}
                    isLoading={CreatePayment.isPending}
                    type={'Fill'}
                    color="Black"
                    size="Large"
                    text={t('Retry')}
                    rounded
                  />
                )} */}
              <BaseButton
                onPress={() => {
                  //@ts-ignore
                  navigation.navigate('HomeNavigator', {screen: 'wallet'});
                }}
                type={isSuccses ? 'Fill' : 'Outline'}
                color="Black"
                size="Large"
                text={t('BackToWallet')}
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
