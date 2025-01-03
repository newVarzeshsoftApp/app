import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Text, View} from 'react-native';
import {SaleOrderContent} from '../../services/models/response/UseResrService';
import {useGetUserSaleOrder} from '../../utils/hooks/User/useGetUserSaleOrder';
import {limit} from '../../constants/options';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import BaseText from '../../components/BaseText';
import ReceptionCard from './components/ReceptionCard';
import DateSelector, {
  DateSelectorType,
} from '../../components/Picker/DatePicker/DateSelector';

type ReceptionScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  'reception'
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
const ReceptionScreen: React.FC<ReceptionScreenProps> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const [offset, setOffset] = useState(0);
  const [items, setItems] = useState<SaleOrderContent[] | []>([]);
  const scrollY = useSharedValue(0);
  const [selectedDateRange, setSelectedDateRange] = useState<DateSelectorType>({
    startDate: null,
    endDate: null,
  });
  const {data, isLoading, isFetching, isError} = useGetUserSaleOrder({
    limit: limit,
    offset,
    reception: {equals: true},
    start: selectedDateRange.startDate?.gregorianDate || '',
    end: selectedDateRange.endDate?.gregorianDate || '',
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
          title={t('receptions')}
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
    <View className="flex-1 Container pt-[30%] web:pt-20">
      <Animated.FlatList
        data={items}
        ListHeaderComponent={headerComponentMemo}
        keyExtractor={(item, index) => item.id.toString() || index.toString()}
        renderItem={({item}) => (
          <ReceptionCard item={item} navigation={navigation} />
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
                {t('noReceptionFound')}
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

export default ReceptionScreen;
