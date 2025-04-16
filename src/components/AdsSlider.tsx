import React, {useRef, useEffect} from 'react';
import {FlatList, View, Image, Dimensions} from 'react-native';
import {BannerContent} from '../services/models/response/AdsResService';
import {useBase64ImageFromMedia} from '../utils/hooks/useBase64Image';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = 320;
const ITEM_SPACING = 16;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING * 2;

interface BannerSliderProps {
  data: BannerContent[];
}

const BannerImage: React.FC<{name?: string}> = ({name}) => {
  const {data: base64Image, isLoading} = useBase64ImageFromMedia(name, 'Media');

  if (!base64Image && isLoading) {
    return (
      <View className="w-[320px] h-[160px] rounded-2xl bg-black/20 dark:bg-white/20 animate-pulse" />
    );
  }

  return (
    <View className="w-[320px] h-[160px] rounded-2xl overflow-hidden bg-white/10 dark:bg-neutral-dark-300">
      {base64Image && (
        <Image
          source={{uri: base64Image}}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const BannerSlider: React.FC<BannerSliderProps> = ({data}) => {
  const renderItem = ({item}: {item: BannerContent}) => (
    <View className="px-4">
      <BannerImage name={item.profile?.name} />
    </View>
  );

  return (
    <FlatList
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
