import React from 'react';
import {View} from 'react-native';
import MyServise from '../home/components/MyServise';

const SaleItemScreen: React.FC = () => {
  return (
    <View style={{flex: 1}} className="Container">
      <MyServise inMoreScreen={true} />
    </View>
  );
};

export default SaleItemScreen;
