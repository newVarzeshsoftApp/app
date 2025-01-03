import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, Dimensions, View} from 'react-native';
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
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import {formatNumber} from '../../utils/helpers/helpers';
import Badge from '../../components/Badge/Badge';
import DateSelector, {
  DateSelectorType,
} from '../../components/Picker/DatePicker/DateSelector';

type OrdersScreenProps = NativeStackScreenProps<OrderStackParamList, 'orders'>;

const HeaderComponent = React.memo(
  ({onDateChange}: {onDateChange: (date: DateSelectorType) => void}) => {
    return (
      <View className="pb-4">
        <DateSelector mode="range" onDateChange={onDateChange} />
      </View>
    );
  },
);
const OrdersScreen: React.FC<OrdersScreenProps> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<SaleOrderContent[] | []>([]);
  const [sheetData, setSheetData] = useState<any>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelectorType>({
    startDate: null,
    endDate: null,
  });
  const {data, isLoading, isFetching, isError} = useGetUserSaleOrder({
    limit: limit,
    offset,
    reception: {equals: false},
    start: selectedDateRange.startDate?.gregorianDate || '',
    end: selectedDateRange.endDate?.gregorianDate || '',
  });
  const scrollY = useSharedValue(0);
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
  const sheetRef = useRef<any>(null);
  const {height} = Dimensions.get('screen');
  const openSheet = useCallback((data: any) => {
    setSheetData(data);
    sheetRef.current?.expand();
  }, []);
  const handleDateChange = useCallback((date: DateSelectorType) => {
    setSelectedDateRange(date);
  }, []);

  const headerComponentMemo = useMemo(
    () => <HeaderComponent onDateChange={handleDateChange} />,
    [handleDateChange],
  );
  return (
    <>
      <BottomSheet
        ref={sheetRef}
        activeHeight={height * 0.4}
        Title={t('Shipping details')}>
        <View className="gap-4">
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <BaseText type="body3" color="secondary">
                {t('Type')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                ارسالی
              </BaseText>
            </View>
            <View className="flex-row items-center justify-between">
              <BaseText type="body3" color="secondary">
                {t('Status')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                <Badge value={'لغو شده'} color="error" />
              </BaseText>
            </View>
            <View className="flex-row items-center justify-between">
              <BaseText type="body3" color="secondary">
                {t('Sending amount')}: {''}
              </BaseText>
              <BaseText type="body3" color="base">
                {formatNumber(609990)}﷼
              </BaseText>
            </View>
          </View>
          <View className="items-start gap-3 pt-3 border-t dark:border-neutral-dark-300 border-neutral-200  ">
            <BaseText type="body3" color="secondary">
              {t('Address')}: {''}
            </BaseText>
            <BaseText type="body3" color="base">
              تهران،انقلاب؛کارگر جنوبی،خ لبافی نژاد،خ فخر رازی،ساختمان
              نرگس،پلاک40
            </BaseText>
          </View>
        </View>
      </BottomSheet>
      <View className="flex-1 Container pt-[30%] web:pt-20">
        <Animated.FlatList
          data={items}
          ListHeaderComponent={headerComponentMemo}
          keyExtractor={(item, index) => `key` + index}
          renderItem={({item}) => (
            <OrderCard
              item={item}
              navigation={navigation}
              openSheet={openSheet}
            />
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
    </>
  );
};

export default OrdersScreen;
