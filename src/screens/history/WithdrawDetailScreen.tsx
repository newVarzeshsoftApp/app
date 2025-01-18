import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useLayoutEffect} from 'react';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import {OrderStackParamList} from '../../utils/types/NavigationTypes';
import {useTranslation} from 'react-i18next';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import {useTheme} from '../../utils/ThemeContext';
import NavigationHeader from '../../components/header/NavigationHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {MoneySend} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import {useGetUserTransactionById} from '../../utils/hooks/User/useGetUserTransactionById';
import moment from 'jalali-moment';
import {formatNumber} from '../../utils/helpers/helpers';
import {TransactionSourceType} from '../../constants/options';
import Badge from '../../components/Badge/Badge';
type WithdrawDetailScreenProps = NativeStackScreenProps<
  OrderStackParamList,
  'WithdrawDetail'
>;
const WithdrawDetailScreen: React.FC<WithdrawDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {data, isLoading} = useGetUserTransactionById(route.params.id);
  const {t} = useTranslation('translation', {keyPrefix: 'History'});
  const scrollY = useSharedValue(0);
  const {theme} = useTheme();
  const BaseColor =
    theme === 'dark' ? 'rgba(27,29,33,0.3)' : 'rgba(244,244,245,0.3)';
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
          title={t('WithdrawDetail')}
        />
      ),
    });
  }, [navigation, scrollY]);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const items = data?.description
    ? data.description
        .match(/([^"]+?)\s*\((\d+)\)/g)
        ?.map(item => {
          const match = item.match(/(.+?)\s*\((\d+)\)/);
          if (match) {
            return {
              title: match[1].trim(),
              number: parseInt(match[2], 10),
            };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  return (
    <View style={{flex: 1}}>
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../assets/images/shade/shape/RedShade.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../assets/images/shade/shape/RedShade.png')}
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
        <SafeAreaView style={{flex: 1, flexGrow: 1}}>
          <View className="flex-1 pt-[30%]">
            <LinearGradient
              colors={['#FD504F', BaseColor]}
              locations={[0.1, 0.5]}
              className=""
              style={{
                flex: 1,
                borderTopEndRadius: 24,
                borderTopStartRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View className="flex-1 p-[1.5px] w-full  relative z-10 ">
                <View className="absolute -top-[20%] web:-top-[20px]  z-20 left-1/2 transform web:-translate-x-1/2 w-[44px] h-[44px] items-center justify-center rounded-full bg-error-100 dark:bg-error-dark-100 border border-error-500">
                  <MoneySend size="24" color="#FD504F" variant="Bold" />
                </View>
                <View className="flex-1 w-full px-8 py-4 pt-10  dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4">
                  {isLoading ? (
                    <View style={{padding: 16, alignItems: 'center'}}>
                      <ActivityIndicator size="large" color="#bcdd64" />
                    </View>
                  ) : (
                    data && (
                      <View className="gap-2">
                        <View className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('DateAndTime')}: {''}
                          </BaseText>
                          <BaseText type="body3" color="base">
                            {moment(data?.submitAt).format(
                              'jYYYY/jMM/jDD HH:MM',
                            )}
                          </BaseText>
                        </View>
                        <View className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('Transaction number')}: {''}
                          </BaseText>
                          <BaseText type="body3" color="base">
                            {data?.id}
                          </BaseText>
                        </View>
                        {data?.orderId && (
                          <View className="flex-row items-center justify-between">
                            <BaseText type="body3" color="secondary">
                              {t(
                                data.order?.reception
                                  ? 'receptionsNumber'
                                  : 'orderNumber',
                              )}
                              : {''}
                            </BaseText>
                            <BaseButton
                              size="Small"
                              onPress={() =>
                                navigation.push('orderDetail', {
                                  id: data?.orderId ?? 0,
                                })
                              }
                              type="Outline"
                              color="Supportive5-Blue"
                              text={data?.orderId?.toString()}
                              LinkButton
                              rounded
                            />
                          </View>
                        )}

                        <View className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('Amount')}: {''}
                          </BaseText>
                          <BaseText type="body3" color="base">
                            {formatNumber(data?.amount)} ریال
                          </BaseText>
                        </View>
                        <View className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('Source')}: {''}
                          </BaseText>
                          <View className="flex-row gap-1 items-center">
                            <BaseText type="body3" color="base">
                              {data.gateway?.title ??
                                t(
                                  `${
                                    TransactionSourceType[data.sourceType ?? 0]
                                  }`,
                                )}
                            </BaseText>
                            {[
                              'OfferedDiscount',
                              'WalletGift',
                              'ChargingService',
                              'Loan',
                            ].includes(
                              TransactionSourceType[data.sourceType ?? 0],
                            ) ? (
                              <Badge
                                color="primary"
                                textColor="supportive5"
                                CreditMode={['ChargingService'].includes(
                                  TransactionSourceType[data.sourceType ?? 0],
                                )}
                                defaultMode
                                value={data?.title ?? ''}
                              />
                            ) : null}
                          </View>
                        </View>
                        {[
                          'UserCredit',
                          'WalletGift',
                          'ChargingService',
                        ].includes(
                          TransactionSourceType[data.sourceType ?? 0],
                        ) && (
                          <View className="flex-row items-center justify-between ">
                            <BaseText type="body3" color="secondary">
                              {t('Source residue')}: {''}
                            </BaseText>
                            <BaseText type="body3" color="base">
                              {formatNumber(
                                data?.sourceType ===
                                  TransactionSourceType.UserCredit
                                  ? data?.credit
                                  : data.chargeRemainCredit,
                              )}{' '}
                              ریال
                            </BaseText>
                          </View>
                        )}
                        {/* <View className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('SourceItem')}: {''}
                          </BaseText>
                          <BaseText type="body3" color="base">
                            {data.title ?? ''}
                          </BaseText>
                        </View> */}
                        {items && (
                          <View className="pt-4 border-t gap-4 mt-2 border-dashed border-neutral-300 dark:border-neutral-dark-300">
                            <View className="flex-row items-center justify-between ">
                              <BaseText type="body3" color="base">
                                {t('Items')}: {''}
                              </BaseText>
                              <BaseText type="body3" color="secondary">
                                {t('Number')}
                              </BaseText>
                            </View>

                            {items.map((item, index) => (
                              <View
                                key={index}
                                className="flex-row items-center justify-between ">
                                <BaseText type="body3" color="secondary">
                                  {item?.title}
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item?.number}
                                </BaseText>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </Animated.ScrollView>
    </View>
  );
};

export default WithdrawDetailScreen;
