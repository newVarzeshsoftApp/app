import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGetCategory} from '../../utils/hooks/Category/useGetCategory';
import {limit, ProductType} from '../../constants/options';
import BaseButton from '../../components/Button/BaseButton';
import {Category} from '../../services/models/response/CategoryResService';
import {UseGetProduct} from '../../utils/hooks/Product/UseGetProduct';
import {Product} from '../../services/models/response/ProductResService';
import BaseText from '../../components/BaseText';
import CategoryList from './components/CategoryList';
import {manualItem} from './constant/constant';
import ShopCreditService from '../../components/cards/shopCard/ShopCreditService';

type CreditDetailProp = NativeStackScreenProps<
  ShopStackParamList,
  'creditService'
>;
const CreditServiceSreen: React.FC<CreditDetailProp> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.creditService'});
  const scrollY = useSharedValue(0);
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
          CenterText
          range={[0, 50]}
          scrollY={scrollY}
          title={t('creditService')}
          navigation={navigation}
        />
      ),
    });
  }, [navigation]);
  const [SelectedCategory, setSelectedCategory] =
    useState<Category>(manualItem);
  const {data: CategoryData, isLoading: CategoryIsLoading} = useGetCategory({
    type: {equals: ProductType.Credit},
  });
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<Product[]>([]);
  const augmentedCategoryData = CategoryData
    ? [manualItem, ...CategoryData]
    : [];
  const {
    data: ProductData,
    isLoading: ProductIsLoading,
    isError: ProductIsError,
    isFetching: ProductDataIsFetching,
  } = UseGetProduct({
    type: {equals: ProductType.Credit},
    limit: limit,
    offset,
    category: {
      equals: SelectedCategory.id.toString(),
    },
  });
  useEffect(() => {
    setOffset(0);
    setData([]);
  }, [SelectedCategory]);
  useEffect(() => {
    if (ProductData?.content) {
      setData(prevItems => [...prevItems, ...ProductData.content]);
    }
  }, [ProductData]);
  const loadMore = () => {
    if (
      !ProductIsError &&
      !ProductDataIsFetching &&
      data.length < (ProductData?.total ?? 5)
    ) {
      setOffset(prevOffset => prevOffset + 1);
    }
  };

  return (
    <View className="flex-1 ">
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/YellowShade.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/YellowShade.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>

      <Animated.FlatList
        data={data}
        ListHeaderComponent={
          <CategoryList
            data={augmentedCategoryData}
            selectedCategory={SelectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        }
        onEndReached={loadMore}
        keyExtractor={(item, index) => `key-${index}`}
        renderItem={({item}) => (
          <View className="Container">
            <TouchableOpacity
              onPress={() =>
                navigation.push('creditDetail', {
                  id: item.id,
                  title: item.title,
                })
              }>
              <ShopCreditService data={item} />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{flex: 1}}
        ListFooterComponent={
          ProductIsLoading ? (
            <View style={{marginTop: 16, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#bcdd64" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !ProductIsLoading && !ProductIsError ? (
            <View className="flex-1 items-center justify-center flex-row py-10">
              <BaseText type="subtitle1" color="secondary">
                {t('noServicesFound')}
              </BaseText>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        ListFooterComponentStyle={{
          paddingBottom: Platform.OS === 'web' ? 60 : 20,
        }}
        contentContainerStyle={{
          paddingTop: 80,
          paddingBottom: ProductIsLoading ? 40 : 20,
        }}
      />
    </View>
  );
};

export default CreditServiceSreen;
