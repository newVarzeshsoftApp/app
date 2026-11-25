import React from 'react';
import {View} from 'react-native';
import SaleItemPersonLabel, {SaleItemCardProps} from './SaleItemPersonLabel';

function ProductCard({data, viewerId}: SaleItemCardProps) {
  return (
    <View className="h-[200px] w-full bg-blue-500">
      <SaleItemPersonLabel
        role="owner"
        person={data.user}
        viewerId={viewerId}
      />
    </View>
  );
}

export default ProductCard;
