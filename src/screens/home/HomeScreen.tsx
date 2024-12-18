import React from 'react';
import {FlatList, View, StyleSheet} from 'react-native';
import WalletBalance from './components/WalletBalance';
import MyServise from './components/MyServise';
import InfoCards from '../../components/cards/infoCards/InfoCards';

const HomeScreen: React.FC = () => {
  const renderHeader = () => (
    <View className="Container py-5 web:pt-[85px] gap-5">
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
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      nestedScrollEnabled
      keyExtractor={(item, index) => index.toString()}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={
        <View className="flex-1   Container ios:pb-[125px] android:pb-[125px]  web:pb-[200px]">
          <MyServise />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;
