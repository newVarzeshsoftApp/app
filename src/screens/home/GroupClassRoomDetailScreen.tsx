import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CloseCircle} from 'iconsax-react-native';
import {useTranslation} from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import NavigationHeader from '../../components/header/NavigationHeader';
import BaseText from '../../components/BaseText';
import BaseButton from '../../components/Button/BaseButton';
import RadioButton from '../../components/Button/RadioButton/RadioButton';
import UserRadioButton from '../../components/Button/RadioButton/UserRadioButton';
import BottomSheet, {
  BottomSheetMethods,
} from '../../components/BottomSheet/BottomSheet';
import {TruncatedText} from '../../components/TruncatedText';
import CustomCollapsible from '../../components/CustomCollapsible';
import {GroupClassRoomStackParamList} from '../../utils/types/NavigationTypes';
import {ReservationStatus} from '../../models/enums';
import {useTheme} from '../../utils/ThemeContext';
import {useAuth} from '../../utils/hooks/useAuth';
import {useCartContext} from '../../utils/CartContext';
import {UseGetProductByID} from '../../utils/hooks/Product/UseGetProductByID';
import {useBase64ImageFromMedia} from '../../utils/hooks/useBase64Image';
import usePriceCalculations from '../../utils/hooks/usePriceCalculations';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {formatNumber} from '../../utils/helpers/helpers';
import {navigate} from '../../navigation/navigationRef';
import {
  buildGroupClassRoomPreReservePayload,
  getGroupClassRoomContractorProfile,
  getGroupClassRoomDayOptions,
  resolveGroupClassRoomProductContractor,
} from '../../utils/helpers/groupClassRoomHelpers';
import {
  useGroupClassRoomDetail,
  useGroupClassRoomEvents,
  usePreReserveGroupClassRoom,
} from '../../utils/hooks/GroupClassRoom';
import {
  Contractors,
  PriceList,
} from '../../services/models/response/ProductResService';
import PriceListDetail from '../shop/components/PriceListDetail';
import GroupClassRoomDaySelector from './components/GroupClassRoomDaySelector';

type GroupClassRoomDetailProps = NativeStackScreenProps<
  GroupClassRoomStackParamList,
  'groupClassRoomDetail'
>;

const IMAGE_HEIGHT = 285;

const GroupClassRoomDetailScreen: React.FC<GroupClassRoomDetailProps> = ({
  navigation,
  route,
}) => {
  const scrollY = useSharedValue(0);
  const {profile: profileData, SKU: organization} = useAuth();
  const {addToCart} = useCartContext();
  const {theme} = useTheme();
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Service'});

  const {
    groupClassRoomId,
    contractorId,
    waitingList = false,
    title: routeTitle,
  } = route.params;

  const {
    classRoom,
    isLoading: isClassRoomLoading,
    isError,
    refetch,
  } = useGroupClassRoomDetail(route.params);

  useGroupClassRoomEvents({
    enabled: !isError,
    groupClassRoomId,
    onUpdate: refetch,
  });

  const serviceId = classRoom?.service?.id;
  const {data: productData, isLoading: isProductLoading} = UseGetProductByID(
    serviceId ?? 0,
    {enabled: !!serviceId},
  );

  const {mutateAsync: preReserve, isPending: isPreReserveLoading} =
    usePreReserveGroupClassRoom();

  const bottomSheetDescriptionRef = useRef<BottomSheetMethods>(null);
  const bottomSheetPriceListRef = useRef<BottomSheetMethods>(null);
  const bottomSheetContractorRef = useRef<BottomSheetMethods>(null);
  const hasInitializedContractor = useRef(false);

  const [sortedPriceList, setSortedPriceList] = useState<PriceList[]>([]);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(
    null,
  );
  const [selectedContractor, setSelectedContractor] =
    useState<Contractors | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const dayOptions = useMemo(
    () => (classRoom ? getGroupClassRoomDayOptions(classRoom) : []),
    [classRoom],
  );

  const contractorProfile = useMemo(
    () =>
      classRoom
        ? getGroupClassRoomContractorProfile(classRoom, undefined)
        : undefined,
    [classRoom],
  );

  const contractorOptions = useMemo(() => {
    if (!classRoom || !productData?.contractors?.length) return [];

    return productData.contractors.map(entry => {
      const matchedUser = classRoom.contractors?.find(
        contractor => contractor.id === entry.contractorId,
      );

      return {
        ...entry,
        contractor: matchedUser ?? entry.contractor,
      };
    });
  }, [classRoom, productData?.contractors]);

  const displayedContractor = useMemo(() => {
    if (selectedContractor?.contractor) {
      const {firstName, lastName, profile, gender} = selectedContractor.contractor;

      return {
        name: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
        imageName: profile?.name,
        gender: gender ?? profileData?.gender ?? 0,
      };
    }

    if (contractorProfile) {
      return {
        name: contractorProfile.fullName,
        imageName: contractorProfile.imageName,
        gender: contractorProfile.gender ?? profileData?.gender ?? 0,
      };
    }

    return null;
  }, [contractorProfile, profileData?.gender, selectedContractor]);

  const imageName = productData?.image?.name ?? classRoom?.service?.image?.name;
  const {data: base64Image} = useBase64ImageFromMedia(imageName, 'Media');

  const baseColor = theme === 'dark' ? '#232529' : 'rgba(244,244,245,0.3)';
  const baseHighlight =
    theme === 'dark' ? 'rgba(42, 45, 51, 1)' : 'rgba(255,255,255,1)';

  const screenTitle = routeTitle ?? classRoom?.title ?? 'کلاس گروهی';
  const isFlexible = classRoom?.isFlexible ?? false;
  const isResultsLoading = isClassRoomLoading || isProductLoading;

  useEffect(() => {
    if (!productData?.priceList?.length) {
      setSortedPriceList([]);
      setSelectedPriceList(null);
      return;
    }

    const sortedList = [...productData.priceList].sort((a, b) => {
      const priorityA = a.metadata?.priority ?? Infinity;
      const priorityB = b.metadata?.priority ?? Infinity;
      return priorityA - priorityB;
    });

    setSortedPriceList(sortedList);
    setSelectedPriceList(sortedList[0] ?? null);
  }, [productData?.priceList]);

  useEffect(() => {
    hasInitializedContractor.current = false;
  }, [groupClassRoomId, contractorId]);

  useEffect(() => {
    if (!classRoom || hasInitializedContractor.current) return;

    const resolvedContractor = resolveGroupClassRoomProductContractor(
      classRoom,
      contractorId,
    );

    if (resolvedContractor) {
      setSelectedContractor(resolvedContractor);
      hasInitializedContractor.current = true;
    }
  }, [classRoom, contractorId]);

  useEffect(() => {
    if (!isFlexible || dayOptions.length === 0) {
      setSelectedDays([]);
      return;
    }

    setSelectedDays(dayOptions.map(option => option.day));
  }, [dayOptions, isFlexible]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          scrollY={scrollY}
          range={[0, IMAGE_HEIGHT / 1.5]}
          navigation={navigation}
          title={screenTitle}
        />
      ),
    });
  }, [navigation, scrollY, screenTitle]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [-IMAGE_HEIGHT / 2, 0, IMAGE_HEIGHT * 0.75],
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-IMAGE_HEIGHT, 0, IMAGE_HEIGHT],
          [2, 1, 1],
        ),
      },
    ],
  }));

  const {Discount, PricePreSession, Tax, Total, purchaseProfit} =
    usePriceCalculations({
      data: productData,
      SelectedPriceList: selectedPriceList,
    });

  const canSubmit =
    !!productData &&
    !!selectedPriceList &&
    !!profileData?.id &&
    !!classRoom &&
    (!isFlexible || selectedDays.length > 0) &&
    (!productData.hasContractor || !!selectedContractor);

  const handleAddToCart = useCallback(async () => {
    if (!canSubmit || !productData || !selectedPriceList || !classRoom) return;

    const activeContractorId =
      selectedContractor?.contractorId ?? contractorId;

    try {
      const payload = buildGroupClassRoomPreReservePayload({
        userId: profileData!.id!,
        groupClassRoomId: classRoom.id,
        contractorId: activeContractorId,
        organization,
        status: ReservationStatus.Reserved,
      });

      await preReserve(payload);

      await addToCart({
        product: productData,
        SelectedPriceList: selectedPriceList,
        SelectedContractor: selectedContractor,
        isGroupClassRoom: true,
        groupClassRoomData: {
          groupClassRoomId: classRoom.id,
          contractorId: activeContractorId,
          waitingForGroupClass: waitingList,
          selectedDays: isFlexible ? selectedDays : undefined,
        },
      });

      navigate('Root', {screen: 'HomeNavigator', params: {screen: 'cart'}});
    } catch (error) {
      handleMutationError(error);
      console.error('Failed to add group class room to cart:', error);
    }
  }, [
    addToCart,
    canSubmit,
    classRoom,
    contractorId,
    isFlexible,
    organization,
    preReserve,
    productData,
    profileData,
    selectedContractor,
    selectedDays,
    selectedPriceList,
    waitingList,
  ]);

  if (isError) {
    return (
      <View className="flex-1 bg-neutral-100 dark:bg-neutral-dark-100 items-center justify-center gap-3 px-6">
        <BaseText type="body2" color="muted">
          خطا در دریافت اطلاعات کلاس
        </BaseText>
        <BaseButton
          text="تلاش مجدد"
          type="Outline"
          color="Black"
          size="Medium"
          rounded
          onPress={() => refetch()}
        />
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        ref={bottomSheetDescriptionRef}
        scrollView
        snapPoints={[60]}
        Title={t('description')}>
        <BaseText type="body2">
          {productData?.description
            ? productData.description
            : t('No description')}
        </BaseText>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetPriceListRef}
        scrollView
        disablePan
        snapPoints={[90]}
        Title={t('select sessions')}>
        <View className="gap-3">
          {sortedPriceList.map(item => (
            <React.Fragment key={item.id}>
              <RadioButton
                checked={selectedPriceList?.id === item.id}
                asButton
                haveArrow
                onCheckedChange={() => setSelectedPriceList(item)}
                label={
                  productData?.unlimited
                    ? `${t('unlimited')} ${formatNumber(item.price ?? 0)} ﷼ `
                    : `${item.min ?? 0} ${t('session')} ${formatNumber(
                        item.price ?? 0,
                      )} ﷼ `
                }
              />
              <CustomCollapsible isOpened={selectedPriceList?.id === item.id}>
                <PriceListDetail
                  ServiceData={productData}
                  SelectedPriceList={selectedPriceList}
                />
              </CustomCollapsible>
            </React.Fragment>
          ))}
          <View className="pt-4 pb-2 fixed bottom-0 left-0 right-0 ">
            <BaseButton
              text={t('Confirm')}
              onPress={() => bottomSheetPriceListRef.current?.close()}
              type="Fill"
              color="Black"
              size="Large"
              rounded
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        ref={bottomSheetContractorRef}
        scrollView
        disablePan
        snapPoints={[70]}
        Title={t('Contractor List')}>
        <View className="gap-3">
          {contractorOptions.map(item => (
            <UserRadioButton
              key={item.id ?? item.contractorId}
              genders={item.contractor?.gender ?? 0}
              checked={selectedContractor?.contractorId === item.contractorId}
              onCheckedChange={() => {
                setSelectedContractor(item);
                bottomSheetContractorRef.current?.close();
              }}
              Name={`${item.contractor?.firstName ?? ''} ${
                item.contractor?.lastName ?? ''
              }`.trim()}
              ImageUrl={item.contractor?.profile?.name}
            />
          ))}
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
            {base64Image ? (
              <Animated.Image
                style={[
                  {width: '100%', height: IMAGE_HEIGHT},
                  imageAnimatedStyle,
                ]}
                source={{uri: base64Image}}
              />
            ) : (
              <View
                style={{width: '100%', height: IMAGE_HEIGHT}}
                className="bg-neutral-200 dark:bg-neutral-dark-300"
              />
            )}

            <View className="flex-1">
              <LinearGradient
                colors={[baseHighlight, baseHighlight, baseColor]}
                locations={[0, 0, 0.3, 0.5]}
                style={{
                  flex: 1,
                  borderTopEndRadius: 24,
                  borderTopStartRadius: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View className="flex-1 p-[2px] w-full relative z-10 overflow-hidden">
                  <View className="flex-1 w-full Container py-4 justify-between dark:bg-neutral-dark-200 bg-neutral-0/20 rounded-t-3xl gap-4">
                    <View className="gap-4">
                      <BaseText color="base" type="title3">
                        {screenTitle}
                      </BaseText>

                      {isResultsLoading ? (
                        <View className="py-10 items-center">
                          <ActivityIndicator size="large" color="#bcdd64" />
                        </View>
                      ) : (
                        <>
                          {productData?.description ? (
                            <TruncatedText
                              text={productData.description}
                              length={100}
                              onPressMore={() =>
                                bottomSheetDescriptionRef.current?.expand()
                              }
                            />
                          ) : null}

                          <View className="gap-2">
                            <BaseText color="base" type="title4">
                              {t('Number of sessions')}
                            </BaseText>
                            <View className="gap-3">
                              <RadioButton
                                checked
                                asButton
                                haveArrow
                                onCheckedChange={() =>
                                  bottomSheetPriceListRef.current?.expand()
                                }
                                label={`${
                                  productData?.unlimited
                                    ? t('unlimited')
                                    : `${selectedPriceList?.min ?? 0} ${t(
                                        'session',
                                      )}`
                                } ${formatNumber(
                                  selectedPriceList?.price ?? 0,
                                )} ﷼`}
                              />
                              <PriceListDetail
                                SelectedPriceList={selectedPriceList}
                                ServiceData={productData}
                              />
                            </View>
                          </View>

                          {isFlexible ? (
                            <View className="gap-2">
                              <BaseText color="base" type="title4">
                                انتخاب روزها
                              </BaseText>
                              <GroupClassRoomDaySelector
                                options={dayOptions}
                                selectedDays={selectedDays}
                                onChange={setSelectedDays}
                              />
                            </View>
                          ) : null}

                          {productData?.hasContractor ? (
                            <View className="gap-2">
                              <BaseText color="base" type="title4">
                                {t('Contractor selection')}
                              </BaseText>
                              <View className="gap-3 flex-row items-center flex-1">
                                <UserRadioButton
                                  checked={!!selectedContractor}
                                  asButton
                                  genders={displayedContractor?.gender ?? 0}
                                  placeHolder={t('Choose Contractor')}
                                  Name={displayedContractor?.name ?? null}
                                  onCheckedChange={() =>
                                    bottomSheetContractorRef.current?.expand()
                                  }
                                  ImageUrl={displayedContractor?.imageName}
                                />
                                {!productData.requiredContractor &&
                                  selectedContractor && (
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
                          ) : null}

                          <View className="CardBase">
                            {(selectedPriceList?.min ?? 1) > 1 && (
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
                                {t('Price')}{' '}
                                {productData?.unlimited
                                  ? ''
                                  : `${selectedPriceList?.min} جلسه`}{' '}
                                :
                              </BaseText>
                              <BaseText type="body3" color="base">
                                {formatNumber(selectedPriceList?.price ?? 0)} ﷼
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
                            {(productData?.tax ?? 0) > 0 && (
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

                    {!isResultsLoading ? (
                      <BaseButton
                        color={waitingList ? 'Supportive5-Blue' : 'Black'}
                        onPress={handleAddToCart}
                        type="Fill"
                        text={waitingList ? 'رزرو لیست انتظار' : t('addToCart')}
                        rounded
                        size="Large"
                        disabled={!canSubmit}
                        isLoading={isPreReserveLoading}
                      />
                    ) : null}
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

export default GroupClassRoomDetailScreen;
