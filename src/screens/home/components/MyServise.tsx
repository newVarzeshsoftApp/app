import React, {useCallback, useMemo} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import type {SaleItemCardProps} from '../../../components/cards/Service/SaleItemPersonLabel';
import {useAuth} from '../../../utils/hooks/useAuth';
import BaseText from '../../../components/BaseText';
import {useTranslation} from 'react-i18next';
import {ArrowUp} from 'iconsax-react-native';
import {Content} from '../../../services/models/response/UseResrService';
import ProductCard from '../../../components/cards/Service/ProductCard';
import ServiceCard from '../../../components/cards/Service/ServiceCard';
import CreditCard from '../../../components/cards/Service/CreditCard';
import ReceptionCard from '../../../components/cards/Service/ReceptionCard';
import PackageCard from '../../../components/cards/Service/PackageCard';
import ShopReservationCard from '../../../components/cards/shopCard/ShopReservationCard';
import {useGetUserSaleItemPages} from '../../../utils/hooks/User/useGetUserSaleItem';
import {limit} from '../../../constants/options';
import {navigate} from '../../../navigation/navigationRef';

const cardComponentMapping: Record<number, React.FC<SaleItemCardProps>> = {
  0: ProductCard,
  1: ServiceCard,
  2: CreditCard,
  3: ReceptionCard,
  4: PackageCard,
};

function MyServise({
  inMoreScreen = false,
  isReserved = false,
}: {
  inMoreScreen?: boolean;
  isReserved?: boolean;
}) {
  const {profile} = useAuth();
  const viewerId = profile?.id;
  const {t} = useTranslation('translation', {keyPrefix: 'Home'});
  const {
    data: pages,
    isLoading,
    isError,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useGetUserSaleItemPages({isReserved, status: 0}, limit);
  const firstPage = pages?.pages[0];
  const data = useMemo(
    () =>
      inMoreScreen
        ? pages?.pages.flatMap(page => page.content) ?? []
        : firstPage?.content ?? [],
    [firstPage, inMoreScreen, pages],
  );
  const loadMore = () => {
    if (inMoreScreen && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const renderItem = useCallback(
    ({item}: {item: Content}) => {
      // If isReserved is true, use ShopReservationCard
      if (isReserved) {
        return (
          <TouchableOpacity
            key={item?.id}
            onPress={() => {
              navigate('Root', {
                screen: 'SaleItemNavigator',
                params: {
                  screen: 'saleItemDetail',
                  params: {
                    id: item?.id,
                    title: item?.title || 'undefined',
                    fromReservation: true,
                  },
                },
              });
            }}>
            <ShopReservationCard viewerId={viewerId} data={item} />
          </TouchableOpacity>
        );
      }

      // Otherwise, use regular cards
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
            <CardComponent viewerId={viewerId} data={item} />
          </TouchableOpacity>
        );
      }
      return <Text>Unknown type: {item?.type}</Text>;
    },
    [isReserved, viewerId],
  );

  return (
    <View className="flex-1 gap-4">
      {!inMoreScreen && (
        <View className="w-full items-center flex-row justify-between Container">
          <BaseText type="title3" color="secondary">
            {t('myService')}
          </BaseText>
          {(firstPage?.total ?? 1) > 4 && (
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
      <View className="Container flex-1">
        <FlatList
          data={data}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{height: 16}} />}
          onEndReached={loadMore}
          // onEndReachedThreshold={0.2}
          keyExtractor={item => String(item.id)}
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
    </View>
  );
}

export default MyServise;
