import React from 'react';
import {FlatList, View} from 'react-native';
import WalletBalance from './components/WalletBalance';
import MainShop from './myServices/shop/MainShop';
import {useGetAds} from '../../utils/hooks/Ads/useGetAds';
import BannerSlider from '../../components/AdsSlider';
import {useGetUnansweredSurvey} from '../../utils/hooks/Survey/useGetUnansweredSurvey';

const HomeScreen: React.FC = () => {
  const {data: Ads, isLoading} = useGetAds({limit: 100, sortField: 'priority'});
  const {data: UnansweredSurvey, isLoading: isUnansweredSurveyLoading} =
    useGetUnansweredSurvey();
  console.log(UnansweredSurvey);
  const renderHeader = () => (
    <>
      <View className="Container py-5 web:pt-[85px] gap-5">
        <WalletBalance />
        {isLoading ? (
          <View className="w-full h-[160px] rounded-[16px]  dark:bg-white/20 bg-black/20 animate-pulse" />
        ) : (
          Ads && Ads?.content && <BannerSlider data={Ads?.content} />
        )}
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
