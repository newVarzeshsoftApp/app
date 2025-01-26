import React from 'react';
import {FlatList, View} from 'react-native';
import WalletBalance from './components/WalletBalance';
import MyServise from './components/MyServise';
import InfoCards from '../../components/cards/infoCards/InfoCards';
import BaseText from '../../components/BaseText';

const HomeScreen: React.FC = () => {
  const renderHeader = () => (
    <>
      <View className="Container py-5 web:pt-[85px] gap-5">
        <View className="w-full h-[180px] rounded-2xl bg-neutral-200 dark:bg-neutral-900 justify-center items-center">
          <BaseText color="muted" type="caption">
            محل بنر
          </BaseText>
        </View>
        <WalletBalance />
        <View className="flex-row items-center justify-center gap-4">
          <View className="gap-4 flex-1">
            <InfoCards type="MembershipInfo" />
            <InfoCards type="ClosetInfo" />
          </View>
          <View className="gap-4 flex-1">
            <InfoCards type="InsuranceInfo" />
            <InfoCards type="BMIInfo" />
          </View>
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
          <MyServise />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;
