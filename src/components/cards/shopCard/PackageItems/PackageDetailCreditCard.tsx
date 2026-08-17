import React from 'react';
import {Pressable, View} from 'react-native';
import {FlashCircle, Gift} from 'iconsax-react-native';
import {Contractors} from '../../../../services/models/response/ProductResService';
import {subProducts} from '../../../../services/models/response/UseResrService';
import BaseText from '../../../BaseText';
import {
  ConvertDuration,
  formatNumber,
  getSubProductDisplayInfo,
} from '../../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import CreditSubProduct from '../../SubProduct';
import PackageDetailItemContractor from './PackageDetailItemContractor';

type PackageDetailCreditCardProps = {
  subProduct: subProducts;
  selectedContractor?: Contractors | null;
  onPressCard: () => void;
  onSelectContractor?: () => void;
  isGift?: boolean;
  isContractorRequired?: boolean;
  showDetailData?: boolean;
  showContractor?: boolean;
};

const PackageDetailCreditCard: React.FC<PackageDetailCreditCardProps> = ({
  subProduct,
  selectedContractor = null,
  onPressCard,
  onSelectContractor,
  isGift,
  isContractorRequired = true,
  showDetailData = true,
  showContractor = false,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.creditService'});
  const {t: tPackage} = useTranslation('translation', {
    keyPrefix: 'Shop.Package',
  });
  const product = subProduct.product;
  const display = getSubProductDisplayInfo(subProduct);

  const content = (
    <>
      <View className="pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50 gap-3">
        <View className="flex-row items-center gap-4">
          <View className="w-[44px] h-[44px] items-center justify-center rounded-full bg-supportive1-500/40">
            {isGift ? (
              <Gift size="28" color="#fed376" variant="Bold" />
            ) : (
              <FlashCircle size="28" color="#fed376" variant="Bold" />
            )}
          </View>
          {showDetailData ? (
            <View>
              <BaseText type="title3" color="base">
                {formatNumber(display.price)} ﷼
              </BaseText>
            </View>
          ) : null}
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <BaseText
            type="title4"
            color="supportive1"
            className="max-w-[200px] line-clamp-1">
            {product?.title ?? ''}
          </BaseText>
          <View>
            <BaseText type="subtitle3" color="secondary">
              {t('Duration')} : {ConvertDuration(display.duration)}
            </BaseText>
          </View>
        </View>
        {display.credit != null && display.credit > 0 ? (
          <BaseText type="body3" color="secondary">
            {tPackage('CreditAmount', {amount: formatNumber(display.credit)})}
          </BaseText>
        ) : null}
      </View>
      <View className="pt-3 gap-3">
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle3" color="secondary">
            {t('usedFor')}
          </BaseText>
          {(product?.subProducts?.length ?? 0) > 0 ? (
            <BaseText type="subtitle3" color="muted">
              {t('IncludesCount', {count: product?.subProducts?.length ?? 0})}
            </BaseText>
          ) : null}
        </View>
        <CreditSubProduct
          inCard
          subProducts={product?.subProducts}
          hasSubProduct={product?.hasSubProduct}
        />
      </View>
    </>
  );

  return (
    <View className="BaseServiceCard">
      {showDetailData ? (
        <Pressable onPress={onPressCard}>{content}</Pressable>
      ) : (
        <View>{content}</View>
      )}

      {showContractor && onSelectContractor ? (
        <PackageDetailItemContractor
          selectedContractor={selectedContractor}
          onSelectPress={onSelectContractor}
          isContractorRequired={isContractorRequired}
        />
      ) : null}
    </View>
  );
};

export default PackageDetailCreditCard;
