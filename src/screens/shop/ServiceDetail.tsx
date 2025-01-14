import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, Dimensions, Text, View} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useGetOrganizationBySKU} from '../../utils/hooks/Organization/useGetOrganizationBySKU';
import BottomSheet, {
  BottomSheetMethods,
} from '../../components/BottomSheet/BottomSheet';
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
import {UseGetProductByID} from '../../utils/hooks/Product/UseGetProductByID';
import BaseText from '../../components/BaseText';
import {TruncatedText} from '../../components/TruncatedText';
import {
  Contractors,
  PriceList,
} from '../../services/models/response/ProductResService';
import BaseButton from '../../components/Button/BaseButton';
import RadioButton from '../../components/Button/RadioButton/RadioButton';
import {Calendar, Clock, CloseCircle, Gift} from 'iconsax-react-native';
import {ConvertDuration, formatNumber} from '../../utils/helpers/helpers';
import moment from 'jalali-moment';
import PriceListDetail from './components/PriceListDetail';
import CustomCollapsible from '../../components/CustomCollapsible';
import UserRadioButton from '../../components/Button/RadioButton/UserRadioButton';
import {User} from '../../services/models/response/UseResrService';
import {useProfile} from '../../utils/hooks/useProfile';

type ServiceDetailProp = NativeStackScreenProps<
  ShopStackParamList,
  'serviceDetail'
>;
const ServiceDetail: React.FC<ServiceDetailProp> = ({navigation, route}) => {
  // Use shared value instead of scroll offset
  const scrollY = useSharedValue(0);
  const IMageHight = 285;
  const {data: ProfileData, isSuccess} = useProfile();
  const {data: OrganizationBySKU} = useGetOrganizationBySKU();
  const bottomsheetRef = useRef<BottomSheetMethods>(null);
  const BottomSheetPriceListRef = useRef<BottomSheetMethods>(null);
  const BottomSheetContractorRef = useRef<BottomSheetMethods>(null);
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});
  const {data, isLoading} = UseGetProductByID(route.params.id);
  const [SortedPriceList, setSortedPriceList] = useState<PriceList[] | []>([]);
  const [SelectedContractor, setSelectedContractor] =
    useState<Contractors | null>(null);
  const [SelectedPriceList, setSelectedPriceList] = useState<PriceList | null>(
    null,
  );
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

  useEffect(() => {
    if (route.params.priceId) {
      const findPriceList = data?.priceList.find(
        (item, index) => item.id === route.params.priceId,
      );
      if (findPriceList) {
        setSelectedPriceList(findPriceList);
        return;
      }
    }
    if (data?.priceList) {
      // Sort the price list by metadata.priority if it exists
      const sortedList = [...data.priceList].sort((a, b) => {
        const priorityA = a.metadata?.priority ?? Infinity; // Default to Infinity if no priority
        const priorityB = b.metadata?.priority ?? Infinity; // Default to Infinity if no priority
        return priorityA - priorityB;
      });
      setSortedPriceList(sortedList);
      setSelectedPriceList(sortedList[0]);
    } else {
      setSortedPriceList([]);
    }
  }, [data?.priceList, route.params.priceId]);

  useEffect(() => {
    if (route.params.contractorId) {
      const foundedContractor = data?.contractors.find(
        (item, index) => item.contractor?.id === route.params.contractorId,
      );
      if (foundedContractor) {
        setSelectedContractor(foundedContractor);
        return;
      }
    }
    if (data?.requiredContractor) {
      setSelectedContractor(data.contractors[0]);
    }
  }, [data?.requiredContractor, data?.contractors, route.params.priceId]);

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

  const Tax = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
    const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; // درصد تخفیف
    const taxPercentage = data?.tax ?? 0; // درصد مالیات
    // قیمت بعد از تخفیف
    const discountedPrice = price - (price * discount) / 100;
    //  مالیات
    return (discountedPrice * taxPercentage) / 100;
  }, [
    SelectedPriceList?.price,
    SelectedPriceList?.discountOnlineShopPercentage,
    data?.tax,
  ]);

  const Discount = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
    const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; //  تخفیف
    return (price * discount) / 100;
  }, [SelectedPriceList?.discountOnlineShopPercentage]);

  const PricePreSession = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0;
    const quantity = SelectedPriceList?.min ?? 0;

    return quantity > 0 ? Math.floor(price / quantity) : price;
  }, [SelectedPriceList?.price, SelectedPriceList?.min]);

  const Total = useMemo(() => {
    const price = SelectedPriceList?.price ?? 0; // قیمت اصلی
    const discount = SelectedPriceList?.discountOnlineShopPercentage ?? 0; // درصد تخفیف
    // محاسبه قیمت پس از تخفیف
    return price - (price * discount) / 100;
  }, [
    SelectedPriceList?.price,
    SelectedPriceList?.discountOnlineShopPercentage,
  ]);

  const purchaseProfit = useMemo(
    () =>
      ((data?.price ?? 0) - (data?.discount ?? 0)) *
        (SelectedPriceList?.min ?? 0) -
      Total,
    [SelectedPriceList?.price],
  );
  return (
    <>
      <BottomSheet
        ref={bottomsheetRef}
        scrollView
        snapPoints={[60]}
        Title={t('description')}>
        <BaseText type="body2">
          {data?.description ? data.description : t('No description')}
        </BaseText>
      </BottomSheet>
      <BottomSheet
        ref={BottomSheetPriceListRef}
        scrollView
        snapPoints={[70, 90]}
        Title={t('select sessions')}>
        <View className="gap-3">
          {SortedPriceList.map((item, index) => {
            return (
              <>
                <RadioButton
                  checked={SelectedPriceList === item}
                  asButton
                  haveArrow
                  onCheckedChange={() => setSelectedPriceList(item)}
                  label={`${item?.min ?? 0} جلسه  ${formatNumber(
                    item?.price ?? 0,
                  )} ﷼ `}
                />
                <CustomCollapsible isOpened={SelectedPriceList === item}>
                  <PriceListDetail
                    ServiceData={data}
                    SelectedPriceList={SelectedPriceList}
                  />
                </CustomCollapsible>
              </>
            );
          })}
        </View>
      </BottomSheet>
      <BottomSheet
        ref={BottomSheetContractorRef}
        scrollView
        snapPoints={[50, 70]}
        Title={t('Contractor List')}>
        <View className="gap-3">
          {data?.contractors.map((item, index) => {
            return (
              <>
                <UserRadioButton
                  key={index}
                  genders={item.contractor?.gender ?? 0}
                  checked={SelectedContractor === item}
                  onCheckedChange={() => {
                    setSelectedContractor(item);
                    BottomSheetContractorRef.current?.close();
                  }}
                  Name={`${item?.contractor?.firstName} ${item?.contractor?.lastName}`}
                  ImageUrl={item.contractor?.profile?.name}
                />
              </>
            );
          })}
        </View>
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
                  '/' +
                  (data?.image?.name ?? ''),
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
                  <View className="flex-1 w-full Container py-4 justify-between  dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4">
                    <View className="gap-4">
                      <BaseText color="base" type="title3">
                        {route.params.title}
                      </BaseText>
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
                        <>
                          {data?.description && (
                            <TruncatedText
                              text={data?.description ?? ''}
                              length={100}
                              onPressMore={() =>
                                bottomsheetRef.current?.expand()
                              }
                            />
                          )}

                          {/* تعداد جلسات  */}
                          <View className="gap-2">
                            <BaseText color="base" type="title4">
                              {t('Number of sessions')}
                            </BaseText>
                            <View className="gap-3">
                              <RadioButton
                                checked
                                asButton
                                haveArrow
                                readonly={route.params.readonly}
                                onCheckedChange={() =>
                                  BottomSheetPriceListRef.current?.expand()
                                }
                                label={`${
                                  SelectedPriceList?.min ?? 0
                                } جلسه  ${formatNumber(
                                  SelectedPriceList?.price ?? 0,
                                )} ﷼ `}
                              />
                              <PriceListDetail
                                SelectedPriceList={SelectedPriceList}
                                ServiceData={data}
                              />
                            </View>
                          </View>
                          {/* تعداد جلسات  */}
                          {data?.hasContractor && (
                            <View className="gap-2 ">
                              <BaseText color="base" type="title4">
                                {t('Contractor selection')}
                              </BaseText>
                              <View className="gap-3 flex-row items-center flex-1">
                                <UserRadioButton
                                  checked={SelectedContractor ? true : false}
                                  asButton
                                  readonly={route.params.readonly}
                                  genders={
                                    SelectedContractor?.contractor?.gender ??
                                    ProfileData?.gender ??
                                    0
                                  }
                                  placeHolder={t('Choose Contractor')}
                                  Name={
                                    SelectedContractor
                                      ? `${SelectedContractor.contractor?.firstName} ${SelectedContractor.contractor?.lastName}`
                                      : null
                                  }
                                  onCheckedChange={() =>
                                    BottomSheetContractorRef.current?.expand()
                                  }
                                  ImageUrl={
                                    SelectedContractor?.contractor?.profile
                                      ?.name
                                  }
                                />
                                {!data?.requiredContractor &&
                                  !route.params.contractorId &&
                                  route.params.readonly &&
                                  SelectedContractor && (
                                    <BaseButton
                                      noText
                                      LeftIcon={CloseCircle}
                                      LeftIconVariant="Bold"
                                      onPress={() =>
                                        setSelectedContractor(null)
                                      }
                                      type="TextButton"
                                      size="Large"
                                      rounded
                                      color="Black"
                                    />
                                  )}
                              </View>
                            </View>
                          )}

                          {/* OverView */}
                          <View className="CardBase">
                            {(SelectedPriceList?.min ?? 1) > 1 && (
                              <View className="flex-row items-center justify-between gap-2">
                                <BaseText type="body3" color="secondary">
                                  {t('Price per session')} :
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {formatNumber(PricePreSession)} ﷼
                                </BaseText>
                              </View>
                            )}
                            <View className="flex-row items-center justify-between gap-2">
                              <BaseText type="body3" color="secondary">
                                {t('Price')} {SelectedPriceList?.min} جلسه :
                              </BaseText>
                              <BaseText type="body3" color="base">
                                {formatNumber(SelectedPriceList?.price ?? 0)} ﷼
                              </BaseText>
                            </View>
                            {(Discount ?? 0) > 0 && (
                              <View className="flex-row items-center justify-between gap-2">
                                <BaseText type="body3" color="secondary">
                                  {t('Discount')} :
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {formatNumber(Discount)} ﷼
                                </BaseText>
                              </View>
                            )}
                            {purchaseProfit > 0 && (
                              <View className="flex-row items-center justify-between gap-2">
                                <BaseText type="body3" color="secondary">
                                  {t('Purchase profit')} :
                                </BaseText>
                                <BaseText type="body3" color="success">
                                  {formatNumber(purchaseProfit)}+ ﷼
                                </BaseText>
                              </View>
                            )}
                            {(data?.tax ?? 0) > 0 && (
                              <View className="flex-row items-center justify-between gap-2">
                                <BaseText type="body3" color="secondary">
                                  {t('tax')} :
                                </BaseText>
                                <BaseText type="body3" color="base">
                                  {formatNumber(Tax)} ﷼
                                </BaseText>
                              </View>
                            )}
                            <View className="flex-row items-center justify-between gap-2 mt6">
                              <BaseText type="body3" color="secondary">
                                {t('Total Price')} :
                              </BaseText>
                              <BaseText type="body3" color="secondaryPurple">
                                {formatNumber(Total + Tax)} ﷼
                              </BaseText>
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                    {!route.params.readonly && (
                      <BaseButton
                        color="Black"
                        type="Fill"
                        text={t('addToCart')}
                        rounded
                        size="Large"
                      />
                    )}
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
