import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
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
type PaymentMethodType = {
  getway?: number;
  isWallet?: boolean;
};

const CartScreen: React.FC = () => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {totalItems, items} = useCartContext();
  const [steps, setSteps] = useState<1 | 2>(1);
  const {data: Getways, isLoading} = useGetGetway();

  const [PaymentMethod, setPaymentMethod] = useState<PaymentMethodType | null>(
    null,
  );
  const {data: UserCredit} = useGetUserCredit();
  const {totalAmount, totalTax, totalDiscount, totalShopGift} =
    useCartTotals(items);
  const amountPayable = totalAmount + totalTax - totalDiscount;
  useEffect(() => {
    if (Getways) {
      setPaymentMethod({getway: Getways[0].id});
    }
  }, [Getways]);
  const cardComponentMapping: Record<number, React.FC<{data: CartItem}>> = {
    0: CartProductCard,
    1: CartServiceCard,
    2: CartCreditCard,
    3: CartPackageCard,
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
                    items={items}
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
                  {/* <PaymentButtons Steps={steps} setSteps={setSteps} t={t} /> */}
                </View>
              ) : (
                <View className="gap-4">
                  <BaseText>{t('payment Methode')}</BaseText>
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
                            getway: Getways?.[0].id,
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
                                  text={item.title}
                                  type={
                                    PaymentMethod?.getway ?? null === item.id
                                      ? 'Fill'
                                      : 'Outline'
                                  }
                                  srcLeft={
                                    item.icon
                                      ? {uri: item.icon}
                                      : item.type === 0
                                      ? require('../../assets/icons/zarinpal.png')
                                      : require('../../assets/icons/payping.png')
                                  }
                                  size="Large"
                                  color="Black"
                                  rounded
                                  onPress={() => {
                                    setPaymentMethod({getway: item.id});
                                  }}
                                />
                              );
                            })}
                          </ScrollView>
                        )
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    disabled={Number(UserCredit?.result ?? 0) <= totalAmount}
                    onPress={() =>
                      setPaymentMethod({
                        isWallet: true,
                        getway: undefined,
                      })
                    }
                    className={`CardBase ${
                      PaymentMethod?.isWallet && '!border-primary-500'
                    } `}>
                    <View className="flex-row items-center justify-between">
                      <BaseText type="subtitle2">{t('PaywithWallet')}</BaseText>
                      <Checkbox
                        disabled={
                          Number(UserCredit?.result ?? 0) <= totalAmount
                        }
                        checked={PaymentMethod?.isWallet === true}
                        onCheckedChange={() =>
                          setPaymentMethod({
                            isWallet: true,
                            getway: undefined,
                          })
                        }
                      />
                    </View>
                    <View className="gap-1">
                      <WalletBalance
                        inWallet
                        NoCredit={
                          Number(UserCredit?.result ?? 0) <= totalAmount
                        }
                      />
                      {Number(UserCredit?.result ?? 0) <= totalAmount && (
                        <BaseText type="badge" color="error">
                          موجودی ناکافی
                        </BaseText>
                      )}
                    </View>
                  </TouchableOpacity>

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
        <PaymentButtons Steps={steps} setSteps={setSteps} t={t} />
      )}
    </View>
  );
};

export default CartScreen;
