import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Dimensions, Text, View} from 'react-native';
import {PaymentRecord} from '../../services/models/response/UseResrService';
import {useGetUserPayment} from '../../utils/hooks/User/useGetuserPaymant';
import {limit} from '../../constants/options';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import PaymentCard from './components/PaymentCard';
type PaymentsScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  'payments'
>;
const PaymentsScreen: React.FC<PaymentsScreenProps> = ({navigation}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<PaymentRecord[] | []>([]);
  const [sheetData, setSheetData] = useState<any>(null);
  const {data, isLoading, isFetching, isError} = useGetUserPayment({
    limit: limit,
    offset,
  });
  const scrollY = useSharedValue(0);
  useEffect(() => {
    if (data?.content) {
      setItems(prevItems => [...prevItems, ...data.content]);
    }
  }, [data]);
  const loadMore = () => {
    if (!isError && !isFetching && items.length < (data?.total ?? 5)) {
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
          title={t('Online Payment')}
        />
      ),
    });
  }, [navigation]);
  const sheetRef = useRef<any>(null);
  const {height} = Dimensions.get('screen');
  const openSheet = useCallback((data: any) => {
    setSheetData(data);
    sheetRef.current?.expand();
  }, []);
  return (
    <View className="flex-1 Container pt-[30%] web:pt-20">
      <Animated.FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <PaymentCard item={item} navigation={navigation} />
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

export default PaymentsScreen;
