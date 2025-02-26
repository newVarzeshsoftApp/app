import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import {DrawerStackParamList} from '../../../../utils/types/NavigationTypes';
import {limit, ProductType} from '../../../../constants/options';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {UseGetProduct} from '../../../../utils/hooks/Product/UseGetProduct';
import BaseText from '../../../../components/BaseText';
import {AppRoutes} from '../../../../navigation/routes';

// Import correct card components
import ShopCreditService from '../../../../components/cards/shopCard/ShopCreditService';
import ShopPackageService from '../../../../components/cards/shopCard/ShopPackageService';
import ShopServiceCard from '../../../../components/cards/shopCard/ShopServiceCard';
import {ArrowUp, Box, Calendar1, Card} from 'iconsax-react-native';

type NavigationProp = NativeStackNavigationProp<
  DrawerStackParamList,
  'HomeNavigator'
>;

const cardComponentMapping: Record<number, React.FC<{data: any}>> = {
  [ProductType.Service]: ShopServiceCard,
  [ProductType.Credit]: ShopCreditService,
  [ProductType.Package]: ShopPackageService,
};

function MainShop({inMoreScreen = false}: {inMoreScreen?: boolean}) {
  const {t} = useTranslation('translation', {keyPrefix: 'Drawer'});
  const navigation = useNavigation<NavigationProp>();
  const [offset, setOffset] = useState(0);

  // Fetch product data for each category
  const fetchProductData = (type: ProductType) =>
    UseGetProduct({
      type: {equals: type},
      limit: limit,
      offset,
      category: {equals: ''},
    });

  // Define product sections with proper links
  const productSections = [
    {
      title: t('Service'),
      linkProduct: AppRoutes.SERVICE(),
      linkDetail: (id: number, title: string) =>
        AppRoutes.SERVICE_DETAIL(id, title),
      type: ProductType.Service,
      icon: <Calendar1 size="28" color="#FFFFFF" variant="Bold" />,
      data: fetchProductData(ProductType.Service),
    },
    {
      title: t('creditService'),
      linkProduct: AppRoutes.CREDIT_SERVICE(),
      linkDetail: (id: number, title: string) =>
        AppRoutes.CREDIT_DETAIL(id, title),
      type: ProductType.Credit,
      icon: <Card size="28" color="#fed376" variant="Bold" />,
      data: fetchProductData(ProductType.Credit),
    },
    {
      title: t('package'),
      linkProduct: AppRoutes.PACKAGE_SERVICE(),
      linkDetail: (id: number, title: string) =>
        AppRoutes.PACKAGE_DETAIL(id, title),
      type: ProductType.Package,
      icon: <Box size="28" color="#5bc8ff" variant="Bold" />,
      data: fetchProductData(ProductType.Package),
    },
  ];

  // Render each service item inside its respective section
  const renderItem = useCallback(
    ({item, sectionType}: {item: any; sectionType: ProductType}) => {
      const CardComponent = cardComponentMapping[sectionType];
      return CardComponent ? (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            const detailLink = productSections.find(
              section => section.type === sectionType,
            )?.linkDetail;
            if (detailLink) {
              navigation.navigate(
                //@ts-ignore
                'ShopNavigator',
                detailLink(item.id, item.title),
              );
            }
          }}>
          <CardComponent data={item} />
        </TouchableOpacity>
      ) : (
        <Text>Unknown type: {sectionType}</Text>
      );
    },
    [cardComponentMapping, productSections],
  );

  return (
    <>
      {productSections.some(({data}) => data?.isLoading) ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : (
        <FlatList
          data={productSections.filter(
            ({data}) => (data?.data?.content?.length ?? 0) > 0,
          )}
          keyExtractor={item => `section-${item.type}`}
          renderItem={({item}) => {
            const {title, type, data, linkProduct, icon} = item;
            const {data: items, isLoading} = data;

            return (
              <View key={type} className="mb-6">
                {/* Section Header */}
                <View className="flex-row justify-between items-center px-4 mb-4">
                  <View className="flex-row items-center gap-1">
                    {icon}
                    <BaseText type="body2" color="secondary">
                      {title}
                    </BaseText>
                  </View>
                  {/* Button to navigate to the full category page */}
                  <TouchableOpacity
                    className="flex-row gap-1 items-center"
                    onPress={() => {
                      //@ts-ignore
                      navigation.navigate('ShopNavigator', linkProduct);
                    }}>
                    <BaseText type="body2" color="secondary">
                      {t('all')}
                    </BaseText>
                    <View className="-rotate-45">
                      <ArrowUp size="24" color="#55575c" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Section Content */}
                <FlatList
                  data={items?.content || []}
                  horizontal
                  renderItem={({item}) => renderItem({item, sectionType: type})}
                  keyExtractor={(item, index) => `key-${type}-${index}`}
                  ItemSeparatorComponent={() => <View style={{height: 16}} />}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{gap: 16}}
                  ListFooterComponent={
                    isLoading ? (
                      <View style={{marginTop: 16, alignItems: 'center'}}>
                        <ActivityIndicator size="large" color="#bcdd64" />
                      </View>
                    ) : null
                  }
                />
              </View>
            );
          }}
          contentContainerStyle={{
            paddingBottom: Platform.OS === 'web' ? 100 : 20,
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-10">
              <BaseText type="subtitle1" color="secondary">
                {t('noServicesFound')}
              </BaseText>
            </View>
          }
        />
      )}
    </>
  );
}

export default MainShop;
