import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
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
import DateSelector, {
  DateSelectorType,
} from '../../components/Picker/DatePicker/DateSelector';

type SaleItemDetailProps = NativeStackScreenProps<
  OrderStackParamList,
  'transaction'
>;
const HeaderComponent = React.memo(
  ({onDateChange}: {onDateChange: (date: DateSelectorType) => void}) => {
    return (
      <View className="pb-4">
        <DateSelector mode="range" onDateChange={onDateChange} />
      </View>
    );
  },
);
const TransactionScreen: React.FC<SaleItemDetailProps> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<SaleTransaction[] | []>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelectorType>({
    startDate: null,
    endDate: null,
  });
  const {data, isLoading, isFetching, isError} = useGetTransaction({
    limit: limit,
    offset,
    sortOrder: -1,
    sortField: 'submitAt',
    submitAt: {
      gte: selectedDateRange.startDate?.gregorianDate
        ? selectedDateRange.startDate?.gregorianDate
        : '',
      lte: selectedDateRange.endDate?.gregorianDate
        ? selectedDateRange.endDate?.gregorianDate
        : '',
    },
  });
  useEffect(() => {
    setOffset(0);
    setItems([]);
  }, [selectedDateRange]);
  useEffect(() => {
    if (data?.content) {
      setItems(prevItems => [...prevItems, ...data.content]);
    }
  }, [data]);
  const loadMore = () => {
    if (!isError && !isFetching && items.length < (data?.total ?? 5)) {
      setOffset(prevOffset => prevOffset + limit);
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
          range={[0, 50]}
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

  const handleDateChange = useCallback((date: DateSelectorType) => {
    setSelectedDateRange(date);
  }, []);

  const headerComponentMemo = useMemo(
    () => <HeaderComponent onDateChange={handleDateChange} />,
    [handleDateChange],
  );

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

      <View className="flex-1 Container ">
        <Animated.FlatList
          data={items}
          ListHeaderComponent={headerComponentMemo}
          keyExtractor={(item, index) => `key` + index}
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
            !isLoading ? (
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
            paddingTop: 90,
          }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

export default TransactionScreen;
