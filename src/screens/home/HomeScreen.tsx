import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import WalletBalance from './components/WalletBalance';
import MainShop from './myServices/shop/MainShop';
import {useGetAds} from '../../utils/hooks/Ads/useGetAds';
import BannerSlider from '../../components/AdsSlider';
import {useGetUnansweredSurvey} from '../../utils/hooks/Survey/useGetUnansweredSurvey';
import {Survey} from '../../services/models/response/SurveyResService';

const HomeScreen: React.FC = () => {
  const {data: Ads, isLoading} = useGetAds({limit: 100, sortField: 'priority'});
  const {data: UnansweredSurvey, isLoading: isUnansweredSurveyLoading} =
    useGetUnansweredSurvey();
  const surveys = useMemo<Survey[]>(() => {
    if (Array.isArray(UnansweredSurvey)) {
      return UnansweredSurvey;
    }
    // Support legacy response shapes
    if (UnansweredSurvey && 'surveys' in (UnansweredSurvey as any)) {
      return (UnansweredSurvey as any).surveys || [];
    }
    return [];
  }, [UnansweredSurvey]);

  const hasSurvey = !isUnansweredSurveyLoading && surveys.length > 0;
  const previewSurvey = hasSurvey ? surveys[0] : undefined;
  const isSingleSurvey = hasSurvey && surveys.length === 1;

  const renderHeader = () => (
    <>
      <View className="Container pt-5 web:pt-[100px] gap-5">
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
          <MainShop
            survey={hasSurvey ? previewSurvey : undefined}
            isSingleSurvey={isSingleSurvey}
          />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;
