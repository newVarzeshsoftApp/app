import React, {useCallback} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import {Product} from '../../../services/models/response/ProductResService';
import {Box1} from 'iconsax-react-native';
import BaseText from '../../BaseText';
import Badge from '../../Badge/Badge';
import {ConvertDuration, formatNumber} from '../../../utils/helpers/helpers';
import {useTranslation} from 'react-i18next';
import {TruncatedText} from '../../TruncatedText';
import {
  Content,
  subProducts,
} from '../../../services/models/response/UseResrService';
import PackageCreditCard from './PackageItems/PackageCreditCard';
import PackageServiceCard from './PackageItems/PackageServiceCard';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ShopStackParamList} from '../../../utils/types/NavigationTypes';
type ShopServiceProps = {
  data: Product;
};
type NavigationProps = NativeStackNavigationProp<
  ShopStackParamList,
  'packageService'
>;
const ShopPackageService: React.FC<ShopServiceProps> = ({data}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Package'});
  const navigation = useNavigation<NavigationProps>();

  const cardComponentMapping: Record<number, React.FC<{data: subProducts}>> = {
    // 0: ProductCard,
    1: PackageServiceCard,
    2: PackageCreditCard,
    // 3: ReceptionCard,
    // 4: PackageCard,
  };
  const navigationMapping: Record<number, string> = {
    1: 'serviceDetail',
    2: 'creditDetail',
  };
  const renderItem = useCallback(
    ({item}: {item: subProducts}) => {
      const CardComponent = cardComponentMapping[item.product?.type!];
      const routeName = navigationMapping[item.product?.type!];
      if (CardComponent) {
        return (
          <TouchableOpacity
            key={item.product?.id}
            onPress={() =>
              //@ts-ignore
              navigation.push(routeName, {
                id: item.product?.id,
                title: item.product?.title,
                canBuy: false,
              })
            }>
            <CardComponent key={item.id} data={item} />
          </TouchableOpacity>
        );
      }
      return <Text>Unknown type: {item.product?.type}</Text>;
    },
    [cardComponentMapping],
  );
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
              {ConvertDuration(data?.duration ?? 0)}
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
            {data.hasSubProduct ? (
              <FlatList
                data={data?.subProducts ?? []}
                keyExtractor={(item, index) => `key-${index}`}
                renderItem={renderItem}
                horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{width: 16}} />}
                scrollEventThrottle={16}
                style={{flex: 1}}
              />
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
