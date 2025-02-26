import React from 'react';
import {FlatList, View} from 'react-native';
import WalletBalance from './components/WalletBalance';
import BaseText from '../../components/BaseText';
import MainShop from './myServices/shop/MainShop';

const HomeScreen: React.FC = () => {
  const renderHeader = () => (
    <>
      <View className="Container py-5 web:pt-[85px] gap-5">
        <WalletBalance inWallet />
        <View className="w-full h-[180px] rounded-2xl bg-neutral-200 dark:bg-neutral-900 justify-center items-center">
          <BaseText color="muted" type="caption">
            محل بنر
          </BaseText>
        </View>
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
