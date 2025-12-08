import React, {useState, useRef} from 'react';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  Linking,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {BannerContent} from '../services/models/response/AdsResService';
import {useBase64ImageFromMedia} from '../utils/hooks/useBase64Image';

const ASPECT_RATIO = 13 / 5;

interface BannerSliderProps {
  data: BannerContent[];
}

const BannerImage: React.FC<{
  name?: string;
  imageUrl?: string;
  itemWidth: number;
}> = ({name, imageUrl, itemWidth}) => {
  const {data: base64Image, isLoading} = useBase64ImageFromMedia(
    imageUrl ? undefined : name,
    'Media',
  );

  // اگر imageUrl مستقیم وجود داشت (مثل placeholder)، از آن استفاده کن
  const finalImageUri = imageUrl || base64Image;
  const itemHeight = itemWidth / ASPECT_RATIO;

  if (!finalImageUri && isLoading) {
    return (
      <View
        style={{height: itemHeight}}
        className="w-full bg-black/20 dark:bg-white/20 animate-pulse"
      />
    );
  }

  return (
    <View
      style={{height: itemHeight}}
      className="w-full bg-white/10 dark:bg-neutral-dark-300">
      {finalImageUri && (
        <Image
          source={{uri: finalImageUri}}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const BannerSlider: React.FC<BannerSliderProps> = ({data}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Padding مثل Container (px-5 = 20px)
  const PADDING_HORIZONTAL = 20;
  // محاسبه عرض هر آیتم: عرض کل Container منهای padding
  const itemWidth =
    containerWidth > 0 ? containerWidth - PADDING_HORIZONTAL * 2 : 0;

  const handlePress = React.useCallback((link: string) => {
    if (link?.startsWith('http')) {
      Linking.openURL(link).catch(err => {
        console.warn('Could not open URL:', err);
      });
    }
  }, []);

  // استفاده از useCallback برای renderItem تا وابستگی‌ها درست باشند
  const renderItem = React.useCallback(
    ({item}: {item: BannerContent}) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress(item.link)}
        style={{width: itemWidth || containerWidth || '100%'}}>
        <BannerImage
          name={item.profile?.name}
          imageUrl={item.profile?.dataUrl || undefined}
          itemWidth={itemWidth || 1}
        />
      </TouchableOpacity>
    ),
    [containerWidth, itemWidth, handlePress],
  );

  // محاسبه ایندکس بر اساس scroll position
  const handleMomentumScrollEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (itemWidth === 0) return;
      const offsetX = event.nativeEvent.contentOffset.x;
      // با pagingEnabled، هر صفحه دقیقاً برابر itemWidth است
      const index = Math.round(offsetX / itemWidth);
      const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
      setCurrentIndex(clampedIndex);
    },
    [itemWidth, data.length],
  );

  // برای smooth update حین اسکرول - استفاده از Math.round برای دقت
  const handleScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (itemWidth === 0) return;
      const offsetX = event.nativeEvent.contentOffset.x;
      // محاسبه ایندکس بر اساس موقعیت اسکرول
      const index = Math.round(offsetX / itemWidth);
      const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

      // فقط اگر ایندکس واقعاً تغییر کرده باشد
      if (clampedIndex !== currentIndex) {
        setCurrentIndex(clampedIndex);
      }
    },
    [itemWidth, data.length, currentIndex],
  );

  // تعریف getItemLayout برای بهبود performance و accuracy
  const getItemLayout = React.useCallback(
    (_: any, index: number) => ({
      length: itemWidth,
      offset: itemWidth * index,
      index,
    }),
    [itemWidth],
  );

  if (!data || data.length === 0) {
    return null;
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width} = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  return (
    <View
      onLayout={handleLayout}
      className="w-full Container mx-auto   overflow-hidden">
      {containerWidth > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={data}
            horizontal
            pagingEnabled
            snapToInterval={itemWidth}
            snapToAlignment="start"
            decelerationRate="fast"
            className="!rounded-2xl"
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `banner-${index}`}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            scrollEventThrottle={16}
            extraData={`${itemWidth}-${currentIndex}`}
          />
          {/* Indicator Dots */}
          {data.length > 1 && (
            <View className="flex-row items-center justify-center gap-2 mt-4">
              {data.map((_, index) => (
                <View
                  key={`dot-${index}`}
                  className={`rounded-full h-2 ${
                    index === currentIndex
                      ? 'w-8 bg-[#1B1D21] dark:bg-neutral-dark-900'
                      : 'w-2 bg-[#6E7787] data:bg-neutral-dark-400'
                  }`}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View
          className="w-full rounded-2xl bg-black/20 dark:bg-white/20 animate-pulse"
          style={{height: 33}}
        />
      )}
    </View>
  );
};

export default BannerSlider;
