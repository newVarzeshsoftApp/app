import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import {useGetUserSaleOrder} from '../../utils/hooks/User/useGetUserSaleOrder';
import {SaleOrderContent} from '../../services/models/response/UseResrService';
import OrderCard from './components/OrderCard';
import {limit} from '../../constants/options';
import BaseText from '../../components/BaseText';

type OrdersScreenProps = NativeStackScreenProps<OrderStackParamList, 'orders'>;

const OrdersScreen: React.FC<OrdersScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<SaleOrderContent[] | []>([]);
  const {data, isLoading, isFetching, isError} = useGetUserSaleOrder({
    limit: limit,
    offset,
    reception: {equals: false},
  });
  const scrollY = useSharedValue(0);
  useEffect(() => {
    if (data?.content) {
      setItems(prevItems => [...prevItems, ...data.content]);
    }
  }, [data]);
  const loadMore = () => {
    if (!isFetching && items.length < (data?.total ?? 5)) {
      setOffset(prevOffset => prevOffset + 1);
    }
  };
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
          range={[0, 100]}
          scrollY={scrollY}
          navigation={navigation}
          title={t('orders')}
        />
      ),
    });
  }, [navigation]);
  return (
    <View className="flex-1 Container pt-[30%] web:pt-20">
      <Animated.FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <OrderCard item={item} navigation={navigation} />
        )}
        onScroll={scrollHandler}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <View style={{padding: 16, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#bcdd64" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View className="flex-1 items-center justify-center flex-row py-10">
              <BaseText type="subtitle1" color="secondary">
                {t('noOrdersFound')}
              </BaseText>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        contentContainerStyle={{
          paddingVertical: 16,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default OrdersScreen;
