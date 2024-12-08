import React, {useLayoutEffect} from 'react';
import {Image, Text, View} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  OrderStackParamList,
  SaleItemStackParamList,
} from '../../utils/types/NavigationTypes';
type SaleItemDetailProps = NativeStackScreenProps<
  OrderStackParamList,
  'transaction'
>;
const TransactionScreen: React.FC<SaleItemDetailProps> = ({
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
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

      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        onScroll={scrollHandler}
        scrollEventThrottle={10}
        style={{flex: 1}}>
        <View className="flex-1">
          <Text>rest</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default TransactionScreen;
