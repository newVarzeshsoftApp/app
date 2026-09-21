import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
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
import CategoryList, {FilterChipItem} from './components/CategoryList';
import ShopServiceCard from '../../components/cards/shopCard/ShopServiceCard';
import BaseText from '../../components/BaseText';
import {navigate} from '../../navigation/navigationRef';
import {
  useGetOrganizationBySKU,
  useIsMultiOrg,
} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import {productMatchesOrganizationUnit} from '../../utils/helpers/organizationUnits';

type ServiceScreenProp = NativeStackScreenProps<ShopStackParamList, 'service'>;

const ALL_BRANCH_FILTER: FilterChipItem = {
  id: 'all',
  title: 'همه',
};

const ServiceScreen: React.FC<ServiceScreenProp> = ({navigation}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});
  const isMultiOrg = useIsMultiOrg();
  const {data: organization} = useGetOrganizationBySKU();
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
  const [selectedBranch, setSelectedBranch] =
    useState<FilterChipItem>(ALL_BRANCH_FILTER);
  const {data: CategoryData} = useGetCategory({
    type: {equals: ProductType.Service},
  });
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<Product[]>([]);
  const augmentedCategoryData = CategoryData
    ? [manualItem, ...CategoryData]
    : [];
  const branchFilterItems = useMemo<FilterChipItem[]>(() => {
    const units = organization?.organizationUnits ?? [];
    return [
      ALL_BRANCH_FILTER,
      ...units.map(unit => ({
        id: unit.id,
        title: unit.title,
      })),
    ];
  }, [organization?.organizationUnits]);
  const selectedOrganizationUnitId =
    selectedBranch.id === 'all' ? undefined : Number(selectedBranch.id);
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
    if (!ProductData?.content) {
      return;
    }
    setData(prevItems => {
      if (offset === 0) {
        return ProductData.content;
      }
      const existingIds = new Set(prevItems.map(item => item.id));
      const nextItems = ProductData.content.filter(
        item => !existingIds.has(item.id),
      );
      return nextItems.length ? [...prevItems, ...nextItems] : prevItems;
    });
  }, [ProductData, offset]);
  useEffect(() => {
    if (selectedOrganizationUnitId == null) {
      return;
    }
    if (ProductIsLoading || ProductDataIsFetching || ProductIsError) {
      return;
    }
    if (!ProductData) {
      return;
    }
    if (!ProductData.content?.length) {
      return;
    }
    if (data.length < (ProductData.total ?? 0)) {
      setOffset(prevOffset => prevOffset + limit);
    }
  }, [
    selectedOrganizationUnitId,
    ProductIsLoading,
    ProductDataIsFetching,
    ProductIsError,
    ProductData,
    data.length,
  ]);
  const visibleData = useMemo(
    () =>
      data.filter(item =>
        productMatchesOrganizationUnit(item, selectedOrganizationUnitId),
      ),
    [data, selectedOrganizationUnitId],
  );
  const isLoadingMorePages =
    selectedOrganizationUnitId != null &&
    (ProductIsLoading || ProductDataIsFetching) &&
    data.length < (ProductData?.total ?? 0);
  const loadMore = () => {
    if (
      !ProductIsError &&
      !ProductDataIsFetching &&
      data.length < (ProductData?.total ?? 5)
    ) {
      setOffset(prevOffset => prevOffset + limit);
    }
  };

  return (
    <View className="flex-1  ">
      <Animated.FlatList
        data={visibleData}
        onScroll={scrollHandler}
        ListHeaderComponent={
          <View>
            <CategoryList
              data={augmentedCategoryData}
              selectedCategory={SelectedCategory}
              onCategorySelect={setSelectedCategory}
              paddingBottom={isMultiOrg ? 8 : 24}
            />
            {isMultiOrg ? (
              <CategoryList
                data={branchFilterItems}
                selectedCategory={selectedBranch}
                onCategorySelect={setSelectedBranch}
                paddingTop={0}
              />
            ) : null}
          </View>
        }
        onEndReached={loadMore}
        keyExtractor={(item, index) => `key-${index}`}
        renderItem={({item}) => (
          <View className="Container">
            <TouchableOpacity
              onPress={() =>
                navigate('Root', {
                  screen: 'ShopNavigator',
                  params: {
                    screen: 'serviceDetail',
                    params: {id: item.id, title: item.title},
                  },
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
          ProductIsLoading || isLoadingMorePages ? (
            <View style={{marginTop: 16, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#bcdd64" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !ProductIsLoading && !ProductIsError && !isLoadingMorePages ? (
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
          paddingBottom: ProductIsLoading || isLoadingMorePages ? 40 : 20,
        }}
      />
    </View>
  );
};

export default ServiceScreen;
