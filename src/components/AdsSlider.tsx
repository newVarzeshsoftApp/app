import React, {useRef, useEffect} from 'react';
import {
  FlatList,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {BannerContent} from '../services/models/response/AdsResService';
import {useBase64ImageFromMedia} from '../utils/hooks/useBase64Image';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = 320;
const ITEM_SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING * 2;
const AUTO_SCROLL_INTERVAL = 5000;

interface BannerSliderProps {
  data: BannerContent[];
}

const BannerImage: React.FC<{item: BannerContent}> = ({item}) => {
  const {data: base64Image} = useBase64ImageFromMedia(
    item.profile?.name,
    'Media',
  );

  const handlePress = () => {
    if (item.linkAction === 0 && item.link) {
      Linking.openURL(item.link).catch(err =>
        console.warn('Failed to open link:', err),
      );
    }
  };

  const content = base64Image ? (
    <Image
      source={{uri: base64Image}}
      style={{width: 340, height: 200}}
      resizeMode="cover"
    />
  ) : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={item.linkAction !== 0}
      className="w-[320px] h-[160px] rounded-2xl overflow-hidden bg-white/10 dark:bg-neutral-dark-300">
      {content || (
        <View className="w-full h-full bg-white/10 dark:bg-neutral-dark-300" />
      )}
    </TouchableOpacity>
  );
};

const BannerSlider: React.FC<BannerSliderProps> = ({data}) => {
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!data || data.length === 0) return;
      const nextIndex = (currentIndexRef.current + 1) % data.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      currentIndexRef.current = nextIndex;
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [data]);

  const renderItem = ({item}: {item: BannerContent}) => (
    <View className="px-4">
      <BannerImage item={item} />
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      horizontal
      pagingEnabled
      decelerationRate="fast"
      snapToInterval={SNAP_INTERVAL}
      snapToAlignment="center"
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => `banner-${index}`}
      renderItem={renderItem}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingHorizontal: (width - ITEM_WIDTH) / 2,
      }}
      onScrollToIndexFailed={() => {}}
    />
  );
};

export default BannerSlider;
