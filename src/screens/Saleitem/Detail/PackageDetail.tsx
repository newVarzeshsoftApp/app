import React, {useCallback, useLayoutEffect} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Content} from '../../../services/models/response/UseResrService';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SaleItemStackParamList} from '../../../utils/types/NavigationTypes';
import {RouteProp} from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../../components/header/NavigationHeader';
import {Box1, RepeatCircle} from 'iconsax-react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import BaseButton from '../../../components/Button/BaseButton';
import Badge from '../../../components/Badge/Badge';
import moment from 'jalali-moment';
import {useGetUserSaleItem} from '../../../utils/hooks/User/useGetUserSaleItem';
import ProductCard from '../../../components/cards/Service/ProductCard';
import ServiceCard from '../../../components/cards/Service/ServiceCard';
import CreditCard from '../../../components/cards/Service/CreditCard';
import ReceptionCard from '../../../components/cards/Service/ReceptionCard';
import PackageCard from '../../../components/cards/Service/PackageCard';
type PackageDetailProp = NativeStackNavigationProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
type PackageDetailRouteProp = RouteProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
interface PackageDetailProps {
  data: Content;
  navigation: PackageDetailProp;
  route: PackageDetailRouteProp;
}
const PackageDetail: React.FC<PackageDetailProps> = ({
  data,
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Detail'});
  const {data: userSaleItem, isLoading: userIsloading} = useGetUserSaleItem({
    parent: data.id,
  });
  const scrollY = useSharedValue(0);
  const cardComponentMapping: Record<number, React.FC<{data: Content}>> = {
    0: ProductCard,
    1: ServiceCard,
    2: CreditCard,
    3: ReceptionCard,
    4: PackageCard,
  };

  const renderItem = useCallback(
    ({item}: {item: Content}) => {
      const CardComponent = cardComponentMapping[item.type!];
      if (CardComponent) {
        return (
          <TouchableOpacity
            key={item.product?.id}
            onPress={() =>
              navigation.push('saleItemDetail', {
                // screen: 'saleItemDetail',
                id: item.id,
                title: item.title || 'undefined',
              })
            }>
            <CardComponent key={item.id} data={item} />
          </TouchableOpacity>
        );
      }
      return <Text>Unknown type: {item.type}</Text>;
    },
    [cardComponentMapping],
  );
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,

      header: () => (
        <NavigationHeader
          range={[0, 100]}
          scrollY={scrollY}
          title={data.title}
          navigation={navigation}
        />
      ),
    });
  }, [navigation]);
  return (
    <View className="flex-1">
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        style={{flex: 1}}>
        <SafeAreaView>
          <View className="gap-8 pt-20 pb-6  Container">
            <View className="p-5 rounded-3xl gap-8 items-center relative bg-white/80 dark:bg-neutral-dark-300/80 shadow-custom  border border-white dark:border-neutral-dark-300">
              <View className="absolute -top-[22px]   left-1/2 transform web:-translate-x-1/2 w-[44px] h-[44px] items-center justify-center rounded-full bg-supportive5-500/40">
                <Box1 size="24" color="#5bc8ff" variant="Bold" />
              </View>
              <View className="items-center w-full pt-4 flex-1 gap-5">
                <BaseText type="title3" color="supportive5">
                  {data.title}
                </BaseText>
                <BaseButton
                  type="Fill"
                  color="Supportive5-Blue"
                  size="Medium"
                  text={t('Renewal')}
                  LeftIcon={RepeatCircle}
                  rounded
                  LeftIconVariant="Bold"
                  Extraclass=" w-full max-w-[160px] "
                />
              </View>

              <View className="gap-5 flex-1 w-full">
                <View className="flex flex-row flex-wrap gap-1">
                  {userSaleItem && userSaleItem.content.length > 0 ? (
                    userSaleItem.content?.map((item, index) => {
                      return (
                        <Badge
                          key={index}
                          CreditMode={item.product?.type === 2 ? true : false}
                          defaultMode
                          textColor="supportive5"
                          className="w-fit"
                          value={item.product?.title ?? ''}
                        />
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
                <View className="flex-row flex-1 items-center justify-between">
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
            <View className="gap-3">
              <View>
                <BaseText type="title4" color="secondary">
                  {t('Package items')}
                </BaseText>
              </View>
              {userIsloading ? (
                <View className="flex-1 py-10">
                  <ActivityIndicator size="large" color="#bcdd64" />
                </View>
              ) : userSaleItem && userSaleItem.content?.length > 0 ? (
                userSaleItem.content.map((item, index) => {
                  return <>{renderItem({item})}</>;
                })
              ) : (
                <View className="flex-1 py-10 justify-center items-center">
                  <BaseText type="title4" color="secondary">
                    {t('NoHistory')}
                  </BaseText>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Animated.ScrollView>
    </View>
  );
};

export default PackageDetail;
