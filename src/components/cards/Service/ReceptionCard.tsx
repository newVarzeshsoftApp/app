import React from 'react';
import {Text, View} from 'react-native';
import SaleItemPersonLabel, {SaleItemCardProps} from './SaleItemPersonLabel';

function ReceptionCard({data, viewerId}: SaleItemCardProps) {
  return (
    <View className="BaseServiceCard">
      <Text>ServiceCard</Text>
      <SaleItemPersonLabel
        role="owner"
        person={data.user}
        viewerId={viewerId}
      />
    </View>
  );
}

export default ReceptionCard;
