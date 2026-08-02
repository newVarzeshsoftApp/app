import React, {useRef} from 'react';
import {View} from 'react-native';
import BaseText from '../../BaseText';

import {useTranslation} from 'react-i18next';
import {CartItem} from '../../../utils/helpers/CartStorage';
import BaseButton from '../../Button/BaseButton';
import {Box1, Trash} from 'iconsax-react-native';
import {
  convertToPersianTimeLabel,
  formatNumber,
  getPackageFinalPrice,
} from '../../../utils/helpers/helpers';
import Badge from '../../Badge/Badge';
import BottomSheet, {BottomSheetMethods} from '../../BottomSheet/BottomSheet';
import {useCartContext} from '../../../utils/CartContext';
import ContractorInfo from '../../ContractorInfo/ContractorInfo';
import CartExpiryNotice from './CartExpiryNotice';
import {useDefaultCartItemRemainingTime} from '../../../utils/hooks/useDefaultCartItemRemainingTime';

type CartPackageCardProps = {
  data: CartItem;
};

const CartPackageCard: React.FC<CartPackageCardProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Cart'});
  const {updateItemQuantity, removeFromCart} = useCartContext();
  const {product, quantity, CartId, packageContractorData, SelectedContractor} =
    data;
  const RemoveItemRef = useRef<BottomSheetMethods>(null);
  const showPackageLevelContractor =
    !!product?.hasContractor && !!SelectedContractor;
  const remainingMinutes = useDefaultCartItemRemainingTime(data);

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
          CartId && removeFromCart(CartId);
          RemoveItemRef.current?.close();
        }}
      />
      <View className="CardBase">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Box1 size="24" color="#5bc8ff" variant="Bold" />
            <BaseText type="subtitle2" color="supportive5">
              {product?.title ?? ''}
            </BaseText>
          </View>
          <BaseButton
            noText
            type="Tonal"
            color="Black"
            LeftIcon={Trash}
            onPress={() => RemoveItemRef.current?.expand()}
            redbutton
          />
        </View>
        {showPackageLevelContractor ? (
          <ContractorInfo
            firstName={SelectedContractor?.contractor?.firstName}
            lastName={SelectedContractor?.contractor?.lastName}
            imageName={SelectedContractor?.contractor?.profile?.name}
            gender={SelectedContractor?.contractor?.gender}
          />
        ) : null}
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
            {formatNumber(getPackageFinalPrice(product))} ﷼
          </BaseText>
        </View>

        <View className="gap-4">
          <BaseText type="subtitle3" color="secondaryPurple">
            {t('order Detail')}
          </BaseText>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <BaseText type="subtitle3" color="secondary">
                {t('Duration')}
              </BaseText>
              <BaseText type="subtitle3" color="base">
                {convertToPersianTimeLabel(product?.duration ?? 0)}
              </BaseText>
            </View>
            <BaseText type="subtitle3" color="secondary">
              {t('ItemsOfPackage')}
            </BaseText>
            <View className="gap-2">
              {product?.hasSubProduct ? (
                product.subProducts?.map((item, index) => {
                  const itemContractor =
                    packageContractorData?.itemContractors?.find(
                      entry => entry.productId === item.product?.id,
                    );
                  const contractorName = itemContractor
                    ? `${itemContractor.firstName ?? ''} ${
                        itemContractor.lastName ?? ''
                      }`.trim()
                    : '';
                  const showItemContractor =
                    !!item.product?.hasContractor &&
                    !!itemContractor &&
                    !!contractorName;

                  if (!showItemContractor) {
                    return (
                      <Badge
                        key={`item-${index}`}
                        CreditMode={item.product?.type === 2}
                        defaultMode
                        textColor="supportive5"
                        className="w-fit"
                        value={item.product?.title ?? ''}
                      />
                    );
                  }

                  return (
                    <View
                      key={`item-${index}`}
                      className="flex-row items-center justify-between gap-2">
                      <Badge
                        CreditMode={item.product?.type === 2}
                        defaultMode
                        textColor="supportive5"
                        className="w-fit shrink"
                        value={item.product?.title ?? ''}
                      />
                      <ContractorInfo
                        fullName={contractorName}
                        imageName={itemContractor.imageName}
                        gender={itemContractor.gender}
                      />
                    </View>
                  );
                })
              ) : (
                <Badge
                  color="secondary"
                  value={'بدون ساب پروداکت'}
                  className="w-fit"
                />
              )}
            </View>
          </View>
        </View>
        <CartExpiryNotice mode="default" remainingMinutes={remainingMinutes} />
      </View>
    </>
  );
};

export default CartPackageCard;
