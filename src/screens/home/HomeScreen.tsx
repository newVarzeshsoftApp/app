import React, {useMemo} from 'react';
import {FlatList, View} from 'react-native';
import WalletBalance from './components/WalletBalance';
import MainShop from './myServices/shop/MainShop';
import {useGetAds} from '../../utils/hooks/Ads/useGetAds';
import BannerSlider from '../../components/AdsSlider';
import {useGetUnansweredSurvey} from '../../utils/hooks/Survey/useGetUnansweredSurvey';
import {Survey} from '../../services/models/response/SurveyResService';
import {BannerContent} from '../../services/models/response/AdsResService';
import MainPageSurveyCard from './components/MainPageSurveyCard';
import moment from 'jalali-moment';

// داده‌های تستی بنر - برای تست و اپدیت استفاده کنید
const TEST_BANNER_DATA: BannerContent[] = [
  {
    id: 1,
    title: 'بنر تستی ۱',
    description: 'توضیحات بنر تستی اول',
    link: 'https://example.com/banner1',
    linkAction: 1,
    priority: 1,
    ratio: '16:9',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    profile: {
      name: 'test-banner-1',
      width: 1200,
      height: 675,
      size: 50000,
      data: {},
      dataUrl: 'https://picsum.photos/1200/675?random=1',
      ratio: 1.777,
    },
  },
  {
    id: 2,
    title: 'بنر تستی ۲',
    description: 'توضیحات بنر تستی دوم',
    link: 'https://example.com/banner2',
    linkAction: 1,
    priority: 2,
    ratio: '16:9',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    profile: {
      name: 'test-banner-2',
      width: 1200,
      height: 675,
      size: 50000,
      data: {},
      dataUrl: 'https://picsum.photos/1200/675?random=2',
      ratio: 1.777,
    },
  },
  {
    id: 3,
    title: 'بنر تستی ۳',
    description: 'توضیحات بنر تستی سوم',
    link: 'https://example.com/banner3',
    linkAction: 0,
    priority: 3,
    ratio: '16:9',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    profile: {
      name: 'test-banner-3',
      width: 1200,
      height: 675,
      size: 50000,
      data: {},
      dataUrl: 'https://picsum.photos/1200/675?random=3',
      ratio: 1.777,
    },
  },
];

// برای استفاده از داده‌های تستی، این متغیر را true کنید
const USE_TEST_DATA = false;

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

  // استفاده از داده‌های تستی در صورت نیاز
  const bannerData = useMemo(() => {
    if (USE_TEST_DATA) {
      return TEST_BANNER_DATA;
    }
    return Ads?.content || [];
  }, [Ads?.content]);

  const renderHeader = () => (
    <View className="gap-5 mb-5 ">
      <View className="Container pt-5 web:pt-[100px]">
        <WalletBalance />
      </View>
      {isLoading && !USE_TEST_DATA ? (
        <View className="Container">
          <View className="w-full aspect-[13/4] rounded-[16px]  dark:bg-white/20 bg-black/20 animate-pulse" />
        </View>
      ) : (
        bannerData.length > 0 && <BannerSlider data={bannerData} />
      )}
      {hasSurvey ? (
        <View className="Container px-4">
          <MainPageSurveyCard
            survey={previewSurvey}
            isSingleSurvey={isSingleSurvey}
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      nestedScrollEnabled
      keyExtractor={(item, index) => 'key' + index}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={
        <View className="flex-1 pb-[125px]">
          <MainShop />
        </View>
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;
