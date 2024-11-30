import React, {useCallback, useState, useEffect} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {ArrowUp} from 'iconsax-react-native';
import {Content} from '../../../services/models/response/UseResrService';
import ProductCard from '../../../components/cards/Service/ProductCard';
import ServiceCard from '../../../components/cards/Service/ServiceCard';
import CreditCard from '../../../components/cards/Service/CreditCard';
import ReceptionCard from '../../../components/cards/Service/ReceptionCard';
import PackageCard from '../../../components/cards/Service/PackageCard';
import {useGetUserSaleItem} from '../../../utils/hooks/User/useGetUserSaleItem';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../../utils/types/NavigationTypes';
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
function MyServise({inMoreScreen = false}: {inMoreScreen?: boolean}) {
  const cardComponentMapping: Record<number, React.FC<{data: Content}>> = {
    0: ProductCard,
    1: ServiceCard,
    2: CreditCard,
    3: ReceptionCard,
    4: PackageCard,
  };

  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const navigation = useNavigation<NavigationProp>();
  // Infinite scroll states
  const [limit] = useState(4);
  const [offset, setOffset] = useState(1);
  const [data, setData] = useState<Content[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const {
    data: fetchedData,
    isLoading,
    isError,
  } = useGetUserSaleItem({
    limit,
    offset,
  });

  // Update product list and handle infinite scroll
  useEffect(() => {
    if (fetchedData) {
      // Update total items
      if (fetchedData.total) {
        setTotalItems(fetchedData.total);
      }

      // Merge and deduplicate products
      setData(prevProducts => {
        const updatedProducts = fetchedData.content.filter(newItem => {
          const existingItem = prevProducts.find(
            item => item.id === newItem.id,
          );
          return (
            !existingItem ||
            JSON.stringify(existingItem) !== JSON.stringify(newItem)
          );
        });

        if (updatedProducts.length === 0) return prevProducts;

        const mergedProducts = prevProducts.map(prevItem => {
          const updatedItem = fetchedData.content.find(
            newItem => newItem.id === prevItem.id,
          );
          return updatedItem ? updatedItem : prevItem;
        });

        const newProducts = updatedProducts.filter(
          newItem => !prevProducts.some(prevItem => prevItem.id === newItem.id),
        );

        return [...mergedProducts, ...newProducts];
      });

      // Update `hasMore` based on total items
      if (fetchedData.content.length + offset >= fetchedData.total) {
        setHasMore(false);
      }

      setIsFetchingMore(false);
    }
  }, [fetchedData, offset]);

  const loadMore = useCallback(() => {
    if (!isFetchingMore && hasMore && inMoreScreen) {
      setIsFetchingMore(true);
      setOffset(prev => prev + 1);
    }
  }, [isFetchingMore, hasMore, limit]);

  const renderItem = useCallback(
    ({item}: {item: Content}) => {
      const CardComponent = cardComponentMapping[item.type!];
      if (CardComponent) {
        return (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('SaleItem', {
                screen: 'saleItemDetail',
                params: {id: item.id.toString(), title: item.title},
              })
            }>
            <CardComponent key={item.id} data={item} />
          </TouchableOpacity>
        );
      }
      return <Text>Unknown type: {item.type}</Text>;
    },
    [cardComponentMapping],
  );

  return (
    <View className="flex-1 gap-4">
      {!inMoreScreen && (
        <View className="w-full items-center flex-row justify-between">
          <BaseText type="title3" color="secondary">
            {t('myService')}
          </BaseText>
          {(fetchedData?.total ?? 1) > 4 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('SaleItem')}
              className="flex-row gap-1 items-center ">
              <BaseText type="title3" color="secondary">
                {t('all')}
              </BaseText>
              <View className="-rotate-45">
                <ArrowUp size="24" color="#55575c" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        onEndReached={loadMore}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore || isLoading ? (
            <View style={{marginTop: 16, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#bcdd64" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isError ? <Text>{t('noServicesFound')}</Text> : null
        }
        ListFooterComponentStyle={{
          paddingBottom: Platform.OS === 'web' ? 60 : 20,
        }}
        contentContainerStyle={{
          paddingBottom:
            isFetchingMore || isLoading ? 40 : Platform.OS === 'web' ? 100 : 20,
        }}
      />
    </View>
  );
}

export default MyServise;
