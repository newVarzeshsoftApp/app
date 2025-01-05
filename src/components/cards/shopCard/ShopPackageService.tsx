import React from 'react';
import {Text, View} from 'react-native';
import {Product} from '../../../services/models/response/ProductResService';
import {Box1} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import Badge from '../../Badge/Badge';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import {TruncatedText} from '../../TruncatedText';
type ShopServiceProps = {
  data: Product;
};
const ShopPackageService: React.FC<ShopServiceProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Package'});

  return (
    <View className="BaseServiceCard">
      <View className="gap-4 pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50 ">
        <View className="flex-row items-center  gap-4">
          <Box1 size="28" color="#5bc8ff" variant="Bold" />
          <BaseText type="title4" color="supportive5">
            {data.title}
          </BaseText>
        </View>
        <View className="flex-row items-center justify-between  gap-4">
          <BaseText type="title4" color="secondaryPurple">
            {formatNumber(data.price)} ﷼
          </BaseText>
          <View>
            <BaseText type="subtitle3" color="secondary">
              {t('Duration')} : {''}
              {data.duration === 0
                ? t('noLimitForTime')
                : ConvertDuration(data.duration)}
            </BaseText>
          </View>
        </View>
      </View>
      <View className="pt-4 gap-4">
        <View className="gap-2">
          <BaseText type="body3" color="secondary">
            {t('ItemsOfPackage')}
          </BaseText>
          <View className="flex flex-row flex-wrap gap-1">
            {data.hasSubProduct ? null : ( // }) //   ); //     /> //       value={item.product?.title ?? ''} //       className="w-fit" //       textColor="supportive5" //       defaultMode //       CreditMode={item.product?.type === 2 ? true : false} //       key={index} //     <Badge //   return ( // data.product?.subProducts?.map((item, index) => {
              <Badge
                color="secondary"
                value={'بدون ساب پروداکت'}
                className="w-fit"
              />
            )}
          </View>
        </View>
        {data.description && (
          <View className="gap-2">
            <BaseText type="body3" color="secondary">
              {t('description')}
            </BaseText>
            <TruncatedText
              moreText={t('more')}
              length={90}
              text={data.description}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default ShopPackageService;
