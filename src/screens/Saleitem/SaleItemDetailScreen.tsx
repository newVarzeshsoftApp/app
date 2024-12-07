import React, {useCallback} from 'react';
import {ActivityIndicator, ScrollView, Text, View} from 'react-native';
import {SaleItemStackParamList} from '../../utils/types/NavigationTypes';
import {useGetUserSaleItemByID} from '../../utils/hooks/User/useGetUserSaleItemByID';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Content} from '../../services/models/response/UseResrService';
import ServiceDetail from './Detail/ServiceDetail';
import CreditDetail from './Detail/CreditDetail';
import PackageDetail from './Detail/PackageDetail';
import NotFound from '../../components/NotFound';

type SaleItemDetailProps = NativeStackScreenProps<
  SaleItemStackParamList,
  'saleItemDetail'
>;

const SaleItemDetailScreen: React.FC<SaleItemDetailProps> = ({
  navigation,
  route,
}) => {
  const {data, isLoading} = useGetUserSaleItemByID(route.params.id);

  const ComponentMapping: Record<
    number,
    React.FC<{
      data: Content;
      navigation: typeof navigation;
      route: typeof route;
    }>
  > = {
    1: ServiceDetail,
    2: CreditDetail,
    4: PackageDetail,
  };

  const renderItem = useCallback(
    ({item}: {item: Content}) => {
      const CardComponent = ComponentMapping[item.type!];
      if (CardComponent) {
        return (
          <CardComponent
            route={route}
            navigation={navigation}
            key={`${item.id}-${item.productId}`}
            data={item}
          />
        );
      }
      return <NotFound />;
    },
    [ComponentMapping],
  );

  return (
    <View style={{flex: 1}}>
      {isLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#bcdd64" />
        </View>
      ) : (
        data && renderItem({item: data})
      )}
    </View>
  );
};

export default SaleItemDetailScreen;
