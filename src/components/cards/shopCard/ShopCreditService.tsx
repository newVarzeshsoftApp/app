import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Product} from '../../../services/models/response/ProductResService';
import {ArrowUp, FlashCircle} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import {
  calculateRemainingDays,
  ConvertDuration,
  formatNumber,
} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import Badge from '../../Badge/Badge';
type ShopServiceProps = {
  data: Product;
};
const ShopCreditService: React.FC<ShopServiceProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.creditService'});

  return (
    <View className="BaseServiceCard">
      <View className=" pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50 gap-3">
        <View className="flex-row items-center  gap-4">
          <FlashCircle size="28" color="#fed376" variant="Bold" />
          <View>
            <BaseText type="title3" color="base">
              {formatNumber(data.price)} ﷼
            </BaseText>
          </View>
        </View>
        <View className="flex-row items-center justify-between  gap-4">
          <BaseText type="title4" color="supportive1">
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
        <View className="flex-row items-center gap-1">
          {data.hasSubProduct ? (
            data.subProducts?.map((item, index) => {
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
  );
};

export default ShopCreditService;
