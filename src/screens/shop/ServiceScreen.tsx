import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import {useTranslation} from 'react-i18next';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useGetCategory} from '../../utils/hooks/Category/useGetCategory';
import {limit, ProductType} from '../../constants/options';
import {Category} from '../../services/models/response/CategoryResService';
import {manualItem} from './constant/constant';
import {Product} from '../../services/models/response/ProductResService';
import {UseGetProduct} from '../../utils/hooks/Product/UseGetProduct';
import CategoryList from './components/CategoryList';
import ShopServiceCard from '../../components/cards/shopCard/ShopServiceCard';
import BaseText from '../../components/BaseText';

type ServiceScreenProp = NativeStackScreenProps<ShopStackParamList, 'service'>;
const ServiceScreen: React.FC<ServiceScreenProp> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});
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
          title={t('service')}
          navigation={navigation}
        />
      ),
    });
  }, [navigation]);

  const [SelectedCategory, setSelectedCategory] =
    useState<Category>(manualItem);
  const {data: CategoryData, isLoading: CategoryIsLoading} = useGetCategory({
    type: {equals: ProductType.Service},
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
    type: {equals: ProductType.Service},
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
    <View className="flex-1  ">
      <Animated.FlatList
        data={data}
        onScroll={scrollHandler}
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
                navigation.push('serviceDetail', {
                  id: item.id,
                  title: item.title,
                })
              }>
              <ShopServiceCard data={item} />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
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
        ListFooterComponentStyle={{
          paddingBottom: Platform.OS === 'web' ? 60 : 20,
        }}
        contentContainerStyle={{
          paddingTop: 80,
          flexGrow: 1,
          paddingBottom: ProductIsLoading ? 40 : 20,
        }}
      />
    </View>
  );
};

export default ServiceScreen;
