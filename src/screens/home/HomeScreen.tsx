import React from 'react';
import {FlatList, View} from 'react-native';
import WalletBalance from './components/WalletBalance';
import BaseText from '../../components/BaseText';
import MainShop from './myServices/shop/MainShop';

const HomeScreen: React.FC = () => {
  const renderHeader = () => (
    <>
      <View className="Container py-5 web:pt-[85px] gap-5">
        <WalletBalance />
      </View>
    </>
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      nestedScrollEnabled
      keyExtractor={(item, index) => `key` + index}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={
        <View className="flex-1 Container pb-[125px]">
          <MainShop />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;
