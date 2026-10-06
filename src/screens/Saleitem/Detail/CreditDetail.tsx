import React, {useLayoutEffect} from 'react';
import {ActivityIndicator, Image, ScrollView, Text, View} from 'react-native';

import {Content} from '../../../services/models/response/UseResrService';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SaleItemStackParamList} from '../../../utils/types/NavigationTypes';
import {RouteProp} from '@react-navigation/native';
import NavigationHeader from '../../../components/header/NavigationHeader';
import {FlashCircle, RepeatCircle} from 'iconsax-react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BaseText from '../../../components/BaseText';
import {formatNumber} from '../../../utils/helpers/helpers';
import {
  formatForcedEndDate,
  getSessionCount,
  isChargeBySession,
} from '../../../utils/helpers/chargingServiceDisplay';
import BaseButton from '../../../components/Button/BaseButton';
import {useTranslation} from 'react-i18next';
import Badge from '../../../components/Badge/Badge';
import moment from 'jalali-moment';
import {useGetUserChargingServiceByID} from '../../../utils/hooks/User/useGetUserChargingServiceByID';
import {
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import CreditSubProduct from '../../../components/cards/SubProduct';
import {navigate} from '../../../navigation/navigationRef';
import HistoryLocationMeta from '../../../components/organizationUnit/HistoryLocationMeta';
import {getHistoricalOrganizationUnitTitle} from '../../../utils/helpers/organizationUnits';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';
type CreditDetailProp = NativeStackNavigationProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
type CreditDetailRouteProp = RouteProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
interface CreditDetailProps {
  data: Content;
  navigation: CreditDetailProp;
  route: CreditDetailRouteProp;
}
const CreditDetail: React.FC<CreditDetailProps> = ({
  data,
  navigation,
  route,
}) => {
  const {t} = useTranslation('translation', {keyPrefix: 'Detail'});
  const chargeBySession = isChargeBySession(data.product);
  const remainingCredit = (data?.credit ?? 0) - (data?.usedCredit ?? 0);
  const remainingSessions = chargeBySession
    ? getSessionCount(remainingCredit, data.product)
    : null;
  const initialSessions = chargeBySession
    ? getSessionCount(data?.credit, data.product)
    : null;
  const forcedEndDateLabel = formatForcedEndDate(data.product);
  const showsRemainingSessions = remainingSessions !== null;
  const showsInitialSessions = initialSessions !== null;
  const {data: organization} = useGetOrganizationBySKU();
  const {data: UserChargingService, isLoading: UserChargingServiceisLoading} =
    useGetUserChargingServiceByID(data.id);
  const scrollY = useSharedValue(0);
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
          range={[0, 100]}
          scrollY={scrollY}
          title={data.title}
          navigation={navigation}
        />
      ),
    });
  }, [navigation]);

  return (
    <View className="flex-1">
      <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
        <Image
          source={require('../../../assets/images/shade/shape/YellowShade.png')}
          style={{width: '100%', height: '100%'}}
          resizeMode="contain"
        />
      </View>
      <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
        <Image
          source={require('../../../assets/images/shade/shape/YellowShade.png')}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <Animated.ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        style={{flex: 1}}>
        <SafeAreaView>
          <View className="gap-8 Container">
            <View className="flex-1 gap-5  w-full items-center pt-6">
              <View className="gap-3 items-center">
                <View className="gap-2 items-center">
                  <View className="w-[44px] h-[44px] items-center justify-center rounded-full bg-supportive1-500/40">
                    <FlashCircle size="24" color="#fed376" variant="Bold" />
                  </View>
                  <View>
                    <BaseText type="title3" color="supportive1">
                      {data.title}
                    </BaseText>
                  </View>
                </View>
                <View className="items-center gap-2">
                  <View className="flex-row items-center gap-2">
                    <BaseText type="title1" color="base">
                      {formatNumber(
                        showsRemainingSessions
                          ? remainingSessions
                          : remainingCredit,
                      )}
                    </BaseText>
                    <BaseText type="title3" color="secondary">
                      {showsRemainingSessions ? 'جلسه' : 'ریال'}
                    </BaseText>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <BaseText type="subtitle2" color="muted">
                      {t('Initial charge')}
                    </BaseText>
                    <BaseText type="subtitle2" color="muted">
                      {formatNumber(
                        showsInitialSessions ? initialSessions : data?.credit,
                      )}
                    </BaseText>
                    <BaseText type="subtitle2" color="muted">
                      {showsInitialSessions ? 'جلسه' : 'ریال'}
                    </BaseText>
                  </View>
                </View>
              </View>
              {data.product?.isOnline && (
                <View className="flex-1 w-full max-w-[160px] ">
                  <BaseButton
                    type="Fill"
                    color="Supportive1-Yellow"
                    size="Medium"
                    text={t('Renewal')}
                    LeftIcon={RepeatCircle}
                    rounded
                    LeftIconVariant="Bold"
                    className="!flex-1"
                  />
                </View>
              )}
            </View>
            <View>
              <View className="gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-dark-200">
                <BaseText type="body3" color="base">
                  {t('uses')}
                </BaseText>
                <CreditSubProduct
                  subProducts={data.product?.subProducts}
                  hasSubProduct={data.product?.hasSubProduct}
                />
              </View>
              <View className="pt-2 flex flex-row gap-8">
                <BaseText type="body3" color="muted">
                  {t('start')} {''} : {''}
                  {moment(data.start).format('jYYYY/jMM/jDD')}
                </BaseText>
                <BaseText type="body3" color="muted">
                  {t('end')} {''} : {''}
                  {forcedEndDateLabel ?? moment(data.end).format('jYYYY/jMM/jDD')}
                </BaseText>
              </View>
            </View>
            {/* History */}
            <View className="gap-3">
              <View>
                <BaseText type="title4" color="secondary">
                  {t('usedHistory')}
                </BaseText>
              </View>
              {UserChargingServiceisLoading ? (
                <View className="flex-1 py-10">
                  <ActivityIndicator size="large" color="#bcdd64" />
                </View>
              ) : UserChargingService && UserChargingService?.length > 0 ? (
                UserChargingService.map((item, index) => {
                  const usedSessions = chargeBySession
                    ? getSessionCount(item?.amount, data.product)
                    : null;
                  const historyRemainingSessions = chargeBySession
                    ? getSessionCount(item?.remain, data.product)
                    : null;

                  return (
                    <View
                      key={index}
                      className="p-5 rounded-3xl gap-5 bg-white/40 dark:bg-neutral-dark-300/40 shadow-custom  border border-white dark:border-neutral-dark-300">
                      <View className="justify-between items-center flex-row">
                        <BaseText type="body3" color="secondary">
                          {t('orderNumber')}:
                        </BaseText>
                        <BaseButton
                          onPress={() => {
                            navigate('Root', {
                              screen: 'HistoryNavigator',
                              params: {
                                screen: 'orderDetail',
                                params: {id: item?.order ?? 0},
                              },
                            });
                          }}
                          size="Small"
                          type="Outline"
                          color="Supportive5-Blue"
                          text={item?.order?.toString()}
                          LinkButton
                          rounded
                        />
                      </View>
                      <View className="justify-between items-center flex-row">
                        <BaseText type="body3" color="secondary">
                          {t('DateAndTime')}:
                        </BaseText>
                        <BaseText type="body3" color="base">
                          {moment(item.submitAt).format('jYYYY/jMM/jDD HH:mm')}
                        </BaseText>
                      </View>
                      <View className="justify-between items-center flex-row">
                        <BaseText type="body3" color="secondary">
                          {t('Amount')}:
                        </BaseText>
                        <BaseText type="body3" color="base">
                          {usedSessions !== null
                            ? `${formatNumber(usedSessions)} جلسه`
                            : formatNumber(item?.amount ?? 0)}
                        </BaseText>
                      </View>
                      <View className="justify-between items-center flex-row">
                        <BaseText type="body3" color="secondary">
                          {t('RemainingAmout')}:
                        </BaseText>
                        <BaseText type="body3" color="base">
                          {historyRemainingSessions !== null
                            ? `${formatNumber(historyRemainingSessions)} جلسه`
                            : formatNumber(item?.remain ?? 0)}
                        </BaseText>
                      </View>
                      <HistoryLocationMeta
                        organizationUnitTitle={getHistoricalOrganizationUnitTitle(
                          item,
                          organization?.organizationUnits,
                        )}
                      />
                    </View>
                  );
                })
              ) : (
                <View className="flex-1 py-10 justify-center items-center">
                  <BaseText type="title4" color="secondary">
                    {t('NoHistory')}
                  </BaseText>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Animated.ScrollView>
    </View>
  );
};

export default CreditDetail;
