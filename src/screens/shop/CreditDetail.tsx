import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useLayoutEffect} from 'react';
import {ActivityIndicator, Image, Platform, Text, View} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
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
import {FlashCircle} from 'iconsax-react-native';
import {UseGetProductByID} from '../../utils/hooks/Product/UseGetProductByID';
import BaseText from '../../components/BaseText';
import {BlurView} from '@react-native-community/blur';
import {ConvertDuration, formatNumber} from '../../utils/helpers/helpers';
import Badge from '../../components/Badge/Badge';
import BaseButton from '../../components/Button/BaseButton';

type CreditDetailProp = NativeStackScreenProps<
  ShopStackParamList,
  'creditDetail'
>;
const CreditDetail: React.FC<CreditDetailProp> = ({navigation, route}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.creditService'});
  const scrollY = useSharedValue(0);
  const IMageHight = 185;
  const {theme} = useTheme();
  const BaseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
  const BaseHighlight =
    theme === 'dark' ? 'rgba(42, 45, 51, 1)' : 'rgba(255,255,255,1)';

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const {data, isLoading} = UseGetProductByID(route.params.id);
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
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          range={[0, 80]}
          scrollY={scrollY}
          title={route.params.title}
          navigation={navigation}
        />
      ),
    });
  }, [navigation]);
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
          <Animated.View
            style={[
              {width: '100%', height: IMageHight, position: 'relative'},
              ImageAnimatedStyle,
            ]}>
            <View className="absolute -top-[125%] web:rotate-[10deg]  web:-left-[40%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
              <Image
                source={require('../../assets/images/shade/shape/YellowShade.png')}
                style={{width: '100%', height: '100%'}}
                resizeMode="contain"
              />
            </View>
            <View className="absolute -top-[100%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
              <Image
                source={require('../../assets/images/shade/shape/YellowShade.png')}
                style={{width: '100%', height: '100%'}}
              />
            </View>
          </Animated.View>
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
              <View className="flex-1 p-[2px] w-full  relative z-10 ">
                <View className="flex-1 w-full Container  py-4  dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4">
                  <View className="absolute left-0 top-[-28px] justify-center items-center w-full ">
                    <View className="w-[56px] h-[56px] items-center justify-center rounded-full bg-supportive1-500/40">
                      <FlashCircle size="34" color="#fed376" variant="Bold" />
                    </View>
                  </View>
                  {/* Content Show Here */}
                  <View className="items-center justify-center pt-8">
                    <BaseText type="subtitle1" color="supportive1">
                      {route.params.title}
                    </BaseText>
                  </View>
                  {/* Price Part */}
                  {isLoading ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <ActivityIndicator size="large" color="#bcdd64" />
                    </View>
                  ) : (
                    data && (
                      <>
                        <View className="drop-shadow-lg ">
                          <LinearGradient
                            colors={[
                              'rgba(254, 211, 118, 0.8)',
                              'rgba(254, 211, 118, 0.2)',
                              '#2a2d33',
                            ]}
                            locations={[0, 0, 0.3, 0.5]}
                            className=""
                            style={{
                              height: 130,
                              borderRadius: 24,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <View className="flex-1 p-[1px] w-full  relative z-10 overflow-hidden ">
                              <View className="absolute  w-full -top-4  left-[20%]  h-full  blur z-10">
                                <Image
                                  source={require('../../assets/images/shade/shape/YellowCreditPage.png')}
                                  style={{width: '140%', height: '100%'}}
                                />
                              </View>
                              {Platform.OS !== 'web' && (
                                <BlurView
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    zIndex: 0,
                                  }}
                                  blurType="prominent"
                                  blurAmount={1}
                                  reducedTransparencyFallbackColor="white"
                                />
                              )}
                              <View className="flex-1 w-full Container justify-center items-center  py-4  dark:bg-neutral-dark-300 bg-neutral-0/20 rounded-3xl gap-3">
                                <View className="flex-row  items-center justify-center gap-1 z-10">
                                  <BaseText type="title1" color="base">
                                    {formatNumber(data?.price ?? 0)}
                                  </BaseText>
                                  <BaseText type="title4" color="secondary">
                                    ﷼
                                  </BaseText>
                                </View>

                                <BaseText type="subtitle2" color="secondary">
                                  {t('Charge balance')}
                                </BaseText>
                              </View>
                            </View>
                          </LinearGradient>
                        </View>
                        {/* Rest */}
                        <View className="flex-1  justify-between gap-4">
                          <View className="gap-5">
                            <View>
                              <BaseText type="body3">
                                {t('Duration')} :{' '}
                                {data?.duration === 0
                                  ? t('noLimitForTime')
                                  : ConvertDuration(data?.duration ?? 0)}
                              </BaseText>
                            </View>
                            <View className="gap-2">
                              <BaseText type="body3">{t('usedFor')}</BaseText>
                              <View className="flex-row items-center gap-1 flex-wrap">
                                {data?.hasSubProduct ? (
                                  data.subProducts?.map((item, index) => {
                                    return (
                                      <Badge
                                        key={index}
                                        defaultMode
                                        textColor="secondaryPurple"
                                        value={item.product?.title ?? ''}
                                        className="w-fit"
                                      />
                                    );
                                  })
                                ) : (
                                  <Badge
                                    defaultMode
                                    textColor="secondaryPurple"
                                    value={t('noLimit')}
                                    className="w-fit"
                                  />
                                )}
                              </View>
                            </View>
                            {data?.description && (
                              <View className="gap-2">
                                <BaseText type="body3">
                                  {t('description')}
                                </BaseText>
                                <BaseText>{data?.description}</BaseText>
                              </View>
                            )}
                          </View>
                          <BaseButton
                            text={t('addToCart')}
                            size="Large"
                            color="Black"
                            type="Fill"
                            rounded
                          />
                        </View>
                      </>
                    )
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default CreditDetail;
