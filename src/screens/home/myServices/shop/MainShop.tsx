import React, {useCallback, useMemo, useState} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {UseGetProduct} from '../../../../utils/hooks/Product/UseGetProduct';
import BaseText from '../../../../components/BaseText';
import {ProductType, limit} from '../../../../constants/options';
import {ArrowUp, Box, Calendar1, Card} from 'iconsax-react-native';
import {navigate} from '../../../../navigation/navigationRef';

// Import correct card components
import ShopCreditService from '../../../../components/cards/shopCard/ShopCreditService';
import ShopPackageService from '../../../../components/cards/shopCard/ShopPackageService';
import ShopServiceCard from '../../../../components/cards/shopCard/ShopServiceCard';
import {useTheme} from '../../../../utils/ThemeContext';

const cardComponentMapping: Record<number, React.FC<{data: any}>> = {
  [ProductType.Service]: ShopServiceCard,
  [ProductType.Credit]: ShopCreditService,
  [ProductType.Package]: ShopPackageService,
};

type ProductSection = {
  title: string;
  navigateToCategory: () => void;
  navigateToDetail: (id: number, title: string) => void;
  type: ProductType;
  icon: React.ReactNode;
  data: ReturnType<typeof UseGetProduct>;
};

type ListItem = {kind: 'section'; section: ProductSection};

function MainShop() {
  const {t} = useTranslation('translation', {keyPrefix: 'Drawer'});
  const [offset, setOffset] = useState(0);
  const {theme} = useTheme();

  // Fetch product data for each category
  const fetchProductData = (type: ProductType) =>
    UseGetProduct({
      type: {equals: type},
      limit: limit,
      offset,
      category: {equals: ''},
    });

  // Define product sections with navigation
  const productSections: ProductSection[] = [
    {
      title: t('Service'),
      navigateToCategory: () =>
        navigate('Root', {
          screen: 'ShopNavigator',
          params: {screen: 'service'},
        }),
      navigateToDetail: (id: number, title: string) =>
        navigate('Root', {
          screen: 'ShopNavigator',
          params: {screen: 'serviceDetail', params: {id, title}},
        }),
      type: ProductType.Service,
      icon: (
        <Calendar1
          size="28"
          color={theme === 'dark' ? '#FFFFFF' : '#7f8185'}
          variant="Bold"
        />
      ),
      data: fetchProductData(ProductType.Service),
    },
    {
      title: t('creditService'),
      navigateToCategory: () =>
        navigate('Root', {
          screen: 'ShopNavigator',
          params: {screen: 'creditService'},
        }),
      navigateToDetail: (id: number, title: string) =>
        navigate('Root', {
          screen: 'ShopNavigator',
          params: {screen: 'creditDetail', params: {id, title}},
        }),
      type: ProductType.Credit,
      icon: <Card size="28" color="#fed376" variant="Bold" />,
      data: fetchProductData(ProductType.Credit),
    },
    {
      title: t('package'),
      navigateToCategory: () =>
        navigate('Root', {
          screen: 'ShopNavigator',
          params: {screen: 'packageService'},
        }),
      navigateToDetail: (id: number, title: string) =>
        navigate('Root', {
          screen: 'ShopNavigator',
          params: {screen: 'packageDetail', params: {id, title}},
        }),
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
            const section = productSections.find(
              sec => sec.type === sectionType,
            );
            if (section) {
              section.navigateToDetail(item.id, item.title);
            }
          }}>
          <CardComponent data={item} />
        </TouchableOpacity>
      ) : (
        <Text>Unknown type: {sectionType}</Text>
      );
    },
    [productSections],
  );

  const filteredSections = productSections.filter(
    ({data}) => (data?.data?.content?.length ?? 0) > 0,
  );

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // Add product sections
    filteredSections.forEach(section => {
      items.push({
        kind: 'section',
        section,
      });
    });

    return items;
  }, [filteredSections]);

  return (
    <>
      {productSections.some(({data}) => data?.isLoading) ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => {
            return `section-${item.section.type}`;
          }}
          renderItem={({item}) => {
            // Render product section
            const {title, type, data, navigateToCategory, icon} = item.section;
            const {data: items, isLoading} = data;

            return (
              <View key={type} className="mb-6">
                {/* Section Header */}
                <View className="flex-row justify-between items-center px-5 Container mb-4">
                  <View className="flex-row items-center gap-1">
                    {icon}
                    <BaseText type="body2" color="secondary">
                      {title}
                    </BaseText>
                  </View>
                  {/* Button to navigate to the full category page */}
                  <TouchableOpacity
                    className="flex-row gap-1 items-center"
                    onPress={navigateToCategory}>
                    <BaseText type="body2" color="secondary">
                      {t('all')}
                    </BaseText>
                    <View className="-rotate-45">
                      <ArrowUp size="16" color="#55575c" />
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
                  contentContainerStyle={{gap: 16, paddingHorizontal: 16}}
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
