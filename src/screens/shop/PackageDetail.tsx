import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ShopStackParamList} from '../../utils/types/NavigationTypes';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import NavigationHeader from '../../components/header/NavigationHeader';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Box1, CloseCircle} from 'iconsax-react-native';
import BaseText from '../../components/BaseText';
import {
  ConvertDuration,
  formatNumber,
  getPackageDiscountAmount,
  getPackageFinalPrice,
} from '../../utils/helpers/helpers';
import {UseGetProductByID} from '../../utils/hooks/Product/UseGetProductByID';
import {TruncatedText} from '../../components/TruncatedText';
import {FlatList} from 'react-native-gesture-handler';
import Badge from '../../components/Badge/Badge';
import ShopCreditService from '../../components/cards/shopCard/ShopCreditService';
import ShopServiceCard from '../../components/cards/shopCard/ShopServiceCard';
import PackageDetailServiceCard from '../../components/cards/shopCard/PackageItems/PackageDetailServiceCard';
import PackageDetailCreditCard from '../../components/cards/shopCard/PackageItems/PackageDetailCreditCard';
import {subProducts} from '../../services/models/response/UseResrService';
import {
  Contractors,
  Product,
} from '../../services/models/response/ProductResService';
import BaseButton from '../../components/Button/BaseButton';
import {useCartContext} from '../../utils/CartContext';
import {navigate} from '../../navigation/navigationRef';
import {useTheme} from '../../utils/ThemeContext';
import BottomSheet, {
  BottomSheetMethods,
} from '../../components/BottomSheet/BottomSheet';
import UserRadioButton from '../../components/Button/RadioButton/UserRadioButton';
import {useAuth} from '../../utils/hooks/useAuth';
import {handleMutationError} from '../../utils/helpers/errorHandler';
import {useFocusEffect} from '@react-navigation/native';
import {
  applyPackageContractorsToProduct,
  areRequiredPackageContractorsSelected,
  collectPackageContractorsForCart,
  getPackageContractorSelection,
  resolveContractorForPackageItem,
  resolvePackageCartContractor,
  setPackageContractorSelection,
  setPackageItemContractorSelection,
} from '../../utils/helpers/packageContractorStore';

type ServiceScreenProp = NativeStackScreenProps<
  ShopStackParamList,
  'packageDetail'
>;

const PackageDetail: React.FC<ServiceScreenProp> = ({navigation, route}) => {
  const scrollY = useSharedValue(0);
  const {t} = useTranslation('translation', {keyPrefix: 'Shop.Package'});
  const {t: tService} = useTranslation('translation', {keyPrefix: 'Shop.Service'});
  const {profile: profileData} = useAuth();
  const {data, isLoading} = UseGetProductByID(route.params.id);
  const {addToCart} = useCartContext();
  const {theme} = useTheme();
  const bottomSheetContractorRef = useRef<BottomSheetMethods>(null);
  const [contractorSheetProductId, setContractorSheetProductId] = useState<
    number | null
  >(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [selectedContractor, setSelectedContractor] =
    useState<Contractors | null>(null);
  const {data: contractorSheetProduct} = UseGetProductByID(
    contractorSheetProductId ?? 0,
    {enabled: !!contractorSheetProductId},
  );

  const packageDiscount = getPackageDiscountAmount(data);
  const finalPrice = getPackageFinalPrice(data);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event?.contentOffset?.y;
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerShown: true,
      header: () => (
        <NavigationHeader
          scrollY={scrollY}
          range={[0, 50]}
          navigation={navigation}
          title={route.params?.title}
        />
      ),
    });
  }, [navigation, scrollY, route.params?.title]);

  useEffect(() => {
    if (!data?.hasContractor || !data.contractors?.length) return;

    const storedContractorId = getPackageContractorSelection(route.params.id);
    const storedContractor = storedContractorId
      ? data.contractors.find(
          item =>
            item.contractorId === storedContractorId ||
            item.contractor?.id === storedContractorId,
        )
      : undefined;

    if (route.params.contractorId) {
      const routeContractor = data.contractors.find(
        item => item.contractor?.id === route.params.contractorId,
      );
      if (routeContractor) {
        setSelectedContractor(routeContractor);
        return;
      }
    }

    if (storedContractor) {
      setSelectedContractor(storedContractor);
      return;
    }

    if (data.requiredContractor) {
      setSelectedContractor(data.contractors[0]);
    }
  }, [
    data?.contractors,
    data?.hasContractor,
    data?.requiredContractor,
    route.params.contractorId,
    route.params.id,
  ]);

  useFocusEffect(
    useCallback(() => {
      setListRefreshKey(prev => prev + 1);

      if (!data?.hasContractor || !data.contractors?.length) return;

      const storedContractorId = getPackageContractorSelection(route.params.id);
      if (!storedContractorId) return;

      const storedContractor = data.contractors.find(
        item =>
          item.contractorId === storedContractorId ||
          item.contractor?.id === storedContractorId,
      );

      if (storedContractor) {
        setSelectedContractor(storedContractor);
      }
    }, [data?.contractors, data?.hasContractor, route.params.id]),
  );

  const contractorSheetOptions = useMemo(() => {
    if (contractorSheetProductId && contractorSheetProduct?.contractors?.length) {
      return contractorSheetProduct.contractors;
    }

    return data?.contractors ?? [];
  }, [contractorSheetProduct?.contractors, contractorSheetProductId, data?.contractors]);

  const getContractorSheetSelection = useCallback(() => {
    if (contractorSheetProductId) {
      if (!contractorSheetProduct) {
        return null;
      }

      return resolveContractorForPackageItem(
        contractorSheetProduct,
        data?.contractors ?? [],
        route.params.id,
      );
    }

    return selectedContractor;
  }, [
    contractorSheetProduct,
    contractorSheetProductId,
    data?.contractors,
    route.params.id,
    selectedContractor,
  ]);

  const handleContractorSelect = useCallback(
    (contractor: Contractors) => {
      if (contractorSheetProductId) {
        setPackageItemContractorSelection(
          route.params.id,
          contractorSheetProductId,
          contractor,
        );
        setContractorSheetProductId(null);
      } else {
        setSelectedContractor(contractor);

        const contractorId =
          contractor.contractorId ?? contractor.contractor?.id;
        if (contractorId) {
          setPackageContractorSelection(route.params.id, contractorId);
        }
      }

      setListRefreshKey(prev => prev + 1);
      bottomSheetContractorRef.current?.close();
    },
    [contractorSheetProductId, route.params.id],
  );

  const handleClearContractor = useCallback(() => {
    setSelectedContractor(null);
  }, []);

  const cardComponentMapping: Record<number, React.FC<{data: Product}>> = {
    1: ShopServiceCard,
    2: ShopCreditService,
  };

  const navigationMapping: Record<number, string> = {
    1: 'serviceDetail',
    2: 'creditDetail',
  };

  const getActiveContractorId = useCallback(() => {
    return (
      getPackageContractorSelection(route.params.id) ??
      selectedContractor?.contractorId ??
      selectedContractor?.contractor?.id
    );
  }, [route.params.id, selectedContractor]);

  const openContractorSheet = useCallback((productId?: number) => {
    setContractorSheetProductId(productId ?? null);
    bottomSheetContractorRef.current?.expand();
  }, []);

  const navigateToPackageItem = useCallback(
    (product: Product) => {
      const routeName = navigationMapping[product.type];
      if (!routeName) return;

      const activeContractorId = getActiveContractorId();

      navigate('Root', {
        screen: 'ShopNavigator',
        params: {
          screen: routeName as keyof ShopStackParamList,
          params: {
            id: product.id,
            title: product.title,
            readonly: true,
            fromPackageId: route.params.id,
            ...(activeContractorId ? {contractorId: activeContractorId} : {}),
          },
        },
      });
    },
    [getActiveContractorId, navigationMapping, route.params.id],
  );

  const handleItemContractorSelect = useCallback(
    (product: Product) => {
      if (product.hasContractor) {
        openContractorSheet(product.id);
        return;
      }

      navigateToPackageItem(product);
    },
    [navigateToPackageItem, openContractorSheet],
  );

  const renderItem = useCallback(
    ({item}: {item: subProducts}) => {
      const product = item?.product;
      if (!product) {
        return null;
      }

      const activeContractorId = getActiveContractorId();
      const itemContractor = resolveContractorForPackageItem(
        product,
        data?.contractors ?? [],
        route.params.id,
        activeContractorId,
      );

      if (product.type === 1 && product.hasContractor) {
        return (
          <PackageDetailServiceCard
            key={item.id}
            data={product}
            selectedContractor={itemContractor}
            isContractorRequired={product.requiredContractor}
            onPressCard={() => navigateToPackageItem(product)}
            onSelectContractor={() => handleItemContractorSelect(product)}
          />
        );
      }

      if (product.type === 2 && product.hasContractor) {
        return (
          <PackageDetailCreditCard
            key={item.id}
            data={product}
            selectedContractor={itemContractor}
            isContractorRequired={product.requiredContractor}
            onPressCard={() => navigateToPackageItem(product)}
            onSelectContractor={() => handleItemContractorSelect(product)}
          />
        );
      }

      const CardComponent = cardComponentMapping[product.type];
      if (!CardComponent) {
        return <Text>Unknown type: {product.type}</Text>;
      }

      return (
        <TouchableOpacity
          key={item.id}
          onPress={() => navigateToPackageItem(product)}>
          <CardComponent data={product} />
        </TouchableOpacity>
      );
    },
    [
      cardComponentMapping,
      data?.contractors,
      getActiveContractorId,
      handleItemContractorSelect,
      listRefreshKey,
      navigateToPackageItem,
      route.params.id,
    ],
  );

  const canSubmit = useMemo(() => {
    if (!data) return false;

    return areRequiredPackageContractorsSelected(
      data,
      route.params.id,
      selectedContractor,
    );
  }, [data, route.params.id, selectedContractor, listRefreshKey]);

  const handleAddToCart = useCallback(async () => {
    if (!data || !canSubmit) return;

    const itemContractors = collectPackageContractorsForCart(
      route.params.id,
      data,
    );
    const resolvedContractor = resolvePackageCartContractor(
      data,
      route.params.id,
      selectedContractor,
    );
    const productWithContractors = applyPackageContractorsToProduct(
      data,
      itemContractors,
    );

    try {
      await addToCart({
        product: productWithContractors,
        SelectedContractor: resolvedContractor,
        packageContractorData: {itemContractors},
      });
      if (resolvedContractor) {
        const contractorId =
          resolvedContractor.contractorId ??
          resolvedContractor.contractor?.id;
        if (contractorId) {
          setPackageContractorSelection(route.params.id, contractorId);
        }
      }
      navigate('Root', {screen: 'HomeNavigator', params: {screen: 'cart'}});
    } catch (error) {
      handleMutationError(error);
      console.error('Failed to add package to cart:', error);
    }
  }, [addToCart, canSubmit, data, route.params.id, selectedContractor]);

  return (
    <>
      <BottomSheet
        ref={bottomSheetContractorRef}
        scrollView
        disablePan
        snapPoints={[70]}
        Title={tService('Contractor List')}>
        <View className="gap-3">
          {contractorSheetOptions.map((item, index) => {
            const sheetSelection = getContractorSheetSelection();

            return (
              <UserRadioButton
                key={index}
                genders={item?.contractor?.gender ?? 0}
                checked={sheetSelection === item}
                onCheckedChange={() => handleContractorSelect(item)}
                Name={`${item?.contractor?.firstName ?? ''} ${
                  item?.contractor?.lastName ?? ''
                }`.trim()}
                ImageUrl={item?.contractor?.profile?.name}
              />
            );
          })}
        </View>
      </BottomSheet>

      <View className="flex-1">
        <View className="absolute -top-[25%] web:rotate-[10deg]  web:-left-[30%]  android:-right-[80%] ios:-right-[80%]  opacity-45 w-[600px] h-[600px]">
          <Image
            source={require('../../assets/images/shade/shape/ShadeBlue.png')}
            style={{width: '100%', height: '100%'}}
            resizeMode="contain"
          />
        </View>
        <View className="absolute -top-[20%]  web:-rotate-[25deg] web:-left-[38%] w-[400px] h-[400px] opacity-90">
          <Image
            source={require('../../assets/images/shade/shape/ShadeBlue.png')}
            style={{width: '100%', height: '100%'}}
          />
        </View>
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
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            contentContainerStyle={{flexGrow: 1, paddingBottom: 120}}>
            <SafeAreaView className="flex-1">
              <View className="gap-5 pt-20 pb-6 flex-1 justify-between Container">
                <View className="gap-5">
                  <LinearGradient
                    colors={
                      theme === 'light'
                        ? ['rgba(91, 200, 255, 0.5)', '#f0f9ff']
                        : [
                            'rgba(91, 200, 255, 1)',
                            'rgba(91, 200, 255, 0.5)',
                            '#2a2d33',
                          ]
                    }
                    locations={[0, 0, 1]}
                    start={{x: 1, y: 0}}
                    style={{
                      width: '100%',
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <View className="flex-1 p-[1px] w-full relative z-10 overflow-hidden">
                      <View className="flex-1 Container py-4 px-5 dark:bg-neutral-dark-300 bg-neutral-0/20 rounded-3xl gap-3">
                        <View className="flex-row items-center gap-2">
                          <Box1 size="24" color="#5bc8ff" variant="Bold" />
                          <BaseText type="title3" color="supportive5">
                            {route.params.title}
                          </BaseText>
                        </View>
                        <View className="flex-row items-center justify-between gap-4">
                          <View className="gap-1">
                            {packageDiscount > 0 ? (
                              <BaseText type="body3" color="muted" className="line-through">
                                {formatNumber(data?.price ?? 0)} ﷼
                              </BaseText>
                            ) : null}
                            <BaseText type="title4" color="secondaryPurple">
                              {formatNumber(finalPrice)} ﷼
                            </BaseText>
                          </View>
                          <View>
                            <BaseText type="subtitle3" color="secondary">
                              {t('Duration')} : {''}
                              {ConvertDuration(data?.duration ?? 0)}
                            </BaseText>
                          </View>
                        </View>
                        {packageDiscount > 0 ? (
                          <View className="flex-row items-center justify-between gap-2">
                            <BaseText type="body3" color="secondary">
                              {tService('Discount')} :
                            </BaseText>
                            <BaseText type="body3" color="success">
                              {formatNumber(packageDiscount)}- ﷼
                            </BaseText>
                          </View>
                        ) : null}
                        {data?.description ? (
                          <View className="gap-2">
                            <TruncatedText length={90} text={data.description} />
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </LinearGradient>

                  {data?.hasContractor && !route.params.readonly ? (
                    <View className="gap-2">
                      <BaseText color="base" type="title4">
                        {tService('Contractor selection')}
                      </BaseText>
                      <View className="gap-3 flex-row items-center flex-1">
                        <UserRadioButton
                          checked={!!selectedContractor}
                          asButton
                          genders={
                            selectedContractor?.contractor?.gender ??
                            profileData?.gender ??
                            0
                          }
                          placeHolder={tService('Choose Contractor')}
                          Name={
                            selectedContractor
                              ? `${selectedContractor.contractor?.firstName ?? ''} ${
                                  selectedContractor.contractor?.lastName ?? ''
                                }`.trim()
                              : null
                          }
                          onCheckedChange={() => openContractorSheet()}
                          ImageUrl={selectedContractor?.contractor?.profile?.name}
                        />
                        {!data?.requiredContractor && selectedContractor ? (
                          <BaseButton
                            noText
                            LeftIcon={CloseCircle}
                            LeftIconVariant="Bold"
                            onPress={handleClearContractor}
                            type="TextButton"
                            size="Large"
                            rounded
                            color="Black"
                          />
                        ) : null}
                      </View>
                    </View>
                  ) : null}

                  <View className="gap-4">
                    <BaseText type="body3" color="secondary">
                      {t('ItemsOfPackage')}
                    </BaseText>
                    <View className="flex flex-row flex-wrap gap-1">
                      {data?.hasSubProduct ? (
                        <FlatList
                          data={data?.subProducts ?? []}
                          extraData={listRefreshKey}
                          keyExtractor={(item, index) => `key-${index}`}
                          renderItem={renderItem}
                          showsVerticalScrollIndicator={false}
                          showsHorizontalScrollIndicator={false}
                          ItemSeparatorComponent={() => (
                            <View style={{height: 16}} />
                          )}
                          scrollEventThrottle={16}
                          style={{flex: 1}}
                        />
                      ) : (
                        <Badge
                          color="secondary"
                          value={'بدون ساب پروداکت'}
                          className="w-fit"
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </SafeAreaView>
          </Animated.ScrollView>
        )}
        {!route.params.readonly && (
          <View className="px-4 py-4 absolute bottom-0 w-full z-10">
            <BaseButton
              onPress={handleAddToCart}
              color="Black"
              type="Fill"
              text={t('addToCart')}
              rounded
              size="Large"
              disabled={!canSubmit}
            />
          </View>
        )}
      </View>
    </>
  );
};

export default PackageDetail;
