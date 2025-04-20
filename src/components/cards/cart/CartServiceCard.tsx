import React, {useRef} from 'react';
import {View} from 'react-native';
import {CartItem} from '../../../utils/helpers/CartStorage';
import {useTranslation} from 'react-i18next';
import {Trash} from 'iconsax-react-native';
import BaseButton from '../../Button/BaseButton';
import BaseText from '../../BaseText';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';
import ContractorInfo from '../../ContractorInfo/ContractorInfo';
import {useCartContext} from '../../../utils/CartContext';
import usePriceCalculations from '../../../utils/hooks/usePriceCalculations';
import ResponsiveImage from '../../ResponsiveImage';
type CartServiceCardProps = {
  data: CartItem;
};
const CartServiceCard: React.FC<CartServiceCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {product, quantity, CartId, SelectedContractor, SelectedPriceList} =
    data;
  const {updateItemQuantity, removeFromCart} = useCartContext();
  const RemoveItemRef = useRef<BottomSheetMethods>(null);
  const {Discount, PricePreSession, Tax, Total, purchaseProfit, shopGift} =
    usePriceCalculations({data: product, SelectedPriceList});
  return (
    <>
      <BottomSheet
        Title={t('Confirm removal')}
        ref={RemoveItemRef}
        snapPoints={[25]}
        buttonText="لغو"
        onButtonPress={() => RemoveItemRef.current?.close()}
        deleteButtonText="حذف"
        onDeleteButtonPress={() => {
          CartId && removeFromCart(CartId);
          RemoveItemRef.current?.close();
        }}
      />
      <View className="CardBase gap-3">
        <View className="w-full h-[185px] bg-neutral-0 dark:bg-neutral-dark-0 rounded-3xl  relative overflow-hidden">
          {product.image!.name && (
            <ResponsiveImage
              customSource={{default: product.image!.name}}
              ImageType="Media"
              resizeMode="cover"
              style={{width: '100%', height: 200}}
            />
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle2" color="base">
            {product.title}
          </BaseText>
          <BaseButton
            noText
            onPress={() => RemoveItemRef.current?.expand()}
            type="Tonal"
            color="Black"
            LeftIcon={Trash}
            redbutton
          />
        </View>
        {SelectedContractor && (
          <View>
            <ContractorInfo
              firstName={SelectedContractor?.contractor?.firstName}
              lastName={SelectedContractor?.contractor?.lastName}
              imageName={SelectedContractor?.contractor?.profile?.name}
              gender={SelectedContractor?.contractor?.gender}
            />
          </View>
        )}
        <View className="flex-row items-center justify-between gap-2 border-b border-neutral-0 dark:border-neutral-dark-400/50 pb-4">
          <View className="flex-row items-center gap-4 ">
            <BaseButton
              onPress={() =>
                CartId &&
                updateItemQuantity({cartId: CartId, quantity: quantity + 1})
              }
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
              onPress={() =>
                CartId &&
                updateItemQuantity({
                  cartId: CartId,
                  quantity: quantity === 1 ? quantity : quantity - 1,
                })
              }
            />
          </View>
          <BaseText type="subtitle2" color="base">
            {formatNumber(Total + Tax)} ﷼
          </BaseText>
        </View>
        <View className="gap-4">
          <BaseText type="subtitle2" color="secondaryPurple">
            {t('order Detail')}
          </BaseText>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('Number of sessions')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {SelectedPriceList?.min} جلسه
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('Duration')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {ConvertDuration(SelectedPriceList?.duration ?? 1)}
            </BaseText>
          </View>
          <View className="flex-row items-center justify-between">
            <BaseText type="subtitle3" color="secondary">
              {t('SingleservicePrice')} :
            </BaseText>
            <BaseText type="subtitle3" color="base">
              {formatNumber(PricePreSession)} ﷼
            </BaseText>
          </View>
          {Tax > 0 && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('tax')} :
              </BaseText>
              <BaseText type="subtitle3" color="base">
                {formatNumber(Tax)} ﷼
              </BaseText>
            </View>
          )}
          {product.isCashBack && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="supportive2">
                {t('shopGift')} :
              </BaseText>
              <BaseText type="subtitle3" color="supportive2">
                {formatNumber(shopGift)} ﷼
              </BaseText>
            </View>
          )}
          {purchaseProfit > 0 && (
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('Purchase profit')} :
              </BaseText>
              <BaseText type="subtitle3" color="success">
                {formatNumber(purchaseProfit ?? 0)} ﷼
              </BaseText>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

export default CartServiceCard;
