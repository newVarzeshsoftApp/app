import React, {useLayoutEffect, useRef} from 'react';
import {Dimensions, Text, View} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import {BottomSheetMethods} from '../../components/BottomSheet/BottomSheet';
import {useTranslation} from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTheme} from '../../utils/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
type ServiceDetailProp = NativeStackScreenProps<
  ShopStackParamList,
  'serviceDetail'
>;
const ServiceDetail: React.FC<ServiceDetailProp> = ({navigation, route}) => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const bottomsheetRef = useRef<BottomSheetMethods>(null);
  const {height} = Dimensions.get('screen');
  const {t} = useTranslation('translation', {keyPrefix: 'Detail'});

  // Use shared value instead of scroll offset
  const scrollY = useSharedValue(0);
  const IMageHight = 285;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          scrollY={scrollY}
          range={[0, IMageHight / 1.5]}
          navigation={navigation}
          title={route.params?.title}
        />
      ),
    });
  }, [navigation, scrollY, IMageHight, t]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const {theme} = useTheme();
  const BaseColor =
    theme === 'dark' ? 'rgba(27,29,33,0.3)' : 'rgba(244,244,245,0.3)';
  const BaseHighlight =
    theme === 'dark' ? 'rgba(42, 45, 51, 1)' : 'rgba(255,255,255,1)';

  const ImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-IMageHight, 0, IMageHight],
            [-IMageHight / 2, 0, IMageHight * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-IMageHight, 0, IMageHight],
            [2, 1, 1],
          ),
        },
      ],
    };
  });
  return (
    <View style={{flex: 1}}>
      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{flex: 1}}>
        <View className="flex-1">
          <Animated.Image
            style={[{width: '100%', height: IMageHight}, ImageAnimatedStyle]}
            source={{
              uri: OrganizationBySKU?.imageUrl ?? '',
              // data?.product?.image?.name,
            }}
          />

          <View className="flex-1">
            <LinearGradient
              colors={[BaseHighlight, BaseHighlight, BaseColor]}
              locations={[0, 0, 0.3, 0.5]}
              className=""
              style={{
                flex: 1,
                borderTopEndRadius: 24,
                borderTopStartRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View className="flex-1 p-[2px] w-full  relative z-10 overflow-hidden">
                <View className="flex-1 w-full Container py-4  dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4"></View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default ServiceDetail;
