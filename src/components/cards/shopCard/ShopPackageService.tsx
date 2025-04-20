import React, {useCallback} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {Product} from '../../../services/models/response/ProductResService';
import {Box1} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import Badge from '../../Badge/Badge';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import {TruncatedText} from '../../TruncatedText';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ShopStackParamList} from '../../../utils/types/NavigationTypes';
import {ScrollView} from 'react-native-gesture-handler';
type ShopServiceProps = {
  data: Product;
};
type NavigationProps = NativeStackNavigationProp<
  ShopStackParamList,
  'packageService'
>;
const ShopPackageService: React.FC<ShopServiceProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Package'});

  return (
    <View className="BaseServiceCard h-full">
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
              {ConvertDuration(data?.duration ?? 0)}
            </BaseText>
          </View>
        </View>
      </View>
      <View className="pt-4 gap-4">
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <BaseText type="body3" color="secondary">
              {t('ItemsOfPackage')}
            </BaseText>
            {(data?.subProducts?.length ?? 0) > 0 && (
              <BaseText type="subtitle3" color="muted">
                {t('IncludesCount', {count: data?.subProducts?.length ?? 0})}
              </BaseText>
            )}
          </View>

          <View className="flex-row gap-2 max-w-[310px] flex-wrap">
            {data?.hasSubProduct ? (
              data?.subProducts?.map((item, index) => (
                <Badge
                  key={index}
                  CreditMode={item.product?.type === 2}
                  defaultMode
                  textColor="supportive5"
                  className="w-fit"
                  value={item.product?.title ?? ''}
                />
              ))
            ) : (
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
            <TruncatedText length={90} text={data.description} />
          </View>
        )}
      </View>
    </View>
  );
};

export default ShopPackageService;
