import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useLayoutEffect, useRef, useState} from 'react';
import {ActivityIndicator, Dimensions, View} from 'react-native';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import {useTranslation} from 'react-i18next';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import {ArrowLeft2, ArrowRight2} from 'iconsax-react-native';
import {useTheme} from '../../utils/ThemeContext';
import OrderDetailCard from './components/OrderDetailCard';
import ItemCard from './components/ItemCard';
import TransactionCard from './components/TransactionCard';
import {useGetUserSaleOrderByID} from '../../utils/hooks/User/useGetUserSaleOrderByID';
import DynamicSlider, {
  DynamicSliderHandle,
} from '../../components/DynamicSlider';
type OrderDetailScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  'orderDetail'
>;
const OrderDetailScreen: React.FC<OrderDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const {data, isLoading} = useGetUserSaleOrderByID(route.params.id);
  const scrollY = useSharedValue(0);
  const isReseption = data?.reception;
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
          title={t(isReseption ? 'Reseption Detail' : 'order Detail')}
        />
      ),
    });
  }, [navigation, scrollY, isReseption]);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const itemSliderRef = useRef<DynamicSliderHandle>(null);
  const TransactionSliderRef = useRef<DynamicSliderHandle>(null);
  const [itemSlider, setitemSlider] = useState(0);
  const [TransactionSlider, setTransactionSlider] = useState(0);

  return (
    <View className="flex-1">
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : (
        data && (
          <Animated.ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            onScroll={scrollHandler}
            style={{flex: 1}}>
            <SafeAreaView>
              <View className="gap-5 pt-24 web:pt-20 pb-6">
                <View className="gap-5 Container">
                  <BaseText>
                    {t(isReseption ? 'Reseption Detail' : 'order Detail')}
                  </BaseText>
                  <OrderDetailCard item={data} isReseption={isReseption} />
                </View>
                <View className="gap-5 ">
                  <View className="gap-2 Container flex-row justify-between items-center">
                    <BaseText>{t('Items')}</BaseText>
                    {data?.items && data?.items?.length > 1 && (
                      <View className="gap-2 flex-row items-center ">
                        <BaseButton
                          onPress={() => itemSliderRef.current?.goToNext()}
                          type="TextButton"
                          color="Black"
                          LeftIcon={ArrowRight2}
                          size="Small"
                          disabled={itemSlider === 0}
                          noText
                        />
                        <BaseButton
                          onPress={() => itemSliderRef.current?.goToPrevious()}
                          type="TextButton"
                          color="Black"
                          disabled={itemSlider === -(data?.items?.length - 1)}
                          LeftIcon={ArrowLeft2}
                          size="Small"
                          noText
                        />
                      </View>
                    )}
                  </View>
                  <View className="flex-1  ">
                    {data?.items && data?.items?.length > 0 ? (
                      <DynamicSlider
                        ref={itemSliderRef}
                        onIndexChange={setitemSlider}
                        data={data?.items ?? []}
                        renderItem={({item, index}) => (
                          <View
                            key={index}
                            style={{width: Dimensions.get('window').width}}
                            className="flex-1 w-full  Container  ">
                            <ItemCard item={item} />
                          </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    ) : (
                      <View className="py-10 justify-center items-center">
                        <BaseText type="subtitle1" color="secondary">
                          {t('noItems')}
                        </BaseText>
                      </View>
                    )}
                  </View>
                </View>
                <View className="gap-5">
                  <View className="gap-2 flex-row Container justify-between items-center">
                    <BaseText>{t('transactions')}</BaseText>
                    {data?.transactions && data?.transactions?.length > 1 && (
                      <View className="gap-2 flex-row items-center ">
                        <BaseButton
                          onPress={() =>
                            TransactionSliderRef.current?.goToNext()
                          }
                          type="TextButton"
                          disabled={TransactionSlider === 0}
                          color="Black"
                          LeftIcon={ArrowRight2}
                          size="Small"
                          noText
                        />
                        <BaseButton
                          onPress={() =>
                            TransactionSliderRef.current?.goToPrevious()
                          }
                          disabled={
                            TransactionSlider ===
                            -(data?.transactions?.length - 1)
                          }
                          type="TextButton"
                          color="Black"
                          LeftIcon={ArrowLeft2}
                          size="Small"
                          noText
                        />
                      </View>
                    )}
                  </View>
                  <View className="flex-1 ">
                    {data?.transactions && data?.transactions?.length > 0 ? (
                      <DynamicSlider
                        ref={TransactionSliderRef}
                        onIndexChange={setTransactionSlider}
                        data={data?.transactions ?? []}
                        renderItem={({item, index}) => (
                          <View
                            key={index}
                            style={{width: Dimensions.get('window').width}}
                            className="flex-1 Container ">
                            <TransactionCard inDetail item={item} />
                          </View>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    ) : (
                      <View className="py-10 justify-center items-center">
                        <BaseText type="subtitle1" color="secondary">
                          {t('noTransaction')}
                        </BaseText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </Animated.ScrollView>
        )
      )}
    </View>
  );
};

export default OrderDetailScreen;
