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
import {DrawerStackParamList} from '../../../utils/types/NavigationTypes';
import {limit} from '../../../constants/options';
import {navigate} from '../../../navigation/navigationRef';
type NavigationProp = NativeStackNavigationProp<
  DrawerStackParamList,
  'HomeNavigator'
>;
function MyServise({inMoreScreen = false}: {inMoreScreen?: boolean}) {
  const cardComponentMapping: Record<number, React.FC<{data: Content}>> = {
    0: ProductCard,
    1: ServiceCard,
    2: CreditCard,
    3: ReceptionCard,
    4: PackageCard,
  };

  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  // const navigation = useNavigation<NavigationProp>();
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<Content[]>([]);
  const {
    data: fetchedData,
    isLoading,
    isError,
    isFetching,
  } = useGetUserSaleItem({
    limit: limit,
    isReserved: false,
    offset,
    status: 0,
  });

  useEffect(() => {
    if (fetchedData?.content) {
      setData(prevItems => [...prevItems, ...fetchedData?.content]);
    }
  }, [fetchedData]);
  const loadMore = () => {
    if (
      !isError &&
      !isFetching &&
      data.length < (fetchedData?.total ?? 5) &&
      inMoreScreen
    ) {
      setOffset(prevOffset => prevOffset + limit);
    }
  };

  const renderItem = useCallback(
    ({item}: {item: Content}) => {
      const CardComponent = cardComponentMapping[item?.type!];
      if (CardComponent) {
        return (
          <TouchableOpacity
            key={item?.product?.id}
            onPress={() => {
              navigate('Root', {
                screen: 'SaleItemNavigator',
                params: {
                  screen: 'saleItemDetail',
                  params: {id: item?.id, title: item?.title || 'undefined'},
                },
              });
            }}>
            <CardComponent data={item} />
          </TouchableOpacity>
        );
      }
      return <Text>Unknown type: {item?.type}</Text>;
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
              onPress={() => {
                navigate('Root', {
                  screen: 'SaleItemNavigator',
                  params: {screen: 'saleItem'},
                });
              }}
              className="flex-row gap-1 items-center ">
              <BaseText type="title3" color="secondary">
                {t('all')}
              </BaseText>
              <View className="-rotate-45">
                <ArrowUp size="16" color="#55575c" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      <FlatList
        data={data}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: 16}} />}
        onEndReached={loadMore}
        // onEndReachedThreshold={0.2}
        keyExtractor={(item, index) => `key` + index}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        ListFooterComponent={
          isLoading ? (
            <View style={{marginTop: 16, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#bcdd64" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View className="flex-1 items-center justify-center flex-row py-10">
              <BaseText type="subtitle1" color="secondary">
                {t('noServicesFound')}
              </BaseText>
            </View>
          ) : null
        }
        ListFooterComponentStyle={{
          paddingBottom: Platform.OS === 'web' ? 60 : 20,
        }}
        contentContainerStyle={{
          paddingBottom: isLoading ? 40 : Platform.OS === 'web' ? 100 : 20,
        }}
      />
    </View>
  );
}

export default MyServise;
