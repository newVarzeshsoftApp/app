import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useCartContext} from '../../utils/CartContext';
import {useCartTotals} from '../../utils/hooks/useCartTotal';
import {CartItem} from '../../utils/helpers/CartStorage';
import CartProductCard from '../../components/cards/cart/CartProductCard';
import CartServiceCard from '../../components/cards/cart/CartServiceCard';
import CartCreditCard from '../../components/cards/cart/CartCreditCard';
import CartPackageCard from '../../components/cards/cart/CartPackageCard';
import BaseText from '../../components/BaseText';
import CartSteps from './components/Cart/CartSteps';
import CartItemsList from './components/Cart/CartItemsList';
import OrderSummary from './components/Cart/OrderSummary';
import PaymentButtons from './components/Cart/PaymentButtons';
import Checkbox from '../../components/Checkbox/Checkbox';
import {useGetGetway} from '../../utils/hooks/Getway/useGetGetway';
import BaseButton from '../../components/Button/BaseButton';
import WalletBalance from './components/WalletBalance';
import {useGetUserCredit} from '../../utils/hooks/User/useUserCredit';
import {useMutation} from '@tanstack/react-query';
import {PaymentService} from '../../services/PaymentService';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {HomeStackParamList} from '../../utils/types/NavigationTypes';
import moment from 'jalali-moment';
import {OperationalService} from '../../services/Operational';
import {SaleOrderItem} from '../../services/models/request/OperationalReqService';
import {ProductType, TransactionSourceType} from '../../constants/options';
import {useGetUserSaleItem} from '../../utils/hooks/User/useGetUserSaleItem';
import {useTheme} from '../../utils/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import {formatNumber} from '../../utils/helpers/helpers';
import RadioButton from '../../components/Button/RadioButton/RadioButton';
import {useAuth} from '../../utils/hooks/useAuth';
import {navigate} from '../../navigation/navigationRef';
import {ReservationData} from '../../utils/helpers/CartStorage';
type PaymentMethodType = {
  getway?: number;
  isWallet?: boolean;
  source?: number;
};
type CartScreenProps = BottomTabScreenProps<HomeStackParamList, 'cart'>;
const CartScreen: React.FC<CartScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {totalItems, items, emptyCart} = useCartContext();
  const [steps, setSteps] = useState<1 | 2>(1);
  const {data: Getways, isLoading} = useGetGetway();
  const {data: Credits} = useGetUserSaleItem({
    limit: 20,
    offset: 0,
    type: ProductType.Credit,
  });
  const [PaymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(
    null,
  );
  const {data: UserCredit} = useGetUserCredit();
  const {profile: ProfileData} = useAuth();
  const {totalAmount, totalTax, totalDiscount, totalShopGift} =
    useCartTotals(items);
  const amountPayable = totalAmount + totalTax - totalDiscount;
  useEffect(() => {
    if ((Getways?.length ?? 0) > 0) {
      setPaymentMethod({getway: Getways?.[0]?.id});
    }
  }, [Getways]);
  const cardComponentMapping: Record<number, React.FC<{data: CartItem}>> = {
    0: CartProductCard,
    1: CartServiceCard,
    2: CartCreditCard,
    3: CartPackageCard,
  };

  const {theme} = useTheme();
  const BaseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
  const BaseHighlight = 'rgba(254, 211, 118, 0.5)';
  const ActiveCreditColor = [BaseHighlight, BaseColor, BaseHighlight];
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
  });

  const SaleOrder = useMutation({
    mutationFn: OperationalService.SaleOrder,
    onSuccess(data, variables, context) {
      emptyCart();
      navigate('Root', {screen: 'PaymentDetail', params: {id: data}});
    },
  });

  const normalizedItems = useMemo(() => {
    return items.flatMap(item =>
      Array.from({length: item.quantity}, () => ({
        ...item,
        quantity: 1,
      })),
    );
  }, [items]);

  const SubmitSaleOrder = () => {
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
      const amount = item.SelectedPriceList
        ? item.SelectedPriceList.price
        : item.product.price;
      const discount = item.SelectedPriceList
        ? item?.SelectedPriceList?.discountOnlineShopPercentage ?? 0
        : item?.product?.discount ?? 0;

      // Convert reservedDate from Gregorian to Jalali format
      // reservedDate is in format "2025-12-23 00:00" (Gregorian)
      // Convert to Jalali format "2647-03-12"
      const reservedDateGregorian = reservationData.reservedDate.split(' ')[0]; // "2025-12-23"
      const reservedDateJalali = moment(reservedDateGregorian, 'YYYY-MM-DD')
        .locale('fa')
        .format('jYYYY-jMM-jDD'); // "2647-03-12"

      // Calculate end date (1 day after start date) in Jalali
      const endDateJalali = moment(reservedDateGregorian, 'YYYY-MM-DD')
        .add(1, 'day')
        .locale('fa')
        .format('jYYYY-jMM-jDD');

      // Build secondaryServices with quantity (one item per subService with quantity field)
      const secondaryServices = reservationData.secondaryServices?.map(
        subService => {
          // Convert start and end dates from Gregorian to Jalali
          const startJalali = moment(subService.start, 'YYYY-MM-DD')
            .locale('fa')
            .format('jYYYY-jMM-jDD');
          const endJalali = moment(subService.end, 'YYYY-MM-DD')
            .locale('fa')
            .format('jYYYY-jMM-jDD');

          return {
            user: subService.user,
            product: subService.product,
            start: startJalali,
            end: endJalali,
            discount: subService.discount,
            type: subService.type,
            tax: subService.tax ?? 0, // Must be 0 if null
            price: subService.price,
            quantity: subService.quantity || 1, // Add quantity field
          };
        },
      );

      return {
        isReserve: true,
        user: ProfileData?.id || 0,
        product: item.product.id,
        price: amount,
        discount: (amount * discount) / 100,
        tax: item?.product?.tax ?? 0, // Must be 0 if null
        reservedDate: reservationData.reservedDate, // Keep Gregorian format (YYYY-MM-DD HH:mm)
        reservedStartTime: reservationData.reservedStartTime,
        reservedEndTime: reservationData.reservedEndTime,
        start: reservedDateJalali, // Jalali format (jYYYY-jMM-jDD)
        end: endDateJalali, // Jalali format (jYYYY-jMM-jDD)
        description: reservationData.description || null,
        secondaryServices: secondaryServices || undefined,
      };
    });

    // Calculate reservation order total amount
    // Amount = price - discount + tax (tax is always 0 or a number, never null)
    // For secondaryServices, we need to consider quantity (already handled in flatMap above)
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
        // Convert dates to Jalali format
        const startDateJalali = moment().locale('fa').format('jYYYY-jMM-jDD');
        const endDateJalali = moment()
          .add(
            item.SelectedPriceList?.duration ?? item.product.duration,
            'days',
          )
          .locale('fa')
          .format('jYYYY-jMM-jDD');

        return {
          quantity: 1,
          product: item.product.id,
          tax: PaymentMethod?.getway
            ? item?.product?.tax ?? 0
            : (amount * (item?.product?.tax ?? 0)) / 100,
          manualPrice: false,
          type:
            item.product?.type === ProductType.Package
              ? 4
              : item.product?.type ?? 1,
          contractor: item?.SelectedContractor?.contractorId ?? null,
          contractorId: item?.SelectedContractor?.contractorId ?? null,
          start: startDateJalali, // Jalali format
          end: endDateJalali, // Jalali format
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

    // Calculate regular order total amount
    // Amount = price - discount + tax (tax is always 0 or a number, never null)
    const regularOrderAmount = regularItemsDTO.reduce((sum, item) => {
      const itemTax = item.tax || 0;
      return sum + (item.amount || 0) - (item.discount || 0) + itemTax;
    }, 0);

    // Build orders array
    const orders: any[] = [];

    // Add reservation order if there are reservation items
    if (reservationItemsDTO.length > 0) {
      orders.push({
        submitAt,
        isReserve: true,
        user: ProfileData?.id,
        items: reservationItemsDTO,
        transactions: [
          {
            type: PaymentMethod?.isWallet
              ? TransactionSourceType.UserCredit
              : PaymentMethod?.source
              ? 1
              : TransactionSourceType.ChargingService,
            source: PaymentMethod?.isWallet ? undefined : PaymentMethod?.source,
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
    // Group regular items by contractor and priceId (or other grouping logic)
    // For now, we'll put all items in one group
    if (regularItemsDTO.length > 0) {
      orders.push({
        submitAt,
        user: ProfileData?.id,
        items: [regularItemsDTO], // Nested array: array of arrays as per data.json
        transactions: [
          {
            amount: regularOrderAmount,
            user: ProfileData?.id,
            submitAt: submitAt,
            fromGuest: false,
            type: PaymentMethod?.isWallet
              ? TransactionSourceType.UserCredit
              : TransactionSourceType.ChargingService,
            source: PaymentMethod?.isWallet ? undefined : PaymentMethod?.source,
          },
        ],
      });
    }

    // Build final DTO
    const finalDTO = {
      orders: orders,
    };

    // Log the DTO for debugging
    console.log('=== SaleOrder DTO ===');
    console.log(JSON.stringify(finalDTO, null, 2));
    console.log('===========================================');

    // Send to backend
    if (PaymentMethod?.getway) {
      // Gateway payment - send to CreatePayment
      console.log('=== Sending to CreatePayment (Gateway) ===');
      console.log(
        JSON.stringify(
          {orders, amount: amountPayable, gateway: PaymentMethod.getway},
          null,
          2,
        ),
      );
      CreatePayment.mutate({
        amount: amountPayable,
        gateway: PaymentMethod.getway,
        description: 'Cart',
        isDeposit: false,
        orders: orders,
      });
    } else {
      // Non-gateway payment (wallet or credit service) - send orders array to SaleOrder
      const saleOrderBody = {
        submitAt,
        user: ProfileData?.id,
        orders: orders, // Send orders array with both reservation and regular items
      };
      console.log('=== Sending to SaleOrder (Non-Gateway) ===');
      console.log(JSON.stringify(saleOrderBody, null, 2));
      SaleOrder.mutate(saleOrderBody);
    }
  };
  return (
    <View className="flex-1 relative">
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <View className="Container  flex-1 py-5 web:pt-[90px] pb-[180px] gap-5 relative ">
          {items.length === 0 ? (
            <View className="flex-1  items-center justify-center">
              <BaseText type="body2" color="muted">
                {t('Cart is empty')}
              </BaseText>
            </View>
          ) : (
            <>
              <CartSteps
                steps={steps}
                t={t}
                ActiveIcon="#37C976"
                DisableIcon="#55575C"
              />
              {steps === 1 ? (
                <View className="gap-4">
                  <View>
                    <BaseText>
                      {t('Cart Items')} ({totalItems})
                    </BaseText>
                  </View>
                  <CartItemsList
                    items={items.filter(
                      item => item.product && item.product.type !== undefined,
                    )}
                    cardComponentMapping={cardComponentMapping}
                  />
                  <OrderSummary
                    totalItems={totalItems}
                    totalAmount={totalAmount}
                    totalDiscount={totalDiscount}
                    totalTax={totalTax}
                    totalShopGift={totalShopGift}
                    amountPayable={amountPayable}
                    t={t}
                  />
                </View>
              ) : (
                <View className="gap-4">
                  <BaseText>{t('payment Methode')}</BaseText>
                  {(Getways?.length ?? 0) > 0 && (
                    <View
                      className={`CardBase ${
                        PaymentMethod?.getway && '!border-primary-500'
                      } `}>
                      <View className="flex-row items-center justify-between">
                        <BaseText type="subtitle2">{t('PaywithBank')}</BaseText>
                        <Checkbox
                          checked={PaymentMethod?.getway ? true : false}
                          onCheckedChange={() =>
                            setPaymentMethod({
                              getway: Getways?.[0]?.id,
                              source: undefined,
                              isWallet: false,
                            })
                          }
                        />
                      </View>
                      <View className="gap-2">
                        <BaseText type="subtitle3" color="secondary">
                          {t('Select Getway')}
                        </BaseText>
                        {isLoading ? (
                          <ActivityIndicator size="large" color="#bcdd64" />
                        ) : (
                          Getways && (
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}>
                              {Getways?.map((item, index) => {
                                return (
                                  <BaseButton
                                    key={index}
                                    text={item.title}
                                    type={
                                      PaymentMethod?.getway ?? null === item.id
                                        ? 'Fill'
                                        : 'Outline'
                                    }
                                    srcLeft={
                                      item.icon
                                        ? {uri: item?.icon}
                                        : item.type === 0
                                        ? require('../../assets/icons/zarinpal.png')
                                        : require('../../assets/icons/payping.png')
                                    }
                                    size="Large"
                                    color="Black"
                                    rounded
                                    onPress={() => {
                                      setPaymentMethod({
                                        getway: item?.id,
                                        source: undefined,
                                        isWallet: false,
                                      });
                                    }}
                                  />
                                );
                              })}
                            </ScrollView>
                          )
                        )}
                      </View>
                    </View>
                  )}
                  {/*  خرید با کیف پول  */}
                  <TouchableOpacity
                    disabled={Number(UserCredit?.result ?? 0) < amountPayable}
                    onPress={() =>
                      setPaymentMethod({
                        isWallet: true,
                        getway: undefined,
                        source: undefined,
                      })
                    }
                    className={`CardBase ${
                      PaymentMethod?.isWallet && '!border-primary-500'
                    }`}>
                    <View className="flex-row items-center justify-between">
                      <BaseText type="subtitle2">{t('PaywithWallet')}</BaseText>
                      <Checkbox
                        disabled={
                          Number(UserCredit?.result ?? 0) < amountPayable
                        }
                        checked={PaymentMethod?.isWallet === true}
                        onCheckedChange={() =>
                          setPaymentMethod({
                            isWallet: true,
                            getway: undefined,
                            source: undefined,
                          })
                        }
                      />
                    </View>

                    <View className="gap-1">
                      <WalletBalance
                        inWallet
                        NoCredit={
                          Number(UserCredit?.result ?? 0) < amountPayable
                        }
                      />
                      {Number(UserCredit?.result ?? 0) < amountPayable && (
                        <BaseText type="badge" color="error">
                          موجودی ناکافی
                        </BaseText>
                      )}
                    </View>
                  </TouchableOpacity>
                  {/*  خرید با خدمت شارژی  */}
                  {Credits && Credits.total > 0 && (
                    <View
                      className={`CardBase ${
                        PaymentMethod?.source && '!border-primary-500'
                      }`}>
                      <BaseText type="subtitle2">{t('PaywithCredit')}</BaseText>
                      {Credits?.content?.map((item, index) => {
                        const disable =
                          (item?.credit ?? 0) - (item?.usedCredit ?? 0) <
                          amountPayable;
                        return (
                          <TouchableOpacity
                            key={index}
                            disabled={disable}
                            className="flex-row items-center gap-2 disabled:opacity-25"
                            onPress={() => setPaymentMethod({source: item.id})}>
                            <LinearGradient
                              colors={
                                PaymentMethod?.source === item.id
                                  ? ActiveCreditColor
                                  : [BaseColor, BaseColor, BaseColor]
                              }
                              start={
                                Platform.OS === 'web'
                                  ? {x: 1, y: 1}
                                  : {x: 1, y: -1}
                              }
                              locations={[0.2, 1, 1]}
                              style={{
                                flex: 1,
                                borderRadius: 24,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <View className="flex-1 p-[2px] w-full h-full relative z-10 overflow-hidden ">
                                <View className=" flex-1 w-full justify-start  items-start py-3 px-8 overflow-hidden h-full dark:bg-neutral-dark-300/80 bg-neutral-0/80 rounded-3xl">
                                  <BaseText
                                    type="subtitle3"
                                    color={disable ? 'muted' : 'secondary'}>
                                    {item.title}
                                  </BaseText>
                                  <BaseText
                                    type="title1"
                                    color={disable ? 'muted' : 'base'}>
                                    {formatNumber(
                                      (item?.credit ?? 0) -
                                        (item?.usedCredit ?? 0),
                                    )}
                                  </BaseText>
                                </View>
                              </View>
                            </LinearGradient>
                            {!disable ? (
                              <RadioButton
                                disabled={
                                  Number(UserCredit?.result ?? 0) <=
                                  amountPayable
                                }
                                checked={PaymentMethod?.source === item?.id}
                                onCheckedChange={() =>
                                  setPaymentMethod({source: item?.id})
                                }
                              />
                            ) : (
                              <View className="w-6 h-6"></View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  <OrderSummary
                    totalItems={totalItems}
                    totalAmount={totalAmount}
                    totalDiscount={totalDiscount}
                    totalTax={totalTax}
                    totalShopGift={totalShopGift}
                    amountPayable={amountPayable}
                    t={t}
                  />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {items.length > 0 && (
        <PaymentButtons
          disabled={!PaymentMethod}
          isLoading={CreatePayment.isPending || SaleOrder.isPending}
          Steps={steps}
          BackStep={() => setSteps(1)}
          NextStep={() => (steps === 1 ? setSteps(2) : SubmitSaleOrder())}
          t={t}
        />
      )}
    </View>
  );
};

export default CartScreen;
