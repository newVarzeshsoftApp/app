import React from 'react';
import {View} from 'react-native';
import {Product} from '../../../services/models/response/ProductResService';
import {FlashCircle, Gift} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import CreditSubProduct from '../SubProduct';
type ShopServiceProps = {
  data: Product;
  isGift?: boolean;
};
const ShopCreditService: React.FC<ShopServiceProps> = ({data, isGift}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.creditService'});

  return (
    <View className="BaseServiceCard">
      <View className=" pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50 gap-3">
        <View className="flex-row items-center  gap-4">
          <View className="w-[44px] h-[44px] items-center justify-center rounded-full bg-supportive1-500/40">
            {isGift ? (
              <Gift size="28" color="#fed376" variant="Bold" />
            ) : (
              <FlashCircle size="28" color="#fed376" variant="Bold" />
            )}
          </View>

          <View>
            <BaseText type="title3" color="base">
              {formatNumber(data.price)} ﷼
            </BaseText>
          </View>
        </View>
        <View className="flex-row items-center justify-between  gap-4">
          <BaseText
            type="title4"
            color="supportive1"
            className="max-w-[200px] line-clamp-1">
            {data.title}
          </BaseText>
          <View>
            <BaseText type="subtitle3" color="secondary">
              {t('Duration')} : {''}
              {ConvertDuration(data?.duration ?? 0)}
            </BaseText>
          </View>
        </View>
      </View>
      <View className="pt-3 gap-3">
        <View className="flex-row items-center justify-between">
          <BaseText type="subtitle3" color="secondary">
            {t('usedFor')}
          </BaseText>
          {(data?.subProducts?.length ?? 0) > 0 && (
            <BaseText type="subtitle3" color="muted">
              {t('IncludesCount', {count: data?.subProducts?.length ?? 0})}
            </BaseText>
          )}
        </View>
        <CreditSubProduct
          inCard
          subProducts={data?.subProducts}
          hasSubProduct={data?.hasSubProduct}
        />
      </View>
    </View>
  );
};

export default ShopCreditService;
