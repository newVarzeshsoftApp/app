import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useLayoutEffect} from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Box1} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import {ConvertDuration, formatNumber} from '../../utils/helpers/helpers';
import {UseGetProductByID} from '../../utils/hooks/Product/UseGetProductByID';
import {TruncatedText} from '../../components/TruncatedText';
import {FlatList} from 'react-native-gesture-handler';
import Badge from '../../components/Badge/Badge';
import ShopCreditService from '../../components/cards/shopCard/ShopCreditService';
import ShopServiceCard from '../../components/cards/shopCard/ShopServiceCard';
import {subProducts} from '../../services/models/response/UseResrService';
import {Product} from '../../services/models/response/ProductResService';
import BaseButton from '../../components/Button/BaseButton';
import {useCartContext} from '../../utils/CartContext';
import {navigate} from '../../navigation/navigationRef';
import {useTheme} from '../../utils/ThemeContext';

type ServiceScreenProp = NativeStackScreenProps<
  ShopStackParamList,
  'packageDetail'
>;

const PackageDetail: React.FC<ServiceScreenProp> = ({navigation, route}) => {
  const scrollY = useSharedValue(0);
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Package'});
  const {data, isLoading} = UseGetProductByID(route.params.id);
  const {addToCart} = useCartContext();
  const {theme} = useTheme();
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event?.contentOffset?.y;
    },
  });
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          scrollY={scrollY}
          range={[0, 50]}
          navigation={navigation}
          title={route.params?.title}
        />
      ),
    });
  }, [navigation, scrollY]);
  const cardComponentMapping: Record<number, React.FC<{data: Product}>> = {
    // 0: ProductCard,
    1: ShopServiceCard,
    2: ShopCreditService,
    // 3: ReceptionCard,
    // 4: PackageCard,
  };
  const navigationMapping: Record<number, string> = {
    1: 'serviceDetail',
    2: 'creditDetail',
  };
  const renderItem = useCallback(
    ({item}: {item: subProducts}) => {
      const CardComponent = cardComponentMapping[item?.product?.type!];
      const routeName = navigationMapping[item?.product?.type!];
      if (CardComponent) {
        return (
          <TouchableOpacity
            key={item?.product?.id}
            onPress={() =>
              navigate('Root', {
                screen: 'ShopNavigator',
                params: {
                  screen: routeName as any,
                  params: {
                    id: item?.product?.id ?? 0,
                    title: item?.product?.title ?? '',
                    readonly: true,
                  },
                },
              })
            }>
            <CardComponent key={item?.id} data={item?.product!} />
          </TouchableOpacity>
        );
      }
      return <Text>Unknown type: {item?.product?.type}</Text>;
    },
    [cardComponentMapping],
  );

  const handleAddToCart = useCallback(() => {
    addToCart({product: data!});
    // Navigate to HomeNavigator and open cart screen
    navigate('Root', {screen: 'HomeNavigator', params: {screen: 'cart'}});
  }, [data]);
  return (
    <View className="flex-1">
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/ShadeBlue.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          contentContainerStyle={{flexGrow: 1, paddingBottom: 50}}>
          <SafeAreaView className="flex-1">
            <View className="gap-5 pt-20 pb-6   flex-1 justify-between Container">
              <View className="gap-5">
                {' '}
                {/* Package Detail */}
                <LinearGradient
                  colors={
                    theme === 'light'
                      ? ['rgba(91, 200, 255, 0.5)', '#f0f9ff']
                      : [
                          'rgba(91, 200, 255, 1)',
                          'rgba(91, 200, 255, 0.5)',
                          '#2a2d33',
                        ]
                  }
                  locations={[0, 0, 1]}
                  start={{x: 1, y: 0}}
                  style={{
                    width: '100%',
                    borderRadius: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View className="flex-1 p-[1px] w-full  relative z-10 overflow-hidden ">
                    <View className="flex-1 Container  py-4 px-5  dark:bg-neutral-dark-300 bg-neutral-0/20 rounded-3xl gap-3">
                      <View className="flex-row items-center gap-2">
                        <Box1 size="24" color="#5bc8ff" variant="Bold" />
                        <BaseText type="title3" color="supportive5">
                          {route.params.title}
                        </BaseText>
                      </View>
                      <View className="flex-row items-center justify-between  gap-4">
                        <BaseText type="title4" color="secondaryPurple">
                          {formatNumber(data?.price)} ﷼
                        </BaseText>
                        <View>
                          <BaseText type="subtitle3" color="secondary">
                            {t('Duration')} : {''}
                            {ConvertDuration(data?.duration ?? 0)}
                          </BaseText>
                        </View>
                      </View>
                      {data?.description && (
                        <View className="gap-2">
                          <TruncatedText length={90} text={data?.description} />
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
                <View className="gap-4">
                  <BaseText type="body3" color="secondary">
                    {t('ItemsOfPackage')}
                  </BaseText>
                  <View className="flex flex-row flex-wrap gap-1">
                    {data?.hasSubProduct ? (
                      <FlatList
                        data={data?.subProducts ?? []}
                        keyExtractor={(item, index) => `key-${index}`}
                        //@ts-ignore
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                          <View style={{height: 16}} />
                        )}
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
              </View>
            </View>
          </SafeAreaView>
        </Animated.ScrollView>
      )}
      {!route.params.readonly && (
        <View className="px-4 py-4 absolute bottom-0 w-full z-10">
          <BaseButton
            onPress={handleAddToCart}
            color="Black"
            type="Fill"
            text={t('addToCart')}
            rounded
            size="Large"
          />
        </View>
      )}
    </View>
  );
};

export default PackageDetail;
