import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, View} from 'react-native';
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
import DateSelector, {
  DateSelectorType,
} from '../../components/Picker/DatePicker/DateSelector';
import moment from 'jalali-moment';
type PaymentsScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  'payments'
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
const PaymentsScreen: React.FC<PaymentsScreenProps> = ({navigation}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<PaymentRecord[] | []>([]);
  const todayJalali = moment().format('jYYYY-jMM-jDD');
  const todayGregorian = moment().format('YYYY-MM-DD');
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelectorType>({
    startDate: null,
    endDate: null,
  });
  const {data, isLoading, isFetching, isError} = useGetUserPayment({
    limit: limit,
    offset,
    sortField: 'startPayment',
    sortOrder: -1,
    startPayment: {
      gte: selectedDateRange.startDate?.gregorianDate || '',
      lte: selectedDateRange.endDate?.gregorianDate || '',
    },
  });
  useEffect(() => {
    setOffset(0);
    setItems([]);
  }, [selectedDateRange]);
  const scrollY = useSharedValue(0);
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
          navigation={navigation}
          title={t('Online Payment')}
        />
      ),
    });
  }, [navigation]);
  const handleDateChange = useCallback((date: DateSelectorType) => {
    setSelectedDateRange(date);
  }, []);

  const headerComponentMemo = useMemo(
    () => <HeaderComponent onDateChange={handleDateChange} />,
    [handleDateChange],
  );
  return (
    <View className="flex-1 Container ">
      <Animated.FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <PaymentCard item={item} navigation={navigation} />
        )}
        ListHeaderComponent={headerComponentMemo}
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
          paddingTop: 90,
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PaymentsScreen;
