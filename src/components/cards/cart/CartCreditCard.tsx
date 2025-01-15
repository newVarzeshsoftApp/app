import {FlashCircle, Trash} from 'iconsax-react-native';
import React, {useRef} from 'react';
import {Text, View} from 'react-native';
import BaseText from '../../BaseText';
import {Product} from '../../../services/models/response/ProductResService';
import BaseButton from '../../Button/BaseButton';
import {
  convertToPersianTimeLabel,
  formatNumber,
} from '../../../utils/helpers/helpers';
import {CartItem} from '../../../utils/helpers/CartStorage';
import {useCart} from '../../../utils/hooks/Carthook';
import {useTranslation} from 'react-i18next';
import Badge from '../../Badge/Badge';
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';
import {useCartContext} from '../../../utils/CartContext';
type CartCreditCardProps = {
  data: CartItem;
};
const CartCreditCard: React.FC<CartCreditCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {product, quantity, CartId} = data;
  const {updateItemQuantity, removeFromCart} = useCartContext();
  const RemoveItemRef = useRef<BottomSheetMethods>(null);
  return (
    <>
      <BottomSheet
        Title={t('Confirm removal')}
        ref={RemoveItemRef}
        snapPoints={[30]}
        buttonText="لغو"
        onButtonPress={() => RemoveItemRef.current?.close()}
        deleteButtonText="حذف"
        onDeleteButtonPress={() => {
          removeFromCart(CartId);
          RemoveItemRef.current?.close();
        }}
      />

      <View className="CardBase">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <FlashCircle size="24" color="#fed376" variant="Bold" />
            <BaseText type="subtitle2" color="supportive1">
              {product.title}
            </BaseText>
          </View>
          <BaseButton
            noText
            onPress={() => RemoveItemRef.current?.expand()}
            type="Tonal"
            color="Black"
            LeftIcon={Trash}
            redbutton
          />
        </View>
        <View className="flex-row items-center justify-between gap-2 border-b border-neutral-0 dark:border-neutral-dark-400/50 pb-4">
          <View className="flex-row items-center gap-4 ">
            <BaseButton
              onPress={() => {
                updateItemQuantity({cartId: CartId, quantity: quantity + 1});
              }}
              type="Tonal"
              color="Black"
              text="+"
            />
            <BaseText type="subtitle2" color="base">
              {quantity}
            </BaseText>
            <BaseButton
              type="Tonal"
              color="Black"
              text="-"
              onPress={() => {
                updateItemQuantity({
                  cartId: CartId,
                  quantity: quantity === 1 ? quantity : quantity - 1,
                });
              }}
            />
          </View>
          <BaseText type="subtitle2" color="base">
            {formatNumber(product.price)} ﷼
          </BaseText>
        </View>

        <View className="gap-4">
          <BaseText type="subtitle2" color="secondaryPurple">
            {t('order Detail')}
          </BaseText>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('Duration')} :
              </BaseText>
              <BaseText type="subtitle3" color="base">
                {convertToPersianTimeLabel(product.duration)}
              </BaseText>
            </View>
            <BaseText type="subtitle3" color="secondary">
              {t('usedFor')}
            </BaseText>
            <View className="flex-row items-center gap-1 flex-wrap">
              {product?.hasSubProduct ? (
                product?.subProducts?.map((item, index) => {
                  return (
                    <Badge
                      key={index}
                      defaultMode
                      textColor="secondaryPurple"
                      value={item.product?.title ?? ''}
                      className="w-fit"
                    />
                  );
                })
              ) : (
                <Badge
                  defaultMode
                  textColor="secondaryPurple"
                  value={t('noLimit')}
                  className="w-fit"
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default CartCreditCard;
