import React, {useLayoutEffect, useRef} from 'react';
import {ActivityIndicator, Dimensions, Image, View} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {Content} from '../../../services/models/response/UseResrService';
import BaseText from '../../../components/BaseText';
import {useGetOrganizationBySKU} from '../../../utils/hooks/Organization/useGetOrganizationBySKU';
import {useTranslation} from 'react-i18next';
import moment from 'jalali-moment';
import BaseButton from '../../../components/Button/BaseButton';
import {RepeatCircle} from 'iconsax-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../../utils/ThemeContext';
import {useGetUserSessionByID} from '../../../utils/hooks/User/useGetUserSessionByID';
import {RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SaleItemStackParamList} from '../../../utils/types/NavigationTypes';
import NavigationHeader from '../../../components/header/NavigationHeader';
import BottomSheet, {
  BottomSheetMethods,
} from '../../../components/BottomSheet/BottomSheet';
import Badge from '../../../components/Badge/Badge';
import ContractorInfo from '../../../components/ContractorInfo/ContractorInfo';
type ServiceDetailNavigationProp = NativeStackNavigationProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
type ServiceDetailRouteProp = RouteProp<
  SaleItemStackParamList,
  'saleItemDetail'
>;
interface ServiceDetailProps {
  data: Content;
  navigation: ServiceDetailNavigationProp;
  route: ServiceDetailRouteProp;
}
const ServiceDetail: React.FC<ServiceDetailProps> = ({
  data,
  navigation,
  route,
}) => {
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();

  const bottomsheetRef = useRef<BottomSheetMethods>(null);
  const {height} = Dimensions.get('screen');
  const {t} = useTranslation('translation', {keyPrefix: 'Detail'});
  const {data: UserSession, isLoading: UserSessionisLoading} =
    useGetUserSessionByID(data.id);
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
  const BaseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
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
    <>
      <BottomSheet
        ref={bottomsheetRef}
        scrollView
        snapPoints={[60]}
        Title={t('description')}>
        <BaseText type="body2">
          {data.description ? data.description : t('No description')}
        </BaseText>
      </BottomSheet>
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
                uri:
                  (OrganizationBySKU?.imageUrl ?? '') +
                  data?.product?.image?.name,
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
                  <View className="flex-1 w-full Container py-4  dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4">
                    {/* Info Card */}
                    <View className="p-5 rounded-3xl gap-5 bg-white/40 dark:bg-neutral-dark-300/40 shadow-custom  border border-white dark:border-neutral-dark-300">
                      <View className="flex-row gap-2 items-center ">
                        {(data.usable ?? false) && (
                          <View className="w-2 h-2 rounded-full bg-success-500"></View>
                        )}
                        <BaseText type="title3" color="base">
                          {data.product?.title}
                        </BaseText>
                      </View>
                      <View className="gap-2">
                        {data.contractor && (
                          <ContractorInfo
                            gender={data.contractor.gender}
                            firstName={data.contractor.firstName}
                            imageName={data.contractor.profile?.name}
                            lastName={data.contractor.lastName}
                          />
                        )}
                        <View className="flex-row items-center justify-between">
                          <BaseText type="body3" color="secondary">
                            {t('AllCredit')}: {data.credit} {t('Metting')}
                          </BaseText>
                          <BaseText type="body3" color="secondaryPurple">
                            {(data?.credit ?? 0) - (data?.usedCredit ?? 0)}
                            {''}
                            {''} {t('MettingRemaining')}
                          </BaseText>
                        </View>
                        <View className="flex-row items-center justify-between ">
                          <BaseText type="body3" color="secondary">
                            {t('start')} {''} : {''}
                            {moment(data.start).format('jYYYY/jMM/jDD')}
                          </BaseText>
                          <BaseText type="body3" color="secondary">
                            {t('end')} {''} : {''}
                            {moment(data.end).format('jYYYY/jMM/jDD')}
                          </BaseText>
                        </View>
                      </View>
                      <View className="flex-row gap-2">
                        <BaseButton
                          color="Black"
                          LeftIcon={RepeatCircle}
                          LeftIconVariant="Bold"
                          type="Fill"
                          text={t('Renewal')}
                          rounded
                          Extraclass="!flex-1"
                        />
                        <BaseButton
                          color="Black"
                          type="Outline"
                          text={t('description')}
                          rounded
                          onPress={() => bottomsheetRef.current?.expand()}
                          Extraclass="!flex-1"
                        />
                      </View>
                    </View>
                    {/* Info Card */}
                    {/* History */}
                    <View className="gap-3">
                      <View>
                        <BaseText type="title4" color="secondary">
                          {t('usedHistory')}
                        </BaseText>
                      </View>
                      {UserSessionisLoading ? (
                        <View className="flex-1 py-10">
                          <ActivityIndicator size="large" color="#bcdd64" />
                        </View>
                      ) : UserSession && UserSession?.length > 0 ? (
                        UserSession.map((item, index) => {
                          return (
                            <View
                              key={index}
                              className="p-5 rounded-3xl  gap-5 bg-white/40 dark:bg-neutral-dark-300/40 shadow-custom  border border-white dark:border-neutral-dark-300">
                              {!data.contractor && item.contractor && (
                                <View className="justify-between items-center flex-row">
                                  <BaseText type="body3" color="secondary">
                                    {t('contractor')}:
                                  </BaseText>
                                  <ContractorInfo
                                    gender={item.contractor.gender}
                                    firstName={item.contractor.firstName}
                                    imageName={item.contractor.profile?.name}
                                    lastName={item.contractor.lastName}
                                  />
                                </View>
                              )}
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('MettingCredit')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item.quantity}
                                </BaseText>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('lockers')}:
                                </BaseText>
                                <View className="flex-row gap-1">
                                  {item.lockers?.map((item, index) => {
                                    return (
                                      <Badge
                                        value={item}
                                        defaultMode
                                        textColor="base"
                                        key={index}></Badge>
                                    );
                                  })}
                                </View>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('entry')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {moment(item.start).format('HH:mm')}
                                </BaseText>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('exit')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item.end && moment(item.end).isValid()
                                    ? moment(item.end).format('HH:mm')
                                    : '-'}
                                </BaseText>
                              </View>
                              <View className="justify-between items-center flex-row">
                                <BaseText type="body3" color="secondary">
                                  {t('date')}:
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {item.submitAt &&
                                  moment(item.submitAt).isValid()
                                    ? moment(item.submitAt).format(
                                        'jYYYY/jMM/jDD',
                                      )
                                    : '-'}
                                </BaseText>
                              </View>
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
                </View>
              </LinearGradient>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </>
  );
};

export default ServiceDetail;
