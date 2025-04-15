import React from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity, View} from 'react-native';
import {Content} from '../../../services/models/response/UseResrService';
import {ArrowUp, Box1, FlashCircle} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import moment from 'jalali-moment';
import {formatNumber} from '../../../utils/helpers/helpers';
import CreditSubProduct from '../SubProduct';

const CreditCard: React.FC<{data: Content}> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  return (
    <View className="BaseServiceCard">
      <View className="flex-row items-start justify-between pb-4 border-b border-neutral-0 dark:border-neutral-dark-400/50">
        <View className="flex-row items-center  gap-4">
          <View className="w-[44px] h-[44px] items-center justify-center rounded-full bg-supportive1-500/40">
            <FlashCircle size="24" color="#fed376" variant="Bold" />
          </View>
          <View>
            <BaseText type="title4" color="base">
              {data.title}
            </BaseText>
            <View className="flex-row gap-1 items-center">
              <BaseText type="title2" color="base">
                {formatNumber((data?.credit ?? 0) - (data?.usedCredit ?? 0))}
              </BaseText>
              <BaseText type="subtitle3" color="base">
                ریال
              </BaseText>
            </View>
          </View>
        </View>
        <TouchableOpacity className="flex-row gap-1 items-center ">
          <View className="-rotate-45">
            <ArrowUp size="16" color="#55575c" />
          </View>
        </TouchableOpacity>
      </View>
      <View className="pt-3 gap-3">
        <CreditSubProduct
          subProducts={data.product?.subProducts}
          hasSubProduct={data.product?.hasSubProduct}
        />

        <View className="flex-row items-center justify-between">
          <BaseText type="body3" color="secondary">
            {t('start')} {''} : {''}
            {moment(data.start)
              .local(
                // @ts-ignore
                'fa',
              )
              .format('jYYYY/jMM/jDD')}
          </BaseText>
          <BaseText type="body3" color="secondary">
            {t('end')} {''} : {''}
            {moment(data.end)
              .local(
                // @ts-ignore
                'fa',
              )
              .format('jYYYY/jMM/jDD')}
          </BaseText>
        </View>
      </View>
    </View>
  );
};

export default CreditCard;
