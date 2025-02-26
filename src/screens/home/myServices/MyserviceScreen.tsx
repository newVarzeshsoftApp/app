import React from 'react';
import {FlatList, View} from 'react-native';
import InfoCards from '../../../components/cards/infoCards/InfoCards';
import WalletBalance from '../components/WalletBalance';
import MyServise from '../components/MyServise';

const MyserviceScreen: React.FC = () => {
  const renderHeader = () => (
    <>
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

export default MyserviceScreen;
