import React from 'react';
import {View} from 'react-native';
import MyServise from '../home/components/MyServise';
import {RouteProp, useRoute} from '@react-navigation/native';
import {SaleItemStackParamList} from '../../utils/types/NavigationTypes';

type SaleItemRouteProp = RouteProp<SaleItemStackParamList, 'saleItem'>;

const SaleItemScreen: React.FC = () => {
  const route = useRoute<SaleItemRouteProp>();
  const fromReservations = route.params?.fromReservations || false;

  return (
    <View style={{flex: 1}} className="Container">
      <MyServise inMoreScreen={true} isReserved={fromReservations} />
    </View>
  );
};

export default SaleItemScreen;
