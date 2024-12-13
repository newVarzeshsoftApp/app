import React, {useEffect, useLayoutEffect, useState} from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useGetTransaction} from '../../utils/hooks/User/useGetTransaction';
import {limit} from '../../constants/options';
import {
  SaleTransaction,
  Transaction,
} from '../../services/models/response/UseResrService';
import BaseText from '../../components/BaseText';
import TransactionCard from './components/TransactionCard';

type SaleItemDetailProps = NativeStackScreenProps<
  OrderStackParamList,
  'transaction'
>;
const TransactionScreen: React.FC<SaleItemDetailProps> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<SaleTransaction[] | []>([]);
  const {data, isLoading, isFetching, isError} = useGetTransaction({
    limit: limit,
    offset,
  });
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
  const scrollY = useSharedValue(0);

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
          title={t('transactions')}
        />
      ),
    });
  }, [navigation, scrollY]);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  return (
    <View style={{flex: 1}}>
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/purpelShade.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/purpelShade.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>

      <View className="flex-1 Container pt-[30%] web:pt-20">
        <Animated.FlatList
          data={items}
          keyExtractor={(item, index) => item.id.toString() || index.toString()}
          renderItem={({item}) => <TransactionCard item={item} />}
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
    </View>
  );
};

export default TransactionScreen;
